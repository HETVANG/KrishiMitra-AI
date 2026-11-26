import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Import Layouts & widgets
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { VoiceAssistant } from './components/VoiceAssistant';
import { OfflineBanner } from './components/OfflineBanner';
import { RegionalSettingsModal } from './components/RegionalSettingsModal';
import { BRAND } from './config/brand';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { initNativeLifecycle, initPushNotifications } from './services/native';

// Lazy Loaded Pages for performance route splitting
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const AIChat = React.lazy(() => import('./pages/AIChat').then(m => ({ default: m.AIChat })));
const FarmCopilot = React.lazy(() => import('./pages/FarmCopilot').then(m => ({ default: m.FarmCopilot })));
const FarmAgents = React.lazy(() => import('./pages/FarmAgents').then(m => ({ default: m.FarmAgents })));
const FarmLifecycle = React.lazy(() => import('./pages/FarmLifecycle').then(m => ({ default: m.FarmLifecycle })));
const PredictiveIntelligence = React.lazy(() => import('./pages/PredictiveIntelligence').then(m => ({ default: m.PredictiveIntelligence })));
const SmartIrrigation = React.lazy(() => import('./pages/SmartIrrigation').then(m => ({ default: m.SmartIrrigation })));
const DiseaseDetection = React.lazy(() => import('./pages/DiseaseDetection').then(m => ({ default: m.DiseaseDetection })));
const SoilAnalysis = React.lazy(() => import('./pages/SoilAnalysis').then(m => ({ default: m.SoilAnalysis })));
const Weather = React.lazy(() => import('./pages/Weather').then(m => ({ default: m.Weather })));
const MarketDashboard = React.lazy(() => import('./pages/MarketDashboard').then(m => ({ default: m.MarketDashboard })));
const Marketplace = React.lazy(() => import('./pages/Marketplace').then(m => ({ default: m.Marketplace })));
const GovSchemes = React.lazy(() => import('./pages/GovSchemes').then(m => ({ default: m.GovSchemes })));
const Forum = React.lazy(() => import('./pages/Forum').then(m => ({ default: m.Forum })));
const Experts = React.lazy(() => import('./pages/Experts').then(m => ({ default: m.Experts })));
const Expenses = React.lazy(() => import('./pages/Expenses').then(m => ({ default: m.Expenses })));
const Reports = React.lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const OrganizationList = React.lazy(() => import('./pages/OrganizationList').then(m => ({ default: m.OrganizationList })));
const OrganizationOnboarding = React.lazy(() => import('./pages/OrganizationOnboarding').then(m => ({ default: m.OrganizationOnboarding })));
const OrganizationWorkspace = React.lazy(() => import('./pages/OrganizationWorkspace').then(m => ({ default: m.OrganizationWorkspace })));
const PartnerDiscovery = React.lazy(() => import('./pages/PartnerDiscovery').then(m => ({ default: m.PartnerDiscovery })));
const PartnerApplication = React.lazy(() => import('./pages/PartnerApplication').then(m => ({ default: m.PartnerApplication })));
const PartnerPortal = React.lazy(() => import('./pages/PartnerPortal').then(m => ({ default: m.PartnerPortal })));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AdminProviders = React.lazy(() => import('./pages/AdminProviders').then(m => ({ default: m.AdminProviders })));
const AdminPartners = React.lazy(() => import('./pages/AdminPartners').then(m => ({ default: m.AdminPartners })));
const AdminAnalytics = React.lazy(() => import('./pages/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminGrowth = React.lazy(() => import('./pages/AdminGrowth').then(m => ({ default: m.AdminGrowth })));
const AdminSuccess = React.lazy(() => import('./pages/AdminSuccess').then(m => ({ default: m.AdminSuccess })));
const AdminAIGovernance = React.lazy(() => import('./pages/AdminAIGovernance').then(m => ({ default: m.AdminAIGovernance })));
const PublicShare = React.lazy(() => import('./pages/PublicShare').then(m => ({ default: m.PublicShare })));
const PublicReportVerify = React.lazy(() => import('./pages/PublicReportVerify').then(m => ({ default: m.PublicReportVerify })));
const Pricing = React.lazy(() => import('./pages/Pricing').then(m => ({ default: m.Pricing })));
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })));
const PaymentFailed = React.lazy(() => import('./pages/PaymentFailed').then(m => ({ default: m.PaymentFailed })));
const PaymentPending = React.lazy(() => import('./pages/PaymentPending').then(m => ({ default: m.PaymentPending })));
const Subscription = React.lazy(() => import('./pages/Subscription').then(m => ({ default: m.Subscription })));
const BillingHistory = React.lazy(() => import('./pages/BillingHistory').then(m => ({ default: m.BillingHistory })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const Landing = React.lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const About = React.lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Privacy = React.lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = React.lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const RefundPolicy = React.lazy(() => import('./pages/RefundPolicy').then(m => ({ default: m.RefundPolicy })));
const Settings = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Support = React.lazy(() => import('./pages/Support').then(m => ({ default: m.Support })));
const CookiePolicy = React.lazy(() => import('./pages/CookiePolicy').then(m => ({ default: m.CookiePolicy })));
const CookieSettings = React.lazy(() => import('./pages/CookieSettings').then(m => ({ default: m.CookieSettings })));
const BusinessInformation = React.lazy(() => import('./pages/BusinessInformation').then(m => ({ default: m.BusinessInformation })));
const Accessibility = React.lazy(() => import('./pages/Accessibility').then(m => ({ default: m.Accessibility })));
const DataDeletion = React.lazy(() => import('./pages/DataDeletion').then(m => ({ default: m.DataDeletion })));
const Unsubscribe = React.lazy(() => import('./pages/Unsubscribe').then(m => ({ default: m.Unsubscribe })));
import { CookieConsentBanner } from './components/common/CookieConsentBanner';
import { getStoredCookieConsent, applyAnalyticsGating } from './utils/cookieConsent';

// Protected Route Guard
const ProtectedRoute = () => {
  const { token, isLoading } = useAuth();
  const location = React.useMemo(() => window.location, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-dark-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-500 dark:text-dark-400">Loading The Khedut...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    const targetPath = window.location.pathname + window.location.search;
    const redirectUrl = encodeURIComponent(targetPath);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  return <Outlet />;
};

// Admin Route Guard
const AdminRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center my-12">
        <div className="bg-white dark:bg-dark-900 border p-8 rounded-3xl max-w-sm shadow-sm space-y-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-955/20 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl font-extrabold border border-red-100">
            403
          </div>
          <h2 className="text-lg font-extrabold text-gray-800 dark:text-dark-100">Access Denied</h2>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            You do not have administrative privileges to access the control center. Please contact systems administrator to request access.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

// Layout Wrapper
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRegionalModal, setShowRegionalModal] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  React.useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);

  // Dynamically set navbar header title matching pathname with reactive translation
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return t('nav.dashboard') || 'Farmer Intelligence Dashboard';
    if (path === '/weather') return t('nav.weather') || 'Agricultural Weather & Forecast';
    if (path === '/agents') return t('nav.agents') || 'Farm Intelligence & Agents';
    if (path === '/crop-cycles') return t('nav.my_farm') || 'Farm Lifecycle Management';
    if (path === '/predictive-intelligence') return t('predictive.title') || 'Predictive Crop Intelligence Engine';
    if (path === '/irrigation') return t('nav.irrigation') || 'Smart Irrigation Intelligence';
    if (path === '/copilot') return t('nav.copilot') || 'AI Farm Copilot Intelligence';
    if (path === '/chat') return t('nav.chatbot') || 'AI Assistant Consultation';
    if (path === '/disease') return t('nav.disease') || 'AI Leaf Pathology Diagnosis';
    if (path === '/soil') return t('nav.soil') || 'Digital Soil analysis & Fertilizer Planner';
    if (path === '/market') return t('nav.market') || 'Mandi Prices Index intelligence';
    if (path === '/schemes') return t('nav.schemes') || 'Government Subsidies Index';
    if (path === '/forum') return t('nav.forum') || 'Community Farmers Forum';
    if (path === '/experts') return t('nav.expert') || 'Book Advisory Appointments';
    if (path === '/expenses') return t('nav.expense') || 'Farm Cost ledger logbook';
    if (path === '/reports') return t('nav.reports') || 'Export Statement PDF Reports';
    if (path === '/pricing') return t('subscription.pricing') || 'Premium Pricing & Checkout';
    if (path === '/subscription') return t('subscription.title') || 'My Subscription';
    if (path === '/billing-history') return t('subscription.billing_history') || 'Billing History';
    if (path === '/settings') return t('nav.settings') || 'Settings & Growth Center';
    if (path === '/admin') return t('nav.admin') || 'Control Panel Admin dashboard';
    return BRAND.name;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex text-left max-w-full overflow-x-hidden">
      {/* Sidebar navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        onOpenRegionalSettings={() => setShowRegionalModal(true)} 
      />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen max-w-full overflow-x-hidden">
        {/* Offline Connectivity Notification Banner */}
        <OfflineBanner />

        {/* Navbar */}
        <Navbar 
          onMenuToggle={() => setSidebarOpen(prev => !prev)} 
          title={getHeaderTitle()} 
          onOpenRegionalSettings={() => setShowRegionalModal(true)} 
        />

        {/* View content pages with bottom padding on mobile for MobileBottomNav */}
        <main className="flex-grow p-3 sm:p-4 md:p-6 pb-24 lg:pb-6 overflow-y-auto overflow-x-hidden max-w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Persistent 1-tap farmer navigation) */}
      <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />

      {/* Voice Assistant Widget floating */}
      {user && <VoiceAssistant />}

      {/* Global Regional Settings Modal */}
      <RegionalSettingsModal 
        isOpen={showRegionalModal} 
        onClose={() => setShowRegionalModal(false)} 
      />
    </div>
  );
};

