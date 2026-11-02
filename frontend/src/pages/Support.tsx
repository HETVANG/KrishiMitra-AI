import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Support: React.FC = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: t('support.faq_1_q') || 'How does the Crop Disease Scanner work?',
      a: t('support.faq_1_a') || 'The pathology scanner uses computer vision algorithms. By uploading a clear photograph of the crop foliage, the model analyzes cell discoloration, spots, or decay symptoms and matches them with known plant diseases. It then provides organic remedies and chemical treatments.'
    },
    {
      q: t('support.faq_2_q') || 'Where do the Mandi commodity prices come from?',
      a: t('support.faq_2_a') || 'Daily prices are fetched in real-time from official Agmarknet APMC government databases across Gujarat, Maharashtra, and India.'
    },
    {
      q: t('support.faq_3_q') || 'How do I switch the platform language to Gujarati or Hindi?',
      a: t('support.faq_3_a') || 'Click the globe icon in the top navigation bar or go to Settings > Regional Configuration to choose English, Gujarati, or Hindi.'
    },
    {
      q: t('support.faq_4_q') || 'How do I export official PDF statements?',
      a: t('support.faq_4_a') || 'Navigate to PDF Reports from the sidebar to generate, preview, and download authenticated multi-lingual crop, pathology, and expense statements.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200 text-left">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-200/80 dark:border-dark-850 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-xs hover:underline">
          <ArrowLeft size={16} /> <span>{t('support.back_to_home') || 'Back to Home'}</span>
        </NavLink>
        <BrandLogo variant="horizontal" size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('support.title') || 'Support FAQ'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-semibold">
            {t('support.subtitle') || `Common questions and answers regarding ${BRAND.name} features, plans, and billing.`}
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200/80 dark:border-dark-800/50 shadow-xs overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                type="button"
                className="w-full px-5 py-4 text-left font-bold text-xs md:text-sm text-slate-800 dark:text-white flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
              </button>
              
              {openFaq === idx && (
                <div className="px-5 pb-4 pt-1 text-xs text-slate-500 dark:text-dark-400 leading-relaxed border-t border-slate-100 dark:border-dark-800 font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-brand-50/70 dark:bg-brand-950/20 p-5 rounded-2xl border border-brand-200/50 dark:border-brand-900/30 text-center text-xs text-brand-800 dark:text-brand-300 font-bold">
          {t('support.contact_support') || 'Need direct assistance? Contact our agritech support team.'}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-[10px] border-t border-slate-800">
        {BRAND.copyright} Designed for the Indian Agricultural Community.
      </footer>

    </div>
  );
};

export default Support;
