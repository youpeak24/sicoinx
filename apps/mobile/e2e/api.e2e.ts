/**
 * Opt-in integration test: exercises the mobile app's real API layer against a running
 * SI Coin API (apps/api). Not part of `npm test`.
 *
 *   npm run dev -w apps/api            # in the repo root, in another terminal
 *   npm run test:e2e --prefix apps/mobile
 *
 * Set E2E_API_URL to target a different server (default http://localhost:5000).
 * It registers brand-new users on every run and never touches seeded accounts.
 */
import { ApiError, setAuthToken } from '@/api/client';
import * as api from '@/api/services';

jest.setTimeout(30000);

const stamp = Date.now();
const password = 'E2eSecurePass123';
const alice = { name: 'E2E Alice', email: `e2e.alice.${stamp}@example.com`, password };
const bob = { name: 'E2E Bob', email: `e2e.bob.${stamp}@example.com`, password };

async function sessionFor(user: typeof alice) {
  const result = await api.login(user.email, user.password);
  if (result.kind !== 'success') throw new Error('unexpected MFA step');
  setAuthToken(result.token);
  return result;
}

describe('mobile app against the real API', () => {
  let bobWalletAddress = '';

  test('registration requires acceptTerms (sent by the app) and password rules are enforced', async () => {
    await expect(api.register({ ...alice, password: 'alllowercase' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    const created = await api.register(alice);
    expect(created.token).toBeTruthy();
    expect(created.user.email).toBe(alice.email);
    await api.register(bob);
  });

  test('login rejects wrong credentials and accepts correct ones', async () => {
    await expect(api.login(alice.email, 'WrongPass123')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    const result = await sessionFor(bob);
    expect(result.user.email).toBe(bob.email);
    bobWalletAddress = (await api.getWallet()).wallet.address;
    expect(bobWalletAddress).toMatch(/^SICX-/);
  });

  test('session restore works via /auth/me and bad tokens are 401', async () => {
    await sessionFor(alice);
    expect((await api.fetchCurrentUser()).email).toBe(alice.email);
    setAuthToken('not-a-real-token');
    await expect(api.fetchCurrentUser()).rejects.toMatchObject({ status: 401 });
    await sessionFor(alice);
  });

  test('wallet, rates and empty history', async () => {
    const overview = await api.getWallet();
    expect(overview.wallet.coinBalance).toBe('0.000000');
    expect(overview.kycStatus).toBe('NOT_SUBMITTED');
    const rates = await api.getRates();
    expect(rates.buyPriceInr).toBeTruthy();
    const page = await api.getTransactions('ALL', 1, 5);
    expect(page.transactions).toEqual([]);
    expect(page.pagination.page).toBe(1);
  });

  test('buy flow: create order then verify with the sandbox payment id + signature', async () => {
    const order = await api.createBuyOrder('100', 'RAZORPAY_UPI');
    expect(order.testPaymentId).toBeTruthy();
    expect(order.testSignatureHelper).toBeTruthy();

    // A forged signature must be rejected.
    await expect(
      api.verifyPayment({
        buyOrderId: order.buyOrderId,
        razorpayOrderId: order.razorpayOrder.id,
        razorpayPaymentId: 'pay_forged',
        razorpaySignature: 'deadbeef',
      }),
    ).rejects.toBeInstanceOf(ApiError);

    // The pair handed out by the server verifies and credits the coins.
    const verified = await api.verifyPayment({
      buyOrderId: order.buyOrderId,
      razorpayOrderId: order.razorpayOrder.id,
      razorpayPaymentId: order.testPaymentId!,
      razorpaySignature: order.testSignatureHelper!,
    });
    expect(verified.receipt?.status).toBe('COMPLETED');
    expect((await api.getWallet()).wallet.coinBalance).toBe('100.000000');

    const history = await api.getTransactions('BUY_COIN');
    expect(history.transactions[0].coinAmount).toMatch(/^\+100/);
  });

  test('transfer to another user, with server-side balance check', async () => {
    await expect(
      api.executeTransfer({ destinationType: 'INTERNAL_USER', recipientIdentifier: bob.email, coinAmount: '5000' }),
    ).rejects.toBeInstanceOf(ApiError);

    const sent = await api.executeTransfer({
      destinationType: 'INTERNAL_USER',
      recipientIdentifier: bobWalletAddress,
      coinAmount: '10.5',
      note: 'e2e',
    });
    expect(sent.transfer.transferNumber).toMatch(/^TRF-/);
    expect((await api.getWallet()).wallet.coinBalance).toBe('89.500000');
  });

  test('sell request moves coins out of the wallet', async () => {
    const result = await api.submitSellRequest({
      coinAmount: '20',
      bankAccountName: 'E2E Alice',
      bankName: 'HDFC Bank',
      accountNumber: '123456789012',
      ifscCode: 'HDFC0001234',
    });
    expect(result.sellOrder.orderNumber).toBeTruthy();
    expect((await api.getWallet()).wallet.coinBalance).toBe('69.500000');
  });

  test('kyc submit and status', async () => {
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const saved = await api.submitKyc({
      fullName: 'E2E Alice',
      idType: 'PAN',
      idNumber: 'ABCDE1234F',
      documentFrontUrl: png,
    });
    expect(saved.status).toBe('PENDING');
    expect((await api.getKycStatus()).status).toBe('PENDING');
  });

  test('support ticket lifecycle: create, list, read, reply', async () => {
    const ticket = await api.createSupportTicket({
      subject: 'E2E ticket subject',
      category: 'Wallet & Trading',
      message: 'This is an end-to-end test message.',
    });
    expect((await api.getSupportTickets()).some((t) => t.id === ticket.id)).toBe(true);
    const detail = await api.getSupportTicket(ticket.id);
    expect(detail.messages).toHaveLength(1);
    await api.replyToSupportTicket(ticket.id, 'Following up from the app.');
    expect((await api.getSupportTicket(ticket.id)).messages).toHaveLength(2);
  });

  test('logout revokes the session', async () => {
    await api.logout();
    await expect(api.fetchCurrentUser()).rejects.toMatchObject({ status: 401 });
  });
});
