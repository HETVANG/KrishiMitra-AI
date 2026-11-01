import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const RefundPolicy: React.FC = () => {
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
          <h1 className="text-3xl font-black tracking-tight">Refund Policy</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase">Last Updated: November 2026</p>
        </div>

        <div className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-dark-800/50 shadow-xs space-y-6 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold border-b border-slate-100 dark:border-dark-800 pb-2">
            <RotateCcw size={16} />
            <span>1. Premium Subscription & Cancellations</span>
          </div>
          <p>
            Users can upgrade to Premium to access priority agronomist consultations, soil ledger histories, and unlimited PDF statement exports. Subscription terms run on monthly or yearly cycles. You can cancel your subscription plan at any time; cancellations take effect at the end of your current active billing period.
          </p>

          <h3 className="font-bold text-slate-900 dark:text-white pt-2">2. Refund Eligibility</h3>
          <p>
            Since agronomic intelligence reports and mandi pricing indices represent immediate real-time digital services, we generally do not offer pro-rata refunds for active, partially-used billing periods. If a double-billing error occurs due to payment gateway delays (e.g. Razorpay duplicate charge), we will promptly issue a full refund for the duplicate transaction.
          </p>

          <h3 className="font-bold text-slate-900 dark:text-white pt-2">3. Claim Processing</h3>
          <p>
            Refund requests must be submitted within 7 days of the transaction date to {BRAND.supportEmail}. Include your name, registered email address, payment receipt ID, and Razorpay Order ID. Eligible refunds are processed back to the original payment source within 5 to 7 working days.
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
