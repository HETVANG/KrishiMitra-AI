import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
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
