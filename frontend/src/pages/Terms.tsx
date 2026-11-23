import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, ShieldCheck, Scale, Cpu, HelpCircle } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Terms: React.FC = () => {
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
            <Scale size={12} /> Legal Agreement & Terms of Service
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 font-semibold uppercase tracking-wider">
            Effective Date: November 2026 | Last Updated: November 2026
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark-800 shadow-xs space-y-8 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <FileText size={18} />
              <h2>1. Agreement to Terms & Eligibility</h2>
            </div>
            <p>
              Welcome to <strong>{BRAND.name}</strong> (&ldquo;The Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (whether individually as a farmer, agricultural producer, enterprise agribusiness, or cooperative representative) and the operators of {BRAND.name}.
            </p>
            <p>
              By accessing, browsing, registering for, or using our web application or mobile application (available on Google Play Store as <code className="text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-dark-800 px-1.5 py-0.5 rounded font-mono">com.thekhedut.app</code>), you acknowledge that you have read, understood, and agree to be bound by these Terms and our <NavLink to="/privacy" className="text-brand-600 dark:text-brand-400 underline font-semibold">Privacy Policy</NavLink>. If you do not agree to these Terms, you must immediately discontinue use of the platform.
            </p>
            <p>
              You must be at least 18 years of age or possess legal parental/guardian consent to enter into this contract under Indian law.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <ShieldCheck size={18} />
              <h2>2. Account Registration, Credentials & User Responsibilities</h2>
            </div>
            <p>
              To access advanced agricultural advisory, crop health archives, farm ledger records, and mandi tracking notifications, you may be required to register an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Maintain and promptly update your account profile and agronomic parameters (e.g., district, state, land acreage).</li>
              <li>Safeguard your authentication credentials and password, not sharing access with unauthorized third parties.</li>
              <li>Notify us immediately at <span className="font-semibold text-slate-900 dark:text-white">[TO BE PROVIDED]</span> of any unauthorized account activity or security breach.</li>
              <li>Accept sole responsibility for all actions taken through your account until you notify us of a compromise.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Cpu size={18} />
              <h2>3. Acceptable Use Policy & Platform Conduct</h2>
            </div>
            <p>You agree not to use {BRAND.name} to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li>Violate any local, state, national, or international law, including the Information Technology Act, 2000 and Digital Personal Data Protection Act, 2023.</li>
              <li>Upload images, files, or data containing malware, destructive viruses, or non-agricultural inappropriate media.</li>
              <li>Scrape, reverse-engineer, decompile, crawl, or harvest mandi market pricing feeds, crop advisory models, or user databases using automated bots or scripts without explicit written consent.</li>
              <li>Circumvent or tamper with rate limits, authentication tokens, API gateways, or security controls.</li>
              <li>Impersonate any government agency, Mandi APMC officer, agricultural university scientist, or entity.</li>
            </ul>
          </section>

          {/* Section 4 - CRITICAL AGRICULTURAL ADVISORY DISCLAIMER */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-base border-b border-amber-200 dark:border-amber-900/50 pb-2">
              <AlertTriangle size={18} />
              <h2>4. Explicit Agricultural, AI & Meteorological Advisory Disclaimer</h2>
            </div>
            
            <div className="bg-amber-500/10 dark:bg-amber-500/5 border-l-4 border-amber-500 p-4 rounded-r-2xl space-y-2 text-amber-950 dark:text-amber-200 text-xs">
              <p className="font-bold uppercase tracking-wider text-[11px]">
                Critical Notice for All Agricultural Producers & Growers:
              </p>
              <p>
                <strong>Decision Support Tool Only:</strong> All artificial intelligence models, computer vision plant pathology diagnoses, Gemini AI Copilot answers, disease identification cards, chemical spray recommendations, and fertilizer dosage calculations provided by {BRAND.name} are designed exclusively for <em>informational and decision-support guidance</em>.
              </p>
              <p>
                <strong>Not Certified Agronomist Prescriptions:</strong> AI output does not constitute certified botanical, chemical, veterinary, financial, or agronomy prescriptions. Biological ecosystems, regional soil pH, microclimates, and pathogen strains vary significantly. <strong>You must independently verify all pesticide, fungicide, herbicide, and chemical fertilizer dosages with your local certified agricultural extension officer (Krishi Vigyan Kendra - KVK), state agriculture university, or government-licensed agronomist</strong> prior to application on your fields.
              </p>
              <p>
                <strong>Probabilistic Meteorological Alerts:</strong> Weather forecasts, spray advisory windows, and irrigation schedules are calculated using numerical weather prediction models (e.g., Open-Meteo). Atmospheric modeling is inherently probabilistic; we do not guarantee precipitation timing, hail protection, or storm accuracy.
              </p>
              <p>
                <strong>Indicative Mandi Market Prices:</strong> Market prices, arrivals, modal rates, and price trends displayed are compiled from public APMC feeds (data.gov.in / Agmarknet). They reflect indicative historical or intra-day market data and are not binding commercial quotations or buy/sell guarantees.
              </p>
              <p>
                <strong>Assumption of Risk:</strong> The farmer or agricultural operator assumes full responsibility and all financial, crop yield, and operational risks associated with implementing recommendations generated by the platform.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Scale size={18} />
              <h2>5. Intellectual Property Rights</h2>
            </div>
            <p>
              The platform, including software code, architecture, user interfaces, branding, visual design, machine learning algorithms, and proprietary datasets, is the exclusive intellectual property of {BRAND.name} and its licensors, protected under Indian and international copyright, trademark, and trade secret laws.
            </p>
            <p>
              <strong>User Content License:</strong> By uploading plant photos, farm logs, or field notes, you retain ownership of your content. You grant us a limited, worldwide, royalty-free license to process, store, and analyze such imagery strictly to return diagnostic results and refine machine learning models in accordance with our <NavLink to="/privacy" className="text-brand-600 dark:text-brand-400 underline font-semibold">Privacy Policy</NavLink>.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <FileText size={18} />
              <h2>6. Subscriptions, Payments & Billing Terms</h2>
            </div>
            <p>
              Certain advanced capabilities (such as unlimited deep plant pathology, multi-field satellite integration, and direct agronomist booking) are offered under premium subscription tiers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li><strong>Pricing & Taxes:</strong> All subscription fees are stated in Indian Rupees (INR) and are explicitly inclusive of applicable Goods and Services Tax (GST).</li>
              <li><strong>Payment Processing:</strong> Payments are processed through RBI-authorized payment aggregator Razorpay. We do not store complete debit/credit card numbers or UPI PINs on our servers.</li>
              <li><strong>Non-Recurring Manual Renewal:</strong> Unless explicitly opted in for auto-debit via NPCI e-mandate, subscriptions do not automatically debit your bank account. You will receive renewal alerts prior to expiration.</li>
              <li><strong>Cancellations & Refunds:</strong> Subscriptions are subject to our comprehensive <NavLink to="/refund-policy" className="text-brand-600 dark:text-brand-400 underline font-semibold">Cancellation & Refund Policy</NavLink>, which provides a 7-day initial money-back window for first-time subscriptions.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Cpu size={18} />
              <h2>7. Service Availability, Uptime & Modifications</h2>
            </div>
            <p>
              We strive to maintain continuous 24/7 service availability. However, we do not warrant that platform operations will be uninterrupted, error-free, or entirely free of downtime resulting from telecommunications outages, cloud infrastructure maintenance, or extreme weather disruptions affecting public data feeds.
            </p>
            <p>
              We reserve the right to improve, modify, suspend, or discontinue any feature, API endpoint, or data integration with reasonable notice.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <AlertTriangle size={18} />
              <h2>8. Limitation of Liability</h2>
            </div>
            <p>
              To the maximum extent permitted by applicable Indian law, {BRAND.name}, its directors, officers, employees, and technological affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li>Loss of crop yield, harvest damage, plant necrosis, or pesticide burn resulting from application of AI suggestions.</li>
              <li>Financial losses arising from Mandi price fluctuations or delayed agricultural sales.</li>
              <li>Unforeseen adverse weather events or failure of weather forecasting feeds.</li>
              <li>Unauthorized access to or alteration of your farm transmissions or data.</li>
            </ul>
            <p>
              In no event shall our total aggregate liability for all claims arising out of these Terms exceed the total subscription fees paid by you to {BRAND.name} in the six (6) months preceding the claim, or INR 1,000 (whichever is lower).
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <ShieldCheck size={18} />
              <h2>9. Account Suspension & Termination</h2>
            </div>
            <p>
              We reserve the right to suspend or terminate your account access immediately, without prior notice or liability, if you breach these Terms, engage in fraudulent payment activity, abuse platform APIs, or engage in abusive conduct toward our team or community members.
            </p>
            <p>
              You may terminate your account at any time by navigating to our dedicated <NavLink to="/data-deletion" className="text-brand-600 dark:text-brand-400 underline font-semibold">Account & Data Deletion Portal</NavLink>.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Scale size={18} />
              <h2>10. Dispute Resolution, Governing Law & Jurisdiction</h2>
            </div>
            <p>
              These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of the Republic of India.
            </p>
            <p>
              Any dispute, controversy, or claim arising out of or relating to these Terms shall first be resolved through good-faith mutual negotiations. In the event mutual resolution fails within thirty (30) days, the dispute shall be referred to arbitration conducted under the Arbitration and Conciliation Act, 1996 by a sole arbitrator mutually agreed upon. The seat and venue of arbitration shall be <span className="font-semibold text-slate-900 dark:text-white">[TO BE PROVIDED - CITY/STATE]</span>, India, and the proceedings shall be conducted in English or Hindi.
            </p>
            <p>
              Subject to arbitration, the courts situated in <span className="font-semibold text-slate-900 dark:text-white">[TO BE PROVIDED - CITY/STATE]</span>, India shall have exclusive jurisdiction over all legal proceedings.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <HelpCircle size={18} />
              <h2>11. Contact & Grievance Officer</h2>
            </div>
            <p>
              For legal inquiries, notices, or formal grievances concerning these Terms of Service, please contact our designated officer:
            </p>
            <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-xl border border-slate-200 dark:border-dark-800 text-xs space-y-1">
              <div><strong>Entity Name:</strong> [TO BE PROVIDED]</div>
              <div><strong>Registered Address:</strong> [TO BE PROVIDED]</div>
              <div><strong>Legal & Support Email:</strong> [TO BE PROVIDED]</div>
              <div><strong>Telephone Helpline:</strong> [TO BE PROVIDED]</div>
              <div><strong>Grievance Officer:</strong> [TO BE PROVIDED]</div>
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

export default Terms;
