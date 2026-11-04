import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useNavigate } from 'react-router-dom';

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
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!isOpen || !report) return null;

  const displayId = report.reportId || report.id || 'REP-PREVIEW';
  const displayType = (report.type || 'Advisory').toUpperCase();
  const displayDate = report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN');

  const streamSrc = pdfBlobUrl || report.previewUrl || `/api/reports/${displayId}/preview`;

  const handlePrint = () => {
    const iframe = document.getElementById('report-pdf-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        window.open(streamSrc, '_blank');
      }
    } else {
      window.open(streamSrc, '_blank');
    }
  };

  const getReportIcon = (type?: string) => {
    switch (type) {
      case 'disease': return <ScanEye className="w-5 h-5 text-red-500" />;
      case 'crop': return <Sprout className="w-5 h-5 text-emerald-600" />;
      case 'weather': return <CloudSun className="w-5 h-5 text-blue-500" />;
      case 'expense': return <Coins className="w-5 h-5 text-amber-500" />;
      default: return <FileText className="w-5 h-5 text-brand-700" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in text-left"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-gray-150 dark:border-dark-800 flex items-center justify-between bg-[#F7F9F5] dark:bg-dark-850">
          <div className="flex items-center gap-3">
            <BrandLogo variant="symbol" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-dark-50 tracking-tight leading-tight">
                  {report.diseaseName || report.cropName || `${displayType} Report`}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-brand-200 dark:border-emerald-800/50">
                  {displayType}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5 flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-gray-700 dark:text-dark-300">{displayId}</span>
                <span>•</span>
                <span>{displayDate}</span>
                {report.farmerName && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-gray-700 dark:text-dark-300">{report.farmerName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-dark-200 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:bg-gray-50 transition-colors shadow-sm"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            {onDownload && (
              <button
                onClick={onDownload}
                className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
            )}

            <button
              onClick={onClose}
              data-modal-close="true"
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUMMARY SUB-BAR */}
        {report.summary && (
          <div className="px-5 py-2.5 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-150/40 dark:border-emerald-900/30 text-xs text-brand-800 dark:text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span className="truncate">{report.summary}</span>
          </div>
        )}

        {/* MODAL BODY: PDF VIEWER */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto bg-gray-100 dark:bg-dark-950 relative min-h-[420px] sm:min-h-[520px]">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 dark:bg-dark-900/70 z-10">
              <Loader2 className="w-8 h-8 text-brand-700 animate-spin" />
              <p className="text-xs font-bold text-gray-600 dark:text-dark-300">Rendering Official Report Document...</p>
            </div>
          )}

          <iframe
            id="report-pdf-frame"
            src={streamSrc}
            title={`The Khedut Report ${displayId}`}
            className="w-full h-full min-h-[440px] sm:min-h-[540px] rounded-2xl border border-gray-200 dark:border-dark-800 bg-white shadow-inner"
            onLoad={() => setIframeLoaded(true)}
          />
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 sm:p-4 bg-white dark:bg-dark-900 border-t border-gray-150 dark:border-dark-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-gray-500 dark:text-dark-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Generated securely under The Khedut Agricultural Data Privacy Protocol</span>
          </div>

          <div className="flex items-center gap-2.5">
            {showViewMyReports && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/reports');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-brand-700 dark:text-emerald-400 bg-brand-50 dark:bg-emerald-950/30 border border-brand-200 dark:border-emerald-900/40 hover:bg-brand-100 transition-colors flex items-center gap-1"
              >
                <span>View My Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-dark-300 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
