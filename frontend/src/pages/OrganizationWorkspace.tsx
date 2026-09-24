import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Sprout,
  CheckSquare,
  FileText,
  Bot,
  Upload,
  Settings,
  Shield,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Send,
  Download,
  Check,
  RefreshCw
} from 'lucide-react';

export const OrganizationWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'farms' | 'members' | 'tasks' | 'reports' | 'copilot' | 'import' | 'settings'>('dashboard');

  const [org, setOrg] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponses, setCopilotResponses] = useState<Array<{ question: string; answer: string }>>([]);
  const [queryingCopilot, setQueryingCopilot] = useState(false);

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('FARM_MANAGER');

  // Task form
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ farmId: '', title: '', priority: 'medium', dueDate: new Date().toISOString().split('T')[0] });

  // Import form
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadWorkspaceData();
    }
  }, [id]);

  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !id) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [orgRes, dashRes, farmsRes, membersRes, tasksRes, reportsRes] = await Promise.all([
        fetch(`/api/organizations/${id}`, { headers }).then(r => r.json()),
        fetch(`/api/organizations/${id}/dashboard`, { headers }).then(r => r.json()),
        fetch(`/api/organizations/${id}/farms`, { headers }).then(r => r.json()),
        fetch(`/api/organizations/${id}/members`, { headers }).then(r => r.json()),
        fetch(`/api/organizations/${id}/tasks`, { headers }).then(r => r.json()),
        fetch(`/api/organizations/${id}/reports`, { headers }).then(r => r.json())
      ]);

      if (orgRes.success) setOrg(orgRes.data);
      if (dashRes.success) setDashboard(dashRes.data);
      if (farmsRes.success) setFarms(farmsRes.data);
      if (membersRes.success) setMembers(membersRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (reportsRes.success) setReports(reportsRes.data);
    } catch (err) {
      console.error('Error loading organization workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/organizations/${id}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      const data = await res.json();
      if (data.success) {
        setInviteModalOpen(false);
        setInviteEmail('');
        loadWorkspaceData();
      }
    } catch (err) {
      console.error('Error inviting member:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/organizations/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          farmId: newTask.farmId || (farms[0]?.id || ''),
          title: newTask.title,
          priority: newTask.priority,
          dueDate: newTask.dueDate
        })
      });
      const data = await res.json();
      if (data.success) {
        setTaskModalOpen(false);
        setNewTask({ farmId: '', title: '', priority: 'medium', dueDate: new Date().toISOString().split('T')[0] });
        loadWorkspaceData();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleCopilotQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim() || queryingCopilot) return;

    const q = copilotQuery;
    setCopilotQuery('');
    setQueryingCopilot(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/organizations/${id}/copilot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      if (data.success) {
        setCopilotResponses(prev => [...prev, { question: q, answer: data.data.answer }]);
      }
    } catch (err) {
      console.error('Copilot query error:', err);
    } finally {
      setQueryingCopilot(false);
    }
  };

  const handleGenerateReport = async (type: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/organizations/${id}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: `${type.replace('_', ' ')} Report`,
          reportType: type,
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          periodEnd: new Date()
        })
      });
      const data = await res.json();
      if (data.success) {
        loadWorkspaceData();
      }
    } catch (err) {
      console.error('Error generating report:', err);
    }
  };

  const handlePreviewImport = async () => {
    try {
      const records = [
        { farmName: 'East Agro Block 1', sizeAcres: 12.5, cropName: 'Cotton', state: 'Maharashtra', district: 'Nagpur' },
        { farmName: 'North Valley Field B', sizeAcres: 8.0, cropName: 'Wheat', state: 'Punjab', district: 'Ludhiana' }
      ];
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/organizations/${id}/import/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ records })
      });
      const data = await res.json();
      if (data.success) {
        setImportPreview({ records, result: data.data });
      }
    } catch (err) {
      console.error('Error previewing import:', err);
    }
  };

  const handleExecuteImport = async () => {
    if (!importPreview?.records) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/organizations/${id}/import/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ records: importPreview.records })
      });
      const data = await res.json();
      if (data.success) {
        setImportPreview(null);
        loadWorkspaceData();
      }
    } catch (err) {
      console.error('Error executing import:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Workspace Banner */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-extrabold text-xl">
            {org?.name?.charAt(0) || 'O'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-dark-50">{org?.name}</h1>
              <span className="px-2.5 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold text-[10px] rounded-full uppercase">
                {org?.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-semibold">{org?.type} • {org?.country || 'India'}</p>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-dark-800 p-1.5 rounded-2xl">
          {[
            { id: 'dashboard', label: 'Overview', icon: Building2 },
            { id: 'farms', label: 'Farms', icon: Sprout },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'copilot', label: 'Copilot', icon: Bot },
            { id: 'import', label: 'Import', icon: Upload },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-50 shadow-sm'
                    : 'text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-dark-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-5 rounded-3xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Managed Farms</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-dark-50 mt-1">{dashboard?.totalFarms || 0}</h3>
            </div>
            <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-5 rounded-3xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Active Crops</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{dashboard?.activeCropCycles || 0}</h3>
            </div>
            <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-5 rounded-3xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Total Members</p>
              <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{dashboard?.totalMembers || 0}</h3>
            </div>
            <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-5 rounded-3xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Pending Tasks</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{dashboard?.pendingTasks || 0}</h3>
            </div>
          </div>

          {/* Quick Farms Overview */}
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50">Multi-Farm Fleet Context</h3>
            {farms.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">No farms assigned to this organization yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-dark-800">
                {farms.map((f: any) => (
                  <div key={f.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-dark-100">{f.name}</p>
                      <p className="text-[10px] text-gray-400">{f.district}, {f.state} • {f.size} acres • {f.soilType}</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg">
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FARMS */}
      {activeTab === 'farms' && (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50">Organization Farms & Fields</h3>
            <span className="text-xs text-gray-400">{farms.length} Permitted Farms</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farms.map((f: any) => (
              <div key={f.id} className="p-4 border border-gray-100 dark:border-dark-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-dark-100">{f.name}</h4>
                  <span className="text-[10px] font-bold text-brand-500">{f.size} Acres</span>
                </div>
                <p className="text-[11px] text-gray-500">{f.district}, {f.state}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(f.currentCrops || ['Wheat']).map((c: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-dark-800 text-[10px] font-semibold text-gray-600 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50">Organization Member Directory</h3>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Invite Member
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-dark-800">
            {members.map((m: any) => (
              <div key={m.membershipId} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-dark-100">{m.name}</p>
                  <p className="text-[10px] text-gray-400">{m.email || m.phone || 'Member'} • Role: {m.role}</p>
                </div>
                <span className="px-2.5 py-1 bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-dark-300 font-bold text-[10px] rounded-lg">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50">Organization Tasks</h3>
            <button
              onClick={() => setTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Assign Task
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">No tasks scheduled for organization farms.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((t: any) => (
                <div key={t.id} className="p-3 border border-gray-100 dark:border-dark-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-dark-100">{t.title}</p>
                    <p className="text-[10px] text-gray-400">Farm: {t.farmName} • Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50">Reports & Analytics</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleGenerateReport('CROP_OVERVIEW')}
                className="px-3 py-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-xl"
              >
                + Crop Report
              </button>
              <button
                onClick={() => handleGenerateReport('DISEASE_INTELLIGENCE')}
                className="px-3 py-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-xl"
              >
                + Health Report
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {reports.map((r: any) => (
              <div key={r.id} className="p-4 border border-gray-100 dark:border-dark-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-dark-50">{r.title}</h4>
                  <p className="text-[10px] text-gray-400">{r.summary}</p>
                </div>
                <a
                  href={`/api/organizations/${id}/reports/${r.id}/export`}
                  download
                  className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV Export
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: COPILOT */}
      {activeTab === 'copilot' && (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50">Organization Copilot AI</h3>
          <p className="text-xs text-gray-500">Ask organization-wide agricultural questions scoped to permitted farms.</p>

          <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-dark-950 rounded-2xl">
            {copilotResponses.map((res, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs font-bold text-brand-600 dark:text-brand-400">Q: {res.question}</p>
                <p className="text-xs text-gray-800 dark:text-dark-100 bg-white dark:bg-dark-900 p-3 rounded-xl shadow-xs">{res.answer}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleCopilotQuery} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Which of our farms have pending irrigation tasks?"
              value={copilotQuery}
              onChange={e => setCopilotQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold focus:outline-none"
            />
            <button
              type="submit"
              disabled={queryingCopilot}
              className="px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Ask
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: IMPORT */}
      {activeTab === 'import' && (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50">CSV Data Import Engine</h3>
          <p className="text-xs text-gray-500">Batch import farms, fields, and crop cycles into your organization workspace.</p>

          {!importPreview ? (
            <button
              onClick={handlePreviewImport}
              className="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors"
            >
              Run Sample Batch Import Preview
            </button>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-2xl space-y-3">
              <p className="text-xs font-bold text-gray-800 dark:text-dark-100">
                Preview: {importPreview.result.validRecordsCount} valid record(s) ready for execution.
              </p>
              <button
                onClick={handleExecuteImport}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Confirm & Import Records
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50">Organization Settings & Billing</h3>
          <div className="p-4 border border-gray-100 dark:border-dark-800 rounded-2xl space-y-2 text-xs">
            <p className="font-bold text-gray-800 dark:text-dark-100">Plan: ORGANIZATION ENTERPRISE</p>
            <p className="text-gray-500">Includes unlimited farms, team access, organization Copilot, and bulk tasks.</p>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-dark-50">Invite Organization Member</h3>
            <form onSubmit={handleInviteMember} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Member Email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-semibold"
              />
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-semibold"
              >
                <option value="ORG_ADMIN">Organization Admin</option>
                <option value="FARM_MANAGER">Farm Manager</option>
                <option value="AGRONOMIST">Agronomist</option>
                <option value="ADVISOR">Advisor</option>
                <option value="FIELD_MANAGER">Field Manager</option>
                <option value="FARM_WORKER">Farm Worker</option>
                <option value="ANALYST">Analyst</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setInviteModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-dark-50">Assign Organization Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Task Title"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-semibold"
              />
              <select
                value={newTask.farmId}
                onChange={e => setNewTask({ ...newTask, farmId: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-semibold"
              >
                <option value="">Select Target Farm</option>
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setTaskModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
