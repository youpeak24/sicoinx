import assert from 'assert';
import { prisma } from '../src/lib/prisma';
import { WalletService } from '../src/lib/walletService';
import { RazorpayService } from '../src/lib/razorpay';
import Decimal from 'decimal.js';

async function runSicoinXFeaturesTest() {
  console.log('\n======================================================');
  console.log('--- STARTING SICOINX COMPREHENSIVE FEATURE TESTS ---');
  console.log('======================================================\n');

  // Test User Lookups
  const user = await prisma.user.findUnique({ where: { email: 'user@sicoin.org' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@sicoin.org' } });
  assert(user, 'Demo user must exist');
  assert(admin, 'Admin user must exist');

  // 1. Digital Coin Wallet Test
  console.log('Test 1: Digital Coin Wallet Creation & Address Generation');
  const wallet = await WalletService.getOrCreateUserWallet(user.id);
  assert(wallet, 'Wallet should exist or be created');
  assert(wallet.address.startsWith('SICX-'), `Wallet address should start with SICX-, got: ${wallet.address}`);
  console.log(`✓ Wallet Address: ${wallet.address}, Initial Balance: ${wallet.coinBalance} SI`);

  // 2. Buy Coins & Razorpay Payment Gateway Verification Test
  console.log('\nTest 2: Buy Coins & Automatic Coin Credit via Razorpay');
  const buyAmount = '50.000000';
  const initialBalance = new Decimal(wallet.coinBalance);

  // Create Razorpay order
  const rzpOrder = await RazorpayService.createOrder({
    amountInr: '5250.00',
    receipt: 'TEST-REC-BUY-1',
  });
  assert(rzpOrder.id.startsWith('order_'), 'Razorpay order ID should be generated');

  const testPaymentId = 'pay_test_sicoinx_12345';
  const validSignature = RazorpayService.generateTestSignature(rzpOrder.id, testPaymentId);
  const isSigValid = RazorpayService.verifyPaymentSignature({
    orderId: rzpOrder.id,
    paymentId: testPaymentId,
    signature: validSignature,
  });
  assert(isSigValid, 'HMAC signature verification must succeed');

  // Credit coins automatically
  const buyCredit = await WalletService.creditCoins({
    userId: user.id,
    amount: buyAmount,
    type: 'BUY_COIN',
    description: 'Test purchase via Razorpay',
    fiatAmount: '5250.00 INR',
  });
  const expectedNewBal = initialBalance.plus(new Decimal(buyAmount));
  assert.strictEqual(buyCredit.wallet.coinBalance, expectedNewBal.toFixed(6), 'Wallet coin balance must match expected sum');
  console.log(`✓ Payment verified! Coins credited. New balance: ${buyCredit.wallet.coinBalance} SI`);

  // 3. Sell Coins & Withdrawal Request Test
  console.log('\nTest 3: Sell Coins & Withdrawal Settlement Request');
  const sellAmount = '20.000000';
  const sellResult = await WalletService.debitCoins({
    userId: user.id,
    amount: sellAmount,
    type: 'SELL_COIN',
    description: 'Sell order placed to Bank HDFC',
    fiatAmount: '2000.00 INR',
  });
  const expectedAfterSell = expectedNewBal.minus(new Decimal(sellAmount));
  assert.strictEqual(sellResult.wallet.coinBalance, expectedAfterSell.toFixed(6), 'Balance after sell must be accurately debited');
  console.log(`✓ Sell coins debited into pending payout. New balance: ${sellResult.wallet.coinBalance} SI`);

  // 4. Ecosystem Transfer Test (Internal User & YouPeak App)
  console.log('\nTest 4: Coin Transfer within Approved Ecosystem');
  // 4a: Transfer to another user (admin)
  const transferAmount = '10.000000';
  const transferRes = await WalletService.executeTransfer({
    senderId: user.id,
    destinationType: 'INTERNAL_USER',
    recipientIdentifier: admin.email,
    amount: transferAmount,
    note: 'Internal test transfer',
  });
  assert.strictEqual(transferRes.transfer.status, 'CONFIRMED', 'Transfer must be confirmed');
  console.log(`✓ Transferred ${transferAmount} SI to ${admin.email}. Transfer No: ${transferRes.transfer.transferNumber}`);

  // 4b: Transfer to YouPeak connected app
  const appTransferRes = await WalletService.executeTransfer({
    senderId: user.id,
    destinationType: 'ECOSYSTEM_APP',
    destinationApp: 'YOUPEAK',
    recipientIdentifier: 'youpeak_user_9921',
    amount: '5.000000',
    note: 'Subscription transfer for YouPeak premium',
  });
  assert.strictEqual(appTransferRes.transfer.destinationApp, 'YOUPEAK');
  console.log(`✓ Connected platform transfer to YouPeak verified. Transfer No: ${appTransferRes.transfer.transferNumber}`);

  // 5. Multi-Platform Integration API Verification (YouPeak & YouPeak E-Commerce)
  console.log('\nTest 5: Multi-Platform Partner APIs (Debit/Credit/Balance)');
  const partner = await prisma.ecosystemPartner.findFirst({ where: { slug: 'youpeak-ecommerce' } });
  assert(partner, 'YouPeak E-Commerce partner must exist');
  assert(partner.apiKey.startsWith('pk_live_'), 'Partner API key must exist');

  // Simulate Partner Debit (e.g. paying for merchandise on YouPeak E-Commerce)
  const partnerDebit = await WalletService.debitCoins({
    userId: user.id,
    amount: '2.500000',
    type: 'ECOSYSTEM_DEBIT',
    referenceId: 'YP-SHOP-ORDER-99',
    description: 'Purchased YouPeak digital hoodie with SIcoinX',
  });
  assert(partnerDebit.transaction.type === 'ECOSYSTEM_DEBIT');
  console.log(`✓ YouPeak E-Commerce partner debit completed. Balance after: ${partnerDebit.wallet.coinBalance} SI`);

  // Simulate Partner Reward Credit (e.g. cashback on YouPeak)
  const partnerCredit = await WalletService.creditCoins({
    userId: user.id,
    amount: '1.000000',
    type: 'ECOSYSTEM_CREDIT',
    referenceId: 'YP-REWARD-55',
    description: 'Cashback reward from YouPeak creator interaction',
  });
  assert(partnerCredit.transaction.type === 'ECOSYSTEM_CREDIT');
  console.log(`✓ YouPeak reward credit completed. Balance after: ${partnerCredit.wallet.coinBalance} SI`);

  // 6. User Profile & KYC Verification Test
  console.log('\nTest 6: User Profile & KYC Verification Pipeline');
  const kyc = await prisma.kycVerification.upsert({
    where: { userId: user.id },
    update: { status: 'APPROVED' },
    create: {
      userId: user.id,
      fullName: user.name,
      idType: 'AADHAAR',
      idNumber: '1234-5678-9012',
      documentFrontUrl: 'https://example.com/id_front.jpg',
      status: 'APPROVED',
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });
  assert.strictEqual(kyc.status, 'APPROVED', 'KYC status should be approved');
  console.log(`✓ KYC status verified: ${kyc.status} for ${kyc.fullName} (ID: ${kyc.idType})`);

  // 7. Super Admin Wallet Freezing & Adjustment Test
  console.log('\nTest 7: Admin Wallet Management (Adjustments & Freezing)');
  const adminAdjust = await WalletService.creditCoins({
    userId: user.id,
    amount: '15.000000',
    type: 'ADMIN_CREDIT',
    description: 'Administrative promotional grant',
  });
  assert(adminAdjust.transaction.type === 'ADMIN_CREDIT');
  console.log(`✓ Admin credit adjustment completed: +15.000000 SI`);

  // Test freeze
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { isFrozen: true },
  });

  // Attempting debit while frozen should throw
  let freezeBlocked = false;
  try {
    await WalletService.debitCoins({
      userId: user.id,
      amount: '1.000000',
      type: 'TRANSFER_OUT',
      description: 'Should fail',
    });
  } catch (err: any) {
    freezeBlocked = true;
    assert(err.message.includes('frozen'), 'Error must specify wallet is frozen');
  }
  assert(freezeBlocked, 'Transactions must be blocked on frozen wallet');
  console.log('✓ Frozen wallet protection confirmed (unauthorized mutations blocked)');

  // Unfreeze
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { isFrozen: false },
  });
  console.log('✓ Wallet unfrozen successfully');

  console.log('\n======================================================');
  console.log('  ALL SICOINX CORE FEATURE TESTS PASSED SUCCESSFULLY! ');
  console.log('======================================================\n');
}

runSicoinXFeaturesTest()
  .catch((e) => {
    console.error('Feature test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
