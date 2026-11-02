import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api, getApiBaseUrl } from '../services/api';
import { 
  FileText, 
  Download, 
  Sprout, 
  CloudSun, 
  Coins, 
  ScanEye, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReportPreviewModal } from '../components/ReportPreviewModal';
import { BrandLogo } from '../components/BrandLogo';

export const Reports: React.FC = () => {
  const { user, token } = useAuth();
  const { t, i18n } = useTranslation();
  const { notify, confirm } = useNotification();

  // Active generation loading
  const [loadingType, setLoadingType] = useState<string | null>(null);

  // Farmer's report history
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters & Search
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLang, setFilterLang] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Preview Modal
  const [previewReport, setPreviewReport] = useState<any | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Fetch farmer's own reports from MongoDB
  const fetchMyReports = useCallback(async (page: number = 1) => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const params: any = { page, limit: 8 };
      if (filterType !== 'all') params.type = filterType;
      if (filterLang !== 'all') params.lang = filterLang;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/reports/my-reports', { params });
      if (res.data?.success) {
        setReportsList(res.data.reports || []);
        setTotalCount(res.data.pagination?.total || 0);
        setCurrentPage(res.data.pagination?.page || 1);
        setTotalPages(res.data.pagination?.pages || 1);
      }
    } catch (err: any) {
      console.warn('[Reports History Fetch Error]', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [token, filterType, filterLang, searchQuery]);

  useEffect(() => {
    fetchMyReports(1);
  }, [fetchMyReports]);

  // Handle Dynamic Report Generation & Storage
  const handleGenerateReport = async (reportType: 'crop' | 'weather' | 'expense' | 'disease') => {
    const hasPremium = user?.plan === 'premium' || (user?.subscriptionStatus === 'trialing' && new Date(user.trialEndDate || 0) > new Date());

    if ((reportType === 'crop' || reportType === 'disease') && !hasPremium) {
      notify.warning('Premium feature: Upgrade your subscription to export advanced Crop Planning & Pathology statements.', 'Subscription Required');
      return;
    }

    setLoadingType(reportType);
    notify.info(`Generating official The Khedut ${reportType.toUpperCase()} statement...`, 'Processing Report');

    try {
      const activeLang = i18n.language || user?.settings?.language || 'en';
      const res = await api.post('/reports/generate', {
        type: reportType,
        lang: activeLang
      });

      if (res.data?.success && res.data.report) {
        notify.success('Report generated and secured successfully!', 'Ready to View');
        
        // Fetch fresh list
        fetchMyReports(1);

        // Open preview modal immediately
        handlePreviewById(res.data.report.reportId || res.data.report.id);
      } else {
        throw new Error(res.data?.message || 'Report generation failed');
      }
    } catch (err: any) {
      console.error('[Report Generation Error]', err);
      notify.error(err.response?.data?.message || err.message || 'Unable to generate report. Please try again.', 'Generation Failed');
    } finally {
      setLoadingType(null);
    }
  };

  // Preview an existing report
  const handlePreviewById = async (reportIdOrMongoId: string) => {
    try {
      const res = await api.get(`/reports/${reportIdOrMongoId}/preview`, {
        responseType: 'blob'
      });

      if (res.data) {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(blobUrl);

        // Find report metadata in local list or build fallback
        const existing = reportsList.find(r => r.reportId === reportIdOrMongoId || r._id === reportIdOrMongoId);
        setPreviewReport(existing || {
          reportId: reportIdOrMongoId,
          type: 'advisory',
          createdAt: new Date()
        });
        setIsPreviewOpen(true);
      }
    } catch (err: any) {
      notify.error('Unable to load document preview. Please try downloading instead.', 'Preview Error');
    }
  };

  // Direct Download by Report ID
  const handleDownloadById = async (reportIdOrMongoId: string) => {
    notify.info('Initiating secure PDF download...', 'Preparing Document');
    try {
      const res = await api.get(`/reports/${reportIdOrMongoId}/download`, {
        responseType: 'blob'
      });

      if (res.data) {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `TheKhedut_${reportIdOrMongoId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);

        notify.success('Document downloaded successfully!', 'Download Complete');
        fetchMyReports(currentPage);
      }
    } catch (err: any) {
      notify.error('Failed to download PDF statement.', 'Download Failed');
    }
  };

  // Delete Report with Confirmation Dialog
  const handleDeleteReport = async (report: any) => {
    const confirmed = await confirm({
      title: 'Delete Report Record?',
      message: `Are you sure you want to delete report ${report.reportId || report._id}? This action will permanently remove the PDF document from storage.`,
      confirmText: 'Delete Report',
      cancelText: 'Keep Document',
      isDestructive: true
    });

    if (!confirmed) return;

    try {
      const res = await api.delete(`/reports/${report.reportId || report._id}`);
      if (res.data?.success) {
        notify.success('Report deleted successfully', 'Removed');
        fetchMyReports(currentPage);
      }
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Failed to delete report', 'Deletion Error');
    }
  };

  const generatorCards = [
    {
      id: 'crop',
      title: 'AI Crop & Soil Advisory Statement',
      description: 'Contains farm profile details, soil chemistry evaluations (NPK, pH), and AI-generated crop recommendations.',
      icon: Sprout,
      color: 'text-brand-700 dark:text-emerald-400 bg-brand-50 dark:bg-emerald-950/30 border-brand-200 dark:border-emerald-800/40',
      badge: 'Crop & Soil'
    },
    {
      id: 'weather',
      title: 'Climate Weather Advisory Statement',
      description: 'Contains current meteorological readings, 7-day agricultural forecast, severe climate alerts, and AI farming tips.',
      icon: CloudSun,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40',
      badge: 'Meteorology'
    },
    {
      id: 'expense',
      title: 'Farm Cost Ledger Statement',
      description: 'Contains financial ledger transaction log outputs, income/cost balances, and net profit audit metrics.',
      icon: Coins,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40',
      badge: 'Financials'
    },
    {
      id: 'disease',
      title: 'Leaf Pathology Diagnostics Statement',
      description: 'Contains crop leaf diagnostic logs, confidence scores, causes, symptoms, and organic or chemical treatment guides.',
      icon: ScanEye,
      color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40',
      badge: 'Pathology'
    }
  ];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden text-left">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                Official Agricultural Documents
              </span>
              <span className="text-emerald-200 text-xs font-semibold">• Cloud Stored</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Report Management & Advisory Statements
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
              Generate print-ready A4 PDF statements with The Khedut diagnostic branding. Every report is securely archived in MongoDB and Cloudinary storage.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-sm transition-all self-start md:self-center"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: ON-DEMAND STATEMENT GENERATORS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-dark-50 tracking-tight">
              Generate New Advisory Statement
            </h2>
            <p className="text-xs text-gray-500 dark:text-dark-400">
              Select an agronomic statement module to generate a real-time signed PDF document.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {generatorCards.map((card) => {
            const Icon = card.icon;
            const isLoading = loadingType === card.id;

            return (
              <div 
                key={card.id}
                className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-dark-400">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-dark-50 tracking-tight leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-dark-400 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-dark-800/80 mt-5 pt-4">
                  <button
                    disabled={isLoading}
                    onClick={() => handleGenerateReport(card.id as any)}
                    className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating Statement...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate & Store PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: FARMER'S ARCHIVED REPORT HISTORY */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-dark-50 tracking-tight">
                My Generated Reports Archive
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-brand-200 dark:border-emerald-800/50">
                {totalCount} Total
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">
              Access, preview, or re-download your previous diagnostic statements.
            </p>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => fetchMyReports(currentPage)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-dark-200 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* FILTERS & SEARCH BAR */}
        <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by crop, disease name, or Report ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-dark-750 bg-gray-50 dark:bg-dark-850 text-xs text-gray-900 dark:text-dark-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 text-left"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter reports by category"
              className="w-full md:w-auto px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-750 bg-gray-50 dark:bg-dark-850 text-xs font-semibold text-gray-700 dark:text-dark-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="disease">Disease Pathology</option>
              <option value="crop">Crop Advisory</option>
              <option value="weather">Weather Conditions</option>
              <option value="expense">Expense Ledger</option>
            </select>

            {/* Language Filter */}
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              aria-label="Filter reports by language"
              className="w-full md:w-auto px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-750 bg-gray-50 dark:bg-dark-850 text-xs font-semibold text-gray-700 dark:text-dark-200 focus:outline-none"
            >
              <option value="all">All Languages</option>
              <option value="en">English (EN)</option>
              <option value="gu">Gujarati (GU)</option>
              <option value="hi">Hindi (HI)</option>
            </select>
          </div>
        </div>

        {/* REPORTS LIST: DESKTOP TABLE / MOBILE RESPONSIVE CARDS */}
        {loadingHistory ? (
          <div className="p-12 text-center bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl space-y-3">
            <RefreshCw className="w-7 h-7 text-brand-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-500">Loading your report archive...</p>
          </div>
        ) : reportsList.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl space-y-3">
            <FileText className="w-10 h-10 text-gray-300 dark:text-dark-600 mx-auto" />
            <h4 className="font-extrabold text-sm text-gray-700 dark:text-dark-200">No Generated Reports Found</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              You haven't generated any reports matching the current filter. Click one of the generator buttons above to create your first statement.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* DESKTOP TABLE (Hidden on Mobile) */}
            <div className="hidden lg:block bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9F5] dark:bg-dark-850 text-gray-500 dark:text-dark-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-gray-150 dark:border-dark-800">
                  <tr>
                    <th className="py-3.5 px-5">Report ID</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Subject / Diagnosis</th>
                    <th className="py-3.5 px-4">Language</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-800 text-gray-700 dark:text-dark-200">
                  {reportsList.map((r) => {
                    const dateFormatted = new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr key={r._id} className="hover:bg-gray-50/70 dark:hover:bg-dark-850/50 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-gray-900 dark:text-dark-100">
                          {r.reportId || r._id.substring(0, 8)}
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
                        <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-dark-100">
                          {r.diseaseName || r.cropName || r.summary || 'Advisory Statement'}
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
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePreviewById(r.reportId || r._id)}
                              className="p-1.5 rounded-lg text-gray-600 dark:text-dark-300 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-dark-800 transition-colors"
                              title="Preview PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadById(r.reportId || r._id)}
                              className="p-1.5 rounded-lg text-brand-700 dark:text-emerald-400 hover:bg-brand-50 dark:hover:bg-dark-800 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReport(r)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-dark-800 transition-colors"
                              title="Delete Record"
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

            {/* MOBILE RESPONSIVE CARDS (Shown on screens < lg) */}
            <div className="lg:hidden space-y-3">
              {reportsList.map((r) => {
                const dateFormatted = new Date(r.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div
                    key={r._id}
                    className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-2xl p-4 shadow-sm space-y-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-gray-900 dark:text-dark-100">
                        {r.reportId || r._id.substring(0, 8)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        r.type === 'disease' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                        r.type === 'crop' ? 'bg-emerald-50 text-brand-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                        'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                      }`}>
                        {r.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-gray-850 dark:text-dark-50">
                        {r.diseaseName || r.cropName || r.summary || 'Advisory Statement'}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-dark-400 mt-1">
                        <span>{dateFormatted}</span>
                        <span>•</span>
                        <span className="uppercase font-mono font-bold">{r.language || 'EN'}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">Ready</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-dark-800 pt-2.5 flex items-center justify-between">
                      <button
                        onClick={() => handlePreviewById(r.reportId || r._id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-dark-200 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadById(r.reportId || r._id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 flex items-center gap-1.5 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => handleDeleteReport(r)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                          aria-label="Delete report"
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
                  Page {currentPage} of {totalPages} ({totalCount} reports)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => fetchMyReports(currentPage - 1)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-dark-750 text-gray-600 dark:text-dark-300 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => fetchMyReports(currentPage + 1)}
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

      {/* REPORT PREVIEW MODAL */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewBlobUrl(null);
        }}
        report={previewReport}
        pdfBlobUrl={previewBlobUrl}
        onDownload={() => {
          if (previewReport?.reportId || previewReport?.id) {
            handleDownloadById(previewReport.reportId || previewReport.id);
          }
        }}
      />

    </div>
  );
};