const HomeRoute = () => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : <Landing />;
};

const NativePushNotifier: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const cleanupPush = initPushNotifications((path) => {
        navigate(path);
      });
      return () => {
        cleanupPush();
      };
    }
  }, [navigate]);

  return null;
};

export const AppContent = () => {
  console.log('[The Khedut Startup Log] Loading Routes & React Router');

  React.useEffect(() => {
    // DPDP Act 2023 / GDPR Compliant Cookie-Gated Analytics Initialization
    const initialConsent = getStoredCookieConsent();
    applyAnalyticsGating(initialConsent);

    const handleConsentChange = (e: any) => {
      applyAnalyticsGating(e.detail || getStoredCookieConsent());
    };
    window.addEventListener('km_cookie_consent_updated', handleConsentChange);

    // Native Capacitor initialization
    let cleanupLifecycle: (() => void) | undefined;
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        StatusBar.setBackgroundColor({ color: '#15803d' }).catch(() => {});
        SplashScreen.hide().catch(() => {});

        cleanupLifecycle = initNativeLifecycle();
      } catch (nativeErr) {
        console.warn('[Capacitor Native Init Warning]', nativeErr);
      }
    }

    return () => {
      window.removeEventListener('km_cookie_consent_updated', handleConsentChange);
      if (cleanupLifecycle) {
        cleanupLifecycle();
      }
    };
  }, []);

  return (
    <BrowserRouter>
      {/* Native Push Notification Lifecycle & Router Navigation Integration */}
      <NativePushNotifier />

      {/* Toast Notification Container for react-toastify alerts */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <React.Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-dark-950">
          <div className="w-10 h-10 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          {/* Public auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Trust & Legal Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/cookie-settings" element={<CookieSettings />} />
          <Route path="/business-information" element={<BusinessInformation />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/support" element={<Support />} />

          {/* Public Report Authenticity Verification (QR code target) */}
          <Route path="/verify/report/:reportId" element={<PublicReportVerify />} />
          <Route path="/verify/:reportId" element={<PublicReportVerify />} />

          {/* Public Share Landing Routes */}
          <Route path="/share/:type/:shareId" element={<PublicShare />} />
          <Route path="/share/:shareId" element={<PublicShare />} />

          {/* Dynamic selector for root path */}
          <Route path="/" element={<HomeRoute />} />

          {/* Protected Dashboard pages */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/disease" element={<DiseaseDetection />} />
              <Route path="/market" element={<MarketDashboard />} />
              <Route path="/schemes" element={<GovSchemes />} />
              <Route path="/organizations" element={<OrganizationList />} />
              <Route path="/organizations/new" element={<OrganizationOnboarding />} />
              <Route path="/organizations/:id" element={<OrganizationWorkspace />} />
              <Route path="/partners/discover" element={<PartnerDiscovery />} />
              <Route path="/partners/apply" element={<PartnerApplication />} />
              <Route path="/partners/portal" element={<PartnerPortal />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/agents" element={<FarmAgents />} />
              <Route path="/crop-cycles" element={<FarmLifecycle />} />
              <Route path="/predictive-intelligence" element={<PredictiveIntelligence />} />
              <Route path="/irrigation" element={<SmartIrrigation />} />
              <Route path="/copilot" element={<FarmCopilot />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/soil" element={<SoilAnalysis />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/experts" element={<Experts />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />
              <Route path="/payment/pending" element={<PaymentPending />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/billing-history" element={<BillingHistory />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Admin only dashboard portal */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/providers" element={<AdminProviders />} />
                <Route path="/admin/partners" element={<AdminPartners />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/growth" element={<AdminGrowth />} />
                <Route path="/admin/success" element={<AdminSuccess />} />
                <Route path="/admin/ai-governance" element={<AdminAIGovernance />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback 404 handler */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
      <CookieConsentBanner />
    </BrowserRouter>
  );
};

export const App = () => {
  console.log('[The Khedut Startup Log] React Mounted - App initialized - Loading Context & Providers');
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
