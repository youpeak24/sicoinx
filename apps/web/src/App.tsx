import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { RouteSeo } from './seo/dom';

/**
 * Route-level code splitting: only the layout + home page ship in the entry
 * bundle. Everything else (dashboard, admin, charts, 3D market view, Firebase
 * heavy pages) is fetched on demand, which keeps the first load fast — a core
 * web vital and therefore a search ranking signal.
 */
function lazyPage<T extends Record<string, any>>(loader: () => Promise<T>, name: keyof T) {
  return lazy(() => loader().then((m) => ({ default: m[name] as React.ComponentType<any> })));
}

// Layouts
const DashboardLayout = lazyPage(() => import('./components/layout/DashboardLayout'), 'DashboardLayout');
const AdminLayout = lazyPage(() => import('./components/layout/AdminLayout'), 'AdminLayout');

// Public Pages
const AboutPage = lazyPage(() => import('./pages/public/AboutPage'), 'AboutPage');
const EcosystemPage = lazyPage(() => import('./pages/public/EcosystemPage'), 'EcosystemPage');
const WalletsDirectoryPage = lazyPage(() => import('./pages/public/WalletsDirectoryPage'), 'WalletsDirectoryPage');
const WalletDetailPage = lazyPage(() => import('./pages/public/WalletDetailPage'), 'WalletDetailPage');
const WalletComparePage = lazyPage(() => import('./pages/public/WalletComparePage'), 'WalletComparePage');
const WalletGuidePage = lazyPage(() => import('./pages/public/WalletGuidePage'), 'WalletGuidePage');
const TokenomicsPage = lazyPage(() => import('./pages/public/TokenomicsPage'), 'TokenomicsPage');
const RoadmapPage = lazyPage(() => import('./pages/public/RoadmapPage'), 'RoadmapPage');
const MarketPage = lazyPage(() => import('./pages/public/MarketPage'), 'MarketPage');
const WhitepaperPage = lazyPage(() => import('./pages/public/WhitepaperPage'), 'WhitepaperPage');
const AnnouncementsPage = lazyPage(() => import('./pages/public/AnnouncementsPage'), 'AnnouncementsPage');
const AnnouncementDetailPage = lazyPage(() => import('./pages/public/AnnouncementDetailPage'), 'AnnouncementDetailPage');
const FaqPage = lazyPage(() => import('./pages/public/FaqPage'), 'FaqPage');
const ContactPage = lazyPage(() => import('./pages/public/ContactPage'), 'ContactPage');
const TermsPage = lazyPage(() => import('./pages/public/TermsPage'), 'TermsPage');
const PrivacyPage = lazyPage(() => import('./pages/public/PrivacyPage'), 'PrivacyPage');
const RiskDisclosurePage = lazyPage(() => import('./pages/public/RiskDisclosurePage'), 'RiskDisclosurePage');

