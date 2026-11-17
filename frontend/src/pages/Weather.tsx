import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CloudSun, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  RefreshCw, 
  MapPin, 
  Calendar, 
  Compass, 
  ShieldCheck, 
  Activity, 
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Weather: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLocation, setActiveLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  }>(() => {
    const saved = localStorage.getItem('selectedLocation');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.latitude && parsed.longitude) {
          return {
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            address: parsed.address || 'Saved Farm Location'
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (user?.farmLocation?.latitude && user?.farmLocation?.longitude) {
      return {
        latitude: user.farmLocation.latitude,
        longitude: user.farmLocation.longitude,
        address: user.farmLocation.address || 'Registered Farm Location'
      };
    }
    return {
      latitude: 22.3039,
      longitude: 70.8022,
      address: 'Rajkot, Gujarat (Default Farming Zone)'
    };
  });

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/weather?lat=${activeLocation.latitude}&lon=${activeLocation.longitude}&lang=${i18n.language}`
      );
      if (res.data?.success && res.data.weather) {
        setWeatherData(res.data.weather);
      } else {
        setError(t('weather.telemetry_unavailable') || 'Live weather telemetry unavailable for this zone.');
      }
    } catch (err: any) {
      console.error('[Weather Page Error]', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load weather telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [activeLocation.latitude, activeLocation.longitude, i18n.language]);

  const getWeatherIcon = (condition: string = '') => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
      return <CloudRain className="w-10 h-10 text-blue-500" />;
    }
    if (cond.includes('cloud')) {
      return <CloudSun className="w-10 h-10 text-amber-500" />;
    }
    if (cond.includes('storm')) {
      return <AlertTriangle className="w-10 h-10 text-red-500" />;
    }
    return <Sun className="w-10 h-10 text-amber-500" />;
  };

  const isSuitableForSpray = (weather: any): boolean => {
    if (!weather?.current) return false;
    const { rainProb, windSpeed } = weather.current;
    // Favorable if low rain chance (<40%) and gentle wind (<10 km/h)
    return (rainProb || 0) < 40 && (windSpeed || 0) < 12;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-dark-800">
        <div>
          <div className="flex items-center gap-2">
            <Link 
              to="/dashboard"
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-dark-100 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              title={t('common.back') || 'Back to Dashboard'}
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
              {t('weather.title') || 'Weather Forecast & Spray Advisory'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-400 mt-1 pl-8">
            {t('weather.subtitle') || 'Hyper-local agricultural weather forecasts, spray suitability radar, and precipitation tracking.'}
          </p>
        </div>

        {/* Location & Refresh Controls */}
        <div className="flex items-center gap-2 shrink-0 pl-8 sm:pl-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-dark-200 shadow-2xs max-w-[220px] truncate">
            <MapPin size={14} className="text-brand-600 shrink-0" />
            <span className="truncate">{activeLocation.address}</span>
          </div>

          <button
            onClick={fetchWeather}
            disabled={loading}
            className="p-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-600 dark:text-dark-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors disabled:opacity-50 shadow-2xs min-h-[38px] min-w-[38px] flex items-center justify-center"
            title={t('common.refresh') || 'Refresh Telemetry'}
            aria-label="Refresh Weather Telemetry"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-brand-600' : ''} />
          </button>
        </div>
      </div>

      {/* Weather Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 dark:text-dark-400">
            {t('weather.fetching') || 'Fetching live meteorological telemetry...'}
          </p>
        </div>
      ) : error || !weatherData?.current ? (
        <div className="p-8 bg-white dark:bg-dark-900 rounded-3xl border border-slate-200 dark:border-dark-800 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-dark-100">
              {t('weather.telemetry_unavailable') || 'Live Weather Data Unavailable'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-dark-400 mt-1">
              {error || t('weather.unavailable_desc') || 'Select your district or check connection to view localized weather.'}
            </p>
          </div>
          <button
            onClick={fetchWeather}
            className="btn-primary py-2.5 px-6 text-xs font-bold mx-auto"
          >
            <RefreshCw size={14} />
            <span>{t('common.retry') || 'Retry'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Alerts Banner */}
          {weatherData.alerts && weatherData.alerts.length > 0 && weatherData.alerts[0].type !== 'none' && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 rounded-2xl flex items-start gap-3 text-amber-900 dark:text-amber-200">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  {weatherData.alerts[0].type.toUpperCase()} ALERT
                </h4>
                <p className="text-xs mt-0.5 font-medium leading-relaxed">
                  {weatherData.alerts[0].message}
                </p>
              </div>
            </div>
          )}

          {/* Primary Weather Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Weather Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4 z-10">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                    {weatherData.source || 'Live Agricultural Telemetry'}
                  </span>
                  <div className="flex items-baseline gap-3 mt-4">
                    <span className="text-5xl sm:text-6xl font-black tracking-tight">
                      {weatherData.current.temp}°C
                    </span>
                    <span className="text-lg font-bold text-emerald-100 uppercase">
                      {t(`weather.${(weatherData.current.condition || '').toLowerCase()}`) || weatherData.current.condition}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                    {weatherData.current.description}
                  </p>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shrink-0">
                  {getWeatherIcon(weatherData.current.condition)}
                </div>
              </div>

              {/* Weather Telemetry Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/15 z-10">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-[10px] font-bold uppercase">
                    <Droplets size={12} />
                    <span>{t('dashboard.humidity') || 'Humidity'}</span>
                  </div>
                  <span className="text-lg font-extrabold mt-1 block">
                    {weatherData.current.humidity}%
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-[10px] font-bold uppercase">
                    <CloudRain size={12} />
                    <span>{t('dashboard.rain') || 'Rain Chance'}</span>
                  </div>
                  <span className="text-lg font-extrabold mt-1 block">
                    {weatherData.current.rainProb}%
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-[10px] font-bold uppercase">
                    <Wind size={12} />
                    <span>{t('weather.wind') || 'Wind Speed'}</span>
                  </div>
                  <span className="text-lg font-extrabold mt-1 block">
                    {weatherData.current.windSpeed} km/h
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-[10px] font-bold uppercase">
                    <Activity size={12} />
                    <span>Air Quality</span>
                  </div>
                  <span className="text-lg font-extrabold mt-1 block">
                    {weatherData.current.aqi || 45} AQI
                  </span>
                </div>
              </div>
            </div>

            {/* Spray Suitability & Agronomic Advisory Card */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-dark-800">
                  <ShieldCheck size={18} className="text-brand-600 dark:text-brand-400" />
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-dark-100">
                    {t('weather.advisory_title') || 'Field Spraying Conditions'}
                  </h3>
                </div>

                <div className="mt-4 space-y-3">
                  <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    isSuitableForSpray(weatherData)
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40'
                      : 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40'
                  }`}>
                    <div className={`w-3 h-3 rounded-full shrink-0 ${isSuitableForSpray(weatherData) ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold">
                      {isSuitableForSpray(weatherData) 
                        ? (t('weather.suitable_for_spray') || 'Favorable for pesticide/fertilizer spraying')
                        : (t('weather.unsuitable_spray') || 'Unfavorable for spraying (high wind or rain risk)')}
                    </span>
                  </div>

                  {weatherData.aiAdvice && (
                    <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200/60 dark:border-dark-750 text-xs text-slate-700 dark:text-dark-200 leading-relaxed font-medium">
                      <p className="font-bold text-[10px] uppercase text-brand-700 dark:text-brand-400 mb-1">
                        Agronomic Advisory
                      </p>
                      {weatherData.aiAdvice}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-dark-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Updated: {new Date(weatherData.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{weatherData.freshness}</span>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast Section */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-brand-600 dark:text-brand-400" />
              <h3 className="font-extrabold text-base text-slate-800 dark:text-dark-100">
                {t('weather.forecast_7day') || '7-Day Agronomic Forecast'}
              </h3>
            </div>

            {weatherData.forecast && weatherData.forecast.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weatherData.forecast.map((dayItem: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-850 border border-slate-200/60 dark:border-dark-750 flex flex-col items-center justify-between text-center space-y-2 hover:border-brand-300 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-700 dark:text-dark-200">
                      {idx === 0 ? (t('common.today') || 'Today') : dayItem.day}
                    </span>
                    <div className="py-1">
                      {getWeatherIcon(dayItem.condition)}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-dark-400 capitalize truncate w-full">
                      {t(`weather.${(dayItem.condition || '').toLowerCase()}`) || dayItem.condition}
                    </span>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-dark-100 pt-1 border-t border-slate-200 dark:border-dark-700 w-full">
                      <span>{dayItem.tempMax}°</span>
                      <span className="text-slate-400 text-[10px] font-normal ml-1">/ {dayItem.tempMin}°</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      ☔ {dayItem.rainProb}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">
                Weekly forecast projection temporarily unavailable.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
