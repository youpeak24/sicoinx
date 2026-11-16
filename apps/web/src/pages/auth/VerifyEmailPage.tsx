import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { SiLogo } from '../../components/common/SiLogo';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    tokenFromUrl ? 'loading' : 'idle'
  );
  const [message, setMessage] = useState('');

  const executeVerification = async (verifyToken: string) => {
    setStatus('loading');
    setMessage('');
    try {
      await api.post('/auth/verify-email', { token: verifyToken });
      setStatus('success');
      setMessage('Your email address has been verified successfully!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Verification token is invalid or has expired.');
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      executeVerification(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <SiLogo size="md" className="justify-center" />
          <h2 className="text-2xl font-bold text-[#10213A] pt-2">Email Verification</h2>
          <p className="text-xs text-[#64748B]">Confirm your cryptographic account address</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-6">
          {status === 'loading' ? (
            <div className="text-center py-8 space-y-3">
              <img src="/logo.png" alt="Loading" className="w-12 h-12 animate-pulse mx-auto" />
              <p className="text-xs text-[#64748B]">Validating cryptographic verification token...</p>
            </div>
          ) : status === 'success' ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#15803D] mx-auto" />
              <h3 className="font-bold text-lg text-[#10213A]">Account Verified</h3>
              <p className="text-xs text-[#64748B]">{message}</p>
              <div className="pt-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A]"
                >
                  Go to Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {status === 'error' && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Verification Token</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token here if not automatically loaded"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] font-mono"
                />
              </div>

              <button
                onClick={() => executeVerification(token)}
                disabled={!token}
                className="w-full py-2.5 px-4 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white text-xs font-semibold transition-all shadow-xs"
              >
                Confirm Verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
