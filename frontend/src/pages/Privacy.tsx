import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, ArrowLeft, Shield } from 'lucide-react';

export const Privacy: React.FC = () => {
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
          <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase">Last Updated: August 2026</p>
        </div>

        <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl border border-slate-100 dark:border-dark-800/50 shadow-sm space-y-6 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold border-b pb-2">
            <Shield size={16} />
            <span>1. Information Collection and Telemetry</span>
          </div>
          <p>
            We collect basic crop profile details, farm location coordinates, and uploaded leaf pathology photos. Location metadata is required to supply hyper-local weather advisory alerts, regional mandi prices index tracking, and government seed subsidy mappings.
          </p>

          <h3 className="font-bold text-slate-805 dark:text-white pt-2">2. Leaf Analysis Uploads</h3>
          <p>
            Uploaded crop leaf images are processed through Gemini Vision API frameworks to perform pathology cell classification. These photos are cached on secure folders and are never sold or shared with third-party advertisers. Unregistered guests may upload leaf photos to run analyses, but their scan history logs are not permanently tied to any user record.
          </p>

          <h3 className="font-bold text-slate-805 dark:text-white pt-2">3. Subscription Billing & Razorpay Credentials</h3>
          <p>
            All financial operations are verified directly via Razorpay Secure gateways. KrishiMitra AI servers do not store your physical bank numbers or full credit card numbers. Your active key secrets are securely contained on backend environmental nodes.
          </p>

          <h3 className="font-bold text-slate-805 dark:text-white pt-2">4. User Rights and Data Deletion</h3>
          <p>
            Registered users can modify or request complete purge deletion of their coordinates, leaf logs, and authentication credentials at any time by contacting our support team at support@krishimitra.ai.
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
export default Privacy;
