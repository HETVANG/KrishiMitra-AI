import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { Search, TrendingUp, TrendingDown, HelpCircle, LineChart, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MarketDashboard: React.FC = () => {
  const [prices, setPrices] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [searchCrop, setSearchCrop] = useState('');
  const [searchState, setSearchState] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrices = async (targetPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: String(targetPage),
        limit: '8',
        crop: searchCrop,
        state: searchState,
        district: searchDistrict,
      });
      if (searchDate) query.set('date', searchDate);

      const res = await api.get(`/market/prices?${query.toString()}`);
      if (res.data?.success) {
        setPrices(res.data.prices || []);
        setAnalytics(res.data.analytics || null);
        setPagination(res.data.pagination || null);
        setLastUpdated(res.data.lastUpdated ? new Date(res.data.lastUpdated).toLocaleString('en-IN') : null);
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

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const query = new URLSearchParams({
        crop: searchCrop || 'Potato',
        state: searchState || 'West Bengal',
        district: searchDistrict || 'Hooghly',
        limit: '12',
      });
      if (searchDate) query.set('date', searchDate);
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

  const fetchTrending = async () => {
    setLoadingTrending(true);
    try {
      const res = await api.get('/market/trending');
      if (res.data?.success) {
        setTrending(res.data.trending || []);
      }
    } catch (err) {
      console.error('Failed to load mandi trends:', err);
    } finally {
      setLoadingTrending(false);
    }
  };

  useEffect(() => {
    void fetchPrices(1);
    void fetchHistory();
    void fetchTrending();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchPrices(1);
    void fetchHistory();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/market/sync');
      await fetchPrices(page);
      await fetchHistory();
      await fetchTrending();
    } catch (err) {
      console.error('Failed to refresh mandi prices:', err);
      setError('Refresh failed. The app will continue using the latest cached prices.');
    } finally {
      setRefreshing(false);
    }
  };

  const metrics = useMemo(() => {
    const items = prices || [];
    const minPrice = items.length > 0 ? Math.min(...items.map((p) => Number(p.minPrice || 0))) : 0;
    const maxPrice = items.length > 0 ? Math.max(...items.map((p) => Number(p.maxPrice || 0))) : 0;
    const avgPrice = items.length > 0 ? Math.round(items.reduce((acc, p) => acc + Number(p.avgPrice || p.modalPrice || 0), 0) / items.length) : 0;
    return { minPrice, maxPrice, avgPrice };
  }, [prices]);

  const trendCards = useMemo(() => {
    if (!trending.length) {
      return [
        { name: 'Wheat', growth: '+2.1%', trend: 'up', price: '₹2200/Qtl' },
        { name: 'Mustard', growth: '+1.4%', trend: 'up', price: '₹5500/Qtl' },
        { name: 'Cotton', growth: '+0.8%', trend: 'up', price: '₹6500/Qtl' },
      ];
    }

    return trending.slice(0, 4).map((item) => {
      const diff = Number(item.maxPrice || 0) - Number(item.minPrice || 0);
      const pct = Number(item.minPrice || 0) > 0 ? (diff / Number(item.minPrice)) * 100 : 2.5;
      return {
        name: item.crop,
        growth: `+${pct.toFixed(1)}%`,
        trend: 'up',
        price: `₹${item.avgPrice || item.modalPrice || 0}/Qtl`
      };
    });
  }, [trending]);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-amber-500 to-amber-700 text-white p-6 rounded-3xl shadow-lg flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">National Agriculture Market (eNAM) Index</h1>
          <p className="text-amber-50 text-xs md:text-sm mt-1 font-medium">Live mandi wholesale prices, historical trends, and daily analytics from the backend sync pipeline.</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="btn-primary py-2.5 px-4 flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Target Crop</label>
            <input type="text" value={searchCrop} onChange={(e) => setSearchCrop(e.target.value)} placeholder="e.g. Wheat" className="custom-input text-sm" />
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
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">District / Market</label>
            <input type="text" value={searchDistrict} onChange={(e) => setSearchDistrict(e.target.value)} placeholder="e.g. Karnal" className="custom-input text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Date</label>
            <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="custom-input text-sm" />
          </div>
          <button type="submit" className="btn-primary py-3 flex items-center justify-center gap-1.5">
            <Search size={16} />
            <span>Search Mandis</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Today', value: `₹${analytics.todayPrice || 0}`, tone: 'text-amber-600' },
            { label: 'Yesterday', value: `₹${analytics.yesterdayPrice || 0}`, tone: 'text-gray-700' },
            { label: 'Difference', value: `${analytics.difference >= 0 ? '+' : ''}${analytics.difference}`, tone: analytics.difference >= 0 ? 'text-emerald-600' : 'text-red-500' },
            { label: 'Change %', value: `${analytics.percentageChange >= 0 ? '+' : ''}${analytics.percentageChange.toFixed(1)}%`, tone: analytics.percentageChange >= 0 ? 'text-emerald-600' : 'text-red-500' },
          ].map((card) => (
            <div key={card.label} className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 p-5 rounded-3xl shadow-sm text-left">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{card.label}</p>
              <p className={`text-xl font-extrabold mt-2 ${card.tone}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Minimum Mandi Rate</span>
          <span className="text-2xl md:text-3xl font-extrabold text-red-550 block mt-2 text-red-500">₹{metrics.minPrice} <span className="text-xs font-medium text-gray-400">/ Quintal</span></span>
          <div className="absolute right-6 bottom-6 text-red-100 dark:text-red-950/20"><TrendingDown size={36} /></div>
        </div>
        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Average Mandi Rate</span>
          <span className="text-2xl md:text-3xl font-extrabold text-brand-600 dark:text-brand-450 block mt-2">₹{metrics.avgPrice} <span className="text-xs font-medium text-gray-400">/ Quintal</span></span>
          <div className="absolute right-6 bottom-6 text-brand-100 dark:text-brand-950/20"><TrendingUp size={36} /></div>
        </div>
        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Maximum Mandi Rate</span>
          <span className="text-2xl md:text-3xl font-extrabold text-emerald-600 block mt-2">₹{metrics.maxPrice} <span className="text-xs font-medium text-gray-400">/ Quintal</span></span>
          <div className="absolute right-6 bottom-6 text-emerald-100 dark:text-emerald-950/20"><TrendingUp size={36} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50 dark:border-dark-850">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2"><LineChart className="text-brand-650" size={18} /> {searchCrop || 'Crop'} Price History</h3>
            <span className="text-xs text-gray-400">Last updated: {lastUpdated || 'Not available'}</span>
          </div>
          <div className="h-[260px] w-full">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full text-brand-600"><div className="w-8 h-8 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div></div>
            ) : history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                  <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} /><stop offset="95%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="avgPrice" name="Average Price" stroke="#F59E0B" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="minPrice" name="Min Price" stroke="#EF4444" fillOpacity={0} strokeWidth={1} strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="maxPrice" name="Max Price" stroke="#10B981" fillOpacity={0} strokeWidth={1} strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400"><HelpCircle size={36} className="text-gray-300 mb-1" /><p className="font-bold text-xs">No historical trend data available.</p></div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center gap-2"><TrendingUp className="text-brand-600" size={18} /> Top Mandi Demand Trends</h3>
          <div className="space-y-3.5 mb-6">
            {loadingTrending ? (
              <div className="text-center py-4"><div className="w-5 h-5 border-2 border-t-transparent border-brand-500 rounded-full animate-spin inline-block"></div></div>
            ) : trendCards.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-dark-850 border border-gray-150 dark:border-dark-800/50 rounded-2xl">
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-200">{c.name}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-dark-500 mt-0.5">Estimated local Mandi rate: {c.price}</p>
                </div>
                <div className="text-right"><span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg ${c.trend === 'up' ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20' : 'bg-red-50 text-red-500 dark:bg-red-950/20'}`}>{c.growth}</span></div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-gray-50 dark:border-dark-850 pt-4">
            <h4 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Today’s Prices</h4>
            <div className="max-h-[180px] overflow-y-auto divide-y divide-gray-50 dark:divide-dark-800/40 pr-1">
              {loading ? (
                <div className="text-center py-4"><div className="w-5 h-5 border-2 border-t-transparent border-brand-500 rounded-full animate-spin inline-block"></div></div>
              ) : prices.length > 0 ? (
                prices.map((p, pIdx) => (
                  <div key={pIdx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-dark-200">{p.market || p.mandiName}</span>
                      <span className="block text-[9px] text-gray-400">{p.district}, {p.state}</span>
                    </div>
                    <span className="font-extrabold text-gray-700 dark:text-dark-200">₹{p.avgPrice || p.modalPrice}</span>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-[11px] text-gray-400">Search to populate mandi prices listings.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {pagination && (
        <div className="flex justify-between items-center bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 rounded-3xl px-5 py-3 shadow-sm">
          <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { const next = Math.max(1, page - 1); setPage(next); void fetchPrices(next); }} className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600"><ArrowLeft size={14} /> Prev</button>
            <button type="button" onClick={() => { const next = Math.min(pagination.totalPages, page + 1); setPage(next); void fetchPrices(next); }} className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600">Next <ArrowRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
};
