import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Droplets, 
  CloudSun, 
  Sun, 
  MapPin, 
  Sprout, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  ChevronRight, 
  Calendar, 
  ListFilter,
  Check
} from 'lucide-react';

interface EvidenceItem {
  label: string;
  value: string;
}

interface ActionItem {
  title: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

interface IrrigationRecommendation {
  status: 'NEEDS_ATTENTION' | 'LIKELY_NEEDED' | 'MONITOR' | 'LIKELY_NOT_NEEDED' | 'EXCESS_MOISTURE_RISK' | 'INSUFFICIENT_DATA';
  level: 'low' | 'moderate' | 'high';
  summary: string;
  reasons: string[];
  evidence: EvidenceItem[];
  recommendedActions: ActionItem[];
  timeframe: string;
  confidence: number;
  dataFreshness: {
    weatherUpdated: string | null;
    lastIrrigationDate: string | null;
    hasSoilMoisture: boolean;
  };
}

interface IrrigationEventItem {
  id: string;
  cropName: string;
  date: string;
  method: string;
  durationMinutes: number;
  waterAmount?: number;
  waterUnit?: string;
  notes?: string;
}

export const SmartIrrigation: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [recommendation, setRecommendation] = useState<IrrigationRecommendation | null>(null);
  const [recentEvents, setRecentEvents] = useState<IrrigationEventItem[]>([]);
  const [contextSummary, setContextSummary] = useState<any>(null);

  // Modal / Form state for logging irrigation
  const [showLogModal, setShowLogModal] = useState(false);
  const [submittingLog, setSubmittingLog] = useState(false);
  const [logForm, setLogForm] = useState({
    method: 'drip' as 'drip' | 'sprinkler' | 'flood' | 'manual' | 'other',
    durationMinutes: 30,
    waterAmount: '',
    waterUnit: 'Liters',
    notes: ''
  });

  useEffect(() => {
    fetchFarmsAndIrrigation();
  }, [user]);

