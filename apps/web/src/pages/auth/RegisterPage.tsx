import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SiLogo } from '../../components/common/SiLogo';
import { UserPlus, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setErrorMsg('You must accept the terms of service and risk disclosure to register.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      await register({ name, email, password, acceptTerms });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
      setIsLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-[#10213A] pt-2">Create your account</h2>
          <p className="text-xs text-[#64748B]">
            Join the SI Coin ecosystem to monitor portfolio assets, connect wallets, and access research
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#DFE8F5] shadow-card space-y-6 interactive-card">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#10213A] mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David Mercer"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
              />
            </div>

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
              <label className="block text-xs font-semibold text-[#10213A] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars, 1 uppercase, 1 number"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
              />
              <span className="text-[10px] text-[#64748B] mt-1.5 block">
                Must contain at least 8 characters, one uppercase letter, and one number.
              </span>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded border-[#DFE8F5] text-[#175CFF] focus:ring-[#175CFF] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[#64748B] leading-tight cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-[#175CFF] underline hover:text-[#123B9A]">Terms of Service</Link>,{' '}
                <Link to="/privacy" className="text-[#175CFF] underline hover:text-[#123B9A]">Privacy Policy</Link>, and acknowledge the{' '}
                <Link to="/risk-disclosure" className="text-[#175CFF] underline hover:text-[#123B9A]">Risk Disclosure</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white text-xs font-semibold shadow-elevated transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#64748B]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#175CFF] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
