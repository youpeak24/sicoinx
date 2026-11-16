import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { DollarSign, Clock, CheckCircle2, AlertCircle, Calendar, ShieldCheck, Trash2 } from 'lucide-react';

export const AdminPricing: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [priceInput, setPriceInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Source Selection
  const [activeSource, setActiveSource] = useState('MANUAL');
  const [staleThreshold, setStaleThreshold] = useState(60);

  const fetchPricingData = () => {
    setIsLoading(true);
    api
      .get('/admin/pricing/config')
      .then((data) => {
        setConfig(data.config);
        setScheduled(data.scheduledChanges || []);
        setActiveSource(data.config?.activeSource || 'MANUAL');
        setStaleThreshold(data.config?.staleThresholdMinutes || 60);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

  const handlePublishPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (parseFloat(priceInput) <= 0) {
      setStatusMsg({ type: 'error', text: 'Price must be a valid positive number.' });
      return;
    }

    try {
      const res = await api.post('/admin/pricing/manual', {
        priceUsd: parseFloat(priceInput).toFixed(6),
        reason: reasonInput,
        isScheduled,
        scheduledTime: isScheduled && scheduleTime ? new Date(scheduleTime).toISOString() : undefined,
      });

      setStatusMsg({ type: 'success', text: res.message || 'Reference price updated successfully.' });
      setPriceInput('');
      setReasonInput('');
      setIsScheduled(false);
      setScheduleTime('');
      fetchPricingData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update reference price.' });
    }
  };

  const handleUpdateSourceMode = async (newSource: string) => {
    try {
      await api.put('/admin/pricing/config', {
        activeSource: newSource,
        staleThresholdMinutes: staleThreshold,
        pollingIntervalSeconds: 30,
        demoVariancePercent: 1.5,
      });
      setActiveSource(newSource);
      setStatusMsg({ type: 'success', text: `Active price feed switched to ${newSource}.` });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to switch price mode.' });
    }
  };

  const handleCancelScheduled = async (id: string) => {
    if (!confirm('Cancel this scheduled price update?')) return;
    try {
      await api.delete(`/admin/pricing/scheduled/${id}`);
      fetchPricingData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel scheduled change.');
    }
  };

  if (isLoading) {
    return <div className="text-center py-24 text-[#64748B]">Loading pricing administration...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Reference Price Controls</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Manage administrator-set reference rates, feed provenance, and automated execution schedules
        </p>
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
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Mode Selector Card */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6">
        <div className="border-b border-[#DFE8F5] pb-4">
          <h2 className="font-bold text-base text-[#10213A]">Active Price Feed Architecture</h2>
          <p className="text-xs text-[#64748B]">Switch between manual governance, external aggregators, or demo testnet variance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleUpdateSourceMode('MANUAL')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeSource === 'MANUAL'
                ? 'border-[#175CFF] bg-[#EDF4FF] ring-2 ring-[#175CFF]/20'
                : 'border-[#DFE8F5] bg-white hover:bg-[#F7FAFF]'
            }`}
          >
            <strong className="block text-sm text-[#10213A]">1. Manual Reference Rate</strong>
            <span className="text-xs text-[#64748B] mt-1 block">
              Directly set by authorized administrators with mandatory audit justification.
            </span>
            <span className="text-[10px] font-bold text-[#175CFF] block mt-2 uppercase">
              Label: Administrator-set
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleUpdateSourceMode('EXTERNAL_COINGECKO')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeSource === 'EXTERNAL_COINGECKO'
                ? 'border-[#175CFF] bg-[#EDF4FF] ring-2 ring-[#175CFF]/20'
                : 'border-[#DFE8F5] bg-white hover:bg-[#F7FAFF]'
            }`}
          >
            <strong className="block text-sm text-[#10213A]">2. External Market Feed</strong>
            <span className="text-xs text-[#64748B] mt-1 block">
              Polled via server-side credentials with retries and stale-data cutoff.
            </span>
            <span className="text-[10px] font-bold text-[#175CFF] block mt-2 uppercase">
              Label: CoinGecko Oracle
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleUpdateSourceMode('DEMO')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeSource === 'DEMO'
                ? 'border-[#175CFF] bg-[#EDF4FF] ring-2 ring-[#175CFF]/20'
                : 'border-[#DFE8F5] bg-white hover:bg-[#F7FAFF]'
            }`}
          >
            <strong className="block text-sm text-[#10213A]">3. Demonstration Sandbox</strong>
            <span className="text-xs text-[#64748B] mt-1 block">
              Simulated price stream for testnet review with controlled variance.
            </span>
            <span className="text-[10px] font-bold text-amber-700 block mt-2 uppercase">
              Label: Demonstration Mode
            </span>
          </button>
        </div>
      </div>

      {/* Manual Reference Price Update Form */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6">
        <div className="border-b border-[#DFE8F5] pb-4">
          <h2 className="font-bold text-base text-[#10213A]">Publish Manual Reference Price</h2>
          <p className="text-xs text-[#64748B]">
            All updates are recorded in the permanent audit trail. Publicly labeled as "Administrator-set reference price".
          </p>
        </div>

        <form onSubmit={handlePublishPrice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#10213A] mb-1">
              New Positive Reference Price (USD)
            </label>
            <div className="relative rounded-2xl border border-[#DFE8F5] bg-[#F7FAFF] p-2 flex items-center">
              <span className="text-lg font-bold text-[#64748B] px-3">$</span>
              <input
                type="text"
                required
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="1.250000"
                className="w-full bg-transparent text-xl font-bold text-[#10213A] focus:outline-none tabular-nums"
              />
              <span className="text-xs font-semibold text-[#64748B] pr-3">USD</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#10213A] mb-1">
              Internal Audit Reason (Mandatory Justification)
            </label>
            <textarea
              required
              rows={3}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g. Q4 protocol milestone delivery, smart contract formal verification completed"
              className="w-full text-xs p-3 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="scheduleCheck"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="rounded border-[#DFE8F5] text-[#175CFF]"
            />
            <label htmlFor="scheduleCheck" className="text-xs text-[#10213A] font-semibold cursor-pointer">
              Schedule publication for future wall-clock time
            </label>
          </div>

          {isScheduled && (
            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">Execution Wall-Clock Time</label>
              <input
                type="datetime-local"
                required={isScheduled}
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>
          )}

          <div className="pt-3 border-t border-[#DFE8F5] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs transition-colors"
            >
              {isScheduled ? 'Schedule Price Change' : 'Publish Reference Rate Immediately'}
            </button>
          </div>
        </form>
      </div>

      {/* Scheduled Changes Queue */}
      {scheduled.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
          <div className="p-6 border-b border-[#DFE8F5]">
            <h2 className="font-bold text-base text-[#10213A]">Pending Scheduled Price Changes</h2>
            <p className="text-xs text-[#64748B]">Automated releases queued for execution</p>
          </div>

          <div className="divide-y divide-[#DFE8F5]">
            {scheduled.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-[#10213A] text-sm tabular-nums">
                    ${item.scheduledPriceUsd} USD
                  </span>
                  <p className="text-[#64748B] text-xs mt-0.5">{item.reason}</p>
                  <span className="text-[11px] text-[#175CFF] block mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Scheduled for: {new Date(item.scheduledTime).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleCancelScheduled(item.id)}
                  className="p-2 rounded-xl text-[#DC2626] hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
                  title="Cancel scheduled change"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
