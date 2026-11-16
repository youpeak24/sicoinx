import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Shield, KeyRound, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pwMsg, setPwMsg] = useState('');

  // 2FA Setup State
  const [mfaSetupData, setMfaSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStatus, setMfaStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mfaMsg, setMfaMsg] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus('error');
      setPwMsg('New passwords do not match.');
      return;
    }

    setPwStatus('loading');
    setPwMsg('');

    try {
      await api.post('/user/change-password', { currentPassword, newPassword });
      setPwStatus('success');
      setPwMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwStatus('error');
      setPwMsg(err.message || 'Failed to update password.');
    }
  };

  const handleStartMfa = async () => {
    try {
      const res = await api.post('/auth/mfa/setup');
      setMfaSetupData(res);
    } catch (err: any) {
      alert(err.message || 'Failed to initialize MFA setup.');
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaStatus('loading');
    setMfaMsg('');

    try {
      await api.post('/auth/mfa/verify', { code: mfaCode });
      setMfaStatus('success');
      setMfaMsg('Two-factor authentication enabled successfully.');
      setMfaSetupData(null);
      await refreshUser();
    } catch (err: any) {
      setMfaStatus('error');
      setMfaMsg(err.message || 'Invalid verification code.');
    }
  };

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Security & Authentication</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Manage cryptographic password credentials, active sessions, and multi-factor authentication
        </p>
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[#175CFF]" />
            <h2 className="font-bold text-base text-[#10213A]">Two-Factor Authentication (TOTP)</h2>
          </div>
          {user?.mfaEnabled ? (
            <span className="text-[11px] font-bold text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Enabled
            </span>
          ) : (
            <span className="text-[11px] font-bold text-[#B45309] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
              Not Configured
            </span>
          )}
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed">
          Enhance your account security with an authenticator app (Google Authenticator, Authy, or 1Password). Required for sensitive administrative actions.
        </p>

        {mfaMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              mfaStatus === 'success'
                ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                : 'bg-red-50 text-[#DC2626] border border-red-200'
            }`}
          >
            {mfaStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{mfaMsg}</span>
          </div>
        )}

        {!user?.mfaEnabled && !mfaSetupData && (
          <button
            onClick={handleStartMfa}
            className="px-5 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] transition-colors shadow-xs"
          >
            Configure 2FA Authenticator
          </button>
        )}

        {/* Setup Wizard */}
        {mfaSetupData && !user?.mfaEnabled && (
          <div className="p-6 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] space-y-4">
            <span className="text-xs font-bold text-[#10213A] block">1. Scan QR Code in Authenticator App</span>
            {mfaSetupData.qrCodeUrl && (
              <div className="bg-white p-3 rounded-2xl border border-[#DFE8F5] w-fit">
                <img src={mfaSetupData.qrCodeUrl} alt="2FA QR Code" className="w-44 h-44 object-contain" />
              </div>
            )}
            <div className="text-xs text-[#64748B]">
              Can't scan? Enter secret manually: <code className="font-mono font-bold text-[#10213A] select-all">{mfaSetupData.secret}</code>
            </div>

            <form onSubmit={handleVerifyMfa} className="space-y-3 pt-2">
              <span className="text-xs font-bold text-[#10213A] block">2. Enter 6-Digit Code to Confirm</span>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.trim())}
                  placeholder="123456"
                  className="w-40 text-center tracking-widest text-base font-bold px-3 py-2 rounded-xl border border-[#DFE8F5] bg-white"
                />
                <button
                  type="submit"
                  disabled={mfaStatus === 'loading'}
                  className="px-5 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A]"
                >
                  Verify & Activate
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#DFE8F5] pb-4">
          <KeyRound className="w-5 h-5 text-[#175CFF]" />
          <h2 className="font-bold text-base text-[#10213A]">Change Account Password</h2>
        </div>

        {pwMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              pwStatus === 'success'
                ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                : 'bg-red-50 text-[#DC2626] border border-red-200'
            }`}
          >
            {pwStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{pwMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#10213A] mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#10213A] mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 chars, 1 uppercase, 1 number"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#10213A] mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={pwStatus === 'loading'}
              className="px-5 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs transition-colors"
            >
              {pwStatus === 'loading' ? 'Updating password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
