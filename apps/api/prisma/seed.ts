import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SI Coin database...');

  // 1. Initial Admin & Staff Users
  const adminPasswordHash = await bcrypt.hash('AdminSecurePass123!', 12);
  const userPasswordHash = await bcrypt.hash('UserSecurePass123!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@sicoin.org' },
    update: {},
    create: {
      email: 'admin@sicoin.org',
      name: 'Chief System Administrator',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
      mfaEnabled: false,
    },
  });

  const financeManager = await prisma.user.upsert({
    where: { email: 'finance@sicoin.org' },
    update: {},
    create: {
      email: 'finance@sicoin.org',
      name: 'Elena Rostova',
      passwordHash: adminPasswordHash,
      role: 'FINANCE_MANAGER',
      isEmailVerified: true,
      mfaEnabled: false,
    },
  });

  const contentEditor = await prisma.user.upsert({
    where: { email: 'editor@sicoin.org' },
    update: {},
    create: {
      email: 'editor@sicoin.org',
      name: 'Marcus Vance',
      passwordHash: adminPasswordHash,
      role: 'CONTENT_EDITOR',
      isEmailVerified: true,
      mfaEnabled: false,
    },
  });

  const supportAgent = await prisma.user.upsert({
    where: { email: 'support@sicoin.org' },
    update: {},
    create: {
      email: 'support@sicoin.org',
      name: 'Sarah Chen',
      passwordHash: adminPasswordHash,
      role: 'SUPPORT_AGENT',
      isEmailVerified: true,
      mfaEnabled: false,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@sicoin.org' },
    update: {},
    create: {
      email: 'user@sicoin.org',
      name: 'David Mercer',
      passwordHash: userPasswordHash,
      role: 'USER',
      isEmailVerified: true,
      mfaEnabled: false,
    },
  });

  console.log('Seeded users: admin@sicoin.org, finance@sicoin.org, user@sicoin.org');

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

  // 4. Historical Price Records (Spanning past 30 days)
  const existingObservations = await prisma.priceObservation.count();
  if (existingObservations === 0) {
    const historicalPoints = [
      { daysAgo: 30, price: '0.850000', reason: 'Initial seed price baseline' },
      { daysAgo: 25, price: '0.890000', reason: 'Milestone 1 alpha delivery' },
      { daysAgo: 20, price: '0.940000', reason: 'Technical paper peer review publication' },
      { daysAgo: 15, price: '0.990000', reason: 'Testnet node telemetry preview' },
      { daysAgo: 10, price: '1.080000', reason: 'Ecosystem tools integration v0.4' },
      { daysAgo: 5,  price: '1.140000', reason: 'Community developer testnet signup surge' },
      { daysAgo: 2,  price: '1.190000', reason: 'Smart contract formal verification completion' },
      { daysAgo: 1,  price: '1.220000', reason: 'Pre-launch stability index evaluation' },
      { daysAgo: 0,  price: '1.250000', reason: 'Current active administrator-set reference price' },
    ];

    const now = Date.now();
    for (const pt of historicalPoints) {
      const timestamp = new Date(now - pt.daysAgo * 24 * 60 * 60 * 1000);
      await prisma.priceObservation.create({
        data: {
          priceUsd: pt.price,
          quoteCurrency: 'USD',
          source: 'MANUAL',
          sourceLabel: 'Administrator-set reference price',
          effectiveTimestamp: timestamp,
          recordedTimestamp: timestamp,
          actorEmail: 'admin@sicoin.org',
          changeReason: pt.reason,
          isCorrection: false,
          isDemoData: false,
        },
      });
    }
    console.log(`Seeded ${historicalPoints.length} historical price observations.`);
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

  // 8. Announcements
  const existingAnnouncements = await prisma.announcement.count();
  if (existingAnnouncements === 0) {
    await prisma.announcement.create({
      data: {
        title: 'Explore the SI Coin ecosystem and project roadmap',
        slug: 'welcome-to-si-coin-ecosystem',
        summary: 'We are proud to present the official SI Coin platform, delivering transparent tokenomics, live reference pricing, and verifiable development progress.',
        content: `
Welcome to SI Coin.

Our mission is to establish a clearer, mathematically rigorous, and fully transparent digital asset ecosystem. 
Unlike conventional platforms that make ungrounded financial promises, SI Coin enforces absolute clarity across all operations:

- Transparent Reference Pricing: Every displayed value discloses its provenance, exact calculation method, and timestamp.
- Strict Vesting Disclosures: 100% of the token supply is accounted for with audited linear schedules.
- Non-Custodial Architecture: We never request, process, or store user seed phrases or private keys.

Explore our interactive token value calculator, review the technical paper, or connect with our engineering team through our dedicated support portal.
        `.trim(),
        category: 'Ecosystem Announcement',
        publishedAt: new Date(),
        isPinned: true,
        isFeaturedBanner: true,
        status: 'PUBLISHED',
      },
    });

    await prisma.announcement.create({
      data: {
        title: 'Sepolia Testnet Contract Verification & Architecture Audit',
        slug: 'sepolia-testnet-verification-audit',
        summary: 'The initial ERC-20 contract candidate has been deployed to the Sepolia testnet environment for comprehensive static and symbolic analysis.',
        content: `
We have successfully completed the initial deployment phase of the SI Coin testnet contract. 

Highlights of this release:
1. Fixed maximum supply enforced at the bytecode level (100,000,000 SI).
2. Elimination of arbitrary mint functions or unverified re-entrancy surfaces.
3. Integration with open-source Etherscan verification tooling.

Community developers are invited to review the testnet address and submit verification reports through our secure support channels.
        `.trim(),
        category: 'Technical Update',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isPinned: false,
        isFeaturedBanner: false,
        status: 'PUBLISHED',
      },
    });

    await prisma.announcement.create({
      data: {
        title: 'Q2 Transparency Report: Allocation Integrity & Vesting Controls',
        slug: 'q2-transparency-report-allocations',
        summary: 'A detailed breakdown of all 5 allocation tranches, vesting smart contracts, and governance multi-signature signatories.',
        content: `
As part of our commitment to institutional-grade clarity, our Q2 Transparency Report is now available. 

Key Metrics:
- Circulating Float: 18.5% (Reserved for initial genesis float and liquidity bootstrapping)
- Long-Term Lockup: 81.5% distributed across Core Research (3-year schedule), Ecosystem Development (4-year schedule), and Strategic Protocol Reserve.
- Zero Founder Dump Mechanisms: All contributor allocations are subject to minimum 12-month cliff protections.
        `.trim(),
        category: 'Transparency',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isPinned: false,
        isFeaturedBanner: false,
        status: 'PUBLISHED',
      },
    });

    console.log('Seeded announcements.');
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

  // 10. Sample Simulated Ledger & Support Ticket for demo user
  const existingTickets = await prisma.supportTicket.count();
  if (existingTickets === 0) {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: demoUser.id,
        userEmail: demoUser.email,
        userName: demoUser.name,
        subject: 'Inquiry regarding Sepolia Testnet Faucet allocation',
        category: 'Testnet Participation',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        messagesCount: 2,
        messages: {
          create: [
            {
              authorId: demoUser.id,
              authorEmail: demoUser.email,
              authorName: demoUser.name,
              authorRole: 'USER',
              content: 'Hello, I have linked my testnet wallet and wanted to confirm how simulated faucet allocations are recorded on my dashboard.',
            },
            {
              authorId: supportAgent.id,
              authorEmail: supportAgent.email,
              authorName: supportAgent.name,
              authorRole: 'SUPPORT_AGENT',
              content: 'Hi David! Your linked wallet has been verified. Testnet faucet claims appear in your Activity log under "Simulated Ledger" to keep demonstration data strictly separate from verified on-chain entries.',
            },
          ],
        },
      },
    });

    await prisma.simulatedLedgerEntry.create({
      data: {
        userId: demoUser.id,
        type: 'DEMO_TESTNET_ALLOCATION',
        amount: '250.000000',
        balanceAfter: '250.000000',
        reference: 'Sepolia Faucet Developer Grant #10842',
        status: 'CONFIRMED',
      },
    });

    await prisma.notification.create({
      data: {
        userId: demoUser.id,
        title: 'Testnet Wallet Verified',
        message: 'Your Ethereum testnet wallet address has been verified successfully via cryptographic challenge.',
        type: 'SUCCESS',
        linkUrl: '/dashboard/wallets',
      },
    });

    console.log('Seeded sample support ticket, testnet ledger entry, and notification for demo user.');
  }

  // 11. SIcoinX Digital Wallets & Ecosystem Partners
  const users = await prisma.user.findMany();
  for (const u of users) {
    const existingWallet = await prisma.wallet.findUnique({ where: { userId: u.id } });
    if (!existingWallet) {
      const address = `SICX-${u.id.replace(/-/g, '').slice(0, 4).toUpperCase()}-${u.id.replace(/-/g, '').slice(4, 8).toUpperCase()}-${u.id.replace(/-/g, '').slice(8, 12).toUpperCase()}`;
      const initialBalance = u.email === 'user@sicoin.org' ? '500.000000' : '1000.000000';
      await prisma.wallet.create({
        data: {
          userId: u.id,
          address,
          coinBalance: initialBalance,
          inrBalance: '25000.00',
          isFrozen: false,
        },
      });
    }
  }

  // 12. Seed Ecosystem Partners (YouPeak & YouPeak E-Commerce)
  const existingPartners = await prisma.ecosystemPartner.count();
  if (existingPartners === 0) {
    await prisma.ecosystemPartner.create({
      data: {
        appName: 'YouPeak',
        slug: 'youpeak',
        apiKey: 'pk_live_youpeak_8a92f089e1a44c',
        apiSecret: 'sk_live_youpeak_sec_77a90f12',
        webhookUrl: 'https://youpeak.live/api/webhooks/sicoin',
        status: 'ACTIVE',
        permissions: 'read_balance,debit,credit,transfer',
      },
    });

    await prisma.ecosystemPartner.create({
      data: {
        appName: 'YouPeak E-Commerce',
        slug: 'youpeak-ecommerce',
        apiKey: 'pk_live_youpeak_ecom_4b18c7d03e912',
        apiSecret: 'sk_live_youpeak_ecom_sec_99d123b',
        webhookUrl: 'https://shop.youpeak.live/api/sicoin-ipn',
        status: 'ACTIVE',
        permissions: 'read_balance,debit,credit,transfer',
      },
    });
    console.log('Seeded Ecosystem Partners (YouPeak and YouPeak E-Commerce).');
  }

  // 13. Seed KYC for demo user
  const existingKyc = await prisma.kycVerification.findUnique({ where: { userId: demoUser.id } });
  if (!existingKyc) {
    await prisma.kycVerification.create({
      data: {
        userId: demoUser.id,
        fullName: 'David M. User',
        idType: 'AADHAAR',
        idNumber: '4829-1928-8472',
        documentFrontUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
        documentBackUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
        status: 'APPROVED',
        reviewedById: superAdmin.id,
        reviewedByEmail: superAdmin.email,
        reviewedAt: new Date(),
      },
    });
  }

  // 14. Seed sample BuyOrder & PaymentRecord for demo user
  const existingBuy = await prisma.buyOrder.findFirst({ where: { userId: demoUser.id } });
  if (!existingBuy) {
    const buyOrder = await prisma.buyOrder.create({
      data: {
        orderNumber: 'ORD-BUY-10001',
        userId: demoUser.id,
        coinAmount: '200.000000',
        pricePerCoinInr: '105.00',
        totalInr: '21000.00',
        paymentMethod: 'RAZORPAY_UPI',
        gatewayOrderId: 'order_seed_demo_9841',
        gatewayPaymentId: 'pay_seed_demo_4412',
        status: 'COMPLETED',
        receiptNumber: 'REC-BUY-10001',
      },
    });

    await prisma.paymentRecord.create({
      data: {
        userId: demoUser.id,
        buyOrderId: buyOrder.id,
        gateway: 'RAZORPAY',
        gatewayOrderId: 'order_seed_demo_9841',
        gatewayPaymentId: 'pay_seed_demo_4412',
        amountInr: '21000.00',
        currency: 'INR',
        method: 'UPI',
        status: 'CAPTURED',
        receiptNumber: 'REC-BUY-10001',
      },
    });

    const userWallet = await prisma.wallet.findUnique({ where: { userId: demoUser.id } });
    if (userWallet) {
      await prisma.transactionRecord.create({
        data: {
          txHash: '0x' + 'a'.repeat(32),
          userId: demoUser.id,
          walletId: userWallet.id,
          type: 'BUY_COIN',
          coinAmount: '+200.000000',
          fiatAmount: '21000.00 INR',
          balanceAfter: userWallet.coinBalance,
          description: 'Purchase of 200.000000 SIcoinX via Razorpay UPI',
          referenceId: buyOrder.id,
          status: 'CONFIRMED',
        },
      });
    }
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
