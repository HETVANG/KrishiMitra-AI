import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, Sliders, ShieldCheck, Cookie, HelpCircle, Check, CheckCircle2 } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';
import { getStoredCookieConsent, saveCookieConsent } from '../utils/cookieConsent';

export const CookieSettings: React.FC = () => {
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const consent = getStoredCookieConsent();
    if (consent) {
      setAnalytics(consent.analytics);
      setFunctional(consent.functional);
    }
  }, []);

  const handleSave = () => {
    saveCookieConsent(analytics, functional);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleAcceptAll = () => {
    saveCookieConsent(true, true);
    setAnalytics(true);
    setFunctional(true);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleRejectAll = () => {
    saveCookieConsent(false, false);
    setAnalytics(false);
    setFunctional(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200 text-left">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-200/80 dark:border-dark-850 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <NavLink to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md">
          <ArrowLeft size={16} /> <span>Back to Home</span>
        </NavLink>
        <BrandLogo variant="horizontal" size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-100/80 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300">
            <Sliders size={12} /> Privacy & Device Storage Control
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Cookie & Storage Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 font-semibold uppercase tracking-wider">
            Review and adjust your preferences at any time
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark-800 shadow-xs space-y-6 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          
          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200 animate-in fade-in">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>Your cookie and storage preferences have been saved successfully.</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            {/* Strictly Necessary */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/70 dark:bg-dark-850/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Strictly Necessary & Essential</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Always Active
                </span>
              </div>
              <p className="text-slate-600 dark:text-dark-300 text-xs leading-relaxed">
                Essential for account login, session verification, and basic security. These cannot be disabled as the agricultural portal cannot operate securely without them.
              </p>
            </div>

            {/* Functional */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/70 dark:bg-dark-850/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                  <Cookie size={16} className="text-blue-600" />
                  <span>Functional & Offline Storage</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={functional}
                    onChange={(e) => setFunctional(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-dark-600 peer-checked:bg-brand-600"></div>
                </label>
              </div>
              <p className="text-slate-600 dark:text-dark-300 text-xs leading-relaxed">
                Locally caches your Mandi price lists and recent crop disease symptoms to ensure uninterrupted tool usage in low-connectivity rural zones.
              </p>
            </div>

            {/* Analytics */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/70 dark:bg-dark-850/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                  <HelpCircle size={16} className="text-purple-600" />
                  <span>Analytics & Performance Metrics</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-dark-600 peer-checked:bg-brand-600"></div>
                </label>
              </div>
              <p className="text-slate-600 dark:text-dark-300 text-xs leading-relaxed">
                Helps us monitor frontend load times and diagnose application errors using Google Analytics 4 and Microsoft Clarity. Completely opt-in.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-100 dark:border-dark-800">
            <button
              onClick={handleRejectAll}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-700 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-dark-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Reject Non-Essential
            </button>
            <div className="flex-grow"></div>
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-dark-700 dark:hover:bg-dark-600 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Accept All
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-dark-400 pt-2">
            Read our full <NavLink to="/cookie-policy" className="text-brand-600 dark:text-brand-400 underline">Cookie Policy</NavLink> and <NavLink to="/privacy" className="text-brand-600 dark:text-brand-400 underline">Privacy Policy</NavLink> for further details.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-[11px] border-t border-slate-800">
        <p className="font-medium text-slate-300">
          {BRAND.copyright} Designed for the Indian Agricultural Community.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-2 text-slate-500">
          <NavLink to="/privacy" className="hover:text-slate-300">Privacy Policy</NavLink>
          <span>•</span>
          <NavLink to="/terms" className="hover:text-slate-300">Terms of Service</NavLink>
          <span>•</span>
          <NavLink to="/refund-policy" className="hover:text-slate-300">Refund Policy</NavLink>
          <span>•</span>
          <NavLink to="/cookie-policy" className="hover:text-slate-300">Cookie Policy</NavLink>
          <span>•</span>
          <NavLink to="/accessibility" className="hover:text-slate-300">Accessibility</NavLink>
          <span>•</span>
          <NavLink to="/business-information" className="hover:text-slate-300">Business Information</NavLink>
        </div>
      </footer>

    </div>
  );
};

export default CookieSettings;