  const fetchFarmsAndIrrigation = async () => {
    try {
      setLoading(true);
      const meRes = await api.get('/auth/me');
      const userFarms = meRes.data?.user?.farms || [];
      setFarms(userFarms);

      const targetId = selectedFarmId || (userFarms[0] ? userFarms[0]._id : undefined);
      if (targetId) setSelectedFarmId(targetId);

      await loadIrrigationData(targetId);
    } catch (err) {
      console.warn('[Smart Irrigation] Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadIrrigationData = async (fId?: string, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const param = fId ? `/${fId}` : '';
      const res = await api.get(`/irrigation/status${param}?language=${i18n.language}`);

      if (res.data && res.data.success) {
        setRecommendation(res.data.recommendation || null);
        setRecentEvents(res.data.recentEvents || []);
        setContextSummary(res.data.contextSummary || null);
      }
    } catch (err) {
      console.error('[Smart Irrigation] Load error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFarmChange = async (farmId: string) => {
    setSelectedFarmId(farmId);
    setLoading(true);
    await loadIrrigationData(farmId);
    setLoading(false);
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingLog(true);
      await api.post('/irrigation/events', {
        farmId: selectedFarmId || undefined,
        method: logForm.method,
        durationMinutes: Number(logForm.durationMinutes),
        waterAmount: logForm.waterAmount ? Number(logForm.waterAmount) : undefined,
        waterUnit: logForm.waterUnit,
        notes: logForm.notes
      });

      setShowLogModal(false);
      setLogForm({
        method: 'drip',
        durationMinutes: 30,
        waterAmount: '',
        waterUnit: 'Liters',
        notes: ''
      });

      // Reload updated status & events
      await loadIrrigationData(selectedFarmId, true);
    } catch (err) {
      console.error('[Smart Irrigation] Failed to log event:', err);
    } finally {
      setSubmittingLog(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'EXCESS_MOISTURE_RISK':
        return { label: 'EXCESS MOISTURE RISK', bg: 'bg-red-500/10 text-red-800 dark:text-red-300 border-red-200' };
      case 'NEEDS_ATTENTION':
        return { label: 'NEEDS ATTENTION', bg: 'bg-red-500/10 text-red-800 dark:text-red-300 border-red-200' };
      case 'LIKELY_NEEDED':
        return { label: 'IRRIGATION LIKELY NEEDED', bg: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200' };
      case 'MONITOR':
        return { label: 'MONITOR MOISTURE', bg: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-200' };
      case 'LIKELY_NOT_NEEDED':
        return { label: 'IRRIGATION UNNECESSARY', bg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200' };
      default:
        return { label: 'INSUFFICIENT TELEMETRY DATA', bg: 'bg-gray-100 text-gray-700 dark:bg-dark-800 dark:text-dark-300 border-gray-200' };
    }
  };

  const badge = getStatusBadge(recommendation?.status);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-blue-200 uppercase tracking-wider">
            <Droplets size={14} className="text-blue-400" /> Hydro-Telemetry Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Smart Irrigation Intelligence</h1>
          <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
            Multi-factor water demand assessment combining rainfall forecasts, ambient heat, transpiration rates, and logged irrigation events.
          </p>
        </div>

        {/* Action Controls */}
        <div className="z-10 w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {farms.length > 0 && (
            <select
              value={selectedFarmId}
              onChange={(e) => handleFarmChange(e.target.value)}
              className="bg-white/10 dark:bg-dark-900/60 backdrop-blur-md text-white font-bold text-xs px-3 py-2.5 rounded-2xl border border-white/20 focus:outline-none"
            >
              {farms.map((f: any) => (
                <option key={f._id} value={f._id} className="bg-slate-900 text-white">
                  {f.name} ({f.size || 1} Acres • {f.village || 'Farm'})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <PlusCircle size={14} />
            <span>Log Irrigation Event</span>
          </button>
        </div>
      </div>

      {/* Primary Status Banner & Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Card */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm ${badge.bg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Current Irrigation Status</span>
            <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border">
              {recommendation?.level || 'moderate'} Level
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">{badge.label}</h2>
            <p className="text-xs opacity-85 mt-2 leading-relaxed">
              {recommendation?.summary || 'Analyzing real-time weather and soil moisture balance...'}
            </p>
          </div>

          <div className="text-[10px] opacity-75 flex items-center gap-1 font-semibold border-t border-black/10 dark:border-white/10 pt-3">
            <Clock size={12} /> Timeframe: {recommendation?.timeframe || 'Today'}
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="md:col-span-2 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
            <h3 className="font-extrabold text-sm text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" /> Hydro-Telemetry Inputs
            </h3>
            <span className="text-[10px] font-bold text-gray-400">
              Crop: {contextSummary?.crop || 'General Crop'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-dark-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Rain Forecast</span>
              <p className="text-sm font-extrabold text-gray-800 dark:text-dark-200 mt-0.5">
                {contextSummary?.rainProbability !== undefined ? `${contextSummary.rainProbability}%` : 'N/A'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-dark-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Current Temp</span>
              <p className="text-sm font-extrabold text-gray-800 dark:text-dark-200 mt-0.5">
                {contextSummary?.tempCelsius !== undefined ? `${contextSummary.tempCelsius}°C` : 'N/A'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-dark-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Relative Humidity</span>
              <p className="text-sm font-extrabold text-gray-800 dark:text-dark-200 mt-0.5">
                {contextSummary?.humidity !== undefined ? `${contextSummary.humidity}%` : 'N/A'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-dark-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Water Source</span>
              <p className="text-sm font-extrabold text-gray-800 dark:text-dark-200 mt-0.5 truncate">
                {contextSummary?.waterSource || 'Borewell'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <Info size={12} className="text-blue-500 shrink-0" />
            <span>Direct soil moisture sensor telemetry is unavailable. Check root zone manually before watering.</span>
          </div>
        </div>
      </div>

      {/* 3D Soil Cross-Section & Irrigation Visualizer */}
      <DashboardSoilIrrigationWidget
        recommendation={recommendation}
        recentEvents={recentEvents}
        contextSummary={contextSummary}
      />

      {/* Reasoning & Recommended Actions Grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Evidence & Reasoning Card */}
        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2 border-b border-gray-100 dark:border-dark-800 pb-3">
            <ListFilter size={18} className="text-blue-600" /> Agronomic Reasons & Telemetry Logs
          </h3>

          <div className="space-y-3">
            {recommendation?.reasons?.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-dark-200 leading-relaxed font-medium">
                <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>

          {recommendation?.evidence && recommendation.evidence.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-dark-950/40 rounded-2xl space-y-2 mt-4">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Evidence Parameters</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {recommendation.evidence.map((ev, eIdx) => (
                  <div key={eIdx} className="flex justify-between items-center text-[11px] p-2 bg-white dark:bg-dark-900 rounded-xl border border-gray-100 dark:border-dark-800">
                    <span className="text-gray-500 font-semibold truncate">{ev.label}:</span>
                    <span className="font-extrabold text-gray-800 dark:text-dark-100">{ev.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommended Action Steps */}
        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2 border-b border-gray-100 dark:border-dark-800 pb-3">
            <CheckCircle2 size={18} className="text-emerald-600" /> Recommended Action Steps
          </h3>

          <div className="space-y-3">
            {recommendation?.recommendedActions?.map((act, aIdx) => (
              <div key={aIdx} className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-gray-800 dark:text-dark-100">{act.title}</h4>
                  <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    act.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {act.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-snug">{act.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Irrigation Activity History Log */}
      <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base md:text-lg text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" /> Recent Field Irrigation Log
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Recorded watering events for {contextSummary?.farmName || 'this farm'}.</p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
          >
            <PlusCircle size={14} /> Log Event
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 space-y-2">
            <Droplets size={24} className="mx-auto text-gray-300" />
            <p>No irrigation events logged yet for this farm.</p>
            <button
              onClick={() => setShowLogModal(true)}
              className="text-blue-600 font-bold hover:underline"
            >
              Log your first irrigation event →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-800 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Crop</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Water Amount</th>
                  <th className="pb-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-800/40 font-medium text-gray-700 dark:text-dark-200">
                {recentEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-950/20">
                    <td className="py-3 font-bold">{new Date(evt.date).toLocaleDateString()}</td>
                    <td className="py-3">{evt.cropName}</td>
                    <td className="py-3 capitalize">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold uppercase text-[9px]">
                        {evt.method}
                      </span>
                    </td>
                    <td className="py-3">{evt.durationMinutes} mins</td>
                    <td className="py-3">{evt.waterAmount ? `${evt.waterAmount} ${evt.waterUnit || 'L'}` : 'Not Specified'}</td>
                    <td className="py-3 text-gray-400 truncate max-w-[180px]">{evt.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Irrigation Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
                <Droplets size={18} className="text-blue-600" /> Log Irrigation Event
              </h3>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Irrigation Method</label>
                <select
                  value={logForm.method}
                  onChange={(e) => setLogForm({ ...logForm, method: e.target.value as any })}
                  className="custom-input w-full"
                >
                  <option value="drip">Drip Irrigation</option>
                  <option value="sprinkler">Sprinkler System</option>
                  <option value="flood">Flood / Surface Irrigation</option>
                  <option value="manual">Manual Watering</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={logForm.durationMinutes}
                    onChange={(e) => setLogForm({ ...logForm, durationMinutes: Number(e.target.value) })}
                    min={1}
                    className="custom-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Water Amount (Optional)</label>
                  <input
                    type="number"
                    value={logForm.waterAmount}
                    onChange={(e) => setLogForm({ ...logForm, waterAmount: e.target.value })}
                    placeholder="e.g. 500"
                    className="custom-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Field Notes</label>
                <textarea
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  placeholder="e.g. Watered east block before sunset."
                  className="custom-input w-full h-20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                >
                  {submittingLog ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