// Auth Pages
const LoginPage = lazyPage(() => import('./pages/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('./pages/auth/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = lazyPage(() => import('./pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyPage(() => import('./pages/auth/ResetPasswordPage'), 'ResetPasswordPage');
const VerifyEmailPage = lazyPage(() => import('./pages/auth/VerifyEmailPage'), 'VerifyEmailPage');

// Dashboard Pages
const DashboardOverview = lazyPage(() => import('./pages/dashboard/DashboardOverview'), 'DashboardOverview');
const ProfilePage = lazyPage(() => import('./pages/dashboard/ProfilePage'), 'ProfilePage');
const PortfolioPage = lazyPage(() => import('./pages/dashboard/PortfolioPage'), 'PortfolioPage');
const ActivityPage = lazyPage(() => import('./pages/dashboard/ActivityPage'), 'ActivityPage');
const WalletsPage = lazyPage(() => import('./pages/dashboard/WalletsPage'), 'WalletsPage');
const NotificationsPage = lazyPage(() => import('./pages/dashboard/NotificationsPage'), 'NotificationsPage');
const SupportPage = lazyPage(() => import('./pages/dashboard/SupportPage'), 'SupportPage');
const SupportDetailPage = lazyPage(() => import('./pages/dashboard/SupportDetailPage'), 'SupportDetailPage');
const SettingsPage = lazyPage(() => import('./pages/dashboard/SettingsPage'), 'SettingsPage');
const SecurityPage = lazyPage(() => import('./pages/dashboard/SecurityPage'), 'SecurityPage');
const BuyCoinsPage = lazyPage(() => import('./pages/dashboard/BuyCoinsPage'), 'BuyCoinsPage');
const SellCoinsPage = lazyPage(() => import('./pages/dashboard/SellCoinsPage'), 'SellCoinsPage');
const TransfersPage = lazyPage(() => import('./pages/dashboard/TransfersPage'), 'TransfersPage');
const TransactionsPage = lazyPage(() => import('./pages/dashboard/TransactionsPage'), 'TransactionsPage');
const PaymentsPage = lazyPage(() => import('./pages/dashboard/PaymentsPage'), 'PaymentsPage');
const KycPage = lazyPage(() => import('./pages/dashboard/KycPage'), 'KycPage');

// Admin Pages
const AdminOverview = lazyPage(() => import('./pages/admin/AdminOverview'), 'AdminOverview');
const AdminCoinConfig = lazyPage(() => import('./pages/admin/AdminCoinConfig'), 'AdminCoinConfig');
const AdminPricing = lazyPage(() => import('./pages/admin/AdminPricing'), 'AdminPricing');
const AdminPriceHistory = lazyPage(() => import('./pages/admin/AdminPriceHistory'), 'AdminPriceHistory');
const AdminTokenomics = lazyPage(() => import('./pages/admin/AdminTokenomics'), 'AdminTokenomics');
const AdminAnnouncements = lazyPage(() => import('./pages/admin/AdminAnnouncements'), 'AdminAnnouncements');
const AdminFaq = lazyPage(() => import('./pages/admin/AdminFaq'), 'AdminFaq');
const AdminRoadmap = lazyPage(() => import('./pages/admin/AdminRoadmap'), 'AdminRoadmap');
const AdminEcosystem = lazyPage(() => import('./pages/admin/AdminEcosystem'), 'AdminEcosystem');
const AdminUsers = lazyPage(() => import('./pages/admin/AdminUsers'), 'AdminUsers');
const AdminSupport = lazyPage(() => import('./pages/admin/AdminSupport'), 'AdminSupport');
const AdminSubscribers = lazyPage(() => import('./pages/admin/AdminSubscribers'), 'AdminSubscribers');
const AdminRoles = lazyPage(() => import('./pages/admin/AdminRoles'), 'AdminRoles');
const AdminAuditLogs = lazyPage(() => import('./pages/admin/AdminAuditLogs'), 'AdminAuditLogs');
const AdminSettings = lazyPage(() => import('./pages/admin/AdminSettings'), 'AdminSettings');
const AdminKycPage = lazyPage(() => import('./pages/admin/AdminKycPage'), 'AdminKycPage');
const AdminOrdersPage = lazyPage(() => import('./pages/admin/AdminOrdersPage'), 'AdminOrdersPage');
const AdminWalletsPage = lazyPage(() => import('./pages/admin/AdminWalletsPage'), 'AdminWalletsPage');
const AdminPaymentsPage = lazyPage(() => import('./pages/admin/AdminPaymentsPage'), 'AdminPaymentsPage');
const AdminAnalyticsPage = lazyPage(() => import('./pages/admin/AdminAnalyticsPage'), 'AdminAnalyticsPage');
const AdminPartnersPage = lazyPage(() => import('./pages/admin/AdminPartnersPage'), 'AdminPartnersPage');

const PageFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center py-24 text-[#64748B]" role="status" aria-live="polite">
    <div className="w-8 h-8 border-4 border-[#175CFF] border-t-transparent rounded-full animate-spin mr-3" />
    <span>Loading…</span>
  </div>
);

/** Wraps a lazy element so only the page area (not the surrounding layout) shows the loader. */
const S: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageFallback />}>{children}</Suspense>
);

export const App: React.FC = () => {
  return (
    <>
      {/* Keeps <title>, description, canonical, robots, Open Graph and JSON-LD in sync with the route. */}
      <RouteSeo />
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<S><AboutPage /></S>} />
          <Route path="/ecosystem" element={<S><EcosystemPage /></S>} />
          <Route path="/wallets" element={<S><WalletsDirectoryPage /></S>} />
          <Route path="/wallets/guide" element={<S><WalletGuidePage /></S>} />
          <Route path="/wallets/compare" element={<S><WalletComparePage /></S>} />
          <Route path="/wallets/:id" element={<S><WalletDetailPage /></S>} />
          <Route path="/tokenomics" element={<S><TokenomicsPage /></S>} />
          <Route path="/roadmap" element={<S><RoadmapPage /></S>} />
          <Route path="/market" element={<S><MarketPage /></S>} />
          <Route path="/buy" element={<Navigate to="/dashboard/buy" replace />} />
          <Route path="/purchase" element={<Navigate to="/dashboard/buy" replace />} />
          <Route path="/whitepaper" element={<S><WhitepaperPage /></S>} />
          <Route path="/announcements" element={<S><AnnouncementsPage /></S>} />
          <Route path="/announcements/:slug" element={<S><AnnouncementDetailPage /></S>} />
          <Route path="/faq" element={<S><FaqPage /></S>} />
          <Route path="/contact" element={<S><ContactPage /></S>} />
          <Route path="/terms" element={<S><TermsPage /></S>} />
          <Route path="/privacy" element={<S><PrivacyPage /></S>} />
          <Route path="/risk-disclosure" element={<S><RiskDisclosurePage /></S>} />
          <Route path="/login" element={<S><LoginPage /></S>} />
          <Route path="/register" element={<S><RegisterPage /></S>} />
          <Route path="/forgot-password" element={<S><ForgotPasswordPage /></S>} />
          <Route path="/reset-password" element={<S><ResetPasswordPage /></S>} />
          <Route path="/verify-email" element={<S><VerifyEmailPage /></S>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* User Dashboard */}
        <Route path="/dashboard" element={<S><DashboardLayout /></S>}>
          <Route index element={<S><DashboardOverview /></S>} />
          <Route path="buy" element={<S><BuyCoinsPage /></S>} />
          <Route path="purchase" element={<S><BuyCoinsPage /></S>} />
          <Route path="sell" element={<S><SellCoinsPage /></S>} />
          <Route path="transfers" element={<S><TransfersPage /></S>} />
          <Route path="transactions" element={<S><TransactionsPage /></S>} />
          <Route path="payments" element={<S><PaymentsPage /></S>} />
          <Route path="kyc" element={<S><KycPage /></S>} />
          <Route path="market" element={<S><MarketPage /></S>} />
          <Route path="profile" element={<S><ProfilePage /></S>} />
          <Route path="wallets" element={<S><WalletsPage /></S>} />
          <Route path="portfolio" element={<S><PortfolioPage /></S>} />
          <Route path="activity" element={<S><ActivityPage /></S>} />
          <Route path="notifications" element={<S><NotificationsPage /></S>} />
          <Route path="support" element={<S><SupportPage /></S>} />
          <Route path="support/:id" element={<S><SupportDetailPage /></S>} />
          <Route path="settings" element={<S><SettingsPage /></S>} />
          <Route path="security" element={<S><SecurityPage /></S>} />
        </Route>

        {/* Administration Panel */}
        <Route path="/admin" element={<S><AdminLayout /></S>}>
          <Route index element={<S><AdminOverview /></S>} />
          <Route path="kyc" element={<S><AdminKycPage /></S>} />
          <Route path="orders" element={<S><AdminOrdersPage /></S>} />
          <Route path="wallets" element={<S><AdminWalletsPage /></S>} />
          <Route path="payments" element={<S><AdminPaymentsPage /></S>} />
          <Route path="analytics" element={<S><AdminAnalyticsPage /></S>} />
          <Route path="partners" element={<S><AdminPartnersPage /></S>} />
          <Route path="coin" element={<S><AdminCoinConfig /></S>} />
          <Route path="pricing" element={<S><AdminPricing /></S>} />
          <Route path="price-history" element={<S><AdminPriceHistory /></S>} />
          <Route path="tokenomics" element={<S><AdminTokenomics /></S>} />
          <Route path="announcements" element={<S><AdminAnnouncements /></S>} />
          <Route path="faq" element={<S><AdminFaq /></S>} />
          <Route path="roadmap" element={<S><AdminRoadmap /></S>} />
          <Route path="ecosystem" element={<S><AdminEcosystem /></S>} />
          <Route path="users" element={<S><AdminUsers /></S>} />
          <Route path="support" element={<S><AdminSupport /></S>} />
          <Route path="subscribers" element={<S><AdminSubscribers /></S>} />
          <Route path="roles" element={<S><AdminRoles /></S>} />
          <Route path="audit-logs" element={<S><AdminAuditLogs /></S>} />
          <Route path="settings" element={<S><AdminSettings /></S>} />
        </Route>
      </Routes>
    </>
  );
};
