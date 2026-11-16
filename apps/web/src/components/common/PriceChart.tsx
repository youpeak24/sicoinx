import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../../lib/api';
import { Table, LineChart as ChartIcon, ShieldCheck, Clock } from 'lucide-react';

interface PriceObservation {
  id: string;
  priceUsd: string;
  effectiveTimestamp: string;
  sourceLabel: string;
  changeReason?: string;
  isCorrection?: boolean;
}

export const PriceChart: React.FC<{ initialRange?: '24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL' }> = ({
  initialRange = '30D',
}) => {
  const [range, setRange] = useState<'24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL'>(initialRange);
  const [data, setData] = useState<PriceObservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    setIsLoading(true);
    api
      .get<{ records: PriceObservation[] }>(`/coin/price/history?range=${range}&limit=100`)
      .then((res) => {
        setData(res.records || []);
      })
      .catch((err) => {
        console.error('Failed to load chart history:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [range]);

  const ranges: Array<'24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL'> = [
    '24H',
    '7D',
    '30D',
    '90D',
    '1Y',
    'ALL',
  ];

  // Format data for Recharts
  const chartData = data.map((d) => {
    const date = new Date(d.effectiveTimestamp);
    return {
      time: date.getTime(),
      dateLabel:
        range === '24H'
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      fullDate: date.toLocaleString(),
      price: parseFloat(d.priceUsd),
      priceStr: d.priceUsd,
      sourceLabel: d.sourceLabel,
      changeReason: d.changeReason,
      isCorrection: d.isCorrection,
    };
  });

  const minPrice = chartData.length > 0 ? Math.min(...chartData.map((d) => d.price)) * 0.95 : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map((d) => d.price)) * 1.05 : 2;

  return (
    <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card interactive-card">
      {/* Chart Top Bar: Range controls and View mode toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DFE8F5]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#10213A]">Historical Reference Price</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <ShieldCheck className="w-3 h-3" />
              Audited Records
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Immutable snapshots with explicit provenance and timestamps (UTC stored, localized display)
          </p>
        </div>

        {/* Range Selector Pills & Table Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-[#F7FAFF] p-1 rounded-xl border border-[#DFE8F5]">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 ${
                  range === r
                    ? 'bg-[#175CFF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#10213A] hover:bg-white/60'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
            className="p-2 rounded-xl border border-[#DFE8F5] text-[#64748B] hover:text-[#175CFF] hover:bg-[#F7FAFF] transition-all duration-200 active:scale-95"
            title={viewMode === 'chart' ? 'Show accessible table view' : 'Show interactive chart view'}
            aria-label={viewMode === 'chart' ? 'Show accessible table view' : 'Show interactive chart view'}
          >
            {viewMode === 'chart' ? <Table className="w-4 h-4" /> : <ChartIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart / Table Content */}
      <div className="mt-6 min-h-[320px]">
        {isLoading ? (
          <div className="h-72 flex items-center justify-center text-sm text-[#64748B] animate-fade-in">
            <Clock className="w-5 h-5 animate-spin mr-2 text-[#175CFF]" />
            Loading price telemetry...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-[#64748B] animate-fade-in">
            <p className="font-semibold text-[#10213A]">No observations recorded for range ({range})</p>
            <p className="text-xs mt-1">Price records will populate as new observations are published.</p>
          </div>
        ) : viewMode === 'chart' ? (
          <div className="h-72 w-full animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#175CFF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#175CFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF4FF" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#DFE8F5' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  domain={[minPrice, maxPrice]}
                  tickFormatter={(val) => `$${val.toFixed(2)}`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#10213A] text-white p-3.5 rounded-2xl shadow-2xl text-xs space-y-1 border border-white/10 animate-fade-in-scale">
                          <p className="text-white/60">{item.fullDate}</p>
                          <p className="text-base font-bold text-white tabular-nums">
                            ${item.priceStr} USD
                          </p>
                          <p className="text-[11px] text-[#93C5FD]">{item.sourceLabel}</p>
                          {item.changeReason && (
                            <p className="text-[10px] text-white/70 italic max-w-xs">{item.changeReason}</p>
                          )}
                          {item.isCorrection && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                              Audited Correction
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#175CFF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto border border-[#DFE8F5] rounded-2xl animate-fade-in">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAFF] text-[#64748B] sticky top-0 border-b border-[#DFE8F5]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Price (USD)</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Audit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7FAFF] transition-colors">
                    <td className="p-3 font-medium text-[#10213A]">
                      {new Date(item.effectiveTimestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-[#10213A] tabular-nums">${item.priceUsd}</td>
                    <td className="p-3 text-[#64748B]">{item.sourceLabel}</td>
                    <td className="p-3 text-[#64748B]">
                      {item.changeReason || (item.isCorrection ? 'Correction entry' : 'Scheduled')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#DFE8F5] flex items-center justify-between text-xs text-[#64748B]">
        <span>Granularity: 1 observation per settlement update</span>
        <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
          Verified Cryptographic Continuity
        </span>
      </div>
    </div>
  );
};
