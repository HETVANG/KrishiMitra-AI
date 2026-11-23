import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertTriangle, ShieldCheck, CheckCircle2, Clock, Mail, HelpCircle, FileText } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';
import { api } from '../services/api';

export const DataDeletion: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [reason, setReason] = useState('');
  const [confirmUnderstood, setConfirmUnderstood] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your registered email address or phone number.' });
      return;
    }
    if (!confirmUnderstood) {
      setStatusMessage({ type: 'error', text: 'Please confirm that you understand this action will deactivate your account and initiate data deletion.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const isEmail = identifier.includes('@');
      const payload: any = {
        reason: reason.trim() || 'User requested account closure'
      };
      if (isEmail) {
        payload.email = identifier.trim().toLowerCase();
      } else {
        payload.phone = identifier.trim();
      }

      const res = await api.post('/auth/request-data-deletion', payload);
      const data = res.data;

      if (data && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Your account deletion request has been registered. Your account has been deactivated, and eligible personal data will be completely deleted within 30 days.'
        });
        setIdentifier('');
        setReason('');
        setConfirmUnderstood(false);
        // Clear local token if user deleted their own logged in account
        if (localStorage.getItem('thekhedut_token')) {
          localStorage.removeItem('thekhedut_token');
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: data?.message || 'Unable to submit deletion request. Please try again or contact support.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Network error communicating with deletion server. Please verify your connection or email our support desk.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200 text-left">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-200/80 dark:border-dark-850 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <NavLink to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md">
          <ArrowLeft size={16} /> <span>Back to Home</span>
        </NavLink>
        <BrandLogo variant="horizontal" size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
            <Trash2 size={12} /> Google Play Store & DPDP Act 2023 Compliance
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Account & Data Deletion Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 font-semibold uppercase tracking-wider">
            Self-Service Deletion Request & Retention Transparency Notice
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark-800 shadow-xs space-y-8 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          
          {/* Section 1: Overview */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <ShieldCheck size={18} />
              <h2>1. Your Right to Erasure & Deletion</h2>
            </div>
            <p>
              In full compliance with Google Play Developer Policy on Account Deletion and Section 12 of the Digital Personal Data Protection Act, 2023 (India), any user may delete their account and associated personal data at any time. You may submit this request while logged into the app, through this self-service web form, or by contacting our support team if you have already uninstalled the application.
            </p>
          </section>

          {/* Section 2: Data Deleted vs Retained */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <FileText size={18} />
              <h2>2. Data Scope: What is Deleted vs Retained</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Deleted */}
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
                <span className="font-bold text-rose-900 dark:text-rose-200 text-xs flex items-center gap-1.5">
                  <Trash2 size={14} /> Data Completely Purged (Within 30 Days)
                </span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-950 dark:text-rose-300">
                  <li>User account profile (name, email, password hash, phone).</li>
                  <li>All uploaded crop photos and plant leaf images.</li>
                  <li>AI crop disease diagnosis reports and pathology history.</li>
                  <li>Farm field GPS coordinates and boundary polygons.</li>
                  <li>AI Farm Copilot chat logs and voice query transcripts.</li>
                  <li>Farm cost ledger, crop logs, and custom fertilizer notes.</li>
                  <li>Push notification device tokens and FCM credentials.</li>
                </ul>
              </div>

              {/* Retained */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                <span className="font-bold text-amber-900 dark:text-amber-200 text-xs flex items-center gap-1.5">
                  <Clock size={14} /> Data Retained for Statutory Legal Mandates
                </span>
                <p className="text-[11px] text-amber-950 dark:text-amber-300">
                  As required by Indian tax, commercial, and financial laws:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-950 dark:text-amber-300">
                  <li><strong>Financial & Invoice Records:</strong> Retained for seven (7) years under Section 36 of the Central Goods and Services Tax (CGST) Act, 2017 and Section 44AA of the Income Tax Act, 1961.</li>
                  <li><strong>Audit & Payment IDs:</strong> Razorpay payment identifiers, invoice numbers, and GSTIN audit trails (stored securely in read-only financial archives).</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Deletion Timeline */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Clock size={18} />
              <h2>3. Deletion Lifecycle & Timeline</h2>
            </div>
            <div className="space-y-2 text-xs">
              <p>
                <strong>Immediate Step (0 Hours):</strong> Upon submitting a deletion request, your account is immediately blocked and deactivated. Authentication tokens are invalidated, and you can no longer log in.
              </p>
              <p>
                <strong>Permanent Purge (Within 30 Days):</strong> Our automated data erasure workers permanently scrub all personal records, media blobs, and diagnostic documents from live MongoDB Atlas clusters and Cloudinary media storage within 30 days. Backup snapshots expire and overwrite naturally in accordance with rolling retention policies.
              </p>
            </div>
          </section>

          {/* Section 4: Self-Service Deletion Form */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Trash2 size={18} />
              <h2>4. Submit Account Deletion Request</h2>
            </div>

            {statusMessage && (
              <div
                className={`p-4 rounded-2xl flex items-start gap-3 text-xs ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 dark:bg-dark-850 p-5 rounded-2xl border border-slate-200 dark:border-dark-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Email Address or Phone Number *
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g., farmer@example.com or +91 9876543210"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Deletion (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Help us understand how we can improve our agricultural services..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="confirm-deletion"
                  checked={confirmUnderstood}
                  onChange={(e) => setConfirmUnderstood(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="confirm-deletion" className="text-xs text-slate-600 dark:text-dark-300 cursor-pointer select-none">
                  I understand that this action will permanently deactivate my account, forfeit active premium subscriptions without refund, and delete all my farm pathology history and diagnostic records.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !confirmUnderstood}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                {loading ? 'Submitting Request...' : 'Permanently Delete My Account & Data'}
              </button>
            </form>
          </section>

          {/* Section 5: Manual Email Option */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Mail size={18} />
              <h2>5. Request Deletion via Email Support</h2>
            </div>
            <p>
              If you have uninstalled the Android application and prefer to request data deletion via email, you may send a formal request to our privacy team:
            </p>
            <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-xl border border-slate-200 dark:border-dark-800 text-xs space-y-1">
              <div><strong>Email Address:</strong> <span className="font-semibold text-slate-900 dark:text-white">[TO BE PROVIDED]</span></div>
              <div><strong>Subject Line:</strong> <code className="font-mono text-brand-600 dark:text-brand-400">Account Deletion Request - [Your Registered Phone/Email]</code></div>
              <div><strong>Processing Window:</strong> Email deletion requests are verified and confirmed within two (2) business days.</div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-[11px] border-t border-slate-800">
        <p className="font-medium text-slate-300">
          {BRAND.copyright} Designed for the Indian Agricultural Community.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-2 text-slate-500">
          <NavLink to="/privacy" className="hover:text-slate-300">Privacy Policy</NavLink>
          <span>•</span>
          <NavLink to="/terms" className="hover:text-slate-300">Terms of Service</NavLink>
          <span>•</span>
          <NavLink to="/refund-policy" className="hover:text-slate-300">Refund Policy</NavLink>
          <span>•</span>
          <NavLink to="/cookie-policy" className="hover:text-slate-300">Cookie Policy</NavLink>
          <span>•</span>
          <NavLink to="/accessibility" className="hover:text-slate-300">Accessibility</NavLink>
          <span>•</span>
          <NavLink to="/business-information" className="hover:text-slate-300">Business Information</NavLink>
        </div>
      </footer>

    </div>
  );
};

export default DataDeletion;
