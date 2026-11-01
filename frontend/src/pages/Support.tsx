import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Support: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the Crop Disease Scanner work?',
      a: 'The pathology scanner uses computer vision algorithms. By uploading a clear photograph of the crop foliage, the model analyzes cell discoloration, spots, or decay symptoms and matches them with known plant diseases. It then provides organic remedies and chemical treatments.'
    },
    {
      q: 'Are the AI agronomy recommendations accurate?',
      a: 'AI recommendations represent generalized suggestions. Because local climate variables, water levels, and soil compositions vary, advisories should be corroborated with field conditions. Consult local agricultural extension officers before using high quantities of chemical fertilizers.'
    },
    {
      q: 'Why does a commodity show "Price Not Available" in Mandi Prices?',
      a: 'This status appears when the live government Agmarknet servers have not yet uploaded price logs for that specific commodity and market on the chosen day. We display this clear notice instead of showing an incorrect ₹0 price.'
    },
    {
      q: 'How do I cancel my subscription or request a refund?',
      a: `Go to "My Subscription" to cancel your plan. In case of payment gateway errors or duplicate charges, email ${BRAND.supportEmail} with your Razorpay payment details within 7 days to request a refund.`
    },
    {
      q: 'Can I request help if advisors are offline?',
      a: 'Yes! If no advisory experts are online, use the Video Consultation Request module inside the "Book Expert" section. Record or upload a short video (under 2 minutes) describing the crop problem, and a certified agronomist will review it.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-200/80 dark:border-dark-850 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-xs hover:underline">
          <ArrowLeft size={16} /> Back to Home
        </NavLink>
        <BrandLogo variant="horizontal" size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 py-12 space-y-8 text-left">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Support FAQ</h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-semibold">
            Common questions and answers regarding {BRAND.name} features, plans, and billing.
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
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-[10px] border-t border-slate-800">
        {BRAND.copyright} Designed for the Indian Agricultural Community.
      </footer>

    </div>
  );
};

export default Support;
