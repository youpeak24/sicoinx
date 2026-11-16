import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  User,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { coinBalance, kyc } = useWallet();

  const isCurrent = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      label: 'Home',
      path: user ? '/dashboard' : '/',
      icon: LayoutDashboard,
      active: user ? isCurrent('/dashboard') && location.pathname === '/dashboard' : location.pathname === '/',
    },
    {
      label: 'Market',
      path: user ? '/dashboard/market' : '/market',
      icon: TrendingUp,
      active: isCurrent('/dashboard/market') || location.pathname === '/market',
    },
    // Center Buy Item rendered separately
    {
      label: 'Wallet',
      path: user ? '/dashboard/wallets' : '/login',
      icon: Wallet,
      active: isCurrent('/dashboard/wallets') || isCurrent('/dashboard/portfolio'),
      badge: `${coinBalance >= 1000 ? (coinBalance / 1000).toFixed(1) + 'k' : coinBalance.toFixed(0)} SI`,
    },
    {
      label: 'Profile',
      path: user ? '/dashboard/profile' : '/login',
      icon: User,
      active: isCurrent('/dashboard/profile') || isCurrent('/dashboard/settings') || isCurrent('/dashboard/security'),
      verified: kyc.status === 'VERIFIED',
    },
  ];

  const buyPath = user ? '/dashboard/purchase' : '/buy';
  const isBuyActive = location.pathname.startsWith('/dashboard/purchase') || location.pathname === '/buy';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block">
      {/* Subtle Backdrop gradient fade for seamless blend */}
      <div className="h-6 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />

      {/* Main Bar */}
      <nav
        aria-label="Bottom Navigation"
        className="bg-white/95 backdrop-blur-xl border-t border-[#DFE8F5] shadow-[0_-8px_30px_rgba(16,33,58,0.08)] px-2 sm:px-6 py-2 transition-all"
      >
        <div className="max-w-md mx-auto flex items-center justify-between relative">
          {/* Left Item 1: Home */}
          <Link
            to={navItems[0].path}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 group ${
              navItems[0].active
                ? 'text-[#175CFF]'
                : 'text-[#64748B] hover:text-[#10213A]'
            }`}
          >
            <div className="relative p-1">
              <LayoutDashboard className={`w-5 h-5 transition-transform duration-200 ${navItems[0].active ? 'scale-110 stroke-[2.5]' : 'group-hover:scale-105'}`} />
              {navItems[0].active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#175CFF] shadow-[0_0_8px_#175CFF]" />
              )}
            </div>
            <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${navItems[0].active ? 'text-[#175CFF]' : 'text-[#64748B]'}`}>
              {navItems[0].label}
            </span>
          </Link>

          {/* Left Item 2: Market */}
          <Link
            to={navItems[1].path}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 group ${
              navItems[1].active
                ? 'text-[#175CFF]'
                : 'text-[#64748B] hover:text-[#10213A]'
            }`}
          >
            <div className="relative p-1">
              <TrendingUp className={`w-5 h-5 transition-transform duration-200 ${navItems[1].active ? 'scale-110 stroke-[2.5]' : 'group-hover:scale-105'}`} />
              {navItems[1].active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#175CFF] shadow-[0_0_8px_#175CFF]" />
              )}
            </div>
            <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${navItems[1].active ? 'text-[#175CFF]' : 'text-[#64748B]'}`}>
              {navItems[1].label}
            </span>
          </Link>

          {/* CENTER ELEVATED ACTION BUTTON: BUY SI COIN */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-6">
            <Link
              to={buyPath}
              className={`relative group flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#123B9A] via-[#175CFF] to-[#38BDF8] text-white shadow-elevated hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white ring-4 ${
                isBuyActive ? 'ring-[#175CFF]/30 scale-105' : 'ring-transparent'
              }`}
              title="Buy SI Coin"
            >
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShoppingBag className="w-6 h-6 text-white drop-shadow-sm transition-transform duration-200 group-hover:rotate-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#38BDF8] border-2 border-white" />
              </span>
            </Link>
            <span className={`text-[10px] font-bold mt-1 tracking-tight ${isBuyActive ? 'text-[#175CFF]' : 'text-[#10213A]'}`}>
              Buy SI
            </span>
          </div>

          {/* Right Item 3: Wallets */}
          <Link
            to={navItems[2].path}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 group relative ${
              navItems[2].active
                ? 'text-[#175CFF]'
                : 'text-[#64748B] hover:text-[#10213A]'
            }`}
          >
            <div className="relative p-1">
              <Wallet className={`w-5 h-5 transition-transform duration-200 ${navItems[2].active ? 'scale-110 stroke-[2.5]' : 'group-hover:scale-105'}`} />
              {navItems[2].active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#175CFF] shadow-[0_0_8px_#175CFF]" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[10px] font-semibold tracking-tight ${navItems[2].active ? 'text-[#175CFF]' : 'text-[#64748B]'}`}>
                {navItems[2].label}
              </span>
            </div>
          </Link>

          {/* Right Item 4: Profile */}
          <Link
            to={navItems[3].path}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 group ${
              navItems[3].active
                ? 'text-[#175CFF]'
                : 'text-[#64748B] hover:text-[#10213A]'
            }`}
          >
            <div className="relative p-1">
              {user ? (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                  navItems[3].active ? 'bg-[#175CFF] ring-2 ring-[#175CFF]/30' : 'bg-[#64748B]'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className={`w-5 h-5 transition-transform duration-200 ${navItems[3].active ? 'scale-110 stroke-[2.5]' : 'group-hover:scale-105'}`} />
              )}

              {navItems[3].verified && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#15803D] ring-1 ring-white" title="Verified Account" />
              )}

              {navItems[3].active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#175CFF] shadow-[0_0_8px_#175CFF]" />
              )}
            </div>
            <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${navItems[3].active ? 'text-[#175CFF]' : 'text-[#64748B]'}`}>
              {navItems[3].label}
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
