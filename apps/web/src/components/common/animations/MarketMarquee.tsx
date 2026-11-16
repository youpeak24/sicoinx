import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, Activity, Database, Lock, Pause, Play } from 'lucide-react';

interface MarqueeItem {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

export const MarketMarquee: React.FC<{ priceUsd?: string; changePercentage?: number }> = ({
  priceUsd = '1.250000',
  changePercentage = 2.45,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const items: MarqueeItem[] = [
    {
      label: 'SI / USD',
      value: `$${priceUsd}`,
      change: `+${changePercentage}%`,
      isPositive: true,
      icon: <Activity className="w-3.5 h-3.5 text-[#175CFF]" />,
    },
    {
      label: 'CIRCULATING SUPPLY',
      value: '18,500,000 SI',
      icon: <Database className="w-3.5 h-3.5 text-[#15803D]" />,
    },
    {
      label: 'MAX TOTAL SUPPLY',
      value: '100,000,000 SI',
      icon: <Lock className="w-3.5 h-3.5 text-[#123B9A]" />,
    },
    {
      label: 'AUDIT SPEC',
      value: '100% Non-Custodial',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />,
    },
    {
      label: 'SEPOLIA PREVIEW',
      value: '0x32A89F...0989b',
      icon: <Activity className="w-3.5 h-3.5 text-[#175CFF]" />,
    },
    {
      label: 'VALUATION BENCHMARK',
      value: '$23,125,000 USD',
      icon: <TrendingUp className="w-3.5 h-3.5 text-[#175CFF]" />,
    },
  ];

  // Duplicate items array to make continuous infinite loop seamless
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden bg-white/80 backdrop-blur-md border-y border-[#DFE8F5] py-2.5 flex items-center group">
      {/* Subtle edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div
        className={`flex items-center gap-8 whitespace-nowrap will-change-transform ${
          isPaused ? '' : 'animate-marquee'
        } pause-on-hover`}
        style={{
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#F7FAFF] border border-[#DFE8F5]/80 text-xs shadow-xs hover:border-[#175CFF]/40 transition-colors"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#EDF4FF]">
              {item.icon}
            </span>
            <span className="font-semibold text-[#64748B] tracking-wider text-[11px] uppercase">
              {item.label}:
            </span>
            <span className="font-bold text-[#10213A] tabular-nums">
              {item.value}
            </span>
            {item.change && (
              <span
                className={`font-bold text-[11px] px-1.5 py-0.5 rounded ${
                  item.isPositive ? 'bg-emerald-50 text-[#15803D]' : 'bg-red-50 text-[#DC2626]'
                }`}
              >
                {item.change}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* WCAG Compliant Pause/Play toggle button */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute right-3 z-20 p-1.5 rounded-lg bg-white/90 border border-[#DFE8F5] text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF] opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 shadow-sm"
        title={isPaused ? 'Resume ticker motion' : 'Pause ticker motion'}
        aria-label={isPaused ? 'Resume ticker motion' : 'Pause ticker motion'}
      >
        {isPaused ? <Play className="w-3 h-3 text-[#175CFF]" /> : <Pause className="w-3 h-3" />}
        <span className="text-[10px] font-medium hidden sm:inline">{isPaused ? 'Play' : 'Pause'}</span>
      </button>
    </div>
  );
};
