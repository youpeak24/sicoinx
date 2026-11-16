import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { WalletService } from '../lib/walletService';
import { partnerDebitSchema, partnerCreditSchema } from '@sicoin/shared';

export const ecosystemPartnerRouter = Router();

/**
 * Middleware: Verify Ecosystem Partner API Key
 */
const authenticatePartner = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = (req.headers['x-partner-key'] || req.query.apiKey) as string;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: { message: 'Missing X-Partner-Key header for ecosystem partner API authentication.' },
    });
  }

  try {
    const partner = await prisma.ecosystemPartner.findUnique({
      where: { apiKey },
    });

    if (!partner || partner.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: { message: 'Invalid or inactive Partner API Key.' },
      });
    }

    (req as any).partner = partner;
    next();
  } catch (err) {
    next(err);
  }
};

ecosystemPartnerRouter.use(authenticatePartner);

/**
 * GET /api/v1/ecosystem/partner/verify-user/:identifier
 * Check if a user exists by email or SIcoinX wallet address
 */
ecosystemPartnerRouter.get('/verify-user/:identifier', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { sicoinWallet: { address: identifier.trim() } },
        ],
      },
      include: {
        sicoinWallet: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'SIcoinX user account not found.' },
      });
    }

    return res.json({
      success: true,
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        walletAddress: user.sicoinWallet?.address || null,
        isFrozen: user.sicoinWallet?.isFrozen || false,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/ecosystem/partner/balance/:identifier
 * Get current SIcoinX coin balance for a user
 */
ecosystemPartnerRouter.get('/balance/:identifier', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { sicoinWallet: { address: identifier.trim() } },
        ],
      },
      include: {
        sicoinWallet: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found.' },
      });
    }

    const wallet = user.sicoinWallet || (await WalletService.getOrCreateUserWallet(user.id));

    return res.json({
      success: true,
      data: {
        userId: user.id,
        walletAddress: wallet.address,
        coinBalance: wallet.coinBalance,
        isFrozen: wallet.isFrozen,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/ecosystem/partner/debit
 * Deduct SIcoinX for a purchase in YouPeak or YouPeak E-Commerce
 */
ecosystemPartnerRouter.post('/debit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const partner = (req as any).partner;
    const { userIdentifier, coinAmount, orderReference, description } = partnerDebitSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userIdentifier.toLowerCase().trim() },
          { sicoinWallet: { address: userIdentifier.trim() } },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found.' },
      });
    }

    const debitResult = await WalletService.debitCoins({
      userId: user.id,
      amount: coinAmount,
      type: 'ECOSYSTEM_DEBIT',
      referenceId: orderReference,
      description: description || `Payment on ${partner.appName} (Order: ${orderReference})`,
      metadata: {
        partnerSlug: partner.slug,
        partnerAppName: partner.appName,
        orderReference,
      },
    });

    return res.json({
      success: true,
      message: `Successfully debited ${coinAmount} SIcoinX for ${partner.appName} checkout.`,
      data: {
        txHash: debitResult.transaction.txHash,
        balanceAfter: debitResult.wallet.coinBalance,
        orderReference,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/ecosystem/partner/credit
 * Award reward/cashback SIcoinX to user from YouPeak / YouPeak E-Commerce
 */
ecosystemPartnerRouter.post('/credit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const partner = (req as any).partner;
    const { userIdentifier, coinAmount, reference, description } = partnerCreditSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userIdentifier.toLowerCase().trim() },
          { sicoinWallet: { address: userIdentifier.trim() } },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found.' },
      });
    }

    const creditResult = await WalletService.creditCoins({
      userId: user.id,
      amount: coinAmount,
      type: 'ECOSYSTEM_CREDIT',
      referenceId: reference,
      description: description || `Reward credited from ${partner.appName} (${reference})`,
      metadata: {
        partnerSlug: partner.slug,
        partnerAppName: partner.appName,
        reference,
      },
    });

    return res.json({
      success: true,
      message: `Successfully credited ${coinAmount} SIcoinX to user.`,
      data: {
        txHash: creditResult.transaction.txHash,
        balanceAfter: creditResult.wallet.coinBalance,
        reference,
      },
    });
  } catch (error) {
    next(error);
  }
});
