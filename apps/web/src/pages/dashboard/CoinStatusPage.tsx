import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../../lib/api';
import { useWallet } from '../../context/WalletContext';
import {
  TrendingUp,
  ShieldCheck,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Activity,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';

export const CoinStatusPage: React.FC = () => {
  const { referencePriceUsd, referencePriceInr } = useWallet();
  const [range, setRange] = useState<'1H' | '24H' | '7D' | '1M' | '1Y' | 'ALL'>('24H');
  const [chartType, setChartType] = useState<'area' | 'line' | 'volume'>('area');
  const [showSma, setShowSma] = useState<boolean>(true);
  const [copiedContract, setCopiedContract] = useState(false);

  // Live fluctuating price simulation
  const [livePrice, setLivePrice] = useState<number>(referencePriceUsd);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.49) * 0.003;
      setLivePrice((prev) => {
        const next = Math.max(1.20, Math.min(1.30, prev + delta));
        setPriceFlash(next >= prev ? 'up' : 'down');
        setTimeout(() => setPriceFlash(null), 800);
        return parseFloat(next.toFixed(6));
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Generate realistic chart data based on timeframe
  const generateData = () => {
    const pointsCount = range === '1H' ? 24 : range === '24H' ? 24 : range === '7D' ? 28 : range === '1M' ? 30 : 50;
    const base = 1.25;
    const data = [];
    const now = Date.now();
    const stepMs =
      range === '1H'
        ? 60 * 1000 * 2.5
        : range === '24H'
        ? 3600 * 1000
        : range === '7D'
        ? 6 * 3600 * 1000
        : 24 * 3600 * 1000;

    let current = range === 'ALL' ? 0.98 : range === '1Y' ? 1.05 : base * 0.97;

    for (let i = pointsCount; i >= 0; i--) {
      const time = new Date(now - i * stepMs);
      const volatility = 0.008;
      current += (Math.random() - 0.47) * volatility;
      if (current < 0.9) current = 0.92;
      const vol = Math.floor(12000 + Math.random() * 45000);
      const sma = current * (1 + (Math.sin(i / 3) * 0.005));

      data.push({
        time: time.getTime(),
        label:
          range === '1H' || range === '24H'
            ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : time.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        price: parseFloat(current.toFixed(4)),
        sma: parseFloat(sma.toFixed(4)),
        volume: vol,
      });
    }
    return data;
  };

  const chartData = generateData();

  // Simulated Order Book
  const orderBookAsks = [
    { price: (livePrice + 0.0035).toFixed(4), amount: '12,500', total: ((livePrice + 0.0035) * 12500).toFixed(0) },
    { price: (livePrice + 0.0022).toFixed(4), amount: '8,400', total: ((livePrice + 0.0022) * 8400).toFixed(0) },
    { price: (livePrice + 0.0011).toFixed(4), amount: '5,200', total: ((livePrice + 0.0011) * 5200).toFixed(0) },
  ];

  const orderBookBids = [
    { price: (livePrice - 0.0009).toFixed(4), amount: '7,800', total: ((livePrice - 0.0009) * 7800).toFixed(0) },
    { price: (livePrice - 0.0018).toFixed(4), amount: '14,200', total: ((livePrice - 0.0018) * 14200).toFixed(0) },
    { price: (livePrice - 0.0031).toFixed(4), amount: '22,900', total: ((livePrice - 0.0031) * 22900).toFixed(0) },
  ];

  // Simulated Recent Trades
  const recentTrades = [
    { id: '1', time: '13:48:12', type: 'BUY', amount: '1,500 SI', price: `$${livePrice.toFixed(4)}` },
    { id: '2', time: '13:47:55', type: 'BUY', amount: '500 SI', price: `$${(livePrice - 0.0005).toFixed(4)}` },
    { id: '3', time: '13:47:20', type: 'SELL', amount: '250 SI', price: `$${(livePrice - 0.0008).toFixed(4)}` },
    { id: '4', time: '13:46:48', type: 'BUY', amount: '3,200 SI', price: `$${(livePrice + 0.0002).toFixed(4)}` },
  ];

  const copyContract = () => {
    navigator.clipboard.writeText('0x32A89F07211C824bA7D18fEc31548e658Ec0989b');
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Top Banner: Real-Time Coin Status & Price Header */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
              Live Real-Time Market Status
            </span>
            <span className="text-xs text-[#64748B]">• Sepolia Testnet Preview</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-4">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums transition-colors duration-300 ${
                  priceFlash === 'up'
                    ? 'text-[#15803D]'
                    : priceFlash === 'down'
                    ? 'text-[#DC2626]'
                    : 'text-[#10213A]'
                }`}
              >
                ${livePrice.toFixed(6)}
              </span>
              <span className="text-sm font-bold text-[#64748B]">USD</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-extrabold text-[#15803D] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
              <span>+$0.0415 (+3.42% 24h)</span>
            </div>

            <div className="text-sm font-semibold text-[#64748B]">
              ≈ ₹{(livePrice * (referencePriceInr / referencePriceUsd)).toFixed(2)} INR
            </div>
          </div>

          <p className="text-xs text-[#64748B]">
            Automated reference valuation grounded in immutable price observation ledgers.
          </p>
        </div>

        {/* Quick Buy CTA & Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard/purchase"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#123B9A] via-[#175CFF] to-[#38BDF8] text-white text-xs font-extrabold shadow-elevated hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Acquire SI Coins</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI 4-Card Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-[#DFE8F5] shadow-card space-y-1">
          <span className="text-xs text-[#64748B]">24h High / Low</span>
          <div className="text-sm sm:text-base font-bold text-[#10213A] tabular-nums">
            ${(livePrice * 1.025).toFixed(4)} / ${(livePrice * 0.975).toFixed(4)}
          </div>
          <span className="text-[11px] text-[#64748B]">Spread: 0.16%</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#DFE8F5] shadow-card space-y-1">
          <span className="text-xs text-[#64748B]">24h Trading Volume</span>
          <div className="text-sm sm:text-base font-bold text-[#175CFF] tabular-nums">
            $428,950 USD
          </div>
          <span className="text-[11px] text-[#15803D] font-semibold">343,160 SI traded</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#DFE8F5] shadow-card space-y-1">
          <span className="text-xs text-[#64748B]">Circulating Supply</span>
          <div className="text-sm sm:text-base font-bold text-[#10213A] tabular-nums">
            18,500,000 SI
          </div>
          <span className="text-[11px] text-[#64748B]">18.5% of 100M total</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#DFE8F5] shadow-card space-y-1">
          <span className="text-xs text-[#64748B]">Market Capitalization</span>
          <div className="text-sm sm:text-base font-bold text-[#10213A] tabular-nums">
            ${(18500000 * livePrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
          </div>
          <span className="text-[11px] text-[#64748B]">Ref rate × float</span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6">
        {/* Controls Bar: Timeframes, Chart Mode, Indicators */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE8F5]">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#175CFF]" />
            <div>
              <h2 className="font-bold text-base text-[#10213A]">Interactive Time-Series Telemetry</h2>
              <span className="text-xs text-[#64748B]">Real-time and historical price curve</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe Selector */}
            <div className="flex bg-[#F7FAFF] p-1 rounded-xl border border-[#DFE8F5]">
              {(['1H', '24H', '7D', '1M', '1Y', 'ALL'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    range === r
                      ? 'bg-[#175CFF] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#10213A]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Chart Type Toggle */}
            <div className="flex bg-[#F7FAFF] p-1 rounded-xl border border-[#DFE8F5]">
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  chartType === 'area' ? 'bg-white text-[#175CFF] shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  chartType === 'line' ? 'bg-white text-[#175CFF] shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('volume')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  chartType === 'volume' ? 'bg-white text-[#175CFF] shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Vol
              </button>
            </div>

            {/* SMA 20 Overlay Toggle */}
            <button
              onClick={() => setShowSma(!showSma)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                showSma
                  ? 'bg-[#EDF4FF] border-[#175CFF] text-[#123B9A]'
                  : 'bg-[#F7FAFF] border-[#DFE8F5] text-[#64748B]'
              }`}
            >
              SMA (20)
            </button>
          </div>
        </div>

        {/* The Recharts Graphic */}
        <div className="h-80 sm:h-96 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="siPriceGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#175CFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#175CFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE8F5" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val.toFixed(2)}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#10213A] text-white p-3 rounded-2xl shadow-xl text-xs space-y-1">
                          <span className="text-[10px] text-gray-300 block">{item.label}</span>
                          <div className="font-extrabold text-sm text-[#38BDF8]">
                            ${item.price.toFixed(4)} USD
                          </div>
                          {showSma && (
                            <div className="text-[10px] text-amber-300">
                              SMA(20): ${item.sma.toFixed(4)}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400">
                            Volume: {item.volume.toLocaleString()} SI
                          </div>
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
                  fill="url(#siPriceGlow)"
                />
                {showSma && (
                  <Line
                    type="monotone"
                    dataKey="sma"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    dot={false}
                    strokeDasharray="4 4"
                  />
                )}
              </AreaChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE8F5" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val.toFixed(2)}`}
                />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#175CFF" strokeWidth={2.5} dot={false} />
                {showSma && <Line type="monotone" dataKey="sma" stroke="#F59E0B" strokeWidth={1.5} dot={false} />}
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE8F5" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="volume" fill="#175CFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Order Book & Live Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simulated Order Book */}
        <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
            <h3 className="font-bold text-base text-[#10213A] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#175CFF]" />
              Market Depth & Order Book
            </h3>
            <span className="text-[11px] font-bold text-[#64748B]">Spread: 0.16%</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Asks (Sell Orders) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider block">
                Asks (Sells)
              </span>
              {orderBookAsks.map((ask, i) => (
                <div key={i} className="flex justify-between p-2 rounded-lg bg-red-50/50 text-[#10213A]">
                  <span className="font-mono font-bold text-[#DC2626]">${ask.price}</span>
                  <span className="font-mono text-[#64748B]">{ask.amount} SI</span>
                  <span className="font-mono font-semibold">${ask.total}</span>
                </div>
              ))}
            </div>

            {/* Current Price Divider */}
            <div className="py-2 px-3 bg-[#EDF4FF] rounded-xl flex items-center justify-between border border-[#DFE8F5]">
              <span className="font-bold text-xs text-[#123B9A]">Market Mid Rate</span>
              <span className="font-mono font-extrabold text-[#175CFF]">${livePrice.toFixed(4)} USD</span>
            </div>

            {/* Bids (Buy Orders) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">
                Bids (Buys)
              </span>
              {orderBookBids.map((bid, i) => (
                <div key={i} className="flex justify-between p-2 rounded-lg bg-emerald-50/50 text-[#10213A]">
                  <span className="font-mono font-bold text-[#15803D]">${bid.price}</span>
                  <span className="font-mono text-[#64748B]">{bid.amount} SI</span>
                  <span className="font-mono font-semibold">${bid.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Trades Stream */}
        <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
            <h3 className="font-bold text-base text-[#10213A] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#175CFF]" />
              Recent Market Trades
            </h3>
            <span className="text-[10px] text-[#15803D] font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-ping" /> Live
            </span>
          </div>

          <div className="divide-y divide-[#DFE8F5] text-xs">
            {recentTrades.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    t.type === 'BUY' ? 'bg-emerald-50 text-[#15803D]' : 'bg-red-50 text-[#DC2626]'
                  }`}>
                    {t.type}
                  </span>
                  <span className="font-mono font-bold text-[#10213A]">{t.amount}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#10213A] block">{t.price}</span>
                  <span className="text-[10px] text-[#64748B]">{t.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Smart Contract Proof */}
          <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#10213A]">Sepolia Preview Smart Contract</span>
              <a
                href="https://sepolia.etherscan.io/address/0x32A89F07211C824bA7D18fEc31548e658Ec0989b"
                target="_blank"
                rel="noreferrer"
                className="text-[#175CFF] font-semibold flex items-center gap-1 hover:underline"
              >
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono text-[11px] text-[#64748B] truncate">
                0x32A89F07211C824bA7D18fEc31548e658Ec0989b
              </code>
              <button
                onClick={copyContract}
                className="p-1 rounded bg-white border border-[#DFE8F5] text-[#175CFF] hover:bg-[#EDF4FF]"
                title="Copy Address"
              >
                {copiedContract ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
