import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Share2,
  Copy,
  Check,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  MessageSquare,
  QrCode
} from 'lucide-react';

export const ReferralWidget: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/growth/referrals/me');
      if (res.data && res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load referral stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xs border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  const referralCode = stats?.referralCode || 'KM-AGRIC';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join me on KrishiMitra AI to get smart crop advisory, disease scanning & market prices for your farm! Register using my code ${referralCode}: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/30 rounded-2xl p-5 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Invite Farmers & Earn Credits</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Share KrishiMitra AI with fellow farmers in your region
            </p>
          </div>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-[10px] text-gray-500 font-medium">Invited</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{stats?.totalReferrals || 0}</div>
          </div>
          <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-[10px] text-gray-500 font-medium">Activated</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{stats?.activated || 0}</div>
          </div>
        </div>
      </div>

      {/* Share Box */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <div className="w-full flex-1 flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-hidden">
          <span className="truncate">{referralLink}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            title="Share on WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
