import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MapPin, Check, X, ShieldCheck, Globe, Info, RefreshCw } from 'lucide-react';

interface CountryItem {
  countryCode: string;
  countryName: string;
  supported: boolean;
  currency: string;
  currencySymbol: string;
  defaultLanguage: string;
  temperatureUnit: 'C' | 'F';
  landAreaUnit: 'acre' | 'hectare' | 'bigha';
  timezone: string;
}

interface RegionalContextData {
  countryCode: string;
  countryName: string;
  state: string;
  district: string;
  city: string;
  currency: string;
  currencySymbol: string;
  temperatureUnit: 'C' | 'F';
  landAreaUnit: 'acre' | 'hectare' | 'bigha';
  measurementSystem: 'metric' | 'imperial';
  timezone: string;
  supported: boolean;
  providers: {
    market: string;
    weather: string;
    agriculture: string;
  };
}

interface RegionalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const RegionalSettingsModal: React.FC<RegionalSettingsModalProps> = ({
  isOpen,
  onClose,
  onUpdated
}) => {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [context, setContext] = useState<RegionalContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    countryCode: 'IN',
    stateName: 'Gujarat',
    temperatureUnit: 'C' as 'C' | 'F',
    landAreaUnit: 'acre' as 'acre' | 'hectare' | 'bigha',
    measurementSystem: 'metric' as 'metric' | 'imperial',
    timezone: 'Asia/Kolkata'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [countriesRes, contextRes] = await Promise.all([
        api.get('/regions/countries'),
        api.get('/regions/context')
      ]);

      if (countriesRes.data?.success) {
        setCountries(countriesRes.data.data || []);
      }
      if (contextRes.data?.success && contextRes.data.data) {
        const ctx = contextRes.data.data;
        setContext(ctx);
        setForm({
          countryCode: ctx.countryCode || 'IN',
          stateName: ctx.state || 'Gujarat',
          temperatureUnit: ctx.temperatureUnit || 'C',
          landAreaUnit: ctx.landAreaUnit || 'acre',
          measurementSystem: ctx.measurementSystem || 'metric',
          timezone: ctx.timezone || 'Asia/Kolkata'
        });
      }
    } catch (err) {
      console.error('[RegionalSettingsModal] Error loading region data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/regions/context', form);
      if (res.data?.success) {
        if (onUpdated) onUpdated();
        onClose();
      }
    } catch (err) {
      console.error('[RegionalSettingsModal] Failed to save regional settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedCountryObj = countries.find(c => c.countryCode === form.countryCode);
  const isSelectedSupported = selectedCountryObj?.supported ?? true;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Regional Intelligence & Unit Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Country Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Country / Agricultural Market *
              </label>
              <select
                value={form.countryCode}
                onChange={e => setForm({ ...form, countryCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium"
              >
                {countries.map(c => (
                  <option key={c.countryCode} value={c.countryCode}>
                    {c.countryName} {c.supported ? '(Active Market)' : '(Coming Soon)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Support Warning Banner */}
            {!isSelectedSupported && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3.5 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong className="block font-bold">Coming Soon Region</strong>
                  Market price feeds and local weather integrations are in active development for this country. Currently active production market: <strong>India (IN)</strong>.
                </div>
              </div>
            )}

            {/* State / Province */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State / Province / Region
              </label>
              <input
                type="text"
                value={form.stateName}
                onChange={e => setForm({ ...form, stateName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                placeholder="e.g. Gujarat, Punjab, Maharashtra"
              />
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Temperature Unit
                </label>
                <select
                  value={form.temperatureUnit}
                  onChange={e => setForm({ ...form, temperatureUnit: e.target.value as 'C' | 'F' })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium"
                >
                  <option value="C">Celsius (°C)</option>
                  <option value="F">Fahrenheit (°F)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Land Area Unit
                </label>
                <select
                  value={form.landAreaUnit}
                  onChange={e => setForm({ ...form, landAreaUnit: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium"
                >
                  <option value="acre">Acres</option>
                  <option value="hectare">Hectares</option>
                  <option value="bigha">Bigha</option>
                </select>
              </div>
            </div>

            {/* Active Provider Badges */}
            {context?.providers && (
              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Active Regional Providers:</div>
                <div>&bull; Market: <span className="font-semibold text-slate-800 dark:text-slate-200">{context.providers.market}</span></div>
                <div>&bull; Weather: <span className="font-semibold text-slate-800 dark:text-slate-200">{context.providers.weather}</span></div>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-md shadow-brand-600/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegionalSettingsModal;
