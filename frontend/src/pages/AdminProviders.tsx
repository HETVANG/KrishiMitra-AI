import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  ShieldCheck, Activity, Server, RefreshCw, CheckCircle2, AlertTriangle,
  Layers, Globe, Clock, ShieldAlert, Play, RotateCw, Settings, FileText,
  History, Power, Plus, Search, Filter, X, Lock, Check
} from 'lucide-react';

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
  enabled: boolean;
  priority: number;
  timeoutMs: number;
  cacheTTL: number;
  baseUrl?: string;
  isConfigured: boolean;
  documentationUrl?: string;
  lastCheckedAt?: string;
  lastSuccessfulAt?: string;
  lastSyncAt?: string;
  lastError?: string;
  health: {
    status: string;
    responseTimeMs: number;
    failureCount: number;
    circuitBreakerOpen: boolean;
    lastHealthCheck: string;
  };
}

export interface ProviderLogItem {
  _id: string;
  providerId: string;
  providerName: string;
  action: string;
  status: string;
  httpStatus?: number;
  latencyMs?: number;
  message?: string;
  adminUser?: string;
  timestamp: string;
}

export const AdminProviders: React.FC = () => {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('name');

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    degraded: 0,
    offline: 0,
    disabled: 0
  });

  // Action Loading States
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latency: number; httpStatus: number; msg: string } | null>(null);

  // Modals
  const [selectedDetails, setSelectedDetails] = useState<ProviderItem | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<ProviderItem | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<{ provider: ProviderItem; logs: ProviderLogItem[] } | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<{ provider: ProviderItem; history: ProviderLogItem[] } | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<ProviderItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchProviders = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const res = await api.get('/admin/providers?countryCode=IN');
      if (res.data && res.data.providers) {
        setProviders(res.data.providers);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err: any) {
      console.warn('[AdminProviders] Fetch notice:', err);
      showToast(err.response?.data?.message || 'Failed to load provider registry', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Handler 1: Test Connection
  const handleTestConnection = async (provider: ProviderItem) => {
    setTestingId(provider.id);
    setTestResult(null);
    try {
      const res = await api.post(`/admin/providers/${provider.id}/test`);
      const resData = res.data?.result || {};
      const success = res.data?.success || false;
      const latency = resData.latencyMs || 0;
      const httpStatus = resData.httpStatus || (success ? 200 : 500);
      const msg = resData.message || (success ? 'Connection Successful' : 'Connection Failed');

      setTestResult({
        id: provider.id,
        success,
        latency,
        httpStatus,
        msg
      });

      showToast(`${provider.name}: ${msg} (${latency}ms, HTTP ${httpStatus})`, success ? 'success' : 'error');
      fetchProviders(true);
    } catch (err: any) {
      showToast(`Connection test failed for ${provider.name}: ${err.message}`, 'error');
    } finally {
      setTestingId(null);
    }
  };

  // Handler 2: Sync Now
  const handleSyncNow = async (provider: ProviderItem) => {
    setSyncingId(provider.id);
    try {
      const res = await api.post(`/admin/providers/${provider.id}/sync`);
      const msg = res.data?.message || 'Synchronization complete';
      const supported = res.data?.supported !== false;
      showToast(`${provider.name}: ${msg}`, supported ? 'success' : 'info');
      fetchProviders(true);
    } catch (err: any) {
      showToast(`Sync failed for ${provider.name}: ${err.message}`, 'error');
    } finally {
      setSyncingId(null);
    }
  };

  // Handler 3: Enable / Disable Toggle
  const handleToggleStatus = async (provider: ProviderItem, enableTarget: boolean) => {
    try {
      await api.patch(`/admin/providers/${provider.id}/status`, { enabled: enableTarget });
      showToast(`${provider.name} is now ${enableTarget ? 'ENABLED' : 'DISABLED'}`, enableTarget ? 'success' : 'info');
      setConfirmDisable(null);
      fetchProviders(true);
    } catch (err: any) {
      showToast(`Failed to update status for ${provider.name}: ${err.message}`, 'error');
    }
  };

  // Handler 4: View Logs
  const handleViewLogs = async (provider: ProviderItem) => {
    try {
      const res = await api.get(`/admin/providers/${provider.id}/logs`);
      setSelectedLogs({
        provider,
        logs: res.data?.logs || []
      });
    } catch (err: any) {
      showToast(`Failed to load logs: ${err.message}`, 'error');
    }
  };

  // Handler 5: Health History
  const handleViewHistory = async (provider: ProviderItem) => {
    try {
      const res = await api.get(`/admin/providers/${provider.id}/health-history`);
      setSelectedHistory({
        provider,
        history: res.data?.history || []
      });
    } catch (err: any) {
      showToast(`Failed to load health history: ${err.message}`, 'error');
    }
  };

  // Handler 6: Update Configuration
  const handleSaveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedConfig) return;

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      region: formData.get('country') as string,
      priority: Number(formData.get('priority') || 1),
      timeoutMs: Number(formData.get('timeoutMs') || 5000),
      cacheTTL: Number(formData.get('cacheTTL') || 3600),
      baseUrl: formData.get('baseUrl') as string
    };

    try {
      await api.patch(`/admin/providers/${selectedConfig.id}`, payload);
      showToast(`Updated configuration for ${payload.name}`, 'success');
      setSelectedConfig(null);
      fetchProviders(true);
    } catch (err: any) {
      showToast(`Failed to update configuration: ${err.message}`, 'error');
    }
  };

  // Handler 7: Add Custom Provider
  const handleAddProvider = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      providerType: formData.get('providerType') as string,
      description: formData.get('description') as string,
      country: formData.get('country') as string || 'IN',
      baseUrl: formData.get('baseUrl') as string || '',
      timeoutMs: Number(formData.get('timeoutMs') || 5000)
    };

    try {
      await api.post('/admin/providers', payload);
      showToast(`Created new provider: ${payload.name}`, 'success');
      setShowAddModal(false);
      fetchProviders(true);
    } catch (err: any) {
      showToast(`Failed to create provider: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // Filtering & Sorting Logic
  const filtered = providers.filter(p => {
    const matchesCategory = filterCategory === 'ALL' || p.providerType === filterCategory;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'DISABLED' && !p.enabled) ||
      (filterStatus === 'HEALTHY' && p.enabled && (p.health?.status === 'HEALTHY' || p.health?.status === 'AVAILABLE')) ||
      (filterStatus === 'DEGRADED' && p.enabled && p.health?.status === 'DEGRADED') ||
      (filterStatus === 'OFFLINE' && p.enabled && (p.health?.status === 'FAILED' || p.health?.status === 'UNREACHABLE'));

    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.providerType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'status') return (a.health?.status || '').localeCompare(b.health?.status || '');
    if (sortBy === 'latency') return (a.health?.responseTimeMs || 0) - (b.health?.responseTimeMs || 0);
    return 0;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
          toast.type === 'error' ? 'bg-red-600 text-white border-red-500' :
          'bg-slate-900 text-white border-slate-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" /> Global Infrastructure Control
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-dark-100">
            Provider Ecosystem & Health Hub
          </h1>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
            Operational provider management, real-time connectivity testing, credential isolation, and audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-2xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Provider
          </button>
          <button
            onClick={() => fetchProviders()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-700 dark:text-dark-200 font-bold text-xs rounded-2xl transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Total Providers</span>
          <span className="text-xl font-black text-gray-900 dark:text-dark-100">{stats.total || providers.length}</span>
        </div>
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 block mb-1">Healthy</span>
          <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">{stats.healthy}</span>
        </div>
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 block mb-1">Degraded</span>
          <span className="text-xl font-black text-amber-700 dark:text-amber-400">{stats.degraded}</span>
        </div>
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-rose-700 dark:text-rose-400 block mb-1">Offline</span>
          <span className="text-xl font-black text-rose-700 dark:text-rose-400">{stats.offline}</span>
        </div>
        <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm col-span-2 md:col-span-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-1">Disabled</span>
          <span className="text-xl font-black text-slate-700 dark:text-slate-300">{stats.disabled}</span>
        </div>
      </div>

      {/* Search, Category Tabs, Status Filter, and Sort */}
      <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 p-4 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search provider name, type, capability..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-bold text-gray-700 dark:text-dark-200"
            >
              <option value="ALL">Status: All</option>
              <option value="HEALTHY">Status: Healthy</option>
              <option value="DEGRADED">Status: Degraded</option>
              <option value="OFFLINE">Status: Offline</option>
              <option value="DISABLED">Status: Disabled</option>
            </select>

            {/* Sort Option */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-bold text-gray-700 dark:text-dark-200"
            >
              <option value="name">Sort: Name</option>
              <option value="status">Sort: Status</option>
              <option value="latency">Sort: Latency</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'WEATHER', 'MARKET', 'AGRICULTURAL_KNOWLEDGE', 'SOIL', 'EXPERT_NETWORK'].map(t => (
            <button
              key={t}
              onClick={() => setFilterCategory(t)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                filterCategory === t
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-dark-800 text-gray-600 dark:text-dark-300 hover:bg-gray-100'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Provider List Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl p-12 text-center text-gray-500">
          No platform providers match the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => {
            const isTesting = testingId === p.id;
            const isSyncing = syncingId === p.id;
            const isTestResultThis = testResult?.id === p.id;

            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-dark-900 border p-5 rounded-3xl shadow-sm transition-all flex flex-col justify-between ${
                  !p.enabled ? 'border-gray-200 dark:border-dark-800 opacity-75 bg-gray-50/50' : 'border-gray-100 dark:border-dark-800 hover:border-brand-300'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                      {p.providerType}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Enable/Disable Badge */}
                      {!p.enabled ? (
                        <span className="px-2.5 py-0.5 bg-gray-200 text-gray-700 dark:bg-dark-800 dark:text-dark-300 text-[10px] font-extrabold rounded-full border">
                          ● Disabled
                        </span>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          p.health?.status === 'HEALTHY' || p.health?.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200'
                        }`}>
                          {p.health?.status === 'HEALTHY' || p.health?.status === 'AVAILABLE' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {p.health?.status || 'HEALTHY'}
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-[10px] font-extrabold rounded-full border border-blue-200">
                        {p.verificationStatus}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
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

                  {/* Test Result Display if freshly tested */}
                  {isTestResultThis && (
                    <div className={`p-3 mb-4 rounded-xl text-xs border ${
                      testResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      <div className="font-extrabold mb-0.5">
                        {testResult.success ? '✓ Connection Successful' : '✕ Connection Failed'}
                      </div>
                      <div className="text-[11px] opacity-90">
                        Latency: {testResult.latency} ms | HTTP Status: {testResult.httpStatus} | {testResult.msg}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons Area */}
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-dark-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleTestConnection(p)}
                      disabled={isTesting}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-bold rounded-xl transition-all"
                    >
                      {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                      onClick={() => handleSyncNow(p)}
                      disabled={isSyncing}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 text-gray-700 dark:text-dark-200 text-xs font-bold rounded-xl transition-all"
                    >
                      {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
                      {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedDetails(p)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-300 font-bold rounded-lg flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Details
                      </button>
                      <button
                        onClick={() => setSelectedConfig(p)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-300 font-bold rounded-lg flex items-center gap-1"
                      >
                        <Settings className="w-3.5 h-3.5" /> Configure
                      </button>
                      <button
                        onClick={() => handleViewLogs(p)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-300 font-bold rounded-lg flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5" /> Logs
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (p.enabled) setConfirmDisable(p);
                        else handleToggleStatus(p, true);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all ${
                        p.enabled ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {p.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>

                  {/* Card Telemetry Footer */}
                  <div className="pt-2 border-t border-gray-50 dark:border-dark-800 flex items-center justify-between text-[10px] text-gray-400">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {p.country} ({p.supportedCountries?.join(', ')})
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Latency: <strong className="text-gray-700 dark:text-dark-200">{p.health?.responseTimeMs || 120}ms</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: VIEW DETAILS */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-brand-600 tracking-wider">Provider Details</span>
                <h2 className="text-lg font-black text-gray-900 dark:text-dark-100">{selectedDetails.name}</h2>
              </div>
              <button onClick={() => setSelectedDetails(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-dark-800 rounded-2xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Provider Type</span>
                <span className="font-extrabold text-gray-800 dark:text-dark-100">{selectedDetails.providerType}</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-800 rounded-2xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Region</span>
                <span className="font-extrabold text-gray-800 dark:text-dark-100">{selectedDetails.country}</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-800 rounded-2xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Health Status</span>
                <span className="font-extrabold text-emerald-600">{selectedDetails.health?.status || 'HEALTHY'}</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-800 rounded-2xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Verification</span>
                <span className="font-extrabold text-blue-600">{selectedDetails.verificationStatus}</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-800 rounded-2xl col-span-2">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Credential Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-gray-800 dark:text-dark-200">
                    {selectedDetails.isConfigured ? 'Configured & Isolated (API Key Masked: ••••••••••••)' : 'Environment Default Configured'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-gray-900 dark:text-dark-100">Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedDetails.capabilities || {}).map(([k, v]) => (
                  <span key={k} className={`px-2.5 py-1 text-xs font-bold rounded-xl ${v ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {v ? '✓' : '✕'} {k}
                  </span>
                ))}
              </div>
            </div>

            {selectedDetails.lastError && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-2xl text-xs">
                <strong className="block mb-0.5">Last Error:</strong>
                {selectedDetails.lastError}
              </div>
            )}

            <div className="pt-3 border-t flex justify-end">
              <button onClick={() => setSelectedDetails(null)} className="px-5 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURE PROVIDER */}
      {selectedConfig && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveConfig} className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-dark-100">Configure Provider Settings</h2>
              <button type="button" onClick={() => setSelectedConfig(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Display Name</label>
                <input name="name" defaultValue={selectedConfig.name} required className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl font-bold" />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Description</label>
                <textarea name="description" defaultValue={selectedConfig.description} rows={2} className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Country / Region</label>
                  <input name="country" defaultValue={selectedConfig.country} required className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Priority Order</label>
                  <input type="number" name="priority" defaultValue={selectedConfig.priority || 1} min={1} max={10} className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Timeout (ms)</label>
                  <input type="number" name="timeoutMs" defaultValue={selectedConfig.timeoutMs || 5000} className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Cache TTL (sec)</label>
                  <input type="number" name="cacheTTL" defaultValue={selectedConfig.cacheTTL || 3600} className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Base Endpoint URL (Optional)</label>
                <input name="baseUrl" defaultValue={selectedConfig.baseUrl || ''} placeholder="https://api.provider.com/v1" className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl font-mono text-[11px]" />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedConfig(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: VIEW LOGS */}
      {selectedLogs && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-brand-600 tracking-wider">Operational Audit Logs</span>
                <h2 className="text-base font-black text-gray-900 dark:text-dark-100">{selectedLogs.provider.name}</h2>
              </div>
              <button onClick={() => setSelectedLogs(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedLogs.logs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No operational logs recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {selectedLogs.logs.map(log => (
                  <div key={log._id} className="p-3 bg-gray-50 dark:bg-dark-800 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-800 dark:text-dark-200">
                        {log.action} — <span className={log.status === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'}>{log.status}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{log.message}</p>
                    </div>
                    <div className="text-right text-[11px] text-gray-400">
                      <div>{new Date(log.timestamp).toLocaleTimeString('en-IN')}</div>
                      <div>{log.latencyMs ? `${log.latencyMs}ms` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t flex justify-end">
              <button onClick={() => setSelectedLogs(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM DISABLE */}
      {confirmDisable && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-gray-900 dark:text-dark-100">Disable Provider?</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed">
              Are you sure you want to disable <strong>{confirmDisable.name}</strong>? Disabling this provider will stop it from serving production user requests until re-enabled.
            </p>
            <div className="pt-3 flex justify-end gap-2">
              <button onClick={() => setConfirmDisable(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button onClick={() => handleToggleStatus(confirmDisable, false)} className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
                Disable Provider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD PROVIDER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddProvider} className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-dark-100">Add New Data Provider</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Provider Name *</label>
                <input name="name" required placeholder="e.g. Regional Soil Lab Feed" className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl font-bold" />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Provider Type *</label>
                <select name="providerType" required className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl font-bold">
                  <option value="WEATHER">WEATHER</option>
                  <option value="MARKET">MARKET</option>
                  <option value="AGRICULTURAL_KNOWLEDGE">AGRICULTURAL_KNOWLEDGE</option>
                  <option value="SOIL">SOIL</option>
                  <option value="EXPERT_NETWORK">EXPERT_NETWORK</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Description</label>
                <textarea name="description" rows={2} placeholder="Brief operational summary..." className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Country</label>
                  <input name="country" defaultValue="IN" className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Timeout (ms)</label>
                  <input type="number" name="timeoutMs" defaultValue={5000} className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Base URL (Optional)</label>
                <input name="baseUrl" placeholder="https://api.example.com/v1" className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border rounded-xl font-mono text-[11px]" />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl">
                Create Provider
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
