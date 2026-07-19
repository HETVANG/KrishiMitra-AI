import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  ShieldAlert, 
  Plus, 
  Coins, 
  Users, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Server, 
  MessageSquare, 
  History, 
  FileDown, 
  Ban, 
  Unlock, 
  Bell, 
  Search, 
  Filter, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// React Error Boundary for Charts / Widgets
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[Admin Panel Widget Failure]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
          <h4 className="font-extrabold text-red-700 text-sm">Analytics Widget Failure</h4>
          <p className="text-xs text-red-500 mt-1">An error occurred while loading this chart.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-xl shadow hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading Skeletons
const SkeletonCard = () => (
  <div className="animate-pulse bg-gray-100 dark:bg-dark-800 p-5 rounded-2xl h-24 w-full">
    <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/3 mb-3"></div>
    <div className="h-6 bg-gray-300 dark:bg-dark-600 rounded w-2/3"></div>
  </div>
);

const SkeletonTable = () => (
  <div className="animate-pulse space-y-3 w-full my-4">
    <div className="h-8 bg-gray-200 dark:bg-dark-800 rounded w-full"></div>
    <div className="h-7 bg-gray-150 dark:bg-dark-850 rounded w-full"></div>
    <div className="h-7 bg-gray-150 dark:bg-dark-850 rounded w-full"></div>
    <div className="h-7 bg-gray-150 dark:bg-dark-850 rounded w-full"></div>
  </div>
);

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'users' | 'schemes' | 'mandi' | 'forum' | 'audit' | 'broadcast'>('dashboard');
  
  // Dashboard & Health Stats
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Analytics Stats
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Users Page state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit] = useState(10);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRole, setUsersRole] = useState('');
  const [usersPlan, setUsersPlan] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Login History state
  const [loginHistoryList, setLoginHistoryList] = useState<any[]>([]);
  const [loginsTotal, setLoginsTotal] = useState(0);
  const [loginsPage, setLoginsPage] = useState(1);
  const [loadingLogins, setLoadingLogins] = useState(false);

  // Audit Logs state
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');

  // Scheme Form state
  const [schemeTitle, setSchemeTitle] = useState('');
  const [schemeDesc, setSchemeDesc] = useState('');
  const [schemeBenefits, setSchemeBenefits] = useState('');
  const [schemeCategory, setSchemeCategory] = useState('Income Support');
  const [schemeDeadline, setSchemeDeadline] = useState('');
  const [schemeLink, setSchemeLink] = useState('');
  const [schemeElig, setSchemeElig] = useState('');
  const [schemeDocs, setSchemeDocs] = useState('');

  // Mandi Form state
  const [mandiCrop, setMandiCrop] = useState('Wheat');
  const [mandiState, setMandiState] = useState('Haryana');
  const [mandiDistrict, setMandiDistrict] = useState('');
  const [mandiName, setMandiName] = useState('');
  const [mandiMin, setMandiMin] = useState('');
  const [mandiMax, setMandiMax] = useState('');
  const [mandiAvg, setMandiAvg] = useState('');

  // Forum state
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loadingForum, setLoadingForum] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch admin dashboard parameters
  const loadDashboard = async () => {
    setLoadingDashboard(true);
    setError('');
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data && res.data.success) {
        setDashboardData(res.data.stats);
      }
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      setError('Failed to fetch dashboard metrics telemetry.');
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Fetch charts telemetry data
  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    setError('');
    try {
      const res = await api.get('/admin/analytics');
      if (res.data && res.data.success) {
        setAnalyticsData(res.data.analytics);
      }
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError('Failed to query data series charts analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch users table
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const params: any = {
        page: usersPage,
        limit: usersLimit
      };
      if (usersSearch) params.search = usersSearch;
      if (usersRole) params.role = usersRole;
      if (usersPlan) params.plan = usersPlan;

      const res = await api.get('/admin/users', { params });
      if (res.data && res.data.success) {
        setUsersList(res.data.users);
        setUsersTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load user logs:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch logins index
  const loadLoginHistory = async () => {
    setLoadingLogins(true);
    try {
      const res = await api.get('/admin/login-history', {
        params: { page: loginsPage, limit: 10 }
      });
      if (res.data && res.data.success) {
        setLoginHistoryList(res.data.history);
        setLoginsTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load session logs:', err);
    } finally {
      setLoadingLogins(false);
    }
  };

  // Fetch security audit logs
  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await api.get('/admin/audit-logs', {
        params: { page: auditPage, limit: 10 }
      });
      if (res.data && res.data.success) {
        setAuditLogsList(res.data.logs);
        setAuditTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load audit trails:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Fetch community forum posts for moderation
  const loadForumQueue = async () => {
    setLoadingForum(true);
    try {
      const res = await api.get('/forum/list');
      if (res.data && res.data.success) {
        setPostsList(res.data.posts);
      }
    } catch (err) {
      console.error('Failed to load forum queue:', err);
    } finally {
      setLoadingForum(false);
    }
  };

  // Tab routing control
  useEffect(() => {
    setError('');
    setInfo('');
    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    } else if (activeTab === 'forum') {
      loadForumQueue();
    } else if (activeTab === 'mandi' || activeTab === 'schemes' || activeTab === 'broadcast') {
      // Form tabs - clear state
    }
  }, [activeTab, usersPage, usersRole, usersPlan, loginsPage, auditPage]);

  // Handle User Blocking
  const handleToggleBlock = async (userId: string) => {
    try {
      const res = await api.post(`/admin/users/${userId}/toggle-block`);
      if (res.data && res.data.success) {
        setInfo(res.data.message);
        loadUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle account block status.');
    }
  };

  // Broadcast Announcement
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage) return;
    setSubmitting(true);
    setError('');
    setInfo('');
    try {
      const res = await api.post('/admin/notifications/broadcast', {
        message: broadcastMessage,
        type: broadcastType
      });
      if (res.data && res.data.success) {
        setInfo(res.data.message);
        setBroadcastMessage('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send broadcast announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  // Publish Schemes
  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeTitle || !schemeDesc || !schemeDeadline) {
      setError('Title, description and deadline are required.');
      return;
    }

    setError('');
    setInfo('');
    setSubmitting(true);

    const eligArray = schemeElig.split(',').map(s => s.trim()).filter(s => s !== '');
    const docsArray = schemeDocs.split(',').map(s => s.trim()).filter(s => s !== '');

    try {
      const res = await api.post('/schemes/create', {
        title: schemeTitle,
        description: schemeDesc,
        eligibility: eligArray,
        benefits: schemeBenefits,
        documentsRequired: docsArray,
        applyLink: schemeLink,
        deadline: schemeDeadline,
        category: schemeCategory,
      });

      if (res.data && res.data.success) {
        setInfo('Government scheme published successfully!');
        setSchemeTitle('');
        setSchemeDesc('');
        setSchemeBenefits('');
        setSchemeDeadline('');
        setSchemeLink('');
        setSchemeElig('');
        setSchemeDocs('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish scheme.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Mandi Prices
  const handleUpdateMandi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandiDistrict || !mandiName || !mandiMin || !mandiMax || !mandiAvg) {
      setError('All fields are required.');
      return;
    }

    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const res = await api.post('/market/update', {
        state: mandiState,
        district: mandiDistrict,
        mandiName,
        crop: mandiCrop,
        minPrice: Number(mandiMin),
        maxPrice: Number(mandiMax),
        avgPrice: Number(mandiAvg)
      });

      if (res.data && res.data.success) {
        setInfo('Mandi crop rate updated successfully!');
        setMandiDistrict('');
        setMandiName('');
        setMandiMin('');
        setMandiMax('');
        setMandiAvg('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update mandi price.');
    } finally {
      setSubmitting(false);
    }
  };

  // Moderate forum posts
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Moderate thread: Are you sure you want to delete this community post?')) return;
    try {
      const res = await api.delete(`/forum/delete/${postId}`);
      if (res.data && res.data.success) {
        setInfo('Forum post moderated and removed.');
        loadForumQueue();
      }
    } catch (err) {
      console.error('Failed to moderate post:', err);
    }
  };

  // CSV Exporter Utility
  const exportDataCSV = (data: any[], headers: string[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }
    const headerRow = headers.join(',');
    const rows = data.map(item => 
      Object.keys(item).map(key => `"${String(item[key]).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pie colors
  const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldAlert size={28} /> Control Center Admin Panel
          </h1>
          <p className="text-red-100 text-xs md:text-sm mt-1 font-medium">Audit logs, analyze system health telemetry, block accounts, broadcast announcements, and publish mandi pricing and subsidies.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 bg-white dark:bg-dark-900 p-2 border border-gray-100 dark:border-dark-800/40 rounded-3xl shadow-sm">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-2 px-1 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50'}`}
        >
          <Activity size={14} /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-1 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'analytics' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50'}`}
        >
          <TrendingUp size={14} /> Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-1 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50'}`}
        >
          <Users size={14} /> Users
        </button>
        <button
          onClick={() => setActiveTab('schemes')}
          className={`py-2 px-1 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'schemes' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50'}`}
        >
          <Layers size={14} /> Schemes
        </button>
        <button
          onClick={() => setActiveTab('mandi')}
          className={`py-2 px-1 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'mandi' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50'}`}
        >
          <Coins size={14} /> Mandi
        </button>
        <button
          onClick={() => setActiveTab('forum')}
          className={`py-2 px-1 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'forum' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50'}`}
        >
          <ClipboardList size={14} /> Moderation
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2 px-1 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'audit' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50'}`}
        >
          <History size={14} /> Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`py-2 px-1 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'broadcast' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50'}`}
        >
          <Bell size={14} /> Broadcast
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 text-left">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {info && (
        <div className="flex items-start gap-2.5 p-3.5 bg-brand-50 border border-brand-200 rounded-2xl text-xs text-brand-700 text-left">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>{info}</span>
        </div>
      )}

      {/* RENDER VIEW AREA */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-105 dark:border-dark-800/30 shadow-sm min-h-[400px]">

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <Server size={18} className="text-red-500" /> Platform Executive Summary
            </h3>

            {loadingDashboard ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            ) : dashboardData ? (
              <div className="space-y-6">
                {/* KPI metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gray-50 dark:bg-dark-950 p-4 border rounded-2xl text-left">
                    <span className="block text-[9px] text-gray-400 font-extrabold uppercase">Total Users</span>
                    <span className="block text-2xl font-extrabold text-gray-800 dark:text-dark-100 mt-1">{dashboardData.totalUsers}</span>
                  </div>
                  <div className="bg-green-50/20 border border-green-100 p-4 rounded-2xl text-left">
                    <span className="block text-[9px] text-gray-400 font-extrabold uppercase">New Users Today</span>
                    <span className="block text-2xl font-extrabold text-green-600 mt-1">{dashboardData.newUsersToday}</span>
                  </div>
                  <div className="bg-amber-50/20 border border-amber-100 p-4 rounded-2xl text-left">
                    <span className="block text-[9px] text-gray-400 font-extrabold uppercase">Active Users (30d)</span>
                    <span className="block text-2xl font-extrabold text-amber-600 mt-1">{dashboardData.activeUsers}</span>
                  </div>
                  <div className="bg-blue-50/20 border border-blue-100 p-4 rounded-2xl text-left">
                    <span className="block text-[9px] text-gray-400 font-extrabold uppercase">Logged In Today</span>
                    <span className="block text-2xl font-extrabold text-blue-600 mt-1">{dashboardData.usersLoggedInToday}</span>
                  </div>
                  <div className="bg-red-50/20 border border-red-100 p-4 rounded-2xl text-left col-span-2 md:col-span-1">
                    <span className="block text-[9px] text-gray-400 font-extrabold uppercase">Est. Revenue</span>
                    <span className="block text-2xl font-extrabold text-red-600 mt-1 flex items-center"><DollarSign size={18}/>{dashboardData.totalRevenue}</span>
                  </div>
                </div>

                {/* System Health + API Monitor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System Health */}
                  <div className="bg-gray-50/40 dark:bg-dark-950/20 p-5 border border-gray-150 dark:border-dark-850 rounded-3xl space-y-4">
                    <h4 className="font-extrabold text-sm text-gray-800 dark:text-dark-150 flex items-center gap-1.5 border-b pb-2">
                      💻 Host Health Diagnostics
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 font-bold block uppercase text-[9px]">Mongoose Database</span>
                        <span className={`inline-block px-2 py-0.5 rounded font-extrabold text-[10px] mt-1 ${dashboardData.systemHealth?.dbConnected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {dashboardData.systemHealth?.dbConnected ? 'CONNECTED' : 'DISCONNECTED'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block uppercase text-[9px]">Server Uptime</span>
                        <span className="font-extrabold text-gray-800 dark:text-dark-100 block mt-1">
                          {Math.floor(dashboardData.systemHealth?.uptime / 60)} mins
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400 font-bold block uppercase text-[9px] mb-1">Ram utilization ({Math.round(dashboardData.systemHealth?.memory?.used / (1024*1024))}MB used)</span>
                        <div className="w-full bg-gray-200 dark:bg-dark-800 rounded-full h-2">
                          <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${dashboardData.systemHealth?.memory?.percentageUsed}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Monitor status */}
                  <div className="bg-gray-50/40 dark:bg-dark-950/20 p-5 border border-gray-150 dark:border-dark-850 rounded-3xl space-y-4">
                    <h4 className="font-extrabold text-sm text-gray-800 dark:text-dark-150 flex items-center gap-1.5 border-b pb-2">
                      🔌 External API Integrations Monitor
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600 dark:text-dark-300">Gemini LLM Engine</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${dashboardData.systemHealth?.geminiStatus === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {dashboardData.systemHealth?.geminiStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600 dark:text-dark-300">OpenWeather Feeds</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${dashboardData.systemHealth?.weatherStatus === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {dashboardData.systemHealth?.weatherStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600 dark:text-dark-300">Cloudinary CDN Storage</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${dashboardData.systemHealth?.cloudinaryStatus === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {dashboardData.systemHealth?.cloudinaryStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Logins (Activity History) */}
                <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-2xl overflow-hidden mt-6">
                  <div className="p-4 border-b border-gray-150 flex justify-between items-center bg-gray-50 dark:bg-dark-850">
                    <h4 className="font-extrabold text-sm text-gray-800 dark:text-dark-150 flex items-center gap-1">
                      <History size={16} /> Recent Logins Activity History
                    </h4>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 dark:bg-dark-800 text-gray-500 font-bold border-b border-gray-150">
                      <tr>
                        <th className="p-3">User</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Login Time</th>
                        <th className="p-3">Browser</th>
                        <th className="p-3">Device</th>
                        <th className="p-3">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-dark-800/40">
                      {dashboardData.recentActivity?.map((activity: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-55/50">
                          <td className="p-3 font-bold text-gray-800 dark:text-dark-200">{activity.name}</td>
                          <td className="p-3 text-gray-500">{activity.email}</td>
                          <td className="p-3 text-gray-500">{new Date(activity.loginTime).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-gray-400 font-semibold">{activity.browser}</td>
                          <td className="p-3 text-gray-400 capitalize">{activity.device}</td>
                          <td className="p-3 text-gray-400 font-bold">{activity.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center py-10 text-xs text-gray-400">Failed to render dashboard summaries.</p>
            )}
          </div>
        )}

        {/* TAB 2: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <TrendingUp size={18} className="text-red-500" /> Platform Visual Telemetry
            </h3>

            {loadingAnalytics ? (
              <SkeletonTable />
            ) : analyticsData ? (
              <div className="space-y-8">
                {/* User Growth */}
                <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-dark-950 p-4 border rounded-2xl">
                  <div className="text-center">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">7 Days Registrations</span>
                    <span className="text-xl font-extrabold text-brand-600 block mt-1">+{analyticsData.userGrowth?.growth7Days}</span>
                  </div>
                  <div className="text-center border-x">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">30 Days Registrations</span>
                    <span className="text-xl font-extrabold text-brand-600 block mt-1">+{analyticsData.userGrowth?.growth30Days}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">365 Days Registrations</span>
                    <span className="text-xl font-extrabold text-brand-600 block mt-1">+{analyticsData.userGrowth?.growth365Days}</span>
                  </div>
                </div>

                {/* Charts section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Daily Logins */}
                  <div className="border border-gray-150 dark:border-dark-800 p-4 rounded-3xl bg-white dark:bg-dark-900 shadow-sm space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Daily Logins (Past 30 Days)</h4>
                    <div className="h-64">
                      <ErrorBoundary>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analyticsData.dailyLogins}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="logins" stroke="#ef4444" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ErrorBoundary>
                    </div>
                  </div>

                  {/* Monthly Registrations */}
                  <div className="border border-gray-150 dark:border-dark-800 p-4 rounded-3xl bg-white dark:bg-dark-900 shadow-sm space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Monthly Registrations (Past 12 Months)</h4>
                    <div className="h-64">
                      <ErrorBoundary>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.monthlyRegistrations}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Bar dataKey="registrations" fill="#22c55e" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ErrorBoundary>
                    </div>
                  </div>

                  {/* Disease breakdown */}
                  <div className="border border-gray-150 dark:border-dark-800 p-4 rounded-3xl bg-white dark:bg-dark-900 shadow-sm space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Disease Pathology Occurrence Diagnostics</h4>
                    <div className="h-64 flex items-center justify-center">
                      <ErrorBoundary>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.diseaseAnalytics}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                            >
                              {analyticsData.diseaseAnalytics.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </ErrorBoundary>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center text-[10px] font-bold">
                      {analyticsData.diseaseAnalytics.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-gray-500">{entry.name}: {entry.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Soil chemistry analytics */}
                  <div className="border border-gray-150 dark:border-dark-800 p-4 rounded-3xl bg-white dark:bg-dark-900 shadow-sm space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Average Soil Chemistry Indices</h4>
                    <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-bold">
                      <div className="bg-gray-50 dark:bg-dark-950 p-4 rounded-2xl text-left border">
                        <span className="block text-[9px] text-gray-400 uppercase">Average pH</span>
                        <span className="block text-lg text-brand-600 mt-1">{analyticsData.soilAnalytics?.avgPH} pH</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-950 p-4 rounded-2xl text-left border">
                        <span className="block text-[9px] text-gray-400 uppercase">Average Nitrogen</span>
                        <span className="block text-lg text-brand-600 mt-1">{analyticsData.soilAnalytics?.avgN} kg/ha</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-950 p-4 rounded-2xl text-left border">
                        <span className="block text-[9px] text-gray-400 uppercase">Average Phosphorus</span>
                        <span className="block text-lg text-brand-600 mt-1">{analyticsData.soilAnalytics?.avgP} kg/ha</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-950 p-4 rounded-2xl text-left border">
                        <span className="block text-[9px] text-gray-400 uppercase">Average Potassium</span>
                        <span className="block text-lg text-brand-600 mt-1">{analyticsData.soilAnalytics?.avgK} kg/ha</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-10 text-xs text-gray-400">Failed to render charts telemetry logs.</p>
            )}
          </div>
        )}

        {/* TAB 3: USERS INDEX */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-50 dark:border-dark-850">
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-1.5">
                <Users size={18} className="text-red-500" /> Platform Registered Users Index
              </h3>
              <button
                onClick={() => exportDataCSV(
                  usersList.map(u => ({ Name: u.name, Email: u.email, Role: u.role, Plan: u.plan, Status: u.subscriptionStatus, Blocked: u.isBlocked })),
                  ['Name', 'Email', 'Role', 'Plan', 'Status', 'Blocked'],
                  'users_list'
                )}
                className="px-3 py-1.5 bg-gray-50 dark:bg-dark-950 border rounded-xl font-bold text-xs flex items-center gap-1.5 text-gray-600 hover:bg-gray-100"
              >
                <FileDown size={14} /> Export CSV
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-55/30 p-4 rounded-2xl border">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user name, email..."
                  value={usersSearch}
                  onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                />
              </div>
              <div>
                <select
                  value={usersRole}
                  onChange={(e) => { setUsersRole(e.target.value); setUsersPage(1); }}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="farmer">Farmer</option>
                  <option value="expert">Expert</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <select
                  value={usersPlan}
                  onChange={(e) => { setUsersPlan(e.target.value); setUsersPage(1); }}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                >
                  <option value="">All Plans</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <button
                onClick={() => { setUsersSearch(''); setUsersRole(''); setUsersPlan(''); setUsersPage(1); loadUsers(); }}
                className="px-3 py-2 bg-red-600 text-white font-bold rounded-xl text-xs"
              >
                Clear Filters
              </button>
            </div>

            {/* Users Table */}
            {loadingUsers ? (
              <SkeletonTable />
            ) : (
              <div className="space-y-4">
                <div className="border border-gray-150 dark:border-dark-800 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-dark-800 text-gray-500 font-bold border-b border-gray-150">
                      <tr>
                        <th className="p-3">User Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Active Plan</th>
                        <th className="p-3">Last Login</th>
                        <th className="p-3 text-center">Moderation Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-dark-800/40">
                      {usersList.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-850/10">
                          <td className="p-3 font-bold text-gray-800 dark:text-dark-200">{item.name}</td>
                          <td className="p-3 text-gray-500 font-medium">{item.email}</td>
                          <td className="p-3 capitalize font-bold">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${item.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'}`}>
                              {item.role}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500 font-semibold uppercase">{item.plan || 'free'}</td>
                          <td className="p-3 text-gray-450">{item.lastLogin ? new Date(item.lastLogin).toLocaleString('en-IN') : 'Never'}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleToggleBlock(item._id)}
                              className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-colors ${item.isBlocked ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                            >
                              {item.isBlocked ? 'Unblock Account' : 'Block Account'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-2xl">
                  <span>Total Users matched: {usersTotal}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUsersPage(prev => Math.max(prev - 1, 1))}
                      disabled={usersPage === 1}
                      className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1 bg-white border rounded-lg">{usersPage}</span>
                    <button
                      onClick={() => setUsersPage(prev => (usersPage * usersLimit < usersTotal ? prev + 1 : prev))}
                      disabled={usersPage * usersLimit >= usersTotal}
                      className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SCHEMES PUBLISHER */}
        {activeTab === 'schemes' && (
          <form onSubmit={handleCreateScheme} className="space-y-4 text-left">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <Plus size={18} className="text-red-500" /> Publish Subsidy / Scheme
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Scheme Title</label>
                <input
                  type="text"
                  required
                  value={schemeTitle}
                  onChange={(e) => setSchemeTitle(e.target.value)}
                  placeholder="e.g. Subsidized Solar Water Pump Scheme 2026"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Category</label>
                <select
                  value={schemeCategory}
                  onChange={(e) => setSchemeCategory(e.target.value)}
                  className="custom-input text-sm"
                >
                  <option value="Income Support">Income Support</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Subsidies">Subsidies</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Benefits Description</label>
              <input
                type="text"
                required
                value={schemeBenefits}
                onChange={(e) => setSchemeBenefits(e.target.value)}
                placeholder="e.g. 75% financial subsidy on solar pumping systems up to 5HP"
                className="custom-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Detailed Description</label>
              <textarea
                required
                value={schemeDesc}
                onChange={(e) => setSchemeDesc(e.target.value)}
                placeholder="Describe details, features, eligibility definitions..."
                className="custom-input h-24 resize-none py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Eligibility Criteria (comma separated)</label>
                <input
                  type="text"
                  value={schemeElig}
                  onChange={(e) => setSchemeElig(e.target.value)}
                  placeholder="e.g. Must be resident, Max land 5 acres"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Required Documents (comma separated)</label>
                <input
                  type="text"
                  value={schemeDocs}
                  onChange={(e) => setSchemeDocs(e.target.value)}
                  placeholder="e.g. Aadhaar Card, Land records, Bank Book"
                  className="custom-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Official Portal Apply URL</label>
                <input
                  type="url"
                  value={schemeLink}
                  onChange={(e) => setSchemeLink(e.target.value)}
                  placeholder="https://subsidy.gov.in"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Application Deadline Date</label>
                <input
                  type="date"
                  required
                  value={schemeDeadline}
                  onChange={(e) => setSchemeDeadline(e.target.value)}
                  className="custom-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 text-white font-bold rounded-xl text-xs md:text-sm shadow-md flex items-center justify-center shrink-0 w-full transition-colors duration-150"
            >
              {submitting ? 'Publishing...' : 'Publish Government Scheme'}
            </button>
          </form>
        )}

        {/* TAB 5: MANDI FEEDS */}
        {activeTab === 'mandi' && (
          <form onSubmit={handleUpdateMandi} className="space-y-4 text-left">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <Plus size={18} className="text-red-500" /> Update Mandi Crop Price
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Crop Commodity</label>
                <select
                  value={mandiCrop}
                  onChange={(e) => setMandiCrop(e.target.value)}
                  className="custom-input text-sm"
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Paddy">Paddy</option>
                  <option value="Rice (Basmati)">Rice (Basmati)</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Potato">Potato</option>
                  <option value="Onion">Onion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">State</label>
                <select
                  value={mandiState}
                  onChange={(e) => setMandiState(e.target.value)}
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
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">District</label>
                <input
                  type="text"
                  required
                  value={mandiDistrict}
                  onChange={(e) => setMandiDistrict(e.target.value)}
                  placeholder="e.g. Karnal, Rajkot"
                  className="custom-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Mandi Name</label>
                <input
                  type="text"
                  required
                  value={mandiName}
                  onChange={(e) => setMandiName(e.target.value)}
                  placeholder="e.g. Karnal Mandi"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Min Rate (₹/Qtl)</label>
                <input
                  type="number"
                  required
                  value={mandiMin}
                  onChange={(e) => setMandiMin(e.target.value)}
                  placeholder="2100"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Max Rate (₹/Qtl)</label>
                <input
                  type="number"
                  required
                  value={mandiMax}
                  onChange={(e) => setMandiMax(e.target.value)}
                  placeholder="2300"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Avg Rate (₹/Qtl)</label>
                <input
                  type="number"
                  required
                  value={mandiAvg}
                  onChange={(e) => setMandiAvg(e.target.value)}
                  placeholder="2200"
                  className="custom-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 text-white font-bold rounded-xl text-xs md:text-sm shadow-md flex items-center justify-center shrink-0 w-full transition-colors duration-150"
            >
              {submitting ? 'Updating...' : 'Publish Mandi Rate Log'}
            </button>
          </form>
        )}

        {/* TAB 6: MODERATION BOARD */}
        {activeTab === 'forum' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <ClipboardList size={18} className="text-red-500" /> Community Forum Moderation Queue
            </h3>

            {loadingForum ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-3 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
              </div>
            ) : postsList.length > 0 ? (
              <div className="space-y-3">
                {postsList.map((post) => (
                  <div 
                    key={post._id}
                    className="p-4 bg-gray-55 dark:bg-dark-850/20 border border-gray-150 rounded-2xl flex items-center justify-between gap-4 text-left"
                  >
                    <div>
                      <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-200">{post.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Author: {post.author?.name} | Created: {new Date(post.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-xl transition-colors shrink-0"
                      title="Moderate & Delete Thread"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-xs text-gray-400 italic">No forum threads logged in the moderation queue.</p>
            )}
          </div>
        )}

        {/* TAB 7: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-dark-850">
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-1.5">
                <History size={18} className="text-red-500" /> System Security Audit Logs
              </h3>
              <button
                onClick={() => exportDataCSV(
                  auditLogsList.map(a => ({ Timestamp: a.timestamp, Action: a.action, Target: a.target, Details: a.details })),
                  ['Timestamp', 'Action', 'Target', 'Details'],
                  'audit_logs'
                )}
                className="px-3 py-1.5 bg-gray-50 dark:bg-dark-950 border rounded-xl font-bold text-xs flex items-center gap-1.5 text-gray-600 hover:bg-gray-100"
              >
                <FileDown size={14} /> Export CSV
              </button>
            </div>

            {loadingAudit ? (
              <SkeletonTable />
            ) : (
              <div className="space-y-4">
                <div className="border border-gray-150 dark:border-dark-800 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-dark-800 text-gray-500 font-bold border-b border-gray-150">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Admin</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Target</th>
                        <th className="p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-dark-800/40">
                      {auditLogsList.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50/50">
                          <td className="p-3 text-gray-400 font-semibold">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                          <td className="p-3 font-bold text-gray-800 dark:text-dark-200">{log.adminId?.name || 'Admin'}</td>
                          <td className="p-3 capitalize font-bold text-red-600">{log.action}</td>
                          <td className="p-3 text-gray-500 font-semibold">{log.target}</td>
                          <td className="p-3 text-gray-550 leading-relaxed">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-2xl">
                  <span>Total Audit Logs matched: {auditTotal}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAuditPage(prev => Math.max(prev - 1, 1))}
                      disabled={auditPage === 1}
                      className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1 bg-white border rounded-lg">{auditPage}</span>
                    <button
                      onClick={() => setAuditPage(prev => (auditPage * 10 < auditTotal ? prev + 1 : prev))}
                      disabled={auditPage * 10 >= auditTotal}
                      className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: BROADCAST PANEL */}
        {activeTab === 'broadcast' && (
          <form onSubmit={handleBroadcast} className="space-y-4 text-left max-w-xl mx-auto">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <Bell size={18} className="text-red-500" /> Broadcast Global Notification Announcement
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Alert Level Type</label>
              <select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value)}
                className="custom-input text-sm"
              >
                <option value="info">Info (Light Blue Accent)</option>
                <option value="warning">Warning (Yellow/Amber Accent)</option>
                <option value="danger">Critical Alert (Red Accent)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Announcement Content Message</label>
              <textarea
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter alert text. This message will be instantly sent to all farmers' notification feeds..."
                className="custom-input h-32 resize-none py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 text-white font-bold rounded-xl text-xs md:text-sm shadow-md flex items-center justify-center w-full transition-colors duration-150"
            >
              {submitting ? 'Sending...' : 'Broadcast Alert'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
