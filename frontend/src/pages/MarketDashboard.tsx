import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  LineChart, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight,
  Heart,
  Activity,
  Layers,
  Sparkles,
  Info,
  Building2,
  Check
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export const MarketDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();

  // Core Market Intelligence Data
  const [intelligence, setIntelligence] = useState<any>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Filter States
  const [searchCrop, setSearchCrop] = useState('Wheat');
  const [searchState, setSearchState] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [periodDays, setPeriodDays] = useState<number>(7);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  // Status & Loading States
  const [loading, setLoading] = useState(false);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [watchlistUpdating, setWatchlistUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackSource, setFallbackSource] = useState<string | null>(null);

  const getTranslatedCropName = (englishName: string): string => {
    if (!englishName) return '';
    const clean = englishName.trim().toLowerCase();
    for (const cat of categories) {
      for (const item of cat.items) {
        if (
          item.displayName.toLowerCase() === clean || 
          item.apiCommodity.toLowerCase() === clean || 
          item.id.toLowerCase() === clean
        ) {
          return item.translations?.[i18n.language] || item.displayName;
        }
      }
    }
    return englishName;
  };

  // 1. Load Commodity Categories
  useEffect(() => {
    const loadCommodities = async () => {
      try {
        const res = await api.get('/market/commodities');
        if (res.data?.success) {
          setCategories(res.data.commodities || []);
        }
      } catch (err) {
        console.error('Failed to load crop catalog:', err);
      }
    };
    void loadCommodities();
  }, []);

  // 2. Fetch User Watchlist if Authenticated
  useEffect(() => {
    if (token) {
      api.get('/market/watchlist')
        .then(res => {
          if (res.data?.success) {
            setWatchlist(res.data.watchlist || []);
          }
        })
        .catch(err => console.warn('Failed to load watchlist:', err));
    }
  }, [token]);

  // 3. Fetch Unified Market Intelligence
  const fetchMarketIntelligence = async (cropName = searchCrop) => {
    setLoadingIntel(true);
    try {
      const query = new URLSearchParams({
        state: searchState,
        district: searchDistrict,
        lang: i18n.language
      });
      const res = await api.get(`/market/intelligence/${encodeURIComponent(cropName)}?${query.toString()}`);
      if (res.data?.success) {
        setIntelligence(res.data.intelligence);
      }
    } catch (err) {
      console.warn('Failed to fetch market intelligence:', err);
    } finally {
      setLoadingIntel(false);
    }
  };

  // 4. Fetch Prices List & Pagination
  const fetchPrices = async (targetPage = page, cropName = searchCrop) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: String(targetPage),
        limit: '8',
        crop: cropName,
        state: searchState,
        district: searchDistrict,
      });
      if (searchDate) query.set('date', searchDate);

      const res = await api.get(`/market/prices?${query.toString()}`);
      if (res.data?.success) {
        setPrices(res.data.prices || []);
        setPagination(res.data.pagination || null);
        setFallbackSource(res.data.fallbackSource || 'exact-match');
      } else {
        setError('Unable to load mandi prices right now.');
      }
    } catch (err: any) {
      console.error('Failed to load mandi prices:', err);
      setError(err.response?.data?.message || 'Failed to load mandi prices.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Fetch Historical Trend Data
  const fetchHistory = async (cropName = searchCrop, period = periodDays) => {
    setLoadingHistory(true);
    try {
      const query = new URLSearchParams({
        crop: cropName,
        state: searchState,
        district: searchDistrict,
        limit: String(period === 90 ? 90 : period === 30 ? 30 : 12),
      });
      const res = await api.get(`/market/history?${query.toString()}`);
      if (res.data?.success) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load mandi history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 6. Fetch Nearby Market Comparisons
  const fetchComparison = async (cropName = searchCrop) => {
    try {
      const query = new URLSearchParams({
        crop: cropName,
        state: searchState,
        district: searchDistrict,
        limit: '6'
      });
      const res = await api.get(`/market/compare?${query.toString()}`);
      if (res.data?.success) {
        setComparison(res.data.comparison);
      }
    } catch (err) {
      console.warn('Failed to fetch market comparisons:', err);
    }
  };

  // Master fetch trigger
  const runMasterFetch = (cropName = searchCrop, pDays = periodDays, targetPage = 1) => {
    void fetchMarketIntelligence(cropName);
    void fetchPrices(targetPage, cropName);
    void fetchHistory(cropName, pDays);
    void fetchComparison(cropName);
  };

  useEffect(() => {
    runMasterFetch(searchCrop, periodDays, 1);
  }, [searchCrop, periodDays, searchState]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    runMasterFetch(searchCrop, periodDays, 1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/market/sync');
      runMasterFetch(searchCrop, periodDays, page);
    } catch (err) {
      console.error('Failed to refresh mandi prices:', err);
      setError('Refresh failed. The app will continue using the latest cached prices.');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!token) {
      alert('Please sign in to save commodities to your watchlist.');
      return;
    }

    setWatchlistUpdating(true);
    try {
      if (intelligence?.isWatchlisted) {
        await api.delete(`/market/watchlist/${encodeURIComponent(searchCrop)}`);
        setIntelligence((prev: any) => prev ? { ...prev, isWatchlisted: false } : null);
        setWatchlist((prev) => prev.filter((w) => w.crop.toLowerCase() !== searchCrop.toLowerCase()));
      } else {
        await api.post('/market/watchlist', { crop: searchCrop, state: searchState, district: searchDistrict });
        setIntelligence((prev: any) => prev ? { ...prev, isWatchlisted: true } : null);
        const updatedList = await api.get('/market/watchlist');
        if (updatedList.data?.success) {
          setWatchlist(updatedList.data.watchlist || []);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update watchlist.');
    } finally {
      setWatchlistUpdating(false);
    }
  };

  const getTrendBadgeStyle = (trend?: string) => {
    switch (trend) {
      case 'RISING':
        return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200';
      case 'FALLING':
        return 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200';
      case 'STABLE':
        return 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200';
      default:
        return 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 border-gray-200';
    }
  };

  const getVolatilityBadgeStyle = (volatility?: string) => {
    switch (volatility) {
      case 'HIGH':
        return 'bg-red-500 text-white font-bold';
      case 'MODERATE':
        return 'bg-amber-500 text-white font-bold';
      case 'LOW':
        return 'bg-emerald-500 text-white font-bold';
      default:
        return 'bg-gray-500 text-white font-bold';
    }
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-6 rounded-3xl shadow-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LineChart size={24} className="text-amber-200" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Market Intelligence Engine (eNAM)</h1>
          </div>
          <p className="text-amber-100 text-xs md:text-sm mt-1 font-medium max-w-2xl">
            Live Mandi rates, 7D/30D price trends, regional market comparisons, volatility scores, and watchlist intelligence.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 font-bold rounded-xl text-xs md:text-sm shadow-sm transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Syncing Mandis...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* User Watchlist Bar */}
      {token && watchlist.length > 0 && (
        <div className="bg-white dark:bg-dark-900 rounded-3xl p-4 border border-gray-100 dark:border-dark-800/30 shadow-sm flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-2">
            <Heart size={14} className="text-red-500 fill-red-500" /> Watchlist:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {watchlist.map((w) => (
              <button
                key={w.crop}
                onClick={() => {
                  setSearchCrop(w.crop);
                  if (w.state) setSearchState(w.state);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  searchCrop.toLowerCase() === w.crop.toLowerCase()
                    ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-gray-50 dark:bg-dark-850 border-gray-200 dark:border-dark-800 text-gray-700 dark:text-dark-200 hover:border-amber-300'
                }`}
              >
                <span>{getTranslatedCropName(w.crop)}</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  {w.currentPrice ? `₹${w.currentPrice}` : 'N/A'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Form */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Target Commodity / Crop</label>
            <input
              type="text"
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              placeholder="e.g. Wheat, Tomato"
              className="custom-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">State</label>
            <select value={searchState} onChange={(e) => setSearchState(e.target.value)} className="custom-input text-sm">
              <option value="">All States</option>
              <option value="Haryana">Haryana</option>
              <option value="Punjab">Punjab</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">District / Mandi</label>
            <input type="text" value={searchDistrict} onChange={(e) => setSearchDistrict(e.target.value)} placeholder="e.g. Karnal" className="custom-input text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Date Filter</label>
            <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="custom-input text-sm" />
          </div>
          <button type="submit" className="btn-primary py-3 flex items-center justify-center gap-1.5 min-h-[44px]">
            <Search size={16} />
            <span>Search Mandi Rates</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Main Intelligence Overview Card */}
      {intelligence && (
        <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-dark-800">
            <div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase border ${getTrendBadgeStyle(intelligence.trend7d?.trend)}`}>
                  7D Trend: {intelligence.trend7d?.trend || 'STABLE'}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${getVolatilityBadgeStyle(intelligence.trend7d?.volatility)}`}>
                  {intelligence.trend7d?.volatility || 'LOW'} Volatility
                </span>
                <span className="text-[10px] text-gray-400 font-bold bg-gray-50 dark:bg-dark-800 px-2 py-0.5 rounded-full uppercase">
                  Source: {intelligence.currentPrice?.source || 'agmarknet'}
                </span>
              </div>

              <h2 className="font-extrabold text-2xl md:text-3xl text-gray-800 dark:text-dark-100 mt-2">
                {getTranslatedCropName(intelligence.commodity)}
              </h2>
              <p className="text-xs text-gray-400 dark:text-dark-500 font-semibold mt-0.5">
                Arrival Date: {intelligence.currentPrice?.arrivalDate} | Updated: {new Date(intelligence.currentPrice?.sourceTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Current Modal Rate</span>
                <span className="block font-extrabold text-2xl md:text-3xl text-amber-600 dark:text-amber-400">
                  {intelligence.currentPrice?.modalPrice === null ? 'Price Unavailable' : `₹${intelligence.currentPrice.modalPrice}`}
                </span>
                {intelligence.currentPrice?.modalPrice !== null && (
                  <span className="text-[10px] text-gray-400 font-bold">per {intelligence.currentPrice.unit}</span>
                )}
              </div>

              {token && (
                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistUpdating}
                  className={`p-3 rounded-2xl border transition-all ${
                    intelligence.isWatchlisted
                      ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/30'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-500 dark:bg-dark-850 dark:border-dark-800'
                  }`}
                  title={intelligence.isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  <Heart size={20} className={intelligence.isWatchlisted ? 'fill-red-500' : ''} />
                </button>
              )}
            </div>
          </div>

          {/* 7-Day & 30-Day Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left pt-1">
            <div className="p-3.5 bg-gray-50/70 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800/40">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">7D Price Change</span>
              <span className={`text-base font-extrabold mt-1 block ${
                (intelligence.trend7d?.percentageChange || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {intelligence.trend7d?.percentageChange !== null
                  ? `${intelligence.trend7d.percentageChange >= 0 ? '+' : ''}${intelligence.trend7d.percentageChange}% (₹${intelligence.trend7d.absoluteChange})`
                  : 'N/A'
                }
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/70 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800/40">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">7D Range (Min - Max)</span>
              <span className="text-base font-extrabold text-gray-800 dark:text-dark-100 mt-1 block">
                {intelligence.trend7d?.lowestPrice ? `₹${intelligence.trend7d.lowestPrice} - ₹${intelligence.trend7d.highestPrice}` : 'N/A'}
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/70 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800/40">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">7D Regional Average</span>
              <span className="text-base font-extrabold text-gray-800 dark:text-dark-100 mt-1 block">
                {intelligence.trend7d?.averagePrice ? `₹${intelligence.trend7d.averagePrice}` : 'N/A'}
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/70 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800/40">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">30D Price Trend</span>
              <span className="text-base font-extrabold text-brand-600 dark:text-brand-400 mt-1 block">
                {intelligence.trend30d?.percentageChange !== null
                  ? `${intelligence.trend30d.percentageChange >= 0 ? '+' : ''}${intelligence.trend30d.percentageChange}%`
                  : 'N/A'
                }
              </span>
            </div>
          </div>

          {/* Agronomic Advisory Summary */}
          {intelligence.advisory && (
            <div className="p-4 bg-amber-50/40 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/20 rounded-2xl space-y-2">
              <h4 className="font-bold text-xs md:text-sm text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles size={16} /> Market Intelligence Summary & Advisory
              </h4>
              <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed">
                {intelligence.advisory.summary}
              </p>
              <div className="space-y-1 pt-1">
                {intelligence.advisory.keyInsights?.map((ins: string, idx: number) => (
                  <div key={idx} className="text-[11px] text-gray-600 dark:text-dark-350 flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid: Historical Chart (7 cols) + Regional Nearby Mandi Comparison (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Historical Price Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-dark-850 pb-3">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <LineChart className="text-amber-600" size={18} /> {getTranslatedCropName(searchCrop) || 'Crop'} Price History Chart
            </h3>

            {/* Timeline Period Selector */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-850 p-1 rounded-xl">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setPeriodDays(d);
                    void fetchHistory(searchCrop, d);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    periodDays === d ? 'bg-white dark:bg-dark-900 text-amber-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          <div className="h-[280px] w-full">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full text-amber-600">
                <div className="w-8 h-8 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
              </div>
            ) : history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="avgPrice" name="Average Price (₹/Qtl)" stroke="#F59E0B" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="minPrice" name="Min Price" stroke="#EF4444" fillOpacity={0} strokeWidth={1} strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="maxPrice" name="Max Price" stroke="#10B981" fillOpacity={0} strokeWidth={1} strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <HelpCircle size={36} className="text-gray-300 mb-1" />
                <p className="font-bold text-xs">No historical trend data recorded for this period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Regional Nearby Mandi Comparison (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center justify-between">
            <span className="flex items-center gap-2"><Building2 className="text-amber-600" size={18} /> Nearby Mandi Comparisons</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Regional Mandis</span>
          </h3>

          {comparison && comparison.comparisons?.length > 0 ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100/50 dark:border-amber-900/10 text-xs flex justify-between items-center">
                <span>Regional Average Modal Price:</span>
                <strong className="font-extrabold text-amber-700 dark:text-amber-400">₹{comparison.regionalAverage}/Qtl</strong>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {comparison.comparisons.map((c: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50/70 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-dark-100">{c.market} Mandi</h4>
                      <p className="text-[10px] text-gray-400">{c.district}, {c.state}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-gray-800 dark:text-dark-100 block">
                        {c.modalPrice ? `₹${c.modalPrice}` : 'N/A'}
                      </span>
                      {c.priceDifference !== null && (
                        <span className={`text-[9px] font-bold ${c.priceDifference >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {c.priceDifference >= 0 ? `+₹${c.priceDifference}` : `-₹${Math.abs(c.priceDifference)}`} vs Avg
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs font-semibold">
              No nearby regional mandi comparisons available.
            </div>
          )}
        </div>
      </div>

      {/* Mandi Listings Table */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center justify-between">
          <span>Live Mandi Price Directory</span>
          {fallbackSource && fallbackSource !== 'exact-match' && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md">
              Showing fallback level: {fallbackSource}
            </span>
          )}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-800 text-gray-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-2">Market / Mandi</th>
                <th className="py-3 px-2">District / State</th>
                <th className="py-3 px-2">Commodity</th>
                <th className="py-3 px-2 text-right">Min Rate</th>
                <th className="py-3 px-2 text-right">Modal Rate</th>
                <th className="py-3 px-2 text-right">Max Rate</th>
                <th className="py-3 px-2 text-right">Arrival Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-850">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-amber-600">
                    <div className="w-6 h-6 border-2 border-t-transparent border-amber-500 rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : prices.length > 0 ? (
                prices.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-dark-850/50">
                    <td className="py-3 px-2 font-bold text-gray-800 dark:text-dark-100">{p.market || p.mandiName}</td>
                    <td className="py-3 px-2 text-gray-500 dark:text-dark-400">{p.district}, {p.state}</td>
                    <td className="py-3 px-2 font-semibold text-amber-700 dark:text-amber-400">{getTranslatedCropName(p.crop)}</td>
                    <td className="py-3 px-2 text-right text-gray-600 dark:text-dark-300">
                      {p.minPrice === 0 && !p.isTrulyZero ? 'N/A' : `₹${p.minPrice}`}
                    </td>
                    <td className="py-3 px-2 text-right font-extrabold text-amber-600 dark:text-amber-400">
                      {(p.modalPrice || p.avgPrice) === 0 && !p.isTrulyZero ? 'Price Not Available' : `₹${p.modalPrice || p.avgPrice}`}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-600 dark:text-dark-300">
                      {p.maxPrice === 0 && !p.isTrulyZero ? 'N/A' : `₹${p.maxPrice}`}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-400">
                      {p.date ? new Date(p.date).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No mandi rates matched your active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-dark-850">
            <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => { const next = Math.max(1, page - 1); setPage(next); void fetchPrices(next); }} 
                className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:text-amber-600"
              >
                <ArrowLeft size={14} /> Prev
              </button>
              <button 
                type="button" 
                onClick={() => { const next = Math.min(pagination.totalPages, page + 1); setPage(next); void fetchPrices(next); }} 
                className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:text-amber-600"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
