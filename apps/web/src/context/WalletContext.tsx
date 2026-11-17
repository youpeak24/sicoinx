import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

/**
 * Wallet state backed entirely by the API. Nothing here is invented client-side:
 * until data arrives balances are zero / lists are empty, and every mutation goes
 * through the server and is followed by a refresh.
 */

export interface TransactionItem {
  id: string;
  txHash: string;
  /** BUY_COIN, SELL_COIN, TRANSFER_OUT, TRANSFER_IN, ECOSYSTEM_DEBIT, ECOSYSTEM_CREDIT, ADMIN_CREDIT, … */
  type: string;
  title: string;
  /** Signed ledger amount, e.g. "+100.000000". */
  coinAmount: string;
  /** Fiat amount recorded with the transaction, e.g. "10500.00 INR" (empty when none). */
  fiatAmount: string;
  timestamp: string;
  status: string;
  counterparty?: string;
  note?: string;
}

export interface KycStatus {
  status: 'VERIFIED' | 'PENDING' | 'UNVERIFIED' | 'REJECTED';
  fullName?: string;
  idType?: string;
  idNumber?: string;
  submittedAt?: string;
  rejectionReason?: string;
}

interface WalletContextType {
  coinBalance: number;
  inrBalance: number;
  usdBalance: number;
  /** Current buy reference price. 0 until the rates have loaded (see `ratesLoaded`). */
  referencePriceUsd: number;
  referencePriceInr: number;
  ratesLoaded: boolean;
  primaryWalletAddress: string;
  transactions: TransactionItem[];
  kyc: KycStatus;
  isLoading: boolean;
  loadError: string | null;
  transferCoins: (params: { recipientAddress: string; amount: number; note?: string }) => Promise<void>;
  claimFaucet: () => Promise<string>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/** Earlier builds cached invented balances/orders per user in localStorage; purge them. */
const LEGACY_STORAGE_PREFIX = 'sicoin_wallet_state_';

const EMPTY_KYC: KycStatus = { status: 'UNVERIFIED' };

function mapKycStatus(status: string | undefined): KycStatus['status'] {
  if (status === 'APPROVED') return 'VERIFIED';
  if (status === 'PENDING') return 'PENDING';
  if (status === 'REJECTED') return 'REJECTED';
  return 'UNVERIFIED';
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [coinBalance, setCoinBalance] = useState(0);
  const [primaryWalletAddress, setPrimaryWalletAddress] = useState('');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [kyc, setKyc] = useState<KycStatus>(EMPTY_KYC);
  const [referencePriceUsd, setReferencePriceUsd] = useState(0);
  const [referencePriceInr, setReferencePriceInr] = useState(0);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Remove data cached by earlier builds.
  useEffect(() => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(LEGACY_STORAGE_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      // Storage may be unavailable (private mode); nothing to clean.
    }
  }, []);

  // Public reference rates (no sign-in needed).
  useEffect(() => {
    let cancelled = false;
    api
      .get('/trade/rates')
      .then((rates: any) => {
        if (cancelled) return;
        setReferencePriceUsd(parseFloat(rates.buyPriceUsd) || 0);
        setReferencePriceInr(parseFloat(rates.buyPriceInr) || 0);
        setRatesLoaded(true);
      })
      .catch(() => {
        // Rates stay unloaded; consumers hide the price instead of showing a made-up one.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshWallet = useCallback(async () => {
    if (!userId) {
      setCoinBalance(0);
      setPrimaryWalletAddress('');
      setTransactions([]);
      setKyc(EMPTY_KYC);
      setLoadError(null);
      return;
    }

    setIsLoading(true);
    const [walletRes, kycRes, txRes] = await Promise.allSettled([
      api.get('/wallet'),
      api.get('/kyc/status'),
      api.get('/wallet/transactions?limit=50'),
    ]);

    if (walletRes.status === 'fulfilled' && walletRes.value?.wallet) {
      setCoinBalance(parseFloat(walletRes.value.wallet.coinBalance) || 0);
      setPrimaryWalletAddress(walletRes.value.wallet.address || '');
      setLoadError(null);
    } else if (walletRes.status === 'rejected') {
      setLoadError(walletRes.reason?.message || 'Could not load your wallet.');
    }

    if (kycRes.status === 'fulfilled' && kycRes.value) {
      setKyc({
        status: mapKycStatus(kycRes.value.status),
        fullName: kycRes.value.fullName,
        idType: kycRes.value.idType,
        idNumber: kycRes.value.idNumber,
        submittedAt: kycRes.value.submittedAt,
        rejectionReason: kycRes.value.rejectionReason ?? undefined,
      });
    }

    if (txRes.status === 'fulfilled' && Array.isArray(txRes.value?.transactions)) {
      setTransactions(
        txRes.value.transactions.map((t: any) => ({
          id: t.id,
          txHash: t.txHash,
          type: t.type,
          title: t.description,
          coinAmount: t.coinAmount,
          fiatAmount: t.fiatAmount || '',
          timestamp: t.createdAt,
          status: t.status,
        })),
      );
    }

    setIsLoading(false);
  }, [userId]);

  // Load on sign-in, reset on sign-out / account switch.
  useEffect(() => {
    void refreshWallet();
  }, [refreshWallet]);

  const transferCoins = async (params: { recipientAddress: string; amount: number; note?: string }) => {
    await api.post('/wallet/transfer', {
      destinationType: 'INTERNAL_USER',
      recipientIdentifier: params.recipientAddress,
      coinAmount: params.amount.toFixed(6),
      ...(params.note?.trim() ? { note: params.note.trim() } : {}),
    });
    await refreshWallet();
  };

  const claimFaucet = async (): Promise<string> => {
    // Throws the server's message (e.g. the 24h cooldown) instead of pretending it worked.
    const response = await api.post('/user/faucet/claim');
    await refreshWallet();
    return (
      (typeof response === 'string' ? response : response?.message) ||
      'Testnet claim recorded on your demonstration ledger.'
    );
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
        ratesLoaded,
        primaryWalletAddress,
        transactions,
        kyc,
        isLoading,
        loadError,
        transferCoins,
        claimFaucet,
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
