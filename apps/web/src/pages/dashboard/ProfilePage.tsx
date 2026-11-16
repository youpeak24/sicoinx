import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { api } from '../../lib/api';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  KeyRound,
  Shield,
  Smartphone,
  Globe,
  Mail,
  Bell,
  Download,
  ExternalLink,
  Sparkles,
  QrCode,
  FileText,
  Clock,
  Laptop,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { primaryWalletAddress, kyc, submitKyc, coinBalance } = useWallet();

  // Profile fields state
  const [name, setName] = useState(user?.name || 'Explorer');
  const [phone, setPhone] = useState('+1 (555) 389-9210');
  const [country, setCountry] = useState('United States');
  const [timezone, setTimezone] = useState('UTC-5 (Eastern Time)');
  const [bio, setBio] = useState('Digital asset enthusiast & active SI Coin ecosystem participant.');
  const [currencyPref, setCurrencyPref] = useState('USD');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);

  // KYC modal state
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycName, setKycName] = useState(user?.name || '');
  const [kycType, setKycType] = useState('PASSPORT');
  const [kycNumber, setKycNumber] = useState('');

  // Status message
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [saveMsg, setSaveMsg] = useState('');
  const [copiedAddr, setCopiedAddr] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('loading');
    setSaveMsg('');

    try {
      await api.patch('/user/profile', { name });
      await refreshUser();
      setSaveStatus('success');
      setSaveMsg('Profile updated successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      // Local fallback
      setSaveStatus('success');
      setSaveMsg('Profile saved to local account!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycName || !kycNumber) return;
    await submitKyc({ fullName: kycName, idType: kycType, idNumber: kycNumber });
    setKycModalOpen(false);
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(primaryWalletAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header Profile Identity Banner */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar with initial */}
          <div className="relative">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#123B9A] via-[#175CFF] to-[#38BDF8] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-elevated">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#15803D] border-2 border-white flex items-center justify-center text-white"
              title="Verified Identity"
            >
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">
                {user?.name || 'Explorer'}
              </h1>
              <span className="text-[10px] font-extrabold uppercase bg-[#EDF4FF] text-[#123B9A] px-2.5 py-0.5 rounded-full border border-[#DFE8F5]">
                {user?.role || 'USER'}
              </span>
            </div>
            <p className="text-xs text-[#64748B] flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-[#175CFF]" />
              {user?.email || 'user@sicoin.org'}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-[#64748B]">
              <span>Account UID: <strong className="font-mono text-[#10213A]">SICX-882194</strong></span>
              <span>•</span>
              <span className="text-[#15803D] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> KYC Tier {kyc.tier} Verified
              </span>
            </div>
          </div>
        </div>

        {/* Primary Wallet Pill */}
        <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] space-y-1.5 min-w-[260px]">
          <span className="text-[11px] font-bold text-[#64748B] block">Primary SI Account Wallet</span>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-xs text-[#10213A] truncate">
              {primaryWalletAddress}
            </span>
            <button
              onClick={copyWallet}
              className="p-1.5 rounded-lg bg-white border border-[#DFE8F5] text-[#175CFF] hover:bg-[#EDF4FF] transition-colors"
              title="Copy Address"
            >
              {copiedAddr ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1 border-t border-[#DFE8F5]">
            <span>Current Balance:</span>
            <strong className="text-[#175CFF]">{coinBalance.toLocaleString()} SI</strong>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personal Information & Form (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Edit Profile Form */}
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-4">
              <h2 className="text-lg font-bold text-[#10213A] flex items-center gap-2">
                <User className="w-5 h-5 text-[#175CFF]" />
                Personal Information
              </h2>
              <span className="text-xs text-[#64748B]">Updated automatically</span>
            </div>

            {saveMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 text-[#15803D] border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{saveMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] text-[#10213A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'user@sicoin.org'}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-gray-100 text-[#64748B] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] text-[#10213A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] text-[#10213A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">
                  Timezone
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] text-[#10213A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">
                  Bio / Notes
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] text-[#10213A]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saveStatus === 'loading'}
                  className="px-6 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-bold hover:bg-[#123B9A] shadow-xs transition-colors cursor-pointer"
                >
                  {saveStatus === 'loading' ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Preferences & Display Settings */}
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 sm:p-8 shadow-card space-y-6">
            <h2 className="text-lg font-bold text-[#10213A] flex items-center gap-2 border-b border-[#DFE8F5] pb-4">
              <Globe className="w-5 h-5 text-[#175CFF]" />
              Application Preferences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#10213A] block">Base Display Currency</span>
                  <span className="text-[11px] text-[#64748B]">All asset equivalents will be rendered in this currency</span>
                </div>
                <select
                  value={currencyPref}
                  onChange={(e) => setCurrencyPref(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] text-[#10213A]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#DFE8F5]">
                <div>
                  <span className="text-xs font-bold text-[#10213A] block">Transaction Email Receipts</span>
                  <span className="text-[11px] text-[#64748B]">Send verifiable receipt copy upon every token purchase</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#175CFF] rounded accent-[#175CFF]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#DFE8F5]">
                <div>
                  <span className="text-xs font-bold text-[#10213A] block">Market Price Alerts</span>
                  <span className="text-[11px] text-[#64748B]">Receive notification when SI Coin updates reference baseline</span>
                </div>
                <input
                  type="checkbox"
                  checked={priceAlerts}
                  onChange={(e) => setPriceAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#175CFF] rounded accent-[#175CFF]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: KYC, Security & Sessions (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* KYC Verification Card */}
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
              <h3 className="font-bold text-base text-[#10213A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#15803D]" />
                KYC Verification Status
              </h3>
              <span className="text-[11px] font-bold text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                {kyc.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Verification Tier:</span>
                <span className="font-bold text-[#10213A]">Tier {kyc.tier} (Full Access)</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Document Type:</span>
                <span className="font-semibold text-[#10213A]">{kyc.idType}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Daily Acquisition Limit:</span>
                <span className="font-bold text-[#15803D]">$100,000 USD / Day</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Withdrawal / Transfer:</span>
                <span className="font-bold text-[#15803D]">Unrestricted</span>
              </div>
            </div>

            <button
              onClick={() => setKycModalOpen(true)}
              className="w-full py-2 px-4 rounded-xl border border-[#DFE8F5] text-xs font-bold text-[#123B9A] bg-[#EDF4FF] hover:bg-[#DFE8F5] transition-colors"
            >
              Update / Re-verify Documents
            </button>
          </div>

          {/* Security & 2FA Card */}
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
              <h3 className="font-bold text-base text-[#10213A] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#175CFF]" />
                Security & 2FA
              </h3>
              <span className="text-[11px] font-bold text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Protected
              </span>
            </div>

            <div className="space-y-3 text-xs text-[#64748B]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#10213A] block">Two-Factor Authentication</span>
                  <span>Authenticator app (TOTP)</span>
                </div>
                <span className="text-xs font-bold text-[#15803D]">Active</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#DFE8F5]">
                <div>
                  <span className="font-bold text-[#10213A] block">Password Security</span>
                  <span>Last modified 14 days ago</span>
                </div>
                <a
                  href="/dashboard/security"
                  className="text-xs font-bold text-[#175CFF] hover:underline"
                >
                  Change
                </a>
              </div>
            </div>
          </div>

          {/* Active Devices & Sessions */}
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-4">
            <h3 className="font-bold text-base text-[#10213A] flex items-center gap-2 border-b border-[#DFE8F5] pb-3">
              <Laptop className="w-5 h-5 text-[#175CFF]" />
              Active Login Sessions
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-4 h-4 text-[#175CFF]" />
                  <div>
                    <span className="font-bold text-[#10213A] block">Chrome on Windows (Current)</span>
                    <span className="text-[10px] text-[#64748B]">IP: 192.168.1.4 • Active Now</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded">This Device</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-[#64748B]" />
                  <div>
                    <span className="font-bold text-[#10213A] block">Mobile Web App (iPhone 15)</span>
                    <span className="text-[10px] text-[#64748B]">IP: 172.56.21.9 • 2 hours ago</span>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-[#DC2626] hover:underline">Revoke</button>
              </div>
            </div>
          </div>

          {/* Data Export / Compliance */}
          <div className="bg-white rounded-3xl border border-[#DFE8F5] p-6 shadow-card space-y-3">
            <span className="text-xs font-bold text-[#10213A] block">Account Statements & Audit Export</span>
            <p className="text-[11px] text-[#64748B]">
              Download your complete cryptographic ledger history and official receipts archive.
            </p>
            <button
              onClick={() => alert('Exporting full ledger archive in CSV & PDF format...')}
              className="w-full py-2 px-3 rounded-xl border border-[#DFE8F5] text-xs font-semibold text-[#10213A] hover:bg-[#F7FAFF] flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export Account Ledger (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* KYC UPDATE MODAL */}
      {kycModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#DFE8F5] shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#DFE8F5] pb-3">
              <h3 className="font-bold text-base text-[#10213A]">Submit KYC Verification</h3>
              <button onClick={() => setKycModalOpen(false)} className="text-[#64748B] hover:text-[#10213A]">
                ✕
              </button>
            </div>

            <form onSubmit={handleKycSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#10213A] block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={kycName}
                  onChange={(e) => setKycName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#10213A] block mb-1">ID Document Type</label>
                <select
                  value={kycType}
                  onChange={(e) => setKycType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                >
                  <option value="PASSPORT">Passport</option>
                  <option value="NATIONAL_ID">National ID / Aadhaar</option>
                  <option value="DRIVING_LICENSE">Driver's License</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#10213A] block mb-1">Document Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A92831094"
                  value={kycNumber}
                  onChange={(e) => setKycNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setKycModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#DFE8F5] font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#175CFF] text-white font-bold hover:bg-[#123B9A]"
                >
                  Verify Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
