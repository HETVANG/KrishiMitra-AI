import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ReferralWidget } from '../components/ReferralWidget';
import { RegionalSettingsModal } from '../components/RegionalSettingsModal';
import { 
  User, 
  Globe, 
  Moon, 
  Sun, 
  MapPin, 
  ShieldCheck, 
  Users, 
  Sparkles,
  Settings as SettingsIcon,
  Shield,
  FileText,
  Cookie,
  BellOff,
  Bell,
  Trash2
} from 'lucide-react';
import { requestNotificationPermission } from '../services/native';
import { toast } from 'react-toastify';

export const Settings: React.FC = () => {
  const { user, updateSettings } = useAuth();
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState<'referrals' | 'preferences'>('referrals');
  const [showRegionalModal, setShowRegionalModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const currentTheme = user?.settings?.theme || 'light';
  const currentLang = i18n.language || 'en';

  const handleLanguageChange = async (lang: string) => {
    try {
      setUpdating(true);
      i18n.changeLanguage(lang);
      localStorage.setItem('km-lang', lang);
      await updateSettings(lang, currentTheme, user?.farmLocation);
    } catch (err) {
      console.error('Failed to update language setting:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleThemeToggle = async () => {
    try {
      setUpdating(true);
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      await updateSettings(currentLang, nextTheme, user?.farmLocation);
    } catch (err) {
      console.error('Failed to toggle theme setting:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast.success('Push notifications enabled! You will now receive important agricultural and market alerts.');
    } else {
      toast.info('Notification permission was not granted. Please check your Android device notification settings for The Khedut.');
    }
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold bg-brand-600/60 px-3 py-1 rounded-full uppercase tracking-wider">
            {t('nav.settings') || 'Account & Preferences'}
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-2 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-brand-300" />
            {t('settings.title') || 'Settings & Account Profile'}
          </h1>
          <p className="text-brand-100 text-xs mt-1 font-medium">
            {t('settings.subtitle') || 'Manage your farm profile, referrals, regional preferences, and application settings.'}
          </p>
        </div>
        <button
          onClick={() => setShowRegionalModal(true)}
          className="px-4 py-2.5 bg-white text-brand-800 hover:bg-brand-50 font-bold rounded-xl text-xs md:text-sm transition-all duration-150 flex items-center gap-2 shadow-sm min-h-[44px] shrink-0"
        >
          <Globe size={16} /> {t('settings.language_tab') || 'Regional Config'}
        </button>
      </div>

      {/* User Quick Info */}
      <div className="bg-white dark:bg-dark-900 p-5 rounded-3xl border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg uppercase shadow-md shadow-brand-500/20">
            {user?.name?.slice(0, 2) || 'KM'}
          </div>
          <div>
            <h2 className="font-extrabold text-base text-gray-800 dark:text-dark-100">{user?.name}</h2>
            <p className="text-xs text-gray-500 dark:text-dark-400 font-medium mt-0.5">
              {user?.phone || user?.email} &bull; <span className="capitalize font-bold text-brand-600 dark:text-brand-400">{user?.role}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold uppercase">
            {user?.plan || 'Free'} Plan
          </span>
          {user?.farmLocation?.address && (
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-dark-800 dark:text-dark-300 font-medium flex items-center gap-1">
              <MapPin size={12} /> {user.farmLocation.address}
            </span>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-dark-800 gap-2">
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'referrals'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
              : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-200'
          }`}
        >
          <Users size={16} />
          {t('referral.tab_title') || 'Invite & Earn (Referrals)'}
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'preferences'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
              : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-200'
          }`}
        >
          <Globe size={16} />
          {t('settings.preferences_tab') || 'Language & App Preferences'}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Dedicated Referral Widget */}
          <ReferralWidget />

          {/* Referral Benefits Card */}
          <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" /> {t('referral.rewards_title') || 'Referral Rewards & Credits'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">{t('referral.step1_badge') || 'Step 1'}</span>
                <h4 className="font-bold text-xs text-gray-800 dark:text-dark-100">{t('referral.step1_title') || 'Share Your Code'}</h4>
                <p className="text-xs text-gray-500 dark:text-dark-400">{t('referral.step1_desc') || 'Send your referral link to fellow farmers via WhatsApp or message.'}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">{t('referral.step2_badge') || 'Step 2'}</span>
                <h4 className="font-bold text-xs text-gray-800 dark:text-dark-100">{t('referral.step2_title') || 'Farmer Registration'}</h4>
                <p className="text-xs text-gray-500 dark:text-dark-400">{t('referral.step2_desc') || 'When your link is used, their account gets linked to your referral network.'}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">{t('referral.step3_badge') || 'Step 3'}</span>
                <h4 className="font-bold text-xs text-gray-800 dark:text-dark-100">{t('referral.step3_title') || 'Earn Free Credits'}</h4>
                <p className="text-xs text-gray-500 dark:text-dark-400">{t('referral.step3_desc') || 'Receive free NPK soil test credits & premium trial extensions.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-6">
          {/* Language Selector */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <Globe size={18} className="text-brand-600 dark:text-brand-400" /> Regional Language Selection
            </h3>
            <p className="text-xs text-gray-500 dark:text-dark-400">
              Select your preferred language for farm advisory, voice assistance, and weather reports.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी (Hindi)' },
                { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
                { code: 'mr', label: 'मराठी (Marathi)' },
                { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
                { code: 'bn', label: 'বাংলা (Bengali)' },
                { code: 'ta', label: 'தமிழ் (Tamil)' },
                { code: 'te', label: 'తెలుగు (Telugu)' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  disabled={updating}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    currentLang === lang.code
                      ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                      : 'bg-gray-50 dark:bg-dark-850 border-gray-150 dark:border-dark-800 text-gray-700 dark:text-dark-300 hover:border-brand-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-dark-800" />

          {/* Appearance Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
                {currentTheme === 'dark' ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />} Theme Mode
              </h3>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">Switch between Light mode and Dark mode display.</p>
            </div>
            <button
              disabled={updating}
              onClick={handleThemeToggle}
              className="px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-dark-800 text-gray-800 dark:text-dark-100 font-extrabold text-xs hover:bg-gray-200 dark:hover:bg-dark-750 transition-colors self-start sm:self-auto min-h-[40px]"
            >
              Toggle to {currentTheme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>

          <hr className="border-gray-100 dark:border-dark-800" />

          {/* Push Notifications Configuration */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
                <Bell size={18} className="text-brand-600" /> Push Notifications
              </h3>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">
                Receive real-time alerts for Mandi price changes, weather warnings, and crop health advisories.
              </p>
            </div>
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs transition-colors self-start sm:self-auto min-h-[40px] shadow-sm flex items-center gap-2"
            >
              <Bell size={14} /> Enable Notifications
            </button>
          </div>

          <hr className="border-gray-100 dark:border-dark-800" />

          {/* Privacy, Data Protection & Legal Controls (DPDP Act 2023) */}
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
                <Shield size={18} className="text-brand-600" /> Privacy, Data & Legal Rights
              </h3>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">
                Manage your personal data preferences, legal agreements, and account erasure requests under DPDP Act 2023.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <Link
                to="/privacy"
                className="p-3.5 rounded-2xl border border-gray-150 dark:border-dark-800 bg-gray-50/70 dark:bg-dark-850/60 hover:border-brand-500 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-brand-600" />
                  <span className="font-bold text-gray-800 dark:text-dark-100">Privacy Policy</span>
                </div>
                <span className="text-[11px] text-brand-600 font-semibold">View &rarr;</span>
              </Link>

              <Link
                to="/terms"
                className="p-3.5 rounded-2xl border border-gray-150 dark:border-dark-800 bg-gray-50/70 dark:bg-dark-850/60 hover:border-brand-500 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-brand-600" />
                  <span className="font-bold text-gray-800 dark:text-dark-100">Terms of Service</span>
                </div>
                <span className="text-[11px] text-brand-600 font-semibold">View &rarr;</span>
              </Link>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('km_open_cookie_settings'))}
                className="p-3.5 rounded-2xl border border-gray-150 dark:border-dark-800 bg-gray-50/70 dark:bg-dark-850/60 hover:border-brand-500 flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Cookie size={16} className="text-amber-600" />
                  <span className="font-bold text-gray-800 dark:text-dark-100">Cookie & Storage Preferences</span>
                </div>
                <span className="text-[11px] text-brand-600 font-semibold">Manage &rarr;</span>
              </button>

              <Link
                to="/unsubscribe"
                className="p-3.5 rounded-2xl border border-gray-150 dark:border-dark-800 bg-gray-50/70 dark:bg-dark-850/60 hover:border-brand-500 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BellOff size={16} className="text-purple-600" />
                  <span className="font-bold text-gray-800 dark:text-dark-100">Marketing Unsubscribe</span>
                </div>
                <span className="text-[11px] text-brand-600 font-semibold">Opt Out &rarr;</span>
              </Link>
            </div>

            {/* Permanent Account Deletion Action */}
            <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-rose-900 dark:text-rose-200 text-xs flex items-center gap-1.5">
                  <Trash2 size={14} className="text-rose-600" /> Account & Data Deletion
                </span>
                <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-0.5">
                  Permanently delete your profile, crop scans, and chat history under DPDP Act 2023 & Google Play policies.
                </p>
              </div>
              <Link
                to="/data-deletion"
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
              >
                Request Deletion
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Regional Intelligence Settings Modal */}
      <RegionalSettingsModal
        isOpen={showRegionalModal}
        onClose={() => setShowRegionalModal(false)}
      />
    </div>
  );
};

export default Settings;
