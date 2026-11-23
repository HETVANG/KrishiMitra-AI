import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, Cookie, Shield, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const CookiePolicy: React.FC = () => {
  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('km_open_cookie_settings'));
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-100/80 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300">
            <Cookie size={12} /> Cookie & Storage Transparency
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Cookie & Local Storage Policy
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 font-semibold uppercase tracking-wider">
            Effective Date: November 2026 | Last Updated: November 2026
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark-800 shadow-xs space-y-8 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Manage Your Preferences Anytime</h3>
              <p className="text-xs text-slate-600 dark:text-dark-300 mt-0.5">
                Customize which non-essential cookies and analytics scripts are active on your device.
              </p>
            </div>
            <button
              onClick={openCookiePreferences}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 cursor-pointer"
            >
              <Sliders size={14} /> Open Cookie Settings
            </button>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Cookie size={18} />
              <h2>1. What are Cookies and Local Storage?</h2>
            </div>
            <p>
              Cookies are small data files deposited on your browser or device when you visit web applications. Local Storage and IndexedDB are modern web standards that allow applications to safely store structured client data locally on your device.
            </p>
            <p>
              At {BRAND.name}, we use local storage and privacy-conscious cookies to maintain secure sessions, remember your regional language preferences (such as Hindi, Gujarati, Marathi, or English), enable offline agricultural tools, and analyze application performance only with your consent.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Shield size={18} />
              <h2>2. Categories of Storage We Use</h2>
            </div>

            <div className="space-y-4">
              {/* Category A */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-850/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" /> A. Strictly Necessary & Essential Storage
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Always Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-dark-300">
                  These storage keys are strictly required for the core security, navigation, and operation of {BRAND.name}. Without them, login authentication, CSRF security verification, and basic session management cannot function. They cannot be turned off.
                </p>
                <div className="overflow-x-auto text-[11px]">
                  <table className="w-full border-collapse mt-2">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-300 font-bold">
                        <th className="py-1.5 px-2 text-left">Key / Cookie Name</th>
                        <th className="py-1.5 px-2 text-left">Purpose</th>
                        <th className="py-1.5 px-2 text-left">Retention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-brand-600 dark:text-brand-400">thekhedut_token</td>
                        <td className="py-1.5 px-2">Stores encrypted JWT authentication session token</td>
                        <td className="py-1.5 px-2">30 Days / Until Logout</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-brand-600 dark:text-brand-400">km_cookie_consent</td>
                        <td className="py-1.5 px-2">Records user cookie choices and timestamp</td>
                        <td className="py-1.5 px-2">12 Months</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-brand-600 dark:text-brand-400">i18nextLng</td>
                        <td className="py-1.5 px-2">Remembers selected agricultural language (hi, gu, mr, en)</td>
                        <td className="py-1.5 px-2">Persistent</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-brand-600 dark:text-brand-400">theme</td>
                        <td className="py-1.5 px-2">Stores high-contrast or dark mode display preference</td>
                        <td className="py-1.5 px-2">Persistent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category B */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-850/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-blue-600" /> B. Functional & Agronomic Offline Storage
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    Functional
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-dark-300">
                  Enables offline-first features crucial for rural areas with intermittent connectivity, such as cached Mandi price lists, offline disease symptoms, and local farm coordinates.
                </p>
                <div className="overflow-x-auto text-[11px]">
                  <table className="w-full border-collapse mt-2">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-300 font-bold">
                        <th className="py-1.5 px-2 text-left">Key / Cookie Name</th>
                        <th className="py-1.5 px-2 text-left">Purpose</th>
                        <th className="py-1.5 px-2 text-left">Retention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-brand-600 dark:text-brand-400">km_mandi_cache_*</td>
                        <td className="py-1.5 px-2">Caches recent Mandi market prices for fast offline viewing</td>
                        <td className="py-1.5 px-2">6 Hours</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-brand-600 dark:text-brand-400">km_weather_cache</td>
                        <td className="py-1.5 px-2">Stores last fetched weather forecast to conserve mobile bandwidth</td>
                        <td className="py-1.5 px-2">2 Hours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category C */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-850/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <AlertCircle size={16} className="text-purple-600" /> C. Analytics & Performance Cookies
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                    Opt-in Only (Default OFF)
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-dark-300">
                  These optional scripts (Google Analytics 4 and Microsoft Clarity) help us understand aggregated application usage, diagnose UI errors, and optimize response times. They are <strong>never loaded</strong> until you explicitly click &ldquo;Accept All&rdquo; or toggle Analytics on in Cookie Settings.
                </p>
                <div className="overflow-x-auto text-[11px]">
                  <table className="w-full border-collapse mt-2">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-300 font-bold">
                        <th className="py-1.5 px-2 text-left">Provider / Cookie</th>
                        <th className="py-1.5 px-2 text-left">Purpose</th>
                        <th className="py-1.5 px-2 text-left">Retention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-brand-600 dark:text-brand-400">_ga, _ga_*</td>
                        <td className="py-1.5 px-2">Google Analytics anonymous user session metrics</td>
                        <td className="py-1.5 px-2">24 Months</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-brand-600 dark:text-brand-400">_clck, _clsk</td>
                        <td className="py-1.5 px-2">Microsoft Clarity aggregated heatmap & navigation telemetry</td>
                        <td className="py-1.5 px-2">12 Months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Sliders size={18} />
              <h2>3. How to Manage and Disable Cookies</h2>
            </div>
            <p>You have full authority over cookie and local storage preferences:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li>
                <strong>In-App Controls:</strong> You can modify or withdraw your consent at any time by clicking the &ldquo;Cookie Settings&rdquo; link found in our website footer or by visiting <NavLink to="/cookie-settings" className="text-brand-600 dark:text-brand-400 underline font-semibold">/cookie-settings</NavLink>.
              </li>
              <li>
                <strong>Browser Settings:</strong> Most browsers (Chrome, Edge, Firefox, Safari) allow you to block cookies or clear local storage through their settings menu under <em>Privacy and Security &rarr; Cookies and other site data</em>.
              </li>
              <li>
                <strong>Impact of Blocking:</strong> Disabling strictly necessary storage may prevent you from logging in, maintaining an active session, or using personalized agricultural diagnostics.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <AlertCircle size={18} />
              <h2>4. Inquiries & Data Privacy Officer</h2>
            </div>
            <p>
              If you have any questions regarding our storage practices or require assistance managing your privacy preferences, contact our team:
            </p>
            <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-xl border border-slate-200 dark:border-dark-800 text-xs space-y-1">
              <div><strong>Email:</strong> <span className="font-semibold text-slate-900 dark:text-white">[TO BE PROVIDED]</span></div>
              <div><strong>Helpline:</strong> <span className="font-semibold text-slate-900 dark:text-white">[TO BE PROVIDED]</span></div>
              <div><strong>Privacy Policy:</strong> <NavLink to="/privacy" className="text-brand-600 dark:text-brand-400 underline">Read our Complete Privacy Policy</NavLink></div>
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

export default CookiePolicy;
