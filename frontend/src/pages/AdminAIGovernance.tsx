import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Brain,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  MessageSquare,
  Award,
  Layers,
  Search,
  Check,
  X
} from 'lucide-react';

interface GovernanceMetrics {
  totalEvaluations: number;
  userFeedbackCount: number;
  expertReviewCount: number;
  openIncidentsCount: number;
  failureCategoryDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  activeKillSwitches: Record<string, boolean>;
}

interface AIIncidentItem {
  _id: string;
  incidentId: string;
  feature: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export const AdminAIGovernance: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [incidents, setIncidents] = useState<AIIncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchGovernanceData = async () => {
    try {
      setLoading(true);
      const [govRes, incRes] = await Promise.all([
        api.get('/ai/admin/governance'),
        api.get('/ai/admin/incidents')
      ]);

      if (govRes.data?.success) {
        setMetrics(govRes.data.data);
      }
      if (incRes.data?.success) {
        setIncidents(incRes.data.data || []);
      }
    } catch (err) {
      console.error('[AdminAIGovernance] Error fetching governance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const handleToggleKillSwitch = async (key: string, currentStatus: boolean) => {
    try {
      setActionLoading(key);
      const res = await api.post('/ai/admin/kill-switch', {
        targetKey: key,
        disabled: !currentStatus
      });
      if (res.data?.success) {
        await fetchGovernanceData();
      }
    } catch (err) {
      console.error('[AdminAIGovernance] Error toggling kill switch:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      setActionLoading(incidentId);
      const res = await api.post(`/ai/admin/incidents/${incidentId}/review`, {
        resolutionNotes: 'Reviewed and resolved by administrator.'
      });
      if (res.data?.success) {
        await fetchGovernanceData();
      }
    } catch (err) {
      console.error('[AdminAIGovernance] Error resolving incident:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-2xl">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              AI Evaluation, Governance & Reliability
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Traceability, model reliability metrics, incident safety, and emergency governance controls
            </p>
          </div>
        </div>

        <button
          onClick={fetchGovernanceData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Evaluated Outputs</span>
            <Brain className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics?.totalEvaluations || 0}</p>
          <p className="text-[11px] text-slate-400">Traceable AI recommendation records</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Farmer Feedback</span>
            <MessageSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics?.userFeedbackCount || 0}</p>
          <p className="text-[11px] text-slate-400">Recorded farmer rating events</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Expert Reviews</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics?.expertReviewCount || 0}</p>
          <p className="text-[11px] text-slate-400">Specialist-validated outputs</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Open AI Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics?.openIncidentsCount || 0}</p>
          <p className="text-[11px] text-slate-400">Escalated safety/quality items</p>
        </div>
      </div>

      {/* Emergency Kill Switches */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Power className="w-5 h-5 text-rose-500" />
              <span>Emergency AI Kill Switches</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instantly pause specific AI agents or capabilities without removing underlying data records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'crop_health_agent', label: 'Crop Health Agent' },
            { key: 'irrigation_agent', label: 'Irrigation Agent' },
            { key: 'market_agent', label: 'Market Intelligence Agent' },
            { key: 'autonomous_execution', label: 'All Autonomous Execution' }
          ].map(sw => {
            const isActiveDisabled = metrics?.activeKillSwitches?.[sw.key] === true;
            return (
              <div key={sw.key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{sw.label}</h4>
                  <span className={`text-[10px] font-semibold ${isActiveDisabled ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {isActiveDisabled ? 'PAUSED / DISABLED' : 'OPERATIONAL'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleKillSwitch(sw.key, isActiveDisabled)}
                  disabled={actionLoading === sw.key}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isActiveDisabled
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  {isActiveDisabled ? 'Enable' : 'Disable'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Incidents Queue */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>AI Safety & Quality Incidents Queue ({incidents.length})</span>
        </h2>

        {incidents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Open AI Incidents</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All AI outputs are operating within established reliability and safety boundaries.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map(inc => (
              <div key={inc._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inc.severity === 'CRITICAL' || inc.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}>
                      {inc.severity} &bull; {inc.category}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(inc.createdAt).toLocaleString()}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{inc.feature}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{inc.description}</p>
                </div>

                {inc.status === 'OPEN' && (
                  <button
                    onClick={() => handleResolveIncident(inc.incidentId)}
                    disabled={actionLoading === inc.incidentId}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors self-start md:self-auto"
                  >
                    Resolve Incident
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAIGovernance;
