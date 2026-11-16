import React, { useState } from 'react';
import { useWallet, BuyOrderRecord } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  CreditCard,
  QrCode,
  Coins,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Printer,
  X,
  ExternalLink,
  ChevronRight,
  Building,
  HelpCircle,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export const PurchasingPage: React.FC = () => {
  const { user } = useAuth();
  const {
    referencePriceUsd,
    referencePriceInr,
    buyCoins,
    recentOrders,
    coinBalance,
  } = useWallet();

  // Exchange calculation state
  const [currency, setCurrency] = useState<'USD' | 'INR' | 'EUR'>('USD');
  const [coinInput, setCoinInput] = useState<string>('500');
  const [fiatInput, setFiatInput] = useState<string>(
    (500 * referencePriceUsd).toFixed(2)
  );

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CRYPTO' | 'BANK_WIRE'>('CARD');

  // Card details state
  const [cardName, setCardName] = useState(user?.name || 'David Mercer');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');

  // UPI state
  const [upiId, setUpiId] = useState('user@okhdfcbank');

  // Crypto state
  const [cryptoNetwork, setCryptoNetwork] = useState('USDT (TRC-20)');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Purchase execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [completedOrder, setCompletedOrder] = useState<BuyOrderRecord | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<BuyOrderRecord | null>(null);

  // Rate helper
  const rate = currency === 'INR' ? referencePriceInr : currency === 'EUR' ? referencePriceUsd * 0.92 : referencePriceUsd;
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$';

  // Handle coin change
  const handleCoinChange = (val: string) => {
    setCoinInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setFiatInput((num * rate).toFixed(2));
    } else {
      setFiatInput('');
    }
  };

  // Handle fiat change
  const handleFiatChange = (val: string) => {
    setFiatInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setCoinInput((num / rate).toFixed(6));
    } else {
      setCoinInput('');
    }
  };

  // Preset chips
  const presets = [50, 100, 250, 500, 1000, 5000];

  const handleSelectPreset = (amount: number) => {
    setCoinInput(amount.toString());
    setFiatInput((amount * rate).toFixed(2));
  };

  // Bonus calculation
  const currentCoinAmount = parseFloat(coinInput) || 0;
  let bonusPercentage = 0;
  if (currentCoinAmount >= 5000) {
    bonusPercentage = 10;
  } else if (currentCoinAmount >= 1000) {
    bonusPercentage = 5;
  } else if (currentCoinAmount >= 500) {
    bonusPercentage = 2;
  }
  const bonusCoins = (currentCoinAmount * bonusPercentage) / 100;
  const totalCoinsReceiving = currentCoinAmount + bonusCoins;

  // Execute purchase
  const handleExecutePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCoinAmount <= 0) return;

    setIsProcessing(true);
    setProcessingStep('Authorizing secure payment gateway...');

    setTimeout(() => {
      setProcessingStep('Reserving transparent token allocation...');
    }, 600);

    setTimeout(() => {
      setProcessingStep('Generating verifiable cryptographic ledger record...');
    }, 1200);

    setTimeout(async () => {
      try {
        const order = await buyCoins({
          coinAmount: currentCoinAmount,
          currency,
          paymentMethod,
          bonusCoins,
          cardDetails: { name: cardName, number: cardNumber, expiry: cardExpiry },
          upiId,
          cryptoNetwork,
        });
        setCompletedOrder(order);
        setSelectedReceipt(order);
        setReceiptModalOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
        setProcessingStep('');
      }
    }, 1800);
  };

  const copyDepositAddress = () => {
    navigator.clipboard.writeText('0x32A89F07211C824bA7D18fEc31548e658Ec0989b');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header & Live Ticker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#DFE8F5] shadow-card">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF4FF] border border-[#DFE8F5] text-xs font-bold text-[#123B9A]">
            <Sparkles className="w-3.5 h-3.5 text-[#175CFF]" />
            Official Token Issuance & Acquisition
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10213A] tracking-tight">
            Purchase SI Coins
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Acquire SI Coins with zero platform fees, instant wallet settlement, and transparent on-chain minting.
          </p>
        </div>

        {/* Live Exchange Rate Pill */}
        <div className="bg-[#F7FAFF] p-4 sm:p-5 rounded-2xl border border-[#DFE8F5] flex flex-col items-end gap-1 self-start md:self-auto min-w-[220px]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
            <span>Active Exchange Rate</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#10213A] tabular-nums">
            1 SI = ${referencePriceUsd.toFixed(4)} USD
          </div>
          <span className="text-[11px] font-semibold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            ≈ ₹{referencePriceInr.toFixed(2)} INR (Fixed Baseline)
          </span>
        </div>
      </div>

      {/* Main Grid: Purchase Form (Left) & Summary/Bonus (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Purchase Engine (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
              <h2 className="text-lg font-bold text-[#10213A] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#175CFF]" />
                Select Purchase Amount
              </h2>
              {/* Currency Selector */}
              <div className="flex bg-[#F7FAFF] p-1 rounded-xl border border-[#DFE8F5]">
                {(['USD', 'INR', 'EUR'] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      setCurrency(curr);
                      const currentCoins = parseFloat(coinInput) || 0;
                      const newRate = curr === 'INR' ? referencePriceInr : curr === 'EUR' ? referencePriceUsd * 0.92 : referencePriceUsd;
                      setFiatInput((currentCoins * newRate).toFixed(2));
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      currency === curr
                        ? 'bg-[#175CFF] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#10213A]'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Dual Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fiat Input */}
              <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] focus-within:border-[#175CFF] focus-within:bg-white transition-all space-y-1">
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  You Pay ({currency})
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#64748B]">{currencySymbol}</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={fiatInput}
                    onChange={(e) => handleFiatChange(e.target.value)}
                    className="w-full text-2xl font-extrabold text-[#10213A] bg-transparent outline-none tabular-nums"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* SI Coin Input */}
              <div className="p-4 rounded-2xl bg-[#EDF4FF]/50 border border-[#175CFF]/30 focus-within:border-[#175CFF] focus-within:bg-white transition-all space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#175CFF] uppercase tracking-wider block">
                    You Receive (SI Coins)
                  </label>
                  {bonusPercentage > 0 && (
                    <span className="text-[10px] font-extrabold bg-[#15803D] text-white px-2 py-0.5 rounded-full">
                      +{bonusPercentage}% BONUS
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-[#175CFF] flex-shrink-0" />
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={coinInput}
                    onChange={(e) => handleCoinChange(e.target.value)}
                    className="w-full text-2xl font-extrabold text-[#175CFF] bg-transparent outline-none tabular-nums"
                    placeholder="0.000000"
                  />
                </div>
              </div>
            </div>

            {/* Quick Preset Chips */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#64748B]">Quick Presets</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {presets.map((amt) => {
                  const isSelected = Math.abs(parseFloat(coinInput) - amt) < 0.001;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectPreset(amt)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#175CFF] text-white shadow-xs scale-102 ring-2 ring-[#175CFF]/30'
                          : 'bg-[#F7FAFF] text-[#10213A] border border-[#DFE8F5] hover:border-[#175CFF]/50'
                      }`}
                    >
                      {amt.toLocaleString()} SI
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="space-y-3 pt-4 border-t border-[#DFE8F5]">
              <label className="text-xs font-bold text-[#10213A] uppercase tracking-wider block">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-[#175CFF] bg-[#EDF4FF] text-[#123B9A] shadow-xs'
                      : 'border-[#DFE8F5] bg-white text-[#64748B] hover:border-[#175CFF]/40'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 ${paymentMethod === 'CARD' ? 'text-[#175CFF]' : 'text-[#64748B]'}`} />
                  <div>
                    <span className="text-xs font-bold block text-[#10213A]">Credit / Debit Card</span>
                    <span className="text-[10px] text-[#64748B]">Instant • Visa / MC</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#175CFF] bg-[#EDF4FF] text-[#123B9A] shadow-xs'
                      : 'border-[#DFE8F5] bg-white text-[#64748B] hover:border-[#175CFF]/40'
                  }`}
                >
                  <QrCode className={`w-5 h-5 ${paymentMethod === 'UPI' ? 'text-[#175CFF]' : 'text-[#64748B]'}`} />
                  <div>
                    <span className="text-xs font-bold block text-[#10213A]">UPI & QR Code</span>
                    <span className="text-[10px] text-[#64748B]">Instant • India/Global</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CRYPTO')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                    paymentMethod === 'CRYPTO'
                      ? 'border-[#175CFF] bg-[#EDF4FF] text-[#123B9A] shadow-xs'
                      : 'border-[#DFE8F5] bg-white text-[#64748B] hover:border-[#175CFF]/40'
                  }`}
                >
                  <Coins className={`w-5 h-5 ${paymentMethod === 'CRYPTO' ? 'text-[#175CFF]' : 'text-[#64748B]'}`} />
                  <div>
                    <span className="text-xs font-bold block text-[#10213A]">Cryptocurrency</span>
                    <span className="text-[10px] text-[#64748B]">USDT • USDC • ETH</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_WIRE')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                    paymentMethod === 'BANK_WIRE'
                      ? 'border-[#175CFF] bg-[#EDF4FF] text-[#123B9A] shadow-xs'
                      : 'border-[#DFE8F5] bg-white text-[#64748B] hover:border-[#175CFF]/40'
                  }`}
                >
                  <Building className={`w-5 h-5 ${paymentMethod === 'BANK_WIRE' ? 'text-[#175CFF]' : 'text-[#64748B]'}`} />
                  <div>
                    <span className="text-xs font-bold block text-[#10213A]">Direct Bank Wire</span>
                    <span className="text-[10px] text-[#64748B]">IMPS / NEFT / Swift</span>
                  </div>
                </button>
              </div>

              {/* Payment Method Details Sub-forms */}
              <div className="mt-4 p-5 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5]">
                {paymentMethod === 'CARD' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#10213A]">Card Checkout Simulator</span>
                      <span className="text-[11px] font-semibold text-[#15803D] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#64748B] block mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#DFE8F5] bg-white text-[#10213A]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#64748B] block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#DFE8F5] bg-white text-[#10213A] font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#64748B] block mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#DFE8F5] bg-white text-[#10213A]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#64748B] block mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#DFE8F5] bg-white text-[#10213A]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#10213A]">UPI Instant Payment</span>
                      <span className="text-[11px] text-[#175CFF] font-semibold">Zero Surcharge</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-28 h-28 bg-white p-2 rounded-2xl border border-[#DFE8F5] flex flex-col items-center justify-center shadow-xs">
                        {/* Dynamic Mock QR Code */}
                        <div className="w-24 h-24 bg-gradient-to-br from-[#10213A] via-[#175CFF] to-[#123B9A] rounded-xl flex items-center justify-center p-2 text-white">
                          <QrCode className="w-16 h-16" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 w-full">
                        <label className="text-[11px] text-[#64748B] block">Virtual Payment Address (VPA / UPI ID)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#DFE8F5] bg-white text-[#10213A]"
                            placeholder="username@bank"
                          />
                        </div>
                        <span className="text-[11px] text-[#64748B] block">
                          Works with Google Pay, PhonePe, Paytm, BHIM and all BHIM-UPI applications.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'CRYPTO' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#10213A]">Cryptocurrency On-Chain Settlement</span>
                      <select
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg border border-[#DFE8F5] bg-white text-[#10213A]"
                      >
                        <option value="USDT (TRC-20)">USDT (TRC-20)</option>
                        <option value="USDT (ERC-20)">USDT (ERC-20)</option>
                        <option value="USDC (ERC-20)">USDC (ERC-20)</option>
                        <option value="ETH (Sepolia/Mainnet)">ETH (Sepolia/Mainnet)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] text-[#64748B] block">Dedicated Deposit Address for this Session</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value="0x32A89F07211C824bA7D18fEc31548e658Ec0989b"
                          className="flex-1 text-xs font-mono px-3 py-2 rounded-xl border border-[#DFE8F5] bg-white text-[#10213A] select-all"
                        />
                        <button
                          type="button"
                          onClick={copyDepositAddress}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A] transition-colors"
                        >
                          {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedAddress ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <span className="text-[11px] text-[#64748B] block">
                        Automatic credit occurs within 1 block confirmation.
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'BANK_WIRE' && (
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-[#10213A] block">Virtual Escrow Beneficiary Details</span>
                    <div className="grid grid-cols-2 gap-2 text-[#64748B]">
                      <div className="p-2 bg-white rounded-lg border border-[#DFE8F5]">
                        <span className="text-[10px] block text-[#64748B]">Beneficiary Name</span>
                        <span className="font-semibold text-[#10213A]">SI Coin Protocol Treasury</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#DFE8F5]">
                        <span className="text-[10px] block text-[#64748B]">Virtual Account No.</span>
                        <span className="font-semibold text-[#10213A] font-mono">SICX9821800219</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#DFE8F5]">
                        <span className="text-[10px] block text-[#64748B]">IFSC Code</span>
                        <span className="font-semibold text-[#10213A] font-mono">HDFC0000240</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#DFE8F5]">
                        <span className="text-[10px] block text-[#64748B]">Payment Mode</span>
                        <span className="font-semibold text-[#10213A]">IMPS / NEFT / RTGS</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Execute Purchase CTA */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isProcessing || currentCoinAmount <= 0}
                onClick={handleExecutePurchase}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#123B9A] via-[#175CFF] to-[#38BDF8] text-white font-extrabold text-base shadow-elevated hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{processingStep}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>
                      Confirm & Pay {currencySymbol}{parseFloat(fiatInput || '0').toLocaleString()} ({totalCoinsReceiving.toLocaleString()} SI)
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Bonus Tiers (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-5">
            <h3 className="font-bold text-base text-[#10213A] border-b border-[#DFE8F5] pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Base SI Amount</span>
                <span className="font-bold text-[#10213A] tabular-nums">
                  {currentCoinAmount.toLocaleString()} SI
                </span>
              </div>

              {bonusPercentage > 0 && (
                <div className="flex items-center justify-between text-[#15803D] font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Tier Bonus (+{bonusPercentage}%)
                  </span>
                  <span className="font-bold tabular-nums">+{bonusCoins.toFixed(2)} SI Free</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#64748B]">
                <span>Unit Rate</span>
                <span className="font-medium text-[#10213A]">
                  ${referencePriceUsd.toFixed(4)} USD
                </span>
              </div>

              <div className="flex items-center justify-between text-[#64748B]">
                <span>Platform Processing Fee</span>
                <span className="font-bold text-[#15803D]">FREE ($0.00)</span>
              </div>

              <div className="flex items-center justify-between text-[#64748B]">
                <span>Network Gas Subsidy</span>
                <span className="font-bold text-[#15803D]">100% Subsidized</span>
              </div>

              <div className="pt-3 border-t border-[#DFE8F5] flex items-baseline justify-between">
                <div>
                  <span className="font-bold text-sm text-[#10213A] block">Total Payable</span>
                  <span className="text-[11px] text-[#64748B]">Instant Wallet Credit</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#175CFF] tabular-nums">
                    {currencySymbol}{parseFloat(fiatInput || '0').toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#15803D] block font-semibold">
                    Net: {totalCoinsReceiving.toLocaleString()} SI
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Guarantee */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] space-y-1.5 text-[11px] text-[#64748B]">
              <div className="flex items-center gap-1.5 font-bold text-[#10213A]">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                Verifiable Protocol Guarantee
              </div>
              <p>
                Every transaction issues an immutable, verifiable cryptographic receipt and creates a direct internal ledger allocation.
              </p>
            </div>
          </div>

          {/* Bonus Tier Progress Card */}
          <div className="bg-gradient-to-br from-[#123B9A] to-[#175CFF] text-white p-6 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-200">
                Tiered Acquisition Bonuses
              </span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className={`p-2.5 rounded-xl border transition-all ${currentCoinAmount >= 500 && currentCoinAmount < 1000 ? 'bg-white/20 border-white font-bold' : 'bg-white/10 border-white/10 opacity-80'}`}>
                <div className="flex items-center justify-between">
                  <span>500+ SI Tier</span>
                  <span className="text-amber-300 font-extrabold">+2% EXTRA COINS</span>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${currentCoinAmount >= 1000 && currentCoinAmount < 5000 ? 'bg-white/20 border-white font-bold' : 'bg-white/10 border-white/10 opacity-80'}`}>
                <div className="flex items-center justify-between">
                  <span>1,000+ SI Tier</span>
                  <span className="text-amber-300 font-extrabold">+5% EXTRA COINS</span>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${currentCoinAmount >= 5000 ? 'bg-white/20 border-white font-bold' : 'bg-white/10 border-white/10 opacity-80'}`}>
                <div className="flex items-center justify-between">
                  <span>5,000+ SI Whale Tier</span>
                  <span className="text-amber-300 font-extrabold">+10% EXTRA COINS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Purchases & Orders Ledger Section */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
          <div>
            <h3 className="font-bold text-lg text-[#10213A]">Your Purchase History & Receipts</h3>
            <p className="text-xs text-[#64748B]">Auditable record of all completed acquisitions</p>
          </div>
          <span className="text-xs font-bold text-[#175CFF] bg-[#EDF4FF] px-3 py-1 rounded-full">
            {recentOrders.length} Orders
          </span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#64748B]">
            No purchases recorded yet. Your completed orders will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAFF] text-[#64748B] border-b border-[#DFE8F5]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order / Receipt</th>
                  <th className="py-3 px-4 font-semibold">Coin Amount</th>
                  <th className="py-3 px-4 font-semibold">Total Paid</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F7FAFF]/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#10213A] block">{ord.orderNumber}</span>
                      <span className="text-[10px] text-[#64748B]">{ord.receiptNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#175CFF]">
                      +{parseFloat(ord.coinAmount).toLocaleString()} SI
                      {parseFloat(ord.bonusCoins) > 0 && (
                        <span className="text-[10px] text-[#15803D] block font-semibold">
                          +{parseFloat(ord.bonusCoins).toFixed(2)} Bonus
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#10213A]">
                      ${ord.totalUsd} USD
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-[10px] font-semibold text-[#10213A]">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {new Date(ord.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReceipt(ord);
                          setReceiptModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#EDF4FF] text-[#123B9A] font-bold text-[11px] hover:bg-[#DFE8F5] transition-colors"
                      >
                        <Printer className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OFFICIAL PURCHASE RECEIPT MODAL */}
      {receiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#DFE8F5] shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#123B9A] via-[#175CFF] to-[#38BDF8]" />

            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#175CFF] text-white flex items-center justify-center font-black text-sm">
                  SI
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#10213A]">Official Digital Receipt</h3>
                  <span className="text-[10px] text-[#64748B]">Verifiable Proof of Acquisition</span>
                </div>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#10213A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Summary Pill */}
            <div className="p-4 rounded-2xl bg-[#EDF4FF] border border-[#DFE8F5] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#123B9A] block">Receipt ID</span>
                <span className="font-mono font-bold text-sm text-[#10213A]">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-[#123B9A] block">Date</span>
                <span className="text-xs font-semibold text-[#10213A]">
                  {new Date(selectedReceipt.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Order Reference:</span>
                <span className="font-mono font-semibold text-[#10213A]">{selectedReceipt.orderNumber}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Payment Gateway:</span>
                <span className="font-semibold text-[#10213A]">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Base SI Acquired:</span>
                <span className="font-bold text-[#10213A]">{parseFloat(selectedReceipt.coinAmount).toLocaleString()} SI</span>
              </div>
              {parseFloat(selectedReceipt.bonusCoins) > 0 && (
                <div className="flex justify-between text-[#15803D] font-bold">
                  <span>Tier Promotional Bonus:</span>
                  <span>+{parseFloat(selectedReceipt.bonusCoins).toFixed(2)} SI</span>
                </div>
              )}
              <div className="flex justify-between text-[#64748B]">
                <span>Total SI Credited:</span>
                <span className="font-black text-[#175CFF]">
                  {(parseFloat(selectedReceipt.coinAmount) + parseFloat(selectedReceipt.bonusCoins)).toLocaleString()} SI
                </span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Amount Paid:</span>
                <span className="font-black text-base text-[#10213A]">${selectedReceipt.totalUsd} USD</span>
              </div>
              <div className="pt-2 border-t border-[#DFE8F5] flex justify-between items-center text-[11px] text-[#64748B]">
                <span>Cryptographic Tx Hash:</span>
                <span className="font-mono text-[#175CFF] truncate max-w-[200px]" title={selectedReceipt.txHash}>
                  {selectedReceipt.txHash}
                </span>
              </div>
            </div>

            {/* Verification Seal */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs text-[#15803D]">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Verified & Settled into your SI Coin Account Balance.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#DFE8F5] text-xs font-bold text-[#10213A] hover:bg-[#F7FAFF] flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A] shadow-xs transition-colors"
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
