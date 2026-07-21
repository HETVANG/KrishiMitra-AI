import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export const PaymentSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Payment Successful</h1>
        <p className="mt-3 text-sm text-slate-600">Your subscription has been activated. You can now access premium tools and billing history from your account.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/pricing" className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">View Plans</Link>
          <Link to="/subscription" className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700">My Subscription</Link>
        </div>
      </div>
    </div>
  );
};
export default PaymentSuccess;
