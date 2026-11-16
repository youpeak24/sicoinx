import crypto from 'crypto';
import Decimal from 'decimal.js';
import { prisma } from './prisma';
import { TransactionType } from '@sicoin/shared';

export class WalletService {
  /**
   * Generate unique SIcoinX address (e.g. SICX-A84D-B290-7F1C)
   */
  public static generateWalletAddress(): string {
    const raw = crypto.randomBytes(6).toString('hex').toUpperCase();
    return `SICX-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
  }

  /**
   * Get or automatically create user's digital wallet
   */
  public static async getOrCreateUserWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Create initial wallet with zero balance
      wallet = await prisma.wallet.create({
        data: {
          userId,
          address: this.generateWalletAddress(),
          coinBalance: '0.000000',
          inrBalance: '0.00',
          isFrozen: false,
        },
      });
    }

    return wallet;
  }

  /**
   * Atomically credit coins to user's wallet
   */
  public static async creditCoins(params: {
    userId: string;
    amount: string;
    type: TransactionType;
    referenceId?: string;
    description: string;
    fiatAmount?: string;
    metadata?: Record<string, any>;
  }) {
    const { userId, amount, type, referenceId, description, fiatAmount, metadata } = params;

    return await prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId,
            address: this.generateWalletAddress(),
            coinBalance: '0.000000',
            inrBalance: '0.00',
          },
        });
      }

      if (wallet.isFrozen) {
        throw new Error('Wallet is frozen. Cannot credit funds.');
      }

      const currentBalance = new Decimal(wallet.coinBalance);
      const creditAmount = new Decimal(amount);
      const newBalance = currentBalance.plus(creditAmount).toFixed(6);

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { coinBalance: newBalance },
      });

      // Create transaction record
      const txHash = '0x' + crypto.randomBytes(16).toString('hex');
      const txRecord = await tx.transactionRecord.create({
        data: {
          txHash,
          userId,
          walletId: wallet.id,
          type,
          coinAmount: `+${creditAmount.toFixed(6)}`,
          fiatAmount,
          balanceAfter: newBalance,
          description,
          referenceId,
          status: 'CONFIRMED',
          metadataJson: metadata ? JSON.stringify(metadata) : null,
        },
      });

      // Update coin configuration circulating supply if buy
      if (type === 'BUY_COIN') {
        const coin = await tx.coinConfiguration.findFirst({ where: { id: 'default-coin' } });
        if (coin) {
          const newCirc = new Decimal(coin.circulatingSupply).plus(creditAmount).toFixed(0);
          const newRes = new Decimal(coin.reserveSupply).minus(creditAmount).toFixed(0);
          await tx.coinConfiguration.update({
            where: { id: 'default-coin' },
            data: {
              circulatingSupply: newCirc,
              reserveSupply: newRes,
            },
          });
        }
      }

      return { wallet: updatedWallet, transaction: txRecord };
    });
  }

  /**
   * Atomically debit coins from user's wallet
   */
  public static async debitCoins(params: {
    userId: string;
    amount: string;
    type: TransactionType;
    referenceId?: string;
    description: string;
    fiatAmount?: string;
    metadata?: Record<string, any>;
  }) {
    const { userId, amount, type, referenceId, description, fiatAmount, metadata } = params;

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error('User wallet not found');
      }

      if (wallet.isFrozen) {
        throw new Error('Wallet is frozen. Cannot debit funds.');
      }

      const currentBalance = new Decimal(wallet.coinBalance);
      const debitAmount = new Decimal(amount);

      if (currentBalance.lessThan(debitAmount)) {
        throw new Error(`Insufficient SIcoinX balance. Current: ${currentBalance.toFixed(6)}, Required: ${debitAmount.toFixed(6)}`);
      }

      const newBalance = currentBalance.minus(debitAmount).toFixed(6);

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { coinBalance: newBalance },
      });

      // Create transaction record
      const txHash = '0x' + crypto.randomBytes(16).toString('hex');
      const txRecord = await tx.transactionRecord.create({
        data: {
          txHash,
          userId,
          walletId: wallet.id,
          type,
          coinAmount: `-${debitAmount.toFixed(6)}`,
          fiatAmount,
          balanceAfter: newBalance,
          description,
          referenceId,
          status: 'CONFIRMED',
          metadataJson: metadata ? JSON.stringify(metadata) : null,
        },
      });

      // Update coin configuration circulating supply if sell
      if (type === 'SELL_COIN') {
        const coin = await tx.coinConfiguration.findFirst({ where: { id: 'default-coin' } });
        if (coin) {
          const newCirc = new Decimal(coin.circulatingSupply).minus(debitAmount).toFixed(0);
          const newRes = new Decimal(coin.reserveSupply).plus(debitAmount).toFixed(0);
          await tx.coinConfiguration.update({
            where: { id: 'default-coin' },
            data: {
              circulatingSupply: newCirc,
              reserveSupply: newRes,
            },
          });
        }
      }

      return { wallet: updatedWallet, transaction: txRecord };
    });
  }

  /**
   * Transfer coins within ecosystem (Internal user or YouPeak / YouPeak E-Commerce)
   */
  public static async executeTransfer(params: {
    senderId: string;
    destinationType: 'INTERNAL_USER' | 'ECOSYSTEM_APP';
    destinationApp?: 'YOUPEAK' | 'YOUPEAK_ECOMMERCE' | 'OTHER';
    recipientIdentifier: string;
    amount: string;
    note?: string;
  }) {
    const { senderId, destinationType, destinationApp, recipientIdentifier, amount, note } = params;
    const transferAmount = new Decimal(amount);

    if (transferAmount.lessThanOrEqualTo(0)) {
      throw new Error('Transfer amount must be greater than zero');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Verify Sender Wallet
      const senderWallet = await tx.wallet.findUnique({
        where: { userId: senderId },
        include: { user: true },
      });

      if (!senderWallet) {
        throw new Error('Sender wallet not found');
      }

      if (senderWallet.isFrozen) {
        throw new Error('Sender wallet is frozen');
      }

      const senderBalance = new Decimal(senderWallet.coinBalance);
      if (senderBalance.lessThan(transferAmount)) {
        throw new Error(`Insufficient balance. Current balance is ${senderBalance.toFixed(6)} SI`);
      }

      const transferNumber = `TRF-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

      if (destinationType === 'INTERNAL_USER') {
        // Find recipient by email or wallet address
        const recipientUser = await tx.user.findFirst({
          where: {
            OR: [
              { email: recipientIdentifier.toLowerCase().trim() },
              { sicoinWallet: { address: recipientIdentifier.trim() } },
            ],
          },
          include: { sicoinWallet: true },
        });

        if (!recipientUser) {
          throw new Error(`Recipient with email or wallet address '${recipientIdentifier}' not found`);
        }

        if (recipientUser.id === senderId) {
          throw new Error('Cannot transfer coins to your own wallet');
        }

        let recipientWallet = recipientUser.sicoinWallet;
        if (!recipientWallet) {
          recipientWallet = await tx.wallet.create({
            data: {
              userId: recipientUser.id,
              address: this.generateWalletAddress(),
              coinBalance: '0.000000',
              inrBalance: '0.00',
            },
          });
        }

        if (recipientWallet.isFrozen) {
          throw new Error('Recipient wallet is frozen and cannot receive funds');
        }

        // Debit sender
        const newSenderBalance = senderBalance.minus(transferAmount).toFixed(6);
        await tx.wallet.update({
          where: { id: senderWallet.id },
          data: { coinBalance: newSenderBalance },
        });

        // Credit recipient
        const recipientCurrentBalance = new Decimal(recipientWallet.coinBalance);
        const newRecipientBalance = recipientCurrentBalance.plus(transferAmount).toFixed(6);
        await tx.wallet.update({
          where: { id: recipientWallet.id },
          data: { coinBalance: newRecipientBalance },
        });

        // Create transfer record
        const transferRecord = await tx.ecosystemTransfer.create({
          data: {
            transferNumber,
            senderId,
            senderWalletAddress: senderWallet.address,
            destinationType: 'INTERNAL_USER',
            recipientEmail: recipientUser.email,
            recipientWalletAddress: recipientWallet.address,
            recipientUserId: recipientUser.id,
            coinAmount: transferAmount.toFixed(6),
            note: note || null,
            status: 'CONFIRMED',
          },
        });

        // Create sender transaction record (TRANSFER_OUT)
        await tx.transactionRecord.create({
          data: {
            txHash: '0x' + crypto.randomBytes(16).toString('hex'),
            userId: senderId,
            walletId: senderWallet.id,
            type: 'TRANSFER_OUT',
            coinAmount: `-${transferAmount.toFixed(6)}`,
            balanceAfter: newSenderBalance,
            description: `Transfer to ${recipientUser.name || recipientUser.email}`,
            referenceId: transferRecord.id,
            status: 'CONFIRMED',
          },
        });

        // Create recipient transaction record (TRANSFER_IN)
        await tx.transactionRecord.create({
          data: {
            txHash: '0x' + crypto.randomBytes(16).toString('hex'),
            userId: recipientUser.id,
            walletId: recipientWallet.id,
            type: 'TRANSFER_IN',
            coinAmount: `+${transferAmount.toFixed(6)}`,
            balanceAfter: newRecipientBalance,
            description: `Transfer received from ${senderWallet.user.name || senderWallet.user.email}`,
            referenceId: transferRecord.id,
            status: 'CONFIRMED',
          },
        });

        return { transfer: transferRecord, newBalance: newSenderBalance };
      } else {
        // Connected Ecosystem App Transfer (YouPeak or YouPeak E-Commerce)
        const appName = destinationApp === 'YOUPEAK' ? 'YouPeak' : destinationApp === 'YOUPEAK_ECOMMERCE' ? 'YouPeak E-Commerce' : (destinationApp || 'Connected App');

        const newSenderBalance = senderBalance.minus(transferAmount).toFixed(6);
        await tx.wallet.update({
          where: { id: senderWallet.id },
          data: { coinBalance: newSenderBalance },
        });

        const transferRecord = await tx.ecosystemTransfer.create({
          data: {
            transferNumber,
            senderId,
            senderWalletAddress: senderWallet.address,
            destinationType: 'ECOSYSTEM_APP',
            destinationApp: destinationApp || 'YOUPEAK',
            recipientEmail: recipientIdentifier,
            coinAmount: transferAmount.toFixed(6),
            note: note || `Transfer to ${appName} account ${recipientIdentifier}`,
            status: 'CONFIRMED',
          },
        });

        await tx.transactionRecord.create({
          data: {
            txHash: '0x' + crypto.randomBytes(16).toString('hex'),
            userId: senderId,
            walletId: senderWallet.id,
            type: 'ECOSYSTEM_DEBIT',
            coinAmount: `-${transferAmount.toFixed(6)}`,
            balanceAfter: newSenderBalance,
            description: `Connected App Transfer to ${appName} (${recipientIdentifier})`,
            referenceId: transferRecord.id,
            status: 'CONFIRMED',
          },
        });

        return { transfer: transferRecord, newBalance: newSenderBalance };
      }
    });
  }
}
