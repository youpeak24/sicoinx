import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { CalculatorWidget } from '../../components/common/CalculatorWidget';
import { PriceChart } from '../../components/common/PriceChart';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { AnimatedCounter } from '../../components/common/animations/AnimatedCounter';
import { MarketMarquee } from '../../components/common/animations/MarketMarquee';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  Database,
  Lock,
  ChevronDown,
  CheckCircle2,
  Clock,
  ExternalLink,
  Wallet,
  Sparkles,
  Info,
  Zap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [priceData, setPriceData] = useState<any>(null);
  const [coinConfig, setCoinConfig] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [ecosystem, setEcosystem] = useState<any[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    // Parallel fetch for homepage telemetry
    api.get('/coin/price').then(setPriceData).catch(console.error);
    api.get('/coin/config').then(setCoinConfig).catch(console.error);
    api.get('/content/announcements').then((d) => setAnnouncements(d.slice(0, 3))).catch(console.error);
    api.get('/content/faq').then((d) => setFaqs(d.slice(0, 6))).catch(console.error);
    api.get('/content/roadmap').then((d) => setRoadmap(d.slice(0, 4))).catch(console.error);
    api.get('/content/ecosystem').then((d) => setEcosystem(d.slice(0, 6))).catch(console.error);
  }, []);

  const formatSupply = (val: string | number) => {
    const n = typeof val === 'number' ? val : parseFloat(val || '0');
    return new Intl.NumberFormat('en-US').format(n);
  };

  const getNumericSupply = (val: string | number | undefined, fallback: number) => {
    if (!val) return fallback;
    const n = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(n) ? fallback : n;
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-x-hidden">
      {/* ==============================================================
          HERO SECTION
          ============================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-28 bg-gradient-to-b from-[#EDF4FF] via-[#F7FAFF] to-[#F7FAFF] border-b border-[#DFE8F5]">
        {/* Animated ambient mesh gradient blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#175CFF]/10 rounded-full blur-3xl -z-10 pointer-events-none animate-blob" />
        <div className="absolute -top-12 -right-12 w-[520px] h-[520px] bg-gradient-to-br from-[#175CFF]/15 via-cyan-400/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none animate-float-slow" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-300/10 rounded-full blur-2xl -z-10 pointer-events-none animate-blob animation-delay-300" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <ScrollReveal direction="down" duration={500}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DFE8F5] shadow-xs hover:border-[#175CFF]/40 transition-colors">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#175CFF] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#175CFF]" />
                  </span>
                  <span className="text-xs font-bold tracking-wide uppercase text-[#123B9A]">
                    Official SI Coin Ecosystem
                  </span>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100} duration={600}>
                <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold text-[#10213A] tracking-tight leading-[1.08]">
                  A Clearer Way to Explore <span className="text-[#175CFF] bg-gradient-to-r from-[#175CFF] via-blue-600 to-[#123B9A] bg-clip-text text-transparent">Digital Value.</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={200} duration={600}>
                <p className="text-lg sm:text-xl text-[#64748B] leading-relaxed max-w-2xl">
                  Discover SI Coin through transparent information, simple tools, and one connected ecosystem.
                  Audited reference pricing, verified tokenomics, and strict non-custodial architecture.
                </p>
              </ScrollReveal>

              {/* CTAs */}
              <ScrollReveal direction="up" delay={300} duration={600}>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/register"
                    className="relative overflow-hidden inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-white bg-[#175CFF] hover:bg-[#123B9A] shadow-elevated transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                    <Sparkles className="w-4 h-4 text-white/90" />
                    <span>Explore SI Coin</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/whitepaper"
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-[#10213A] bg-white border border-[#DFE8F5] hover:bg-[#F7FAFF] hover:border-[#175CFF] transition-all duration-200 shadow-xs hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Read Whitepaper
                  </Link>
                </div>
              </ScrollReveal>

              {/* Verified Product Attributes Row */}
              <ScrollReveal direction="up" delay={400} duration={600}>
                <div className="pt-6 border-t border-[#DFE8F5] grid grid-cols-3 gap-4 text-left">
                  <div className="p-2 rounded-xl transition-colors hover:bg-white/60">
                    <span className="block text-xs text-[#64748B]">Fixed Supply</span>
                    <span className="text-sm sm:text-base font-bold text-[#10213A] tabular-nums">
                      {coinConfig?.totalSupply ? (
                        <AnimatedCounter value={getNumericSupply(coinConfig.totalSupply, 100000000)} suffix=" SI" />
                      ) : (
                        '100,000,000 SI'
                      )}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl transition-colors hover:bg-white/60">
                    <span className="block text-xs text-[#64748B]">Network Stage</span>
                    <span className="text-sm sm:text-base font-bold text-[#15803D] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
                      Sepolia Preview
                    </span>
                  </div>
                  <div className="p-2 rounded-xl transition-colors hover:bg-white/60">
                    <span className="block text-xs text-[#64748B]">Custody Model</span>
                    <span className="text-sm sm:text-base font-bold text-[#10213A]">
                      100% Non-Custodial
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Hero Column: Authentic Market Interface Preview Card */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="left" delay={250} duration={700}>
                <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#DFE8F5] p-6 sm:p-7 shadow-elevated relative animate-float transition-all hover:shadow-2xl">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#DFE8F5]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#175CFF] to-[#123B9A] p-2 flex items-center justify-center shadow-xs transition-transform duration-300 hover:rotate-6">
                        <img src="/si-monogram.svg" alt="SI" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm text-[#10213A]">SI Coin Reference Feed</h2>
                        <span className="text-[11px] text-[#64748B] block">Ticker: SI • USD Benchmark</span>
                      </div>
                    </div>
                    {priceData?.isDemoData ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                        Demo Data
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#15803D] border border-emerald-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Price Display */}
                  <div className="py-5 space-y-1.5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#10213A] tabular-nums tracking-tight">
                        ${priceData?.priceUsd || '1.250000'}
                      </span>
                      <span className="text-xs font-semibold text-[#64748B]">USD</span>

                      {priceData?.change24h && (
                        <span
                          className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-lg text-xs font-bold tabular-nums transition-transform duration-200 hover:scale-105 ${
                            priceData.change24h.direction === 'up'
                              ? 'bg-emerald-50 text-[#15803D] border border-emerald-100'
                              : 'bg-red-50 text-[#DC2626] border border-red-100'
                          }`}
                        >
                          {priceData.change24h.direction === 'up' ? '+' : '-'}
                          {priceData.change24h.percentage.toFixed(2)}%
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#64748B]">
                      Source: <strong className="text-[#10213A] font-medium">{priceData?.sourceLabel || 'Administrator-set reference price'}</strong>
                    </p>
                  </div>

                  {/* Mini Preview Chart with SVG animation */}
                  <div className="h-32 bg-[#F7FAFF] rounded-2xl border border-[#DFE8F5] p-3.5 flex flex-col justify-between transition-colors hover:border-[#175CFF]/30">
                    <div className="flex justify-between items-center text-[10px] text-[#64748B]">
                      <span>30-Day Snapshot Progression</span>
                      <span className="tabular-nums">
                        Updated {priceData?.effectiveTimestamp ? new Date(priceData.effectiveTimestamp).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>
                    {/* Stylized vector trendline */}
                    <div className="h-16 flex items-end overflow-hidden">
                      <svg viewBox="0 0 300 70" fill="none" className="w-full h-full">
                        <path
                          d="M0,55 Q40,50 80,42 T160,35 T240,18 T300,10"
                          stroke="#175CFF"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M0,55 Q40,50 80,42 T160,35 T240,18 T300,10 L300,70 L0,70 Z"
                          fill="url(#heroGrad)"
                          opacity="0.18"
                        />
                        <defs>
                          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#175CFF" />
                            <stop offset="100%" stopColor="#EDF4FF" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* Card Footnote */}
                  <div className="mt-4 pt-3 border-t border-[#DFE8F5] flex items-center justify-between text-xs text-[#64748B]">
                    <Link to="/market" className="text-[#175CFF] font-semibold hover:underline flex items-center gap-1 group">
                      <span>Explore Market Data</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <span className="text-[11px] text-[#94A3B8]">UTC Stored • Non-Executable</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          LIVE TELEMETRY TICKER MARQUEE
          ============================================================== */}
      <div className="-mt-16 sm:-mt-20 relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" delay={200} duration={500}>
          <div className="rounded-2xl overflow-hidden shadow-card">
            <MarketMarquee
              priceUsd={priceData?.priceUsd || '1.250000'}
              changePercentage={priceData?.change24h?.percentage || 2.45}
            />
          </div>
        </ScrollReveal>
      </div>

      {/* ==============================================================
          MARKET OVERVIEW STRIP
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <ScrollReveal direction="up" delay={150}>
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#DFE8F5] interactive-card">
            <div className="space-y-1">
              <span className="text-xs text-[#64748B] font-medium">Reference Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#10213A] tabular-nums">
                  ${priceData?.priceUsd || '1.250000'}
                </span>
                <span className="text-xs text-[#64748B]">USD</span>
              </div>
              <span className="text-[11px] text-[#64748B] block truncate">
                {priceData?.sourceLabel || 'Administrator-set'}
              </span>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:pl-6">
              <span className="text-xs text-[#64748B] font-medium">Circulating Supply</span>
              <div className="text-2xl sm:text-3xl font-bold text-[#10213A] tabular-nums">
                <AnimatedCounter
                  value={getNumericSupply(coinConfig?.circulatingSupply, 18500000)}
                />
              </div>
              <span className="text-[11px] text-[#64748B] block">18.5% of Total Supply</span>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:pl-6">
              <span className="text-xs text-[#64748B] font-medium">Total Supply</span>
              <div className="text-2xl sm:text-3xl font-bold text-[#10213A] tabular-nums">
                <AnimatedCounter
                  value={getNumericSupply(coinConfig?.totalSupply, 100000000)}
                />
              </div>
              <span className="text-[11px] text-[#64748B] block">Fixed at Bytecode Level</span>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:pl-6">
              <span className="text-xs text-[#64748B] font-medium">Reference Valuation</span>
              <div className="text-2xl sm:text-3xl font-bold text-[#175CFF] tabular-nums">
                <AnimatedCounter
                  value={getNumericSupply(priceData?.marketCapUsd, 23125000)}
                  prefix="$"
                />
              </div>
              <span className="text-[11px] text-[#64748B] block">
                Calculated via ref rate × float
              </span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ==============================================================
          WHAT IS SI COIN?
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <ScrollReveal direction="up">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF4FF] text-xs font-bold uppercase tracking-wider text-[#123B9A]">
                Ecosystem Principles
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10213A] tracking-tight mt-2">
                Engineered for Complete Transparency, Not Speculative Gimmicks.
              </h2>
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed mt-4">
                SI Coin is an institutional digital asset built upon mathematical accountability. 
                While conventional projects obscure insider tokens, manufacture inflated trading volume, or promise unrealistic daily yields, SI Coin enforces absolute clarity across reference valuations, vesting schedules, and non-custodial boundaries.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={150}>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-2xl transition-colors hover:bg-white border border-transparent hover:border-[#DFE8F5]">
                  <CheckCircle2 className="w-5 h-5 text-[#175CFF] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#10213A]">Audited Supply & Vesting</h4>
                    <p className="text-xs text-[#64748B]">100% of tokens are mathematically accounted for with strict linear cliffs and public release tables.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl transition-colors hover:bg-white border border-transparent hover:border-[#DFE8F5]">
                  <CheckCircle2 className="w-5 h-5 text-[#175CFF] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#10213A]">Non-Custodial Integrity</h4>
                    <p className="text-xs text-[#64748B]">We never request, store, or process user private keys or seed phrases. Wallet integration uses cryptographic challenge signing exclusively.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl transition-colors hover:bg-white border border-transparent hover:border-[#DFE8F5]">
                  <CheckCircle2 className="w-5 h-5 text-[#175CFF] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#10213A]">Open Technical Disclosures</h4>
                    <p className="text-xs text-[#64748B]">Clear boundaries separate planned features from deployed capabilities, ensuring users are never misled.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={250}>
              <div className="pt-2">
                <Link to="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#175CFF] hover:text-[#123B9A] transition-colors group">
                  <span>Learn more about our architectural framework</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Info Panel */}
          <div className="lg:col-span-6">
            <ScrollReveal direction="left" delay={200}>
              <div className="bg-[#EDF4FF] rounded-3xl p-8 border border-[#DFE8F5] space-y-6 interactive-card">
                <h3 className="text-xl font-bold text-[#10213A]">Protocol Specification Summary</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#DFE8F5] space-y-1 transition-all hover:border-[#175CFF]/40 shadow-xs">
                    <span className="text-xs text-[#64748B]">Asset Name</span>
                    <span className="block font-bold text-base text-[#10213A]">{coinConfig?.tokenName || 'SI Coin'}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#DFE8F5] space-y-1 transition-all hover:border-[#175CFF]/40 shadow-xs">
                    <span className="text-xs text-[#64748B]">Provisional Ticker</span>
                    <span className="block font-bold text-base text-[#175CFF]">{coinConfig?.ticker || 'SI'}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#DFE8F5] space-y-1 transition-all hover:border-[#175CFF]/40 shadow-xs">
                    <span className="text-xs text-[#64748B]">Precision Decimals</span>
                    <span className="block font-bold text-base text-[#10213A] tabular-nums">
                      {coinConfig?.decimals ?? 6} Decimals
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#DFE8F5] space-y-1 transition-all hover:border-[#175CFF]/40 shadow-xs">
                    <span className="text-xs text-[#64748B]">Max Total Supply</span>
                    <span className="block font-bold text-base text-[#10213A] tabular-nums">100,000,000 SI</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#DFE8F5] space-y-2 transition-all hover:border-[#175CFF]/40 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Testnet Deployment Contract</span>
                    <span className="font-mono text-[11px] text-[#175CFF] truncate max-w-[200px]">
                      {coinConfig?.contractAddress || '0x32A89F07211C824bA7D18fEc31548e658Ec0989b'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Deployed on Ethereum Sepolia for static analysis and bug bounty verification.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ==============================================================
          PLATFORM FEATURES
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF4FF] text-xs font-bold uppercase tracking-wider text-[#123B9A]">
              Core Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10213A] tracking-tight">
              Designed for Clarity, Built for Verification
            </h2>
            <p className="text-base text-[#64748B]">
              Explore the essential tools and architectural layers powering the SI Coin ecosystem.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal direction="up" delay={100}>
            <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-4 hover:border-[#175CFF] transition-all duration-300 transform hover:-translate-y-2 group interactive-card">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF4FF] text-[#175CFF] flex items-center justify-center group-hover:bg-[#175CFF] group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-xs">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#10213A]">Transparent Telemetry</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Every displayed rate discloses exact provenance, whether set manually by authorized staff or polled from external oracles.
              </p>
              <span className="inline-block text-xs font-semibold text-[#15803D] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Implemented & Verified
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-4 hover:border-[#175CFF] transition-all duration-300 transform hover:-translate-y-2 group interactive-card">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF4FF] text-[#175CFF] flex items-center justify-center group-hover:bg-[#175CFF] group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#10213A]">Cryptographic Wallet Link</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Verify Web3 wallet ownership using single-use challenge nonces with zero private key transmission.
              </p>
              <span className="inline-block text-xs font-semibold text-[#15803D] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Implemented & Non-Custodial
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-4 hover:border-[#175CFF] transition-all duration-300 transform hover:-translate-y-2 group interactive-card">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF4FF] text-[#175CFF] flex items-center justify-center group-hover:bg-[#175CFF] group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-xs">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#10213A]">Decentralized Governance</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Community voting module designed for protocol upgrades, allocation approvals, and parameter changes.
              </p>
              <span className="inline-block text-xs font-semibold text-[#B45309] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                Planned (Mainnet Phase)
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==============================================================
          TOKEN VALUE CALCULATOR & HISTORICAL CHART
          ============================================================== */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF4FF] text-xs font-bold uppercase tracking-wider text-[#123B9A]">
              Financial Telemetry
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10213A] tracking-tight">
              Interactive Calculator & Historical Price Data
            </h2>
            <p className="text-base text-[#64748B]">
              Examine mathematical valuation models and inspect historical snapshots recorded directly in the database.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <ScrollReveal direction="right" delay={150}>
              <CalculatorWidget initialPriceUsd={priceData?.priceUsd} sourceLabel={priceData?.sourceLabel} />
            </ScrollReveal>
          </div>
          <div className="lg:col-span-7">
            <ScrollReveal direction="left" delay={200}>
              <PriceChart initialRange="30D" />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ==============================================================
          TOKENOMICS PREVIEW
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="bg-[#EDF4FF] rounded-3xl p-8 sm:p-12 border border-[#DFE8F5] interactive-card">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#123B9A]">
                  Distribution Model
                </span>
                <h2 className="text-3xl font-extrabold text-[#10213A] tracking-tight mt-1">
                  Audited Tokenomics & Vesting
                </h2>
                <p className="text-sm text-[#64748B] mt-1 max-w-xl">
                  100% of the 100,000,000 SI fixed supply is strictly allocated. Publication requires absolute mathematical reconciliation.
                </p>
              </div>
              <Link
                to="/tokenomics"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-[#DFE8F5] text-sm font-semibold text-[#10213A] hover:text-[#175CFF] hover:border-[#175CFF] transition-all shadow-xs self-start md:self-auto hover:-translate-y-0.5 group"
              >
                <span>Full Allocation Schedule</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#DFE8F5] space-y-2 transition-all hover:border-[#175CFF]/40 hover:-translate-y-1 shadow-xs">
                <span className="text-xs text-[#64748B]">Ecosystem & Community</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-[#175CFF] tabular-nums">35.0%</span>
                  <span className="text-xs text-[#64748B] tabular-nums">35M SI</span>
                </div>
                <p className="text-xs text-[#64748B]">4-year linear schedule for developer grants and node telemetry incentives.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#DFE8F5] space-y-2 transition-all hover:border-[#175CFF]/40 hover:-translate-y-1 shadow-xs">
                <span className="text-xs text-[#64748B]">Public Float & Liquidity</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-[#123B9A] tabular-nums">25.0%</span>
                  <span className="text-xs text-[#64748B] tabular-nums">25M SI</span>
                </div>
                <p className="text-xs text-[#64748B]">DEX/CEX liquidity provisioning reserves deployed upon mainnet genesis.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#DFE8F5] space-y-2 transition-all hover:border-[#175CFF]/40 hover:-translate-y-1 shadow-xs">
                <span className="text-xs text-[#64748B]">Core Engineering</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-[#3B82F6] tabular-nums">20.0%</span>
                  <span className="text-xs text-[#64748B] tabular-nums">20M SI</span>
                </div>
                <p className="text-xs text-[#64748B]">3-year retention schedule with mandatory 12-month cliff protections.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ==============================================================
          ROADMAP TIMELINE
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF4FF] text-xs font-bold uppercase tracking-wider text-[#123B9A]">
              Technical Milestones
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10213A] tracking-tight">
              Verifiable Development Roadmap
            </h2>
            <p className="text-base text-[#64748B]">
              All dates represent engineering targets subject to rigorous security audits rather than speculative guarantees.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmap.map((phase, idx) => (
            <ScrollReveal key={phase.id || idx} direction="up" delay={idx * 100}>
              <div
                className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card flex flex-col justify-between space-y-4 relative interactive-card h-full"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#175CFF] tracking-wider">
                      {phase.phaseNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        phase.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-[#15803D]'
                          : phase.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-[#175CFF]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {phase.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#10213A]">{phase.phaseTitle}</h3>
                  <span className="text-xs font-semibold text-[#64748B] block">{phase.targetPeriod}</span>

                  <ul className="space-y-1.5 pt-2">
                    {phase.milestones?.map((m: string, mIdx: number) => (
                      <li key={mIdx} className="text-xs text-[#64748B] flex items-start gap-1.5 leading-snug">
                        <span className="text-[#175CFF] font-bold">›</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {phase.isTargetEstimate && (
                  <div className="pt-2 border-t border-[#DFE8F5] text-[10px] text-[#94A3B8] italic">
                    * Target estimate, not financial guarantee
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ==============================================================
          HOW IT WORKS
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF4FF] text-xs font-bold uppercase tracking-wider text-[#123B9A]">
              User Journey
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10213A] tracking-tight">
              How to Participate in SI Coin
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ScrollReveal direction="up" delay={50}>
            <div className="p-6 rounded-3xl bg-white border border-[#DFE8F5] space-y-3 shadow-xs interactive-card h-full">
              <span className="w-10 h-10 rounded-2xl bg-[#175CFF] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                1
              </span>
              <h4 className="font-bold text-base text-[#10213A]">Create an Account</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Register with your email to access the protected user dashboard and audit tools.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150}>
            <div className="p-6 rounded-3xl bg-white border border-[#DFE8F5] space-y-3 shadow-xs interactive-card h-full">
              <span className="w-10 h-10 rounded-2xl bg-[#175CFF] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                2
              </span>
              <h4 className="font-bold text-base text-[#10213A]">Explore Telemetry</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Review live reference pricing, test calculations, and analyze verified supply disclosures.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={250}>
            <div className="p-6 rounded-3xl bg-white border border-[#DFE8F5] space-y-3 shadow-xs interactive-card h-full">
              <span className="w-10 h-10 rounded-2xl bg-[#175CFF] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                3
              </span>
              <h4 className="font-bold text-base text-[#10213A]">Link Web3 Wallet</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Optionally link a supported wallet using cryptographic challenge signing without custody risk.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={350}>
            <div className="p-6 rounded-3xl bg-white border border-[#DFE8F5] space-y-3 shadow-xs interactive-card h-full">
              <span className="w-10 h-10 rounded-2xl bg-[#175CFF] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                4
              </span>
              <h4 className="font-bold text-base text-[#10213A]">Follow Updates</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Track progress reports, participate in testnet milestones, and submit technical tickets.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==============================================================
          LATEST ANNOUNCEMENTS
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#123B9A]">
                Project Communications
              </span>
              <h2 className="text-3xl font-extrabold text-[#10213A] tracking-tight mt-1">
                Latest Announcements
              </h2>
            </div>
            <Link
              to="/announcements"
              className="text-sm font-semibold text-[#175CFF] hover:underline flex items-center gap-1 self-start sm:self-auto group"
            >
              <span>All Announcements</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((item, idx) => (
            <ScrollReveal key={item.id} direction="up" delay={idx * 100}>
              <Link
                to={`/announcements/${item.slug}`}
                className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card hover:border-[#175CFF] transition-all flex flex-col justify-between space-y-4 group interactive-card h-full"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-semibold text-[#175CFF] bg-[#EDF4FF] px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span>{new Date(item.publishedAt || item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-base text-[#10213A] group-hover:text-[#175CFF] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-2 text-xs font-semibold text-[#175CFF] flex items-center gap-1">
                  <span>Read Update</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ==============================================================
          FAQ ACCORDIONS
          ============================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF4FF] text-xs font-bold uppercase tracking-wider text-[#123B9A]">
              Clarifications
            </div>
            <h2 className="text-3xl font-extrabold text-[#10213A] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-[#64748B]">
              Clear, unambiguous answers about SI Coin tokenomics, pricing, and boundaries.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqId === faq.id;
            return (
              <ScrollReveal key={faq.id} direction="up" delay={idx * 60}>
                <div
                  className="bg-white rounded-2xl border border-[#DFE8F5] shadow-xs overflow-hidden transition-all duration-200 hover:border-[#175CFF]/30"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#10213A] hover:bg-[#F7FAFF] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748B] transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'transform rotate-180 text-[#175CFF]' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-5 pt-1 text-xs text-[#64748B] leading-relaxed border-t border-[#DFE8F5]/50 bg-[#F7FAFF]/40">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal direction="up" delay={200}>
          <div className="text-center mt-8">
            <Link to="/faq" className="text-sm font-semibold text-[#175CFF] hover:underline inline-flex items-center gap-1 group">
              <span>View all frequently asked questions</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ==============================================================
          FINAL STRONG BLUE CTA SECTION
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="rounded-3xl bg-gradient-to-r from-[#175CFF] via-[#123B9A] to-[#10213A] text-white p-8 sm:p-16 relative overflow-hidden shadow-elevated">
            {/* Animated subtle ambient glow circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none animate-blob" />
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none animate-float-slow" />

            <div className="relative z-10 max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 text-xs font-semibold tracking-wider uppercase backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Verified Protocol Architecture
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Ready to Explore Verifiable Digital Value?
              </h2>

              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                Create your account today to inspect the live portfolio sandbox, review technical specifications, and connect with our research community.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="px-7 py-4 rounded-2xl bg-white text-[#123B9A] hover:bg-[#EDF4FF] font-bold text-sm shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/whitepaper"
                  className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                >
                  Review Whitepaper
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
