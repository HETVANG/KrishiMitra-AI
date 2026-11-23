import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Cookie, Sliders, Check, Shield } from 'lucide-react';
import { getStoredCookieConsent, saveCookieConsent } from '../../utils/cookieConsent';
import { CookieSettingsModal } from './CookieSettingsModal';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Only display if user has not yet recorded consent
    const consent = getStoredCookieConsent();
    if (!consent) {
      // Short delay for smooth slide-in without layout shift
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    saveCookieConsent(true, true);
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    saveCookieConsent(false, false);
    setIsVisible(false);
  };

  const handleOpenSettings = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // If preferences were saved in modal, banner hides
    if (getStoredCookieConsent()) {
      setIsVisible(false);
    }
  };

  return (
    <>
      {isVisible && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Consent Banner"
          className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 md:left-auto md:right-8 md:max-w-xl z-[90] p-4 sm:p-5 bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/90 dark:border-dark-800 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300 text-left"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 shrink-0">
              <Cookie size={22} />
            </div>
            <div className="space-y-1.5 flex-grow">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                We Respect Your Privacy & Farm Data
              </h3>
              <p className="text-xs text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
                We use strictly essential storage for security and session state, plus optional analytics cookies to measure app performance. You have complete control over non-essential data collection under the DPDP Act 2023. Read our{' '}
                <NavLink to="/cookie-policy" className="text-brand-600 dark:text-brand-400 underline font-semibold">
                  Cookie Policy
                </NavLink>{' '}
                and{' '}
                <NavLink to="/privacy" className="text-brand-600 dark:text-brand-400 underline font-semibold">
                  Privacy Policy
                </NavLink>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-4 mt-1 border-t border-slate-100 dark:border-dark-800">
            <button
              onClick={handleOpenSettings}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-dark-200 hover:bg-slate-100 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders size={13} /> Cookie Settings
            </button>
            <button
              onClick={handleRejectNonEssential}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-dark-200 hover:bg-slate-100 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-700 transition-colors cursor-pointer"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} /> Accept All
            </button>
          </div>
        </aside>
      )}

      {/* Global modal opened either from banner or footer event */}
      <CookieSettingsModal isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  );
};

export default CookieConsentBanner;
