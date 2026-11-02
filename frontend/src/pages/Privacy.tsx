import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Privacy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200 text-left">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-200/80 dark:border-dark-850 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-xs hover:underline">
          <ArrowLeft size={16} /> <span>{t('privacy.back_to_home') || 'Back to Home'}</span>
        </NavLink>
        <BrandLogo variant="horizontal" size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('privacy.title') || 'Privacy Policy'}
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase">
            {t('privacy.updated') || 'Last Updated: November 2026'}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-900 p-5 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-dark-800/50 shadow-xs space-y-6 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold border-b border-slate-100 dark:border-dark-800 pb-2">
            <Shield size={16} />
            <span>{t('privacy.section_1_title') || '1. Data Collection'}</span>
          </div>
          <p>
            {t('privacy.section_1_desc') || 'We collect only data necessary for delivering agricultural intelligence: location coordinates (for weather and APMC mandis), crop scans, and optional farm ledger notes.'}
          </p>

          <h3 className="font-bold text-slate-900 dark:text-white pt-2">
            {t('privacy.section_2_title') || '2. Farmer Ownership'}
          </h3>
          <p>
            {t('privacy.section_2_desc') || 'Your farm data belongs to you. We do not sell your personal, financial, or yield records to third-party commercial marketing entities.'}
          </p>

          <h3 className="font-bold text-slate-900 dark:text-white pt-2">
            {t('privacy.section_3_title') || '3. Data Security'}
          </h3>
          <p>
            {t('privacy.section_3_desc') || 'All data in transit and at rest is protected by industry standard encryption protocols.'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-[10px] border-t border-slate-800">
        {BRAND.copyright} Designed for the Indian Agricultural Community.
      </footer>

    </div>
  );
};

export default Privacy;
