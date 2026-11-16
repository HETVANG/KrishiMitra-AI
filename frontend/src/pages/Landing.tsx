import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ScanEye, 
  CloudSun, 
  Layers, 
  Globe, 
  Sun, 
  Moon, 
  BookOpen, 
  TrendingUp, 
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Droplets,
  Brain,
  Menu,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Landing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, setLanguage } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
    { code: 'or', label: 'ଓડ଼ିଆ' },
    { code: 'as', label: 'অসমীয়া' }
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    setLanguage(lang as any);
    localStorage.setItem('km-lang', lang);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200 overflow-x-hidden">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-dark-850 px-3.5 sm:px-6 md:px-8 py-2.5 sm:py-3.5 safe-area-pt w-full max-w-full">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto w-full">
          {/* Left Brand Identity */}
          <NavLink to="/" className="flex items-center min-w-0 shrink">
            <BrandLogo variant="horizontal" size="md" taglineClassName="hidden sm:block" />
          </NavLink>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink-0">
            {/* Language Selector (Pill on sm+, inside mobile menu on mobile) */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-dark-800 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-dark-750">
              <Globe size={14} className="text-slate-500 dark:text-dark-400 shrink-0" />
              <select
                value={i18n.language}
                onChange={handleLanguageChange}
                aria-label="Select Language"
                className="text-xs font-bold bg-transparent text-slate-700 dark:text-dark-300 focus:outline-none cursor-pointer"
              >
                {languagesList.map((lang) => (
                  <option key={lang.code} value={lang.code} className="dark:bg-dark-900 text-xs">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle Theme"
              className="p-1.5 sm:p-2 text-slate-600 dark:text-dark-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-colors shrink-0"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {/* Auth State Button */}
            {isAuthenticated && user ? (
              <NavLink
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-extrabold text-white bg-brand-700 hover:bg-brand-800 rounded-xl transition-all shadow-sm shadow-brand-700/20 min-h-[36px] sm:min-h-[38px] flex items-center justify-center shrink-0"
              >
                {user.role === 'admin' ? 'Admin' : 'Dashboard'}
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-extrabold text-white bg-brand-700 hover:bg-brand-800 rounded-xl transition-all shadow-sm shadow-brand-700/20 min-h-[36px] sm:min-h-[38px] flex items-center justify-center shrink-0"
              >
                Log In
              </NavLink>
            )}

            {/* Mobile Menu Trigger (Hamburger) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              aria-label="Toggle Navigation Menu"
              className="p-1.5 sm:p-2 text-slate-600 dark:text-dark-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl md:hidden transition-colors shrink-0"
            >
              {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-dark-800 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md px-4 py-4 space-y-4 shadow-lg mt-2.5 rounded-2xl">
            {/* Language Selection Grid */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-dark-400 flex items-center gap-1.5">
                <Globe size={13} className="text-brand-600 dark:text-brand-400" />
                <span>Select Language</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      setLanguage(lang.code as any);
                      localStorage.setItem('km-lang', lang.code);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all text-center truncate ${
                      i18n.language === lang.code
                        ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-dark-800 text-slate-700 dark:text-dark-200 border-slate-200/70 dark:border-dark-750 hover:bg-slate-100'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="pt-2 border-t border-slate-100 dark:border-dark-800 grid grid-cols-2 gap-2 text-xs font-bold text-slate-700 dark:text-dark-200">
              <NavLink
                to="/disease"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-dark-800/60 hover:bg-slate-100 dark:hover:bg-dark-800 flex items-center gap-2"
              >
                <ScanEye size={16} className="text-brand-600 shrink-0" />
                <span>Crop Scanner</span>
              </NavLink>
              <NavLink
                to="/market"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-dark-800/60 hover:bg-slate-100 dark:hover:bg-dark-800 flex items-center gap-2"
              >
                <TrendingUp size={16} className="text-amber-600 shrink-0" />
                <span>Mandi Prices</span>
              </NavLink>
              <NavLink
                to="/support"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-dark-800/60 hover:bg-slate-100 dark:hover:bg-dark-800 flex items-center gap-2"
              >
                <BookOpen size={16} className="text-blue-600 shrink-0" />
                <span>Support FAQ</span>
              </NavLink>
              <NavLink
                to="/privacy"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-dark-800/60 hover:bg-slate-100 dark:hover:bg-dark-800 flex items-center gap-2"
              >
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Privacy Policy</span>
              </NavLink>
            </div>

            {/* Account Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-dark-800">
              {isAuthenticated && user ? (
                <NavLink
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Go to {user.role === 'admin' ? 'Admin Panel' : 'Farmer Dashboard'}</span>
                  <ArrowRight size={14} />
                </NavLink>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <NavLink
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center shadow-xs"
                  >
                    Log In
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-800 dark:text-dark-100 font-extrabold text-xs rounded-xl flex items-center justify-center border border-slate-200 dark:border-dark-750"
                  >
                    Register
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-8 sm:py-14 md:py-20 max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full">
        <span className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-extrabold text-[11px] sm:text-xs rounded-full uppercase tracking-wider border border-brand-200/50 dark:border-brand-800/40 shrink-0">
          <Sparkles size={13} className="text-brand-600 shrink-0" />
          <span className="truncate">Professional Agronomic Intelligence</span>
        </span>

        <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2] max-w-3xl">
          {BRAND.name}<br/>
          <span className="text-brand-700 dark:text-brand-400 block mt-1 text-lg xs:text-xl sm:text-3xl md:text-5xl">
            {BRAND.tagline}
          </span>
        </h1>

        <p className="text-xs sm:text-sm md:text-lg text-slate-600 dark:text-dark-300 leading-relaxed font-medium max-w-2xl mx-auto px-2">
          Built specifically for Indian farmers. Diagnose crop pathology instantly, check live mandi prices across APMCs, plan optimal irrigation, and make scientific farming decisions in your native language.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-md pt-1 px-2">
          <button
            onClick={() => navigate('/disease')}
            type="button"
            className="flex-1 px-5 py-3 sm:py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-700/20 transition-all flex items-center justify-center gap-2 group min-h-[44px]"
          >
            <ScanEye size={18} className="shrink-0" />
            <span>Check Crop Health</span>
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
          
          <button
            onClick={() => navigate('/market')}
            type="button"
            className="flex-1 px-5 py-3 sm:py-3.5 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-850 text-slate-700 dark:text-dark-200 border border-slate-200 dark:border-dark-800 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <TrendingUp size={18} className="text-brand-600 shrink-0" />
            <span>View Mandi Prices</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px] sm:text-xs text-slate-500 dark:text-dark-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-brand-600 shrink-0" /> 12 Native Indian Languages
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-brand-600 shrink-0" /> 100% Mobile Field-Ready
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-brand-600 shrink-0" /> ICAR Aligned Practices
          </span>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section className="bg-white dark:bg-dark-900 border-t border-b border-slate-200/80 dark:border-dark-850 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Essential Tools for the Modern Farmer
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-dark-400 font-medium">
              Empowering farmers with advanced predictive algorithms, computer vision pathology, and real-time APMC data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-200/70 dark:border-dark-850 space-y-3 hover:shadow-md transition-all">
              <div className="w-11 h-11 bg-red-100 dark:bg-red-955/30 text-red-600 rounded-xl flex items-center justify-center">
                <ScanEye size={22} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">AI Crop Pathology Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Photograph infected crop foliage. Our vision models diagnose pathogen symptoms and prescribe biological and chemical treatments instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-200/70 dark:border-dark-850 space-y-3 hover:shadow-md transition-all">
              <div className="w-11 h-11 bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 rounded-xl flex items-center justify-center">
                <CloudSun size={22} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">Smart Weather Advisories</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Localized hourly and 7-day meteorological forecasting with monsoon warnings, frost notifications, and heat stress alerts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-200/70 dark:border-dark-850 space-y-3 hover:shadow-md transition-all">
              <div className="w-11 h-11 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={22} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">Live Mandi Prices</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Track APMC arrivals and prevailing market rates across regional mandis to sell your produce at peak profitability.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-200/70 dark:border-dark-850 space-y-3 hover:shadow-md transition-all">
              <div className="w-11 h-11 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl flex items-center justify-center">
                <Droplets size={22} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">Smart Irrigation Planner</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Compute soil evapotranspiration and moisture loss to optimize irrigation timing and conserve energy and water.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-200/70 dark:border-dark-850 space-y-3 hover:shadow-md transition-all">
              <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 rounded-xl flex items-center justify-center">
                <Layers size={22} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">Digital Soil NPK Balance</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Analyze nitrogen, phosphorus, and potassium ratios to generate exact fertilizer dosage schedules tailored to your acreage.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-200/70 dark:border-dark-850 space-y-3 hover:shadow-md transition-all">
              <div className="w-11 h-11 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-xl flex items-center justify-center">
                <Brain size={22} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-dark-100">AI Farm Copilot</h3>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
                Your dedicated agronomist available 24/7. Ask questions about sowing dates, pest outbreaks, or crop rotations in your own language.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA Banner */}
      <section className="bg-brand-50 dark:bg-brand-950/30 border-b border-brand-100 dark:border-brand-900/30 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Ready to upgrade your farm productivity?
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-dark-300 font-medium">
            Join thousands of progressive farmers making informed decisions with {BRAND.name}.
          </p>
          <div className="pt-2">
            <NavLink
              to="/register"
              className="inline-block px-7 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-brand-700/20 transition-all min-h-[44px]"
            >
              Create Your Free Account
            </NavLink>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 px-4 md:px-8 py-12 mt-auto text-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <BrandLogo variant="full" size="sm" showTagline={false} className="text-white" />
            <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">
              Empowering farmers across India with AI agronomy, Mandi indices, and scientific crop care.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-[10px] uppercase tracking-wider">Platform</h4>
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
            <h4 className="font-bold text-white text-[10px] uppercase tracking-wider">Farmer Support</h4>
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 font-medium"><Mail size={12} /> {BRAND.supportEmail}</span>
              <span className="text-[10px] text-slate-500 leading-normal">Our typical response window is under 24 hours.</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-800 mt-10 pt-6 text-center text-[10px] text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <span>{BRAND.copyright}</span>
          <span>Engineered with care for the Indian Farming Community.</span>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
