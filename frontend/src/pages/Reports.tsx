import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Sprout, CloudSun, Coins, ScanEye, ArrowUpRight } from 'lucide-react';

export const Reports: React.FC = () => {
  const { user } = useAuth();

  const [error, setError] = React.useState('');

  const handleDownload = (reportType: 'crop' | 'weather' | 'expense' | 'disease') => {
    setError('');
    const hasPremium = user?.plan === 'premium' || (user?.subscriptionStatus === 'trialing' && new Date(user.trialEndDate || 0) > new Date());

    if ((reportType === 'crop' || reportType === 'disease') && !hasPremium) {
      setError('Premium feature – Coming Soon. Please upgrade your account to export Crop Planning and Disease Diagnostics PDF statements.');
      return;
    }

    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api/reports/download?type=${reportType}&Authorization=Bearer ${token}`;
    window.open(url, '_blank');
  };

  const reportsList = [
    {
      id: 'crop',
      title: 'AI Crop & Soil Advisory Statement',
      description: 'Contains farm profile details, soil chemistry evaluations (NPK, pH), and AI-generated crop recommendations.',
      icon: Sprout,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-100/50 dark:border-emerald-900/10'
    },
    {
      id: 'weather',
      title: 'Climate Weather Advisory Statement',
      description: 'Contains current meteorological readings, 7-day agricultural forecast, severe climate alerts, and AI farming tips.',
      icon: CloudSun,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 border-blue-100/50 dark:border-blue-900/10'
    },
    {
      id: 'expense',
      title: 'Farm cost Ledger Statement',
      description: 'Contains financial ledger transaction log outputs, income/cost balances, and net profit audit metrics.',
      icon: Coins,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 border-amber-100/50 dark:border-amber-900/10'
    },
    {
      id: 'disease',
      title: 'Leaf Pathology Diagnostics Statement',
      description: 'Contains crop leaf diagnostic logs, confidence scores, causes, symptoms, and organic or chemical treatment guides.',
      icon: ScanEye,
      color: 'bg-red-500',
      lightColor: 'bg-red-50 dark:bg-red-950/20 text-red-655 dark:text-red-400 border-red-100/50 dark:border-red-900/10'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Agricultural Advisory PDF Reports</h1>
        <p className="text-emerald-100 text-xs md:text-sm mt-1 font-medium">Export and download print-ready PDF statements summarizing your farm metrics, ledger balances, and pathology reports.</p>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-250 dark:bg-amber-950/20 dark:border-amber-900/35 rounded-2xl text-left text-xs md:text-sm text-amber-800 dark:text-amber-400 font-bold">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          return (
            <div 
              key={rep.id}
              className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border ${rep.lightColor}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-850 dark:text-dark-50 tracking-tight leading-snug">
                      {rep.title}
                    </h3>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      Print-Ready A4 Document
                    </span>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-gray-500 dark:text-dark-400 leading-relaxed text-left">
                  {rep.description}
                </p>
              </div>

              <div className="border-t border-gray-50 dark:border-dark-850 mt-6 pt-4 flex gap-2">
                <button
                  onClick={() => handleDownload(rep.id as any)}
                  className="btn-primary w-full py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download size={15} />
                  <span>Download Statement PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Offline sync note */}
      <div className="bg-gray-50 dark:bg-dark-900 p-5 rounded-3xl border border-gray-150 dark:border-dark-850 text-left space-y-2">
        <h4 className="text-xs font-bold text-gray-700 dark:text-dark-200 flex items-center gap-1">
          💡 Offline Sync Enabled
        </h4>
        <p className="text-[11px] text-gray-500 dark:text-dark-400 leading-relaxed">
          These reports are cached locally in your browser storage. You can view weather trends and expense ledgers offline. Any transactions or bookings scheduled offline will synchronize automatically when you reconnect to the network.
        </p>
      </div>
    </div>
  );
};
