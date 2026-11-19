import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SiLogo } from './SiLogo';
import { api } from '../../lib/api';
import { Mail, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      await api.post('/public/newsletter', { email });
      setStatus('success');
      setMsg('Thank you for subscribing to official protocol updates.');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMsg(err.message || 'Subscription failed. Please check your email.');
    }
  };

  return (
    <footer className="bg-white border-t border-[#DFE8F5] pt-16 pb-12 text-[#10213A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#DFE8F5]">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="transition-transform duration-200 hover:scale-[1.02]">
              <SiLogo size="md" />
            </div>
            <p className="text-[#64748B] text-sm leading-relaxed max-w-sm">
              Discover SI Coin through transparent disclosures, verified supply allocations, and non-custodial ecosystem infrastructure.
            </p>
            <div className="pt-2 text-xs text-[#64748B] space-y-1.5">
              <p>Official Contact: <a href="mailto:info@sicoin.org" className="text-[#175CFF] hover:underline font-medium">info@sicoin.org</a></p>
              <p className="flex items-center gap-1.5 font-medium">
                <span>Network Status:</span>
                <span className="inline-flex items-center gap-1 text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-ping" />
                  Sepolia Testnet Preview
                </span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bold text-xs text-[#10213A] mb-3.5 tracking-wider uppercase">Protocol</h4>
            <ul className="space-y-2.5 text-sm text-[#64748B]">
              <li><Link to="/about" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">About SI Coin</Link></li>
              <li><Link to="/tokenomics" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Tokenomics & Vesting</Link></li>
              <li><Link to="/roadmap" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Roadmap & Targets</Link></li>
              <li><Link to="/whitepaper" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Technical Whitepaper</Link></li>
              <li><Link to="/market" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Reference Price Feeds</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-[#10213A] mb-3.5 tracking-wider uppercase">Resources</h4>
            <ul className="space-y-2.5 text-sm text-[#64748B]">
              <li><Link to="/wallets" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Wallet Directory</Link></li>
              <li><Link to="/wallets/guide" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Wallet Safety Guide</Link></li>
              <li><Link to="/ecosystem" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Ecosystem Directory</Link></li>
              <li><Link to="/announcements" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Official Announcements</Link></li>
              <li><Link to="/faq" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Contact Engineering</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#175CFF] hover:translate-x-1 inline-block transition-all">Account Dashboard</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 className="font-bold text-xs text-[#10213A] mb-3.5 tracking-wider uppercase">Stay Updated</h4>
            <p className="text-xs text-[#64748B] mb-3 leading-relaxed">
              Subscribe for transparent project updates, milestone deliveries, and security disclosures.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full text-xs px-3.5 py-2.5 pr-8 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] focus:ring-2 focus:ring-[#175CFF]/15 transition-all shadow-xs"
                />
                <Mail className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-3" />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl bg-[#175CFF] hover:bg-[#123B9A] text-white shadow-xs hover:shadow transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 group"
              >
                <span>{status === 'loading' ? 'Subscribing...' : 'Subscribe'}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
              {status === 'success' && (
                <p className="text-[11px] text-[#15803D] flex items-center gap-1 mt-1 animate-fade-in">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                  {msg}
                </p>
              )}
              {status === 'error' && (
                <p className="text-[11px] text-[#DC2626] mt-1 animate-fade-in">{msg}</p>
              )}
            </form>
          </div>
        </div>

        {/* Regulatory & Risk Notice */}
        <div className="py-6 border-b border-[#DFE8F5] text-xs text-[#64748B] leading-relaxed flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#B45309] flex-shrink-0 mt-0.5" />
          <p>
            <strong>Risk Disclosure:</strong> Digital assets are subject to market volatility and technical development uncertainty. SI Coin does not offer guaranteed returns, staking yields, or speculative profit schemes. The reference price displayed across this platform is an informational metric established for transparency and does not constitute an executable exchange quote or offer to purchase securities. Review our full{' '}
            <Link to="/risk-disclosure" className="text-[#175CFF] underline underline-offset-2">Risk Disclosure</Link> before participation.
          </p>
        </div>

        {/* Bottom copyright & legal links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p>© {new Date().getFullYear()} SI Coin Ecosystem Foundation. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-[#175CFF] transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-[#175CFF] transition-colors">Privacy Policy</Link>
            <Link to="/risk-disclosure" className="hover:text-[#175CFF] transition-colors">Risk Disclosures</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
