import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SiLogo } from './SiLogo';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { Menu, X, ArrowUpRight, ShieldCheck, User, Sparkles, ShoppingBag, Wallet } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isStaff } = useAuth();
  const { coinBalance, referencePriceUsd, ratesLoaded } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', path: '/about' },
    { label: 'Ecosystem', path: '/ecosystem' },
    { label: 'Wallets', path: '/wallets' },
    { label: 'Tokenomics', path: '/tokenomics' },
    { label: 'Market & Graph', shortLabel: 'Market', path: '/market' },
    { label: 'Roadmap', path: '/roadmap' },
    { label: 'Whitepaper', path: '/whitepaper' },
    { label: 'FAQ', path: '/faq' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-card border-b border-[#DFE8F5]'
          : 'bg-white/80 backdrop-blur-md border-b border-[#DFE8F5]/60'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-20 flex items-center justify-between gap-2 xl:gap-4">
        {/* Logo with hover scale */}
        <div className="shrink-0 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <SiLogo size="md" />
        </div>

        {/* Desktop Navigation Links with animated indicator */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2 shrink-0">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative inline-flex items-center justify-center px-2 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                  active
                    ? 'text-[#175CFF] font-semibold'
                    : 'text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF]'
                }`}
              >
                <span>
                  {link.shortLabel ? (
                    <>
                      <span className="xl:hidden">{link.shortLabel}</span>
                      <span className="hidden xl:inline">{link.label}</span>
                    </>
                  ) : (
                    link.label
                  )}
                </span>
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#175CFF] rounded-full animate-fade-in shadow-xs" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
          {/* Quick Buy SI Button */}
          <Link
            to={user ? '/dashboard/purchase' : '/buy'}
            className="inline-flex items-center gap-1.5 px-3 xl:px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#123B9A] via-[#175CFF] to-[#38BDF8] shadow-elevated hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>{ratesLoaded ? `Buy SI ($${referencePriceUsd.toFixed(2)})` : 'Buy SI'}</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 xl:gap-3 shrink-0">
              {isStaff && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#EDF4FF] text-[#123B9A] hover:bg-[#DFE8F5] border border-[#DFE8F5] transition-all duration-200 hover:-translate-y-0.5 shadow-xs whitespace-nowrap shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#175CFF] shrink-0" />
                  <span>Admin Panel</span>
                </Link>
              )}
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-3.5 xl:px-4 py-2 rounded-xl text-xs xl:text-sm font-semibold text-white bg-[#175CFF] hover:bg-[#123B9A] shadow-elevated transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Dashboard ({coinBalance.toFixed(0)} SI)</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 xl:gap-2.5 shrink-0">
              <Link
                to="/login"
                className="px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-semibold text-[#10213A] hover:text-[#175CFF] transition-colors duration-200 whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="relative overflow-hidden inline-flex items-center gap-1.5 px-3 xl:px-4 py-2 rounded-xl text-xs xl:text-sm font-semibold text-white bg-[#175CFF] hover:bg-[#123B9A] shadow-elevated transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] group whitespace-nowrap shrink-0"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                <Sparkles className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span className="whitespace-nowrap">Get Started</span>
                <ArrowUpRight className="w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button with rotation animation */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to={user ? '/dashboard/purchase' : '/buy'}
            className="p-2 rounded-xl text-white bg-gradient-to-r from-[#175CFF] to-[#38BDF8] shadow-xs active:scale-95"
            title="Buy SI"
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="p-2 rounded-xl text-[#175CFF] bg-[#EDF4FF] transition-transform active:scale-95"
              title="Dashboard"
            >
              <User className="w-5 h-5" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#10213A] hover:bg-[#F7FAFF] transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <div className="transition-transform duration-200">
              {mobileMenuOpen ? <X className="w-6 h-6 rotate-90" /> : <Menu className="w-6 h-6" />}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer with smooth animation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#DFE8F5] bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-fade-in-down shadow-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-[#175CFF] bg-[#EDF4FF] font-semibold'
                    : 'text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#DFE8F5] flex flex-col gap-2">
            <Link
              to={user ? '/dashboard/purchase' : '/buy'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#123B9A] via-[#175CFF] to-[#38BDF8] shadow-elevated flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase SI Coins</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-[#175CFF] shadow-sm hover:bg-[#123B9A] transition-colors"
                >
                  Open Dashboard ({coinBalance.toFixed(0)} SI)
                </Link>
                {isStaff && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-[#123B9A] bg-[#EDF4FF] border border-[#DFE8F5] hover:bg-[#DFE8F5] transition-colors"
                  >
                    Go to Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-[#10213A] border border-[#DFE8F5] hover:bg-[#F7FAFF] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-[#175CFF] shadow-elevated hover:bg-[#123B9A] transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
