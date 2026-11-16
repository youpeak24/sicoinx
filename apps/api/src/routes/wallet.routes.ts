import { Router, Request, Response, NextFunction } from 'express';
import Decimal from 'decimal.js';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { WalletService } from '../lib/walletService';
import { logAuditEvent } from '../lib/audit';
import { transferCoinSchema } from '@sicoin/shared';

export const walletRouter = Router();

walletRouter.use(authenticateToken);

/**
 * GET /api/v1/wallet
 * Returns current user's digital coin wallet
 */
walletRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const wallet = await WalletService.getOrCreateUserWallet(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        kyc: {
          select: {
            status: true,
            idType: true,
            reviewedAt: true,
          },
        },
      },
    });

    const coin = await prisma.coinConfiguration.findFirst({
      where: { id: 'default-coin' },
    });

    const buyPriceInr = coin?.buyPriceInr || '105.00';
    const sellPriceInr = coin?.sellPriceInr || '100.00';
    const inrPerUsd = coin?.inrPerUsd || '84.00';

    const coinValuationInr = new Decimal(wallet.coinBalance).times(new Decimal(sellPriceInr)).toFixed(2);
    const coinValuationUsd = new Decimal(coinValuationInr).dividedBy(new Decimal(inrPerUsd)).toFixed(2);

    return res.json({
      success: true,
      data: {
        wallet,
        kycStatus: user?.kyc?.status || 'NOT_SUBMITTED',
        rates: {
          buyPriceInr,
          sellPriceInr,
          inrPerUsd,
        },
        valuation: {
          inr: coinValuationInr,
          usd: coinValuationUsd,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/wallet/transactions
 * Returns user's transaction history with pagination and type filtering
 */
walletRouter.get('/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const type = req.query.type as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (type && type !== 'ALL') {
      where.type = type;
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transactionRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transactionRecord.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/wallet/transfer
 * Transfers coins within approved ecosystem:
 * - INTERNAL_USER: to another SIcoinX user via email or wallet address
 * - ECOSYSTEM_APP: to connected platforms (YouPeak, YouPeak E-Commerce)
 */
walletRouter.post('/transfer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user!.id;
    const { destinationType, destinationApp, recipientIdentifier, coinAmount, note } =
      transferCoinSchema.parse(req.body);

    const config = await prisma.coinConfiguration.findFirst({
      where: { id: 'default-coin' },
    });

    if (config && !config.enableTransfers) {
      return res.status(400).json({
        success: false,
        error: { message: 'Coin transfers are temporarily suspended.' },
      });
    }

    const result = await WalletService.executeTransfer({
      senderId,
      destinationType,
      destinationApp,
      recipientIdentifier,
      amount: coinAmount,
      note,
    });

    await logAuditEvent({
      actorId: senderId,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'COIN_TRANSFER',
      entityType: 'EcosystemTransfer',
      entityId: result.transfer.id,
      details: {
        transferNumber: result.transfer.transferNumber,
        destinationType,
        destinationApp,
        recipientIdentifier,
        coinAmount,
      },
      req,
    });

    return res.json({
      success: true,
      message: `Successfully transferred ${coinAmount} SIcoinX.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/wallet/receipt/:referenceId
 * Generates structured receipt for transaction/order
 */
walletRouter.get('/receipt/:referenceId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { referenceId } = req.params;

    // Check if buy order
    const buyOrder = await prisma.buyOrder.findFirst({
      where: {
        OR: [{ id: referenceId }, { orderNumber: referenceId }, { receiptNumber: referenceId }],
        userId,
      },
      include: { user: true },
    });

    if (buyOrder) {
      const wallet = await WalletService.getOrCreateUserWallet(userId);
      return res.json({
        success: true,
        data: {
          receiptNumber: buyOrder.receiptNumber,
          orderNumber: buyOrder.orderNumber,
          type: 'BUY',
          date: buyOrder.createdAt,
          userName: buyOrder.user.name,
          userEmail: buyOrder.user.email,
          walletAddress: wallet.address,
          coinAmount: buyOrder.coinAmount,
          fiatAmount: `₹${buyOrder.totalInr}`,
          rate: `₹${buyOrder.pricePerCoinInr} / SI`,
          paymentGateway: 'Razorpay',
          paymentId: buyOrder.gatewayPaymentId || 'Verified',
          status: buyOrder.status,
          notes: 'SIcoinX official coin purchase receipt with immediate automated wallet credit.',
        },
      });
    }

    // Check if sell order
    const sellOrder = await prisma.sellOrder.findFirst({
      where: {
        OR: [{ id: referenceId }, { orderNumber: referenceId }, { receiptNumber: referenceId }],
        userId,
      },
      include: { user: true },
    });

    if (sellOrder) {
      const wallet = await WalletService.getOrCreateUserWallet(userId);
      return res.json({
        success: true,
        data: {
          receiptNumber: sellOrder.receiptNumber,
          orderNumber: sellOrder.orderNumber,
          type: 'SELL',
          date: sellOrder.createdAt,
          userName: sellOrder.user.name,
          userEmail: sellOrder.user.email,
          walletAddress: wallet.address,
          coinAmount: sellOrder.coinAmount,
          fiatAmount: `₹${sellOrder.totalInr}`,
          rate: `₹${sellOrder.pricePerCoinInr} / SI`,
          paymentGateway: 'Bank Wire / NEFT / IMPS',
          paymentId: sellOrder.settlementUtr || 'Pending Payout',
          status: sellOrder.status,
          notes: `Bank: ${sellOrder.bankName} (A/C: ****${sellOrder.accountNumber.slice(-4)})`,
        },
      });
    }

    // Check if ecosystem transfer
    const transfer = await prisma.ecosystemTransfer.findFirst({
      where: {
        AND: [
          { OR: [{ id: referenceId }, { transferNumber: referenceId }] },
          { OR: [{ senderId: userId }, { recipientUserId: userId }] },
        ],
      },
      include: { sender: true, recipient: true },
    });

    if (transfer) {
      return res.json({
        success: true,
        data: {
          receiptNumber: `REC-${transfer.transferNumber}`,
          orderNumber: transfer.transferNumber,
          type: 'TRANSFER',
          date: transfer.createdAt,
          userName: transfer.sender.name,
          userEmail: transfer.sender.email,
          walletAddress: transfer.senderWalletAddress,
          coinAmount: transfer.coinAmount,
          fiatAmount: 'N/A (Transfer)',
          rate: '1:1',
          paymentGateway: 'SIcoinX Ecosystem Internal Transfer',
          paymentId: transfer.transferNumber,
          status: transfer.status,
          notes: transfer.note || `Destination: ${transfer.destinationType}`,
        },
      });
    }

    return res.status(404).json({
      success: false,
      error: { message: 'Receipt not found for this transaction.' },
    });
  } catch (error) {
    next(error);
  }
});
