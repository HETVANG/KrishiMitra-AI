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
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});

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

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      setDownloadingIds((prev) => ({ ...prev, [paymentId]: true }));
      
      // Call backend to fetch invoice file as blob
      const response = await api.get(`/billing/${paymentId}/invoice`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const paymentItem = payments.find((p) => p._id === paymentId);
      const invSerial = paymentId.slice(-6).toUpperCase();
      const invYear = paymentItem ? new Date(paymentItem.createdAt).getFullYear() : new Date().getFullYear();
      link.setAttribute('download', `KrishiMitra_Invoice_KM-INV-${invYear}-${invSerial}.pdf`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Invoice download failed', err);
      alert('Failed to generate or download the invoice. Please try again.');
    } finally {
      setDownloadingIds((prev) => ({ ...prev, [paymentId]: false }));
    }
  };

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
                    <ReceiptText size={16} className="text-brand-650" /> {payment.planName}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Order: {payment.orderId}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-left sm:text-right">
                  <div className="text-sm text-slate-600">
                    <div className="flex items-center gap-2 sm:justify-end">
                      <CircleDollarSign size={16} /> {payment.amount} {payment.currency}
                    </div>
                    <div className="mt-1">{payment.status} • {payment.provider} • {payment.mode}</div>
                  </div>
                  {payment.status === 'succeeded' && (
                    <button
                      onClick={() => handleDownloadInvoice(payment._id)}
                      disabled={downloadingIds[payment._id]}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 rounded-xl transition-all shadow-sm h-8"
                    >
                      {downloadingIds[payment._id] ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <ReceiptText size={14} />
                          <span>Download Invoice</span>
                        </>
                      )}
                    </button>
                  )}
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
