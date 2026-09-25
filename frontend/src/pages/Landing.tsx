import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  ScanEye, 
  CloudSun, 
  Layers, 
  Globe, 
  Sun, 
  Moon, 
  BookOpen, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, setLanguage } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const languagesList = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'mr', label: 'मराठी' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'or', label: 'ଓଡ଼ିଆ' },
    { code: 'as', label: 'অসমীয়া' }
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    setLanguage(lang as any);
    localStorage.setItem('km-lang', lang);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-100 dark:border-dark-850 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-brand-500 rounded-xl text-white shadow-md shadow-brand-500/20">
            <Sprout size={22} />
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-lg text-brand-700 dark:text-brand-400 tracking-tight leading-tight">KrishiMitra AI</h1>
            <p className="text-[10px] text-slate-400 dark:text-dark-500 font-bold uppercase tracking-wider">Farmer Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Public Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-dark-800 px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg border border-slate-200/50 dark:border-dark-750">
            <Globe size={14} className="text-slate-500 dark:text-dark-400" />
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              className="text-xs font-bold bg-transparent text-slate-700 dark:text-dark-300 focus:outline-none cursor-pointer"
            >
              {languagesList.map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-dark-900 text-xs">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-dark-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Auth State Button */}
          {isAuthenticated && user ? (
            <NavLink
              to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className="px-4 py-2 text-xs font-extrabold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-600/10 min-h-[38px] flex items-center justify-center"
            >
              Go to Dashboard
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className="px-4 py-2 text-xs font-extrabold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-600/10 min-h-[38px] flex items-center justify-center"
            >
              Log In
            </NavLink>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 max-w-4xl mx-auto space-y-8">
        <span className="px-3.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] md:text-xs rounded-full uppercase tracking-widest border border-emerald-200/30">
          🤖 Next-Generation Agronomy
        </span>

        <h1 className="text-3xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          KrishiMitra AI<br/>
          <span className="bg-gradient-to-r from-brand-600 to-teal-500 bg-clip-text text-transparent">
            Your AI-Powered Farming Companion
          </span>
        </h1>

        <p className="text-sm md:text-lg text-slate-500 dark:text-dark-300 leading-relaxed font-medium max-w-2xl">
          Detect crop diseases instantly, check live mandi market prices, understand localized weather advisories, and make intelligent farming decisions.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md pt-2">
          <button
            onClick={() => navigate('/disease')}
            className="flex-1 px-6 py-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2 group min-h-[48px]"
          >
            <ScanEye size={18} />
            <span>Try Crop Disease Detection</span>
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => navigate('/market')}
            className="flex-1 px-6 py-4 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-850 text-slate-700 dark:text-dark-200 border border-slate-200 dark:border-dark-800 font-extrabold text-sm rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            <TrendingUp size={18} className="text-emerald-500" />
            <span>Check Mandi Prices</span>
          </button>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section className="bg-white dark:bg-dark-900 border-t border-b border-slate-100 dark:border-dark-850 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Intelligent Agriculture Tools
            </h2>
            <p className="text-xs md:text-sm text-slate-400 dark:text-dark-400 font-semibold leading-relaxed">
              Empowering farmers with advanced predictive algorithms and live government database integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-3xl border border-slate-100 dark:border-dark-850 space-y-4 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-2xl flex items-center justify-center">
                <ScanEye size={24} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">AI Crop Pathology Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Upload crop leaf photos. Our Gemini Computer Vision model diagnoses pathogen symptoms and provides organic or chemical treatments.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-3xl border border-slate-100 dark:border-dark-850 space-y-4 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl flex items-center justify-center">
                <CloudSun size={24} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">Smart Weather Advisories</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Receive localized weather updates alongside smart seasonal farming alerts like monsoon guidelines, cold wave notifications, and heat stress advisories.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-3xl border border-slate-100 dark:border-dark-850 space-y-4 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/20 text-amber-500 rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">Mandi Price Tracking</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Access real-time price reports from agricultural mandis across India. Never display ₹0; provides fallback price availability warnings.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-3xl border border-slate-100 dark:border-dark-850 space-y-4 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/20 text-indigo-500 rounded-2xl flex items-center justify-center">
                <Layers size={24} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">NPK Soil Chemistry Planner</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Calculate NPK chemical imbalances based on crop types and target acreage, generating optimal fertilizer logs for your farm.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-3xl border border-slate-100 dark:border-dark-850 space-y-4 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/20 text-blue-500 rounded-2xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">Govt Schemes Directory</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Browse government financial aids, seed subsidies, and irrigation programs matching your farm category and location criteria.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-3xl border border-slate-100 dark:border-dark-850 space-y-4 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-950/20 text-pink-500 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">Expert Booking Advisor</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Connect with agricultural experts for live consultations. Submit a video request describing crop issues when advisors are offline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Onboarding Banner */}
      <section className="bg-gradient-to-r from-brand-700 to-teal-800 text-white py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Ready to optimize your crop yields?</h2>
          <p className="text-xs md:text-sm text-brand-100 leading-relaxed font-medium">
            Create a free account to track farm location history, log soil analysis, download PDF reports, and consult agronomy specialists.
          </p>
          <NavLink
            to="/register"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-brand-800 font-extrabold text-sm rounded-xl hover:bg-slate-50 transition-all shadow-md min-h-[44px]"
          >
            Create Your Free Account
          </NavLink>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 px-4 md:px-8 py-12 mt-auto text-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Sprout size={18} className="text-brand-500" />
              <span className="font-extrabold">KrishiMitra AI</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">
              Empowering farmers across India with AI agronomy, Mandi indexes, and crop care.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-[10px] uppercase tracking-wider">Company</h4>
            <div className="flex flex-col gap-1.5">
              <NavLink to="/about" className="hover:text-white transition-colors">About Us</NavLink>
              <NavLink to="/contact" className="hover:text-white transition-colors">Contact</NavLink>
              <NavLink to="/support" className="hover:text-white transition-colors">Support FAQ</NavLink>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-[10px] uppercase tracking-wider">Legal</h4>
            <div className="flex flex-col gap-1.5">
              <NavLink to="/privacy" className="hover:text-white transition-colors">Privacy Policy</NavLink>
              <NavLink to="/terms" className="hover:text-white transition-colors">Terms of Service</NavLink>
              <NavLink to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</NavLink>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-[10px] uppercase tracking-wider">Support Channel</h4>
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5"><Mail size={12} /> support@krishimitra.ai</span>
              <span className="text-[10px] text-slate-500 leading-normal">Our typical response window is under 24 hours.</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-800 mt-10 pt-6 text-center text-[10px] text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 KrishiMitra AI. All rights reserved.</span>
          <span>Designed with care for the Indian Agricultural Community.</span>
        </div>
      </footer>

    </div>
  );
};
export default Landing;
