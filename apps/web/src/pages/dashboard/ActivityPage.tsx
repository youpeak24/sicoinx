import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Activity, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivity = () => {
    setIsLoading(true);
    api
      .get('/user/activity')
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const ledger = data?.ledgerEntries || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Account Activity & Ledger</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Audit history of testnet allocations, security events, and ledger records
          </p>
        </div>
        <button
          onClick={fetchActivity}
          className="p-2 rounded-xl border border-[#DFE8F5] bg-white text-[#64748B] hover:text-[#175CFF] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#175CFF]' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#DFE8F5]">
          <h2 className="font-bold text-base text-[#10213A]">Simulated Testnet Ledger Entries</h2>
          <p className="text-xs text-[#64748B]">All actions are tagged with their verified cryptographic state</p>
        </div>

        {ledger.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-1">
            <Activity className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50 mb-2" />
            <p className="font-semibold text-[#10213A]">No ledger entries yet</p>
            <p>Claim testnet SI from the Portfolio tab to generate testnet ledger records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAFF] text-[#64748B] border-b border-[#DFE8F5]">
                <tr>
                  <th className="p-4 font-semibold">Timestamp</th>
                  <th className="p-4 font-semibold">Activity Reference</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Balance After</th>
                  <th className="p-4 font-semibold">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {ledger.map((row: any) => (
                  <tr key={row.id} className="hover:bg-[#F7FAFF]/50 transition-colors">
                    <td className="p-4 text-[#10213A] whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-medium text-[#10213A]">{row.reference}</td>
                    <td className="p-4 font-bold text-[#15803D] tabular-nums whitespace-nowrap">
                      +{row.amount} SI
                    </td>
                    <td className="p-4 text-[#64748B] tabular-nums whitespace-nowrap">
                      {row.balanceAfter} SI
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          row.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-[#15803D]'
                            : row.status === 'PENDING'
                            ? 'bg-blue-50 text-[#175CFF]'
                            : row.status === 'SUBMITTED'
                            ? 'bg-amber-50 text-[#B45309]'
                            : 'bg-red-50 text-[#DC2626]'
                        }`}
                      >
                        {row.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3" />}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
