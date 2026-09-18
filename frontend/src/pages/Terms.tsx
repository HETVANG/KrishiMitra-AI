import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, ArrowLeft, FileText } from 'lucide-react';

export const Terms: React.FC = () => {
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
          <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase">Last Updated: August 2026</p>
        </div>

        <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl border border-slate-100 dark:border-dark-800/50 shadow-sm space-y-6 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold border-b pb-2">
            <FileText size={16} />
            <span>1. Terms & Platform Usage</span>
          </div>
          <p>
            By accessing KrishiMitra AI, you agree to comply with our platform guidelines. Visitors can try leaf pathology scans, weather advisory panels, and mandi prices index lists as guests. Access to NPK soil planners, cost ledger logs, and billing profiles requires active authentication.
          </p>

          <h3 className="font-bold text-slate-805 dark:text-white pt-2">2. Agricultural Advisory Disclaimer</h3>
          <p className="border-l-4 border-amber-500 pl-3 bg-amber-500/5 py-2 text-amber-800 dark:text-amber-300 font-medium">
            IMPORTANT: All predictions, treatment details, seed choices, and dosage suggestions returned by our AI systems represent generalized suggestions. Artificial intelligence models can produce inaccurate results due to environmental anomalies. These advisories are NOT absolute veterinary or agronomy prescriptions. Consult local certified crop inspectors or government agricultural officials prior to distributing high-toxicity pesticide quantities.
          </p>

          <h3 className="font-bold text-slate-805 dark:text-white pt-2">3. Subscription billing terms</h3>
          <p>
            Upgrades to Premium unlock unlimited diagnostics, specialized weather parameters, and advisor booking slots. Payments are handled via Razorpay in INR. Your plan is renewed or expires according to your chosen monthly or yearly billing cycles. Dismissible warnings will alert you once subscription periods expire.
          </p>

          <h3 className="font-bold text-slate-805 dark:text-white pt-2">4. Disruption & Limitation of Liability</h3>
          <p>
            Mandi pricing lists depend on Agmarknet API systems. Soil planners use mathematical projections. Weather advisories utilize open satellite gateways. We are not liable for crop failure, financial mandi losses, or application bugs.
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
export default Terms;
