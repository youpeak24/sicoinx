import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  FileText,
  UserCheck,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const KycPage: React.FC = () => {
  const [kycData, setKycData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState<'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE'>('AADHAAR');
  const [idNumber, setIdNumber] = useState('');
  const [documentFrontUrl, setDocumentFrontUrl] = useState('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600');
  const [documentBackUrl, setDocumentBackUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kyc/status');
      setKycData(res);
      if (res && res.fullName) {
        setFullName(res.fullName);
        setIdType(res.idType);
        setIdNumber(res.idNumber);
      }
    } catch (err: any) {
      console.error('Failed to load KYC status', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await api.post('/kyc/submit', {
        fullName,
        idType,
        idNumber,
        documentFrontUrl,
        documentBackUrl: documentBackUrl || undefined,
        selfieUrl: selfieUrl || undefined,
      });

      setSuccess('KYC documents submitted successfully. Verification takes 1-24 hours.');
      setKycData(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to submit KYC.');
    } finally {
      setSubmitting(false);
    }
  };

  const status = kycData?.status || 'NOT_SUBMITTED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#10213A]">Identity Verification (KYC)</h1>
        <p className="text-sm text-[#64748B]">
          Complete Know Your Customer (KYC) identity compliance to unlock full withdrawal limits and digital coin transfers.
        </p>
      </div>

      {/* Status Banner */}
      {status === 'APPROVED' && (
        <div className="p-5 rounded-2xl bg-green-50 border border-green-200 text-green-900 flex items-start gap-3.5">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Identity Verified (Level 2 KYC Approved)</h3>
            <p className="text-xs text-green-800">
              Your account has full compliance clearance. You have unrestricted access to buy coins, sell to bank, and transfer across YouPeak platforms.
            </p>
            <div className="text-[11px] font-mono text-green-700 pt-1">
              Verified Name: <strong>{kycData.fullName}</strong> | Document: <strong>{kycData.idType} (****{kycData.idNumber.slice(-4)})</strong>
            </div>
          </div>
        </div>
      )}

      {status === 'PENDING' && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5">
          <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Verification Under Review</h3>
            <p className="text-xs text-amber-800">
              Your documents have been submitted to our compliance queue. Typical review time is 1 to 24 hours.
            </p>
            <div className="text-[11px] font-mono text-amber-700 pt-1">
              Submitted: {new Date(kycData.submittedAt || Date.now()).toLocaleString()} | Document: {kycData.idType}
            </div>
          </div>
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3.5">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Verification Needs Attention</h3>
            <p className="text-xs text-red-800">
              Reason: {kycData.rejectionReason || 'Uploaded document was unreadable or mismatching details.'}
            </p>
            <p className="text-[11px] text-red-700">Please review your information below and resubmit.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      {/* KYC Form (Shown if not approved, or if resubmitting) */}
      {status !== 'APPROVED' && (
        <div className="bg-white border border-[#DFE8F5] rounded-2xl p-6 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#10213A] mb-1.5 uppercase tracking-wide">
                Full Name (As on Government ID)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. David M. User"
                className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#10213A] mb-1.5 uppercase tracking-wide">
                  Document Type
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as any)}
                  className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-[#DFE8F5] bg-white focus:ring-2 focus:ring-[#175CFF]"
                >
                  <option value="AADHAAR">Aadhaar Card (India)</option>
                  <option value="PAN">PAN Card (India)</option>
                  <option value="PASSPORT">Passport (International)</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10213A] mb-1.5 uppercase tracking-wide">
                  Document ID Number
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. 4829-1928-8472 or ABCDE1234F"
                  className="w-full text-xs font-mono font-medium px-4 py-2.5 rounded-xl border border-[#DFE8F5] focus:ring-2 focus:ring-[#175CFF]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#10213A] uppercase tracking-wide">
                Document Images & Proof
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] space-y-2">
                  <div className="text-xs font-bold text-[#10213A] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#175CFF]" /> Front of Document (Required)
                  </div>
                  <input
                    type="text"
                    value={documentFrontUrl}
                    onChange={(e) => setDocumentFrontUrl(e.target.value)}
                    placeholder="Document image URL or upload"
                    className="w-full text-[11px] px-3 py-1.5 rounded-lg border border-[#DFE8F5] bg-white"
                  />
                  <div className="text-[10px] text-[#64748B]">Preview verified front side.</div>
                </div>

                <div className="p-4 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] space-y-2">
                  <div className="text-xs font-bold text-[#10213A] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#175CFF]" /> Back of Document (Optional)
                  </div>
                  <input
                    type="text"
                    value={documentBackUrl}
                    onChange={(e) => setDocumentBackUrl(e.target.value)}
                    placeholder="Back image URL or leave blank"
                    className="w-full text-[11px] px-3 py-1.5 rounded-lg border border-[#DFE8F5] bg-white"
                  />
                  <div className="text-[10px] text-[#64748B]">Required for Aadhaar / License.</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !fullName || !idNumber}
              className="w-full py-3 px-4 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Submitting to Compliance...' : 'Submit Identity Verification'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
