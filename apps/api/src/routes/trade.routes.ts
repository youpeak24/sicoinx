import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Decimal from 'decimal.js';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { WalletService } from '../lib/walletService';
import { RazorpayService } from '../lib/razorpay';
import { logAuditEvent } from '../lib/audit';
import {
  buyCoinRequestSchema,
  verifyRazorpayPaymentSchema,
  sellCoinRequestSchema,
} from '@sicoin/shared';

export const tradeRouter = Router();

/**
 * GET /api/v1/trade/rates
 * Public / Authenticated: Returns current buying & selling price in INR and USD
 */
tradeRouter.get('/rates', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.coinConfiguration.findFirst({
      where: { id: 'default-coin' },
    });

    const buyPriceInr = config?.buyPriceInr || '105.00';
    const sellPriceInr = config?.sellPriceInr || '100.00';
    const inrPerUsd = config?.inrPerUsd || '84.00';

    const buyPriceUsd = new Decimal(buyPriceInr).dividedBy(inrPerUsd).toFixed(4);
    const sellPriceUsd = new Decimal(sellPriceInr).dividedBy(inrPerUsd).toFixed(4);

    return res.json({
      success: true,
      data: {
        tokenName: config?.tokenName || 'SI Coin',
        ticker: config?.ticker || 'SI',
        buyPriceInr,
        sellPriceInr,
        inrPerUsd,
        buyPriceUsd,
        sellPriceUsd,
        enableBuying: config?.enableBuying ?? true,
        enableSelling: config?.enableSelling ?? true,
        minBuyCoins: config?.minBuyCoins || '1',
        maxBuyCoins: config?.maxBuyCoins || '100000',
        minSellCoins: config?.minSellCoins || '1',
        maxSellCoins: config?.maxSellCoins || '50000',
        circulatingSupply: config?.circulatingSupply || '18500000',
        totalSupply: config?.totalSupply || '100000000',
        reserveSupply: config?.reserveSupply || '81500000',
      },
    });
  } catch (error) {
    next(error);
  }
});

// All following routes require authentication
tradeRouter.use(authenticateToken);

/**
 * POST /api/v1/trade/buy/create-order
 * Initiates Razorpay payment order for purchasing SIcoinX
 */
