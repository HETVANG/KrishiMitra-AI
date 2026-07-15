import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Search, MapPin, TrendingUp, TrendingDown, LayoutGrid, Calendar, HelpCircle, LineChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MarketDashboard: React.FC = () => {
  const [prices, setPrices] = useState<any[]>([]);
  const [searchCrop, setSearchCrop] = useState('Wheat');
  const [searchState, setSearchState] = useState('Haryana');
  const [searchDistrict, setSearchDistrict] = useState('');
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/market/search?crop=${searchCrop}&state=${searchState}&district=${searchDistrict}`);
      if (res.data && res.data.success) {
        setPrices(res.data.prices);
      }
    } catch (err) {
      console.error('Failed to load mandi prices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get(`/market/history?crop=${searchCrop}&district=${searchDistrict || 'Karnal'}`);
      if (res.data && res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load mandi history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    fetchHistory();
  }, [searchCrop, searchState]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrices();
    fetchHistory();
  };

  // Standard metrics
  const minPrice = prices.length > 0 ? Math.min(...prices.map(p => p.minPrice)) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices.map(p => p.maxPrice)) : 0;
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((acc, p) => acc + p.avgPrice, 0) / prices.length) : 0;

  // Top high demand crops
  const topDemandCrops = [
    { name: 'Soybean', growth: '+4.2%', trend: 'up', price: '₹4600/Qtl' },
    { name: 'Mustard', growth: '+2.8%', trend: 'up', price: '₹5500/Qtl' },
    { name: 'Cotton', growth: '+1.5%', trend: 'up', price: '₹6500/Qtl' },
    { name: 'Wheat', growth: '-0.5%', trend: 'down', price: '₹2225/Qtl' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-700 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">National Agriculture Market (eNAM) Index</h1>
        <p className="text-amber-500/10 text-xs md:text-sm mt-1 font-medium text-amber-50">Compare mandi wholesale commodity prices, review historical area charts, and make smart crop sales choices.</p>
      </div>

      {/* Search filters */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Target Crop</label>
            <input
              type="text"
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              placeholder="e.g. Wheat, Rice, Cotton"
              className="custom-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">State</label>
            <select
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="custom-input text-sm"
            >
              <option value="Haryana">Haryana</option>
              <option value="Punjab">Punjab</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">District / Mandi</label>
            <input
              type="text"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              placeholder="e.g. Karnal, Rajkot"
              className="custom-input text-sm"
            />
          </div>

          <button
            type="submit"
            className="btn-primary py-3 flex items-center justify-center gap-1.5"
          >
            <Search size={16} />
            <span>Search Mandis</span>
          </button>
        </form>
      </div>

      {/* Aggregate metric cards */}
      {prices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden">
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Minimum Mandi Rate</span>
            <span className="text-2xl md:text-3xl font-extrabold text-red-550 block mt-2 text-red-500">₹{minPrice} <span className="text-xs font-medium text-gray-400">/ Quintal</span></span>
            <div className="absolute right-6 bottom-6 text-red-100 dark:text-red-950/20">
              <TrendingDown size={36} />
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden">
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Average Mandi Rate</span>
            <span className="text-2xl md:text-3xl font-extrabold text-brand-600 dark:text-brand-450 block mt-2">₹{avgPrice} <span className="text-xs font-medium text-gray-400">/ Quintal</span></span>
            <div className="absolute right-6 bottom-6 text-brand-100 dark:text-brand-950/20">
              <TrendingUp size={36} />
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden">
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Maximum Mandi Rate</span>
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-600 block mt-2">₹{maxPrice} <span className="text-xs font-medium text-gray-400">/ Quintal</span></span>
            <div className="absolute right-6 bottom-6 text-emerald-100 dark:text-emerald-950/20">
              <TrendingUp size={36} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mandi Pricing History Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center gap-2">
            <LineChart className="text-brand-650" size={18} /> {searchCrop} Price History Trend
          </h3>

          <div className="h-[260px] w-full">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full text-brand-600">
                <div className="w-8 h-8 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
              </div>
            ) : history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <HelpCircle size={36} className="text-gray-300 mb-1" />
                <p className="font-bold text-xs">No historical trend data available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top demand / Mandi List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center gap-2">
            <TrendingUp className="text-brand-600" size={18} /> Top Mandi Demand Trends
          </h3>

          <div className="space-y-3.5 mb-6">
            {topDemandCrops.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-dark-850 border border-gray-150 dark:border-dark-800/50 rounded-2xl">
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-200">{c.name}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-dark-500 mt-0.5">Estimated local Mandi rate: {c.price}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                    c.trend === 'up' 
                      ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20' 
                      : 'bg-red-50 text-red-500 dark:bg-red-950/20'
                  }`}>
                    {c.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-gray-50 dark:border-dark-850 pt-4">
            <h4 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Nearby Mandi Results list</h4>
            <div className="max-h-[180px] overflow-y-auto divide-y divide-gray-50 dark:divide-dark-800/40 pr-1">
              {loading ? (
                <div className="text-center py-4">
                  <div className="w-5 h-5 border-2 border-t-transparent border-brand-500 rounded-full animate-spin inline-block"></div>
                </div>
              ) : prices.length > 0 ? (
                prices.map((p, pIdx) => (
                  <div key={pIdx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-dark-200">{p.mandiName}</span>
                      <span className="block text-[9px] text-gray-400">{p.district}, {p.state}</span>
                    </div>
                    <span className="font-extrabold text-gray-700 dark:text-dark-200">₹{p.avgPrice}</span>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-[11px] text-gray-400">Search to populate mandi prices listings.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
