import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ScanEye, 
  Sprout, 
  Coins, 
  FileText, 
  Users, 
  ShieldAlert, 
  LogOut,
  Calendar,
  Layers,
  CloudSun,
  Sparkles,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const links = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/chat', label: t('nav.chatbot'), icon: MessageSquare },
    { to: '/disease', label: t('nav.disease'), icon: ScanEye },
    { to: '/soil', label: t('nav.soil'), icon: Sprout },
    { to: '/market', label: t('nav.market'), icon: CloudSun },
    { to: '/schemes', label: t('nav.schemes'), icon: Layers },
    { to: '/forum', label: t('nav.forum'), icon: Users },
    { to: '/experts', label: t('nav.expert'), icon: Calendar },
    { to: '/expenses', label: t('nav.expense'), icon: Coins },
    { to: '/reports', label: t('nav.reports'), icon: FileText },
    { to: '/pricing', label: 'Upgrade to Premium', icon: Sparkles },
    { to: '/subscription', label: 'My Subscription', icon: Wallet },
    { to: '/billing-history', label: 'Billing History', icon: Wallet },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-dark-900 border-r border-gray-105 dark:border-dark-800/50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-dark-800/50">
          <div className="flex items-center justify-center w-9 h-9 bg-brand-500 rounded-xl text-white shadow-md shadow-brand-500/20">
            <Sprout size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-brand-700 dark:text-brand-400 tracking-tight">KrishiMitra AI</h1>
            <p className="text-[10px] text-gray-400 dark:text-dark-500 font-medium uppercase tracking-wider">Farmer Companion</p>
          </div>
        </div>

        {/* User context card */}
        <div className="px-4 py-4 mx-3 my-4 bg-brand-5:50 dark:bg-brand-950/20 border border-brand-100/50 dark:border-brand-900/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 uppercase">
              {user?.name.slice(0, 2)}
            </div>
            <div className="overflow-hidden text-left">
              <h4 className="font-bold text-sm text-gray-800 dark:text-dark-200 truncate">{user?.name}</h4>
              <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                <span className="inline-block text-[9px] px-2 py-0.5 bg-brand-200/50 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 font-bold rounded-full uppercase">
                  {user?.role}
                </span>
                <NavLink 
                  to="/pricing" 
                  className={`inline-block text-[9px] px-2 py-0.5 font-bold rounded-full uppercase transition-all ${
                    user?.plan === 'premium' 
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/30' 
                      : 'bg-gray-150 dark:bg-dark-800 text-gray-600 dark:text-dark-400 hover:bg-brand-100 hover:text-brand-800'
                  }`}
                >
                  {user?.plan || 'free'}
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' 
                      : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800/40 hover:text-gray-900 dark:hover:text-dark-100'
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          {/* Admin link conditional */}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                }`
              }
            >
              <ShieldAlert size={18} />
              <span>{t('nav.admin')}</span>
            </NavLink>
          )}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-gray-100 dark:border-dark-800/50">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 dark:text-dark-400 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
