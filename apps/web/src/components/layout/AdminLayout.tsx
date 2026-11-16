import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SiLogo } from '../common/SiLogo';
import { DevMailboxModal } from '../common/DevMailboxModal';
import { PageTransition } from '../common/animations/PageTransition';
import {
  LayoutDashboard,
  Coins,
  DollarSign,
  History,
  Users,
  PieChart,
  Grid,
  Milestone,
  FileText,
  Megaphone,
  HelpCircle,
  Headphones,
  Mail,
  ShieldAlert,
  ClipboardList,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  CreditCard,
  ArrowLeftRight,
  BarChart3,
  Key,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isLoading, isStaff, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFF] text-[#64748B]">
        <img src="/logo.png" alt="Loading" className="w-14 h-14 animate-pulse" />
      </div>
    );
  }

  // Enforce staff access
  if (!user || !isStaff) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F7FAFF] text-center">
        <ShieldAlert className="w-12 h-12 text-[#DC2626] mb-4" />
        <h1 className="text-2xl font-bold text-[#10213A] mb-2">Administrative Access Restricted</h1>
        <p className="text-sm text-[#64748B] max-w-md mb-6">
          You must be signed in with an authorized administrative staff role (Super Admin, Finance Manager, Content Editor, Support Agent, or Analyst).
        </p>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 rounded-xl bg-[#175CFF] text-white text-sm font-semibold">
            Sign In with Staff Account
          </Link>
          <Link to="/" className="px-4 py-2 rounded-xl border border-[#DFE8F5] text-sm font-semibold text-[#10213A]">
            Back to Public Site
          </Link>
        </div>
      </div>
    );
  }

  const roleBadgeColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    FINANCE_MANAGER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CONTENT_EDITOR: 'bg-blue-100 text-blue-800 border-blue-200',
    SUPPORT_AGENT: 'bg-amber-100 text-amber-800 border-amber-200',
    READONLY_ANALYST: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const navSections = [
    {
      title: 'Digital Coin & Financials',
      items: [
        { label: 'KYC Approvals', path: '/admin/kyc', icon: ShieldCheck },
        { label: 'Buy / Sell Orders', path: '/admin/orders', icon: ArrowLeftRight },
        { label: 'Wallet Management', path: '/admin/wallets', icon: Coins },
        { label: 'Payment Monitoring', path: '/admin/payments', icon: CreditCard },
        { label: 'Reports & Analytics', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Ecosystem Partner APIs', path: '/admin/partners', icon: Key },
      ],
    },
    {
      title: 'Core Telemetry',
      items: [
        { label: 'System Overview', path: '/admin', icon: LayoutDashboard },
        { label: 'Coin Configuration', path: '/admin/coin', icon: Coins },
      ],
    },
    {
      title: 'Pricing & Valuation',
      items: [
        { label: 'Pricing Controls', path: '/admin/pricing', icon: DollarSign },
        { label: 'Price History & CSV', path: '/admin/price-history', icon: History },
        { label: 'Tokenomics Allocation', path: '/admin/tokenomics', icon: PieChart },
      ],
    },
    {
      title: 'Content CMS',
      items: [
        { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
        { label: 'FAQ Manager', path: '/admin/faq', icon: HelpCircle },
        { label: 'Roadmap Milestones', path: '/admin/roadmap', icon: Milestone },
        { label: 'Ecosystem Modules', path: '/admin/ecosystem', icon: Grid },
      ],
    },
    {
      title: 'Operations & Users',
      items: [
        { label: 'User Management', path: '/admin/users', icon: Users },
        { label: 'Support Tickets', path: '/admin/support', icon: Headphones },
        { label: 'Newsletter Subscribers', path: '/admin/subscribers', icon: Mail },
        { label: 'Role Permissions Matrix', path: '/admin/roles', icon: ShieldCheck },
        { label: 'Audit Log Trail', path: '/admin/audit-logs', icon: ClipboardList },
        { label: 'System Settings', path: '/admin/settings', icon: Sliders },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-[#F7FAFF] text-[#10213A]">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden xl:flex flex-col w-64 border-r border-[#DFE8F5] bg-white p-5 justify-between flex-shrink-0 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <SiLogo size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EDF4FF] text-[#123B9A] px-2 py-0.5 rounded-full border border-[#DFE8F5]">
              Admin
            </span>
          </div>

          {/* Current Staff Profile */}
          <div className="p-3 rounded-2xl bg-[#F7FAFF] border border-[#DFE8F5] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#10213A] truncate">{user.name}</span>
              <span
                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                  roleBadgeColors[user.role] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <span className="text-[11px] text-[#64748B] block truncate">{user.email}</span>
          </div>

          {/* Menu Sections */}
          <div className="space-y-5">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-3">
                  {sec.title}
                </span>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-[#175CFF] text-white shadow-xs'
                          : 'text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-[#64748B]'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 mt-6 border-t border-[#DFE8F5] space-y-1.5">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF]"
          >
            <span>User Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#10213A] hover:bg-[#F7FAFF]"
          >
            <span>Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#DFE8F5] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-[#10213A] hover:bg-[#F7FAFF] xl:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-[#10213A]">SI Coin Administration Portal</h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${
                roleBadgeColors[user.role] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {user.role.replace('_', ' ')}
            </span>
            <Link
              to="/"
              className="text-xs font-semibold text-[#64748B] hover:text-[#175CFF] hidden sm:inline-flex items-center gap-1"
            >
              View Public Site
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Admin Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden animate-fade-in">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-72 max-w-xs bg-white p-5 z-10 justify-between overflow-y-auto animate-fade-in-scale">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SiLogo size="sm" />
                <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-[#64748B]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navSections.map((sec) => (
                <div key={sec.title} className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-3">
                    {sec.title}
                  </span>
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                          active ? 'bg-[#175CFF] text-white' : 'text-[#64748B]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#DFE8F5]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#DC2626]"
              >
                <LogOut className="w-3.5 h-3.5" />
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
