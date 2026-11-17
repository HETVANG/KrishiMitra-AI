import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-950 px-4 sm:px-6 py-12 text-center safe-area-pt">
      <div className="max-w-md w-full bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-955/20 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 dark:text-dark-50">
            {t('common.not_found_title', '404 - Page Not Found')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-400 leading-relaxed">
            {t('common.not_found_desc', 'The agronomic page or resource you are trying to visit does not exist or has been shifted. Return to the farm dashboard or go back to your previous action.')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-1/2 py-3 px-4 border border-gray-250 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-200 rounded-xl font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <ArrowLeft size={16} />
            <span>{t('common.back', 'Go Back')}</span>
          </button>
          <Link
            to="/dashboard"
            className="w-full sm:w-1/2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
          >
            <Home size={16} />
            <span>{t('nav.dashboard', 'Dashboard')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
