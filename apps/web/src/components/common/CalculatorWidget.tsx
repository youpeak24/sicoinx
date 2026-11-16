import React, { useState, useEffect } from 'react';
import { ArrowUpDown, AlertCircle, RefreshCw, Info, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { calculateUsdToSi, calculateSiToUsd } from '@sicoin/shared';

interface CalculatorWidgetProps {
  initialPriceUsd?: string;
  sourceLabel?: string;
  isDemoData?: boolean;
}

export const CalculatorWidget: React.FC<CalculatorWidgetProps> = ({
  initialPriceUsd,
  sourceLabel,
  isDemoData,
}) => {
  const [direction, setDirection] = useState<'USD_TO_SI' | 'SI_TO_USD'>('USD_TO_SI');
  const [amount, setAmount] = useState<string>('100');
  const [rate, setRate] = useState<string>(initialPriceUsd || '1.250000');
  const [priceSource, setPriceSource] = useState<string>(sourceLabel || 'Administrator-set reference price');
  const [isDemo, setIsDemo] = useState<boolean>(Boolean(isDemoData));
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [isStale, setIsStale] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  const fetchPrice = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{
        priceUsd: string;
        sourceLabel: string;
        effectiveTimestamp: string;
        isStale: boolean;
        isDemoData: boolean;
      }>('/coin/price');
      setRate(data.priceUsd);
      setPriceSource(data.sourceLabel);
      setLastUpdated(data.effectiveTimestamp);
      setIsStale(data.isStale);
      setIsDemo(data.isDemoData);
    } catch {
      // Keep previous rate or fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  // Compute estimate locally using decimal arithmetic
  const calculation =
    direction === 'USD_TO_SI'
      ? calculateUsdToSi(amount, rate, 6)
      : calculateSiToUsd(amount, rate, 2);

  const handleToggle = () => {
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 300);

    // If output is valid, flip amount to the output value for smooth UX
    if (calculation.isValid && calculation.outputAmount !== '0') {
      setAmount(calculation.outputAmount);
    }
    setDirection((prev) => (prev === 'USD_TO_SI' ? 'SI_TO_USD' : 'USD_TO_SI'));
  };

  return (
    <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card relative overflow-hidden interactive-card">
      {/* Decorative accent glow with ambient animation */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-[#175CFF]/10 rounded-full blur-3xl -z-10 pointer-events-none animate-blob" />

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#DFE8F5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EDF4FF] text-[#123B9A] text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-[#175CFF]" />
            Conversion Engine
          </div>
          <h3 className="text-xl font-bold text-[#10213A]">Token Value Calculator</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Decimal-precise estimation against active reference price
          </p>
        </div>
        <button
          onClick={fetchPrice}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-[#DFE8F5] text-[#64748B] hover:text-[#175CFF] hover:bg-[#F7FAFF] transition-all duration-200 active:scale-95 shadow-xs"
          title="Refresh active price"
          aria-label="Refresh active price"
        >
          <RefreshCw className={`w-4 h-4 transition-transform ${isLoading ? 'animate-spin text-[#175CFF]' : ''}`} />
        </button>
      </div>

      {/* Stale or Invalid Alert */}
      {isStale && (
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-[#B45309] flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Price data is currently stale beyond the threshold. Calculation is disabled.</span>
        </div>
      )}

      {/* Input / Output Form */}
      <div className="mt-6 space-y-4">
        {/* Input Field */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#64748B] mb-1.5">
            <span>You provide</span>
            <span className="transition-colors duration-200">
              {direction === 'USD_TO_SI' ? 'United States Dollar (USD)' : 'SI Coin (SI)'}
            </span>
          </div>
          <div className="relative rounded-2xl border border-[#DFE8F5] bg-[#F7FAFF] focus-within:bg-white focus-within:border-[#175CFF] focus-within:ring-2 focus-within:ring-[#175CFF]/15 transition-all duration-200 p-3.5 flex items-center shadow-xs">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              disabled={isStale}
              className="w-full bg-transparent text-2xl font-bold text-[#10213A] focus:outline-none tabular-nums placeholder:text-[#94A3B8]"
            />
            <span className="text-sm font-bold text-[#10213A] bg-white px-3 py-1.5 rounded-xl border border-[#DFE8F5] shadow-xs">
              {direction === 'USD_TO_SI' ? 'USD' : 'SI'}
            </span>
          </div>
        </div>

        {/* Direction Switcher Button */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            type="button"
            onClick={handleToggle}
            className={`p-3 rounded-full bg-white border border-[#DFE8F5] shadow-md text-[#175CFF] hover:bg-[#EDF4FF] hover:border-[#175CFF] transition-all duration-300 transform active:scale-90 hover:scale-105 ${
              isFlipping ? 'rotate-180' : ''
            }`}
            title="Switch Conversion Direction"
            aria-label="Switch Conversion Direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Output Result */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#64748B] mb-1.5">
            <span>Estimated value</span>
            <span className="transition-colors duration-200">
              {direction === 'USD_TO_SI' ? 'SI Coin (SI)' : 'United States Dollar (USD)'}
            </span>
          </div>
          <div className="rounded-2xl border border-[#DFE8F5] bg-gradient-to-r from-white via-[#F7FAFF] to-[#EDF4FF]/30 p-3.5 flex items-center justify-between shadow-xs transition-all duration-200">
            <span className="text-2xl font-bold text-[#175CFF] tabular-nums truncate transition-all duration-200">
              {isStale ? '—' : calculation.isValid ? calculation.outputAmount : '0.00'}
            </span>
            <span className="text-sm font-bold text-[#123B9A] bg-[#EDF4FF] px-3 py-1.5 rounded-xl border border-[#DFE8F5]/80">
              {direction === 'USD_TO_SI' ? 'SI' : 'USD'}
            </span>
          </div>
          {calculation.errorMessage && !isStale && (
            <p className="text-xs text-[#DC2626] mt-1.5 animate-fade-in">{calculation.errorMessage}</p>
          )}
        </div>
      </div>

      {/* Telemetry and Provenance Footer */}
      <div className="mt-6 pt-5 border-t border-[#DFE8F5] space-y-2.5 text-xs text-[#64748B]">
        <div className="flex items-center justify-between">
          <span>Reference Rate:</span>
          <span className="font-semibold text-[#10213A] tabular-nums inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
            1 SI = ${rate} USD
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Price Source:</span>
          <span className="font-medium text-[#10213A] inline-flex items-center gap-1">
            {priceSource}
            {isDemo && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                Demo
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Last Updated:</span>
          <span className="tabular-nums">
            {new Date(lastUpdated).toLocaleTimeString()} ({new Date(lastUpdated).toLocaleDateString()})
          </span>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-2 text-[11px] text-[#64748B] leading-tight flex items-start gap-1.5 italic">
          <Info className="w-3.5 h-3.5 text-[#175CFF] flex-shrink-0 mt-0.5 not-italic" />
          <span>Estimate based on the displayed reference price. This is not an executable exchange quote.</span>
        </div>
      </div>
    </div>
  );
};
