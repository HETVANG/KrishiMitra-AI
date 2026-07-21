import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export const PaymentFailed: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <XCircle size={40} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Payment Failed</h1>
        <p className="mt-3 text-sm text-slate-600">The payment could not be completed. Please try again or choose a different payment method.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/pricing" className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white">Try Again</Link>
          <Link to="/" className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700">Back Home</Link>
        </div>
      </div>
    </div>
  );
};
export default PaymentFailed;
