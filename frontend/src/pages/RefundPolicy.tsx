import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, ArrowLeft, RotateCcw } from 'lucide-react';

export const RefundPolicy: React.FC = () => {
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
          <h1 className="text-3xl font-extrabold tracking-tight">Refund Policy</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase">Last Updated: August 2026</p>
        </div>

        <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl border border-slate-100 dark:border-dark-800/50 shadow-sm space-y-6 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold border-b pb-2">
            <RotateCcw size={16} />
            <span>1. Premium Subscription & Cancellations</span>
          </div>
          <p>
            Users can upgrade to Premium to access priority expert consultations, soil ledger histories, and PDF report prints. Subscription terms run on monthly or yearly cycles. You can cancel your subscription plan at any time; however, cancellations will take effect at the end of your current active billing period.
          </p>

          <h3 className="font-bold text-slate-805 dark:text-white pt-2">2. Refund Eligibility</h3>
          <p>
            Since agricultural AI advice and mandi pricing logs represent digital assets that are delivered immediately upon generation, we generally do not offer pro-rata refunds for active, partially-used billing periods. If a double-billing error occurs due to payment gateway delays (e.g. Razorpay double charge), we will issue a full refund for the duplicate transaction.
          </p>

          <h3 className="font-bold text-slate-805 dark:text-white pt-2">3. Claim Processing</h3>
          <p>
            Refund requests must be submitted within 7 days of the transaction date to support@krishimitra.ai. Include your name, registered email address, payment receipt ID, and Razorpay Order ID. Eligible refunds are processed back to the original payment source within 5 to 7 working days.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-6 text-center text-[10px] border-t border-slate-800">
        &copy; 2026 KrishiMitra AI. Empowering the Indian Farming Community.
      </footer>

    </div>
  );
};
export default RefundPolicy;
