export type Role = 'SUPER_ADMIN' | 'FINANCE_MANAGER' | 'CONTENT_EDITOR' | 'SUPPORT_AGENT' | 'READONLY_ANALYST' | 'USER';

export type PriceSourceType = 'MANUAL' | 'EXTERNAL_COINGECKO' | 'EXTERNAL_COINCAP' | 'DEMO';

export type ProjectStatus = 'ACTIVE_DEVELOPMENT' | 'TESTNET' | 'MAINNET_PLANNED' | 'MAINTENANCE';

export type ModuleStatus = 'AVAILABLE' | 'IN_DEVELOPMENT' | 'PLANNED';

export type MilestoneStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ActivityType = 
  | 'ACCOUNT_CREATED'
  | 'EMAIL_VERIFIED'
  | 'WALLET_CONNECTED'
  | 'WALLET_DISCONNECTED'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'PASSWORD_CHANGED'
  | 'SUPPORT_TICKET_SUBMITTED'
  | 'SIMULATED_FAUCET_CLAIM';

export type ActivityStatus = 'SUBMITTED' | 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CoinConfig {
  id: string;
  tokenName: string;
  ticker: string;
  decimals: number;
  blockchainNetwork: string;
  contractAddress?: string | null;
  explorerUrl?: string | null;
  totalSupply: string;
  circulatingSupply: string;
  maxSupply?: string | null;
  whitepaperUrl?: string | null;
  projectStatus: ProjectStatus;
  officialEmail: string;
  updatedAt: string;
}

export interface PriceObservation {
  id: string;
  priceUsd: string;
  quoteCurrency: string;
  source: PriceSourceType;
  sourceLabel: string;
  effectiveTimestamp: string;
  recordedTimestamp: string;
  actorEmail?: string | null;
  changeReason?: string | null;
  isCorrection: boolean;
  supersededRecordId?: string | null;
  isDemoData: boolean;
}

export interface PriceSourceConfig {
  id: string;
  activeSource: PriceSourceType;
  staleThresholdMinutes: number;
  externalProviderApiKey?: string | null;
  pollingIntervalSeconds: number;
  lastSuccessfulPoll?: string | null;
  externalEndpoint?: string | null;
  demoVariancePercent: number;
  updatedAt: string;
}

export interface ScheduledPriceChange {
  id: string;
  scheduledPriceUsd: string;
  scheduledTime: string;
  reason: string;
  createdById: string;
  createdByEmail: string;
  isExecuted: boolean;
  isCancelled: boolean;
  executedAt?: string | null;
  createdAt: string;
}

export interface TokenAllocation {
  id: string;
  category: string;
  percentage: number;
  tokenAmount: string;
  vestingDescription: string;
  unlockSchedule: string;
  colorHex: string;
  displayOrder: number;
}

export interface EcosystemModule {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  status: ModuleStatus;
  badgeText?: string | null;
  documentationUrl?: string | null;
  appUrl?: string | null;
  iconName: string;
  displayOrder: number;
  isPublic: boolean;
}

export interface RoadmapMilestone {
  id: string;
  phaseNumber: string;
  phaseTitle: string;
  targetPeriod: string;
  status: MilestoneStatus;
  milestones: string[]; // JSON array of bullet points
  details: string;
  isTargetEstimate: boolean; // Flag showing "Target estimate, not financial guarantee"
  displayOrder: number;
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  publishedAt?: string | null;
  expiresAt?: string | null;
  isPinned: boolean;
  isFeaturedBanner: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  messagesCount: number;
  lastReplyAt: string;
  createdAt: string;
  updatedAt: string;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorEmail: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: Role | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null; // JSON string
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface ConnectedWallet {
  id: string;
  userId: string;
  address: string;
  chain: string;
  verifiedAt?: string | null;
  isVerified: boolean;
  linkedAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type IdType = 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE';

export interface DigitalWallet {
  id: string;
  userId: string;
  address: string;
  coinBalance: string;
  inrBalance: string;
  isFrozen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KycVerification {
  id: string;
  userId: string;
  fullName: string;
  idType: IdType;
  idNumber: string;
  documentFrontUrl: string;
  documentBackUrl?: string | null;
  selfieUrl?: string | null;
  status: KycStatus;
  rejectionReason?: string | null;
  reviewedById?: string | null;
  reviewedByEmail?: string | null;
  reviewedAt?: string | null;
  submittedAt: string;
  updatedAt: string;
}

export interface BuyOrder {
  id: string;
  orderNumber: string;
  userId: string;
  coinAmount: string;
  pricePerCoinInr: string;
  totalInr: string;
  paymentMethod: string;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  receiptNumber: string;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface SellOrder {
  id: string;
  orderNumber: string;
  userId: string;
  coinAmount: string;
  pricePerCoinInr: string;
  totalInr: string;
  bankAccountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  status: 'PENDING' | 'APPROVED' | 'SETTLED' | 'REJECTED';
  rejectionReason?: string | null;
  settlementUtr?: string | null;
  settledAt?: string | null;
  receiptNumber: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface EcosystemTransfer {
  id: string;
  transferNumber: string;
  senderId: string;
  senderWalletAddress: string;
  destinationType: 'INTERNAL_USER' | 'ECOSYSTEM_APP';
  destinationApp?: 'YOUPEAK' | 'YOUPEAK_ECOMMERCE' | 'OTHER' | null;
  recipientEmail?: string | null;
  recipientWalletAddress?: string | null;
  recipientUserId?: string | null;
  coinAmount: string;
  note?: string | null;
  status: 'CONFIRMED' | 'FAILED';
  createdAt: string;
  sender?: { email: string; name: string };
  recipient?: { email: string; name: string } | null;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  buyOrderId?: string | null;
  gateway: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string | null;
  gatewaySignature?: string | null;
  amountInr: string;
  currency: string;
  method: string;
  status: 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  refundId?: string | null;
  refundAmount?: string | null;
  refundReason?: string | null;
  receiptNumber?: string | null;
  failureMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { email: string; name: string };
}

export type TransactionType =
  | 'BUY_COIN'
  | 'SELL_COIN'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'ECOSYSTEM_DEBIT'
  | 'ECOSYSTEM_CREDIT'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'REFUND';

export interface TransactionRecord {
  id: string;
  txHash: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  coinAmount: string;
  fiatAmount?: string | null;
  balanceAfter: string;
  description: string;
  referenceId?: string | null;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  metadataJson?: string | null;
  createdAt: string;
}

export interface EcosystemPartner {
  id: string;
  appName: string;
  slug: string;
  apiKey: string;
  apiSecret?: string;
  webhookUrl?: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  permissions: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderReceipt {
  receiptNumber: string;
  orderNumber?: string;
  txHash?: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  date: string;
  userName: string;
  userEmail: string;
  walletAddress: string;
  coinAmount: string;
  fiatAmount?: string;
  rate?: string;
  paymentGateway?: string;
  paymentId?: string;
  status: string;
  notes?: string;
}
