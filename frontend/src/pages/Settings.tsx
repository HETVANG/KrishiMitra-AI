import React, { useState } from 'react';
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
  Settings as SettingsIcon
} from 'lucide-react';

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

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold bg-brand-600/60 px-3 py-1 rounded-full uppercase tracking-wider">
            Account & Preferences
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-2 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-brand-300" />
            Settings & Growth Center
          </h1>
          <p className="text-brand-100 text-xs mt-1 font-medium">
            Manage your farm profile, referrals, regional preferences, and application settings.
          </p>
        </div>
        <button
          onClick={() => setShowRegionalModal(true)}
          className="px-4 py-2.5 bg-white text-brand-800 hover:bg-brand-50 font-bold rounded-xl text-xs md:text-sm transition-all duration-150 flex items-center gap-2 shadow-sm min-h-[44px] shrink-0"
        >
          <Globe size={16} /> Regional Config
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
          Invite & Earn (Referrals)
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
          Language & App Preferences
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
              <Sparkles size={18} className="text-amber-500" /> Referral Rewards & Credits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">Step 1</span>
                <h4 className="font-bold text-xs text-gray-800 dark:text-dark-100">Share Your Code</h4>
                <p className="text-xs text-gray-500 dark:text-dark-400">Send your referral link to fellow farmers via WhatsApp or message.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">Step 2</span>
                <h4 className="font-bold text-xs text-gray-800 dark:text-dark-100">Farmer Registration</h4>
                <p className="text-xs text-gray-500 dark:text-dark-400">When your link is used, their account gets linked to your referral network.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">Step 3</span>
                <h4 className="font-bold text-xs text-gray-800 dark:text-dark-100">Earn Free Credits</h4>
                <p className="text-xs text-gray-500 dark:text-dark-400">Receive free NPK soil test credits & premium trial extensions.</p>
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
