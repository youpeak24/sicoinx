import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { EcosystemPage } from './pages/public/EcosystemPage';
import { TokenomicsPage } from './pages/public/TokenomicsPage';
import { RoadmapPage } from './pages/public/RoadmapPage';
import { MarketPage } from './pages/public/MarketPage';
import { WhitepaperPage } from './pages/public/WhitepaperPage';
import { AnnouncementsPage } from './pages/public/AnnouncementsPage';
import { AnnouncementDetailPage } from './pages/public/AnnouncementDetailPage';
import { FaqPage } from './pages/public/FaqPage';
import { ContactPage } from './pages/public/ContactPage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { RiskDisclosurePage } from './pages/public/RiskDisclosurePage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Dashboard Pages
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { PortfolioPage } from './pages/dashboard/PortfolioPage';
import { ActivityPage } from './pages/dashboard/ActivityPage';
import { WalletsPage } from './pages/dashboard/WalletsPage';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';
import { SupportPage } from './pages/dashboard/SupportPage';
import { SupportDetailPage } from './pages/dashboard/SupportDetailPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { SecurityPage } from './pages/dashboard/SecurityPage';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminCoinConfig } from './pages/admin/AdminCoinConfig';
import { AdminPricing } from './pages/admin/AdminPricing';
import { AdminPriceHistory } from './pages/admin/AdminPriceHistory';
import { AdminTokenomics } from './pages/admin/AdminTokenomics';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminFaq } from './pages/admin/AdminFaq';
import { AdminRoadmap } from './pages/admin/AdminRoadmap';
import { AdminEcosystem } from './pages/admin/AdminEcosystem';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminSubscribers } from './pages/admin/AdminSubscribers';
import { AdminRoles } from './pages/admin/AdminRoles';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/ecosystem" element={<EcosystemPage />} />
        <Route path="/tokenomics" element={<TokenomicsPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/whitepaper" element={<WhitepaperPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/announcements/:slug" element={<AnnouncementDetailPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/risk-disclosure" element={<RiskDisclosurePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* User Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="wallets" element={<WalletsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="support/:id" element={<SupportDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="security" element={<SecurityPage />} />
      </Route>

      {/* Administration Panel */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="coin" element={<AdminCoinConfig />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="price-history" element={<AdminPriceHistory />} />
        <Route path="tokenomics" element={<AdminTokenomics />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="faq" element={<AdminFaq />} />
        <Route path="roadmap" element={<AdminRoadmap />} />
        <Route path="ecosystem" element={<AdminEcosystem />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="subscribers" element={<AdminSubscribers />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
};
