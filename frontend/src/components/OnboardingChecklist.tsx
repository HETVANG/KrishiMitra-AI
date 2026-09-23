import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CheckCircle2, Circle, Sparkles, ChevronRight, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingChecklistProps {
  onOpenModal?: () => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ onOpenModal }) => {
  const [status, setStatus] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/onboarding/status');
      if (res.data?.success) {
        setStatus(res.data.status);
      }
    } catch (err) {
      console.error('Failed to fetch onboarding status widget:', err);
    }
  };

  if (dismissed || !status) return null;

  // If farmer has completed onboarding and has farms, we don't show the checklist widget unless step is in progress
  if (status.status === 'COMPLETED' || status.status === 'SKIPPED') {
    return null;
  }

  const items = [
    { title: 'Select Language & Region', done: status.step > 1 || status.status === 'COMPLETED' },
    { title: 'Create Farm Profile', done: status.step > 2 || status.hasFarm },
    { title: 'Add Primary Crop', done: status.step > 3 || status.hasCrop },
    { title: 'Explore Proactive Advisories', done: status.step > 4 || status.status === 'COMPLETED' }
  ];

  const completedCount = items.filter(i => i.done).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-4 sm:p-5 shadow-xs relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
        title="Dismiss guide"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Farm Activation Guide ({completedCount}/{items.length})
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Complete your quick setup to unlock personalized growth recommendations & risk alerts.
          </p>
        </div>

        {onOpenModal && (
          <button
            onClick={onOpenModal}
            className="self-start sm:self-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            Continue Setup <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3.5 mb-3">
        <div className="w-full h-1.5 bg-emerald-200/60 dark:bg-emerald-900/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-colors ${
              item.done
                ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60'
            }`}
          >
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400 shrink-0" />
            )}
            <span className="truncate">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
