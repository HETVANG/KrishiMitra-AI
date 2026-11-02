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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../config/brand';
import { BrandLogo } from './BrandLogo';

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
    const morePaths = ['/schemes', '/forum', '/marketplace', '/soil', '/expenses', '/reports', '/organizations', '/partners'];
    return morePaths.some(p => location.pathname.startsWith(p));
  });

  // Category 1: CORE FARMING TOOLS
  const farmLinks = [
    { to: '/dashboard', label: t('nav.dashboard') || 'Dashboard', icon: LayoutDashboard },
    { to: '/disease', label: t('nav.disease') || 'Crop Health Diagnosis', icon: ScanEye },
    { to: '/market', label: t('nav.market') || 'Mandi Prices Index', icon: CloudSun },
    { to: '/crop-cycles', label: t('nav.my_farm') || 'Farm Lifecycle', icon: Activity },
    { to: '/irrigation', label: t('nav.irrigation') || 'Smart Irrigation', icon: Droplets },
  ];

  // Category 2: AI ADVISORY & COPILOT
  const aiLinks = [
    { to: '/copilot', label: t('nav.copilot') || 'AI Farm Copilot', icon: Brain },
    { to: '/agents', label: t('nav.agents') || 'Farm Agents Hub', icon: Bot },
  ];

  // Category 3: EXPERT CONSULTATION
  const activityLinks = [
    { to: '/experts', label: t('nav.expert') || 'Expert Consultation', icon: Calendar },
  ];

  // Category 4: MORE SERVICES
  const moreLinks = [
    { to: '/schemes', label: t('nav.schemes') || 'Gov Schemes', icon: Layers },
    { to: '/soil', label: t('nav.soil') || 'Soil Chemistry NPK', icon: Sprout },
    { to: '/marketplace', label: t('nav.marketplace') || 'Agri Marketplace', icon: Store },
    { to: '/forum', label: t('nav.forum') || 'Farmer Community', icon: Users },
    { to: '/expenses', label: t('nav.expense') || 'Expenses Ledger', icon: Coins },
    { to: '/reports', label: t('nav.reports') || 'PDF Statements', icon: FileText },
  ];

  if (user?.role === 'admin' || user?.plan === 'enterprise') {
    moreLinks.push({ to: '/organizations', label: t('nav.organizations') || 'Organizations & FPO', icon: Building2 });
    moreLinks.push({ to: '/partners/discover', label: t('nav.partners') || 'Partner Network', icon: Globe });
  }

  // Admin section
  const adminLinks = [
    { to: '/admin', label: t('nav.admin') || 'Admin Panel', icon: ShieldAlert },
    { to: '/admin/providers', label: t('nav.admin_providers') || 'Provider Ecosystem', icon: Server },
    { to: '/admin/partners', label: t('nav.admin_partners') || 'Partner Governance', icon: Building2 },
    { to: '/admin/analytics', label: t('nav.admin_analytics') || 'Product Analytics', icon: BarChart3 },
    { to: '/admin/growth', label: t('nav.admin_growth') || 'Growth & Acquisition', icon: BarChart3 },
    { to: '/admin/success', label: t('nav.admin_success') || 'Farmer Success', icon: Activity },
  ];

  const renderNavLink = (link: { to: string; label: string; icon: any }, isSub: boolean = false) => {
    const Icon = link.icon;
    const isActive = location.pathname === link.to;

    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-3 ${
          isSub ? 'px-3 py-2 text-xs font-medium' : 'px-3.5 py-2.5 text-xs font-bold'
        } rounded-xl transition-all duration-150 min-h-[42px] ${
          isActive 
            ? 'bg-brand-700 text-white shadow-sm font-extrabold' 
            : 'text-slate-600 dark:text-dark-300 hover:bg-slate-100/80 dark:hover:bg-dark-800/60 hover:text-slate-900 dark:hover:text-dark-100'
        }`}
      >
        <Icon size={isSub ? 16 : 18} className="shrink-0" />
        <span className="truncate">{link.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-dark-900 border-r border-slate-200/80 dark:border-dark-800/60 transition-transform duration-250 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dark-800/60">
          <NavLink to="/dashboard" onClick={() => setIsOpen(false)}>
            <BrandLogo variant="horizontal" size="md" />
          </NavLink>
          {/* Mobile close trigger */}
          <button
            onClick={() => setIsOpen(false)}
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-dark-200 hover:bg-slate-100 dark:hover:bg-dark-800"
            aria-label="Close Navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Context Badge */}
        <div className="px-3 py-2.5 mx-3 my-2.5 bg-brand-50/70 dark:bg-brand-950/30 border border-brand-100/80 dark:border-brand-900/30 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-700 text-white rounded-xl flex items-center justify-center font-black uppercase text-xs shrink-0 shadow-sm">
              {user?.name?.slice(0, 2) || 'TK'}
            </div>
            <div className="overflow-hidden text-left flex-1 min-w-0">
              <h4 className="font-extrabold text-xs text-slate-800 dark:text-dark-100 truncate">
                {user?.name || 'Farmer Account'}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block text-[9px] px-2 py-0.5 bg-brand-200/60 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 font-extrabold rounded-md uppercase">
                  {user?.role || 'Farmer'}
                </span>
                <NavLink 
                  to="/settings" 
                  onClick={() => setIsOpen(false)}
                  className="inline-block text-[9px] px-2 py-0.5 font-extrabold rounded-md uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:opacity-90"
                >
                  {user?.plan || 'Free'}
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 px-3 py-1 space-y-4 overflow-y-auto">
          {/* Section 1: Farmer Core */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-500">
              {t('nav.farming_operations') || 'Farming Operations'}
            </p>
            {farmLinks.map(link => renderNavLink(link))}
          </div>

          {/* Section 2: AI & Advisory */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-500">
              {t('nav.agronomy_intelligence') || 'Agronomy Intelligence'}
            </p>
            {aiLinks.map(link => renderNavLink(link))}
            {activityLinks.map(link => renderNavLink(link))}
          </div>

          {/* Section 3: More Services Accordion */}
          <div className="space-y-1">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              type="button"
              className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-500 hover:text-slate-600 dark:hover:text-dark-300 rounded-lg"
            >
              <span>{t('nav.more') || 'More Services'}</span>
              {moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {moreOpen && (
              <div className="pl-1 space-y-1">
                {moreLinks.map(link => renderNavLink(link, true))}
              </div>
            )}
          </div>

          {/* Section 4: Admin Section (if admin) */}
          {user?.role === 'admin' && (
            <div className="pt-2 border-t border-slate-100 dark:border-dark-800/50 space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-red-500/80">
                {t('nav.administration') || 'Administration'}
              </p>
              {adminLinks.map(link => renderNavLink(link))}
            </div>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 dark:border-dark-800/60 space-y-1">
          {onOpenRegionalSettings && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenRegionalSettings();
              }}
              type="button"
              className="flex items-center gap-3 w-full px-3.5 py-2.5 text-xs font-bold text-slate-600 dark:text-dark-300 hover:bg-slate-100/80 dark:hover:bg-dark-800/60 rounded-xl transition-colors min-h-[42px]"
            >
              <Globe size={18} className="text-slate-400" />
              <span>{t('settings.language_tab') || 'Language & Region'}</span>
            </button>
          )}

          <NavLink
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-600 dark:text-dark-300 hover:bg-slate-100/80 dark:hover:bg-dark-800/60 rounded-xl transition-colors min-h-[42px]"
          >
            <SettingsIcon size={18} className="text-slate-400" />
            <span>{t('nav.settings') || 'Settings'}</span>
          </NavLink>

          <button
            onClick={logout}
            type="button"
            className="flex items-center gap-3 w-full px-3.5 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors min-h-[42px]"
          >
            <LogOut size={18} />
            <span>{t('nav.logout') || 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
