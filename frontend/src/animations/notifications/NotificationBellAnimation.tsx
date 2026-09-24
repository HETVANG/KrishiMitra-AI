import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellAnimationProps {
  unreadCount?: number;
  hasNew?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NotificationBellAnimation: React.FC<NotificationBellAnimationProps> = ({
  unreadCount = 0,
  hasNew = false,
  onClick,
  className = '',
}) => {
  const [swaying, setSwaying] = useState(false);

  useEffect(() => {
    if (hasNew || unreadCount > 0) {
      setSwaying(true);
      const timer = setTimeout(() => setSwaying(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, hasNew]);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md ${className}`}
      aria-label="Notifications"
    >
      <Bell
        size={18}
        className={`transition-transform duration-300 ${swaying ? 'rotate-12 scale-110 text-amber-300' : 'rotate-0'}`}
      />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
