import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mfaCode: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and privacy policy'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const coinConfigSchema = z.object({
  tokenName: z.string().min(1).max(50),
  ticker: z.string().min(1).max(10).toUpperCase(),
  decimals: z.number().int().min(0).max(18),
  blockchainNetwork: z.string().min(1),
  contractAddress: z.string().optional().nullable(),
  explorerUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  totalSupply: z.string().regex(/^\d+(\.\d+)?$/, 'Total supply must be a positive number string'),
  circulatingSupply: z.string().regex(/^\d+(\.\d+)?$/, 'Circulating supply must be a positive number string'),
  maxSupply: z.string().regex(/^\d+(\.\d+)?$/, 'Max supply must be a positive number string').optional().nullable().or(z.literal('')),
  whitepaperUrl: z.string().optional().nullable().or(z.literal('')),
  projectStatus: z.enum(['ACTIVE_DEVELOPMENT', 'TESTNET', 'MAINNET_PLANNED', 'MAINTENANCE']),
  officialEmail: z.string().email(),
});

export const manualPriceUpdateSchema = z.object({
  priceUsd: z.string().regex(/^\d+(\.\d+)?$/, 'Price must be a valid positive number'),
  effectiveTimestamp: z.string().datetime().optional(),
  reason: z.string().min(5, 'Internal reason for reference price update is required (audit trail)'),
  isScheduled: z.boolean().default(false),
  scheduledTime: z.string().datetime().optional(),
});

export const priceSourceConfigSchema = z.object({
  activeSource: z.enum(['MANUAL', 'EXTERNAL_COINGECKO', 'EXTERNAL_COINCAP', 'DEMO']),
  staleThresholdMinutes: z.number().int().min(1).max(1440),
  externalProviderApiKey: z.string().optional().nullable(),
  pollingIntervalSeconds: z.number().int().min(10).max(3600),
  externalEndpoint: z.string().url().optional().nullable().or(z.literal('')),
  demoVariancePercent: z.number().min(0).max(50),
});

export const priceRecordCorrectionSchema = z.object({
  recordId: z.string().uuid(),
  correctedPriceUsd: z.string().regex(/^\d+(\.\d+)?$/, 'Corrected price must be a valid positive number'),
  effectiveTimestamp: z.string().datetime(),
  reason: z.string().min(10, 'A detailed justification is required for historical price corrections'),
});

export const tokenAllocationItemSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1),
  percentage: z.number().min(0.01).max(100),
  tokenAmount: z.string().regex(/^\d+(\.\d+)?$/),
  vestingDescription: z.string().min(1),
  unlockSchedule: z.string().min(1),
  colorHex: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
  displayOrder: z.number().int().min(0),
});

export const tokenomicsBatchSchema = z.object({
  allocations: z.array(tokenAllocationItemSchema).refine((items) => {
    const total = items.reduce((acc, curr) => acc + curr.percentage, 0);
    // Allow slight float tolerance
    return Math.abs(total - 100) < 0.001;
  }, {
    message: 'Allocations must total exactly 100% before publication',
  }),
});

export const announcementSchema = z.object({
  title: z.string().min(3).max(120),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  summary: z.string().min(5).max(300),
  content: z.string().min(10),
  category: z.string().min(2),
  publishedAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isPinned: z.boolean().default(false),
  isFeaturedBanner: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export const faqItemSchema = z.object({
  question: z.string().min(5).max(200),
  answer: z.string().min(10),
  category: z.string().min(2),
  displayOrder: z.number().int().min(0),
  isPublished: z.boolean().default(true),
});

export const ecosystemModuleSchema = z.object({
  title: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().min(10),
  category: z.string().min(2),
  status: z.enum(['AVAILABLE', 'IN_DEVELOPMENT', 'PLANNED']),
  badgeText: z.string().optional().nullable(),
  documentationUrl: z.string().optional().nullable(),
  appUrl: z.string().optional().nullable(),
  iconName: z.string().min(1),
  displayOrder: z.number().int().min(0),
  isPublic: z.boolean().default(true),
});

export const roadmapMilestoneSchema = z.object({
  phaseNumber: z.string().min(1),
  phaseTitle: z.string().min(2),
  targetPeriod: z.string().min(2),
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'PLANNED']),
  milestones: z.array(z.string().min(1)),
  details: z.string().min(5),
  isTargetEstimate: z.boolean().default(true),
  displayOrder: z.number().int().min(0),
});

