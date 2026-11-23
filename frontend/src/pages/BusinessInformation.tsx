import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Mail, Phone, Clock, ShieldCheck, FileCheck, UserCheck } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const BusinessInformation: React.FC = () => {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-100/80 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300">
            <Building2 size={12} /> Corporate Transparency & Compliance
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Business Information
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 font-semibold uppercase tracking-wider">
            Statutory Transparency Disclosure under Rule 3(1) of Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 & Consumer Protection (E-Commerce) Rules, 2020
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark-800 shadow-xs space-y-8 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-800 flex items-start gap-3">
            <ShieldCheck className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" size={20} />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Verified Corporate Identity Notice</span>
              This page provides complete corporate, regulatory, and contact details for {BRAND.name}. Official registration filings and tax records are maintained in compliance with Government of India statutory mandates.
            </div>
          </div>

          {/* Section 1: Entity Profile */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Building2 size={18} />
              <h2>1. Commercial Entity & Brand Details</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-dark-400 block uppercase">Trade / Brand Name</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{BRAND.name} (KrishiMitra AI)</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-dark-400 block uppercase">Legal Business Entity Name</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  [TO BE PROVIDED]
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-dark-400 block uppercase">Business Constitution</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  [TO BE PROVIDED]
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-dark-400 block uppercase">Corporate Identity No. (CIN) / Registration</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  [TO BE PROVIDED]
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-dark-400 block uppercase">Goods & Services Tax (GSTIN)</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  [TO BE PROVIDED]
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-dark-400 block uppercase">MSME Udyam Registration</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  [TO BE PROVIDED]
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: Addresses */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <MapPin size={18} />
              <h2>2. Registered & Operating Addresses</h2>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block text-xs">Registered Corporate Office</span>
                <p className="font-mono text-xs text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 p-2 rounded-lg inline-block border border-amber-200 dark:border-amber-900">
                  [TO BE PROVIDED - OFFICIAL REGISTERED ADDRESS]
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block text-xs">Operating Agricultural Tech Lab & Support Center</span>
                <p className="font-mono text-xs text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 p-2 rounded-lg inline-block border border-amber-200 dark:border-amber-900">
                  [TO BE PROVIDED - OPERATING ADDRESS]
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Contact & Support */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Phone size={18} />
              <h2>3. Official Contact Channels & Operational Hours</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                  <Mail size={14} className="text-brand-600" /> Official Email
                </div>
                <span className="inline-block font-mono text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  [TO BE PROVIDED]
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                  <Phone size={14} className="text-brand-600" /> Phone Helpline
                </div>
                <span className="inline-block font-mono text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  [TO BE PROVIDED]
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                  <Clock size={14} className="text-brand-600" /> Support Hours
                </div>
                <span className="inline-block font-mono text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  [TO BE PROVIDED]
                </span>
              </div>
            </div>
          </section>

          {/* Section 4: Grievance Officer */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <UserCheck size={18} />
              <h2>4. Statutory Grievance Redressal Officer</h2>
            </div>
            <p>
              In accordance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, the contact details of the designated Grievance Officer are published below:
            </p>
            <div className="p-4 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/80 dark:border-dark-800 text-xs space-y-1.5">
              <div><strong>Officer Name:</strong> <span className="font-mono text-amber-800 dark:text-amber-300 font-semibold">[TO BE PROVIDED]</span></div>
              <div><strong>Designation:</strong> <span className="font-mono text-amber-800 dark:text-amber-300 font-semibold">[TO BE PROVIDED]</span></div>
              <div><strong>Email Address:</strong> <span className="font-mono text-amber-800 dark:text-amber-300 font-semibold">[TO BE PROVIDED]</span></div>
              <div><strong>Postal Address:</strong> <span className="font-mono text-amber-800 dark:text-amber-300 font-semibold">[TO BE PROVIDED]</span></div>
              <div><strong>Response SLA:</strong> Grievance acknowledgment within 24 hours; resolution within fifteen (15) working days.</div>
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

export default BusinessInformation;
