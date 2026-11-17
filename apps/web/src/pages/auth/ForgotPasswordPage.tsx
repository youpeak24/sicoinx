import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { SiLogo } from '../../components/common/SiLogo';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      try {
        await sendPasswordResetEmail(auth, email.trim(), { url: `${window.location.origin}/login` });
      } catch (e: any) {
        // Don't reveal whether an account exists; only surface non-account errors.
        if (e?.code !== 'auth/user-not-found') throw e;
      }
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Request failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <SiLogo size="md" className="justify-center" />
          <h1 className="text-2xl font-bold text-[#10213A] pt-2">Reset your password</h1>
          <p className="text-xs text-[#64748B]">
            Enter your account email to receive a secure single-use password recovery link
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#15803D] mx-auto" />
              <h3 className="font-bold text-lg text-[#10213A]">Recovery Link Dispatched</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                If an account exists for <strong>{email}</strong>, a single-use password reset link has been sent.
              </p>
              <div className="p-3 bg-[#EDF4FF] rounded-xl text-[11px] text-[#123B9A] border border-[#DFE8F5]">
                💡 In local development, view this link instantly via the <strong>Dev Mailbox</strong> button at the bottom-right of your screen!
              </div>
              <div className="pt-2">
                <Link to="/login" className="text-xs font-semibold text-[#175CFF] hover:underline">
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#10213A] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-1 focus:ring-[#175CFF] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Mail className="w-4 h-4" />
                {isLoading ? 'Processing...' : 'Send Recovery Link'}
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#10213A]">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
