import React from 'react';
import { Link } from 'react-router-dom';
import { Clock3 } from 'lucide-react';

export const PaymentPending: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-amber-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Clock3 size={40} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Payment Pending</h1>
        <p className="mt-3 text-sm text-slate-600">Your payment is being processed. Please wait a moment while we confirm your subscription.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/subscription" className="rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white">Check Subscription</Link>
          <Link to="/" className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700">Back Home</Link>
        </div>
      </div>
    </div>
  );
};
export default PaymentPending;
