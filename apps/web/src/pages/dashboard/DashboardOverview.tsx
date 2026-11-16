import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { api } from '../../lib/api';
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  Bell,
  Clock,
  ExternalLink,
  Coins,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  QrCode,
  User,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const {
    coinBalance,
    usdBalance,
    inrBalance,
    referencePriceUsd,
    referencePriceInr,
    primaryWalletAddress,
    transactions,
    kyc,
  } = useWallet();

  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    api.get('/content/announcements').then((d) => setAnnouncements(d.slice(0, 2))).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE8F5] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 interactive-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#175CFF]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#175CFF] uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Complete Web Application Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">
            Welcome back, {user?.name || 'Explorer'}
          </h1>
          <p className="text-xs text-[#64748B]">
            Cryptographic Identity: <span className="font-mono text-[#10213A] font-semibold">{user?.email}</span>
            <span className="mx-2">•</span>
            Wallet ID: <span className="font-mono text-[#175CFF] font-semibold">{primaryWalletAddress}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard/purchase"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#123B9A] via-[#175CFF] to-[#38BDF8] text-white text-xs font-extrabold shadow-elevated hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 group"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy SI Coins</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            to="/dashboard/market"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#EDF4FF] border border-[#DFE8F5] text-xs font-bold text-[#123B9A] hover:bg-[#DFE8F5] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#175CFF]" />
            Live Market Graph
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Wallet Coin Balance Card */}
        <div className="bg-gradient-to-br from-[#123B9A] to-[#175CFF] text-white p-6 rounded-3xl shadow-elevated space-y-2 interactive-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-blue-200">
            <span>Total SI Balance</span>
            <span className="text-[10px] font-extrabold bg-white/20 text-white px-2 py-0.5 rounded-full">
              Available
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tabular-nums tracking-tight">
              {coinBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-blue-200">SI</span>
          </div>
          <span className="text-[11px] text-blue-100 block font-semibold">
            ≈ ${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </span>
        </div>

        {/* Reference Price Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-2 interactive-card">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Active Reference Price</span>
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#10213A] tabular-nums">
              ${referencePriceUsd.toFixed(4)}
            </span>
            <span className="text-xs text-[#64748B]">USD</span>
          </div>
          <span className="text-[11px] text-[#15803D] font-semibold block truncate">
            ≈ ₹{referencePriceInr.toFixed(2)} INR (+3.42% 24h)
          </span>
        </div>

        {/* 24h Telemetry Volume Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-2 interactive-card">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>24h Trading Volume</span>
            <Activity className="w-4 h-4 text-[#175CFF]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#10213A] tabular-nums">$428,950</span>
            <span className="text-xs font-semibold text-[#64748B]">USD</span>
          </div>
          <span className="text-[11px] text-[#15803D] font-semibold block">
            343,160 SI Transacted
          </span>
        </div>

        {/* KYC & Identity Status Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-2 interactive-card">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>KYC Verification</span>
            <Link to="/dashboard/profile" className="text-[#175CFF] hover:underline text-[11px] font-semibold">
              Profile
            </Link>
          </div>
          <div className="text-lg font-bold text-[#10213A] flex items-center gap-1.5">
            <span className="text-[#15803D] flex items-center gap-1 text-base">
              <ShieldCheck className="w-5 h-5" /> Tier {kyc.tier} Verified
            </span>
          </div>
          <span className="text-[11px] text-[#64748B] block">
            Daily limit: $100,000 USD
          </span>
        </div>
      </div>

      {/* Main Grid: Activity & Navigation Prompts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Activity Feed */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6 interactive-card">
          <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#10213A]">Recent Wallet Activity</h2>
              <p className="text-xs text-[#64748B]">Audit log of coin purchases, claims, and peer transfers</p>
            </div>
            <Link to="/dashboard/wallets" className="text-xs font-semibold text-[#175CFF] hover:underline flex items-center gap-1 group">
              <span>Full Ledger</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => {
              const isPositive = tx.coinAmount.startsWith('+');
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] flex items-center justify-between gap-4 text-xs hover:border-[#175CFF]/30 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-[#10213A] block truncate">{tx.title}</span>
                    <span className="text-[#64748B] text-[11px] block">
                      {new Date(tx.timestamp).toLocaleString()} • {tx.counterparty}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`font-black tabular-nums block ${isPositive ? 'text-[#15803D]' : 'text-[#10213A]'}`}>
                      {tx.coinAmount} SI
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-[#64748B]">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quick Navigation & Protocol Updates */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Action Tiles */}
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-3">
            <h3 className="font-bold text-sm text-[#10213A]">Quick App Navigation</h3>
            <div className="space-y-2 text-xs">
              <Link
                to="/dashboard/purchase"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFF] hover:bg-[#EDF4FF] hover:border-[#175CFF] border border-[#DFE8F5] transition-all font-bold text-[#10213A]"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-[#175CFF]" />
                  <span>Buy SI Coins</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#64748B]" />
              </Link>

              <Link
                to="/dashboard/market"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFF] hover:bg-[#EDF4FF] hover:border-[#175CFF] border border-[#DFE8F5] transition-all font-bold text-[#10213A]"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-[#175CFF]" />
                  <span>Market Graph & Status</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#64748B]" />
              </Link>

              <Link
                to="/dashboard/wallets"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFF] hover:bg-[#EDF4FF] hover:border-[#175CFF] border border-[#DFE8F5] transition-all font-bold text-[#10213A]"
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-[#175CFF]" />
                  <span>Wallet Coin Balance</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#64748B]" />
              </Link>

              <Link
                to="/dashboard/profile"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFF] hover:bg-[#EDF4FF] hover:border-[#175CFF] border border-[#DFE8F5] transition-all font-bold text-[#10213A]"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-[#175CFF]" />
                  <span>User Profile & Account</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#64748B]" />
              </Link>
            </div>
          </div>

          {/* Project Updates Card */}
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-4 interactive-card">
            <h3 className="font-bold text-sm text-[#10213A]">Protocol Updates</h3>
            <div className="space-y-3">
              {announcements.map((a) => (
                <Link
                  key={a.id}
                  to={`/announcements/${a.slug}`}
                  className="block p-3.5 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] hover:border-[#175CFF] hover:bg-white transition-all text-xs space-y-1 group"
                >
                  <span className="font-bold text-[#10213A] group-hover:text-[#175CFF] block truncate transition-colors">
                    {a.title}
                  </span>
                  <span className="text-[11px] text-[#64748B] line-clamp-1">{a.summary}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
