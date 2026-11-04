import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) {
    return null;
  }

  if (!isOnline) {
    return (
      <div 
        role="alert" 
        className="w-full bg-amber-600 text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 shadow-sm z-50 transition-all duration-200"
      >
        <WifiOff size={16} className="shrink-0 animate-pulse" />
        <span>
          {t('common.offline_notice', 'You are currently offline. Local features remain accessible; live updates will sync once reconnected.')}
        </span>
      </div>
    );
  }

  return (
    <div 
      role="status" 
      className="w-full bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 shadow-sm z-50 transition-all duration-200"
    >
      <Wifi size={16} className="shrink-0" />
      <span>
        {t('common.online_restored', 'Connection restored. You are back online.')}
      </span>
    </div>
  );
};
