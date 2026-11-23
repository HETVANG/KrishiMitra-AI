import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, Eye, Keyboard, Smartphone, MessageSquare, CheckCircle, HelpCircle } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Accessibility: React.FC = () => {
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
            <Eye size={12} /> Digital Inclusion & Universal Access
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Accessibility Statement
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 font-semibold uppercase tracking-wider">
            Conformance Target: Web Content Accessibility Guidelines (WCAG) 2.2 Level AA
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark-800 shadow-xs space-y-8 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          
          <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 flex items-start gap-3">
            <CheckCircle className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-brand-950 dark:text-brand-200">
              <span className="font-bold block mb-0.5">Commitment to All Farmers</span>
              {BRAND.name} is dedicated to ensuring that digital agricultural tools, AI crop diagnosis, mandi market intelligence, and weather bulletins are accessible to all agricultural producers, regardless of physical abilities, sensory impairments, technological literacy, or device constraints.
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Eye size={18} />
              <h2>1. Conformance Standards</h2>
            </div>
            <p>
              We measure our digital interfaces against the international <strong>Web Content Accessibility Guidelines (WCAG) 2.2 Level AA</strong> standard, established by the World Wide Web Consortium (W3C). Our engineering standards align with India&rsquo;s Rights of Persons with Disabilities Act, 2016 and the Guidelines for Indian Government Websites (GIGW 3.0) accessibility frameworks.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Keyboard size={18} />
              <h2>2. Technical Measures Implemented</h2>
            </div>
            <p>Our platform incorporates the following accessibility features across desktop and mobile browsers:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200 dark:border-dark-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Keyboard Navigation & Focus Control</span>
                <p className="text-slate-600 dark:text-dark-300">
                  All interactive controls, modals, tabs, and form elements are operable using standard keyboard navigation (<kbd className="font-mono bg-slate-200 dark:bg-dark-800 px-1 py-0.5 rounded">Tab</kbd>, <kbd className="font-mono bg-slate-200 dark:bg-dark-800 px-1 py-0.5 rounded">Enter</kbd>, <kbd className="font-mono bg-slate-200 dark:bg-dark-800 px-1 py-0.5 rounded">Esc</kbd>) with high-visibility focus indicator rings.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200 dark:border-dark-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Screen Reader Optimization</span>
                <p className="text-slate-600 dark:text-dark-300">
                  Semantic HTML5 elements (<code className="font-mono">&lt;header&gt;</code>, <code className="font-mono">&lt;main&gt;</code>, <code className="font-mono">&lt;nav&gt;</code>) and descriptive ARIA roles ensure assistive screen readers (TalkBack on Android, NVDA, JAWS) announce dynamic updates accurately.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200 dark:border-dark-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Color Contrast & Light/Dark Theme</span>
                <p className="text-slate-600 dark:text-dark-300">
                  Text colors achieve a minimum contrast ratio of 4.5:1 against backgrounds (3:1 for large typography). The application supports high-contrast dark mode to reduce eye strain in outdoor sunlight conditions.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200 dark:border-dark-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Text Resizing & Responsive Zoom</span>
                <p className="text-slate-600 dark:text-dark-300">
                  Users can scale browser typography up to 200% without horizontal scrollbars, text clipping, or broken layout structure.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200 dark:border-dark-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Descriptive Alt Text for Diagnostics</span>
                <p className="text-slate-600 dark:text-dark-300">
                  Uploaded plant pathology images and generated disease severity heatmaps are supplemented with explanatory textual descriptions for visually impaired users.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200 dark:border-dark-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Voice Search & Multi-Language Audio</span>
                <p className="text-slate-600 dark:text-dark-300">
                  Farmers who encounter text literacy barriers can tap the voice assistant microphone icon to speak inquiries in regional languages or listen to spoken advisory audio.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Smartphone size={18} />
              <h2>3. Supported Assistive Technologies</h2>
            </div>
            <p>The application is actively tested with:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li><strong>Android OS:</strong> Google TalkBack screen reader on modern Android smartphones and tablets.</li>
              <li><strong>Desktop Browsers:</strong> NVDA (NonVisual Desktop Access) on Firefox and Chrome; JAWS on Microsoft Edge.</li>
              <li><strong>Mobile Accessibility Services:</strong> Android Switch Access, Voice Access, and system-level font scaling up to 1.3x.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <HelpCircle size={18} />
              <h2>4. Known Limitations & Ongoing Improvements</h2>
            </div>
            <p>
              While we continuously audit and remediate accessibility issues, certain legacy or third-party components present ongoing challenges:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li><strong>Interactive Geo-spatial Maps:</strong> Complex GIS field polygon boundaries and interactive satellite vegetation NDVI overlays have limited native screen-reader narration. We provide fallback tabular lists showing exact coordinate boundaries, district names, and acreage metrics.</li>
              <li><strong>Third-Party Payment Gateway:</strong> The external Razorpay checkout dialog is maintained by Razorpay; we advocate with vendor partners for ongoing WCAG compliance improvements.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <MessageSquare size={18} />
              <h2>5. Feedback & Accessibility Support</h2>
            </div>
            <p>
              We welcome your feedback on the accessibility of {BRAND.name}. If you experience any barrier or need content in an alternative format, please reach out to our accessibility team:
            </p>
            <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-xl border border-slate-200 dark:border-dark-800 text-xs space-y-1">
              <div><strong>Accessibility Team Email:</strong> <span className="font-semibold text-slate-900 dark:text-white">[TO BE PROVIDED]</span></div>
              <div><strong>Phone / WhatsApp Helpline:</strong> <span className="font-semibold text-slate-900 dark:text-white">[TO BE PROVIDED]</span></div>
              <div><strong>Response SLA:</strong> We commit to acknowledging accessibility feedback within two (2) business days and working directly with you to resolve barriers.</div>
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

export default Accessibility;
