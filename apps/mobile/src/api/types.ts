export type Role = 'USER' | 'SUPER_ADMIN' | 'FINANCE_MANAGER' | 'CONTENT_EDITOR' | 'SUPPORT_STAFF' | string;

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | string;

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
}

export interface Wallet {
  id: string;
  address: string;
  coinBalance: string;
  inrBalance: string;
  isFrozen: boolean;
}

export interface Rates {
  tokenName: string;
  ticker: string;
  buyPriceInr: string;
  sellPriceInr: string;
  inrPerUsd: string;
  buyPriceUsd: string;
  sellPriceUsd: string;
  enableBuying: boolean;
  enableSelling: boolean;
  minBuyCoins: string;
  maxBuyCoins: string;
  minSellCoins: string;
  maxSellCoins: string;
  circulatingSupply: string;
  totalSupply: string;
  reserveSupply: string;
}

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WalletOverview {
  wallet: Wallet;
  kycStatus: KycStatus;
  rates: { buyPriceInr: string; sellPriceInr: string; inrPerUsd: string };
  valuation: { inr: string; usd: string };
}

export interface Transaction {
  id: string;
  txHash: string;
  type: string;
  /** Signed ledger amount, e.g. "+100.000000" or "-50.000000". */
  coinAmount: string;
  fiatAmount: string | null;
  balanceAfter: string;
  description: string;
  referenceId: string | null;
  status: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface TransactionPage {
  transactions: Transaction[];
  pagination: Pagination;
}

export type PaymentMethod = 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'RAZORPAY_NETBANKING';

export interface BuyOrderIntent {
  buyOrderId: string;
  orderNumber: string;
  coinAmount: string;
  pricePerCoinInr: string;
  totalInr: string;
  receiptNumber: string;
  razorpayOrder: { id: string; amount: number; currency: string; keyId: string };
  /** Only present when the server runs in sandbox mode. */
  testSignatureHelper?: string;
  testPaymentId?: string;
}

export interface PurchaseReceipt {
  receiptNumber: string;
  orderNumber: string;
  date: string;
  coinAmount: string;
  totalInr: string;
  pricePerCoinInr: string;
  gatewayPaymentId: string;
  status: string;
}

export interface VerifiedPayment {
  receipt?: PurchaseReceipt;
  wallet?: Wallet;
}

export interface SellRequestInput {
  coinAmount: string;
  bankAccountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface SellResult {
  sellOrder: { id: string; orderNumber: string; totalInr?: string; coinAmount?: string; status?: string };
  wallet?: Wallet;
}

export type DestinationType = 'INTERNAL_USER' | 'ECOSYSTEM_APP';
export type DestinationApp = 'YOUPEAK' | 'YOUPEAK_ECOMMERCE' | 'OTHER';

export interface TransferInput {
  destinationType: DestinationType;
  destinationApp?: DestinationApp;
  recipientIdentifier: string;
  coinAmount: string;
  note?: string;
}

export interface TransferResult {
  transfer: { id: string; transferNumber: string };
  newBalance?: string;
}

export type IdType = 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE';

export interface KycRecord {
  status: KycStatus;
  message?: string;
  fullName?: string;
  idType?: IdType;
  idNumber?: string;
  rejectionReason?: string | null;
  submittedAt?: string;
  reviewedAt?: string | null;
}

export interface KycSubmitInput {
  fullName: string;
  idType: IdType;
  idNumber: string;
  documentFrontUrl: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: TicketStatus | string;
  messagesCount: number;
  lastReplyAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface SupportTicketDetail extends SupportTicket {
  messages: SupportMessage[];
}

export interface LoginSuccess {
  kind: 'success';
  token: string;
  user: User;
}

export interface LoginNeedsMfa {
  kind: 'mfa';
}

export type LoginResult = LoginSuccess | LoginNeedsMfa;
