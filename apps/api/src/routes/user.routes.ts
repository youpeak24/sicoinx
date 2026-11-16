import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { hashPassword, verifyPassword, generateRandomToken } from '../lib/security';
import { logAuditEvent } from '../lib/audit';
import {
  updateProfileSchema,
  changePasswordSchema,
  createTicketSchema,
  replyTicketSchema,
  walletLinkSchema,
} from '@sicoin/shared';

export const userRouter = Router();

userRouter.use(authenticateToken);

/**
 * GET /api/v1/user/profile
 */
userRouter.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        mfaEnabled: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/user/profile
 */
userRouter.patch('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = updateProfileSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        mfaEnabled: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'UPDATE_PROFILE',
      entityType: 'User',
      entityId: req.user!.id,
      req,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/user/change-password
 */
userRouter.post('/change-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect.' },
      });
    }

    const newHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user.id,
      req,
    });

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/user/wallets
 */
userRouter.get('/wallets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallets = await prisma.walletLink.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: wallets });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/user/wallets/challenge
 * Generates an expiring, single-use challenge token for Web3 wallet signature verification.
 */
userRouter.post('/wallets/challenge', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challenge = generateRandomToken(16);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationToken.create({
      data: {
        userId: req.user!.id,
        token: challenge,
        type: 'WALLET_CHALLENGE',
        expiresAt,
      },
    });

    const messageToSign = `SI Coin Authentication Challenge:\n\nWallet verification for account ${req.user!.email}\nNonce: ${challenge}\nTimestamp: ${new Date().toISOString()}\n\nSigning this message does not execute any transaction or grant custody.`;

    return res.json({
      success: true,
      data: {
        challengeToken: challenge,
        messageToSign,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/user/wallets/verify
 * Verifies the challenge and links the wallet address.
 */
userRouter.post('/wallets/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, chain, challengeToken } = walletLinkSchema.parse(req.body);

    if (challengeToken) {
      const tokenRecord = await prisma.verificationToken.findFirst({
        where: {
          token: challengeToken,
          userId: req.user!.id,
          type: 'WALLET_CHALLENGE',
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!tokenRecord) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_CHALLENGE', message: 'Challenge token is invalid or expired' },
        });
      }

      await prisma.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { isUsed: true },
      });
    }

    const wallet = await prisma.walletLink.upsert({
      where: {
        userId_address: {
          userId: req.user!.id,
          address: address.toLowerCase(),
        },
      },
      update: {
        isVerified: true,
        verifiedAt: new Date(),
        chain,
      },
      create: {
        userId: req.user!.id,
        address: address.toLowerCase(),
        chain,
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'WALLET_LINKED_AND_VERIFIED',
      entityType: 'WalletLink',
      entityId: wallet.id,
      details: { address: wallet.address, chain: wallet.chain },
      req,
    });

    return res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/user/wallets/:id
 */
userRouter.delete('/wallets/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const wallet = await prisma.walletLink.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!wallet) {
      return res.status(404).json({ success: false, error: { message: 'Wallet not found' } });
    }

    await prisma.walletLink.delete({ where: { id: wallet.id } });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'WALLET_DISCONNECTED',
      entityType: 'WalletLink',
      entityId: wallet.id,
      req,
    });

    return res.json({ success: true, message: 'Wallet disconnected.' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/user/portfolio
 * Deliberately separates:
 * 1. Verified on-chain balances (0.00 until mainnet / on-chain contract read)
 * 2. Internal simulated testnet entries (faucet allocations)
 * Does NOT mix them into a misleading single total!
 */
userRouter.get('/portfolio', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = await prisma.simulatedLedgerEntry.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    const testnetTotal = entries
      .filter((e: any) => e.status === 'CONFIRMED')
      .reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);

    const wallets = await prisma.walletLink.findMany({
      where: { userId: req.user!.id, isVerified: true },
    });

    return res.json({
      success: true,
      data: {
        verifiedOnChain: {
          balanceSi: '0.000000',
          balanceUsd: '0.00',
          notice: 'Requires mainnet token genesis. No mainnet custodian custody held by SI Coin.',
          network: 'Ethereum Mainnet (Planned)',
          activeWalletsCount: wallets.length,
        },
        simulatedTestnetLedger: {
          balanceSi: testnetTotal.toFixed(6),
          label: 'Sepolia Sandbox / Faucet Balance (Non-Monetary)',
          entriesCount: entries.length,
          lastEntryDate: entries[0]?.createdAt || null,
        },
        holdingsDistinctionNotice:
          'Account records and simulated testnet faucet claims do not constitute token custody or financial deposits.',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/user/activity
 */
userRouter.get('/activity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ledger = await prisma.simulatedLedgerEntry.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const wallets = await prisma.walletLink.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: {
        ledgerEntries: ledger,
        recentTickets: tickets,
        linkedWallets: wallets,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/user/faucet/claim
 * Allows claiming 100 testnet demonstration SI for developer testing.
 */
userRouter.post('/faucet/claim', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recentClaim = await prisma.simulatedLedgerEntry.findFirst({
      where: {
        userId: req.user!.id,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (recentClaim) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'FAUCET_COOLDOWN',
          message: 'Testnet faucet can be claimed once every 24 hours per account.',
        },
      });
    }

    const previousTotal = await prisma.simulatedLedgerEntry
      .findMany({ where: { userId: req.user!.id } })
      .then((items: any[]) => items.reduce((sum: number, i: any) => sum + parseFloat(i.amount), 0));

    const newTotal = (previousTotal + 100).toFixed(6);

    const entry = await prisma.simulatedLedgerEntry.create({
      data: {
        userId: req.user!.id,
        type: 'FAUCET_TESTNET_CLAIM',
        amount: '100.000000',
        balanceAfter: newTotal,
        reference: `Developer Sandbox Faucet Claim #${Math.floor(Math.random() * 90000) + 10000}`,
        status: 'CONFIRMED',
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Testnet Faucet Received',
        message: '100.000000 demonstration SI credited to your Sepolia sandbox ledger.',
        type: 'INFO',
        linkUrl: '/dashboard/portfolio',
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'TESTNET_FAUCET_CLAIM',
      entityType: 'SimulatedLedgerEntry',
      entityId: entry.id,
      details: { amount: '100.000000', newTotal },
      req,
    });

    return res.json({
      success: true,
      message: '100.000000 demonstration SI successfully allocated to your testnet balance.',
      data: entry,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/user/notifications
 */
userRouter.get('/notifications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/user/notifications/:id/read
 */
userRouter.patch('/notifications/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, userId: req.user!.id },
      data: { isRead: true },
    });

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/user/support/tickets
 */
userRouter.get('/support/tickets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/user/support/tickets
 */
userRouter.post('/support/tickets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createTicketSchema.parse(req.body);

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user!.id,
        userEmail: req.user!.email,
        userName: req.user!.name,
        subject: validated.subject,
        category: validated.category,
        priority: validated.priority,
        status: 'OPEN',
        messagesCount: 1,
        messages: {
          create: {
            authorId: req.user!.id,
            authorEmail: req.user!.email,
            authorName: req.user!.name,
            authorRole: req.user!.role,
            content: validated.message,
          },
        },
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'SUPPORT_TICKET_CREATED',
      entityType: 'SupportTicket',
      entityId: ticket.id,
      req,
    });

    return res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/user/support/tickets/:id
 */
userRouter.get('/support/tickets/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: req.user!.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
    }

    return res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/user/support/tickets/:id/reply
 */
userRouter.post('/support/tickets/:id/reply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = replyTicketSchema.parse(req.body);

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
    }

    if (ticket.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: { code: 'TICKET_CLOSED', message: 'Cannot reply to a closed ticket.' },
      });
    }

    const message = await prisma.$transaction(async (tx: any) => {
      const msg = await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          authorId: req.user!.id,
          authorEmail: req.user!.email,
          authorName: req.user!.name,
          authorRole: req.user!.role,
          content,
        },
      });

      await tx.supportTicket.update({
        where: { id: ticket.id },
        data: {
          messagesCount: { increment: 1 },
          lastReplyAt: new Date(),
          status: 'OPEN', // Re-open or keep open on user response
        },
      });

      return msg;
    });

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});
