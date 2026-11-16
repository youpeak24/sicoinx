import assert from 'assert';
import { calculateUsdToSi, calculateSiToUsd, isPriceStale } from '@sicoin/shared';
import Decimal from 'decimal.js';
import { prisma } from '../src/lib/prisma';
import { hashPassword, verifyPassword, generateRandomToken } from '../src/lib/security';
import { PricingService } from '../src/lib/pricingService';

async function runTests() {
  console.log('\n--- Running SI Coin Core Backend Tests ---\n');

  // Test 1: Precision Decimal Arithmetic
  console.log('Test 1: Decimal precision arithmetic for USD to SI calculation');
  const usdAmount = '100.00';
  const pricePerSi = '1.250000';
  const result = calculateUsdToSi(usdAmount, pricePerSi, 6);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.outputAmount, '80.000000'); // 100 / 1.25 = 80 exactly
  assert.strictEqual(result.outputUnit, 'SI');

  const siAmount = '80.000000';
  const reverseResult = calculateSiToUsd(siAmount, pricePerSi, 2);
  assert.strictEqual(reverseResult.isValid, true);
  assert.strictEqual(reverseResult.outputAmount, '100.00'); // 80 * 1.25 = 100 exactly
  console.log('✓ Precision calculation passed (100 USD <=> 80 SI at 1.25 rate)');

  // Test 2: Edge Cases & Stale Threshold
  console.log('Test 2: Price calculator edge cases');
  const zeroPriceResult = calculateUsdToSi('50', '0');
  assert.strictEqual(zeroPriceResult.isValid, false);
  assert.strictEqual(zeroPriceResult.errorMessage, 'Invalid or missing reference price');

  const negativeUsd = calculateUsdToSi('-50', '1.25');
  assert.strictEqual(negativeUsd.isValid, false);

  const staleTimestamp = new Date(Date.now() - 120 * 60 * 1000); // 2 hours ago
  assert.strictEqual(isPriceStale(staleTimestamp, 60), true);
  const freshTimestamp = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
  assert.strictEqual(isPriceStale(freshTimestamp, 60), false);
  console.log('✓ Edge cases & stale checks passed');

  // Test 3: Password Hashing & Verification
  console.log('Test 3: Security & password hashing');
  const plain = 'FintechShieldPass2026!';
  const hash = await hashPassword(plain);
  assert.notStrictEqual(hash, plain);
  const isMatch = await verifyPassword(plain, hash);
  assert.strictEqual(isMatch, true);
  const isBadMatch = await verifyPassword('WrongPassword', hash);
  assert.strictEqual(isBadMatch, false);
  console.log('✓ Bcrypt password hashing & comparison passed');

  // Test 4: Pricing Service & Provenance
  console.log('Test 4: Pricing Service summary and source labeling');
  const summary = await PricingService.getCurrentPriceSummary();
  assert.ok(summary.priceUsd);
  assert.ok(summary.sourceLabel);
  assert.ok(summary.effectiveTimestamp);
  assert.strictEqual(typeof summary.isStale, 'boolean');
  console.log(`✓ Active price summary: $${summary.priceUsd} USD [Source: "${summary.sourceLabel}"]`);

  // Test 5: Tokenomics 100% Allocation Reconciliation
  console.log('Test 5: Tokenomics allocations total verification');
  const allocations = await prisma.tokenAllocation.findMany();
  const total = allocations.reduce((sum, a) => sum + a.percentage, 0);
  assert.ok(
    Math.abs(total - 100) < 0.001,
    `Allocations must equal exactly 100%, current sum is ${total}%`
  );
  console.log(`✓ All ${allocations.length} allocations sum to exactly ${total}%`);

  // Test 6: Audit Log Integrity on Price Creation
  console.log('Test 6: Audit trail and immutable observation recording');
  const testObservation = await prisma.priceObservation.create({
    data: {
      priceUsd: '1.265000',
      quoteCurrency: 'USD',
      source: 'MANUAL',
      sourceLabel: 'Administrator-set reference price',
      effectiveTimestamp: new Date(),
      actorEmail: 'admin@sicoin.org',
      changeReason: 'Automated test observation entry',
      isCorrection: false,
    },
  });
  assert.strictEqual(testObservation.priceUsd, '1.265000');
  assert.strictEqual(testObservation.isCorrection, false);

  // Correct record
  const correctedObservation = await prisma.priceObservation.create({
    data: {
      priceUsd: '1.260000',
      quoteCurrency: 'USD',
      source: 'MANUAL',
      sourceLabel: 'Administrator-set reference price (Audited Correction)',
      effectiveTimestamp: testObservation.effectiveTimestamp,
      actorEmail: 'admin@sicoin.org',
      changeReason: 'Audited test correction',
      isCorrection: true,
      supersededRecordId: testObservation.id,
    },
  });
  assert.strictEqual(correctedObservation.supersededRecordId, testObservation.id);
  assert.strictEqual(correctedObservation.isCorrection, true);

  // Clean up test entries
  await prisma.priceObservation.deleteMany({
    where: { id: { in: [testObservation.id, correctedObservation.id] } },
  });
  console.log('✓ Provenance correction and supersededRecord linking verified');

  // Test 7: Wallet Challenge Expiration
  console.log('Test 7: Wallet challenge creation and expiration handling');
  const challengeToken = generateRandomToken(16);
  const expiredTime = new Date(Date.now() - 5000); // 5 seconds ago
  const tokenRecord = await prisma.verificationToken.create({
    data: {
      userId: (await prisma.user.findFirst({ where: { email: 'user@sicoin.org' } }))!.id,
      token: challengeToken,
      type: 'WALLET_CHALLENGE',
      expiresAt: expiredTime,
    },
  });

  const validToken = await prisma.verificationToken.findFirst({
    where: {
      token: challengeToken,
      expiresAt: { gt: new Date() },
    },
  });
  assert.strictEqual(validToken, null, 'Expired challenge token should not be retrieved as valid');

  await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });
  console.log('✓ Expired challenge token correctly rejected');

  console.log('\n=============================================');
  console.log('  ALL CORE BACKEND & CRYPTO TESTS PASSED!    ');
  console.log('=============================================\n');

  await prisma.$disconnect();
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
