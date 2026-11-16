import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Wallet,
  Search,
  Lock,
  Unlock,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import Decimal from 'decimal.js';

export const AdminWalletsPage: React.FC = () => {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null);
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustAmount, setAdjustAmount] = useState('10');
  const [adjustReason, setAdjustReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, [search]);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const url = search ? `/admin/wallets?search=${encodeURIComponent(search)}` : '/admin/wallets';
      const res = await api.get(url);
      setWallets(res || []);
    } catch (err: any) {
      console.error('Failed to load wallets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreeze = async (wallet: any) => {
    const confirm = window.confirm(
      `Are you sure you want to ${wallet.isFrozen ? 'unfreeze' : 'freeze'} wallet for ${wallet.user?.email}?`
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      await api.patch(`/admin/admin-wallets/${wallet.id}/freeze`, {
        isFrozen: !wallet.isFrozen,
        reason: wallet.isFrozen ? 'Admin unfreeze' : 'Security / audit freeze',
      });
      setSuccess(`Wallet ${wallet.address} is now ${wallet.isFrozen ? 'unfrozen' : 'frozen'}.`);
      fetchWallets();
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;
    setActionLoading(true);
    setError(null);

    try {
      await api.patch(`/admin/admin-wallets/${selectedWallet.id}/adjust`, {
        type: adjustType,
        coinAmount: new Decimal(adjustAmount).toFixed(6),
        reason: adjustReason.trim(),
      });

      setSuccess(`Successfully ${adjustType === 'CREDIT' ? 'credited' : 'debited'} ${adjustAmount} SI for ${selectedWallet.user?.email}`);
      setSelectedWallet(null);
      setAdjustReason('');
      fetchWallets();
    } catch (err: any) {
      setError(err.message || 'Adjustment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#10213A]">Digital Coin Wallet Management</h1>
          <p className="text-xs text-[#64748B]">
            Inspect all platform wallets, execute authorized balance adjustments with audit tracking, and freeze or unfreeze accounts.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by address, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
            />
          </div>
          <button
            onClick={fetchWallets}
            className="p-2 rounded-xl border border-[#DFE8F5] bg-white hover:bg-gray-50 text-[#175CFF]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3 text-xs">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#64748B]">Loading wallets...</div>
        ) : wallets.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">No wallets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DFE8F5] text-[#64748B]">
                  <th className="pb-3 font-semibold">User Account</th>
                  <th className="pb-3 font-semibold">Wallet Address</th>
                  <th className="pb-3 font-semibold">Coin Balance (SI)</th>
                  <th className="pb-3 font-semibold">Fiat Holding (INR)</th>
                  <th className="pb-3 font-semibold">Wallet State</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8F5]">
                {wallets.map((w) => (
                  <tr key={w.id} className="text-[#10213A] hover:bg-gray-50/50">
                    <td className="py-3.5">
                      <div className="font-bold">{w.user?.name || 'User'}</div>
                      <div className="text-[11px] text-[#64748B]">{w.user?.email}</div>
                    </td>
                    <td className="py-3.5 font-mono text-[11px] font-bold text-[#175CFF]">
                      {w.address}
                    </td>
                    <td className="py-3.5 font-bold font-mono text-sm">
                      {w.coinBalance} SI
                    </td>
                    <td className="py-3.5 font-mono text-[#64748B]">
                      ₹{w.inrBalance}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          w.isFrozen ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {w.isFrozen ? 'FROZEN' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedWallet(w)}
                        className="px-2.5 py-1 rounded-lg border border-[#DFE8F5] hover:border-[#175CFF] text-[#10213A] text-[11px] font-semibold"
                      >
                        Adjust Balance
                      </button>
                      <button
                        onClick={() => handleToggleFreeze(w)}
                        disabled={actionLoading}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          w.isFrozen
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        {w.isFrozen ? 'Unfreeze' : 'Freeze'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DFE8F5] space-y-4 animate-scale-in">
            <h3 className="font-bold text-sm text-[#10213A]">
              Administrative Balance Adjustment
            </h3>
            <div className="p-3 rounded-xl bg-gray-50 border border-[#DFE8F5] text-xs">
              <div>User: <strong>{selectedWallet.user?.name}</strong> ({selectedWallet.user?.email})</div>
              <div>Current Balance: <strong className="text-[#175CFF]">{selectedWallet.coinBalance} SI</strong></div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('CREDIT')}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    adjustType === 'CREDIT' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200'
                  }`}
                >
                  + Credit Coins
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('DEBIT')}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    adjustType === 'DEBIT' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200'
                  }`}
                >
                  - Debit Coins
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10213A] mb-1">Coin Amount (SI)</label>
                <input
                  type="number"
                  min="0.000001"
                  step="any"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full text-sm font-bold px-3.5 py-2 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10213A] mb-1">Mandatory Audit Reason</label>
                <textarea
                  required
                  rows={2}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Promotional distribution / resolution of ticket #9821"
                  className="w-full text-xs p-3 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWallet(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !adjustReason}
                  className="px-5 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A] disabled:opacity-50"
                >
                  Apply Mutation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
