import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const RefundPolicy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200 text-left">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-200/80 dark:border-dark-850 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-xs hover:underline">
          <ArrowLeft size={16} /> <span>{t('refund.back_to_home') || 'Back to Home'}</span>
        </NavLink>
        <BrandLogo variant="horizontal" size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('refund.title') || 'Refund Policy'}
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase">
            {t('refund.updated') || 'Last Updated: November 2026'}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-900 p-5 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-dark-800/50 shadow-xs space-y-6 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold border-b border-slate-100 dark:border-dark-800 pb-2">
            <RotateCcw size={16} />
            <span>{t('refund.section_1_title') || '1. Subscription Refunds'}</span>
          </div>
          <p>
            {t('refund.section_1_desc') || 'If you are not satisfied with The Khedut Premium within the first 7 days of activation, you can request a 100% full refund with no questions asked.'}
          </p>

          <h3 className="font-bold text-slate-900 dark:text-white pt-2">
            {t('refund.section_2_title') || '2. Expert Consultation Cancellations'}
          </h3>
          <p>
            {t('refund.section_2_desc') || 'Appointments cancelled at least 2 hours before the scheduled time slot will be refunded in full or rescheduled at no extra charge.'}
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

export default RefundPolicy;
