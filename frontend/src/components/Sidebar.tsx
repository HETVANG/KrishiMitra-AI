import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
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
  Brain,
  Droplets,
  Activity,
  Bot,
  Globe,
  Store,
  Server,
  Building2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Settings as SettingsIcon,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenRegionalSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onOpenRegionalSettings }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const [moreOpen, setMoreOpen] = useState(() => {
    // Keep 'More' expanded if currently visiting any route inside moreLinks
    const morePaths = ['/schemes', '/forum', '/marketplace', '/soil', '/expenses', '/reports', '/organizations', '/partners'];
    return morePaths.some(p => location.pathname.startsWith(p));
  });

  // Category 1: FARM (Core daily farming tools)
  const farmLinks = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/crop-cycles', label: t('nav.my_farm'), icon: Activity },
    { to: '/market', label: t('nav.market'), icon: CloudSun },
    { to: '/disease', label: t('nav.disease'), icon: ScanEye },
    { to: '/irrigation', label: t('nav.irrigation'), icon: Droplets },
  ];

  // Category 2: AI & ASSISTANCE
  const aiLinks = [
    { to: '/copilot', label: t('nav.copilot'), icon: Brain },
    { to: '/agents', label: t('nav.agents'), icon: Bot },
  ];

  // Category 3: ACTIVITY & HELP
  const activityLinks = [
    { to: '/experts', label: t('nav.expert'), icon: Calendar },
  ];

  // Category 4: MORE SERVICES (Secondary modules)
  const moreLinks = [
    { to: '/schemes', label: t('nav.schemes'), icon: Layers },
    { to: '/forum', label: t('nav.forum'), icon: Users },
    { to: '/marketplace', label: 'Agri Marketplace', icon: Store },
    { to: '/soil', label: t('nav.soil'), icon: Sprout },
    { to: '/expenses', label: t('nav.expense'), icon: Coins },
    { to: '/reports', label: t('nav.reports'), icon: FileText },
  ];

  // Conditional Organization / Partner links (shown if user is linked or admin)
  if (user?.role === 'admin' || user?.plan === 'enterprise') {
    moreLinks.push({ to: '/organizations', label: 'Organizations & FPO', icon: Building2 });
    moreLinks.push({ to: '/partners/discover', label: 'Partner Network', icon: Globe });
  }

  // Admin section
  const adminLinks = [
    { to: '/admin', label: t('nav.admin'), icon: ShieldAlert },
    { to: '/admin/providers', label: 'Provider Feeds', icon: Server },
    { to: '/admin/partners', label: 'Partner Ecosystem', icon: Building2 },
    { to: '/admin/analytics', label: 'Product Analytics', icon: BarChart3 },
    { to: '/admin/growth', label: 'Growth & Acquisition', icon: BarChart3 },
    { to: '/admin/success', label: 'Farmer Success Engine', icon: Activity },
  ];

  const renderNavLink = (link: { to: string; label: string; icon: any }, isSub: boolean = false) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) => 
          `flex items-center gap-3 ${isSub ? 'px-3 py-2 text-xs font-medium text-left' : 'px-3.5 py-2.5 text-xs font-bold text-left'} rounded-xl transition-all duration-150 ${
            isActive 
              ? 'bg-brand-600 text-white shadow-sm' 
              : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800/40 hover:text-gray-900 dark:hover:text-dark-100'
          }`
        }
      >
        <Icon size={isSub ? 16 : 18} className="shrink-0" />
        <span className="truncate">{link.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[99998] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-[99999] flex flex-col w-64 bg-white dark:bg-dark-900 border-r border-gray-100 dark:border-dark-800/50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-dark-800/50">
          <div className="flex items-center justify-center w-9 h-9 bg-brand-500 rounded-xl text-white shadow-md shadow-brand-500/20 shrink-0">
            <Sprout size={20} />
          </div>
          <div className="text-left">
            <h1 className="font-extrabold text-base text-brand-700 dark:text-brand-400 tracking-tight">KrishiMitra AI</h1>
            <p className="text-[10px] text-gray-400 dark:text-dark-500 font-bold uppercase tracking-wider">Farmer Companion</p>
          </div>
        </div>

        {/* User Context Badge */}
        <div className="px-3 py-3 mx-3 my-3 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100/50 dark:border-brand-900/10 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-100 dark:bg-brand-900/50 rounded-xl flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 uppercase text-xs shrink-0">
              {user?.name?.slice(0, 2) || 'KM'}
            </div>
            <div className="overflow-hidden text-left flex-1">
              <h4 className="font-extrabold text-xs text-gray-800 dark:text-dark-200 truncate">{user?.name}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block text-[9px] px-2 py-0.5 bg-brand-200/50 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 font-extrabold rounded-md uppercase">
                  {user?.role || 'Farmer'}
                </span>
                <NavLink 
                  to="/settings" 
                  className="inline-block text-[9px] px-2 py-0.5 font-extrabold rounded-md uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  {user?.plan || 'Free'}
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Categorized Navigation */}
        <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-1">
          {/* Section: FARM */}
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-dark-500 px-3 block text-left">
              Farm
            </span>
            {farmLinks.map(link => renderNavLink(link))}
          </div>

          {/* Section: AI & ASSISTANCE */}
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-dark-500 px-3 block text-left">
              AI & Assistance
            </span>
            {aiLinks.map(link => renderNavLink(link))}
          </div>

          {/* Section: ACTIVITY */}
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-dark-500 px-3 block text-left">
              Activity
            </span>
            {activityLinks.map(link => renderNavLink(link))}
          </div>

          {/* Section: MORE SERVICES (Collapsible) */}
          <div className="space-y-1">
            <button
              onClick={() => setMoreOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800/40 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <MoreHorizontal size={18} />
                <span>{t('nav.more')}</span>
              </div>
              {moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {moreOpen && (
              <div className="pl-3 space-y-1 border-l-2 border-brand-100 dark:border-dark-800 ml-3.5 my-1">
                {moreLinks.map(link => renderNavLink(link, true))}
              </div>
            )}
          </div>

          {/* Section: ADMIN CONTROL PANEL (Admin only) */}
          {user?.role === 'admin' && (
            <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-dark-800/50">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-red-500 px-3 block text-left">
                Admin Center
              </span>
              {adminLinks.map(link => renderNavLink(link))}
            </div>
          )}
        </nav>

        {/* Footer Actions: Settings & Logout */}
        <div className="p-3 space-y-1 border-t border-gray-100 dark:border-dark-800/50">
          <NavLink
            to="/settings"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-150 text-left ${
                isActive 
                  ? 'bg-brand-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/20 dark:text-dark-300'
              }`
            }
          >
            <SettingsIcon size={18} />
            <span>{t('nav.settings')}</span>
          </NavLink>

          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 dark:text-dark-400 rounded-xl transition-all duration-150 text-left"
          >
            <LogOut size={18} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
