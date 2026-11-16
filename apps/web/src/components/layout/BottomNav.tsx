import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { Home, TrendingUp, Wallet, User, Coins, type LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  active: boolean;
}

// Brand gradient taken from the SI Coin logo (green → cyan → blue)
const LOGO_GRADIENT = 'bg-gradient-to-br from-[#2EE66B] via-[#0AB5E0] to-[#1457FF]';

export const BottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { kyc } = useWallet();

  const items: NavItem[] = [
    {
      label: 'Home',
      path: user ? '/dashboard' : '/',
      icon: Home,
      active: user ? pathname === '/dashboard' : pathname === '/',
    },
    {
      label: 'Market',
      path: user ? '/dashboard/market' : '/market',
      icon: TrendingUp,
      active: pathname.startsWith('/dashboard/market') || pathname === '/market',
    },
    {
      label: 'Wallet',
      path: user ? '/dashboard/wallets' : '/login',
      icon: Wallet,
      active: pathname.startsWith('/dashboard/wallets') || pathname.startsWith('/dashboard/portfolio'),
    },
    {
      label: 'Profile',
      path: user ? '/dashboard/profile' : '/login',
      icon: User,
      active:
        pathname.startsWith('/dashboard/profile') ||
        pathname.startsWith('/dashboard/settings') ||
        pathname.startsWith('/dashboard/security'),
    },
  ];

  const buyPath = user ? '/dashboard/purchase' : '/buy';
  const isBuyActive = pathname.startsWith('/dashboard/purchase') || pathname === '/buy';

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const isProfile = item.label === 'Profile';

    return (
      <Link
        key={item.label}
        to={item.path}
        aria-label={item.label}
        aria-current={item.active ? 'page' : undefined}
        className="group flex flex-col items-center justify-center gap-0.5 py-1 focus:outline-none"
      >
        <span
          className={`relative flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200 ${
            item.active ? 'bg-[#175CFF]/10' : 'group-hover:bg-[#F1F5FB]'
          }`}
        >
          {isProfile && user ? (
            <span
              className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-semibold text-white transition-colors ${
                item.active ? LOGO_GRADIENT : 'bg-[#94A3B8]'
              }`}
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <Icon
              className={`h-[22px] w-[22px] transition-colors duration-200 ${
                item.active ? 'text-[#175CFF]' : 'text-[#64748B] group-hover:text-[#10213A]'
              }`}
              strokeWidth={item.active ? 2.25 : 1.75}
            />
          )}
          {isProfile && user && kyc.status === 'VERIFIED' && (
            <span
              className="absolute bottom-0.5 right-2.5 h-2 w-2 rounded-full bg-[#15803D] ring-2 ring-white"
              title="Verified account"
            />
          )}
        </span>
        <span
          className={`text-[10px] leading-none tracking-tight transition-colors ${
            item.active ? 'font-semibold text-[#175CFF]' : 'font-medium text-[#64748B]'
          }`}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DFE8F5] bg-white/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-1.5 pt-1.5">
        {renderItem(items[0])}
        {renderItem(items[1])}

        {/* Center action: Buy SI */}
        <Link
          to={buyPath}
          aria-label="Buy SI Coin"
          aria-current={isBuyActive ? 'page' : undefined}
          className="group flex flex-col items-center justify-end gap-0.5 pb-1 focus:outline-none"
        >
          <span
            className={`-mt-6 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-white shadow-[0_6px_16px_-2px_rgba(23,92,255,0.45)] transition-transform duration-200 group-hover:scale-105 group-active:scale-95 ${LOGO_GRADIENT}`}
          >
            <Coins className="h-5 w-5" strokeWidth={2} />
          </span>
          <span
            className={`text-[10px] leading-none tracking-tight ${
              isBuyActive ? 'font-semibold text-[#175CFF]' : 'font-medium text-[#10213A]'
            }`}
          >
            Buy SI
          </span>
        </Link>

        {renderItem(items[2])}
        {renderItem(items[3])}
      </div>
    </nav>
  );
};
