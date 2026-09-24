import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  ShieldAlert,
  Droplets,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  RefreshCw,
  Play,
  Check,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
  Bot,
  Layers,
  FileText
} from 'lucide-react';

interface AgentStatusItem {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface AgentActivityItem {
  _id: string;
  agentType: string;
  eventType: string;
  observation: string;
  reasoningSummary: string;
  action?: {
    toolName?: string;
    summary?: string;
  };
  status: 'OBSERVED' | 'ANALYZING' | 'PLANNED' | 'WAITING_APPROVAL' | 'EXECUTED' | 'REJECTED' | 'FAILED' | 'VERIFIED';
  approvalRequired: boolean;
  approvedBy?: string;
  createdAt: string;
}

interface AgentTaskItem {
  _id: string;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: string;
  approvalRequired: boolean;
  agentType?: string;
  explanation?: string;
}

interface AgentPolicyData {
  autoAlertsEnabled: boolean;
  autoRemindersEnabled: boolean;
  autoTaskCreationEnabled: boolean;
  expertConsultationPolicy: 'ALWAYS_ASK' | 'AUTO_RECOMMEND';
  externalActionsEnabled: boolean;
}

export const FarmAgents: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'insights' | 'activities' | 'policies'>('insights');
  const [agents, setAgents] = useState<AgentStatusItem[]>([]);
  const [activities, setActivities] = useState<AgentActivityItem[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<AgentTaskItem[]>([]);
  const [activeTasks, setActiveTasks] = useState<AgentTaskItem[]>([]);
  const [policy, setPolicy] = useState<AgentPolicyData>({
    autoAlertsEnabled: true,
    autoRemindersEnabled: true,
    autoTaskCreationEnabled: false,
    expertConsultationPolicy: 'ALWAYS_ASK',
    externalActionsEnabled: false
  });

  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [automationStatus, setAutomationStatus] = useState<any>(null);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      const [statusRes, actRes, tasksRes, policyRes, autoStatusRes, weeklyRes] = await Promise.all([
        api.get('/agents/status'),
        api.get('/agents/activity?limit=15'),
        api.get('/agents/tasks'),
        api.get('/agents/policies'),
        api.get('/automation/status').catch(() => null),
        api.get('/automation/weekly-summary').catch(() => null)
      ]);

      if (statusRes.data?.success) {
        setAgents(statusRes.data.data.agents || []);
      }
      if (actRes.data?.success) {
        setActivities(actRes.data.data || []);
      }
      if (tasksRes.data?.success) {
        setPendingApprovals(tasksRes.data.data.pendingApprovals || []);
        setActiveTasks(tasksRes.data.data.activeTasks || []);
      }
      if (policyRes.data?.success) {
        setPolicy(policyRes.data.data || policy);
      }
      if (autoStatusRes?.data?.success) {
        setAutomationStatus(autoStatusRes.data.data);
      }
      if (weeklyRes?.data?.success) {
        setWeeklySummary(weeklyRes.data.data);
      }
    } catch (err) {
      console.error('[FarmAgents] Error fetching agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const handleRunAgentCycle = async () => {
    try {
      setRunningAgent(true);
      const res = await api.post('/agents/run');
      if (res.data?.success) {
        await fetchAgentData();
      }
    } catch (err) {
      console.error('[FarmAgents] Error running agent evaluation:', err);
    } finally {
      setRunningAgent(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      const res = await api.post(`/agents/tasks/${taskId}/approve`);
      if (res.data?.success) {
        await fetchAgentData();
      }
    } catch (err) {
      console.error('[FarmAgents] Failed to approve task:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      const res = await api.post(`/agents/tasks/${taskId}/reject`);
      if (res.data?.success) {
        await fetchAgentData();
      }
    } catch (err) {
      console.error('[FarmAgents] Failed to reject task:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePolicyToggle = async (key: keyof AgentPolicyData, val: any) => {
    const updated = { ...policy, [key]: val };
    setPolicy(updated);
    try {
      await api.put('/agents/policies', updated);
    } catch (err) {
      console.error('[FarmAgents] Failed to update policy:', err);
    }
  };

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'farm_monitoring':
        return <Activity className="w-5 h-5 text-emerald-500" />;
      case 'crop_health':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      case 'irrigation':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'market':
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'planning':
        return <Brain className="w-5 h-5 text-purple-500" />;
      default:
        return <Bot className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 md:p-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Farm Intelligence & Agents</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Autonomous, permission-governed AI agents continuously monitoring your farm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAgentData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunAgentCycle}
            disabled={runningAgent}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-md shadow-brand-600/20 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${runningAgent ? 'animate-spin' : ''}`} />
            <span>{runningAgent ? 'Evaluating...' : 'Run Agent Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* Active Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {agents.map(ag => (
          <div key={ag.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              {getAgentIcon(ag.id)}
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{ag.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{ag.description}</p>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'insights'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Pending Approvals ({pendingApprovals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'activities'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Agent Activity Audit Log</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'policies'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Policy & Automation Rules</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : activeTab === 'insights' ? (
        <div className="space-y-6">
          {/* Pending Approvals Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Pending Farmer Approvals</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Actions recommended by agents that require your explicit approval before execution.
            </p>

            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Pending Approvals</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  All agent recommendations have been reviewed or executed automatically based on your policy settings.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApprovals.map(item => (
                  <div key={item._id} className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        item.priority === 'high'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}>
                        {item.priority} priority &bull; {item.agentType || 'Agent'}
                      </span>
                      <span className="text-xs text-slate-400">Due: {item.dueDate}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{item.reason}</p>

                    {item.explanation && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                        <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">Agent Reasoning:</strong>
                        {item.explanation}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleReject(item._id)}
                        disabled={actionLoading === item._id}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(item._id)}
                        disabled={actionLoading === item._id}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20"
                      >
                        Approve Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Tasks Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              <span>Active Agent Tasks</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tasks created by agents and approved for farm management.
            </p>

            {activeTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No active approved agent tasks.</p>
            ) : (
              <div className="space-y-3">
                {activeTasks.map(t => (
                  <div key={t._id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{t.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{t.reason}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'activities' ? (
        /* AUDIT LOG TAB */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Agent Activity Audit Log</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Transparent audit trail of agent evaluations, observations, policy decisions, and verified executions.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">Agent</th>
                  <th className="py-3 px-4 font-bold">Event Type</th>
                  <th className="py-3 px-4 font-bold">Observation</th>
                  <th className="py-3 px-4 font-bold">Action / Tool</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activities.map(act => (
                  <tr key={act._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {act.agentType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                      {act.eventType}
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      {act.observation}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {act.action?.toolName || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        act.status === 'VERIFIED' || act.status === 'EXECUTED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : act.status === 'WAITING_APPROVAL'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : act.status === 'REJECTED' || act.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* POLICIES TAB */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Agent Policy & Permission Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure strict permission boundaries for agent recommendations and automated actions.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Automatic Weather & Risk Alerts</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Allow agents to automatically send notifications for high weather risks or severe disease scans.</p>
              </div>
              <input
                type="checkbox"
                checked={policy.autoAlertsEnabled}
                onChange={e => handlePolicyToggle('autoAlertsEnabled', e.target.checked)}
                className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Automatic Reminders</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Allow agents to schedule routine inspection reminders.</p>
              </div>
              <input
                type="checkbox"
                checked={policy.autoRemindersEnabled}
                onChange={e => handlePolicyToggle('autoRemindersEnabled', e.target.checked)}
                className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Automatic Task Creation (Without Approval)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Allow agents to directly add tasks to your daily list without queuing for farmer approval first.</p>
              </div>
              <input
                type="checkbox"
                checked={policy.autoTaskCreationEnabled}
                onChange={e => handlePolicyToggle('autoTaskCreationEnabled', e.target.checked)}
                className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Expert Consultation Policy</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">How specialist consultation requests are handled when severe crop risks are identified.</p>
              </div>
              <select
                value={policy.expertConsultationPolicy}
                onChange={e => handlePolicyToggle('expertConsultationPolicy', e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                <option value="ALWAYS_ASK">Always Ask (Requires Approval)</option>
                <option value="AUTO_RECOMMEND">Auto Recommend</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmAgents;
