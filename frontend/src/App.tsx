import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Import Layouts & widgets
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { VoiceAssistant } from './components/VoiceAssistant';

// Lazy Loaded Pages for performance route splitting
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const AIChat = React.lazy(() => import('./pages/AIChat').then(m => ({ default: m.AIChat })));
const DiseaseDetection = React.lazy(() => import('./pages/DiseaseDetection').then(m => ({ default: m.DiseaseDetection })));
const SoilAnalysis = React.lazy(() => import('./pages/SoilAnalysis').then(m => ({ default: m.SoilAnalysis })));
const MarketDashboard = React.lazy(() => import('./pages/MarketDashboard').then(m => ({ default: m.MarketDashboard })));
const GovSchemes = React.lazy(() => import('./pages/GovSchemes').then(m => ({ default: m.GovSchemes })));
const Forum = React.lazy(() => import('./pages/Forum').then(m => ({ default: m.Forum })));
const Experts = React.lazy(() => import('./pages/Experts').then(m => ({ default: m.Experts })));
const Expenses = React.lazy(() => import('./pages/Expenses').then(m => ({ default: m.Expenses })));
const Reports = React.lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));
const Pricing = React.lazy(() => import('./pages/Pricing').then(m => ({ default: m.Pricing })));
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })));
const PaymentFailed = React.lazy(() => import('./pages/PaymentFailed').then(m => ({ default: m.PaymentFailed })));
const PaymentPending = React.lazy(() => import('./pages/PaymentPending').then(m => ({ default: m.PaymentPending })));
const Subscription = React.lazy(() => import('./pages/Subscription').then(m => ({ default: m.Subscription })));
const BillingHistory = React.lazy(() => import('./pages/BillingHistory').then(m => ({ default: m.BillingHistory })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Protected Route Guard
const ProtectedRoute = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-dark-950">
        <div className="w-10 h-10 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
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
  const { user } = useAuth();

  // Dynamically set navbar header title matching pathname
  const getHeaderTitle = () => {
    const path = window.location.pathname;
    if (path === '/') return 'Farmer Intelligence Dashboard';
    if (path === '/chat') return 'AI Assistant Consultation';
    if (path === '/disease') return 'AI Leaf Pathology Diagnosis';
    if (path === '/soil') return 'Digital Soil analysis & Fertilizer Planner';
    if (path === '/market') return 'Mandi Prices Index intelligence';
    if (path === '/schemes') return 'Government Subsidies Index';
    if (path === '/forum') return 'Community Farmers Forum';
    if (path === '/experts') return 'Book Advisory Appointments';
    if (path === '/expenses') return 'Farm Cost ledger logbook';
    if (path === '/reports') return 'Export Statement PDF Reports';
    if (path === '/pricing') return 'Premium Pricing & Checkout';
    if (path === '/subscription') return 'My Subscription';
    if (path === '/billing-history') return 'Billing History';
    if (path === '/admin') return 'Control Panel Admin dashboard';
    return 'KrishiMitra AI';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex text-left">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Navbar */}
        <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} title={getHeaderTitle()} />

        {/* View content pages */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Voice Assistant Widget floating */}
      {user && <VoiceAssistant />}
    </div>
  );
};

export const AppContent = () => {
  return (
    <BrowserRouter>
      <React.Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-dark-950">
          <div className="w-10 h-10 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
        </div>
      }>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard pages */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/disease" element={<DiseaseDetection />} />
              <Route path="/soil" element={<SoilAnalysis />} />
              <Route path="/market" element={<MarketDashboard />} />
              <Route path="/schemes" element={<GovSchemes />} />
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
              
              {/* Admin only dashboard portal */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback 404 handler */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
