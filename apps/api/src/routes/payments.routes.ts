import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { WalletService } from '../lib/walletService';

export const paymentsRouter = Router();

/**
 * POST /api/v1/payments/webhook
 * Razorpay Webhook Handler
 */
paymentsRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'sicoinx_webhook_secret';
    const signature = req.headers['x-razorpay-signature'] as string;

    if (signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const event = req.body.event;
    const payment = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && payment) {
      const orderId = payment.order_id;
      const buyOrder = await prisma.buyOrder.findFirst({
        where: { gatewayOrderId: orderId },
      });

      if (buyOrder && buyOrder.status === 'PENDING') {
        await WalletService.creditCoins({
          userId: buyOrder.userId,
          amount: buyOrder.coinAmount,
          type: 'BUY_COIN',
          referenceId: buyOrder.id,
          description: `Automatic credit via Razorpay Webhook (${payment.id})`,
          fiatAmount: `${buyOrder.totalInr} INR`,
        });

        await prisma.buyOrder.update({
          where: { id: buyOrder.id },
          data: {
            status: 'COMPLETED',
            gatewayPaymentId: payment.id,
          },
        });

        await prisma.paymentRecord.updateMany({
          where: { gatewayOrderId: orderId },
          data: {
            status: 'CAPTURED',
            gatewayPaymentId: payment.id,
          },
        });
      }
    }

    return res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ status: 'error' });
  }
});

/**
 * GET /api/v1/payments
 * User's payment records
 */
paymentsRouter.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const payments = await prisma.paymentRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});
