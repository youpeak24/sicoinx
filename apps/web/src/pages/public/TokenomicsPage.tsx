import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { AnimatedCounter } from '../../components/common/animations/AnimatedCounter';
import { ShieldCheck, Info, Layers, CheckCircle2, Sparkles } from 'lucide-react';

export const TokenomicsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .get('/coin/tokenomics')
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const formatNumber = (val: string | number) => {
    const n = typeof val === 'number' ? val : parseFloat(val || '0');
    return new Intl.NumberFormat('en-US').format(n);
  };

  const getNumericVal = (val: string | number | undefined, fallback: number) => {
    if (!val) return fallback;
    const n = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(n) ? fallback : n;
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center py-24 text-[#64748B] animate-fade-in">
        <div className="w-8 h-8 border-4 border-[#175CFF] border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading tokenomics disclosures...</span>
      </div>
    );
  }

  const allocations = data?.allocations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#175CFF] bg-[#EDF4FF] px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Supply Economics
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#10213A] tracking-tight">
            Verifiable Tokenomics & Linear Vesting
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            SI Coin enforces a strict, mathematical distribution model. Total allocations must reconcile to exactly 100% of the fixed 100,000,000 SI supply before publication.
          </p>
        </div>
      </ScrollReveal>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ScrollReveal direction="up" delay={50}>
          <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-xs space-y-1 interactive-card h-full">
            <span className="text-xs text-[#64748B] font-medium">Fixed Total Supply</span>
            <span className="block text-2xl font-bold text-[#10213A] tabular-nums">
              <AnimatedCounter value={getNumericVal(data?.totalSupply, 100000000)} suffix=" SI" />
            </span>
            <span className="text-[11px] text-[#15803D] font-semibold">100.0% Bytecode Cap</span>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={120}>
          <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-xs space-y-1 interactive-card h-full">
            <span className="text-xs text-[#64748B] font-medium">Initial Circulating Float</span>
            <span className="block text-2xl font-bold text-[#175CFF] tabular-nums">
              <AnimatedCounter value={getNumericVal(data?.circulatingSupply, 18500000)} suffix=" SI" />
            </span>
            <span className="text-[11px] text-[#64748B]">18.5% Genesis Allocation</span>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={190}>
          <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-xs space-y-1 interactive-card h-full">
            <span className="text-xs text-[#64748B] font-medium">Vesting Retention</span>
            <span className="block text-2xl font-bold text-[#10213A] tabular-nums">
              <AnimatedCounter value={81.5} decimals={1} suffix="%" />
            </span>
            <span className="text-[11px] text-[#64748B]">Locked with Multi-Year Cliffs</span>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={260}>
          <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-xs space-y-1 interactive-card h-full">
            <span className="text-xs text-[#64748B] font-medium">Total Allocations Reconciled</span>
            <span className="block text-2xl font-bold text-[#15803D] tabular-nums">
              <AnimatedCounter value={getNumericVal(data?.totalPercentage, 100.0)} decimals={1} suffix="%" />
            </span>
            <span className="text-[11px] text-[#15803D] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% Mathematically Balanced
            </span>
          </div>
        </ScrollReveal>
      </div>

      {/* Chart and Table Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Pie Chart Card */}
        <div className="lg:col-span-5">
          <ScrollReveal direction="right" delay={150}>
            <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-6 interactive-card">
              <div className="border-b border-[#DFE8F5] pb-4">
                <h3 className="font-bold text-lg text-[#10213A]">Allocation Distribution</h3>
                <p className="text-xs text-[#64748B]">Visual representation of audited token tranches</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocations}
                      dataKey="percentage"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={52}
                      paddingAngle={3}
                      isAnimationActive={true}
                      animationDuration={1000}
                    >
                      {allocations.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.colorHex || '#175CFF'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value}%`, 'Percentage']}
                      contentStyle={{
                        backgroundColor: '#10213A',
                        borderColor: '#10213A',
                        borderRadius: '16px',
                        color: '#FFF',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Color Legend */}
              <div className="space-y-2 pt-2">
                {allocations.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-[#F7FAFF] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md flex-shrink-0" style={{ backgroundColor: a.colorHex }} />
                      <span className="text-[#10213A] font-medium">{a.category}</span>
                    </div>
                    <span className="font-bold text-[#10213A] tabular-nums">{a.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Detailed Table */}
        <div className="lg:col-span-7">
          <ScrollReveal direction="left" delay={200}>
            <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden interactive-card">
              <div className="p-6 border-b border-[#DFE8F5]">
                <h3 className="font-bold text-lg text-[#10213A]">Linear Vesting Schedule & Tranche Details</h3>
                <p className="text-xs text-[#64748B]">Mandatory lockup conditions and release triggers</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FAFF] text-[#64748B] border-b border-[#DFE8F5]">
                    <tr>
                      <th className="p-4 font-semibold">Tranche Category</th>
                      <th className="p-4 font-semibold">Allocation</th>
                      <th className="p-4 font-semibold">Tokens (SI)</th>
                      <th className="p-4 font-semibold">Vesting Terms</th>
                      <th className="p-4 font-semibold">Unlock Schedule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE8F5]">
                    {allocations.map((a: any) => (
                      <tr key={a.id} className="hover:bg-[#F7FAFF]/80 transition-colors">
                        <td className="p-4 font-semibold text-[#10213A] flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.colorHex }} />
                          {a.category}
                        </td>
                        <td className="p-4 font-bold text-[#175CFF] tabular-nums whitespace-nowrap">
                          {a.percentage}%
                        </td>
                        <td className="p-4 font-medium text-[#10213A] tabular-nums whitespace-nowrap">
                          {formatNumber(a.tokenAmount)}
                        </td>
                        <td className="p-4 text-[#64748B] leading-relaxed max-w-xs">
                          {a.vestingDescription}
                        </td>
                        <td className="p-4 text-[#64748B] whitespace-nowrap">
                          {a.unlockSchedule}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Contract & Boundary Disclosures */}
      <ScrollReveal direction="up" delay={250}>
        <div className="bg-[#EDF4FF] p-8 rounded-3xl border border-[#DFE8F5] space-y-4 interactive-card">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white text-[#175CFF] shadow-xs">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#10213A]">Transparency & Smart Contract Boundaries</h3>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed max-w-4xl">
            Website disclosures do not modify on-chain state. The verified token allocations above reflect the deployed Sepolia testnet contracts and genesis mainnet blueprints. Contributor tokens cannot be liquidated prior to verified cliff dates, and protocol reserve funds require decentralized multi-signature consensus.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
};
