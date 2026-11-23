import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X, ShieldCheck, Check, Cookie, HelpCircle, Sliders } from 'lucide-react';
import { getStoredCookieConsent, saveCookieConsent, type CookieConsentPreferences } from '../../utils/cookieConsent';

interface CookieSettingsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(true);

  const loadCurrentPreferences = () => {
    const existing = getStoredCookieConsent();
    if (existing) {
      setAnalytics(existing.analytics);
      setFunctional(existing.functional);
    } else {
      setAnalytics(false);
      setFunctional(true);
    }
  };

  useEffect(() => {
    loadCurrentPreferences();

    const handleOpen = () => {
      loadCurrentPreferences();
      setInternalIsOpen(true);
    };

    window.addEventListener('km_open_cookie_settings', handleOpen);
    return () => window.removeEventListener('km_open_cookie_settings', handleOpen);
  }, []);

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveCookieConsent(analytics, functional);
    handleClose();
  };

  const handleAcceptAll = () => {
    saveCookieConsent(true, true);
    setAnalytics(true);
    setFunctional(true);
    handleClose();
  };

  const handleRejectAll = () => {
    saveCookieConsent(false, false);
    setAnalytics(false);
    setFunctional(false);
    handleClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-settings-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-dark-900 rounded-3xl border border-slate-200 dark:border-dark-800 shadow-2xl p-6 sm:p-7 space-y-6 text-left max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
              <Sliders size={20} />
            </div>
            <div>
              <h2 id="cookie-settings-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Cookie & Storage Preferences
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-dark-400">
                Customise how data is stored on your device
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close cookie settings dialog"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-4 text-xs">
          {/* Strictly Necessary */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/70 dark:bg-dark-850/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Strictly Necessary & Essential</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Always Active
              </span>
            </div>
            <p className="text-slate-600 dark:text-dark-300 text-[11px] leading-relaxed">
              Required for security, user authentication sessions, CSRF validation, and fundamental agricultural portal navigation. These cannot be disabled.
            </p>
          </div>

          {/* Functional / Offline Storage */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/70 dark:bg-dark-850/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
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
            <p className="text-slate-600 dark:text-dark-300 text-[11px] leading-relaxed">
              Caches Mandi prices, agricultural diagnostic results, and preferred village districts locally so the application functions seamlessly during poor rural mobile connectivity.
            </p>
          </div>

          {/* Analytics Cookies */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/70 dark:bg-dark-850/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
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
            <p className="text-slate-600 dark:text-dark-300 text-[11px] leading-relaxed">
              Provides aggregated, anonymized usage telemetry via Google Analytics 4 and Microsoft Clarity to assist us in troubleshooting slow load times and app crashes.
            </p>
          </div>
        </div>

        {/* Footer info link */}
        <div className="text-[11px] text-slate-500 dark:text-dark-400">
          For full details, please review our{' '}
          <NavLink
            to="/cookie-policy"
            onClick={handleClose}
            className="text-brand-600 dark:text-brand-400 underline font-semibold"
          >
            Cookie Policy
          </NavLink>{' '}
          and{' '}
          <NavLink
            to="/privacy"
            onClick={handleClose}
            className="text-brand-600 dark:text-brand-400 underline font-semibold"
          >
            Privacy Policy
          </NavLink>.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-dark-800">
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
      </div>
    </div>
  );
};

export default CookieSettingsModal;
