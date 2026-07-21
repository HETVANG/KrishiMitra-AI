import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CalendarDays, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';

interface SubscriptionHistoryItem {
  _id: string;
  planName: string;
  billingCycle: string;
  status: string;
  startDate: string;
  endDate?: string;
  provider: string;
  notes?: string;
}

export const Subscription: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/payments/history');
        if (res.data?.success) {
          setHistory(res.data.subscriptionHistory || []);
        }
      } catch (err) {
        console.error('Unable to load subscription history', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-3xl bg-gradient-to-r from-brand-700 to-brand-900 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold">My Subscription</h1>
        <p className="mt-2 text-sm text-brand-100">Track your current plan, renewal window, and payment activity in one place.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current plan</p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-900">{user?.plan?.toUpperCase() || 'FREE'}</h2>
              <p className="mt-2 text-sm text-slate-600">Status: {user?.subscriptionStatus || 'trialing'}</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <CalendarDays size={16} /> Renewal window
            </div>
            <p className="mt-2">{user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'No active renewal yet'}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CreditCard size={16} /> Billing access
          </div>
          <p className="mt-3 text-sm text-slate-600">Upgrade to a paid plan whenever you want. In mock mode, payments are simulated and subscriptions are activated immediately.</p>
          <a href="/pricing" className="mt-5 inline-flex rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white">Manage plan</a>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-extrabold text-slate-900">Subscription history</h3>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No subscription activity recorded yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {history.map((item) => (
              <div key={item._id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <CheckCircle2 size={16} className="text-emerald-500" /> {item.planName} • {item.billingCycle}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.notes || 'Subscription record created.'}</p>
                </div>
                <div className="text-sm text-slate-500">
                  <div>{new Date(item.startDate).toLocaleDateString()}</div>
                  <div>{item.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Subscription;
