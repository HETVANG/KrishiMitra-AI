import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-950 px-6 py-12 text-center">
      <div className="max-w-md w-full bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl p-8 shadow-lg space-y-6">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-955/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-dark-50">404 - Page Not Found</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-dark-400 leading-relaxed">
            The agronomic page or control resource you are trying to visit does not exist or has been shifted. Let's redirect you back to the farm dashboard.
          </p>
        </div>
        <Link
          to="/"
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 min-h-[44px]"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
