import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Share2, Trash2, UserCheck, AlertCircle } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Privacy: React.FC = () => {
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
            <Shield size={12} /> Privacy & Data Protection Policy
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 font-semibold uppercase tracking-wider">
            Effective Date: November 2026 | Compliant with DPDP Act 2023 (India) & Global Privacy Standards
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark-800 shadow-xs space-y-8 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Database size={18} />
              <h2>1. Information We Collect</h2>
            </div>
            <p>
              We adhere strictly to the principle of <strong>data minimization</strong>. We collect only personal data necessary to deliver agricultural intelligence, crop disease pathology, hyper-local weather alerts, and localized mandi market prices:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li><strong>Account Credentials:</strong> Name, email address, password hash, and optional telephone number when registering an account.</li>
              <li><strong>Geographic Location Coordinates:</strong> Device GPS coordinates (coarse and fine, upon explicit runtime consent) or farmer-selected district/state to calculate local APMC mandi distances and deliver hyper-local meteorological forecasts.</li>
              <li><strong>Crop & Agronomic Data:</strong> Sowing dates, crop cycle stages, soil test NPK values, acreage, and farm field polygon boundaries created by the farmer.</li>
              <li><strong>Crop Health Images:</strong> Leaf and plant foliage photographs uploaded or captured via device camera for computer-vision disease diagnosis.</li>
              <li><strong>Voice Assistant Input:</strong> Transient audio snippets recorded only when the farmer activates the microphone button for natural language search queries.</li>
              <li><strong>Billing & Transaction Identifiers:</strong> Razorpay transaction IDs, subscription tier, and invoice records. We do not store credit/debit card numbers, CVVs, or net banking passwords.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Eye size={18} />
              <h2>2. Purpose of Data Collection</h2>
            </div>
            <p>Your information is processed strictly for legitimate agricultural service delivery purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li>Diagnosing crop diseases and recommending biological and chemical treatments based on verified scientific agronomic practices.</li>
              <li>Delivering accurate weather forecasts, precipitation probabilities, and extreme climate advisories for your immediate locality.</li>
              <li>Filtering nearest APMC mandis to provide transparent crop market prices and eliminate distant market contamination.</li>
              <li>Calculating optimal irrigation schedules based on soil evapotranspiration and field characteristics.</li>
              <li>Managing authentication, subscription validity, and customer support inquiries.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Share2 size={18} />
              <h2>3. Third-Party Service Providers</h2>
            </div>
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal information or farm records to commercial advertisers or data brokers. Data is shared solely with trusted technical service providers necessary to operate the platform:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left border border-slate-200 dark:border-dark-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-dark-850 font-bold text-slate-700 dark:text-dark-200">
                  <tr>
                    <th className="p-2.5">Provider</th>
                    <th className="p-2.5">Data Shared</th>
                    <th className="p-2.5">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                  <tr>
                    <td className="p-2.5 font-bold">Google Gemini AI</td>
                    <td className="p-2.5">Crop leaf images & text queries</td>
                    <td className="p-2.5">AI crop disease diagnosis & agronomic copilot advice</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Razorpay</td>
                    <td className="p-2.5">Order amount, email, phone</td>
                    <td className="p-2.5">PCI-DSS compliant subscription billing & UPI checkout</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Cloudinary</td>
                    <td className="p-2.5">Uploaded leaf diagnostic images</td>
                    <td className="p-2.5">Secure CDN media storage for crop diagnostic records</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Open-Meteo & Meteorological APIs</td>
                    <td className="p-2.5">Latitude and longitude</td>
                    <td className="p-2.5">Localized temperature, rain forecast & humidity</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">MongoDB Atlas</td>
                    <td className="p-2.5">Encrypted application database</td>
                    <td className="p-2.5">Encrypted cloud data storage with automated backups</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Lock size={18} />
              <h2>4. Storage, Security & Data Protection</h2>
            </div>
            <p>
              We implement comprehensive technical and organizational safeguards to protect your personal data from unauthorized access, alteration, disclosure, or destruction:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li><strong>Encryption in Transit:</strong> All communication between your device and our servers is encrypted using modern TLS (HTTPS) protocols with HSTS enforcement.</li>
              <li><strong>Password Hashing:</strong> Passwords are cryptographically salted and hashed using bcrypt before storage. Plaintext passwords are never stored or logged.</li>
              <li><strong>NoSQL Injection Defense:</strong> All incoming requests are filtered to strip malicious database operators.</li>
              <li><strong>Tiered Rate Limiting:</strong> Endpoints are protected by rate limiters to prevent brute-force attacks and abuse.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <UserCheck size={18} />
              <h2>5. Your Privacy Rights (DPDP Act 2023)</h2>
            </div>
            <p>Under the Digital Personal Data Protection Act, 2023 (India) and international privacy frameworks, you possess the following rights:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li><strong>Right to Access:</strong> You can review your profile information, farm boundaries, and diagnostic history directly in your dashboard settings.</li>
              <li><strong>Right to Correction:</strong> You can modify or update inaccurate personal details at any time in your Settings.</li>
              <li><strong>Right to Erasure / Deletion:</strong> You have the right to request deletion of your account and personal data.</li>
              <li><strong>Right to Withdraw Consent:</strong> You can revoke location, camera, or microphone permissions via your device settings, and revoke cookie consent via our Cookie Preferences.</li>
              <li><strong>Right of Grievance Redressal:</strong> You can contact our Grievance Officer regarding any data protection concerns.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Trash2 size={18} />
              <h2>6. Data Deletion Procedure & Retention</h2>
            </div>
            <p>
              You can request permanent deletion of your account and associated personal data at any time through our dedicated{' '}
              <NavLink to="/data-deletion" className="text-brand-600 dark:text-brand-400 font-bold underline hover:text-brand-700">
                Data Deletion Request Page
              </NavLink>{' '}
              or from the Danger Zone section in your Account Settings.
            </p>
            <p className="text-xs text-slate-500 dark:text-dark-400">
              <strong>Statutory Retention Exception:</strong> While user profile records, crop photos, and chat history are permanently erased, financial transaction invoices and GST billing records are retained for statutory accounting periods as mandated by Indian tax legislation.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <AlertCircle size={18} />
              <h2>7. Children's Privacy</h2>
            </div>
            <p>
              The Khedut is a professional agricultural management platform designed for adult farm operators and agribusiness professionals. The platform is not directed toward children under 18 years of age. We do not knowingly collect personal data from minors. If you believe a minor has registered without parental consent, please contact our Grievance Officer for prompt removal.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 bg-slate-50 dark:bg-dark-850 p-5 rounded-2xl border border-slate-200/70 dark:border-dark-800">
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">8. Business Identity & Grievance Redressal</h2>
            <p className="text-xs text-slate-500 dark:text-dark-400">
              In accordance with the Information Technology Act 2000 and the DPDP Act 2023, the details of the Grievance Officer and Data Fiduciary are set forth below:
            </p>
            <div className="text-xs space-y-1 font-mono text-slate-700 dark:text-dark-200 pt-1">
              <div><strong>Legal Business Name:</strong> [TO BE PROVIDED]</div>
              <div><strong>Registered Address:</strong> [TO BE PROVIDED]</div>
              <div><strong>Support Email:</strong> [TO BE PROVIDED]</div>
              <div><strong>Contact Phone:</strong> [TO BE PROVIDED]</div>
              <div><strong>Grievance Officer:</strong> [TO BE PROVIDED]</div>
              <div><strong>Grievance Email:</strong> [TO BE PROVIDED]</div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-[10px] border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>{BRAND.copyright}</span>
          <div className="flex gap-4">
            <NavLink to="/terms" className="hover:text-white transition-colors">Terms of Service</NavLink>
            <NavLink to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</NavLink>
            <NavLink to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</NavLink>
            <NavLink to="/data-deletion" className="hover:text-white transition-colors">Data Deletion</NavLink>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Privacy;
