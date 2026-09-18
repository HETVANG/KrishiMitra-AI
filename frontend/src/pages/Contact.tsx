import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, ArrowLeft, Mail, MapPin, Send, MessageSquare } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setFormData({ name: '', email: '', message: '' });
        alert('Thank you! Your message has been sent to support@krishimitra.ai.');
      }, 1000);
    }
  };

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
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-dark-900 p-6 rounded-3xl border border-slate-100 dark:border-dark-800/50 shadow-sm space-y-6 text-left">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Contact Support</h2>
          <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
            Have questions about your subscription, technical issues, or agricultural AI tools? Reach out to our support agronomy desk.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 text-xs">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-655 rounded-lg shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <span className="font-bold block text-slate-400 uppercase text-[9px]">Email Address</span>
                <span className="font-semibold text-slate-700 dark:text-dark-200">support@krishimitra.ai</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="p-2 bg-brand-50 dark:bg-brand-950/20 text-brand-605 rounded-lg shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <span className="font-bold block text-slate-400 uppercase text-[9px]">Innovation Office</span>
                <span className="font-semibold text-slate-700 dark:text-dark-200">Sector 62, Noida, UP, India</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-lg shrink-0">
                <MessageSquare size={16} />
              </div>
              <div>
                <span className="font-bold block text-slate-400 uppercase text-[9px]">Response Window</span>
                <span className="font-semibold text-slate-700 dark:text-dark-200">Typically under 24 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="md:col-span-7 bg-white dark:bg-dark-900 p-6 rounded-3xl border border-slate-100 dark:border-dark-800/50 shadow-sm text-left">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-white mb-4">Send a Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="custom-input text-xs"
                placeholder="Name"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="custom-input text-xs"
                placeholder="Email Address"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Message / Query</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="custom-input text-xs"
                placeholder="Enter details here..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={sent}
              className="btn-primary w-full py-3.5 text-xs font-bold shadow-md shadow-brand-600/10 min-h-[40px]"
            >
              <Send size={14} /> {sent ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-6 text-center text-[10px] border-t border-slate-800">
        &copy; 2026 KrishiMitra AI. Empowering the Indian Farming Community.
      </footer>

    </div>
  );
};
export default Contact;
