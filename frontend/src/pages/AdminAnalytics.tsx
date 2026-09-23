import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BarChart3, Activity, AlertTriangle, RefreshCw, MessageSquare, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';

export interface UsageMetric {
  feature: string;
  totalEvents: number;
  uniqueUsers: number;
  completionRatePercent: number;
  errorCount: number;
}

export interface ProductInsight {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  affectedFeature: string;
  suggestedAction: string;
}

export interface FeedbackQueueItem {
  _id: string;
  feature: string;
  type: string;
  rating?: number;
  message: string;
  status: string;
  aiClassification?: {
    category: string;
    reasoning?: string;
  };
  createdAt: string;
}

export const AdminAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<UsageMetric[]>([]);
  const [insights, setInsights] = useState<ProductInsight[]>([]);
  const [feedbackQueue, setFeedbackQueue] = useState<FeedbackQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState<number>(30);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/product-intelligence/admin/analytics?days=${periodDays}`);
      if (res.data && res.data.success) {
        setMetrics(res.data.usageMetrics || []);
        setInsights(res.data.insights || []);
        setFeedbackQueue(res.data.feedbackQueue || []);
      }
    } catch (err) {
      console.warn('[AdminAnalytics] Fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [periodDays]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> Measured Telemetry & Feedback
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-dark-100">
            Product Intelligence & Farmer Signals
          </h1>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
            Real feature usage, workflow completion rates, user feedback queues, and data accuracy signals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={periodDays}
            onChange={e => setPeriodDays(Number(e.target.value))}
            className="px-3 py-2 bg-gray-100 dark:bg-dark-800 border rounded-2xl text-xs font-bold text-gray-700 dark:text-dark-200"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Feature Usage Overview */}
      <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-gray-900 dark:text-dark-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-500" /> Measured Feature Usage Telemetry
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map(m => (
              <div key={m.feature} className="p-4 bg-gray-50 dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 space-y-2">
                <span className="text-xs font-extrabold text-gray-800 dark:text-dark-200 block">{m.feature}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-brand-600 dark:text-brand-400">{m.totalEvents}</span>
                  <span className="text-[10px] font-bold text-gray-500">{m.uniqueUsers} Users</span>
                </div>
                <div className="pt-2 border-t border-gray-200/50 dark:border-dark-700 flex justify-between text-[10px] font-bold">
                  <span className="text-emerald-600">Completion: {m.completionRatePercent}%</span>
                  <span className="text-rose-500">Errors: {m.errorCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actionable Insights */}
      {insights.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-3xl p-6 space-y-3">
          <h3 className="text-base font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Actionable Product Intelligence Signals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map(i => (
              <div key={i.id} className="bg-white dark:bg-dark-900 p-4 rounded-2xl border border-amber-150 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-amber-800 dark:text-amber-400">{i.title}</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black rounded-full uppercase">{i.severity}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-dark-300">{i.description}</p>
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 block pt-1">
                  Suggested Action: {i.suggestedAction}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Queue */}
      <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-gray-900 dark:text-dark-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-500" /> Farmer Feedback Queue
        </h3>

        {feedbackQueue.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">No farmer feedback entries recorded in the queue.</p>
        ) : (
          <div className="space-y-3">
            {feedbackQueue.slice(0, 10).map(item => (
              <div key={item._id} className="p-4 bg-gray-50 dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-brand-100 text-brand-800 dark:bg-brand-950/40 dark:text-brand-300 font-extrabold text-[10px] rounded-full uppercase">
                      {item.feature}
                    </span>
                    <span className="px-2.5 py-0.5 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-dark-300 font-bold text-[10px] rounded-full">
                      {item.type}
                    </span>
                    {item.aiClassification?.category && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-extrabold rounded-full">
                        AI Tag: {item.aiClassification.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-800 dark:text-dark-200">
                    "{item.message}"
                  </p>
                </div>

                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