export const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(150),
  category: z.string().min(2),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  message: z.string().min(15, 'Message must be at least 15 characters'),
});

export const replyTicketSchema = z.object({
  content: z.string().min(2, 'Message cannot be empty'),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

export const calculatorInputSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Amount must be a positive number'),
  direction: z.enum(['USD_TO_SI', 'SI_TO_USD']),
});

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(15),
});

export const walletLinkSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum address format'),
  chain: z.string().default('Ethereum Mainnet / Sepolia'),
  signature: z.string().optional(),
  challengeToken: z.string().optional(),
});

// SIcoinX Digital Coin & Payment Schemas
export const buyCoinRequestSchema = z.object({
  coinAmount: z.string().regex(/^\d+(\.\d+)?$/, 'Coin amount must be a positive number'),
  paymentMethod: z.enum(['RAZORPAY_UPI', 'RAZORPAY_CARD', 'RAZORPAY_NETBANKING']).default('RAZORPAY_UPI'),
});

export const verifyRazorpayPaymentSchema = z.object({
  buyOrderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const sellCoinRequestSchema = z.object({
  coinAmount: z.string().regex(/^\d+(\.\d+)?$/, 'Coin amount must be a positive number'),
  bankAccountName: z.string().min(2, 'Account holder name is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().min(8, 'Valid account number is required'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Must be a valid 11-character Indian IFSC code (e.g. HDFC0001234)'),
});

export const transferCoinSchema = z.object({
  destinationType: z.enum(['INTERNAL_USER', 'ECOSYSTEM_APP']),
  destinationApp: z.enum(['YOUPEAK', 'YOUPEAK_ECOMMERCE', 'OTHER']).optional(),
  recipientIdentifier: z.string().min(3, 'Recipient email, wallet address or username is required'),
  coinAmount: z.string().regex(/^\d+(\.\d+)?$/, 'Coin amount must be a positive number'),
  note: z.string().max(200).optional(),
});

export const submitKycSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  idType: z.enum(['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE']),
  idNumber: z.string().min(4, 'ID number must be at least 4 characters'),
  documentFrontUrl: z.string().min(1, 'Front document image is required'),
  documentBackUrl: z.string().optional(),
  selfieUrl: z.string().optional(),
});

export const reviewKycSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

export const adminSettleSellOrderSchema = z.object({
  settlementUtr: z.string().min(4, 'Bank settlement UTR / transaction reference number is required'),
});

export const adminAdjustWalletSchema = z.object({
  targetUserId: z.string().uuid(),
  type: z.enum(['CREDIT', 'DEBIT']),
  coinAmount: z.string().regex(/^\d+(\.\d+)?$/, 'Coin amount must be a positive number'),
  reason: z.string().min(5, 'Reason for adjustment is mandatory for audit trail'),
});

export const adminFreezeWalletSchema = z.object({
  isFrozen: z.boolean(),
  reason: z.string().min(5, 'Reason is mandatory'),
});

export const adminRefundPaymentSchema = z.object({
  paymentRecordId: z.string().uuid(),
  refundReason: z.string().min(5, 'Refund reason is mandatory'),
});

export const updateCoinRatesSchema = z.object({
  buyPriceInr: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  sellPriceInr: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  inrPerUsd: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  circulatingSupply: z.string().optional(),
  totalSupply: z.string().optional(),
  reserveSupply: z.string().optional(),
  enableBuying: z.boolean().optional(),
  enableSelling: z.boolean().optional(),
  enableTransfers: z.boolean().optional(),
});

export const partnerDebitSchema = z.object({
  userIdentifier: z.string().min(3, 'User email or wallet address is required'),
  coinAmount: z.string().regex(/^\d+(\.\d+)?$/, 'Coin amount must be a positive number'),
  orderReference: z.string().min(1, 'Partner order reference is required'),
  description: z.string().optional(),
});

export const partnerCreditSchema = z.object({
  userIdentifier: z.string().min(3, 'User email or wallet address is required'),
  coinAmount: z.string().regex(/^\d+(\.\d+)?$/, 'Coin amount must be a positive number'),
  reference: z.string().min(1, 'Partner reward/reference is required'),
  description: z.string().optional(),
});
