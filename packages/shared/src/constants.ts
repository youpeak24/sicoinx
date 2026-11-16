export const BRAND = {
  name: 'SI Coin',
  ticker: 'SI',
  headline: 'A Clearer Way to Explore Digital Value.',
  supportingMessage:
    'Discover SI Coin through transparent information, simple tools, and one connected ecosystem.',
  colors: {
    primaryBlue: '#175CFF',
    deepBlue: '#123B9A',
    mainText: '#10213A',
    secondaryText: '#64748B',
    white: '#FFFFFF',
    mainBg: '#F7FAFF',
    paleBlueBg: '#EDF4FF',
    borders: '#DFE8F5',
    success: '#15803D',
    warning: '#B45309',
    error: '#DC2626',
  },
} as const;

export const DEFAULT_COIN_CONFIG = {
  tokenName: 'SI Coin',
  ticker: 'SI',
  decimals: 6,
  blockchainNetwork: 'Ethereum (Planned ERC-20) / Sepolia Testnet Preview',
  contractAddress: '0x0000000000000000000000000000000000000000', // Unset / preview placeholder
  explorerUrl: '',
  totalSupply: '100000000', // 100 Million
  circulatingSupply: '18500000', // 18.5 Million
  maxSupply: '100000000',
  whitepaperUrl: '/whitepaper',
  projectStatus: 'ACTIVE_DEVELOPMENT' as const,
  officialEmail: 'info@sicoin.org',
};

export const INITIAL_PRICE_USD = '1.250000';

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'manage_users',
    'manage_roles',
    'manage_coin_config',
    'manage_pricing',
    'manage_tokenomics',
    'manage_content',
    'manage_support',
    'view_audit_logs',
    'manage_system_settings',
  ],
  FINANCE_MANAGER: [
    'manage_coin_config',
    'manage_pricing',
    'manage_tokenomics',
    'view_audit_logs',
  ],
  CONTENT_EDITOR: [
    'manage_content',
    'manage_announcements',
    'manage_faq',
    'manage_roadmap',
    'manage_ecosystem',
  ],
  SUPPORT_AGENT: [
    'manage_support',
    'view_users',
  ],
  READONLY_ANALYST: [
    'view_pricing',
    'view_tokenomics',
    'view_audit_logs',
    'view_analytics',
  ],
  USER: [
    'view_dashboard',
    'manage_own_profile',
    'manage_own_wallets',
    'submit_support_ticket',
  ],
} as const;

export const DEFAULT_ALLOCATIONS = [
  {
    category: 'Ecosystem & Community Development',
    percentage: 35.0,
    tokenAmount: '35000000',
    vestingDescription: '4-year linear vesting with 6-month cliff for network initiatives',
    unlockSchedule: 'Quarterly unlock starting Q3 2027',
    colorHex: '#175CFF',
    displayOrder: 1,
  },
  {
    category: 'Public Distribution & Liquidity',
    percentage: 25.0,
    tokenAmount: '25000000',
    vestingDescription: 'Initial float and DEX/CEX liquidity provisioning reserves',
    unlockSchedule: 'Phased liquidity deployment upon mainnet genesis',
    colorHex: '#123B9A',
    displayOrder: 2,
  },
  {
    category: 'Core Engineering & Research',
    percentage: 20.0,
    tokenAmount: '20000000',
    vestingDescription: '3-year retention schedule with 12-month initial cliff',
    unlockSchedule: 'Monthly vesting post 1-year cliff',
    colorHex: '#3B82F6',
    displayOrder: 3,
  },
  {
    category: 'Strategic Ecosystem Reserve',
    percentage: 12.0,
    tokenAmount: '12000000',
    vestingDescription: 'Multi-sig locked governance reserve for protocol security',
    unlockSchedule: 'Requires decentralized governance quorum',
    colorHex: '#60A5FA',
    displayOrder: 4,
  },
  {
    category: 'Advisory & Early Contributors',
    percentage: 8.0,
    tokenAmount: '8000000',
    vestingDescription: '2-year linear vesting with quarterly release checkpoints',
    unlockSchedule: 'Quarterly checkpoints over 24 months',
    colorHex: '#93C5FD',
    displayOrder: 5,
  },
];

export const ECOSYSTEM_APPS = [
  {
    id: 'youpeak',
    name: 'YouPeak',
    slug: 'youpeak',
    description: 'YouPeak creator, streaming, and community interaction platform with SIcoinX integration.',
    category: 'Community & Media',
    icon: 'Radio',
    apiKey: 'pk_live_youpeak_8a92f089e1a44c',
  },
  {
    id: 'youpeak-ecommerce',
    name: 'YouPeak E-Commerce',
    slug: 'youpeak-ecommerce',
    description: 'YouPeak digital merchandise and e-commerce marketplace powered by SIcoinX checkout.',
    category: 'E-Commerce & Retail',
    icon: 'ShoppingBag',
    apiKey: 'pk_live_youpeak_ecom_4b18c7d03e912',
  },
] as const;

export const DEFAULT_TRADE_CONFIG = {
  buyPriceInr: '105.00',
  sellPriceInr: '100.00',
  inrPerUsd: '84.00',
  minBuyCoins: '1',
  maxBuyCoins: '100000',
  minSellCoins: '1',
  maxSellCoins: '50000',
  paymentGateway: 'RAZORPAY',
  currency: 'INR',
} as const;
