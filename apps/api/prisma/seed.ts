import 'dotenv/config';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Cryptographically random password with upper, lower, digit and symbol. No look-alike or shell-special characters. */
function generatePassword(length = 20): string {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@%*-_'];
  const all = sets.join('');
  const chars = sets.map((s) => s[crypto.randomInt(s.length)]);
  while (chars.length < length) chars.push(all[crypto.randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

interface StaffAccount {
  email: string;
  name: string;
  role: string;
  passwordEnv: string;
}

/**
 * Staff accounts only. No customer/demo accounts are created: real users sign up themselves.
 * Passwords come from the environment, or are generated randomly and printed ONCE at the end of seeding.
 * Set RESET_STAFF_PASSWORDS=true to overwrite the passwords of staff accounts that already exist.
 */
const STAFF: StaffAccount[] = [
  {
    email: process.env.INITIAL_ADMIN_EMAIL || 'admin@sicoin.org',
    name: process.env.INITIAL_ADMIN_NAME || 'System Administrator',
    role: 'SUPER_ADMIN',
    passwordEnv: 'INITIAL_ADMIN_PASSWORD',
  },
  { email: 'finance@sicoin.org', name: 'Finance Manager', role: 'FINANCE_MANAGER', passwordEnv: 'INITIAL_FINANCE_PASSWORD' },
  { email: 'editor@sicoin.org', name: 'Content Editor', role: 'CONTENT_EDITOR', passwordEnv: 'INITIAL_EDITOR_PASSWORD' },
  { email: 'support@sicoin.org', name: 'Support Agent', role: 'SUPPORT_AGENT', passwordEnv: 'INITIAL_SUPPORT_PASSWORD' },
];

async function main() {
  console.log('Seeding SI Coin database...');

  // 1. Staff accounts
  const resetPasswords = process.env.RESET_STAFF_PASSWORDS === 'true';
  const generatedCredentials: { role: string; email: string; password: string }[] = [];
  const generatedPartnerCredentials: { partner: string; apiKey: string; apiSecret: string }[] = [];
  let superAdmin: { id: string; email: string } | null = null;

  for (const staff of STAFF) {
    const email = staff.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    const configured = process.env[staff.passwordEnv];

    let user = existing;
    if (!existing || resetPasswords) {
      const password = configured || generatePassword();
      if (!configured) generatedCredentials.push({ role: staff.role, email, password });
      const passwordHash = await bcrypt.hash(password, 12);
      user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash, name: staff.name, role: staff.role },
        create: { email, name: staff.name, passwordHash, role: staff.role, isEmailVerified: true, mfaEnabled: false },
      });
    }
    if (staff.role === 'SUPER_ADMIN') superAdmin = user;
  }
  if (!superAdmin) throw new Error('Super admin account was not created');
  const admin = superAdmin as { id: string; email: string };
  console.log('Staff accounts ready: ' + STAFF.map((s) => s.email).join(', '));

  // 2. Coin Configuration
  await prisma.coinConfiguration.upsert({
    where: { id: 'default-coin' },
    update: {},
    create: {
      id: 'default-coin',
      tokenName: 'SI Coin',
      ticker: 'SI',
      decimals: 6,
      blockchainNetwork: 'Ethereum (Planned ERC-20) / Sepolia Testnet Preview',
      contractAddress: '0x32A89F07211C824bA7D18fEc31548e658Ec0989b',
      explorerUrl: 'https://sepolia.etherscan.io/address/0x32A89F07211C824bA7D18fEc31548e658Ec0989b',
      totalSupply: '100000000',
      circulatingSupply: '18500000',
      maxSupply: '100000000',
      whitepaperUrl: '/whitepaper',
      projectStatus: 'ACTIVE_DEVELOPMENT',
      officialEmail: 'info@sicoin.org',
    },
  });

  // 3. Price Source Configuration
  await prisma.priceSourceConfiguration.upsert({
    where: { id: 'default-price-config' },
    update: {},
    create: {
      id: 'default-price-config',
      activeSource: 'MANUAL',
      staleThresholdMinutes: 60,
      pollingIntervalSeconds: 30,
      demoVariancePercent: 1.5,
    },
  });

  // 4. Initial administrator-set reference price (history accrues from real price updates)
  const existingObservations = await prisma.priceObservation.count();
  if (existingObservations === 0) {
    const now = new Date();
    await prisma.priceObservation.create({
      data: {
        priceUsd: '1.250000',
        quoteCurrency: 'USD',
        source: 'MANUAL',
        sourceLabel: 'Administrator-set reference price',
        effectiveTimestamp: now,
        recordedTimestamp: now,
        actorEmail: admin.email,
        changeReason: 'Initial reference price',
        isCorrection: false,
        isDemoData: false,
      },
    });
    console.log('Seeded the initial reference price.');
  }

  // 5. Token Allocations (strictly totaling 100%)
  const existingAllocations = await prisma.tokenAllocation.count();
  if (existingAllocations === 0) {
    const allocations = [
      {
        category: 'Ecosystem & Community Development',
        percentage: 35.0,
        tokenAmount: '35000000',
        vestingDescription: '4-year linear vesting with 6-month initial lockup for developer grants & community nodes',
        unlockSchedule: 'Quarterly distributions starting Q3 2027',
        colorHex: '#175CFF',
        displayOrder: 1,
      },
      {
        category: 'Public Distribution & Liquidity',
        percentage: 25.0,
        tokenAmount: '25000000',
        vestingDescription: 'Initial float and DEX/CEX liquidity provisioning reserves',
        unlockSchedule: 'Phased deployment upon mainnet genesis release',
        colorHex: '#123B9A',
        displayOrder: 2,
      },
      {
        category: 'Core Engineering & Research',
        percentage: 20.0,
        tokenAmount: '20000000',
        vestingDescription: '3-year retention schedule with 12-month initial cliff for core architects',
        unlockSchedule: 'Monthly vesting post 1-year cliff',
        colorHex: '#3B82F6',
        displayOrder: 3,
      },
      {
        category: 'Strategic Protocol Reserve',
        percentage: 12.0,
        tokenAmount: '12000000',
        vestingDescription: 'Multi-sig locked governance reserve dedicated exclusively to unexpected security emergencies',
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

    for (const a of allocations) {
      await prisma.tokenAllocation.create({ data: a });
    }
    console.log('Seeded token allocations totaling 100%.');
  }

  // 6. Ecosystem Modules
  const existingModules = await prisma.ecosystemModule.count();
  if (existingModules === 0) {
    const modules = [
      {
        title: 'SI Account Dashboard',
        slug: 'account-dashboard',
        description: 'Secure, authenticated control center providing portfolio tracking, audit activity, and account security.',
        category: 'Account & Identity',
        status: 'AVAILABLE',
        badgeText: 'Live in v1.0',
        documentationUrl: '/dashboard',
        appUrl: '/dashboard',
        iconName: 'LayoutDashboard',
        displayOrder: 1,
        isPublic: true,
      },
      {
        title: 'Wallet Verification & Linking',
        slug: 'wallet-verification',
        description: 'Cryptographic challenge-response linkage for Web3 wallets without ever transmitting private keys.',
        category: 'Account & Identity',
        status: 'AVAILABLE',
        badgeText: 'Non-Custodial',
        documentationUrl: '/about',
        appUrl: '/dashboard/wallets',
        iconName: 'Wallet',
        displayOrder: 2,
        isPublic: true,
      },
      {
        title: 'Transparent Value Calculator',
        slug: 'value-calculator',
        description: 'Decimal-accurate conversion engine showing reference valuation with explicit provenance and stale-rate guards.',
        category: 'Financial Analytics',
        status: 'AVAILABLE',
        badgeText: 'High Precision',
        documentationUrl: '/market',
        appUrl: '/#calculator',
        iconName: 'Calculator',
        displayOrder: 3,
        isPublic: true,
      },
      {
        title: 'Payment Settlement Gateway',
        slug: 'payment-gateway',
        description: 'Developer SDKs and webhooks for merchant settlement and microtransaction verification.',
        category: 'Infrastructure',
        status: 'IN_DEVELOPMENT',
        badgeText: 'Q3 2027 Target',
        documentationUrl: '/roadmap',
        appUrl: null,
        iconName: 'CreditCard',
        displayOrder: 4,
        isPublic: true,
      },
      {
        title: 'Decentralized Governance Portal',
        slug: 'governance-portal',
        description: 'On-chain voting framework for protocol upgrades, allocation approvals, and parameter changes.',
        category: 'Governance',
        status: 'PLANNED',
        badgeText: 'DAO Voting',
        documentationUrl: '/roadmap',
        appUrl: null,
        iconName: 'Vote',
        displayOrder: 5,
        isPublic: true,
      },
      {
        title: 'High-Performance Node Verification',
        slug: 'node-verification',
        description: 'Telemetry and block validation software for decentralized community node runners.',
        category: 'Infrastructure',
        status: 'PLANNED',
        badgeText: 'Open Source',
        documentationUrl: '/whitepaper',
        appUrl: null,
        iconName: 'Server',
        displayOrder: 6,
        isPublic: true,
      },
    ];

    for (const m of modules) {
      await prisma.ecosystemModule.create({ data: m });
    }
    console.log('Seeded ecosystem modules.');
  }

  // 7. Roadmap Milestones
  const existingMilestones = await prisma.roadmapMilestone.count();
  if (existingMilestones === 0) {
    const milestones = [
      {
        phaseNumber: 'Phase 01',
        phaseTitle: 'Platform Architecture & Specification',
        targetPeriod: 'Q1 – Q2 2026',
        status: 'COMPLETED',
        milestonesJson: JSON.stringify([
          'Cryptographic specification and light-theme design system finalized',
          'Tokenomics mathematical modeling and vesting audit framework established',
          'Administrative governance panel with role-based access implemented',
          'Reference pricing engine with immutable audit trail deployed',
        ]),
        details: 'Initial architectural groundwork focusing on absolute financial transparency, non-custodial boundaries, and strict precision rules.',
        isTargetEstimate: false,
        displayOrder: 1,
      },
      {
        phaseNumber: 'Phase 02',
        phaseTitle: 'Sepolia Testnet & Community Verification',
        targetPeriod: 'Q3 – Q4 2026',
        status: 'IN_PROGRESS',
        milestonesJson: JSON.stringify([
          'Smart contract deployment to Ethereum Sepolia testnet environment',
          'Challenge-signature wallet authentication and telemetry testing',
          'Third-party security audit and open-source documentation publishing',
          'Public developer sandbox with simulated ledger faucet integration',
        ]),
        details: 'Active phase targeting comprehensive security validations, community bug bounty programs, and automated challenge-verification workflows.',
        isTargetEstimate: true,
        displayOrder: 2,
      },
      {
        phaseNumber: 'Phase 03',
        phaseTitle: 'Developer Tooling & Merchant Gateways',
        targetPeriod: 'Q1 – Q2 2027',
        status: 'PLANNED',
        milestonesJson: JSON.stringify([
          'TypeScript and Python SDK release for merchant applications',
          'Decentralized Oracle feed adapters for multi-source price consolidation',
          'High-throughput transaction simulation engine with slippage controls',
        ]),
        details: 'Extending SI Coin utility across external application ecosystems with strict settlement guarantees.',
        isTargetEstimate: true,
        displayOrder: 3,
      },
      {
        phaseNumber: 'Phase 04',
        phaseTitle: 'Mainnet Genesis & Governance Handover',
        targetPeriod: 'Q3 – Q4 2027',
        status: 'PLANNED',
        milestonesJson: JSON.stringify([
          'Genesis block production and multi-sig validator initiation',
          'Decentralized governance portal activation for allocation management',
          'Tier-1 verifiable on-chain transparency dashboards',
        ]),
        details: 'Transition of protocol parameters to community token-weighted governance votes with multi-sig emergency lockouts.',
        isTargetEstimate: true,
        displayOrder: 4,
      },
    ];

    for (const rm of milestones) {
      await prisma.roadmapMilestone.create({ data: rm });
    }
    console.log('Seeded roadmap milestones.');
  }

  // 9. FAQ Items
  const existingFaqs = await prisma.faqItem.count();
  if (existingFaqs === 0) {
    const faqs = [
      {
        question: 'What is SI Coin?',
        answer: 'SI Coin is a modern digital asset engineered for transparent value tracking, robust ecosystem settlement, and verifiable cryptographic identity. It is built with an emphasis on institutional clarity, avoiding misleading financial promises and speculative gimmicks.',
        category: 'General',
        displayOrder: 1,
        isPublished: true,
      },
      {
        question: 'What is the purpose of the reference price displayed on the site?',
        answer: 'The reference price provides an informational valuation benchmark established either through verified administrative parameters, external oracle aggregators, or testnet data feeds. Every price explicitly discloses its source and effective timestamp. It is not an executable exchange quote.',
        category: 'Pricing & Valuation',
        displayOrder: 2,
        isPublished: true,
      },
      {
        question: 'How does the Token Value Calculator work?',
        answer: 'The calculator performs high-precision decimal arithmetic (using Decimal.js) against the active reference rate. For USD to SI: Estimated SI = USD Amount / USD Price per SI. If the price data is stale or missing, the calculator automatically disables itself to protect user integrity.',
        category: 'Pricing & Valuation',
        displayOrder: 3,
        isPublished: true,
      },
      {
        question: 'Does SI Coin require depositing my cryptocurrency or sharing private keys?',
        answer: 'Never. SI Coin is completely non-custodial. We will never ask for, transmit, or store private keys, seed phrases, or custody passwords. Wallet connection uses cryptographic challenge signing solely to verify wallet ownership.',
        category: 'Security & Wallets',
        displayOrder: 4,
        isPublished: true,
      },
      {
        question: 'Are there staking packages, referral bonuses, or guaranteed daily yields?',
        answer: 'No. SI Coin strictly rejects speculative yield schemes, referral packages, or daily percentage promises. Our ecosystem focus is centered on transparent utility, developer tooling, and decentralized protocol governance.',
        category: 'Economics & Governance',
        displayOrder: 5,
        isPublished: true,
      },
      {
        question: 'What blockchain network will SI Coin use?',
        answer: 'SI Coin is currently verified on Ethereum Sepolia testnet as an ERC-20 standard candidate. Mainnet deployment parameters and network explorer addresses will be finalized upon completion of the security audit phase.',
        category: 'General',
        displayOrder: 6,
        isPublished: true,
      },
      {
        question: 'How do I submit an inquiry or get technical assistance?',
        answer: 'Registered users can create and track authenticated support tickets directly from the User Dashboard at /dashboard/support. Guests may also reach our team through the public contact form at /contact or by emailing info@sicoin.org.',
        category: 'Support',
        displayOrder: 7,
        isPublished: true,
      },
    ];

    for (const f of faqs) {
      await prisma.faqItem.create({ data: f });
    }
    console.log('Seeded FAQ items.');
  }

  // 11. SIcoinX Digital Wallets & Ecosystem Partners
  const users = await prisma.user.findMany();
  for (const u of users) {
    const existingWallet = await prisma.wallet.findUnique({ where: { userId: u.id } });
    if (!existingWallet) {
      const address = `SICX-${u.id.replace(/-/g, '').slice(0, 4).toUpperCase()}-${u.id.replace(/-/g, '').slice(4, 8).toUpperCase()}-${u.id.replace(/-/g, '').slice(8, 12).toUpperCase()}`;
      await prisma.wallet.create({
        data: {
          userId: u.id,
          address,
          coinBalance: '0.000000',
          inrBalance: '0.00',
          isFrozen: false,
        },
      });
    }
  }

  // 12. Seed Ecosystem Partners (YouPeak & YouPeak E-Commerce)
  const existingPartners = await prisma.ecosystemPartner.count();
  const partnerKeys = {
    youpeak: { apiKey: 'pk_' + crypto.randomBytes(12).toString('hex'), apiSecret: 'sk_' + crypto.randomBytes(24).toString('hex') },
    ecommerce: { apiKey: 'pk_' + crypto.randomBytes(12).toString('hex'), apiSecret: 'sk_' + crypto.randomBytes(24).toString('hex') },
  };
  if (existingPartners === 0) {
    await prisma.ecosystemPartner.create({
      data: {
        appName: 'YouPeak',
        slug: 'youpeak',
        apiKey: partnerKeys.youpeak.apiKey,
        apiSecret: partnerKeys.youpeak.apiSecret,
        webhookUrl: 'https://youpeak.live/api/webhooks/sicoin',
        status: 'ACTIVE',
        permissions: 'read_balance,debit,credit,transfer',
      },
    });

    await prisma.ecosystemPartner.create({
      data: {
        appName: 'YouPeak E-Commerce',
        slug: 'youpeak-ecommerce',
        apiKey: partnerKeys.ecommerce.apiKey,
        apiSecret: partnerKeys.ecommerce.apiSecret,
        webhookUrl: 'https://shop.youpeak.live/api/sicoin-ipn',
        status: 'ACTIVE',
        permissions: 'read_balance,debit,credit,transfer',
      },
    });
    console.log('Seeded Ecosystem Partners (YouPeak and YouPeak E-Commerce) with generated API credentials.');
    generatedPartnerCredentials.push(
      { partner: 'YouPeak', ...partnerKeys.youpeak },
      { partner: 'YouPeak E-Commerce', ...partnerKeys.ecommerce },
    );
  }

  console.log('Database seeding completed successfully!');

  if (generatedCredentials.length > 0) {
    console.log('\n=== GENERATED STAFF CREDENTIALS (shown once: store them in a password manager) ===');
    for (const c of generatedCredentials) {
      console.log('  ' + c.role.padEnd(16) + ' ' + c.email.padEnd(24) + ' ' + c.password);
    }
  }
  if (generatedPartnerCredentials.length > 0) {
    console.log('\n=== GENERATED ECOSYSTEM PARTNER API CREDENTIALS (shown once) ===');
    for (const p of generatedPartnerCredentials) {
      console.log('  ' + p.partner + ': key=' + p.apiKey + ' secret=' + p.apiSecret);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