tradeRouter.post('/buy/create-order', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { coinAmount, paymentMethod } = buyCoinRequestSchema.parse(req.body);

    const config = await prisma.coinConfiguration.findFirst({
      where: { id: 'default-coin' },
    });

    if (config && !config.enableBuying) {
      return res.status(400).json({
        success: false,
        error: { message: 'Coin purchasing is temporarily paused by platform administrators.' },
      });
    }

    const buyPriceInr = config?.buyPriceInr || '105.00';
    const coins = new Decimal(coinAmount);
    const minCoins = new Decimal(config?.minBuyCoins || '1');
    const maxCoins = new Decimal(config?.maxBuyCoins || '100000');

    if (coins.lessThan(minCoins)) {
      return res.status(400).json({
        success: false,
        error: { message: `Minimum purchase amount is ${minCoins.toFixed(2)} SI coins` },
      });
    }

    if (coins.greaterThan(maxCoins)) {
      return res.status(400).json({
        success: false,
        error: { message: `Maximum single purchase limit is ${maxCoins.toFixed(2)} SI coins` },
      });
    }

    const totalInr = coins.times(new Decimal(buyPriceInr)).toFixed(2);
    const orderNumber = `ORD-BUY-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const receiptNumber = `REC-BUY-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // Create Razorpay payment order
    const rzpOrder = await RazorpayService.createOrder({
      amountInr: totalInr,
      receipt: receiptNumber,
      notes: {
        userId,
        orderNumber,
        coinAmount: coins.toFixed(6),
      },
    });

    // Save BuyOrder in DB
    const buyOrder = await prisma.buyOrder.create({
      data: {
        orderNumber,
        userId,
        coinAmount: coins.toFixed(6),
        pricePerCoinInr: buyPriceInr,
        totalInr,
        paymentMethod,
        gatewayOrderId: rzpOrder.id,
        status: 'PENDING',
        receiptNumber,
      },
    });

    // Create payment record
    await prisma.paymentRecord.create({
      data: {
        userId,
        buyOrderId: buyOrder.id,
        gateway: 'RAZORPAY',
        gatewayOrderId: rzpOrder.id,
        amountInr: totalInr,
        currency: 'INR',
        method: paymentMethod.replace('RAZORPAY_', ''),
        status: 'CREATED',
        receiptNumber,
      },
    });

    // Generate test signature for convenient testing in sandbox environments
    // Sandbox only: hand clients a matching payment id + HMAC signature so the simulated checkout
    // verifies cryptographically. Never expose this when live Razorpay credentials are configured.
    const sandbox = RazorpayService.isSandbox();
    const testPaymentId = `pay_${crypto.randomBytes(6).toString('hex')}`;
    const testSignature = sandbox ? RazorpayService.generateTestSignature(rzpOrder.id, testPaymentId) : undefined;

    return res.json({
      success: true,
      data: {
        buyOrderId: buyOrder.id,
        orderNumber: buyOrder.orderNumber,
        coinAmount: buyOrder.coinAmount,
        pricePerCoinInr: buyOrder.pricePerCoinInr,
        totalInr: buyOrder.totalInr,
        receiptNumber: buyOrder.receiptNumber,
        razorpayOrder: {
          id: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          keyId: rzpOrder.keyId,
        },
        ...(sandbox ? { testSignatureHelper: testSignature, testPaymentId } : {}), // sandbox-only helper for UI dev & tests
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/trade/buy/verify-payment
 * Verifies Razorpay payment signature & automatically credits SIcoinX to user wallet
 */
tradeRouter.post('/buy/verify-payment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { buyOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      verifyRazorpayPaymentSchema.parse(req.body);

    const buyOrder = await prisma.buyOrder.findUnique({
      where: { id: buyOrderId },
      include: { user: true },
    });

    if (!buyOrder || buyOrder.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: { message: 'Buy order not found' },
      });
    }

    if (buyOrder.status === 'COMPLETED') {
      const wallet = await WalletService.getOrCreateUserWallet(userId);
      return res.json({
        success: true,
        message: 'Order already completed and coins credited.',
        data: {
          buyOrder,
          wallet,
        },
      });
    }

    // Verify signature
    const isValid = RazorpayService.verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      await prisma.buyOrder.update({
        where: { id: buyOrderId },
        data: {
          status: 'FAILED',
          failureReason: 'Invalid Razorpay payment cryptographic signature verification',
        },
      });

      return res.status(400).json({
        success: false,
        error: { message: 'Payment signature verification failed. Transaction flagged.' },
      });
    }

    // Signature verified! Atomically credit coins to user wallet
    const { wallet, transaction } = await WalletService.creditCoins({
      userId,
      amount: buyOrder.coinAmount,
      type: 'BUY_COIN',
      referenceId: buyOrder.id,
      description: `Purchase of ${buyOrder.coinAmount} SIcoinX via Razorpay (${buyOrder.orderNumber})`,
      fiatAmount: `${buyOrder.totalInr} INR`,
      metadata: {
        razorpayOrderId,
        razorpayPaymentId,
        orderNumber: buyOrder.orderNumber,
        receiptNumber: buyOrder.receiptNumber,
      },
    });

    // Update buy order to COMPLETED
    const updatedOrder = await prisma.buyOrder.update({
      where: { id: buyOrderId },
      data: {
        status: 'COMPLETED',
        gatewayOrderId: razorpayOrderId,
        gatewayPaymentId: razorpayPaymentId,
      },
    });

    // Update or create payment record to CAPTURED
    await prisma.paymentRecord.upsert({
      where: { id: buyOrder.id }, // fallback lookup or create
      update: {
        status: 'CAPTURED',
        gatewayPaymentId: razorpayPaymentId,
        gatewaySignature: razorpaySignature,
      },
      create: {
        userId,
        buyOrderId: buyOrder.id,
        gateway: 'RAZORPAY',
        gatewayOrderId: razorpayOrderId,
        gatewayPaymentId: razorpayPaymentId,
        gatewaySignature: razorpaySignature,
        amountInr: buyOrder.totalInr,
        currency: 'INR',
        method: buyOrder.paymentMethod.replace('RAZORPAY_', ''),
        status: 'CAPTURED',
        receiptNumber: buyOrder.receiptNumber,
      },
    });

    // Create user notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Coins Purchased Successfully!',
        message: `Your payment of ₹${buyOrder.totalInr} was verified. ${buyOrder.coinAmount} SIcoinX credited to your wallet.`,
        type: 'SUCCESS',
        linkUrl: `/dashboard/transactions`,
      },
    });

    await logAuditEvent({
      actorId: userId,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'BUY_COIN_SUCCESS',
      entityType: 'BuyOrder',
      entityId: buyOrder.id,
      details: {
        orderNumber: buyOrder.orderNumber,
        coinAmount: buyOrder.coinAmount,
        totalInr: buyOrder.totalInr,
        txHash: transaction.txHash,
      },
      req,
    });

    return res.json({
      success: true,
      message: 'Payment verified and coins successfully credited to your wallet!',
      data: {
        buyOrder: updatedOrder,
        wallet,
        transaction,
        receipt: {
          receiptNumber: buyOrder.receiptNumber,
          orderNumber: buyOrder.orderNumber,
          date: updatedOrder.updatedAt,
          coinAmount: buyOrder.coinAmount,
          totalInr: buyOrder.totalInr,
          pricePerCoinInr: buyOrder.pricePerCoinInr,
          gatewayPaymentId: razorpayPaymentId,
          status: 'COMPLETED',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/trade/buy/orders
 * Returns user's coin purchase orders
 */
tradeRouter.get('/buy/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const orders = await prisma.buyOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/trade/sell/request
 * Submits selling request: Debits coins from user wallet, holds for bank payout settlement
 */
tradeRouter.post('/sell/request', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { coinAmount, bankAccountName, bankName, accountNumber, ifscCode } =
      sellCoinRequestSchema.parse(req.body);

    const config = await prisma.coinConfiguration.findFirst({
      where: { id: 'default-coin' },
    });

    if (config && !config.enableSelling) {
      return res.status(400).json({
        success: false,
        error: { message: 'Coin selling / withdrawal is temporarily paused.' },
      });
    }

    const sellPriceInr = config?.sellPriceInr || '100.00';
    const coins = new Decimal(coinAmount);
    const minCoins = new Decimal(config?.minSellCoins || '1');
    const maxCoins = new Decimal(config?.maxSellCoins || '50000');

    if (coins.lessThan(minCoins)) {
      return res.status(400).json({
        success: false,
        error: { message: `Minimum sell amount is ${minCoins.toFixed(2)} SI coins` },
      });
    }

    if (coins.greaterThan(maxCoins)) {
      return res.status(400).json({
        success: false,
        error: { message: `Maximum single sell limit is ${maxCoins.toFixed(2)} SI coins` },
      });
    }

    const totalInr = coins.times(new Decimal(sellPriceInr)).toFixed(2);
    const orderNumber = `ORD-SELL-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const receiptNumber = `REC-SELL-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // Debit coins from user wallet into pending settlement
    const { wallet, transaction } = await WalletService.debitCoins({
      userId,
      amount: coins.toFixed(6),
      type: 'SELL_COIN',
      description: `Sell order placed for ${coins.toFixed(6)} SIcoinX to Bank (${bankName})`,
      fiatAmount: `${totalInr} INR`,
      metadata: {
        orderNumber,
        receiptNumber,
        bankAccountName,
        bankName,
        ifscCode,
        accountMasked: `****${accountNumber.slice(-4)}`,
      },
    });

    // Create SellOrder
    const sellOrder = await prisma.sellOrder.create({
      data: {
        orderNumber,
        userId,
        coinAmount: coins.toFixed(6),
        pricePerCoinInr: sellPriceInr,
        totalInr,
        bankAccountName,
        bankName,
        accountNumber,
        ifscCode,
        status: 'PENDING',
        receiptNumber,
      },
    });

    // Create user notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Sell Request Submitted',
        message: `Your request to sell ${coins.toFixed(6)} SI coins for ₹${totalInr} is under review for bank transfer.`,
        type: 'INFO',
        linkUrl: `/dashboard/transactions`,
      },
    });

    await logAuditEvent({
      actorId: userId,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'SELL_COIN_REQUESTED',
      entityType: 'SellOrder',
      entityId: sellOrder.id,
      details: {
        orderNumber,
        coinAmount: coins.toFixed(6),
        totalInr,
        txHash: transaction.txHash,
      },
      req,
    });

    return res.json({
      success: true,
      message: 'Sell request submitted successfully. Payout will be processed to your bank account.',
      data: {
        sellOrder,
        wallet,
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/trade/sell/orders
 * Returns user's sell / withdrawal requests
 */
tradeRouter.get('/sell/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const orders = await prisma.sellOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});
