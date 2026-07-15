import React from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

export const ServerError: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-950 px-6 py-12 text-center">
      <div className="max-w-md w-full bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl p-8 shadow-lg space-y-6">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-955/20 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-dark-50">500 - Internal Server Error</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-dark-400 leading-relaxed">
            The KrishiMitra backend is experiencing temporary high request load or database timeout buffering. Let's refresh the session check.
          </p>
        </div>
        <button
          onClick={handleReload}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 min-h-[44px]"
        >
          <RefreshCw size={16} />
          <span>Refresh Page Connection</span>
        </button>
      </div>
    </div>
  );
};
