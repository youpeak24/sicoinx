import React, { useState } from 'react';
import { Sliders, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [rateLimitWindow, setRateLimitWindow] = useState('15');
  const [rateLimitMax, setRateLimitMax] = useState('300');
  const [msg, setMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('System operational parameters updated successfully.');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">System Settings</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Global operational flags and rate limit controls</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-8 shadow-card space-y-6">
        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-[#15803D] border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#EDF4FF] border border-[#DFE8F5] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-[#123B9A]">Public Maintenance Mode</span>
              <p className="text-[11px] text-[#64748B]">
                Temporarily displays maintenance notification to non-administrative visitors.
              </p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-5 h-5 rounded border-[#DFE8F5] text-[#175CFF] focus:ring-[#175CFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">
                Rate Limit Window (Minutes)
              </label>
              <input
                type="number"
                value={rateLimitWindow}
                onChange={(e) => setRateLimitWindow(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1">
                Max Requests per Window
              </label>
              <input
                type="number"
                value={rateLimitMax}
                onChange={(e) => setRateLimitMax(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A]"
            >
              Update Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
