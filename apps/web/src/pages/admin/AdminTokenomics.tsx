import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { PieChart, Plus, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AdminTokenomics: React.FC = () => {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api
      .get('/coin/tokenomics')
      .then((data) => {
        setAllocations(data.allocations || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const totalPercentage = allocations.reduce((sum, a) => sum + (parseFloat(a.percentage) || 0), 0);
  const isExact100 = Math.abs(totalPercentage - 100) < 0.001;

  const handleUpdateField = (index: number, field: string, value: any) => {
    const updated = [...allocations];
    updated[index] = { ...updated[index], [field]: value };
    setAllocations(updated);
  };

  const handleAddRow = () => {
    setAllocations([
      ...allocations,
      {
        category: 'New Reserve Tranche',
        percentage: 0,
        tokenAmount: '0',
        vestingDescription: 'Vesting terms description',
        unlockSchedule: 'Quarterly',
        colorHex: '#3B82F6',
        displayOrder: allocations.length + 1,
      },
    ]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = allocations.filter((_, i) => i !== index);
    setAllocations(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isExact100) {
      setStatusMsg({
        type: 'error',
        text: `Allocations sum to ${totalPercentage.toFixed(2)}%. Must equal exactly 100.00% before publication.`,
      });
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);

    try {
      const formatted = allocations.map((a, idx) => ({
        ...a,
        percentage: parseFloat(a.percentage),
        displayOrder: idx + 1,
      }));

      await api.put('/admin/tokenomics', { allocations: formatted });
      setStatusMsg({ type: 'success', text: 'Tokenomics allocations successfully reconciled and published!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update allocations.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-[#64748B]">Loading tokenomics editor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Tokenomics Allocations</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Strict allocation manager: enforces 100% mathematical reconciliation before publication
          </p>
        </div>

        {/* Sum Indicator Pill */}
        <div
          className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            isExact100
              ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
              : 'bg-amber-50 text-[#B45309] border-amber-200'
          }`}
        >
          {isExact100 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>Total: {totalPercentage.toFixed(2)}% {isExact100 ? '(Reconciled)' : '(Must equal 100%)'}</span>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
              : 'bg-red-50 text-[#DC2626] border border-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6">
        <div className="space-y-4">
          {allocations.map((a, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-[#DFE8F5] bg-[#F7FAFF] space-y-3 relative group"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-semibold text-[#10213A] mb-1">Tranche Category</label>
                  <input
                    type="text"
                    required
                    value={a.category}
                    onChange={(e) => handleUpdateField(idx, 'category', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DFE8F5] bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#10213A] mb-1">Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={a.percentage}
                    onChange={(e) => handleUpdateField(idx, 'percentage', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DFE8F5] bg-white font-bold tabular-nums"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-[#10213A] mb-1">Token Amount (SI)</label>
                  <input
                    type="text"
                    required
                    value={a.tokenAmount}
                    onChange={(e) => handleUpdateField(idx, 'tokenAmount', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DFE8F5] bg-white font-mono tabular-nums"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-5">
                  <input
                    type="color"
                    value={a.colorHex || '#175CFF'}
                    onChange={(e) => handleUpdateField(idx, 'colorHex', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-[#DFE8F5] p-0.5"
                    title="Tranche Color Hex"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(idx)}
                    className="p-2 text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors ml-auto"
                    title="Remove Tranche"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#10213A] mb-1">Vesting Terms</label>
                  <input
                    type="text"
                    required
                    value={a.vestingDescription}
                    onChange={(e) => handleUpdateField(idx, 'vestingDescription', e.target.value)}
                    placeholder="e.g. 4-year linear vesting with 6-month cliff"
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#DFE8F5] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#10213A] mb-1">Unlock Schedule</label>
                  <input
                    type="text"
                    required
                    value={a.unlockSchedule}
                    onChange={(e) => handleUpdateField(idx, 'unlockSchedule', e.target.value)}
                    placeholder="e.g. Quarterly unlock starting Q3 2027"
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#DFE8F5] bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#DFE8F5]">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#DFE8F5] text-xs font-semibold text-[#10213A] hover:bg-[#F7FAFF] self-start"
          >
            <Plus className="w-4 h-4" />
            Add Tranche Category
          </button>

          <button
            type="submit"
            disabled={!isExact100 || isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#175CFF] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs transition-colors"
          >
            {isSaving ? 'Reconciling...' : 'Publish 100% Reconciled Allocations'}
          </button>
        </div>
      </form>
    </div>
  );
};
