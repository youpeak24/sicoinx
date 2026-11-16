import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

export interface BuyOrderRecord {
  id: string;
  orderNumber: string;
  coinAmount: string;
  pricePerCoinUsd: string;
  pricePerCoinInr: string;
  totalUsd: string;
  totalInr: string;
  currency: 'USD' | 'INR' | 'EUR';
  paymentMethod: 'UPI' | 'CARD' | 'CRYPTO' | 'BANK_WIRE';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  receiptNumber: string;
  txHash: string;
  bonusCoins: string;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  txHash: string;
  type: 'BUY_COIN' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'FAUCET_CLAIM';
  title: string;
  coinAmount: string;
  fiatValueUsd: string;
  timestamp: string;
  status: 'CONFIRMED' | 'PENDING';
  counterparty?: string;
  note?: string;
}

export interface KycStatus {
  status: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  fullName?: string;
  idType?: string;
  idNumber?: string;
  submittedAt?: string;
  tier: number; // 1 or 2
}

interface WalletContextType {
  coinBalance: number;
  inrBalance: number;
  usdBalance: number;
  referencePriceUsd: number;
  referencePriceInr: number;
  primaryWalletAddress: string;
  recentOrders: BuyOrderRecord[];
  transactions: TransactionItem[];
  kyc: KycStatus;
  isLoading: boolean;
  buyCoins: (params: {
    coinAmount: number;
    currency: 'USD' | 'INR' | 'EUR';
    paymentMethod: 'UPI' | 'CARD' | 'CRYPTO' | 'BANK_WIRE';
    bonusCoins?: number;
    cardDetails?: { name: string; number: string; expiry: string };
    upiId?: string;
    cryptoNetwork?: string;
  }) => Promise<BuyOrderRecord>;
  transferCoins: (params: {
    recipientAddress: string;
    amount: number;
    note?: string;
  }) => Promise<TransactionItem>;
  claimFaucet: () => Promise<string>;
  submitKyc: (data: { fullName: string; idType: string; idNumber: string }) => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'sicoin_wallet_state_';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;

  // Default values
  const referencePriceUsd = 1.250000;
  const referencePriceInr = 105.00;

  const [coinBalance, setCoinBalance] = useState<number>(() => {
    const saved = localStorage.getItem(`${storageKey}_balance`);
    return saved !== null ? parseFloat(saved) : 1250.000000;
  });

  const [primaryWalletAddress] = useState<string>(() => {
    const saved = localStorage.getItem(`${storageKey}_address`);
    if (saved) return saved;
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const addr = `SICX-A8F2-${rand}-4E11`;
    localStorage.setItem(`${storageKey}_address`, addr);
    return addr;
  });

  const [recentOrders, setRecentOrders] = useState<BuyOrderRecord[]>(() => {
    const saved = localStorage.getItem(`${storageKey}_orders`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'ord-init-1',
        orderNumber: 'ORD-BUY-10821',
        coinAmount: '500.000000',
        pricePerCoinUsd: '1.250000',
        pricePerCoinInr: '105.00',
        totalUsd: '625.00',
        totalInr: '52500.00',
        currency: 'USD',
        paymentMethod: 'CARD',
        status: 'COMPLETED',
        receiptNumber: 'REC-BUY-10821',
        txHash: '0x8f2a991b34e56cd89123fe45ba78c901ee22',
        bonusCoins: '10.000000',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ord-init-2',
        orderNumber: 'ORD-BUY-10742',
        coinAmount: '750.000000',
        pricePerCoinUsd: '1.250000',
        pricePerCoinInr: '105.00',
        totalUsd: '937.50',
        totalInr: '78750.00',
        currency: 'USD',
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        receiptNumber: 'REC-BUY-10742',
        txHash: '0x3c49e81b2390aefd918237cb10982df09a12',
        bonusCoins: '37.500000',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    const saved = localStorage.getItem(`${storageKey}_txs`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'tx-1',
        txHash: '0x8f2a991b34e56cd89123fe45ba78c901ee22',
        type: 'BUY_COIN',
        title: 'Purchased 500 SI (+10 SI Bonus)',
        coinAmount: '+510.000000',
        fiatValueUsd: '$625.00',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'CONFIRMED',
        counterparty: 'Card Gateway (Stripe / Visa)',
      },
      {
        id: 'tx-2',
        txHash: '0x3c49e81b2390aefd918237cb10982df09a12',
        type: 'BUY_COIN',
        title: 'Purchased 750 SI (+37.5 SI Bonus)',
        coinAmount: '+787.500000',
        fiatValueUsd: '$937.50',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'CONFIRMED',
        counterparty: 'UPI Onramp Instant Pay',
      },
      {
        id: 'tx-3',
        txHash: '0x12a9e88cfb120934ec8109d984bc87123aa4',
        type: 'FAUCET_CLAIM',
        title: 'Developer Testnet Faucet Allocation',
        coinAmount: '+100.000000',
        fiatValueUsd: '$125.00',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'CONFIRMED',
        counterparty: 'Sepolia Faucet Dispenser',
      },
    ];
  });

