import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Terms: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200 text-left">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-200/80 dark:border-dark-850 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-xs hover:underline">
          <ArrowLeft size={16} /> <span>{t('terms.back_to_home') || 'Back to Home'}</span>
        </NavLink>
        <BrandLogo variant="horizontal" size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('terms.title') || 'Terms of Service'}
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase">
            {t('terms.updated') || 'Last Updated: November 2026'}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-900 p-5 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-dark-800/50 shadow-xs space-y-6 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold border-b border-slate-100 dark:border-dark-800 pb-2">
            <FileText size={16} />
            <span>{t('terms.section_1_title') || '1. Terms & Platform Usage'}</span>
          </div>
          <p>
            {t('terms.section_1_desc') || `By accessing ${BRAND.name}, you agree to comply with our platform guidelines. Visitors can try crop pathology scans, weather advisory panels, and mandi price index lists. Full access to digital NPK soil planners, cost ledger logs, and enterprise cooperative profiles requires active authentication.`}
          </p>

          <h3 className="font-bold text-slate-900 dark:text-white pt-2">
            {t('terms.section_2_title') || '2. Agricultural Advisory Disclaimer'}
          </h3>
          <p className="border-l-4 border-amber-500 pl-3.5 bg-amber-500/5 py-2.5 text-amber-800 dark:text-amber-300 font-medium rounded-r-xl">
            {t('terms.section_2_desc') || 'IMPORTANT: All predictions, treatment details, seed choices, and dosage suggestions returned by our AI systems represent generalized agronomic suggestions. Environmental conditions vary across micro-climates. These advisories are NOT absolute veterinary or agronomy prescriptions. Consult local certified crop extension officers or government agricultural departments prior to applying chemical remedies.'}
          </p>

          <h3 className="font-bold text-slate-900 dark:text-white pt-2">
            {t('terms.section_3_title') || '3. Subscription Billing Terms'}
          </h3>
          <p>
            {t('terms.section_3_desc') || 'Upgrades to Premium unlock unlimited diagnostics, specialized climate parameters, and advisor booking slots. Payments are securely processed via Razorpay in INR. Your plan is renewed or expires according to your chosen monthly or yearly billing cycles.'}
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

export default Terms;
