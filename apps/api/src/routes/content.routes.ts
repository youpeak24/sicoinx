import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const contentRouter = Router();

/**
 * GET /api/v1/content/announcements
 * Public announcements (only PUBLISHED and non-expired).
 */
contentRouter.get('/announcements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    });

    return res.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/content/announcements/banner
 * Returns the currently active top announcement banner.
 */
contentRouter.get('/announcements/banner', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const banner = await prisma.announcement.findFirst({
      where: {
        status: 'PUBLISHED',
        isFeaturedBanner: true,
        publishedAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { publishedAt: 'desc' },
    });

    return res.json({
      success: true,
      data: banner || {
        title: 'Explore the SI Coin ecosystem and project roadmap.',
        slug: 'welcome-to-si-coin-ecosystem',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/content/announcements/:slug
 */
contentRouter.get('/announcements/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const item = await prisma.announcement.findUnique({
      where: { slug },
    });

    if (!item || item.status !== 'PUBLISHED') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Announcement not found' },
      });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/content/faq
 */
contentRouter.get('/faq', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faqs = await prisma.faqItem.findMany({
      where: { isPublished: true },
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });

    return res.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/content/ecosystem
 */
contentRouter.get('/ecosystem', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const modules = await prisma.ecosystemModule.findMany({
      where: { isPublic: true },
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({
      success: true,
      data: modules,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/content/roadmap
 */
contentRouter.get('/roadmap', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestones = await prisma.roadmapMilestone.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({
      success: true,
      data: milestones.map((m: any) => ({
        ...m,
        milestones: JSON.parse(m.milestonesJson || '[]'),
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/content/whitepaper
 * Structured text sections and download metadata for the technical whitepaper.
 */
contentRouter.get('/whitepaper', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coin = await prisma.coinConfiguration.findFirst({
      where: { id: 'default-coin' },
    });

    const whitepaper = {
      title: 'SI Coin: Architecture for Verifiable Financial Transparency & Non-Custodial Utility',
      version: '1.2.0-Sepolia',
      lastRevisionDate: '2026-10-15',
      author: 'SI Protocol Research & Engineering Group',
      downloadUrl: coin?.whitepaperUrl || '/whitepaper',
      abstract: `
This paper specifies the mathematical foundations, tokenomic constraints, and non-custodial boundaries of SI Coin (SI). 
Addressing widespread systemic flaws in speculative digital assets—including unverified market-making algorithms, opaque insider allocations, and artificial high-yield schemes—SI Coin establishes an immutable standard for public disclosure, precision decimal arithmetic, and verifiable on-chain governance.
      `.trim(),
      sections: [
        {
          id: 'executive-summary',
          title: '1. Executive Summary & Design Principles',
          content: `SI Coin is designed from first principles to provide institutional certainty and transparent utility. The protocol enforces three architectural invariants: (1) Total supply is strictly capped at 100,000,000 SI; (2) Allocations require 100% mathematical reconciliation with public linear vesting schedules; (3) The protocol never acts as a custodial intermediary for user credentials, private keys, or seed phrases.`,
        },
        {
          id: 'token-mechanics',
          title: '2. Token Mechanics & Deterministic Supply',
          content: `All SI token operations adhere to the ERC-20 token standard with 6 decimal places of precision. Unlike inflationary tokens with uncapped mint privileges, the contract bytecode contains no administrative mint or retroactive dilution hooks. Circulating float is restricted to initial verifiable liquidity and development disbursements approved via multi-signature consensus.`,
        },
        {
          id: 'pricing-provenance',
          title: '3. Valuation Provenance & Reference Pricing',
          content: `To prevent fraudulent market cap claims, the SI Coin platform strictly separates administrator-set reference valuations, external oracle feeds, and actual decentralized liquidity pool prices. Historical observations are stored as immutable records with cryptographically signed actor IDs and explicit justification trails.`,
        },
        {
          id: 'security-boundaries',
          title: '4. Non-Custodial Boundaries & Challenge Authentication',
          content: `Interactions with Web3 wallets occur through EIP-4361 / EIP-712 challenge-response signatures. A single-use cryptographic nonce is generated by the server and signed locally by the user's wallet client, proving key ownership without exposing secrets or delegating custody to the platform.`,
        },
        {
          id: 'governance-roadmap',
          title: '5. Phased Decentralization & Governance Handover',
          content: `Protocol governance follows a four-phase progression: moving from initial core team development and formal security audits to community testnet validation, and ultimately arriving at decentralized on-chain voting with timelock controllers.`,
        },
      ],
    };

    return res.json({
      success: true,
      data: whitepaper,
    });
  } catch (error) {
    next(error);
  }
});
