import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Send,
  ArrowRightLeft,
  CheckCircle,
  AlertCircle,
  Radio,
  ShoppingBag,
  User,
  ShieldCheck,
  Receipt,
  Printer,
} from 'lucide-react';
import Decimal from 'decimal.js';

export const TransfersPage: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [destinationType, setDestinationType] = useState<'INTERNAL_USER' | 'ECOSYSTEM_APP'>('INTERNAL_USER');
  const [destinationApp, setDestinationApp] = useState<'YOUPEAK' | 'YOUPEAK_ECOMMERCE'>('YOUPEAK');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [coinAmount, setCoinAmount] = useState('10');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferReceipt, setTransferReceipt] = useState<any | null>(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet');
      setWallet(res.wallet);
    } catch (err: any) {
      console.error('Failed to load wallet', err);
    }
  };

  const availableBalance = parseFloat(wallet?.coinBalance || '0');
  const parsedCoins = parseFloat(coinAmount) || 0;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTransferReceipt(null);

    if (parsedCoins > availableBalance) {
      setError(`Insufficient balance. You have ${availableBalance.toFixed(2)} SI.`);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/wallet/transfer', {
        destinationType,
        destinationApp: destinationType === 'ECOSYSTEM_APP' ? destinationApp : undefined,
        recipientIdentifier: recipientIdentifier.trim(),
        coinAmount: new Decimal(coinAmount).toFixed(6),
        note: note.trim() || undefined,
      });

      setTransferReceipt(res.data?.transfer);
      fetchWallet();
      setRecipientIdentifier('');
      setNote('');
    } catch (err: any) {
      setError(err.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#10213A]">Ecosystem Coin Transfers</h1>
        <p className="text-sm text-[#64748B]">
          Transfer SIcoinX coins instantaneously to peer users or connected platforms (YouPeak & YouPeak E-Commerce).
        </p>
      </div>

      {/* Wallet Balance Strip */}
      <div className="p-4 rounded-2xl bg-white border border-[#DFE8F5] flex items-center justify-between">
        <div>
          <div className="text-xs text-[#64748B]">Your Current Balance</div>
          <div className="text-xl font-black text-[#175CFF]">{availableBalance.toFixed(4)} SI</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#64748B]">Your Wallet Address</div>
          <div className="text-xs font-mono font-bold text-[#10213A]">{wallet?.address || 'Loading...'}</div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form (3 cols) */}
        <div className="md:col-span-3 bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs space-y-5">
          <form onSubmit={handleTransfer} className="space-y-5">
            {/* Destination Mode Tabs */}
            <div>
              <label className="block text-xs font-bold text-[#10213A] mb-2 uppercase tracking-wide">
                Transfer Destination
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDestinationType('INTERNAL_USER')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    destinationType === 'INTERNAL_USER'
                      ? 'border-[#175CFF] bg-[#EDF4FF] text-[#175CFF] ring-2 ring-[#175CFF]/20'
                      : 'border-[#DFE8F5] text-[#64748B]'
                  }`}
                >
                  <User className="w-4 h-4 text-[#175CFF]" />
                  <div>
                    <div className="text-xs font-bold text-[#10213A]">SIcoinX User</div>
                    <div className="text-[10px] text-[#64748B]">By Email or Wallet ID</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDestinationType('ECOSYSTEM_APP')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    destinationType === 'ECOSYSTEM_APP'
                      ? 'border-[#175CFF] bg-[#EDF4FF] text-[#175CFF] ring-2 ring-[#175CFF]/20'
                      : 'border-[#DFE8F5] text-[#64748B]'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4 text-[#175CFF]" />
                  <div>
                    <div className="text-xs font-bold text-[#10213A]">Connected App</div>
                    <div className="text-[10px] text-[#64748B]">YouPeak Platforms</div>
                  </div>
                </button>
              </div>
            </div>

            {/* App selection if ECOSYSTEM_APP */}
            {destinationType === 'ECOSYSTEM_APP' && (
              <div>
                <label className="block text-xs font-bold text-[#10213A] mb-1.5 uppercase tracking-wide">
                  Select Ecosystem Platform
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDestinationApp('YOUPEAK')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                      destinationApp === 'YOUPEAK'
                        ? 'border-[#175CFF] bg-[#EDF4FF]'
                        : 'border-[#DFE8F5]'
                    }`}
                  >
                    <Radio className="w-4 h-4 text-[#175CFF]" />
                    <div>
                      <div className="text-xs font-bold text-[#10213A]">YouPeak</div>
                      <div className="text-[10px] text-[#64748B]">Creator & Streaming</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDestinationApp('YOUPEAK_ECOMMERCE')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${
                      destinationApp === 'YOUPEAK_ECOMMERCE'
                        ? 'border-[#175CFF] bg-[#EDF4FF]'
                        : 'border-[#DFE8F5]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-[#175CFF]" />
                    <div>
                      <div className="text-xs font-bold text-[#10213A]">YouPeak E-Commerce</div>
                      <div className="text-[10px] text-[#64748B]">Marketplace Checkout</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Recipient Input */}
            <div>
              <label className="block text-xs font-bold text-[#10213A] mb-1.5 uppercase tracking-wide">
                {destinationType === 'INTERNAL_USER'
                  ? 'Recipient Email or SIcoinX Wallet ID'
                  : destinationApp === 'YOUPEAK'
                  ? 'YouPeak Account Username or Email'
                  : 'YouPeak E-Commerce Account Email'}
              </label>
              <input
                type="text"
                required
                value={recipientIdentifier}
                onChange={(e) => setRecipientIdentifier(e.target.value)}
                placeholder={
                  destinationType === 'INTERNAL_USER'
                    ? 'name@example.com or SICX-…'
                    : 'user@youpeak.live'
                }
                className="w-full text-xs font-mono font-medium px-4 py-2.5 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
              />
            </div>

            {/* Coin Amount */}
            <div>
              <label className="block text-xs font-bold text-[#10213A] mb-1.5 uppercase tracking-wide">
                Transfer Amount (SI)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.000001"
                  step="any"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  required
                  className="w-full text-xl font-bold text-[#10213A] px-4 py-2.5 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                  placeholder="10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">
                  SI
                </span>
              </div>
            </div>

            {/* Note / Memo */}
            <div>
              <label className="block text-xs font-bold text-[#10213A] mb-1.5 uppercase tracking-wide">
                Transfer Note / Memo (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
                placeholder="e.g. For project collaboration or streaming subscription"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || parsedCoins <= 0 || parsedCoins > availableBalance || !recipientIdentifier}
              className="w-full py-3 px-4 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Processing Transfer...' : `Send ${parsedCoins.toFixed(2)} SI Immediately`}
            </button>
          </form>
        </div>

        {/* Right: Ecosystem Overview (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[#EDF4FF] border border-[#DFE8F5] rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-[#10213A] uppercase tracking-wide flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#175CFF]" /> Approved Ecosystem
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              SIcoinX coins are native utility tokens accepted directly across the YouPeak ecosystem. You can transfer coins to power:
            </p>
            <ul className="text-xs text-[#10213A] space-y-2 list-disc list-inside">
              <li><strong>YouPeak:</strong> Live streaming, creator tipping, and community memberships.</li>
              <li><strong>YouPeak E-Commerce:</strong> Zero-fee merchandise checkout for digital and physical gear.</li>
              <li><strong>Peer-to-Peer:</strong> Instant zero-network-fee transfers to any registered SIcoinX user.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DFE8F5] space-y-2 text-xs text-[#64748B]">
            <div className="flex items-center gap-2 font-bold text-[#10213A]">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" /> Cryptographically Logged
            </div>
            <p className="text-[11px] leading-relaxed">
              Every coin movement generates an immutable transaction hash recorded on the centralized ledger.
            </p>
          </div>
        </div>
      </div>

      {/* Transfer Receipt Modal */}
      {transferReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DFE8F5] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#15803D]" />
                <div>
                  <h3 className="font-bold text-base text-[#10213A]">Transfer Confirmed</h3>
                  <div className="text-xs text-[#64748B]">Official Ecosystem Transfer Receipt</div>
                </div>
              </div>
            </div>

            <div className="bg-[#F7FAFF] rounded-xl p-4 border border-[#DFE8F5] space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Transfer Ref No:</span>
                <span className="font-mono font-bold text-[#10213A]">{transferReceipt.transferNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Destination:</span>
                <span className="font-semibold text-[#10213A]">
                  {transferReceipt.destinationType === 'ECOSYSTEM_APP'
                    ? transferReceipt.destinationApp
                    : 'SIcoinX User'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Recipient:</span>
                <span className="font-mono text-[#10213A]">{transferReceipt.recipientEmail || transferReceipt.recipientWalletAddress}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-[#DFE8F5] pt-2">
                <span className="text-[#10213A]">Amount Transferred:</span>
                <span className="text-[#175CFF] text-sm">{transferReceipt.coinAmount} SI</span>
              </div>
              {transferReceipt.note && (
                <div className="flex justify-between text-[#64748B]">
                  <span>Memo:</span>
                  <span>{transferReceipt.note}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-[#DFE8F5] hover:bg-gray-50 text-xs font-semibold text-[#10213A] flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                type="button"
                onClick={() => setTransferReceipt(null)}
                className="px-6 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
