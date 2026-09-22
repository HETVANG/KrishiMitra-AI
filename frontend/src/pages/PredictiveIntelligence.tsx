import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  ShieldAlert, 
  CloudSun, 
  Microscope, 
  Droplets, 
  Sprout, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  MapPin, 
  ChevronRight, 
  Activity, 
  Brain, 
  Calendar,
  Layers
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

interface RiskSignal {
  id: string;
  category: 'weather' | 'disease' | 'water' | 'nutrient' | 'health';
  level: 'low' | 'moderate' | 'high';
  score: number;
  title: string;
  summary: string;
  reasons: string[];
  evidence: EvidenceItem[];
  recommendedActions: ActionItem[];
  affectedCrop: string;
  timeframe: 'today' | '24_hours' | '3_days' | '7_days';
  confidence: number;
  dataTimestamp: string;
}

interface RiskTimelineHorizon {
  timeframeLabel: string;
  timeframeKey: string;
  activeRisks: Array<{
    category: string;
    level: string;
    title: string;
    summary: string;
  }>;
}

export const PredictiveIntelligence: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [overallOutlook, setOverallOutlook] = useState<'low' | 'moderate' | 'high'>('low');
  const [riskScore, setRiskScore] = useState<number>(10);
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [timeline, setTimeline] = useState<RiskTimelineHorizon[]>([]);
  const [contextSummary, setContextSummary] = useState<any>(null);
  const [lastEvaluatedAt, setLastEvaluatedAt] = useState<string>('');

  useEffect(() => {
    fetchFarmsAndPredictions();
  }, [user]);

  const fetchFarmsAndPredictions = async () => {
    try {
      setLoading(true);
      const meRes = await api.get('/auth/me');
      const userFarms = meRes.data?.user?.farms || [];
      setFarms(userFarms);

      const targetId = selectedFarmId || (userFarms[0] ? userFarms[0]._id : undefined);
      if (targetId) setSelectedFarmId(targetId);

      await loadPredictions(targetId);
    } catch (err) {
      console.warn('[Predictive Intelligence] Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async (fId?: string, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const param = fId ? `/${fId}` : '';
      const endpoint = isRefresh ? `/predictions${param}/refresh` : `/predictions${param}`;
      const method = isRefresh ? api.post : api.get;

      const res = await method(`${endpoint}?language=${i18n.language}`);
      if (res.data && res.data.success) {
        setOverallOutlook(res.data.overallOutlook || 'low');
        setRiskScore(res.data.riskScore || 10);
        setSignals(res.data.signals || []);
        setTimeline(res.data.timeline || []);
        setContextSummary(res.data.contextSummary || null);
        setLastEvaluatedAt(res.data.lastEvaluatedAt || new Date().toISOString());
      }
    } catch (err) {
      console.error('[Predictive Intelligence] Load error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFarmChange = async (farmId: string) => {
    setSelectedFarmId(farmId);
    setLoading(true);
    await loadPredictions(farmId);
    setLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weather': return <CloudSun size={18} className="text-amber-500" />;
      case 'disease': return <Microscope size={18} className="text-purple-500" />;
      case 'water': return <Droplets size={18} className="text-blue-500" />;
      case 'nutrient': return <Sprout size={18} className="text-emerald-500" />;
      default: return <Activity size={18} className="text-brand-500" />;
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200';
      case 'moderate': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-brand-200 uppercase tracking-wider">
            <Activity size={14} className="text-emerald-400" /> Evidence-Based Risk Signals
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Predictive Crop Intelligence</h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Identifies potential environmental, pathogen, water, and nutrient risk signals early using hyper-local weather telemetry, digital soil chemistry, and leaf health histories.
          </p>
        </div>

        {/* Controls: Farm Selector & Refresh Button */}
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
            onClick={() => loadPredictions(selectedFarmId, true)}
            disabled={refreshing}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Evaluating Signals...' : 'Refresh Risk Model'}</span>
          </button>
        </div>
      </div>

      {/* Main Farm Risk Outlook Badge & Telemetry Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Farm Risk Outlook Status Card */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm ${
          overallOutlook === 'high'
            ? 'bg-red-500/10 border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-200'
            : overallOutlook === 'moderate'
            ? 'bg-amber-500/10 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Overall Farm Risk Outlook</span>
            <span className="text-xs font-bold text-gray-400">Score: {riskScore}/100</span>
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {overallOutlook === 'high' ? 'Needs Attention' : overallOutlook === 'moderate' ? 'Moderate Risk Signals' : 'Low Overall Risk'}
            </h2>
            <p className="text-xs opacity-80 mt-1">
              {overallOutlook === 'high'
                ? 'One or more high-priority risk signals detected. Review recommended actions below.'
                : overallOutlook === 'moderate'
                ? 'Environmental conditions require active monitoring over the coming 3 days.'
                : 'Current farm telemetry indicates stable crop environment.'}
            </p>
          </div>

          <div className="text-[10px] opacity-70 flex items-center gap-1 font-semibold">
            <Clock size={12} /> Evaluated: {lastEvaluatedAt ? new Date(lastEvaluatedAt).toLocaleTimeString() : 'Just now'}
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="md:col-span-2 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
            <h3 className="font-extrabold text-sm text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <MapPin size={16} className="text-brand-500" /> Active Farm Context Breakdown
            </h3>
            <span className="text-[10px] font-bold text-gray-400">
              Crop: {contextSummary?.crop || 'General Crop'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-dark-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Live Temp</span>
              <p className="text-sm font-extrabold text-gray-800 dark:text-dark-200 mt-0.5">
                {contextSummary?.tempCelsius !== undefined ? `${contextSummary.tempCelsius}°C` : 'N/A'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-dark-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Rain Forecast</span>
              <p className="text-sm font-extrabold text-gray-800 dark:text-dark-200 mt-0.5">
                {contextSummary?.rainProb !== undefined ? `${contextSummary.rainProb}%` : 'N/A'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-dark-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Soil pH</span>
              <p className="text-sm font-extrabold text-gray-800 dark:text-dark-200 mt-0.5">
                {contextSummary?.soilPh !== undefined && contextSummary?.soilPh !== null ? contextSummary.soilPh : 'Not Tested'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-dark-950/40 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Soil Nitrogen</span>
              <p className="text-sm font-extrabold text-gray-800 dark:text-dark-200 mt-0.5 truncate">
                {contextSummary?.soilN !== undefined && contextSummary?.soilN !== null ? `${contextSummary.soilN} kg/ha` : 'Not Tested'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
            <Info size={12} className="text-brand-500 shrink-0" />
            <span>AI Risk Assessment models use deterministic environmental thresholds combined with live telemetry.</span>
          </div>
        </div>
      </div>

      {/* Risk Category Cards Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base md:text-lg text-gray-800 dark:text-dark-100 flex items-center gap-2">
          <ShieldAlert size={18} className="text-brand-600" /> Active Evidence-Based Risk Signals
        </h3>

        {loading ? (
          <div className="p-8 bg-white dark:bg-dark-900 rounded-3xl border text-center text-xs text-gray-400">
            Loading risk models...
          </div>
        ) : signals.length === 0 ? (
          <div className="p-8 bg-white dark:bg-dark-900 rounded-3xl border border-gray-100 text-center space-y-2">
            <CheckCircle2 size={24} className="text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-gray-800 dark:text-dark-200">No Active High Risks Detected</h4>
            <p className="text-xs text-gray-500">Environmental parameters for your farm are within healthy baseline limits.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {signals.map((sig) => (
              <div 
                key={sig.id}
                className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 space-y-4 shadow-sm hover:border-brand-200 transition-all"
              >
                {/* Signal Header */}
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-dark-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-50 dark:bg-dark-800 rounded-2xl">
                      {getCategoryIcon(sig.category)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm md:text-base text-gray-800 dark:text-dark-100">{sig.title}</h4>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {sig.category} Risk • Timeframe: {sig.timeframe.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${getLevelBadgeClass(sig.level)}`}>
                    {sig.level} Risk
                  </span>
                </div>

                {/* Summary & Reasons */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-700 dark:text-dark-200 leading-relaxed font-medium">{sig.summary}</p>
                  {sig.reasons && sig.reasons.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-gray-500 dark:text-dark-400 space-y-1 pl-1">
                      {sig.reasons.map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Evidence Table Grid */}
                {sig.evidence && sig.evidence.length > 0 && (
                  <div className="p-3 bg-gray-50 dark:bg-dark-950/40 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Telemetry Evidence Log</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {sig.evidence.map((ev, eIdx) => (
                        <div key={eIdx} className="flex justify-between items-center text-[11px] p-1.5 bg-white dark:bg-dark-900 rounded-xl border border-gray-100 dark:border-dark-800">
                          <span className="text-gray-500 font-semibold truncate">{ev.label}:</span>
                          <span className="font-extrabold text-gray-800 dark:text-dark-100">{ev.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Actions */}
                {sig.recommendedActions && sig.recommendedActions.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Recommended Agronomic Action Steps</span>
                    <div className="space-y-2">
                      {sig.recommendedActions.map((act, aIdx) => (
                        <div key={aIdx} className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 flex items-start justify-between gap-3">
                          <div>
                            <h6 className="text-xs font-extrabold text-gray-800 dark:text-dark-100">{act.title}</h6>
                            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{act.reason}</p>
                          </div>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            act.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'
                          }`}>
                            {act.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Horizon Timeline Section */}
      <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base md:text-lg text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <Calendar size={18} className="text-brand-600" /> Multi-Day Risk Horizon Timeline
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Forecasted risk developments across different timeframe windows.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeline.map((item, tIdx) => (
            <div key={tIdx} className="p-4 bg-gray-50/60 dark:bg-dark-950/30 rounded-2xl border border-gray-100 dark:border-dark-800/40 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-800 pb-2">
                <span className="font-extrabold text-xs text-brand-700 dark:text-brand-400 uppercase tracking-wider">{item.timeframeLabel}</span>
                <span className="text-[10px] font-bold text-gray-400">{item.activeRisks.length} Risk(s)</span>
              </div>

              {item.activeRisks.length === 0 ? (
                <div className="p-3 text-[11px] text-gray-400 text-center font-medium">
                  No active risks forecasted.
                </div>
              ) : (
                <div className="space-y-2">
                  {item.activeRisks.map((r, rIdx) => (
                    <div key={rIdx} className="p-2.5 bg-white dark:bg-dark-900 rounded-xl border border-gray-100 dark:border-dark-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-gray-800 dark:text-dark-200 capitalize">{r.category}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${getLevelBadgeClass(r.level)}`}>
                          {r.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug truncate">{r.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
