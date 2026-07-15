import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LeafletMap } from '../components/LeafletMap';
import { 
  CloudSun, 
  MapPin, 
  TrendingUp, 
  Sprout, 
  AlertTriangle, 
  IndianRupee,
  Layers,
  Coins,
  ChevronRight,
  TrendingDown,
  Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

export const Dashboard: React.FC = () => {
  const { user, setFarmLocationLocally } = useAuth();
  const { t, i18n } = useTranslation();

  const [weather, setWeather] = useState<any>(null);
  const [mandiPrices, setMandiPrices] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingMandi, setLoadingMandi] = useState(true);

  // Default coordinate location (Karnal, Haryana) if user geolocation is unconfigured
  const lat = user?.farmLocation?.latitude || 29.6857;
  const lon = user?.farmLocation?.longitude || 76.9905;

  const getTrialDaysRemaining = (): number => {
    if (!user?.trialEndDate) return 0;
    const diffTime = new Date(user.trialEndDate).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const trialDaysLeft = getTrialDaysRemaining();
  const isTrialActive = user?.subscriptionStatus === 'trialing' && trialDaysLeft > 0;
  const isTrialExpired = user?.plan === 'free' && (user.subscriptionStatus === 'expired' || (user.trialEndDate && new Date(user.trialEndDate) < new Date()));
  const shouldShowExpiringAlert = isTrialActive && [30, 15, 7, 3, 1].includes(trialDaysLeft);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Fetch Weather coordinates
      try {
        setLoadingWeather(true);
        const res = await api.get(`/weather?lat=${lat}&lon=${lon}&lang=${i18n.language}`);
        if (res.data && res.data.success) {
          setWeather(res.data.weather);
        }
      } catch (err) {
        console.error('Error loading weather dashboard:', err);
      } finally {
        setLoadingWeather(false);
      }

      // 2. Fetch Mandi price trends
      try {
        setLoadingMandi(true);
        const res = await api.get(`/market/search?state=Haryana&crop=Wheat&lang=${i18n.language}`);
        if (res.data && res.data.success) {
          setMandiPrices(res.data.prices.slice(0, 4));
        }
      } catch (err) {
        console.error('Error loading mandi prices dashboard:', err);
      } finally {
        setLoadingMandi(false);
      }

      // 3. Fetch Financial analytics summary
      try {
        const res = await api.get('/expenses/summary');
        if (res.data && res.data.success) {
          setFinancials(res.data.summary);
        }
      } catch (err) {
        console.error('Error loading financials dashboard:', err);
      }
    };

    fetchDashboardData();
  }, [lat, lon, i18n.language]);

  const handleMapBoundaryChange = async (coords: [number, number][]) => {
    if (coords.length > 0) {
      try {
        const address = `Karnal, Haryana`;
        const res = await api.post('/crops/farm', {
          name: `${user?.name}'s Field`,
          size: coords.length * 0.4,
          soilType: 'Loamy',
          waterSource: 'Tube Well',
          boundary: coords
        });
        if (res.data && res.data.success) {
          setFarmLocationLocally({
            latitude: coords[0][0],
            longitude: coords[0][1],
            address
          });
        }
      } catch (err) {
        console.error('Failed to autosave boundary:', err);
      }
    }
  };

  // Text-To-Speech for weather advisory summaries
  const speakAdvisory = () => {
    if ('speechSynthesis' in window && weather?.aiAdvice) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(weather.aiAdvice);
      utterance.lang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'gu' ? 'gu-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mock static alerts for farmer dashboard
  const staticAlerts = [
    { id: 1, type: 'warning', title: 'Heavy Rain Forecast', message: 'Heavy shower predicted in 48 hours. Clear drainage channels.', date: 'Today' },
    { id: 2, type: 'info', title: 'Subsidy Deadline Approaching', message: 'PMFBY Kharif Crop insurance application closes next week.', date: 'Yesterday' },
  ];

  const chartData = financials?.chartData || [
    { name: 'Seeds', value: 4500 },
    { name: 'Fertilizer', value: 8000 },
    { name: 'Labor', value: 12000 },
    { name: 'Fuel', value: 3500 },
    { name: 'Equipment', value: 6200 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-700 to-brand-900 text-white p-6 rounded-3xl shadow-lg text-left">
        <div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-extrabold bg-brand-600/60 px-3 py-1 rounded-full uppercase tracking-wider">
              {user?.role} Portal
            </span>
            {isTrialActive && (
              <span className="text-[10px] font-bold bg-amber-500/80 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                Premium Trial: {trialDaysLeft} days left
              </span>
            )}
            {user?.plan === 'premium' && (
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                Premium Member
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-2">
            {t('dashboard.welcome')}, {user?.name}!
          </h1>
          <p className="text-brand-100 text-xs mt-1 font-medium">
            Here is your localized farm dashboard intelligence summaries.
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/reports" 
            className="px-4 py-2.5 bg-white text-brand-850 hover:bg-brand-50 font-bold rounded-xl text-xs md:text-sm transition-all duration-150 flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Layers size={16} /> {t('common.download')} PDF Reports
          </Link>
        </div>
      </div>

      {/* Trial Reminders & Alerts */}
      {shouldShowExpiringAlert && (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/35 p-4 rounded-2xl text-left text-xs md:text-sm text-amber-800 dark:text-amber-400 font-bold flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>⚠️ Your Premium Trial will expire in {trialDaysLeft} day{trialDaysLeft > 1 ? 's' : ''}. Upgrade to Premium to keep using NPK fertilizer planners, expert booking, and PDF downloads.</span>
          <Link to="/pricing" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors min-h-[36px] flex items-center shrink-0">
            Upgrade Now
          </Link>
        </div>
      )}

      {isTrialExpired && (
        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30 p-4 rounded-2xl text-left text-xs md:text-sm text-blue-800 dark:text-blue-400 font-bold flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>ℹ️ Your Premium Trial has ended. You are now on the Free Plan. Upgrade anytime to unlock Premium features.</span>
          <Link to="/pricing" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors min-h-[36px] flex items-center shrink-0">
            Upgrade to Premium
          </Link>
        </div>
      )}

      {/* Grid Layout Weather & Financial Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weather Card (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-dark-805 pb-4 mb-4">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <CloudSun className="text-brand-600 dark:text-brand-400" size={20} /> {t('dashboard.weather')}
            </h3>
            <span className="text-xs text-gray-400 dark:text-dark-500 font-bold">
              {user?.farmLocation?.address || 'Karnal, Haryana'}
            </span>
          </div>

          {loadingWeather ? (
            <div className="flex items-center justify-center py-10 text-brand-600">
              <div className="w-8 h-8 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-dark-50 tracking-tighter">
                    {weather?.current?.temp}°C
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-750 dark:text-dark-200 uppercase tracking-wide">
                      {weather?.current?.condition}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-dark-500 capitalize">
                      {weather?.current?.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-brand-50 dark:bg-brand-950/20 text-brand-800 dark:text-brand-400 font-bold rounded-lg text-xs">
                    {t('dashboard.aqi')}: {weather?.current?.aqi}
                  </span>
                </div>
              </div>

              {/* Climate parameters grids */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-dark-850 p-4 rounded-2xl border border-gray-100/40 dark:border-dark-800/10">
                <div className="text-center p-2 border-r border-gray-200/50 dark:border-dark-800">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t('dashboard.humidity')}</span>
                  <span className="block text-sm font-extrabold text-gray-700 dark:text-dark-200 mt-1">{weather?.current?.humidity}%</span>
                </div>
                <div className="text-center p-2 sm:border-r border-gray-200/50 dark:border-dark-800">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t('dashboard.wind')}</span>
                  <span className="block text-sm font-extrabold text-gray-700 dark:text-dark-200 mt-1">{weather?.current?.windSpeed} m/s</span>
                </div>
                <div className="text-center p-2 border-r border-gray-200/50 dark:border-dark-800">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t('dashboard.rain')}</span>
                  <span className="block text-sm font-extrabold text-gray-700 dark:text-dark-200 mt-1">{weather?.current?.rainProb}%</span>
                </div>
                <div className="text-center p-2">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Precipitation</span>
                  <span className="block text-sm font-extrabold text-gray-700 dark:text-dark-200 mt-1">Light</span>
                </div>
              </div>

              {/* AI Weather Advice */}
              {weather?.aiAdvice && (
                <div className="bg-brand-50/50 dark:bg-brand-950/20 p-4 rounded-xl border border-brand-100/50 dark:border-brand-900/10 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="block text-[10px] text-brand-700 dark:text-brand-400 font-extrabold uppercase mb-1">AI Crop Advisory Advice</span>
                    <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed font-medium">
                      {weather?.aiAdvice}
                    </p>
                  </div>
                  <button
                    onClick={speakAdvisory}
                    className="p-2.5 bg-brand-100 dark:bg-brand-900/50 hover:bg-brand-200 text-brand-800 dark:text-brand-400 rounded-xl shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                    title={t('common.read_aloud')}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Financial Expense Pie Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-dark-800 pb-4 mb-4">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <IndianRupee className="text-brand-600 dark:text-brand-400" size={20} /> {t('dashboard.ledger')}
            </h3>
            <Link to="/expenses" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center min-h-[44px] px-2">
              Logs <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100/40 text-left">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Income</span>
                <span className="block text-base font-extrabold text-emerald-600 mt-1">₹{financials?.totalIncome || 0}</span>
              </div>
              <div className="bg-red-50/50 dark:bg-red-950/10 p-3 rounded-xl border border-red-100/40 text-left">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Expenses</span>
                <span className="block text-base font-extrabold text-red-550 mt-1">₹{financials?.totalExpense || 0}</span>
              </div>
            </div>

            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" fill="#34D399" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout Farm Map & Mandi prices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="text-left">
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
                <MapPin className="text-brand-600 dark:text-brand-400" size={20} /> {t('dashboard.map')}
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-dark-500 mt-0.5 font-medium">Click to draw farm boundary bounds.</p>
            </div>
            <span className="text-xs font-semibold text-gray-405">
              GPS Enabled
            </span>
          </div>

          <div className="h-[280px] w-full rounded-2xl overflow-hidden mt-3">
            <LeafletMap 
              initialCenter={[lat, lon]}
              onBoundaryChange={handleMapBoundaryChange}
              markers={[
                { position: [29.6857, 76.9905], title: 'Karnal Mandi', popupText: 'Current wheat average: ₹2225/Qtl', type: 'mandi' },
                { position: [29.7050, 77.0120], title: 'Karnal Weather Station', popupText: 'Active station telemetry: Ok', type: 'station' }
              ]}
            />
          </div>
        </div>

        {/* Mandi Prices List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-dark-800 pb-4 mb-3">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <TrendingUp className="text-brand-600 dark:text-brand-400" size={20} /> {t('dashboard.mandi')}
            </h3>
            <Link to="/market" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center min-h-[44px] px-2">
              Market <ChevronRight size={14} />
            </Link>
          </div>

          {loadingMandi ? (
            <div className="flex items-center justify-center py-10 text-brand-600">
              <div className="w-6 h-6 border-3 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-dark-800/50">
              {mandiPrices.length > 0 ? (
                mandiPrices.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="text-left">
                      <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-200">{item.crop}</h4>
                      <p className="text-[10px] text-gray-400 dark:text-dark-505">{item.mandiName} | {item.state}</p>
                    </div>
                    <div className="text-right">
                      <span className="block font-extrabold text-xs md:text-sm text-gray-800 dark:text-dark-200">
                        ₹{item.avgPrice}
                      </span>
                      <span className="text-[9px] text-emerald-650 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded uppercase">
                        MSP Linked
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-gray-400">No mandi prices found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alerts and system notifications */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm text-left">
        <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2 mb-4 border-b border-gray-50 dark:border-dark-800 pb-4">
          <AlertTriangle className="text-red-500" size={20} /> {t('dashboard.recent_alerts')}
        </h3>

        <div className="space-y-3">
          {staticAlerts.map((item) => (
            <div key={item.id} className="flex gap-3 p-3.5 bg-gray-50 dark:bg-dark-800/50 border border-gray-200/50 dark:border-dark-800 rounded-2xl items-start">
              <div className={`p-2 rounded-xl text-white ${item.type === 'warning' ? 'bg-red-500' : 'bg-brand-500'}`}>
                <AlertTriangle size={15} />
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm text-gray-850 dark:text-dark-200">{item.title}</h4>
                <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
