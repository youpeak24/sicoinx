import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SiLogo } from '../../components/common/SiLogo';
import { LogIn, AlertCircle, Shield, KeyRound, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requireMfa, setRequireMfa] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await login({ email, password, mfaCode: requireMfa ? mfaCode : undefined });
      if (res.requireMfa) {
        setRequireMfa(true);
        setIsLoading(false);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
      setIsLoading(false);
    }
  };

  // Demo credential autofill helpers
  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#175CFF]/10 rounded-full blur-3xl -z-10 pointer-events-none animate-blob" />

      <div className="w-full max-w-md space-y-6 animate-fade-in-up">
        <div className="text-center space-y-2">
          <div className="inline-block transition-transform duration-200 hover:scale-105">
            <SiLogo size="md" className="justify-center" />
          </div>
          <h2 className="text-2xl font-bold text-[#10213A] pt-2">Sign in to your account</h2>
          <p className="text-xs text-[#64748B]">
            Access your portfolio dashboard, wallet links, and support tickets
          </p>
        </div>

        {/* Demo Fast Login Selector */}
        <div className="bg-[#EDF4FF] rounded-2xl p-4 border border-[#DFE8F5] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#123B9A] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#175CFF]" />
              Quick Demo Accounts
            </span>
            <span className="text-[10px] text-[#64748B]">Click to test</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillCredentials('admin@sicoin.org', 'AdminSecurePass123!')}
              className="p-2.5 rounded-xl bg-white border border-[#DFE8F5] hover:border-[#175CFF] text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-xs"
            >
              <strong className="block text-[#10213A]">Super Admin</strong>
              <span className="text-[#64748B] block truncate">admin@sicoin.org</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('user@sicoin.org', 'UserSecurePass123!')}
              className="p-2.5 rounded-xl bg-white border border-[#DFE8F5] hover:border-[#175CFF] text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-xs"
            >
              <strong className="block text-[#10213A]">Standard User</strong>
              <span className="text-[#64748B] block truncate">user@sicoin.org</span>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-6 interactive-card">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!requireMfa ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-[#10213A]">Password</label>
                    <Link to="/forgot-password" className="text-[11px] font-semibold text-[#175CFF] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#123B9A] flex items-center gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0 text-[#175CFF]" />
                  <span>Two-factor authentication code required for this account.</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1.5">6-Digit Authenticator Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.trim())}
                    placeholder="123456"
                    className="w-full text-center tracking-widest text-lg font-bold px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white text-xs font-semibold shadow-elevated transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <LogIn className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{isLoading ? 'Verifying...' : requireMfa ? 'Verify & Continue' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#64748B]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#175CFF] hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
