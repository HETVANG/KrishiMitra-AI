import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanEye, 
  Brain, 
  TrendingUp, 
  Menu
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    {
      to: '/dashboard',
      label: t('nav.dashboard') || 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/disease',
      label: t('nav.disease') || 'Crop Health',
      icon: ScanEye,
    },
    {
      to: '/copilot',
      label: 'Copilot',
      icon: Brain,
      highlight: true,
    },
    {
      to: '/market',
      label: t('nav.market') || 'Mandi',
      icon: TrendingUp,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-dark-800/80 shadow-lg px-2 py-1 safe-area-pb"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl transition-all duration-150 ${
                isActive 
                  ? 'text-brand-700 dark:text-brand-400 font-extrabold' 
                  : 'text-slate-500 dark:text-dark-400 hover:text-slate-800 dark:hover:text-dark-200 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {item.highlight ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-brand-700 text-white shadow-md shadow-brand-700/25' 
                      : 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-400'
                  }`}>
                    <Icon size={18} />
                  </div>
                ) : (
                  <div className="p-1">
                    <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                  </div>
                )}
                {isActive && !item.highlight && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-brand-700 dark:bg-brand-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* 5th Action: All Services / Menu trigger */}
        <button
          onClick={onOpenMenu}
          type="button"
          aria-label="Open Full Navigation Menu"
          className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl text-slate-500 dark:text-dark-400 hover:text-slate-800 dark:hover:text-dark-200 transition-colors"
        >
          <div className="p-1">
            <Menu size={20} className="stroke-[1.8]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium truncate">
            {t('nav.more') || 'Menu'}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
