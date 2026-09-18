import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const Support: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the Crop Disease Scanner work?',
      a: 'The pathology scanner uses computer vision algorithms. By uploading a clear, high-resolution photo of the crop leaf, the model analyzes cell discoloration, spots, or decay symptoms and matches them with known plant diseases. It then provides organic remedies or chemical treatments.'
    },
    {
      q: 'Are the AI agronomy recommendations accurate?',
      a: 'AI recommendations represent general guidelines. Because local climate variables, water levels, and soil compositions vary, AI recommendations can occasionally be inaccurate. Consult local government inspectors before using high quantities of chemical fertilizers.'
    },
    {
      q: 'Why does a commodity show "Price Not Available" in Mandi Prices?',
      a: 'This status appears when the live government Agmarknet servers have not yet uploaded price logs for that specific commodity and market on the chosen day. We display this warning instead of showing an incorrect ₹0 price.'
    },
    {
      q: 'How do I cancel my subscription or request a refund?',
      a: 'Go to "My Subscription" to cancel your plan. In case of payment gateway errors or duplicate charges, email support@krishimitra.ai with your Razorpay payment details within 7 days to request a refund.'
    },
    {
      q: 'Can I request help if advisors are offline?',
      a: 'Yes! If no advisory experts are online, use the Video Consultation Request module inside the "Book Expert" section. Record or upload a short video (under 2 minutes) describing the crop problem, and an expert will review it.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-dark-850 px-4 md:px-8 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-brand-600 font-extrabold text-xs">
          <ArrowLeft size={16} /> Back to Home
        </NavLink>
        <div className="flex items-center gap-2">
          <Sprout size={18} className="text-brand-500" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">KrishiMitra AI</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 py-12 space-y-8 text-left">
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight">Support FAQ</h1>
          <p className="text-xs text-slate-500 dark:text-dark-350 leading-relaxed font-semibold">
            Common questions and answers regarding KrishiMitra AI features, plans, and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800/50 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-bold text-xs md:text-sm text-slate-805 dark:text-white flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              
              {openFaq === idx && (
                <div className="px-6 pb-4 pt-1 text-xs text-slate-500 dark:text-dark-400 leading-relaxed border-t border-slate-50 dark:border-dark-850">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-6 text-center text-[10px] border-t border-slate-800">
        &copy; 2026 KrishiMitra AI. Empowering the Indian Farming Community.
      </footer>

    </div>
  );
};
export default Support;
