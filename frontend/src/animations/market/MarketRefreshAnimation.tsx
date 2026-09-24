import React from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface MarketRefreshAnimationProps {
  refreshing?: boolean;
  lastUpdated?: string | null;
  onRefresh?: () => void;
  className?: string;
}

export const MarketRefreshAnimation: React.FC<MarketRefreshAnimationProps> = ({
  refreshing = false,
  lastUpdated,
  onRefresh,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {lastUpdated && !refreshing && (
        <span className="text-[10px] font-semibold text-gray-400 dark:text-dark-400 flex items-center gap-1">
          <CheckCircle2 size={11} className="text-emerald-500" />
          <span>Updated {lastUpdated}</span>
        </span>
      )}

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-600 dark:text-dark-300 transition-colors disabled:opacity-50"
          title="Refresh Mandi Telemetry"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-brand-600' : ''} />
        </button>
      )}
    </div>
  );
};
