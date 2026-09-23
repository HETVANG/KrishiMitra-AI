import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShieldCheck, Activity, Server, RefreshCw, CheckCircle2, AlertTriangle, Layers, Globe, Clock, ShieldAlert } from 'lucide-react';

export interface ProviderItem {
  id: string;
  name: string;
  slug: string;
  providerType: string;
  description: string;
  organizationType: string;
  country: string;
  supportedCountries: string[];
  capabilities: Record<string, boolean>;
  status: string;
  verificationStatus: string;
  isConfigured: boolean;
  documentationUrl?: string;
  health: {
    status: string;
    responseTimeMs: number;
    failureCount: number;
    circuitBreakerOpen: boolean;
    lastHealthCheck: string;
  };
}

export const AdminProviders: React.FC = () => {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/providers?countryCode=IN');
      if (res.data && res.data.providers) {
        setProviders(res.data.providers);
      }
    } catch (err) {
      console.warn('[AdminProviders] Fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const filteredProviders = filterType === 'ALL'
    ? providers
    : providers.filter(p => p.providerType === filterType);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" /> Global Infrastructure Control
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-dark-100">
            Provider Ecosystem & Health Hub
          </h1>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
            Operational status, capability resolution, credential isolation, and health monitoring for agricultural data feeds.
          </p>
        </div>

        <button
          onClick={fetchProviders}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-700 dark:text-dark-200 font-bold text-xs rounded-2xl transition-all shadow-sm self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-dark-800">
        {['ALL', 'WEATHER', 'MARKET', 'AGRICULTURAL_KNOWLEDGE', 'SOIL', 'EXPERT_NETWORK'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              filterType === t
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 text-gray-600 dark:text-dark-300 hover:bg-gray-50'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Provider List Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl p-12 text-center text-gray-500">
          No platform providers match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProviders.map(p => (
            <div
              key={p.id}
              className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 p-5 rounded-3xl shadow-sm hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                    {p.providerType}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                      p.health?.status === 'HEALTHY'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200'
                    }`}>
                      {p.health?.status === 'HEALTHY' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {p.health?.status || 'HEALTHY'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-[10px] font-extrabold rounded-full border border-blue-200">
                      {p.verificationStatus}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-black text-gray-900 dark:text-dark-100 mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-dark-400 mb-4 leading-relaxed">
                  {p.description}
                </p>

                {/* Capabilities */}
                <div className="mb-4">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 dark:text-dark-400 tracking-wider block mb-2">
                    Declared Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(p.capabilities || {}).map(([capKey, capVal]) => (
                      capVal ? (
                        <span key={capKey} className="px-2 py-0.5 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 font-bold text-[10px] rounded-lg">
                          ✓ {capKey}
                        </span>
                      ) : null
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Metrics */}
              <div className="pt-3 border-t border-gray-100 dark:border-dark-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-dark-400">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-bold text-gray-700 dark:text-dark-200">{p.country}</span> ({p.supportedCountries?.join(', ')})
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Latency: <strong className="text-gray-800 dark:text-dark-100">{p.health?.responseTimeMs || 120}ms</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
