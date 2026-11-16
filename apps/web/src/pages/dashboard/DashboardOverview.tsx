import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ScrollReveal } from '../../components/common/animations/ScrollReveal';
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Bell,
  Clock,
  ExternalLink,
  Coins,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [price, setPrice] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    api.get('/user/portfolio').then(setPortfolio).catch(console.error);
    api.get('/coin/price').then(setPrice).catch(console.error);
    api.get('/user/activity').then(setActivity).catch(console.error);
    api.get('/content/announcements').then((d) => setAnnouncements(d.slice(0, 2))).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE8F5] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 interactive-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#175CFF]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#175CFF] uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Account Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">
            Welcome back, {user?.name || 'Explorer'}
          </h1>
          <p className="text-xs text-[#64748B]">
            Cryptographic identity: <span className="font-mono text-[#10213A]">{user?.email}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard/wallets"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EDF4FF] border border-[#DFE8F5] text-xs font-semibold text-[#123B9A] hover:bg-[#DFE8F5] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <Wallet className="w-3.5 h-3.5 text-[#175CFF]" />
            Manage Linked Wallets
          </Link>
          <Link
            to="/dashboard/portfolio"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-elevated transition-all duration-200 hover:-translate-y-0.5 active:scale-95 group"
          >
            <span>View Portfolio Sandbox</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Reference Price Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-2 interactive-card">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Active Reference Price</span>
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#10213A] tabular-nums">
              ${price?.priceUsd || '1.250000'}
            </span>
            <span className="text-xs text-[#64748B]">USD</span>
          </div>
          <span className="text-[11px] text-[#64748B] block truncate">
            {price?.sourceLabel || 'Administrator-set'}
          </span>
        </div>

        {/* Testnet Sandbox Balance */}
        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-2 interactive-card">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Testnet Sandbox Balance</span>
            <span className="text-[10px] font-bold text-[#175CFF] bg-[#EDF4FF] px-2 py-0.5 rounded-full">
              Non-Monetary
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#175CFF] tabular-nums">
              {portfolio?.simulatedTestnetLedger?.balanceSi || '0.000000'}
            </span>
            <span className="text-xs font-semibold text-[#10213A]">SI</span>
          </div>
          <span className="text-[11px] text-[#64748B] block">
            Sepolia Testnet Ledger Sandbox
          </span>
        </div>

        {/* Verified On-Chain Holdings */}
        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-2 interactive-card">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Verified Mainnet Custody</span>
            <ShieldCheck className="w-4 h-4 text-[#15803D]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#10213A] tabular-nums">0.000000</span>
            <span className="text-xs font-semibold text-[#64748B]">SI</span>
          </div>
          <span className="text-[11px] text-[#64748B] block">
            Non-custodial (Zero platform custody)
          </span>
        </div>

        {/* Account Security Status */}
        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-2 interactive-card">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Account Security</span>
            <Link to="/dashboard/security" className="text-[#175CFF] hover:underline text-[11px] font-semibold">
              Settings
            </Link>
          </div>
          <div className="text-lg font-bold text-[#10213A] flex items-center gap-1.5">
            {user?.mfaEnabled ? (
              <span className="text-[#15803D] flex items-center gap-1 text-base">
                <ShieldCheck className="w-5 h-5" /> 2FA Active
              </span>
            ) : (
              <span className="text-[#B45309] text-base">2FA Recommended</span>
            )}
          </div>
          <span className="text-[11px] text-[#64748B] block">
            Email: {user?.isEmailVerified ? '✓ Verified' : 'Pending verification'}
          </span>
        </div>
      </div>

      {/* Main Grid: Activity & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Activity Feed */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6 interactive-card">
          <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#10213A]">Recent Account Activity</h2>
              <p className="text-xs text-[#64748B]">Audit log of testnet claims, tickets, and linkages</p>
            </div>
            <Link to="/dashboard/activity" className="text-xs font-semibold text-[#175CFF] hover:underline flex items-center gap-1 group">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activity?.ledgerEntries && activity.ledgerEntries.length > 0 ? (
              activity.ledgerEntries.slice(0, 5).map((entry: any) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] flex items-center justify-between gap-4 text-xs hover:border-[#175CFF]/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#10213A] block">{entry.reference}</span>
                    <span className="text-[#64748B] text-[11px] block">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#15803D] tabular-nums block">
                      +{entry.amount} SI
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-[#64748B]">
                      {entry.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[#64748B]">
                No recent activity recorded. Try claiming from the testnet faucet in Portfolio!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Security Reminders & Announcements */}
        <div className="lg:col-span-4 space-y-6">
          {/* Security Box */}
          <div className="bg-[#EDF4FF] rounded-3xl p-6 border border-[#DFE8F5] space-y-3 interactive-card">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#175CFF]" />
              <h3 className="font-bold text-sm text-[#10213A]">Non-Custodial Safeguard</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Your account record alone does not imply cryptocurrency custody. All interactions occur through your own Web3 wallet via challenge-response verification.
            </p>
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
