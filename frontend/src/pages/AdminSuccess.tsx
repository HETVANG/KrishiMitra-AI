import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Award,
  Sparkles,
  RefreshCw,
  BarChart3,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';

export const AdminSuccess: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRetentionAnalytics();
  }, []);

  const fetchRetentionAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/success/admin/analytics');
      if (res.data && res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err: any) {
      console.error('Failed to fetch admin retention analytics:', err);
      setError(err.response?.data?.message || 'Failed to load retention metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-sm text-red-600 font-semibold">{error || 'Failed to load metrics'}</p>
        <button
          onClick={fetchRetentionAnalytics}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  const feedback = metrics.feedbackSummary || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-wider">
              Admin Farmer Success & Retention Engine
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-2">
            Farmer Engagement & Outcome Analytics
          </h1>
          <p className="text-emerald-100 text-xs mt-1 font-medium">
            Measured active farmer retention, task completion rates & advisory feedback trends
          </p>
        </div>

        <button
          onClick={fetchRetentionAnalytics}
          className="self-start md:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>D1 Active Farmers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.activeFarmersD1}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Active past 24 hours</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>D7 Active Farmers</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.activeFarmersD7}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Active past 7 days</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Task Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.taskCompletionRate}%</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Completed farm activities</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Avg Completeness</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.avgCompletenessScore}%</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {metrics.milestonesAchieved} Milestones Unlocked
          </div>
        </div>
      </div>

      {/* Advisory Feedback Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-emerald-600" />
          Farmer Advisory Feedback Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
            <div className="text-emerald-800 dark:text-emerald-300 font-semibold">Helpful Advisories</div>
            <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200">{feedback.HELPFUL || 0}</div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
            <div className="text-amber-800 dark:text-amber-300 font-semibold">Not Helpful / Irrelevant</div>
            <div className="text-xl font-bold text-amber-900 dark:text-amber-200">{feedback.NOT_HELPFUL || 0}</div>
          </div>

          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 space-y-1">
            <div className="text-red-800 dark:text-red-300 font-semibold">Incorrect / Outdated</div>
            <div className="text-xl font-bold text-red-900 dark:text-red-200">{feedback.INCORRECT || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
