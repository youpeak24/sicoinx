import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Coins,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports/analytics');
      setData(res);
    } catch (err: any) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary || {};
  const kycDist = data?.kycDistribution || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#10213A]">Financial Reports & Analytics</h1>
          <p className="text-xs text-[#64748B]">
            Real-time platform revenue telemetry, buy/sell volume reconciliation, and supply metrics.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-3.5 py-2 rounded-xl border border-[#DFE8F5] bg-white text-xs font-semibold text-[#10213A] hover:bg-gray-50 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#175CFF]" /> Refresh Telemetry
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-[#64748B]">Computing platform analytics...</div>
      ) : (
        <>
          {/* Revenue KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#DFE8F5] shadow-xs space-y-1">
              <div className="text-xs text-[#64748B] flex items-center justify-between">
                <span>Total Coin Sales (Revenue)</span>
                <ArrowUpRight className="w-4 h-4 text-[#15803D]" />
              </div>
              <div className="text-2xl font-black text-[#10213A]">
                ₹{summary.totalRevenueInr || '0.00'}
              </div>
              <div className="text-[11px] text-[#15803D] font-semibold">
                +{summary.totalCoinsPurchased || 0} SI Purchased
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DFE8F5] shadow-xs space-y-1">
              <div className="text-xs text-[#64748B] flex items-center justify-between">
                <span>Total Bank Settlements</span>
                <ArrowDownRight className="w-4 h-4 text-[#DC2626]" />
              </div>
              <div className="text-2xl font-black text-[#10213A]">
                ₹{summary.totalPayoutInr || '0.00'}
              </div>
              <div className="text-[11px] text-[#64748B] font-semibold">
                -{summary.totalCoinsSold || 0} SI Cashed Out
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DFE8F5] shadow-xs space-y-1">
              <div className="text-xs text-[#64748B] flex items-center justify-between">
                <span>Net Platform Treasury</span>
                <DollarSign className="w-4 h-4 text-[#175CFF]" />
              </div>
              <div className="text-2xl font-black text-[#175CFF]">
                ₹{summary.netRevenueInr || '0.00'}
              </div>
              <div className="text-[11px] text-[#64748B]">Net Cash Inflow</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DFE8F5] shadow-xs space-y-1">
              <div className="text-xs text-[#64748B] flex items-center justify-between">
                <span>Registered Wallets</span>
                <Users className="w-4 h-4 text-[#175CFF]" />
              </div>
              <div className="text-2xl font-black text-[#10213A]">
                {summary.totalWallets || 0}
              </div>
              <div className="text-[11px] text-[#64748B]">Across {summary.totalUsers || 0} Accounts</div>
            </div>
          </div>

          {/* Supply & Rates Reconciliation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#DFE8F5] shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#10213A] flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#175CFF]" /> Coin Supply Distribution
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between pb-1">
                    <span className="text-[#64748B]">Circulating Supply:</span>
                    <span className="font-bold text-[#10213A]">{summary.circulatingSupply} SI</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#175CFF] h-full"
                      style={{
                        width: `${Math.min(100, (parseFloat(summary.circulatingSupply || '18500000') / parseFloat(summary.totalSupply || '100000000')) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between pb-1">
                    <span className="text-[#64748B]">Treasury Reserve Supply:</span>
                    <span className="font-bold text-[#10213A]">{summary.reserveSupply} SI</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-300 h-full"
                      style={{
                        width: `${Math.min(100, (parseFloat(summary.reserveSupply || '81500000') / parseFloat(summary.totalSupply || '100000000')) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="border-t border-[#DFE8F5] pt-2 flex justify-between font-bold">
                  <span>Total Hardcap Supply:</span>
                  <span>{summary.totalSupply} SI</span>
                </div>
              </div>
            </div>

            {/* KYC Compliance Status Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-[#DFE8F5] shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#10213A] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" /> Identity Compliance Breakdown
              </h3>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-center">
                  <div className="text-xl font-black text-green-700">{kycDist['APPROVED'] || 0}</div>
                  <div className="text-[10px] font-bold text-green-800 uppercase">Approved</div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-xl font-black text-amber-700">{kycDist['PENDING'] || 0}</div>
                  <div className="text-[10px] font-bold text-amber-800 uppercase">Pending Review</div>
                </div>

                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-center">
                  <div className="text-xl font-black text-red-700">{kycDist['REJECTED'] || 0}</div>
                  <div className="text-[10px] font-bold text-red-800 uppercase">Rejected</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
