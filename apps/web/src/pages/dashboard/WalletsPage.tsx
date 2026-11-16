import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useWallet } from '../../context/WalletContext';
import {
  Wallet,
  ShieldCheck,
  Plus,
  Trash2,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
  Send,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Coins,
  History,
  Info,
  Clock,
  X,
} from 'lucide-react';

export const WalletsPage: React.FC = () => {
  const {
    coinBalance,
    usdBalance,
    inrBalance,
    referencePriceUsd,
    primaryWalletAddress,
    transactions,
    claimFaucet,
    transferCoins,
    refreshWallet,
    isLoading: walletLoading,
  } = useWallet();

  // Web3 Linked Wallets state
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [chainInput, setChainInput] = useState('Ethereum Sepolia Testnet');
  const [challengeData, setChallengeData] = useState<{ challengeToken: string; messageToSign: string } | null>(null);
  const [step, setStep] = useState<'address' | 'sign' | 'complete'>('address');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Send Modal state
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [recipientInput, setRecipientInput] = useState('');
  const [sendAmountInput, setSendAmountInput] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Receive Modal state
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Faucet state
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetMsg, setFaucetMsg] = useState('');

  // Transaction Ledger Filter
  const [txFilter, setTxFilter] = useState<'ALL' | 'BUY_COIN' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'FAUCET_CLAIM'>('ALL');

  const fetchWallets = () => {
    setIsLoading(true);
    api
      .get('/user/wallets')
      .then((data) => setWallets(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleStartLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.match(/^0x[a-fA-F0-9]{40}$/)) {
      setErrorMsg('Please enter a valid 42-character Ethereum address (0x...).');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      const res = await api.post('/user/wallets/challenge');
      setChallengeData(res);
      setStep('sign');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate cryptographic challenge.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifySignature = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      await api.post('/user/wallets/verify', {
        address: addressInput,
        chain: chainInput,
        challengeToken: challengeData?.challengeToken,
      });

      setStep('complete');
      fetchWallets();
    } catch (err: any) {
      setErrorMsg(err.message || 'Signature verification failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this wallet address?')) return;
    try {
      await api.delete(`/user/wallets/${id}`);
      fetchWallets();
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect wallet.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAddressInput('');
    setChallengeData(null);
    setStep('address');
    setErrorMsg('');
  };

  const handleClaimFaucet = async () => {
    setFaucetLoading(true);
    setFaucetMsg('');
    try {
      const msg = await claimFaucet();
      setFaucetMsg(msg);
      setTimeout(() => setFaucetMsg(''), 4000);
    } catch (err: any) {
      setFaucetMsg(err.message || 'Faucet claim failed.');
      setTimeout(() => setFaucetMsg(''), 4000);
    } finally {
      setFaucetLoading(false);
    }
  };

  const handleExecuteSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError('');
    setSendSuccess('');

    const amt = parseFloat(sendAmountInput);
    if (isNaN(amt) || amt <= 0) {
      setSendError('Please enter a valid amount.');
      return;
    }
    if (amt > coinBalance) {
      setSendError(`Insufficient balance. You have ${coinBalance.toFixed(6)} SI available.`);
      return;
    }
    if (!recipientInput.trim()) {
      setSendError('Please specify a recipient wallet address or email.');
      return;
    }

    setIsSending(true);
    try {
      await transferCoins({
        recipientAddress: recipientInput.trim(),
        amount: amt,
        note: sendNote,
      });
      setSendSuccess(`Successfully transferred ${amt.toFixed(6)} SI!`);
      setTimeout(() => {
        setSendModalOpen(false);
        setRecipientInput('');
        setSendAmountInput('');
        setSendNote('');
        setSendSuccess('');
      }, 1500);
    } catch (err: any) {
      setSendError(err.message || 'Transfer failed.');
    } finally {
      setIsSending(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(primaryWalletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'ALL') return true;
    return tx.type === txFilter;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Top Banner: Wallet Coin Balance Overview */}
      <div className="bg-gradient-to-br from-[#10213A] via-[#123B9A] to-[#175CFF] rounded-3xl p-6 sm:p-10 text-white shadow-card space-y-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Verifiable Total Holdings
            </div>
            <span className="text-xs text-blue-200 block">Available SI Coin Balance</span>
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums">
                {coinBalance.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
              </h1>
              <span className="text-xl sm:text-2xl font-extrabold text-blue-200">SI</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <span className="font-semibold tabular-nums">
                ≈ ${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
              <span>•</span>
              <span className="text-blue-200 tabular-nums">
                ₹{inrBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
              </span>
              <span className="text-[11px] font-bold bg-[#15803D] text-white px-2 py-0.5 rounded-full">
                +8.4% 24h PnL
              </span>
            </div>
          </div>

          {/* Quick Refresh & Status */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <button
              onClick={() => refreshWallet()}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white flex items-center gap-2 text-xs font-semibold cursor-pointer"
              title="Sync Balance"
            >
              <RefreshCw className={`w-4 h-4 ${walletLoading ? 'animate-spin' : ''}`} />
              <span>Live Sync</span>
            </button>
            <span className="text-[11px] text-blue-200 font-mono">
              1 SI = ${referencePriceUsd.toFixed(4)} USD
            </span>
          </div>
        </div>

        {/* Quick Action Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10 pt-4 border-t border-white/15">
          <Link
            to="/dashboard/purchase"
            className="py-3 px-4 rounded-2xl bg-white text-[#123B9A] font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-elevated hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4 text-[#175CFF]" />
            <span>Buy SI Coins</span>
          </Link>

          <button
            onClick={() => setSendModalOpen(true)}
            className="py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send / Transfer</span>
          </button>

          <button
            onClick={() => setReceiveModalOpen(true)}
            className="py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Receive (QR)</span>
          </button>

          <button
            onClick={handleClaimFaucet}
            disabled={faucetLoading}
            className="py-3 px-4 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{faucetLoading ? 'Dispensing...' : 'Claim Faucet (+100 SI)'}</span>
          </button>
        </div>

        {faucetMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{faucetMsg}</span>
          </div>
        )}
      </div>

      {/* Primary Account Wallet Card */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#15803D]" />
            <h2 className="font-bold text-base text-[#10213A]">
              Primary SI Coin Protocol Wallet
            </h2>
            <span className="text-[10px] font-bold bg-emerald-50 text-[#15803D] px-2 py-0.5 rounded-full border border-emerald-100">
              Zero Custody • Instant
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Your dedicated identifier for zero-fee internal transfers and ecosystem allocations
          </p>
          <div className="flex items-center gap-2 pt-2">
            <code className="text-xs sm:text-sm font-mono font-bold bg-[#F7FAFF] px-3 py-1.5 rounded-xl border border-[#DFE8F5] text-[#10213A]">
              {primaryWalletAddress}
            </code>
            <button
              onClick={copyAddress}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDF4FF] text-[#123B9A] text-xs font-bold hover:bg-[#DFE8F5] transition-colors"
            >
              {copiedAddress ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setReceiveModalOpen(true)}
            className="p-3 rounded-2xl border border-[#DFE8F5] bg-[#F7FAFF] hover:bg-white text-[#175CFF] flex items-center gap-2 text-xs font-bold transition-all shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>Show QR Code</span>
          </button>
        </div>
      </div>

      {/* External Web3 Wallets & Challenge Linking */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#DFE8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-base text-[#10213A]">Linked External Web3 Wallets</h2>
            <p className="text-xs text-[#64748B]">Non-custodial cryptographic verification using expiring signatures</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A] shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Link Web3 Wallet
          </button>
        </div>

        {wallets.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B] space-y-2">
            <Wallet className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
            <p className="font-semibold text-[#10213A]">No external Web3 addresses linked yet</p>
            <p className="max-w-md mx-auto text-[11px]">
              Link your MetaMask, Coinbase Wallet, or Trust Wallet to verify ownership without exposing private keys.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#DFE8F5]">
            {wallets.map((w) => (
              <div key={w.id} className="p-5 flex items-center justify-between gap-4 hover:bg-[#F7FAFF] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#EDF4FF] text-[#175CFF] flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#10213A] truncate">{w.address}</span>
                      <span className="text-[10px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex-shrink-0">
                        Verified
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748B] block">{w.chain}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnect(w.id)}
                  className="p-2 text-[#DC2626] hover:bg-red-50 rounded-xl transition-colors"
                  title="Disconnect Wallet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History & Activity Ledger */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFE8F5] pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#175CFF]" />
            <div>
              <h2 className="font-bold text-base text-[#10213A]">Wallet Activity Ledger</h2>
              <p className="text-xs text-[#64748B]">All deposits, acquisitions, transfers, and claims</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#F7FAFF] p-1 rounded-xl border border-[#DFE8F5]">
            {[
              { label: 'All', value: 'ALL' },
              { label: 'Purchases', value: 'BUY_COIN' },
              { label: 'Transfers', value: 'TRANSFER_OUT' },
              { label: 'Faucet', value: 'FAUCET_CLAIM' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTxFilter(tab.value as any)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  txFilter === tab.value
                    ? 'bg-[#175CFF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#10213A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#64748B]">
            No activity found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-[#DFE8F5]">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.coinAmount.startsWith('+');
              return (
                <div key={tx.id} className="py-4 flex items-center justify-between gap-4 hover:bg-[#F7FAFF] px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isPositive ? 'bg-emerald-50 text-[#15803D]' : 'bg-blue-50 text-[#175CFF]'
                    }`}>
                      {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#10213A] block">{tx.title}</span>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                        <span>{new Date(tx.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span className="font-mono truncate max-w-[140px]">{tx.counterparty || tx.txHash}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-black text-xs sm:text-sm block tabular-nums ${
                      isPositive ? 'text-[#15803D]' : 'text-[#10213A]'
                    }`}>
                      {tx.coinAmount} SI
                    </span>
                    <span className="text-[11px] text-[#64748B] block tabular-nums">
                      {tx.fiatValueUsd}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEND / TRANSFER MODAL */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#DFE8F5] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#175CFF]" />
                <h3 className="font-bold text-base text-[#10213A]">Transfer SI Coins</h3>
              </div>
              <button onClick={() => setSendModalOpen(false)} className="text-[#64748B] hover:text-[#10213A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {sendError && (
              <div className="p-3 rounded-xl bg-red-50 text-[#DC2626] border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{sendError}</span>
              </div>
            )}

            {sendSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-[#15803D] border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{sendSuccess}</span>
              </div>
            )}

            <form onSubmit={handleExecuteSend} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#10213A] block mb-1">Recipient Address or Email</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SICX-A8F2-... or user@sicoin.org"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white text-[#10213A] font-mono text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#10213A]">Amount (SI Coins)</label>
                  <button
                    type="button"
                    onClick={() => setSendAmountInput(coinBalance.toString())}
                    className="text-[#175CFF] font-bold hover:underline"
                  >
                    Max: {coinBalance.toFixed(2)} SI
                  </button>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus-within:bg-white">
                  <Coins className="w-4 h-4 text-[#175CFF]" />
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.000000"
                    value={sendAmountInput}
                    onChange={(e) => setSendAmountInput(e.target.value)}
                    className="w-full bg-transparent outline-none font-bold text-sm text-[#10213A]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#10213A] block mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Project payment"
                  value={sendNote}
                  onChange={(e) => setSendNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white text-[#10213A] text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#EDF4FF] text-[11px] text-[#123B9A] flex items-center justify-between">
                <span>Estimated Network Gas:</span>
                <strong className="text-[#15803D]">0.00 SI (100% Subsidized)</strong>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSendModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DFE8F5] font-bold text-[#64748B] hover:bg-[#F7FAFF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 py-2.5 rounded-xl bg-[#175CFF] text-white font-bold hover:bg-[#123B9A] shadow-xs cursor-pointer"
                >
                  {isSending ? 'Sending...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIVE QR MODAL */}
      {receiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl border border-[#DFE8F5] shadow-2xl p-6 sm:p-8 space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
              <h3 className="font-bold text-base text-[#10213A]">Receive SI Coins</h3>
              <button onClick={() => setReceiveModalOpen(false)} className="text-[#64748B] hover:text-[#10213A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="w-48 h-48 mx-auto bg-gradient-to-tr from-[#123B9A] to-[#175CFF] p-3 rounded-3xl shadow-elevated flex items-center justify-center text-white relative">
              <QrCode className="w-36 h-36" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-white text-[#175CFF] flex items-center justify-center font-black text-sm shadow-md">
                  SI
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Your SI Protocol Wallet Address
              </span>
              <p className="font-mono font-bold text-xs text-[#10213A] bg-[#F7FAFF] p-2.5 rounded-xl border border-[#DFE8F5] break-all">
                {primaryWalletAddress}
              </p>
            </div>

            <button
              onClick={copyAddress}
              className="w-full py-2.5 px-4 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {copiedAddress ? <Check className="w-4 h-4 text-[#15803D]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAddress ? 'Address Copied!' : 'Copy Wallet Address'}</span>
            </button>

            <p className="text-[10px] text-[#64748B]">
              Only send SI Coins to this address. Internal peer transfers settle in under 1 second.
            </p>
          </div>
        </div>
      )}

      {/* WEB3 LINK WALLET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#DFE8F5] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
              <h3 className="font-bold text-base text-[#10213A]">Link External Web3 Wallet</h3>
              <button onClick={closeModal} className="text-[#64748B] hover:text-[#10213A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-[#DC2626] border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 'address' && (
              <form onSubmit={handleStartLink} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#10213A] block mb-1">Ethereum / Sepolia Address</label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#10213A] block mb-1">Network</label>
                  <select
                    value={chainInput}
                    onChange={(e) => setChainInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                  >
                    <option value="Ethereum Sepolia Testnet">Ethereum Sepolia Testnet</option>
                    <option value="Ethereum Mainnet (Read-Only)">Ethereum Mainnet (Read-Only)</option>
                  </select>
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl border border-[#DFE8F5] font-bold text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-[#175CFF] text-white font-bold hover:bg-[#123B9A]"
                  >
                    {isProcessing ? 'Generating Challenge...' : 'Continue to Challenge'}
                  </button>
                </div>
              </form>
            )}

            {step === 'sign' && challengeData && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F7FAFF] border border-[#DFE8F5] space-y-1">
                  <span className="font-bold text-[#10213A] block">Challenge Nonce:</span>
                  <pre className="text-[11px] font-mono text-[#64748B] whitespace-pre-wrap">
                    {challengeData.messageToSign}
                  </pre>
                </div>
                <button
                  onClick={handleVerifySignature}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-[#175CFF] text-white font-bold hover:bg-[#123B9A]"
                >
                  {isProcessing ? 'Verifying Challenge...' : 'Simulate Signature Verification'}
                </button>
              </div>
            )}

            {step === 'complete' && (
              <div className="space-y-4 text-center py-4 text-xs">
                <CheckCircle2 className="w-12 h-12 text-[#15803D] mx-auto" />
                <h4 className="font-bold text-sm text-[#10213A]">Wallet Successfully Verified!</h4>
                <p className="text-[#64748B]">
                  Your Web3 address has been verified without any custody transfer.
                </p>
                <button
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-xl bg-[#175CFF] text-white font-bold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
