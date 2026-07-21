import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ReceiptText, CircleDollarSign } from 'lucide-react';

interface PaymentItem {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  mode: string;
  createdAt: string;
  planName: string;
}

export const BillingHistory: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/payments/history');
        if (res.data?.success) {
          setPayments(res.data.payments || []);
        }
      } catch (err) {
        console.error('Unable to load billing history', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-3xl bg-gradient-to-r from-slate-800 to-slate-950 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold">Billing History</h1>
        <p className="mt-2 text-sm text-slate-300">Review all recent payment activity and plan transitions.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Loading billing records...</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-slate-500">No billing history yet.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <ReceiptText size={16} className="text-brand-600" /> {payment.planName}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Order: {payment.orderId}</p>
                </div>
                <div className="text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign size={16} /> {payment.amount} {payment.currency}
                  </div>
                  <div className="mt-1">{payment.status} • {payment.provider} • {payment.mode}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default BillingHistory;
