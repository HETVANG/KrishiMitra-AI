import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, BellOff, Mail, CheckCircle2, AlertTriangle, ShieldCheck, MessageSquare, Bell } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';
import { api } from '../services/api';

export const Unsubscribe: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [unsubscribeEmails, setUnsubscribeEmails] = useState(true);
  const [unsubscribeWhatsapp, setUnsubscribeWhatsapp] = useState(true);
  const [unsubscribePush, setUnsubscribePush] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your registered email address or phone number.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.post('/auth/unsubscribe', {
        emailOrPhone: emailOrPhone.trim(),
        channels: {
          marketingEmails: unsubscribeEmails,
          promotionalWhatsapp: unsubscribeWhatsapp,
          promotionalPush: unsubscribePush
        }
      });

      const data = res.data;
      if (data && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || 'You have been successfully unsubscribed from marketing and promotional messages.'
        });
        setEmailOrPhone('');
      } else {
        setStatusMessage({
          type: 'error',
          text: data?.message || 'Unable to update unsubscribe preferences. Please try again.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Network error updating your preferences. Please try again later.'
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
      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-100/80 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300">
            <BellOff size={12} /> Communication Preferences
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Unsubscribe from Marketing
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 font-semibold uppercase tracking-wider">
            Manage Promotional Email, WhatsApp & Push Notification Preferences
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark-800 shadow-xs space-y-6 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-800 flex items-start gap-3">
            <ShieldCheck className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-slate-600 dark:text-dark-300">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Essential Notifications Notice</span>
              Unsubscribing applies exclusively to promotional deals, newsletter broadcasts, and non-essential tips. Essential transactional communications—such as <strong>One-Time Passwords (OTP), account security alerts, and payment invoice receipts</strong>—will continue to be delivered to guarantee account safety.
            </div>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter your Registered Email Address or Mobile Number *
              </label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="e.g., kisan@example.com or 9876543210"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-3 pt-1">
              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                Select Channels to Opt Out Of:
              </span>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-850/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unsubscribeEmails}
                  onChange={(e) => setUnsubscribeEmails(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Mail size={14} className="text-brand-600" /> Marketing & Promotional Emails
                  </div>
                  <div className="text-slate-500 dark:text-dark-400 text-[11px]">Seasonal crop advisory bulletins, feature announcements, and agricultural tips.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-850/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unsubscribeWhatsapp}
                  onChange={(e) => setUnsubscribeWhatsapp(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-emerald-600" /> Promotional WhatsApp Alerts
                  </div>
                  <div className="text-slate-500 dark:text-dark-400 text-[11px]">Occasional crop disease alerts and special discount notifications via WhatsApp.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-850/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unsubscribePush}
                  onChange={(e) => setUnsubscribePush(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell size={14} className="text-purple-600" /> Non-Essential Push Notifications
                  </div>
                  <div className="text-slate-500 dark:text-dark-400 text-[11px]">Marketing recommendations and general reminders.</div>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || (!unsubscribeEmails && !unsubscribeWhatsapp && !unsubscribePush)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer flex items-center justify-center gap-2"
            >
              <BellOff size={14} />
              {loading ? 'Updating Preferences...' : 'Save Unsubscribe Preferences'}
            </button>
          </form>

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

export default Unsubscribe;
