import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Download,
  Printer,
  Sparkles,
  Smartphone,
  Building,
} from 'lucide-react';
import Decimal from 'decimal.js';

export const BuyCoinsPage: React.FC = () => {
  const [rates, setRates] = useState<any>(null);
  const [coinAmount, setCoinAmount] = useState<string>('100');
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'RAZORPAY_NETBANKING'>('RAZORPAY_UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await api.get('/trade/rates');
      setRates(res);
    } catch (err: any) {
      console.error('Failed to fetch trade rates', err);
    }
  };

  const buyPriceInr = rates?.buyPriceInr || '105.00';
  const parsedCoins = parseFloat(coinAmount) || 0;
  const totalInr = (parsedCoins * parseFloat(buyPriceInr)).toFixed(2);

  const handleInitiateBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/trade/buy/create-order', {
        coinAmount: new Decimal(coinAmount).toFixed(6),
        paymentMethod,
      });

      setActiveOrder(res);
      setPaymentModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate purchase order.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async (simulatedPaymentId?: string) => {
    if (!activeOrder) return;
    setLoading(true);
    setError(null);

    const paymentId = simulatedPaymentId || `pay_rzp_${Date.now()}`;
    const signature = activeOrder.testSignatureHelper || 'test_sig_verified';

    try {
      const res = await api.post('/trade/buy/verify-payment', {
        buyOrderId: activeOrder.buyOrderId,
        razorpayOrderId: activeOrder.razorpayOrder.id,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      });

      setSuccessData(res);
      setPaymentModalOpen(false);
      setShowReceiptModal(true);
    } catch (err: any) {
      setError(err.message || 'Payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#10213A]">Buy SIcoinX</h1>
        <p className="text-sm text-[#64748B]">
          Purchase digital coins with immediate credit to your SIcoinX wallet via Razorpay (UPI, Cards & Net Banking).
        </p>
      </div>

      {/* Live Rate Pill */}
      <div className="flex flex-wrap items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#EDF4FF] to-white border border-[#DFE8F5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#175CFF] text-white flex items-center justify-center font-bold">
            SI
          </div>
          <div>
            <div className="text-xs font-semibold text-[#64748B]">Current Reference Buy Rate</div>
            <div className="text-lg font-black text-[#10213A]">
              1 SI = ₹{buyPriceInr} INR <span className="text-xs text-[#64748B] font-normal">(${(parseFloat(buyPriceInr) / (rates?.inrPerUsd ? parseFloat(rates.inrPerUsd) : 84)).toFixed(2)} USD)</span>
            </div>
          </div>
        </div>
        <div className="text-xs font-semibold text-[#15803D] bg-[#15803D]/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Instant Automatic Wallet Credit
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Purchase Calculator & Inputs (3 cols) */}
        <div className="md:col-span-3 bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs space-y-6">
          <form onSubmit={handleInitiateBuy} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#10213A] mb-2 uppercase tracking-wide">
                Coins to Purchase (SI)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  required
                  className="w-full text-2xl font-bold text-[#10213A] px-4 py-3 rounded-xl border border-[#DFE8F5] focus:outline-none focus:ring-2 focus:ring-[#175CFF]"
                  placeholder="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">
                  SI
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {[50, 100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCoinAmount(preset.toString())}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#DFE8F5] text-[#64748B] hover:border-[#175CFF] hover:text-[#175CFF] transition-colors"
                  >
                    +{preset} SI
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-[#10213A] mb-2 uppercase tracking-wide">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY_UPI')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'RAZORPAY_UPI'
                      ? 'border-[#175CFF] bg-[#EDF4FF] text-[#175CFF] ring-2 ring-[#175CFF]/20'
                      : 'border-[#DFE8F5] hover:border-gray-300 text-[#64748B]'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1 text-[#175CFF]" />
                  <div className="text-xs font-bold text-[#10213A]">UPI Apps</div>
                  <div className="text-[10px] text-[#64748B]">GPay, PhonePe, Paytm</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY_CARD')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'RAZORPAY_CARD'
                      ? 'border-[#175CFF] bg-[#EDF4FF] text-[#175CFF] ring-2 ring-[#175CFF]/20'
                      : 'border-[#DFE8F5] hover:border-gray-300 text-[#64748B]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1 text-[#175CFF]" />
                  <div className="text-xs font-bold text-[#10213A]">Cards</div>
                  <div className="text-[10px] text-[#64748B]">Debit / Credit / RuPay</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY_NETBANKING')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'RAZORPAY_NETBANKING'
                      ? 'border-[#175CFF] bg-[#EDF4FF] text-[#175CFF] ring-2 ring-[#175CFF]/20'
                      : 'border-[#DFE8F5] hover:border-gray-300 text-[#64748B]'
                  }`}
                >
                  <Building className="w-5 h-5 mb-1 text-[#175CFF]" />
                  <div className="text-xs font-bold text-[#10213A]">Net Banking</div>
                  <div className="text-[10px] text-[#64748B]">50+ Indian Banks</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || parsedCoins <= 0}
              className="w-full py-3.5 px-4 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Generating Order...' : `Proceed to Pay ₹${totalInr}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Order Summary Card (2 cols) */}
        <div className="md:col-span-2 bg-[#F7FAFF] border border-[#DFE8F5] rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#10213A]">Order Summary</h3>
            <div className="space-y-2.5 text-xs text-[#64748B]">
              <div className="flex justify-between">
                <span>Quantity</span>
                <span className="font-bold text-[#10213A]">{parsedCoins.toFixed(2)} SI</span>
              </div>
              <div className="flex justify-between">
                <span>Rate per coin</span>
                <span className="font-bold text-[#10213A]">₹{buyPriceInr} INR</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Gateway</span>
                <span className="font-bold text-[#10213A]">Razorpay Secured</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee</span>
                <span className="font-bold text-[#15803D]">FREE</span>
              </div>
              <div className="border-t border-[#DFE8F5] pt-3 flex justify-between text-sm">
                <span className="font-bold text-[#10213A]">Total Amount</span>
                <span className="font-extrabold text-[#175CFF] text-base">₹{totalInr} INR</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#DFE8F5] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#10213A]">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" /> 256-bit Bank Grade Security
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Upon successful payment, SIcoinX coins are automatically credited to your centralized digital wallet. An official transaction receipt is generated instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Razorpay Interactive Checkout Simulator Modal */}
      {paymentModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DFE8F5] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0C2340] text-white flex items-center justify-center font-bold text-xs">
                  rzp
                </div>
                <div>
                  <div className="font-bold text-sm text-[#10213A]">Razorpay Checkout</div>
                  <div className="text-[11px] text-[#64748B]">Order: {activeOrder.orderNumber}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-[#10213A]">₹{activeOrder.totalInr}</div>
                <div className="text-[10px] text-[#15803D] font-bold">Secured by Razorpay</div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#64748B]">
                Choose your preferred payment simulation to authorize and complete this purchase:
              </p>

              <button
                type="button"
                onClick={() => handleCompletePayment(`pay_upi_${Date.now()}`)}
                disabled={loading}
                className="w-full p-3 rounded-xl border border-[#DFE8F5] hover:border-[#175CFF] hover:bg-[#EDF4FF] transition-colors flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[#175CFF]" />
                  <div>
                    <div className="text-xs font-bold text-[#10213A]">Pay with UPI (GPay / PhonePe)</div>
                    <div className="text-[10px] text-[#64748B]">Fast instant authorization</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#175CFF]">Pay Now</span>
              </button>

              <button
                type="button"
                onClick={() => handleCompletePayment(`pay_card_${Date.now()}`)}
                disabled={loading}
                className="w-full p-3 rounded-xl border border-[#DFE8F5] hover:border-[#175CFF] hover:bg-[#EDF4FF] transition-colors flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#175CFF]" />
                  <div>
                    <div className="text-xs font-bold text-[#10213A]">Pay with Debit / Credit Card</div>
                    <div className="text-[10px] text-[#64748B]">Visa, Mastercard, RuPay</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#175CFF]">Pay Now</span>
              </button>

              <button
                type="button"
                onClick={() => handleCompletePayment(`pay_nb_${Date.now()}`)}
                disabled={loading}
                className="w-full p-3 rounded-xl border border-[#DFE8F5] hover:border-[#175CFF] hover:bg-[#EDF4FF] transition-colors flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-[#175CFF]" />
                  <div>
                    <div className="text-xs font-bold text-[#10213A]">Pay with Net Banking</div>
                    <div className="text-[10px] text-[#64748B]">HDFC, ICICI, SBI, Axis</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#175CFF]">Pay Now</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#10213A]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Transaction Receipt Modal */}
      {showReceiptModal && successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DFE8F5] space-y-6 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#15803D]" />
                <div>
                  <h3 className="font-bold text-base text-[#10213A]">Payment Verified & Credited</h3>
                  <div className="text-xs text-[#64748B]">Official Transaction Receipt</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#15803D]/10 text-[#15803D]">
                SUCCESS
              </div>
            </div>

            {/* Receipt Body */}
            <div className="bg-[#F7FAFF] rounded-xl p-4 border border-[#DFE8F5] space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Receipt No:</span>
                <span className="font-mono font-bold text-[#10213A]">
                  {successData.receipt?.receiptNumber || successData.buyOrder?.receiptNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Order No:</span>
                <span className="font-mono font-semibold text-[#10213A]">
                  {successData.buyOrder?.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Razorpay Payment ID:</span>
                <span className="font-mono text-[#10213A]">
                  {successData.receipt?.gatewayPaymentId || successData.buyOrder?.gatewayPaymentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Transaction Hash:</span>
                <span className="font-mono text-[#175CFF]">
                  {successData.transaction?.txHash?.slice(0, 18)}...
                </span>
              </div>
              <div className="border-t border-[#DFE8F5] pt-2 flex justify-between font-bold">
                <span className="text-[#10213A]">Coins Credited:</span>
                <span className="text-[#15803D] text-sm">+{successData.buyOrder?.coinAmount} SI</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-[#10213A]">Total Paid:</span>
                <span className="text-[#10213A] text-sm">₹{successData.buyOrder?.totalInr} INR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">New Wallet Balance:</span>
                <span className="font-bold text-[#175CFF]">{successData.wallet?.coinBalance} SI</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-[#DFE8F5] hover:bg-gray-50 text-xs font-semibold text-[#10213A] flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-6 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
