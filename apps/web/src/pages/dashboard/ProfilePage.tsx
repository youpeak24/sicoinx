import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Shield,
  Mail,
} from 'lucide-react';

const KYC_LABEL: Record<string, { text: string; tone: string }> = {
  VERIFIED: { text: 'Verified', tone: 'text-[#15803D] bg-emerald-50 border-emerald-100' },
  PENDING: { text: 'Under review', tone: 'text-[#B45309] bg-amber-50 border-amber-100' },
  REJECTED: { text: 'Rejected', tone: 'text-[#DC2626] bg-red-50 border-red-100' },
  UNVERIFIED: { text: 'Not verified', tone: 'text-[#64748B] bg-slate-50 border-slate-200' },
};

/** Shows only what the account actually has. Nothing on this page is placeholder content. */
export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { primaryWalletAddress, kyc, coinBalance } = useWallet();

  const [name, setName] = useState(user?.name || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [saveMsg, setSaveMsg] = useState('');
  const [copiedAddr, setCopiedAddr] = useState(false);

  const kycInfo = KYC_LABEL[kyc.status] ?? KYC_LABEL.UNVERIFIED;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('loading');
    setSaveMsg('');
    try {
      await updateProfile({ name: name.trim() });
      setSaveStatus('success');
      setSaveMsg('Profile updated successfully.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveMsg(err?.message || 'Could not update your profile.');
    }
  };

  const copyWallet = () => {
    if (!primaryWalletAddress) return;
    navigator.clipboard.writeText(primaryWalletAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Identity banner */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#123B9A] via-[#175CFF] to-[#38BDF8] text-white flex items-center justify-center font-black text-3xl shadow-elevated">
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">{user?.name || 'Your account'}</h1>
              {user?.role && (
                <span className="text-[10px] font-extrabold uppercase bg-[#EDF4FF] text-[#123B9A] px-2.5 py-0.5 rounded-full border border-[#DFE8F5]">
                  {user.role.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-[#175CFF]" />
              {user?.email}
            </p>
            {user?.createdAt && (
              <p className="text-[11px] text-[#64748B]">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Wallet */}
        <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] space-y-1.5 min-w-[260px]">
          <span className="text-[11px] font-bold text-[#64748B] block">Primary SI Account Wallet</span>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-xs text-[#10213A] truncate">{primaryWalletAddress || '—'}</span>
            <button
              onClick={copyWallet}
              disabled={!primaryWalletAddress}
              className="p-1.5 rounded-lg bg-white border border-[#DFE8F5] text-[#175CFF] hover:bg-[#EDF4FF] transition-colors disabled:opacity-40"
              title="Copy address"
            >
              {copiedAddr ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1 border-t border-[#DFE8F5]">
            <span>Current balance:</span>
            <strong className="text-[#175CFF]">{coinBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} SI</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Personal information */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6">
            <h2 className="text-lg font-bold text-[#10213A] flex items-center gap-2 border-b border-[#DFE8F5] pb-4">
              <User className="w-5 h-5 text-[#175CFF]" />
              Personal Information
            </h2>

            {saveMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  saveStatus === 'error'
                    ? 'bg-red-50 text-[#DC2626] border-red-200'
                    : 'bg-emerald-50 text-[#15803D] border-emerald-200'
                }`}
              >
                {saveStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{saveMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] text-[#10213A]"
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
                </div>
              </div>

              <button
                type="submit"
                disabled={saveStatus === 'loading' || name.trim() === (user?.name || '')}
                className="px-6 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A] shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveStatus === 'loading' ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* KYC + security */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
              <h3 className="font-bold text-base text-[#10213A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#175CFF]" />
                KYC Verification
              </h3>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${kycInfo.tone}`}>{kycInfo.text}</span>
            </div>

            {kyc.fullName && (
              <div className="space-y-2 text-xs text-[#64748B]">
                <div className="flex justify-between">
                  <span>Name on record:</span>
                  <span className="font-semibold text-[#10213A]">{kyc.fullName}</span>
                </div>
                {kyc.idType && (
                  <div className="flex justify-between">
                    <span>Document type:</span>
                    <span className="font-semibold text-[#10213A]">{kyc.idType.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </div>
            )}
            {kyc.status === 'REJECTED' && kyc.rejectionReason && (
              <p className="text-xs text-[#DC2626] bg-red-50 border border-red-100 rounded-xl p-3">{kyc.rejectionReason}</p>
            )}

            {kyc.status !== 'VERIFIED' && (
              <Link
                to="/dashboard/kyc"
                className="block w-full text-center py-2 px-4 rounded-xl border border-[#DFE8F5] text-xs font-bold text-[#123B9A] bg-[#EDF4FF] hover:bg-[#DFE8F5] transition-colors"
              >
                {kyc.status === 'UNVERIFIED' ? 'Start identity verification' : 'View verification'}
              </Link>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-4">
            <h3 className="font-bold text-base text-[#10213A] flex items-center gap-2 border-b border-[#DFE8F5] pb-3">
              <Shield className="w-5 h-5 text-[#175CFF]" />
              Security
            </h3>
            <div className="space-y-3 text-xs text-[#64748B]">
              <div className="flex items-center justify-between">
                <span>Email verification</span>
                <span className={`font-bold ${user?.isEmailVerified ? 'text-[#15803D]' : 'text-[#B45309]'}`}>
                  {user?.isEmailVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#DFE8F5]">
                <span>Two-factor authentication</span>
                <span className={`font-bold ${user?.mfaEnabled ? 'text-[#15803D]' : 'text-[#64748B]'}`}>
                  {user?.mfaEnabled ? 'Enabled' : 'Off'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#DFE8F5]">
                <span>Password</span>
                <Link to="/dashboard/security" className="text-xs font-bold text-[#175CFF] hover:underline">
                  Change
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
