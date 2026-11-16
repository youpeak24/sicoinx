import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SiLogo } from '../common/SiLogo';
import { DevMailboxModal } from '../common/DevMailboxModal';
import { PageTransition } from '../common/animations/PageTransition';
import {
  LayoutDashboard,
  PieChart,
  Activity,
  Wallet,
  Bell,
  HelpCircle,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, isLoading, logout, isStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFF] text-[#64748B]">
        <div className="w-8 h-8 border-4 border-[#175CFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const menuItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Portfolio', path: '/dashboard/portfolio', icon: PieChart },
    { label: 'Activity & Ledger', path: '/dashboard/activity', icon: Activity },
    { label: 'Wallets', path: '/dashboard/wallets', icon: Wallet },
    { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { label: 'Support & Inquiries', path: '/dashboard/support', icon: HelpCircle },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
    { label: 'Security & 2FA', path: '/dashboard/security', icon: Shield },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-[#F7FAFF] text-[#10213A]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#DFE8F5] bg-white p-6 justify-between flex-shrink-0">
        <div className="space-y-6">
          <div className="transition-transform duration-200 hover:scale-[1.02]">
            <SiLogo size="md" />
          </div>

          {/* User Brief Card */}
          <div className="p-3.5 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] flex items-center gap-3 transition-colors hover:border-[#175CFF]/30">
            <div className="w-10 h-10 rounded-full bg-[#175CFF] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-xs text-[#10213A] truncate block">{user.name}</span>
              <span className="text-[11px] text-[#64748B] truncate block">{user.email}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-[#175CFF] text-white shadow-elevated translate-x-1'
                      : 'text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF] hover:translate-x-0.5'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${active ? 'text-white' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#DFE8F5] space-y-2">
          {isStaff && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#123B9A] bg-[#EDF4FF] border border-[#DFE8F5] hover:bg-[#DFE8F5] transition-all duration-200 hover:-translate-y-0.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#175CFF]" />
              <span>Admin Portal</span>
            </Link>
          )}

          <Link
            to="/"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF] transition-all duration-200"
          >
            <span>Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-18 bg-white border-b border-[#DFE8F5] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg text-[#10213A] hover:bg-[#F7FAFF] lg:hidden active:scale-95 transition-transform"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-[#10213A]">User Dashboard</h2>
              <p className="text-[11px] text-[#64748B]">Verifiable Digital Asset Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Ticker Pill with pulse */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF4FF] border border-[#DFE8F5] text-xs font-semibold text-[#123B9A] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
              <span>SI Ref: $1.250000 USD</span>
            </div>

            <Link
              to="/dashboard/notifications"
              className="p-2 rounded-xl border border-[#DFE8F5] text-[#64748B] hover:text-[#175CFF] hover:bg-[#F7FAFF] relative transition-all duration-200 active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#175CFF] animate-pulse" />
            </Link>

            <Link
              to="/dashboard/wallets"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DFE8F5] text-xs font-semibold text-[#10213A] hover:border-[#175CFF] hover:text-[#175CFF] bg-[#F7FAFF] transition-all duration-200 hover:-translate-y-0.5"
            >
              <Wallet className="w-3.5 h-3.5 text-[#175CFF]" />
              <span className="hidden sm:inline">Linked Wallets</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-xs bg-white p-6 z-10 justify-between animate-fade-in-scale">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <SiLogo size="md" />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#10213A] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-[#175CFF] text-white shadow-xs'
                          : 'text-[#64748B] hover:text-[#10213A]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#DFE8F5] space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#DC2626]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <DevMailboxModal />
    </div>
  );
};
