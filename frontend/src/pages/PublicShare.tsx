import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Sprout,
  CloudSun,
  ShieldCheck,
  TrendingUp,
  Share2,
  Calendar,
  Eye,
  ArrowRight,
  Globe,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PublicShare: React.FC = () => {
  const { type, shareId } = useParams<{ type: string; shareId: string }>();
  const { t } = useTranslation();

  const [shareData, setShareData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicShare();
  }, [type, shareId]);

  const fetchPublicShare = async () => {
    try {
      setLoading(true);
      setError(null);
      const targetId = shareId || type;
      const res = await api.get(`/share/${targetId}`);
      if (res.data && res.data.success) {
        setShareData(res.data.share);
      } else {
        setError('Shared insight not found or has expired.');
      }
    } catch (err: any) {
      console.error('Failed to load public share resource:', err);
      setError('Shared insight is unavailable or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">Loading KrishiMitra Shared Advisory...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl text-center space-y-4 border border-gray-100 dark:border-gray-700">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Insight Unavailable</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{error || 'Resource not found'}</p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-all gap-1.5"
          >
            Explore KrishiMitra AI <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const payload = shareData.payload || {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 pb-16">
      {/* Top Header Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">KrishiMitra AI</h1>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                Verified Agriculture Advisory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <Link
              to="/register"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1"
            >
              Join Platform <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Insight Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className="text-[10px] font-extrabold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-wider">
              {shareData.resourceType} Insight
            </span>
            <span className="text-[10px] font-medium bg-black/20 text-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Eye className="w-3 h-3" /> {shareData.viewsCount} views
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">{shareData.title}</h2>
          {shareData.summary && <p className="text-xs text-emerald-100 font-medium">{shareData.summary}</p>}

          <div className="mt-4 pt-3 border-t border-emerald-500/30 flex items-center justify-between text-[11px] text-emerald-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Updated: {new Date(shareData.createdAt).toLocaleDateString('en-IN')}
            </span>
            <span className="flex items-center gap-1 font-semibold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Privacy Protected
            </span>
          </div>
        </div>

        {/* Dynamic Insight Payload Rendering */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Advisory Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.entries(payload).map(([key, val]) => {
              if (typeof val === 'object' && val !== null) return null;
              const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <div
                  key={key}
                  className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60"
                >
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{formattedKey}</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
                    {String(val)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner to Join Platform */}
        <div className="bg-gradient-to-r from-slate-900 to-gray-800 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold">Get Personalized Farm Intelligence</h3>
            <p className="text-xs text-gray-300 mt-0.5">
              Connect your farm location to receive real-time disease alerts, AI Copilot guidance, and market forecasts.
            </p>
          </div>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-all shrink-0 flex items-center gap-2"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};
