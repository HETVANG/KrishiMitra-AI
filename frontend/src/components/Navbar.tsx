import React from 'react';
import { Menu, Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  onMenuToggle: () => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, title }) => {
  const { user, updateSettings } = useAuth();
  const { theme, toggleTheme, setLanguage } = useTheme();
  const { i18n } = useTranslation();

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
    
    // 1. Change language in i18next
    i18n.changeLanguage(lang);
    
    // 2. Set language in context
    setLanguage(lang);
    
    // 3. Save in local storage
    localStorage.setItem('km-lang', lang);
    
    // 4. Sync with database
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
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-800/50">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Trigger */}
        <button
          onClick={onMenuToggle}
          className="p-2 text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        {/* Page Title */}
        <h2 className="font-bold text-sm md:text-base text-gray-800 dark:text-dark-100 md:text-xl tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Language Picker */}
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-dark-800/50 px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg border border-gray-200/50 dark:border-dark-700/30">
          <Globe size={14} className="text-gray-500 dark:text-dark-400" />
          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            className="text-[10px] md:text-xs font-semibold bg-transparent text-gray-700 dark:text-dark-300 focus:outline-none cursor-pointer max-w-[80px] md:max-w-none"
          >
            {languagesList.map((lang) => (
              <option key={lang.code} value={lang.code} className="dark:bg-dark-900 text-xs">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2 text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors duration-150"
          title="Toggle light/dark mode"
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* Avatar Card */}
        <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-gray-200 dark:border-dark-800">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold uppercase text-xs">
            {user?.name.slice(0, 2)}
          </div>
          <div className="text-left">
            <span className="block text-xs font-semibold text-gray-800 dark:text-dark-200 leading-none">{user?.name}</span>
            <span className="block text-[9px] text-gray-400 font-medium uppercase mt-0.5 leading-none">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
