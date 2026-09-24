import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  TrendingUp,
  Users,
  Share2,
  Award,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const AdminGrowth: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGrowthAnalytics();
  }, []);

  const fetchGrowthAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/growth/admin/analytics');
      if (res.data && res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err: any) {
      console.error('Failed to fetch admin growth analytics:', err);
      setError(err.response?.data?.message || 'Failed to load growth analytics');
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
        <p className="text-sm text-red-600 font-semibold">{error || 'Failed to load growth analytics'}</p>
        <button
          onClick={fetchGrowthAnalytics}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  const funnel = metrics.activationFunnel || {};
  const topReferrers = metrics.topReferrers || [];
  const sharesByType = metrics.sharesByType || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-wider">
              Admin Growth & Distribution Engine
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-2">
            Customer Acquisition Analytics
          </h1>
          <p className="text-emerald-100 text-xs mt-1 font-medium">
            Measured farmer referral loops, public insight shares & campaign conversion funnels
          </p>
        </div>

        <button
          onClick={fetchGrowthAnalytics}
          className="self-start md:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Total Farmers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.totalUsers}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Verified Accounts</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Referrals Signed Up</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.totalReferrals}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {metrics.activatedReferrals} Activated
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Public Shares</span>
            <Share2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.totalShares}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {metrics.shareViews} Total Views
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
            <span>Active Campaigns</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.activeCampaigns}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Regional Acquisition</div>
        </div>
      </div>

      {/* Activation Funnel & Top Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Activation & Conversion Funnel
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Registered Farmers', count: funnel.signups, color: 'bg-emerald-600' },
              { label: 'Onboarded Farmers', count: funnel.onboarded, color: 'bg-emerald-500' },
              { label: 'Activated Farmers', count: funnel.activated, color: 'bg-green-500' },
              { label: 'Subscribed Members', count: funnel.subscribed, color: 'bg-emerald-700' }
            ].map((stage, idx) => {
              const maxCount = Math.max(funnel.signups || 1, 1);
              const pct = Math.round((stage.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>{stage.label}</span>
                    <span>{stage.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Farmer Referrers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            Top Farmer Referrers
          </h3>

          {topReferrers.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">
              No referrer statistics recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {topReferrers.map((ref: any, idx: number) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{ref.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{ref.code}</div>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    {ref.referrals} referrals
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
