import { ApiError, request, requestEnvelope } from './client';
import type {
  BuyOrderIntent,
  KycRecord,
  KycSubmitInput,
  LoginResult,
  PaymentMethod,
  Rates,
  SellRequestInput,
  SellResult,
  SupportMessage,
  SupportTicket,
  SupportTicketDetail,
  TransactionPage,
  TransferInput,
  TransferResult,
  User,
  VerifiedPayment,
  WalletOverview,
} from './types';

// ─── Authentication ──────────────────────────────────────────────────────────

export async function login(email: string, password: string, mfaCode?: string): Promise<LoginResult> {
  const envelope = await requestEnvelope('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email: email.trim(), password, ...(mfaCode ? { mfaCode } : {}) },
  });

  if (envelope.requireMfa) return { kind: 'mfa' };

  const token = envelope?.data?.token;
  const user = envelope?.data?.user;
  if (typeof token !== 'string' || !user) {
    throw new ApiError('Sign-in succeeded but the server sent no session. Please try again.', 'BAD_RESPONSE');
  }
  return { kind: 'success', token, user };
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const data = await request<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    auth: false,
    body: {
      name: input.name.trim(),
      email: input.email.trim(),
      password: input.password,
      acceptTerms: true,
    },
  });
  if (!data?.token || !data?.user) {
    throw new ApiError('Account created but the server sent no session. Please sign in.', 'BAD_RESPONSE');
  }
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const data = await request<{ user: User }>('/auth/me');
  return data.user;
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
}

// ─── Wallet & pricing ────────────────────────────────────────────────────────

export function getWallet(signal?: AbortSignal): Promise<WalletOverview> {
  return request<WalletOverview>('/wallet', { signal });
}

export function getRates(signal?: AbortSignal): Promise<Rates> {
  return request<Rates>('/trade/rates', { auth: false, signal });
}

export function getTransactions(type = 'ALL', page = 1, limit = 20, signal?: AbortSignal): Promise<TransactionPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type !== 'ALL') params.set('type', type);
  return request<TransactionPage>(`/wallet/transactions?${params.toString()}`, { signal });
}

// ─── Buy (Razorpay) ──────────────────────────────────────────────────────────

export function createBuyOrder(coinAmount: string, paymentMethod: PaymentMethod): Promise<BuyOrderIntent> {
  return request<BuyOrderIntent>('/trade/buy/create-order', {
    method: 'POST',
    body: { coinAmount, paymentMethod },
  });
}

export function verifyPayment(input: {
  buyOrderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<VerifiedPayment> {
  return request<VerifiedPayment>('/trade/buy/verify-payment', { method: 'POST', body: input });
}

// ─── Sell & transfer ─────────────────────────────────────────────────────────

export function submitSellRequest(input: SellRequestInput): Promise<SellResult> {
  return request<SellResult>('/trade/sell/request', { method: 'POST', body: input });
}

export function executeTransfer(input: TransferInput): Promise<TransferResult> {
  const body: TransferInput = {
    destinationType: input.destinationType,
    recipientIdentifier: input.recipientIdentifier,
    coinAmount: input.coinAmount,
  };
  if (input.destinationType === 'ECOSYSTEM_APP' && input.destinationApp) {
    body.destinationApp = input.destinationApp;
  }
  if (input.note && input.note.trim()) body.note = input.note.trim();
  return request<TransferResult>('/wallet/transfer', { method: 'POST', body });
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export function getKycStatus(signal?: AbortSignal): Promise<KycRecord> {
  return request<KycRecord>('/kyc/status', { signal });
}

export function submitKyc(input: KycSubmitInput): Promise<KycRecord> {
  return request<KycRecord>('/kyc/submit', { method: 'POST', body: input });
}

// ─── Support ─────────────────────────────────────────────────────────────────

export function getSupportTickets(signal?: AbortSignal): Promise<SupportTicket[]> {
  return request<SupportTicket[]>('/user/support/tickets', { signal });
}

export function createSupportTicket(input: {
  subject: string;
  category: string;
  message: string;
}): Promise<SupportTicket> {
  return request<SupportTicket>('/user/support/tickets', {
    method: 'POST',
    body: { subject: input.subject.trim(), category: input.category, message: input.message.trim() },
  });
}

export function getSupportTicket(id: string, signal?: AbortSignal): Promise<SupportTicketDetail> {
  return request<SupportTicketDetail>(`/user/support/tickets/${encodeURIComponent(id)}`, { signal });
}

export function replyToSupportTicket(id: string, content: string): Promise<SupportMessage> {
  return request<SupportMessage>(`/user/support/tickets/${encodeURIComponent(id)}/reply`, {
    method: 'POST',
    body: { content: content.trim() },
  });
}
