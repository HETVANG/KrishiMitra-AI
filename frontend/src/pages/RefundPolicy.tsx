import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, RotateCcw, CheckCircle, AlertCircle, Clock, CreditCard, HelpCircle } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const RefundPolicy: React.FC = () => {
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
            <RotateCcw size={12} /> Customer Trust & Transparency
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Cancellation & Refund Policy
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 font-semibold uppercase tracking-wider">
            Effective Date: November 2026 | Last Updated: November 2026
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark-800 shadow-xs space-y-8 text-xs md:text-sm text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
          
          <div className="bg-brand-50/60 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 p-4 rounded-2xl flex items-start gap-3">
            <CheckCircle className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-brand-950 dark:text-brand-200">
              <span className="font-bold">Our Farmer First Guarantee:</span> At {BRAND.name}, we believe in honest and transparent service for the agricultural community. If our premium features do not meet your farming needs, you can claim a 100% full refund within the first 7 days of your initial subscription activation.
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Clock size={18} />
              <h2>1. 7-Day Refund Eligibility Window</h2>
            </div>
            <p>
              We provide a hassle-free 7-day money-back guarantee for first-time premium subscribers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li><strong>Eligible Window:</strong> Refund requests submitted within seven (7) calendar days from the initial payment date and time will be eligible for a 100% full refund of the subscription fee paid.</li>
              <li><strong>No Penalty:</strong> No cancellation charges or administrative penalty fees will be deducted.</li>
              <li><strong>Applicability:</strong> Applicable to first-time purchases of monthly, seasonal, or annual premium plans.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <AlertCircle size={18} />
              <h2>2. Non-Refundable Scenarios</h2>
            </div>
            <p>Refunds cannot be granted under the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li><strong>Requests beyond 7 Days:</strong> Refund requests submitted after 7 calendar days from the initial transaction date.</li>
              <li><strong>Completed Expert Consultations:</strong> Direct 1-on-1 scheduled sessions with certified agronomists or crop specialists that have already occurred.</li>
              <li><strong>Third-Party Soil Laboratory Testing:</strong> Physical soil or leaf sample testing fees paid to third-party testing laboratories once sample collection or laboratory analysis has commenced.</li>
              <li><strong>Fraudulent or Abusive Activity:</strong> Accounts flagged for terms of service violations, API scraping, unauthorized credential sharing, or repeat payment abuse.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <CreditCard size={18} />
              <h2>3. Duplicate & Failed Transactions</h2>
            </div>
            <p>We actively monitor and resolve payment gateway discrepancies:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li><strong>Duplicate Charges:</strong> If your bank account or UPI handle was debited more than once for a single subscription plan due to network drop or multiple clicks, the duplicate charge will be automatically identified and refunded within 24 to 48 hours. If you do not see the reversal, contact support with both payment transaction IDs.</li>
              <li><strong>Failed Transactions (Amount Debited, Plan Not Activated):</strong> If funds were deducted from your bank or UPI application, but our app displayed a payment failure or did not upgrade your account, the amount is held by the banking network and will be automatically refunded by your issuing bank within 3 to 5 business days per Reserve Bank of India (RBI) guidelines.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <RotateCcw size={18} />
              <h2>4. Subscription Cancellation Procedure</h2>
            </div>
            <p>
              You have complete freedom to cancel your subscription renewal at any time:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600 dark:text-dark-300">
              <li>Log into your account on the web or mobile app.</li>
              <li>Navigate to <strong>Settings &rarr; Subscription & Billing</strong>.</li>
              <li>Click <strong>Cancel Subscription Renewal</strong> and confirm.</li>
            </ol>
            <p>
              Upon cancellation, your premium privileges will remain active until the conclusion of your current paid billing period. After this date, your account will smoothly revert to the standard free tier with no recurring charges.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <Clock size={18} />
              <h2>5. Refund Processing Timeline & Method</h2>
            </div>
            <p>
              All approved refunds are credited directly back to the <strong>original payment method</strong> used during checkout (UPI VPA, NetBanking account, Debit Card, or Credit Card) via our authorized payment partner, Razorpay:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-800">
                <span className="font-bold text-slate-900 dark:text-white block">UPI / NetBanking:</span>
                <span className="text-slate-500 dark:text-dark-400">Usually processed within 2 to 4 business days.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-800">
                <span className="font-bold text-slate-900 dark:text-white block">Debit / Credit Cards:</span>
                <span className="text-slate-500 dark:text-dark-400">Typically reflected in 5 to 7 business days depending on your bank.</span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-base border-b border-slate-100 dark:border-dark-800 pb-2">
              <HelpCircle size={18} />
              <h2>6. How to Submit a Refund Request</h2>
            </div>
            <p>
              To submit a refund claim, please email our support team with the subject line <strong>&ldquo;Refund Request - [Your Phone / Email]&rdquo;</strong>:
            </p>
            <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-xl border border-slate-200 dark:border-dark-800 text-xs space-y-1">
              <div><strong>Support Email:</strong> <span className="font-semibold text-slate-900 dark:text-white">[TO BE PROVIDED]</span></div>
              <div><strong>Helpline Phone:</strong> <span className="font-semibold text-slate-900 dark:text-white">[TO BE PROVIDED]</span></div>
              <div><strong>Required Details to Include:</strong></div>
              <ul className="list-disc pl-5 pt-1 space-y-0.5 text-slate-600 dark:text-dark-300">
                <li>Your registered phone number or email address.</li>
                <li>Razorpay Payment ID (starts with <code className="font-mono text-brand-600 dark:text-brand-400">pay_...</code>).</li>
                <li>Date and exact amount paid.</li>
                <li>Brief reason for cancellation to help us improve our services.</li>
              </ul>
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

export default RefundPolicy;
