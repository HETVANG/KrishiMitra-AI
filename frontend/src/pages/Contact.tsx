import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, MapPin, Send, MessageSquare } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setFormData({ name: '', email: '', message: '' });
        alert(t('contact.success_msg') || `Thank you! Your message has been sent to ${BRAND.supportEmail}.`);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200 text-left">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-200/80 dark:border-dark-850 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-xs hover:underline">
          <ArrowLeft size={16} /> <span>{t('contact.back_to_home') || 'Back to Home'}</span>
        </NavLink>
        <BrandLogo variant="horizontal" size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 sm:py-12 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Contact Info (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-dark-900 p-5 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-dark-800/50 shadow-xs space-y-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('contact.title') || 'Contact Support'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
            {t('contact.subtitle') || 'Have questions about your subscription, technical issues, or agronomy recommendations? Reach out to our expert desk.'}
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 text-xs">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 rounded-xl shrink-0">
                <Mail size={16} />
              </div>
              <div className="min-w-0">
                <span className="font-bold block text-slate-400 uppercase text-[9px]">{t('contact.email_label') || 'Email Address'}</span>
                <span className="font-semibold text-slate-800 dark:text-dark-200 break-all">{BRAND.supportEmail}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="p-2.5 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 rounded-xl shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <span className="font-bold block text-slate-400 uppercase text-[9px]">{t('contact.office_title') || 'Headquarters'}</span>
                <span className="font-semibold text-slate-800 dark:text-dark-200">{t('contact.office_address') || 'Agritech Hub, Gujarat / NCR, India'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-955/30 text-indigo-600 rounded-xl shrink-0">
                <MessageSquare size={16} />
              </div>
              <div>
                <span className="font-bold block text-slate-400 uppercase text-[9px]">SLA</span>
                <span className="font-semibold text-slate-800 dark:text-dark-200">Typical response under 24 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="md:col-span-7 bg-white dark:bg-dark-900 p-5 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-dark-800/50 shadow-xs space-y-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {t('contact.send_button') || 'Send Us a Direct Message'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-dark-300 uppercase mb-1.5">
                {t('contact.name_label') || 'Your Full Name'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ramesh Patel"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-dark-750 bg-slate-50 dark:bg-dark-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-dark-300 uppercase mb-1.5">
                {t('contact.email_label') || 'Email Address'}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ramesh@farm.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-dark-750 bg-slate-50 dark:bg-dark-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-dark-300 uppercase mb-1.5">
                {t('contact.message_label') || 'Message / Inquiry'}
              </label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe your crop or platform query..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-dark-750 bg-slate-50 dark:bg-dark-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={sent}
              className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Send size={14} /> <span>{sent ? (t('contact.sending') || 'Sending...') : (t('contact.send_button') || 'Send Message')}</span>
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-[10px] border-t border-slate-800">
        {BRAND.copyright} Designed for the Indian Agricultural Community.
      </footer>

    </div>
  );
};

export default Contact;
