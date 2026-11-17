import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { PriceChart } from '../../components/common/PriceChart';
import { CalculatorWidget } from '../../components/common/CalculatorWidget';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { AnimatedCounter } from '../../components/common/animations/AnimatedCounter';
import { Market3DGraphBackground } from '../../components/market/Market3DGraphBackground';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';

export const MarketPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [coin, setCoin] = useState<any>(null);

  useEffect(() => {
    api.get('/coin/price').then(setSummary).catch(console.error);
    api.get('/coin/config').then(setCoin).catch(console.error);
  }, []);

  const getNumericVal = (val: string | number | undefined, fallback: number) => {
    if (!val) return fallback;
    const n = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(n) ? fallback : n;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 1. Fixed 3D Floor Background Animation (No settings, pure WebGL floor) */}
      <Market3DGraphBackground currentPrice={summary?.priceUsd || '1.250000'} />

      {/* 2. Page Foreground Content (Crisp Glassmorphism Layering) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#175CFF] bg-[#EDF4FF] px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Market & Telemetry
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#10213A] tracking-tight">
              SI Coin Valuation & Historical Feed
            </h1>
            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
              Examine transparent price observations, inspect time-series charts, and review data source methodologies.
            </p>
          </div>
        </ScrollReveal>

        {/* Primary KPI Strip (Frosted Glass Panels with 3D Depth) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ScrollReveal direction="up" delay={50}>
            <div className="bg-white/85 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-card hover:shadow-elevated hover:bg-white/95 transition-all duration-300 space-y-1 interactive-card h-full">
              <span className="text-xs text-[#64748B]">Reference Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#10213A] tabular-nums">
                  ${summary?.priceUsd || '1.250000'}
                </span>
                <span className="text-xs text-[#64748B]">USD</span>
              </div>
              <span className="text-[11px] text-[#15803D] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {summary?.sourceLabel || 'Administrator-set'}
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={120}>
            <div className="bg-white/85 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-card hover:shadow-elevated hover:bg-white/95 transition-all duration-300 space-y-1 interactive-card h-full">
              <span className="text-xs text-[#64748B]">24H Delta</span>
              <div className="text-3xl font-bold tabular-nums">
                {summary?.change24h ? (
                  <span className={summary.change24h.direction === 'up' ? 'text-[#15803D]' : 'text-[#DC2626]'}>
                    {summary.change24h.direction === 'up' ? '+' : '-'}
                    {summary.change24h.percentage.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-[#64748B] text-xl font-medium">N/A (Baseline)</span>
                )}
              </div>
              <span className="text-[11px] text-[#64748B]">
                Against documented historical point
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={190}>
            <div className="bg-white/85 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-card hover:shadow-elevated hover:bg-white/95 transition-all duration-300 space-y-1 interactive-card h-full">
              <span className="text-xs text-[#64748B]">Circulating Float</span>
              <div className="text-3xl font-bold text-[#10213A] tabular-nums">
                <AnimatedCounter value={getNumericVal(coin?.circulatingSupply, 18500000)} />
              </div>
              <span className="text-[11px] text-[#64748B]">18.5% of 100M total</span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={260}>
            <div className="bg-white/85 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-card hover:shadow-elevated hover:bg-white/95 transition-all duration-300 space-y-1 interactive-card h-full">
              <span className="text-xs text-[#64748B]">Reference Valuation</span>
              <div className="text-3xl font-bold text-[#175CFF] tabular-nums">
                <AnimatedCounter value={getNumericVal(summary?.marketCapUsd, 23125000)} prefix="$" />
              </div>
              <span className="text-[11px] text-[#64748B]">Ref rate × circulating float</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Interactive Chart */}
        <ScrollReveal direction="up" delay={200}>
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/80 shadow-card overflow-hidden">
            <PriceChart initialRange="30D" />
          </div>
        </ScrollReveal>

        {/* Calculator & Methodology */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <ScrollReveal direction="right" delay={150}>
              <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/80 shadow-card">
                <CalculatorWidget
                  initialPriceUsd={summary?.priceUsd}
                  sourceLabel={summary?.sourceLabel}
                  isDemoData={summary?.isDemoData}
                />
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-7">
            <ScrollReveal direction="left" delay={200}>
              <div className="bg-[#EDF4FF]/90 backdrop-blur-md rounded-3xl p-8 border border-[#DFE8F5] space-y-6 interactive-card shadow-card">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white text-[#175CFF] shadow-xs">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-[#10213A]">Source Provenance & Valuation Methodology</h3>
                </div>

                <div className="space-y-4 text-xs text-[#64748B] leading-relaxed">
                  <p className="p-3 bg-white/70 rounded-2xl border border-white/60">
                    <strong className="text-[#10213A]">1. Administrative Reference Rate:</strong> In the pre-mainnet development phase, reference valuations are established by authorized protocol staff with detailed justification entries recorded in the immutable audit trail.
                  </p>
                  <p className="p-3 bg-white/70 rounded-2xl border border-white/60">
                    <strong className="text-[#10213A]">2. No Fictitious Market Cap:</strong> We do not present administrative reference rates as independently traded market capitalizations. Any valuation shown is strictly the product of the reference rate and configured circulating float.
                  </p>
                  <p className="p-3 bg-white/70 rounded-2xl border border-white/60">
                    <strong className="text-[#10213A]">3. Stale Rate Protections:</strong> Telemetry feeds older than 60 minutes are marked as stale, disabling calculator operations until a fresh observation is recorded.
                  </p>
                  <p className="p-3 bg-white/70 rounded-2xl border border-white/60">
                    <strong className="text-[#10213A]">4. Non-Executable Quotes:</strong> Displayed prices represent informational metrics and do not constitute executable trading orders or settlement quotes.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
};
