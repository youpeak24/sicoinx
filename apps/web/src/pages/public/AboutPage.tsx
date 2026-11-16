import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import { ShieldCheck, Lock, CheckCircle2, FileText, ArrowRight, Eye, Scale, Compass, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20">
      {/* Page Header */}
      <ScrollReveal direction="up">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#175CFF] bg-[#EDF4FF] px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            About the Protocol
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#10213A] tracking-tight">
            A Clearer Standard for Cryptographic Value
          </h1>
          <p className="text-lg text-[#64748B] leading-relaxed">
            SI Coin was founded to eliminate opacity in digital assets by replacing misleading marketing claims with mathematical accountability and verifiable provenance.
          </p>
        </div>
      </ScrollReveal>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ScrollReveal direction="up" delay={100}>
          <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-4 interactive-card h-full">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF4FF] text-[#175CFF] flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-xs">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#10213A]">Absolute Provenance</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Every displayed price observation retains an immutable record: whether established by an authorized administrator, an external oracle, or testnet metrics.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200}>
          <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-4 interactive-card h-full">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF4FF] text-[#175CFF] flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#10213A]">100% Reconciled Allocations</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              We strictly forbid arbitrary or unallocated token supply. Exactly 100% of the 100,000,000 SI total supply is mathematically mapped to audited linear vesting tranches.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={300}>
          <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-4 interactive-card h-full">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF4FF] text-[#175CFF] flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#10213A]">Non-Custodial Architecture</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Users retain sole control over their assets. We never ask for, hold, or transmit private keys, seed phrases, or custody credentials.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Architectural Boundaries & Non-Speculation Declaration */}
      <ScrollReveal direction="up" delay={200}>
        <div className="bg-[#EDF4FF] rounded-3xl p-8 sm:p-12 border border-[#DFE8F5] space-y-6 interactive-card">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#175CFF]" />
            <h2 className="text-2xl font-bold text-[#10213A]">Explicit Financial Boundaries</h2>
          </div>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-4xl">
            Unlike speculative cryptocurrency platforms, SI Coin explicitly rejects artificial return packages, guaranteed yields, referral pyramids, or inflated trading volume. 
            Website metadata changes never alter smart contract bytecodes, and administrative reference prices do not represent an executable exchange quote.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="bg-white p-5 rounded-2xl border border-[#DFE8F5] space-y-1 transition-all hover:border-[#175CFF]/30 hover:-translate-y-0.5 shadow-xs">
              <span className="font-bold text-sm text-[#10213A] block">No Guaranteed Yields</span>
              <span className="text-xs text-[#64748B]">
                We do not promise daily returns or speculative staking packages.
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#DFE8F5] space-y-1 transition-all hover:border-[#175CFF]/30 hover:-translate-y-0.5 shadow-xs">
              <span className="font-bold text-sm text-[#10213A] block">No Manufactured Volume</span>
              <span className="text-xs text-[#64748B]">
                Market telemetry reflects real verifiable observations without fictitious wash trading.
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* CTA Box */}
      <ScrollReveal direction="up" delay={250}>
        <div className="bg-white rounded-3xl p-8 border border-[#DFE8F5] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card interactive-card">
          <div>
            <h3 className="text-xl font-bold text-[#10213A]">Explore the Technical Specification</h3>
            <p className="text-xs text-[#64748B] mt-1">Review the complete mathematical modeling and vesting contracts in our whitepaper.</p>
          </div>
          <Link
            to="/whitepaper"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#175CFF] text-white text-sm font-semibold hover:bg-[#123B9A] shadow-elevated transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 group"
          >
            <FileText className="w-4 h-4" />
            <span>Read Whitepaper</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
};