  const [kyc, setKyc] = useState<KycStatus>(() => {
    const saved = localStorage.getItem(`${storageKey}_kyc`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      status: 'VERIFIED',
      fullName: user?.name || 'Verified Explorer',
      idType: 'PASSPORT',
      idNumber: 'P792019482',
      submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      tier: 2,
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${storageKey}_balance`, coinBalance.toString());
  }, [coinBalance, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}_orders`, JSON.stringify(recentOrders));
  }, [recentOrders, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}_txs`, JSON.stringify(transactions));
  }, [transactions, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}_kyc`, JSON.stringify(kyc));
  }, [kyc, storageKey]);

  const refreshWallet = async () => {
    setIsLoading(true);
    try {
      // Try fetching portfolio from API if available
      const portfolioData = await api.get('/user/portfolio');
      if (portfolioData?.simulatedTestnetLedger?.balanceSi) {
        const remoteSi = parseFloat(portfolioData.simulatedTestnetLedger.balanceSi);
        if (!isNaN(remoteSi) && remoteSi > 0) {
          // If remote is higher or present, reflect
          setCoinBalance((prev) => Math.max(prev, remoteSi));
        }
      }
    } catch {
      // Graceful fallback to local state
    } finally {
      setIsLoading(false);
    }
  };

  const buyCoins = async (params: {
    coinAmount: number;
    currency: 'USD' | 'INR' | 'EUR';
    paymentMethod: 'UPI' | 'CARD' | 'CRYPTO' | 'BANK_WIRE';
    bonusCoins?: number;
    cardDetails?: { name: string; number: string; expiry: string };
    upiId?: string;
    cryptoNetwork?: string;
  }): Promise<BuyOrderRecord> => {
    setIsLoading(true);

    const bonus = params.bonusCoins || 0;
    const totalCredit = params.coinAmount + bonus;
    const totalUsd = (params.coinAmount * referencePriceUsd).toFixed(2);
    const totalInr = (params.coinAmount * referencePriceInr).toFixed(2);

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-BUY-${randomSuffix}`;
    const receiptNumber = `REC-BUY-${randomSuffix}`;
    const txHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newOrder: BuyOrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber,
      coinAmount: params.coinAmount.toFixed(6),
      pricePerCoinUsd: referencePriceUsd.toFixed(6),
      pricePerCoinInr: referencePriceInr.toFixed(2),
      totalUsd,
      totalInr,
      currency: params.currency,
      paymentMethod: params.paymentMethod,
      status: 'COMPLETED',
      receiptNumber,
      txHash,
      bonusCoins: bonus.toFixed(6),
      createdAt: new Date().toISOString(),
    };

    const newTx: TransactionItem = {
      id: `tx-${Date.now()}`,
      txHash,
      type: 'BUY_COIN',
      title: `Purchased ${params.coinAmount} SI${bonus > 0 ? ` (+${bonus.toFixed(2)} SI Bonus)` : ''}`,
      coinAmount: `+${totalCredit.toFixed(6)}`,
      fiatValueUsd: `$${totalUsd}`,
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED',
      counterparty: `${params.paymentMethod} Payment`,
      note: `Order ${orderNumber}`,
    };

    // Simulate backend call if available
    try {
      await api.post('/user/activity', {
        type: 'BUY_COIN',
        amount: totalCredit.toString(),
        orderNumber,
      });
    } catch {
      // Local execution fallback
    }

    // Update state
    setCoinBalance((prev) => prev + totalCredit);
    setRecentOrders((prev) => [newOrder, ...prev]);
    setTransactions((prev) => [newTx, ...prev]);
    setIsLoading(false);

    return newOrder;
  };

  const transferCoins = async (params: {
    recipientAddress: string;
    amount: number;
    note?: string;
  }): Promise<TransactionItem> => {
    if (params.amount > coinBalance) {
      throw new Error(`Insufficient SI balance. Available: ${coinBalance.toFixed(6)} SI`);
    }

    setIsLoading(true);
    const txHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newTx: TransactionItem = {
      id: `tx-${Date.now()}`,
      txHash,
      type: 'TRANSFER_OUT',
      title: `Transfer to ${params.recipientAddress.substring(0, 10)}...`,
      coinAmount: `-${params.amount.toFixed(6)}`,
      fiatValueUsd: `$${(params.amount * referencePriceUsd).toFixed(2)}`,
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED',
      counterparty: params.recipientAddress,
      note: params.note || 'Peer Transfer',
    };

    setCoinBalance((prev) => prev - params.amount);
    setTransactions((prev) => [newTx, ...prev]);
    setIsLoading(false);

    return newTx;
  };

  const claimFaucet = async (): Promise<string> => {
    setIsLoading(true);
    try {
      // Try backend faucet claim
      await api.post('/user/faucet/claim');
    } catch {
      // Allow demo faucet claim locally
    }

    const txHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newTx: TransactionItem = {
      id: `tx-${Date.now()}`,
      txHash,
      type: 'FAUCET_CLAIM',
      title: 'Sepolia Testnet Faucet (+100 SI)',
      coinAmount: '+100.000000',
      fiatValueUsd: '$125.00',
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED',
      counterparty: 'Developer Testnet Faucet',
    };

    setCoinBalance((prev) => prev + 100);
    setTransactions((prev) => [newTx, ...prev]);
    setIsLoading(false);

    return '100.000000 demonstration SI successfully credited to your wallet balance!';
  };

  const submitKyc = async (data: { fullName: string; idType: string; idNumber: string }) => {
    setKyc({
      status: 'VERIFIED',
      fullName: data.fullName,
      idType: data.idType,
      idNumber: data.idNumber,
      submittedAt: new Date().toISOString(),
      tier: 2,
    });
  };

  const usdBalance = coinBalance * referencePriceUsd;
  const inrBalance = coinBalance * referencePriceInr;

  return (
    <WalletContext.Provider
      value={{
        coinBalance,
        inrBalance,
        usdBalance,
        referencePriceUsd,
        referencePriceInr,
        primaryWalletAddress,
        recentOrders,
        transactions,
        kyc,
        isLoading,
        buyCoins,
        transferCoins,
        claimFaucet,
        submitKyc,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
