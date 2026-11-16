import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Users,
  Coins,
  DollarSign,
  Headphones,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/overview')
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-center py-24 text-[#64748B]">Loading administrative overview...</div>;
  }

  const stats = data?.stats;
  const pricing = data?.pricing;
  const coin = data?.coin;
  const auditLogs = data?.recentAuditLogs || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE8F5] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#175CFF]">
            Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A] mt-0.5">
            System Administration Overview
          </h1>
          <p className="text-xs text-[#64748B]">
            Real-time platform operations, pricing provenance, and audit telemetry
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link
            to="/admin/pricing"
            className="px-4 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs transition-colors"
          >
            Update Reference Price
          </Link>
          <Link
            to="/admin/announcements"
            className="px-4 py-2 rounded-xl border border-[#DFE8F5] text-xs font-semibold text-[#10213A] hover:bg-[#F7FAFF] transition-colors"
          >
            Publish Announcement
          </Link>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Registered Accounts</span>
            <Users className="w-4 h-4 text-[#175CFF]" />
          </div>
          <span className="block text-3xl font-extrabold text-[#10213A] tabular-nums">
            {stats?.totalUsers || 0}
          </span>
          <span className="text-[11px] text-[#15803D] font-semibold">
            {stats?.verifiedUsers || 0} verified via email
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Active Reference Price</span>
            <DollarSign className="w-4 h-4 text-[#175CFF]" />
          </div>
          <span className="block text-3xl font-extrabold text-[#175CFF] tabular-nums">
            ${pricing?.currentPriceUsd || '1.250000'}
          </span>
          <span className="text-[11px] text-[#64748B] block truncate">
            Source: {pricing?.sourceLabel || 'Manual'}
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Open Support Tickets</span>
            <Headphones className="w-4 h-4 text-[#B45309]" />
          </div>
          <span className="block text-3xl font-extrabold text-[#B45309] tabular-nums">
            {stats?.openTickets || 0}
          </span>
          <Link to="/admin/support" className="text-[11px] text-[#175CFF] hover:underline block">
            Review tickets →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#DFE8F5] shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Price Observations</span>
            <Coins className="w-4 h-4 text-[#175CFF]" />
          </div>
          <span className="block text-3xl font-extrabold text-[#10213A] tabular-nums">
            {stats?.totalPriceObservations || 0}
          </span>
          <Link to="/admin/price-history" className="text-[11px] text-[#175CFF] hover:underline block">
            Inspect audit trail →
          </Link>
        </div>
      </div>

      {/* Lower Grid: Quick Coin Status & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Coin Meta Card */}
        <div className="lg:col-span-4 bg-[#EDF4FF] rounded-3xl border border-[#DFE8F5] p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
            <h3 className="font-bold text-sm text-[#10213A]">Active Coin Parameters</h3>
            <Link to="/admin/coin" className="text-xs text-[#175CFF] font-semibold hover:underline">
              Edit
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Token Name / Ticker:</span>
              <span className="font-bold text-[#10213A]">{coin?.tokenName} ({coin?.ticker})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Blockchain Network:</span>
              <span className="font-bold text-[#10213A] truncate max-w-[180px]">{coin?.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Circulating Float:</span>
              <span className="font-bold text-[#10213A] tabular-nums">{coin?.circulatingSupply} SI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Total Supply:</span>
              <span className="font-bold text-[#10213A] tabular-nums">{coin?.totalSupply} SI</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#64748B] italic">
            * Note: Changing website metadata does not modify a deployed token contract.
          </div>
        </div>

        {/* Right: Recent Audit Logs Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#175CFF]" />
              <h3 className="font-bold text-sm text-[#10213A]">Recent Administrative Actions</h3>
            </div>
            <Link to="/admin/audit-logs" className="text-xs text-[#175CFF] font-semibold hover:underline">
              View Full Audit Log
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAFF] text-[#64748B] border-b border-[#DFE8F5]">
                <tr>
                  <th className="p-3 font-semibold">Timestamp</th>
                  <th className="p-3 font-semibold">Actor</th>
                  <th className="p-3 font-semibold">Action</th>
                  <th className="p-3 font-semibold">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {auditLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[#F7FAFF]/50 transition-colors">
                    <td className="p-3 text-[#64748B] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-medium text-[#10213A]">{log.actorEmail || 'System'}</td>
                    <td className="p-3 font-semibold text-[#175CFF]">{log.action}</td>
                    <td className="p-3 text-[#64748B]">{log.entityType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
