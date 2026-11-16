import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { User, CheckCircle2, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMsg('');

    try {
      await api.patch('/user/profile', { name });
      await refreshUser();
      setStatus('success');
      setMsg('Profile name updated successfully.');
    } catch (err: any) {
      setStatus('error');
      setMsg(err.message || 'Update failed.');
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Account Settings</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Manage your profile information and display preferences</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-8 shadow-card space-y-6">
        {msg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              status === 'success'
                ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                : 'bg-red-50 text-[#DC2626] border border-red-200'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#10213A] mb-1">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#10213A] mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-gray-100 text-[#64748B] cursor-not-allowed"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Email addresses cannot be changed directly to prevent unauthorized account hijacking.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#10213A] mb-1">Account Role</label>
            <input
              type="text"
              disabled
              value={user?.role || 'USER'}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-gray-100 text-[#64748B] cursor-not-allowed uppercase font-mono font-bold"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs transition-colors"
            >
              {status === 'loading' ? 'Saving changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
