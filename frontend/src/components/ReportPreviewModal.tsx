import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  User, 
  Sprout, 
  ScanEye, 
  CloudSun, 
  Coins, 
  Loader2,
  ArrowRight,
  ShieldCheck,
  Eye,
  Share2
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { ModalPortal } from './common/ModalPortal';
import { Share } from '@capacitor/share';

export interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    id?: string;
    reportId?: string;
    type?: string;
    cropName?: string;
    diseaseName?: string;
    language?: string;
    summary?: string;
    farmerName?: string;
    createdAt?: string | Date;
    previewUrl?: string;
    downloadUrl?: string;
    metadata?: any;
  } | null;
  pdfBlobUrl?: string | null;
  onDownload?: () => void;
  showViewMyReports?: boolean;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  report,
  pdfBlobUrl,
  onDownload,
  showViewMyReports = false
}) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { t } = useTranslation();
  
  const isMobileDevice = typeof window !== 'undefined' && (window.innerWidth < 768 || Capacitor.isNativePlatform());
  const [viewMode, setViewMode] = useState<'document' | 'pdf'>(isMobileDevice ? 'document' : 'pdf');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeTimedOut, setIframeTimedOut] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIframeLoaded(false);
    setIframeTimedOut(false);
    
    // Auto-timeout for iframe PDF loader on mobile/incompatible browsers
    const timer = setTimeout(() => {
      setIframeTimedOut(true);
    }, 2800);

    return () => clearTimeout(timer);
  }, [isOpen, pdfBlobUrl]);

  if (!isOpen || !report) return null;

  const displayId = report.reportId || report.id || 'REP-PREVIEW';
  const displayType = (report.type || 'Advisory').toUpperCase();
  const displayDate = report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN');

  // Ensure authorized URL if token exists
  let streamSrc = pdfBlobUrl || report.previewUrl || `/api/reports/${displayId}/preview`;
  if (!pdfBlobUrl && streamSrc.startsWith('/api') && token) {
    const separator = streamSrc.includes('?') ? '&' : '?';
    streamSrc = `${streamSrc}${separator}token=${encodeURIComponent(token)}`;
  }

  const handlePrint = () => {
    if (viewMode === 'pdf') {
      const iframe = document.getElementById('report-pdf-frame') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          return;
        } catch (e) {
          // fall through
        }
      }
    }
    window.print();
  };

  const handleNativeShare = async () => {
    const shareText = `THE KHEDUT Agricultural Statement (${displayId})\nType: ${displayType}\nCrop: ${report.cropName || 'Crop'}\nIssue: ${report.diseaseName || 'General Advisory'}\nVerified on The Khedut Cloud Protocol.`;
    if (Capacitor.isNativePlatform()) {
      try {
        const canShare = await Share.canShare();
        if (canShare.value) {
          await Share.share({
            title: `The Khedut Report ${displayId}`,
            text: shareText,
            dialogTitle: 'Share Agricultural Report'
          });
          return;
        }
      } catch (e) {
        console.warn('Native share failed:', e);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `The Khedut Report ${displayId}`,
          text: shareText
        });
        return;
      } catch (e) {
        // user canceled or unsupported
      }
    }

    if (onDownload) {
      onDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal
      isOpen={isOpen}
      onClose={onClose}
      zIndex={100}
      backdropClassName="bg-black/75 backdrop-blur-sm"
      containerClassName="flex items-center justify-center p-2 sm:p-4 md:p-6"
    >
      <div 
        className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* MODAL HEADER */}
        <div className="p-3.5 sm:p-5 border-b border-gray-150 dark:border-dark-800 flex items-center justify-between bg-[#F7F9F5] dark:bg-dark-850">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <BrandLogo variant="symbol" size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-lg text-gray-900 dark:text-dark-50 tracking-tight leading-tight truncate">
                  {report.diseaseName || report.cropName || `${displayType} Report`}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-brand-200 dark:border-emerald-800/50 flex-shrink-0">
                  {displayType}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-dark-400 mt-0.5 flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="font-mono font-semibold text-gray-700 dark:text-dark-300">{displayId}</span>
                <span>•</span>
                <span>{displayDate}</span>
                {report.farmerName && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-gray-700 dark:text-dark-300 truncate">{report.farmerName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* View Mode Toggle */}
            <div className="hidden sm:inline-flex bg-gray-150 dark:bg-dark-800 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('document')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  viewMode === 'document' 
                    ? 'bg-white dark:bg-dark-700 text-brand-700 dark:text-emerald-300 shadow-xs' 
                    : 'text-gray-600 dark:text-dark-300 hover:text-gray-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Document</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  viewMode === 'pdf' 
                    ? 'bg-white dark:bg-dark-700 text-brand-700 dark:text-emerald-300 shadow-xs' 
                    : 'text-gray-600 dark:text-dark-300 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>PDF Frame</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-dark-200 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:bg-gray-50 transition-colors shadow-xs"
              title="Print Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {onDownload && (
              <button
                onClick={onDownload}
                className="btn-primary py-2 px-3 sm:px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm min-h-[38px]"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            <button
              onClick={handleNativeShare}
              className="p-2 rounded-xl text-gray-600 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors sm:hidden"
              title="Share Report"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              data-modal-close="true"
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors ml-0.5"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUMMARY SUB-BAR */}
        {report.summary && (
          <div className="px-4 sm:px-5 py-2 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-150/40 dark:border-emerald-900/30 text-xs text-brand-800 dark:text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span className="truncate">{report.summary}</span>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto bg-gray-100 dark:bg-dark-950 relative min-h-[400px] sm:min-h-[500px]">
          {viewMode === 'document' ? (
            /* INTERACTIVE STRUCTURED DOCUMENT VIEW (100% Reliable on mobile WebViews) */
            <div className="max-w-3xl mx-auto bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
              {/* Report Header Stamp */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-150 dark:border-dark-800 gap-4">
                <div className="flex items-center gap-3">
                  <BrandLogo variant="symbol" size="md" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-dark-50 tracking-tight">
                      THE KHEDUT OFFICIAL ADVISORY
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-dark-400">
                      Smart Agriculture & AI Agronomy Intelligence Network
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-3.5 py-2 rounded-xl">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Authenticity</span>
                  </div>
                  <div className="font-mono text-xs font-extrabold text-emerald-900 dark:text-emerald-200 mt-0.5">
                    {displayId}
                  </div>
                </div>
              </div>

              {/* Primary Diagnostic Findings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-850 border border-gray-150 dark:border-dark-800 space-y-1">
                  <div className="text-[11px] font-bold uppercase text-gray-400 dark:text-dark-400">Crop Monitored</div>
                  <div className="text-sm font-extrabold text-gray-800 dark:text-dark-100 flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span>{report.cropName || 'Field Crop'}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-850 border border-gray-150 dark:border-dark-800 space-y-1">
                  <div className="text-[11px] font-bold uppercase text-gray-400 dark:text-dark-400">Identified Condition / Issue</div>
                  <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <ScanEye className="w-4 h-4" />
                    <span>{report.diseaseName || displayType}</span>
                  </div>
                </div>
              </div>

              {/* Summary / Recommended Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-400">
                  Agronomic Assessment Summary
                </h4>
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-dark-850 border border-emerald-100 dark:border-dark-800 text-xs sm:text-sm text-gray-700 dark:text-dark-200 leading-relaxed">
                  {report.summary || 'Official agronomic diagnostic statement generated using The Khedut AI leaf pathology and soil chemistry models. Adhere to specified safety and dosage recommendations.'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {onDownload && (
                  <button
                    type="button"
                    onClick={onDownload}
                    className="w-full sm:w-1/2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official PDF</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewMode('pdf')}
                  className="w-full sm:w-1/2 py-3 px-4 border border-gray-250 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800 text-gray-700 dark:text-dark-200 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect In PDF Viewer</span>
                </button>
              </div>
            </div>
          ) : (
            /* EMBEDDED IFRAME PDF VIEWER */
            <div className="w-full h-full min-h-[420px] sm:min-h-[520px] relative">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 dark:bg-dark-900/80 z-10 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-brand-700 animate-spin" />
                  <p className="text-xs font-bold text-gray-600 dark:text-dark-300">Rendering Official Report Document...</p>
                  {iframeTimedOut && (
                    <button
                      type="button"
                      onClick={() => setViewMode('document')}
                      className="mt-2 px-3 py-1.5 text-xs font-bold text-brand-700 dark:text-emerald-300 bg-brand-50 dark:bg-emerald-950/40 border border-brand-200 dark:border-emerald-800/50 rounded-xl shadow-xs"
                    >
                      Switch to Document View
                    </button>
                  )}
                </div>
              )}

              <iframe
                id="report-pdf-frame"
                src={streamSrc}
                title={`The Khedut Report ${displayId}`}
                className="w-full h-full min-h-[420px] sm:min-h-[520px] rounded-2xl border border-gray-200 dark:border-dark-800 bg-white shadow-inner"
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 sm:p-4 bg-white dark:bg-dark-900 border-t border-gray-150 dark:border-dark-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-gray-500 dark:text-dark-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Generated securely under The Khedut Agricultural Data Privacy Protocol</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {showViewMyReports && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/reports');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-brand-700 dark:text-emerald-400 bg-brand-50 dark:bg-emerald-950/30 border border-brand-200 dark:border-emerald-900/40 hover:bg-brand-100 transition-colors flex items-center gap-1 min-h-[38px]"
              >
                <span>View My Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-dark-300 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors min-h-[38px]"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </ModalPortal>
  );
};
