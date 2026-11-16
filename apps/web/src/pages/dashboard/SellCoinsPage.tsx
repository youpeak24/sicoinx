import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Banknote,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  History,
} from 'lucide-react';
import Decimal from 'decimal.js';

export const SellCoinsPage: React.FC = () => {
  const [rates, setRates] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [coinAmount, setCoinAmount] = useState<string>('50');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pastSellOrders, setPastSellOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [ratesRes, walletRes, ordersRes] = await Promise.all([
        api.get('/trade/rates'),
        api.get('/wallet'),
        api.get('/trade/sell/orders'),
      ]);
      setRates(ratesRes);
      setWallet(walletRes.wallet);
      setPastSellOrders(ordersRes || []);
    } catch (err: any) {
      console.error('Failed to fetch data', err);
    }
  };

  const sellPriceInr = rates?.sellPriceInr || '100.00';
  const parsedCoins = parseFloat(coinAmount) || 0;
  const totalInr = (parsedCoins * parseFloat(sellPriceInr)).toFixed(2);
  const availableBalance = parseFloat(wallet?.coinBalance || '0');

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (parsedCoins > availableBalance) {
      setError(`Insufficient coin balance. You have ${availableBalance.toFixed(2)} SI.`);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/trade/sell/request', {
        coinAmount: new Decimal(coinAmount).toFixed(6),
        bankAccountName,
        bankName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase().trim(),
      });

      setSuccess(`Sell request submitted! Order ${res.sellOrder.orderNumber} is queued for bank settlement.`);
      setWallet(res.wallet);
      fetchInitialData();
      // Reset form
      setCoinAmount('50');
    } catch (err: any) {
      setError(err.message || 'Failed to submit sell order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#10213A]">Sell SIcoinX & Bank Withdrawal</h1>
        <p className="text-sm text-[#64748B]">
          Sell your SIcoinX coins for INR and receive direct settlement transfer into your verified bank account.
        </p>
      </div>

      {/* Live Rate & Available Balance Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#DFE8F5] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#64748B]">Reference Sell Rate</div>
            <div className="text-xl font-black text-[#10213A]">1 SI = ₹{sellPriceInr} INR</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EDF4FF] text-[#175CFF] flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFE8F5] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#64748B]">Your Available Balance</div>
            <div className="text-xl font-black text-[#175CFF]">
              {availableBalance.toFixed(4)} SI
            </div>
          </div>
          <div className="text-xs text-[#64748B]">
            ≈ ₹{(availableBalance * parseFloat(sellPriceInr)).toFixed(2)}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form (3 cols) */}
        <div className="md:col-span-3 bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs space-y-5">
          <form onSubmit={handleSellSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#10213A] mb-1.5 uppercase tracking-wide">
                Coins to Sell (SI)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  required
                  className="w-full text-xl font-bold text-[#10213A] px-4 py-2.5 rounded-xl border border-[#DFE8F5] focus:outline-none focus:ring-2 focus:ring-[#175CFF]"
                  placeholder="50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">
                  SI
                </span>
              </div>
              <div className="flex justify-between items-center mt-1.5 text-xs text-[#64748B]">
                <span>You will receive: <strong className="text-[#10213A]">₹{totalInr} INR</strong></span>
                <button
                  type="button"
                  onClick={() => setCoinAmount(availableBalance.toString())}
                  className="text-[#175CFF] font-bold hover:underline"
                >
                  Sell Max
                </button>
              </div>
            </div>

            <div className="border-t border-[#DFE8F5] pt-4 space-y-3">
              <h3 className="font-bold text-xs text-[#10213A] uppercase tracking-wide flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#175CFF]" /> Receiving Bank Account Details
              </h3>

              <div>
                <label className="block text-xs text-[#64748B] mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  required
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="e.g. David M. User"
                  className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    maxLength={11}
                    className="w-full text-xs font-mono font-medium px-3.5 py-2 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#64748B] mb-1">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 501002391823"
                  className="w-full text-xs font-mono font-medium px-3.5 py-2 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || parsedCoins <= 0 || parsedCoins > availableBalance}
              className="w-full py-3 px-4 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Submitting Request...' : `Submit Withdrawal for ₹${totalInr}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Information & Timeline (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[#F7FAFF] border border-[#DFE8F5] rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-[#10213A] uppercase tracking-wide">
              Settlement Timeline
            </h3>
            <div className="space-y-3 text-xs text-[#64748B]">
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-[#175CFF] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <strong className="text-[#10213A] block">Escrow Coin Lock</strong>
                  Coins are immediately held in secure escrow to prevent double-spending.
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-[#175CFF] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <strong className="text-[#10213A] block">Finance Verification</strong>
                  Bank payout is authorized via NEFT/IMPS or RTGS by Super Admin.
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <strong className="text-[#10213A] block">Bank UTR Generated</strong>
                  Funds credited to your bank account with official UTR reference.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DFE8F5] rounded-2xl p-4 text-xs text-[#64748B] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#10213A]">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" /> Payout Protection
            </div>
            <p className="text-[11px] leading-relaxed">
              If an account number is rejected by the receiving bank, escrowed coins are immediately returned back to your digital wallet with full audit logging.
            </p>
          </div>
        </div>
      </div>

      {/* Past Sell Orders Table */}
      <div className="bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#10213A] flex items-center gap-2">
          <History className="w-4 h-4 text-[#175CFF]" /> Recent Sell & Withdrawal Requests
        </h3>

        {pastSellOrders.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#64748B]">
            No previous sell requests recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DFE8F5] text-[#64748B]">
                  <th className="pb-2 font-semibold">Order No</th>
                  <th className="pb-2 font-semibold">Coins Sold</th>
                  <th className="pb-2 font-semibold">Total INR</th>
                  <th className="pb-2 font-semibold">Bank / Account</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Bank Ref / UTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {pastSellOrders.map((order) => (
                  <tr key={order.id} className="text-[#10213A]">
                    <td className="py-3 font-mono font-bold">{order.orderNumber}</td>
                    <td className="py-3 font-semibold">{order.coinAmount} SI</td>
                    <td className="py-3 font-bold text-[#15803D]">₹{order.totalInr}</td>
                    <td className="py-3 text-[#64748B]">
                      {order.bankName} (****{order.accountNumber.slice(-4)})
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'SETTLED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-[#64748B]">
                      {order.settlementUtr || 'Pending Admin Payout'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
