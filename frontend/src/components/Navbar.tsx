import React, { useState } from 'react';
import { Menu, Sun, Moon, Globe, Search, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { BrandLogo } from './BrandLogo';
import { GlobalSearchModal } from './search/GlobalSearchModal';

interface NavbarProps {
  onMenuToggle: () => void;
  title: string;
  onOpenRegionalSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, title, onOpenRegionalSettings }) => {
  const { user, updateSettings } = useAuth();
  const { theme, toggleTheme, setLanguage } = useTheme();
  const { t, i18n } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const languagesList = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'mr', label: 'मराठी' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'or', label: 'ଓଡ଼ିଆ' },
    { code: 'as', label: 'অসমীয়া' }
  ];

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

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-2.5 sm:px-4 md:px-6 py-2 sm:py-2.5 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md border-b border-slate-200/70 dark:border-dark-800/60 shadow-xs max-w-full overflow-hidden">
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 shrink">
        {/* Mobile Menu Trigger */}
        <button
          onClick={onMenuToggle}
          type="button"
          aria-label="Toggle Navigation Drawer"
          className="flex items-center justify-center min-w-[38px] min-h-[38px] p-2 text-slate-600 dark:text-dark-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl lg:hidden transition-colors shrink-0"
        >
          <Menu size={20} />
        </button>
        
        {/* Mobile Brand Emblem for brand presence */}
        <div className="hidden xs:block sm:block lg:hidden shrink-0">
          <BrandLogo variant="symbol" size="sm" />
        </div>

        {/* Page Title */}
        <h2 className="font-extrabold text-xs sm:text-sm md:text-lg text-slate-800 dark:text-dark-100 tracking-tight truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
        {/* Global Search & Voice Trigger */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800/80 dark:hover:bg-dark-700 text-slate-500 dark:text-dark-300 rounded-xl border border-slate-200/60 dark:border-dark-700/40 min-h-[36px] sm:min-h-[38px] transition-all group shrink-0"
          title={`${t('common.search') || 'Search'} (Ctrl+K)`}
          aria-label="Open Search and Voice Assistant"
        >
          <Search size={15} className="group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
          <span className="hidden sm:inline text-xs font-semibold text-slate-500 dark:text-dark-300">
            {t('common.search') || 'Search'}...
          </span>
          <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-dark-700 text-[10px] text-slate-400 font-mono">
            <span>⌘K</span>
          </div>
          <span className="p-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400 group-hover:scale-110 transition-transform">
            <Mic size={12} />
          </span>
        </button>

        {/* Workspace Switcher (visible on desktop) */}
        {user && (
          <div className="hidden md:block">
            <WorkspaceSwitcher />
          </div>
        )}

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-800/80 px-1.5 sm:px-2 py-1 rounded-xl border border-slate-200/60 dark:border-dark-700/40 min-h-[36px] sm:min-h-[38px] shrink-0">
          <Globe size={14} className="text-slate-500 dark:text-dark-400 shrink-0" />
          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            aria-label="Select Platform Language"
            className="text-[11px] sm:text-xs font-bold bg-transparent text-slate-700 dark:text-dark-200 focus:outline-none cursor-pointer max-w-[48px] sm:max-w-none"
          >
            {languagesList.map((lang) => (
              <option key={lang.code} value={lang.code} className="dark:bg-dark-900 text-xs">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Regional Settings Modal Trigger */}
        {onOpenRegionalSettings && (
          <button
            onClick={onOpenRegionalSettings}
            type="button"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/40 rounded-xl hover:bg-brand-100 transition-colors min-h-[38px]"
            title="Configure regional settings"
          >
            <Globe size={14} />
            <span>Region</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          type="button"
          aria-label="Toggle Light and Dark Mode"
          className="flex items-center justify-center min-w-[36px] min-h-[36px] p-2 text-slate-600 dark:text-dark-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-colors shrink-0"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* User Identity Avatar */}
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

      {/* Global Search and Voice Dialog */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};

export default Navbar;
