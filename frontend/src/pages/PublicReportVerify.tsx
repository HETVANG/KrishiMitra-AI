import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw,
  Lock,
  ArrowRight,
  Sprout
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

export const PublicReportVerify: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [verified, setVerified] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!reportId) {
      setLoading(false);
      setErrorMessage('Missing report identifier.');
      return;
    }

    setLoading(true);
    api.get(`/reports/verify/${reportId}`)
      .then(res => {
        if (res.data?.success && res.data.verified) {
          setVerified(true);
          setReportData(res.data.report);
        } else {
          setVerified(false);
          setErrorMessage(res.data?.message || 'Report authenticity could not be verified.');
        }
      })
      .catch(err => {
        setVerified(false);
        setErrorMessage(err.response?.data?.message || 'This document identifier is not present in The Khedut official registry.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reportId]);

  return (
    <div className="min-h-screen bg-[#F7F9F5] dark:bg-dark-950 flex flex-col justify-between p-4 sm:p-6 md:p-8 text-left">
      
      {/* HEADER BAR */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6 border-b border-gray-200 dark:border-dark-800">
        <BrandLogo variant="horizontal" size="md" />
        <Link
          to="/"
          className="text-xs font-bold text-brand-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>The Khedut Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* VERIFICATION CARD */}
      <main className="max-w-2xl w-full mx-auto my-8">
        {loading ? (
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl p-10 text-center shadow-xl space-y-4">
            <RefreshCw className="w-10 h-10 text-brand-700 animate-spin mx-auto" />
            <h2 className="text-base font-extrabold text-gray-900 dark:text-dark-50">
              Verifying Document Authenticity...
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Checking cryptographic report registry in The Khedut database.
            </p>
          </div>
        ) : verified && reportData ? (
          <div className="bg-white dark:bg-dark-900 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl shadow-xl overflow-hidden animate-scale-in">
            
            {/* SUCCESS BANNER */}
            <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 text-white p-6 sm:p-8 relative overflow-hidden">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white">
                  <ShieldCheck className="w-8 h-8 text-emerald-300" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400/30 text-emerald-100 border border-emerald-300/40">
                    Official Verification
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-white">
                    Authentic Agricultural Document
                  </h1>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Issued and digitally signed by The Khedut Autonomous Agricultural Intelligence Platform.
                  </p>
                </div>
              </div>
            </div>

            {/* DOCUMENT METADATA */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-brand-50 dark:bg-emerald-950/20 border border-brand-200/60 dark:border-emerald-900/40 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Unique Report ID</span>
                  <span className="font-mono text-sm font-extrabold text-brand-800 dark:text-emerald-300">
                    {reportData.reportId}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-dark-800 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tamper-Evident Record</span>
                </div>
              </div>

              {/* SPECIFICATION GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-150 dark:border-dark-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Document Category</span>
                  <span className="font-extrabold text-sm text-gray-900 dark:text-dark-50 block">
                    {reportData.categoryTitle}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-150 dark:border-dark-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Subject / Diagnosed Crop</span>
                  <span className="font-extrabold text-sm text-gray-900 dark:text-dark-50 block">
                    {reportData.diseaseName || reportData.cropName || 'Field Crop'}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-150 dark:border-dark-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Generation Timestamp</span>
                  <span className="font-semibold text-gray-700 dark:text-dark-200 block">
                    {new Date(reportData.generatedAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-150 dark:border-dark-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Issuing Entity</span>
                  <span className="font-semibold text-gray-700 dark:text-dark-200 block">
                    {reportData.issuer}
                  </span>
                </div>
              </div>

              {/* DIAGNOSIS SUMMARY (IF PRESENT) */}
              {reportData.summary && (
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 rounded-2xl text-xs space-y-1">
                  <span className="text-[10px] font-bold text-brand-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Advisory Attestation Notes
                  </span>
                  <p className="text-gray-700 dark:text-dark-300 leading-relaxed font-medium">
                    {reportData.summary}
                  </p>
                </div>
              )}

              {/* PRIVACY SHIELD CALLOUT */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-150 dark:border-dark-800 text-[11px] text-gray-500 dark:text-dark-400">
                <Lock className="w-4 h-4 text-brand-700 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-gray-700 dark:text-dark-200">Farmer Privacy Guarantee:</strong> In accordance with The Khedut Agricultural Data Protection Guidelines, direct farmer phone numbers and financial account balances are sealed from public verification viewers.
                </p>
              </div>

            </div>

            {/* CARD FOOTER */}
            <div className="p-5 bg-gray-50 dark:bg-dark-850 border-t border-gray-150 dark:border-dark-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 font-medium">
                The Khedut • Smart Agriculture. Better Decisions.
              </span>
              <Link
                to="/register"
                className="btn-primary py-2 px-4 font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span>Get Free Farmer Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        ) : (
          <div className="bg-white dark:bg-dark-900 border border-red-200 dark:border-red-900/60 rounded-3xl p-8 sm:p-10 text-center shadow-xl space-y-5 animate-scale-in">
            <div className="p-3.5 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-2xl border border-red-200 dark:border-red-900/40 w-14 h-14 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-dark-50 tracking-tight">
                Unverified or Expired Document
              </h1>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                {errorMessage || 'The document identifier could not be validated against The Khedut authentic digital ledger.'}
              </p>
            </div>

            <div className="p-4 bg-red-50/70 dark:bg-red-950/20 border border-red-150 rounded-2xl text-[11px] text-red-700 dark:text-red-400 font-mono">
              Identifier: {reportId || 'N/A'}
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="btn-primary py-2.5 px-5 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Return to The Khedut</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="max-w-3xl w-full mx-auto text-center pt-6 border-t border-gray-200 dark:border-dark-800 text-[11px] text-gray-400 font-medium">
        © 2026 THE KHEDUT Agricultural Technologies. Official Agronomic Validation Registry.
      </footer>

    </div>
  );
};
