import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Sun, 
  Moon, 
  Globe, 
  Search, 
  Mic, 
  Bell, 
  ChevronDown, 
  X, 
  CloudSun, 
  TrendingUp, 
  ScanEye, 
  Droplets,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { GlobalSearchModal } from './search/GlobalSearchModal';

interface NavbarProps {
  onMenuToggle: () => void;
  title?: string;
  onOpenRegionalSettings?: () => void;
}

interface FarmAlert {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'weather' | 'market' | 'disease' | 'irrigation';
  route: string;
  read: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, onOpenRegionalSettings }) => {
  const { user, updateSettings } = useAuth();
  const { theme, toggleTheme, setLanguage } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [autoStartVoice, setAutoStartVoice] = useState(false);

  // Notifications state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Active Farm Alerts & System Notifications
  const [alerts, setAlerts] = useState<FarmAlert[]>([
    {
      id: 'alert-weather',
      title: 'Weather Advisory',
      message: 'Optimal spray window: Low wind speed (<8 km/h) forecast for next 6 hours.',
      time: '10m ago',
      type: 'weather',
      route: '/weather',
      read: false,
    },
    {
      id: 'alert-market',
      title: 'Mandi Price Index',
      message: 'Wheat modal price at Rajkot APMC is trading firm at ₹2,850/Quintal (+4.2%).',
      time: '1h ago',
      type: 'market',
      route: '/market',
      read: false,
    },
    {
      id: 'alert-disease',
      title: 'Crop Health Alert',
      message: 'Follow-up diagnosis recommended for Field #1 after recent humidity change.',
      time: '3h ago',
      type: 'disease',
      route: '/disease',
      read: false,
    },
    {
      id: 'alert-irrigation',
      title: 'Smart Irrigation',
      message: 'Moisture balance for active crop cycle is stable (60%). Next cycle in 36h.',
      time: '5h ago',
      type: 'irrigation',
      route: '/irrigation',
      read: false,
    },
  ]);

  const languagesList = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी', short: 'HI' },
    { code: 'gu', label: 'ગુજરાતી', short: 'GU' },
    { code: 'mr', label: 'मराठी', short: 'MR' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', short: 'PA' },
    { code: 'bn', label: 'বাংলা', short: 'BN' },
    { code: 'ta', label: 'தமிழ்', short: 'TA' },
    { code: 'te', label: 'తెలుగు', short: 'TE' },
    { code: 'kn', label: 'ಕನ್ನಡ', short: 'KN' },
    { code: 'ml', label: 'മലയാളം', short: 'ML' },
    { code: 'or', label: 'ଓଡ଼ିଆ', short: 'OR' },
    { code: 'as', label: 'অসমীয়া', short: 'AS' }
  ];

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as any;
    i18n.changeLanguage(lang);
    setLanguage(lang);
    localStorage.setItem('km-lang', lang);
    if (user) {
      try {
        await updateSettings(lang, theme);
      } catch (err) {
        console.error('Failed to sync language to backend settings:', err);
      }
    }
  };

  const handleThemeToggle = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme();
    if (user) {
      try {
        await updateSettings(i18n.language as any, nextTheme);
      } catch (err) {
        console.error('Failed to sync theme to backend settings:', err);
      }
    }
  };

  const handleOpenSearch = () => {
    setAutoStartVoice(false);
    setIsSearchOpen(true);
  };

  const handleOpenVoiceSearch = () => {
    setAutoStartVoice(true);
    setIsSearchOpen(true);
  };

  const handleAlertClick = (alert: FarmAlert) => {
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a));
    setIsNotificationOpen(false);
    navigate(alert.route);
  };

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setHasUnreadNotifications(false);
  };

  const currentLanguageObj = languagesList.find(l => l.code === i18n.language) || languagesList[0];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-2.5 sm:px-4 md:px-6 h-14 sm:h-16 bg-white dark:bg-dark-900 border-b-2 border-[#15803d] dark:border-emerald-600 shadow-xs max-w-full">
      {/* ============================================================== */}
      {/* LEFT SECTION: Hamburger + The Khedut Logo + Brand Typography   */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 mr-2">
        {/* Hamburger Navigation Drawer Toggle */}
        <button
          onClick={onMenuToggle}
          type="button"
          aria-label="Toggle Navigation Drawer"
          className="p-1.5 -ml-1 text-slate-800 dark:text-dark-100 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg transition-colors shrink-0 active:scale-95"
        >
          <Menu size={22} className="stroke-[2.2]" />
        </button>

        {/* Official Brand Logo Artwork - Clickable to Dashboard */}
        <div 
          onClick={() => navigate(user ? '/dashboard' : '/')} 
          className="flex items-center gap-2 select-none min-w-0 cursor-pointer active:scale-95 transition-transform"
          role="button"
          tabIndex={0}
          title="Return to Dashboard"
        >
          <img
            src="/brand/the-khedut-symbol.png"
            alt="The Khedut"
            className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 object-contain shrink-0"
            loading="eager"
          />

          {/* Brand Typography & Tagline */}
          <div className="flex flex-col text-left leading-none min-w-0">
            <span className="font-extrabold text-[14px] xs:text-[15px] sm:text-[17px] text-[#15803d] dark:text-emerald-400 tracking-tight leading-none whitespace-nowrap">
              THE KHEDUT<sup className="text-[8px] xs:text-[9px] font-bold ml-0.5 text-[#15803d] dark:text-emerald-400">®</sup>
            </span>
            <span className="text-[8px] xs:text-[8.5px] sm:text-[9.5px] font-medium text-slate-600 dark:text-dark-300 tracking-normal leading-tight mt-0.5 whitespace-nowrap hidden min-[360px]:block">
              Smart Agriculture. Better Decisions.
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT SECTION: Search/Voice Pill + Language Pill + Bell + More */}
      {/* ============================================================== */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
        {/* 1. Grouped Search & Voice Pill */}
        <div className="flex items-center rounded-full border border-slate-200/90 dark:border-dark-700 bg-white dark:bg-dark-800/80 shadow-xs px-2 sm:px-2.5 py-1 gap-1.5 sm:gap-2 h-9 shrink-0">
          <button
            type="button"
            onClick={handleOpenSearch}
            aria-label="Search crops, diseases, mandi prices"
            title={`${t('common.search') || 'Search'} (Ctrl+K)`}
            className="text-slate-700 dark:text-dark-200 hover:text-brand-700 dark:hover:text-brand-400 transition-colors p-0.5 active:scale-95"
          >
            <Search size={16} className="stroke-[2.2]" />
          </button>
          <span className="w-px h-3.5 bg-slate-200 dark:bg-dark-700" />
          <button
            type="button"
            onClick={handleOpenVoiceSearch}
            aria-label="Voice Search"
            title="Voice Search"
            className="text-slate-700 dark:text-dark-200 hover:text-brand-700 dark:hover:text-brand-400 transition-colors p-0.5 active:scale-95"
          >
            <Mic size={16} className="stroke-[2.2]" />
          </button>
        </div>

        {/* 2. Grouped Language Selector Pill with Native Picker Overlay */}
        <div className="relative flex items-center rounded-full border border-slate-200/90 dark:border-dark-700 bg-white dark:bg-dark-800/80 shadow-xs px-2.5 sm:px-3 py-1 gap-1.5 h-9 shrink-0 hover:bg-slate-50 dark:hover:bg-dark-750 transition-colors">
          <Globe size={15} className="text-slate-600 dark:text-dark-300 shrink-0 stroke-[2.2]" />
          <span className="text-xs font-semibold text-slate-800 dark:text-dark-100 whitespace-nowrap">
            {currentLanguageObj.label}
          </span>
          <ChevronDown size={14} className="text-slate-500 dark:text-dark-400 shrink-0 stroke-[2.2]" />
          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            aria-label="Select Platform Language"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
          >
            {languagesList.map((lang) => (
              <option key={lang.code} value={lang.code} className="dark:bg-dark-900 text-xs">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Notification Button with Unread Red Dot Indicator */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationOpen(prev => !prev)}
            aria-label="View Farm Alerts and Notifications"
            title="Farm Alerts & Notifications"
            className="relative flex items-center justify-center w-9 h-9 text-slate-700 dark:text-dark-200 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full transition-colors active:scale-95 shrink-0"
          >
            <Bell size={20} className="stroke-[2]" />
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-900 animate-pulse" />
            )}
          </button>

          {/* Farm Alerts & Notifications Popover */}
          {isNotificationOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up text-left">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-dark-950/60 border-b border-slate-100 dark:border-dark-800">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-brand-600 dark:text-brand-400" />
                  <h3 className="font-extrabold text-xs text-slate-800 dark:text-dark-100 uppercase tracking-wider">
                    {t('notifications.title') || 'Farm Alerts & Updates'}
                  </h3>
                </div>
                {alerts.some(a => !a.read) && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <Check size={12} />
                    {t('notifications.mark_read') || 'Mark all as read'}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-800/60 p-2 space-y-1">
                {alerts.map((alert) => {
                  const getAlertIcon = () => {
                    switch (alert.type) {
                      case 'weather': return <CloudSun size={15} className="text-sky-600" />;
                      case 'market': return <TrendingUp size={15} className="text-emerald-600" />;
                      case 'disease': return <ScanEye size={15} className="text-amber-600" />;
                      case 'irrigation': return <Droplets size={15} className="text-blue-600" />;
                    }
                  };

                  return (
                    <div
                      key={alert.id}
                      onClick={() => handleAlertClick(alert)}
                      className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-dark-800/60 ${
                        !alert.read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-white dark:bg-dark-800 border border-slate-150 dark:border-dark-700 shadow-xs shrink-0 mt-0.5">
                        {getAlertIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-dark-100 truncate">
                            {alert.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {alert.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-dark-300 line-clamp-2 mt-0.5 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-2.5 bg-slate-50 dark:bg-dark-950/60 border-t border-slate-100 dark:border-dark-800 text-center">
                <span className="text-[10px] text-slate-400 font-medium">
                  The Khedut Agronomic Monitoring System Active
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Desktop-only Controls: Workspace Switcher, Regional Modal, Theme, User */}
        {user && (
          <div className="hidden lg:block">
            <WorkspaceSwitcher />
          </div>
        )}

        {onOpenRegionalSettings && (
          <button
            onClick={onOpenRegionalSettings}
            type="button"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/40 rounded-xl hover:bg-brand-100 transition-colors min-h-[36px]"
            title="Configure regional settings"
          >
            <Globe size={14} />
            <span>Region</span>
          </button>
        )}

        {/* Theme Toggle (Visible on md+ screens to preserve mobile purity matching reference screenshot) */}
        <button
          onClick={handleThemeToggle}
          type="button"
          aria-label="Toggle Light and Dark Mode"
          className="hidden md:flex items-center justify-center min-w-[36px] min-h-[36px] p-2 text-slate-600 dark:text-dark-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-colors shrink-0 active:scale-95"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* User Identity Avatar (Desktop only) */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-dark-800">
          <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center font-black uppercase text-xs shadow-xs">
            {user?.name?.slice(0, 2) || 'TK'}
          </div>
          <div className="text-left max-w-[120px]">
            <span className="block text-xs font-bold text-slate-800 dark:text-dark-200 truncate leading-none">
              {user?.name || 'Farmer'}
            </span>
            <span className="block text-[9px] text-slate-400 font-semibold uppercase mt-0.5 leading-none">
              {user?.role || 'Farmer'}
            </span>
          </div>
        </div>
      </div>

      {/* Global Search and Voice Dialog Modal */}
      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        initialVoice={autoStartVoice}
      />
    </header>
  );
};

export default Navbar;