import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { downloadOrSharePdf } from '../../services/native';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  AlertOctagon, 
  TrendingUp, 
  Clock, 
  User, 
  Mail, 
  MapPin, 
  Sprout, 
  ScanEye, 
  CloudSun, 
  Coins, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  BarChart3,
  PieChart as PieIcon,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
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
import { ReportPreviewModal } from '../ReportPreviewModal';
import { BrandLogo } from '../BrandLogo';

const CATEGORY_COLORS: Record<string, string> = {
  disease: '#DC2626',
  crop: '#245B38',
  weather: '#2563EB',
  expense: '#D97706'
};

const PIE_COLORS = ['#245B38', '#4F8A4B', '#2563EB', '#D97706', '#8B5CF6'];

export const AdminReportManagement: React.FC = () => {
  const { notify, confirm } = useNotification();

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);

  // Table state
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalReportsCount, setTotalReportsCount] = useState<number>(0);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals state
  const [selectedReportForDetails, setSelectedReportForDetails] = useState<any | null>(null);
  const [previewReport, setPreviewReport] = useState<any | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // 1. Fetch Real MongoDB Analytics
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get('/reports/admin/analytics');
      if (res.data?.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err: any) {
      console.error('[Admin Analytics Fetch Error]', err);
      notify.error('Unable to fetch report analytics data', 'Telemetry Error');
    } finally {
      setLoadingAnalytics(false);
    }
  }, [notify]);

  // 2. Fetch Paginated Reports Table
  const fetchReports = useCallback(async (page: number = 1) => {
    setLoadingReports(true);
    try {
      const params: any = { page, limit: 10 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedLang !== 'all') params.lang = selectedLang;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/reports/admin/all', { params });
      if (res.data?.success) {
        setReports(res.data.reports || []);
        setTotalReportsCount(res.data.pagination?.total || 0);
        setCurrentPage(res.data.pagination?.page || 1);
        setTotalPages(res.data.pagination?.pages || 1);
      }
    } catch (err: any) {
      console.error('[Admin Reports Fetch Error]', err);
      notify.error('Unable to load reports registry', 'Data Fetch Error');
    } finally {
      setLoadingReports(false);
    }
  }, [searchQuery, selectedType, selectedLang, selectedStatus, startDate, endDate, notify]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  // Preview PDF
  const handlePreview = async (report: any) => {
    const repId = report.reportId || report._id;
    try {
      const res = await api.get(`/reports/${repId}/preview`, { responseType: 'blob' });
      if (res.data) {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(blobUrl);
        setPreviewReport(report);
        setIsPreviewOpen(true);
      }
    } catch (err) {
      notify.error('Could not load PDF document preview', 'Preview Error');
    }
  };

  // Download PDF
  const handleDownload = async (report: any) => {
    const repId = report.reportId || report._id;
    notify.info(`Fetching secure PDF document for ${repId}...`, 'Preparing Download');
    try {
      const res = await api.get(`/reports/${repId}/download`, { responseType: 'blob' });
      if (res.data) {
        await downloadOrSharePdf(res.data, `TheKhedut_${repId}.pdf`, {
          title: `The Khedut Advisory Statement ${repId}`,
          text: `The Khedut Report ${repId}`
        });
        notify.success('Report PDF ready!', 'Download Complete');
      }
    } catch (err) {
      notify.error('Failed to download report PDF', 'Download Error');
    }
  };

  // Delete Report
  const handleDelete = async (report: any) => {
    const repId = report.reportId || report._id;
    const confirmed = await confirm({
      title: 'Delete Official Farmer Report?',
      message: `Permanently delete report ${repId} (${report.type.toUpperCase()}) for farmer ${report.farmerName || 'Unknown'}? This removes the record and the physical storage asset.`,
      confirmText: 'Permanently Delete',
      cancelText: 'Cancel',
      isDestructive: true
    });

    if (!confirmed) return;

    try {
      const res = await api.delete(`/reports/${repId}`);
      if (res.data?.success) {
        notify.success(`Report ${repId} deleted successfully`, 'Removed');
        if (selectedReportForDetails?.reportId === repId) {
          setSelectedReportForDetails(null);
        }
        fetchReports(currentPage);
        fetchAnalytics();
      }
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Failed to delete report', 'Deletion Error');
    }
  };

  // Format charts data
  const categoryPieData = analytics?.byCategory ? Object.entries(analytics.byCategory).map(([key, val]) => ({
    name: key.toUpperCase(),
    value: val as number
  })) : [];

  const languageBarData = analytics?.byLanguage ? Object.entries(analytics.byLanguage).map(([key, val]) => ({
    language: key.toUpperCase(),
    count: val as number
  })) : [];

  return (
    <div className="space-y-6 text-left">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-brand-50 dark:bg-emerald-950/30 text-brand-700 dark:text-emerald-400 rounded-2xl border border-brand-200 dark:border-emerald-800/40">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-xl text-gray-900 dark:text-dark-50 tracking-tight">
                Enterprise Report Management Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-brand-200 dark:border-emerald-800/50">
                Live MongoDB
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">
              Audit, preview, analyze, and manage all generated agricultural statements and disease pathology PDFs across the farmer network.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchAnalytics();
              fetchReports(currentPage);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-dark-200 bg-gray-50 dark:bg-dark-800 hover:bg-gray-100 transition-colors border border-gray-200 dark:border-dark-700 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* SECTION A: REAL REPORT ANALYTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Generated */}
        <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 p-5 rounded-3xl shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Statements</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-dark-50">
              {loadingAnalytics ? '...' : analytics?.totalReports || 0}
            </h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>All-Time</span>
            </span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-dark-400">Archived across all modules</p>
        </div>

        {/* Generated Today */}
        <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 p-5 rounded-3xl shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Generated Today</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-700 dark:text-emerald-400">
              {loadingAnalytics ? '...' : analytics?.reportsToday || 0}
            </h3>
            <span className="text-xs font-bold text-brand-600">Today</span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-dark-400">Real-time daily throughput</p>
        </div>

        {/* Generated This Month */}
        <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 p-5 rounded-3xl shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">This Month</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {loadingAnalytics ? '...' : analytics?.reportsThisMonth || 0}
            </h3>
            <span className="text-xs font-bold text-blue-500">MTD</span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-dark-400">Calendar month volume</p>
        </div>

        {/* Success Rate */}
        <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 p-5 rounded-3xl shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Generation Health</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {loadingAnalytics ? '...' : `${analytics?.successRate || 100}%`}
            </h3>
            <span className="text-xs font-bold text-emerald-500">
              {analytics?.successCount || 0} Succeeded
            </span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-dark-400">
            {analytics?.failedCount || 0} failed / aborted runs
          </p>
        </div>
      </div>

      {/* SECTION E: DASHBOARD VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Timeline Area Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-dark-50 tracking-tight">
                Report Generation Timeline (Last 14 Days)
              </h3>
              <p className="text-xs text-gray-400">Daily breakdown of generated farmer statements</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
              <span>Reports</span>
            </div>
          </div>

          <div className="h-56 w-full">
            {analytics?.dailyTrend && analytics.dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyTrend}>
                  <defs>
                    <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#245B38" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#245B38" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#245B38" strokeWidth={2.5} fillOpacity={1} fill="url(#reportGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 font-medium">
                No statement generation logs recorded in the selected window.
              </div>
            )}
          </div>
        </div>

        {/* Category & Language Distributions */}
        <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 p-5 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-dark-50 tracking-tight">
              Report Category Distribution
            </h3>
            <p className="text-xs text-gray-400">Share of generated statements by domain</p>
          </div>

          <div className="h-44 w-full">
            {categoryPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No category records
              </div>
            )}
          </div>

          {/* Category Legends */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-gray-100 dark:border-dark-800">
            {categoryPieData.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                <span className="font-semibold text-gray-700 dark:text-dark-300 truncate">{cat.name}: {cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION B & C: SEARCH, FILTERS & REPORT MANAGEMENT TABLE */}
      <div className="space-y-4 pt-2">
        
        {/* SEARCH AND FILTERS TOOLBAR */}
        <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 p-4 rounded-3xl shadow-sm flex flex-col lg:flex-row items-center gap-3">
          
          {/* Search by Farmer Name, Email, or Report ID */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by farmer name, email, or Report ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-dark-750 bg-gray-50 dark:bg-dark-850 text-xs text-gray-900 dark:text-dark-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
            {/* Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by report type"
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-750 bg-gray-50 dark:bg-dark-850 text-xs font-semibold text-gray-700 dark:text-dark-200 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="disease">Disease Pathology</option>
              <option value="crop">Crop Advisory</option>
              <option value="weather">Weather Statement</option>
              <option value="expense">Expense Ledger</option>
            </select>

            {/* Language */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              aria-label="Filter by language"
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-750 bg-gray-50 dark:bg-dark-850 text-xs font-semibold text-gray-700 dark:text-dark-200 focus:outline-none"
            >
              <option value="all">All Languages</option>
              <option value="en">English (EN)</option>
              <option value="gu">Gujarati (GU)</option>
              <option value="hi">Hindi (HI)</option>
              <option value="mr">Marathi (MR)</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by generation status"
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-750 bg-gray-50 dark:bg-dark-850 text-xs font-semibold text-gray-700 dark:text-dark-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed / Saved</option>
              <option value="failed">Failed Runs</option>
            </select>
          </div>
        </div>

        {/* REPORT MANAGEMENT TABLE */}
        {loadingReports ? (
          <div className="p-16 text-center bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-500">Querying MongoDB report registry...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl space-y-3">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="font-extrabold text-sm text-gray-700 dark:text-dark-200">No Reports Match Filter</h4>
            <p className="text-xs text-gray-400">Try adjusting your search query, type, or language filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9F5] dark:bg-dark-850 text-gray-500 dark:text-dark-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-gray-150 dark:border-dark-800">
                  <tr>
                    <th className="py-3.5 px-5">Report ID</th>
                    <th className="py-3.5 px-4">Farmer Details</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Subject / Crop</th>
                    <th className="py-3.5 px-4">Lang</th>
                    <th className="py-3.5 px-4">Generated Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-800 text-gray-700 dark:text-dark-200">
                  {reports.map((r) => {
                    const dateFormatted = new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                    const farmerDisplay = r.farmerName || r.user?.name || 'Registered Farmer';
                    const farmerEmailDisplay = r.farmerEmail || r.user?.email || 'N/A';

                    return (
                      <tr key={r._id} className="hover:bg-gray-50/70 dark:hover:bg-dark-850/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <button
                            onClick={() => setSelectedReportForDetails(r)}
                            className="font-mono font-bold text-brand-700 dark:text-emerald-400 hover:underline"
                          >
                            {r.reportId || r._id.substring(0, 10)}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 dark:text-dark-100">{farmerDisplay}</div>
                          <div className="text-[11px] text-gray-400">{farmerEmailDisplay}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            r.type === 'disease' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200' :
                            r.type === 'crop' ? 'bg-emerald-50 text-brand-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-brand-200' :
                            r.type === 'weather' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200' :
                            'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200'
                          }`}>
                            {r.type}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-dark-100 max-w-[180px] truncate">
                          {r.diseaseName || r.cropName || r.summary || 'Statement'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-800 font-mono text-[10px] font-bold uppercase">
                            {r.language || 'EN'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 dark:text-dark-400">
                          {dateFormatted}
                        </td>

                        <td className="py-3.5 px-4">
                          {r.status === 'failed' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                              <AlertOctagon className="w-3.5 h-3.5" />
                              <span>Failed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedReportForDetails(r)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-brand-700 hover:bg-gray-100 transition-colors"
                              title="View Details"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePreview(r)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-brand-700 hover:bg-gray-100 transition-colors"
                              title="Preview PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(r)}
                              className="p-1.5 rounded-lg text-brand-700 hover:bg-brand-50 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(r)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE RESPONSIVE CARDS */}
            <div className="lg:hidden space-y-3">
              {reports.map((r) => {
                const dateFormatted = new Date(r.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
                const farmerDisplay = r.farmerName || r.user?.name || 'Registered Farmer';

                return (
                  <div
                    key={r._id}
                    className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-2xl p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedReportForDetails(r)}
                        className="font-mono text-xs font-extrabold text-brand-700 dark:text-emerald-400 underline"
                      >
                        {r.reportId || r._id.substring(0, 10)}
                      </button>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        r.type === 'disease' ? 'bg-red-50 text-red-700' :
                        r.type === 'crop' ? 'bg-emerald-50 text-brand-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {r.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-dark-50">{farmerDisplay}</h4>
                      <p className="text-xs text-gray-600 dark:text-dark-300 mt-0.5">
                        {r.diseaseName || r.cropName || r.summary || 'Advisory Statement'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                        <span>{dateFormatted}</span>
                        <span>•</span>
                        <span className="font-mono uppercase font-bold">{r.language || 'EN'}</span>
                        <span>•</span>
                        <span className={r.status === 'failed' ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                          {r.status === 'failed' ? 'Failed' : 'Completed'}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-dark-800 pt-2.5 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedReportForDetails(r)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
                      >
                        Details
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(r)}
                          className="p-1.5 rounded-xl text-gray-600 hover:text-brand-700 hover:bg-gray-100"
                          title="Preview PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(r)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 flex items-center gap-1 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500 dark:text-dark-400">
                  Showing page {currentPage} of {totalPages} ({totalReportsCount} reports total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => fetchReports(currentPage - 1)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-dark-750 text-gray-600 dark:text-dark-300 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => fetchReports(currentPage + 1)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-dark-750 text-gray-600 dark:text-dark-300 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* SECTION D: INDIVIDUAL REPORT DETAILS MODAL */}
      {selectedReportForDetails && (
        <div 
          className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-dark-800 pb-4">
              <div className="flex items-center gap-3">
                <BrandLogo variant="symbol" size="sm" />
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-dark-50">
                    Report Specification Audit
                  </h3>
                  <span className="font-mono text-xs text-brand-700 dark:text-emerald-400 font-bold">
                    {selectedReportForDetails.reportId || selectedReportForDetails._id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportForDetails(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DETAILS GRID */}
            <div className="space-y-3.5 text-xs text-gray-600 dark:text-dark-300">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 dark:bg-dark-850 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Farmer Name</span>
                  <span className="font-extrabold text-gray-850 dark:text-dark-100">
                    {selectedReportForDetails.farmerName || selectedReportForDetails.user?.name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Farmer Email</span>
                  <span className="font-medium text-gray-700 dark:text-dark-200 truncate block">
                    {selectedReportForDetails.farmerEmail || selectedReportForDetails.user?.email || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-gray-50 dark:bg-dark-850 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 block">Type</span>
                  <span className="font-bold text-gray-800 dark:text-dark-100 uppercase">{selectedReportForDetails.type}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-850 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 block">Language</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-dark-100 uppercase">{selectedReportForDetails.language || 'EN'}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-850 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 block">Downloads</span>
                  <span className="font-bold text-gray-800 dark:text-dark-100">{selectedReportForDetails.downloadCount || 1} times</span>
                </div>
              </div>

              {selectedReportForDetails.summary && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 rounded-2xl">
                  <span className="text-[10px] font-bold text-brand-800 uppercase block mb-1">Diagnosis Summary</span>
                  <p className="text-xs text-brand-900 leading-relaxed font-medium">
                    {selectedReportForDetails.summary}
                  </p>
                </div>
              )}

              <div className="text-[11px] text-gray-400 space-y-1 pt-1">
                <div>Created: {new Date(selectedReportForDetails.createdAt).toLocaleString('en-IN')}</div>
                <div>File Size: {selectedReportForDetails.fileSize ? `${(selectedReportForDetails.fileSize / 1024).toFixed(1)} KB` : 'Dynamic Buffer'}</div>
                <div>Storage Key: <span className="font-mono">{selectedReportForDetails.storageKey || 'the-khedut-reports'}</span></div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="border-t border-gray-150 dark:border-dark-800 pt-3 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedReportForDetails)}
                className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Report</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePreview(selectedReportForDetails)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview PDF</span>
                </button>
                <button
                  onClick={() => handleDownload(selectedReportForDetails)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewBlobUrl(null);
        }}
        report={previewReport}
        pdfBlobUrl={previewBlobUrl}
        onDownload={() => {
          if (previewReport) handleDownload(previewReport);
        }}
      />

    </div>
  );
};
