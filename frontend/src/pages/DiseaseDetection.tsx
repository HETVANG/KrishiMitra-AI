import React, { useState } from 'react';
import { api, getApiBaseUrl } from '../services/api';
import { 
  Upload, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  VolumeX,
  Copy, 
  Share2, 
  Printer, 
  Check, 
  FileText,
  ScanEye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const DiseaseDetection: React.FC = () => {
  const { t, i18n } = useTranslation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-translate / re-diagnose when user switches active language
  React.useEffect(() => {
    const reDiagnose = async () => {
      if (selectedFile && result && !loading) {
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('image', selectedFile);
        try {
          const res = await api.post(`/diseases/diagnose?lang=${i18n.language}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (res.data && res.data.success) {
            setResult(res.data.diagnosis);
          }
        } catch (err: any) {
          console.error('Auto-retranslation disease scan error:', err);
          setError('Failed to update disease report language.');
        } finally {
          setLoading(false);
        }
      }
    };
    reDiagnose();
  }, [i18n.language]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
      setSpeaking(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image file to analyze.');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Pass active language to backend scanner
      const res = await api.post(`/diseases/diagnose?lang=${i18n.language}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data && res.data.success) {
        setResult(res.data.diagnosis);
      }
    } catch (err: any) {
      console.error('Diagnosis request error:', err);
      setError(err.response?.data?.message || 'Failed to analyze crop image.');
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (!result) return;
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const txt = `${result.name}. Scientific name is ${result.scientificName}. Local name is ${result.localName}. Symptoms: ${result.symptoms?.join(', ')}. Treatment recommended: ${result.pesticideDetails?.localName || ''}.`;
      const utterance = new SpeechSynthesisUtterance(txt);
      
      const localeMap: Record<string, string> = {
        en: 'en-US', hi: 'hi-IN', gu: 'gu-IN', mr: 'mr-IN', pa: 'pa-IN',
        bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN'
      };
      utterance.lang = localeMap[i18n.language] || 'en-US';

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      const voices = window.speechSynthesis.getVoices();
      const matched = voices.find(v => v.lang.startsWith(i18n.language));
      if (matched) utterance.voice = matched;

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyText = () => {
    if (!result) return;
    const txt = `Disease: ${result.name} (${result.scientificName})\nSymptoms: ${result.symptoms?.join(', ')}\nTreatment: ${result.pesticideDetails?.localName || ''} (${result.pesticideDetails?.englishName || ''})\nDosage: ${result.pesticideDetails?.dosage || ''}`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!result) return;
    const txt = `KrishiMitra Crop Diagnosis:\nDisease: ${result.name}\nScientific: ${result.scientificName}\nLocal Name: ${result.localName}\nRecommended Treatment: ${result.pesticideDetails?.localName || ''}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KrishiMitra Crop Pathology Report',
          text: txt,
        });
      } catch (err) {
        console.warn('Share cancelled:', err);
      }
    } else {
      handleCopyText();
      alert('Copied summary to clipboard for sharing!');
    }
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const token = localStorage.getItem('token');
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/reports/download?type=disease&diseaseName=${encodeURIComponent(result.name)}&lang=${i18n.language}&Authorization=Bearer ${token}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError('');
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:bg-white print:text-black">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-6 rounded-3xl shadow-lg print:hidden">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">AI Crop Pathology Scanner</h1>
        <p className="text-emerald-100 text-xs md:text-sm mt-1 font-medium">Upload photos of crop leaves to analyze symptoms, identify diseases, and plan treatments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scanner Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm print:hidden">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 pb-2 border-b border-gray-50 dark:border-dark-850">
            Leaf Photo Uploader
          </h3>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs md:text-sm text-red-600 dark:text-red-400">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!previewUrl ? (
            <label className="border-2 border-dashed border-gray-200 dark:border-dark-850 hover:border-brand-500 rounded-3xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all duration-200 group h-64 bg-gray-50/50 dark:bg-dark-950/25">
              <Upload className="w-12 h-12 text-gray-400 group-hover:text-brand-500 transition-colors duration-150 mb-4" />
              <span className="font-bold text-sm text-gray-700 dark:text-dark-200">Drag leaf photo here</span>
              <span className="text-[10px] text-gray-400 dark:text-dark-500 mt-1 font-semibold uppercase">Supports JPEG, PNG up to 5MB</span>
              <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-dark-800/50 aspect-video bg-gray-50 dark:bg-dark-950">
                <img src={previewUrl} alt="Leaf preview" className="w-full h-full object-cover" />
                {!result && !loading && (
                  <button 
                    onClick={handleReset}
                    className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg hover:bg-black/80 transition-colors min-h-[30px]"
                  >
                    Change Image
                  </button>
                )}
              </div>

              {!result && (
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="btn-primary w-full py-3.5 min-h-[44px]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Diagnosing crop leaf...</span>
                    </>
                  ) : (
                    <span>Analyze Crop leaf</span>
                  )}
                </button>
              )}

              {result && (
                <button
                  onClick={handleReset}
                  className="btn-secondary w-full py-3 min-h-[44px]"
                >
                  Scan another leaf photo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Diagnosis Results Display (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand-600 gap-3">
              <div className="w-10 h-10 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400 font-semibold uppercase animate-pulse">Gemini Computer Vision analyzing plant cells...</p>
            </div>
          ) : result ? (
            <div className="space-y-6 text-left">
              {/* Actions panel floating top */}
              <div className="flex flex-wrap gap-2 justify-end border-b border-gray-50 dark:border-dark-850 pb-3.5 print:hidden">
                <button
                  onClick={handleReadAloud}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 min-h-[38px] ${
                    speaking 
                      ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20' 
                      : 'bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-800 text-gray-600 hover:text-brand-600'
                  }`}
                >
                  {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{speaking ? t('common.stop') : t('common.read_aloud')}</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="p-2 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl text-gray-600 hover:text-brand-600 text-xs font-bold flex items-center gap-1.5 min-h-[38px]"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copied ? t('common.copied') : t('common.copy')}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl text-gray-600 hover:text-brand-600 text-xs font-bold flex items-center gap-1.5 min-h-[38px]"
                >
                  <Share2 size={14} />
                  <span>{t('common.share')}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl text-gray-600 hover:text-brand-600 text-xs font-bold flex items-center gap-1.5 min-h-[38px]"
                >
                  <Printer size={14} />
                  <span>{t('common.print')}</span>
                </button>
              </div>

              {/* Disease header and confidence score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-dark-800">
                <div>
                  <span className="text-[10px] font-bold bg-red-100 dark:bg-red-950/20 text-red-655 dark:text-red-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Diagnosis Result
                  </span>
                  <h3 className="font-extrabold text-lg md:text-2xl text-gray-800 dark:text-dark-100 mt-1 leading-tight">
                    {result.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-dark-500 font-semibold italic mt-0.5">
                    Scientific: {result.scientificName} | Local: {result.localName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Confidence Score</span>
                  <span className="block font-extrabold text-lg md:text-xl text-emerald-600 mt-0.5">
                    {(result.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Leaf Images comparison support */}
              {result.images && (
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-200 mb-2.5 flex items-center gap-1.5">
                    <ScanEye size={16} className="text-brand-650" /> Reference Image Comparison
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-xl overflow-hidden border border-gray-150 dark:border-dark-800 relative bg-gray-50 dark:bg-dark-955 aspect-[4/3]">
                      <img src={result.images.healthy} alt="Healthy Leaf" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-brand-600/80 backdrop-blur-sm text-white text-[8px] font-bold rounded">Healthy Leaf</span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-150 dark:border-dark-800 relative bg-gray-50 dark:bg-dark-955 aspect-[4/3]">
                      <img src={result.images.diseased} alt="Diseased Leaf" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-red-600/80 backdrop-blur-sm text-white text-[8px] font-bold rounded">Diseased Leaf</span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-150 dark:border-dark-800 relative bg-gray-50 dark:bg-dark-955 aspect-[4/3]">
                      <img src={result.images.comparison} alt="Comparison Leaf" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-gray-850/80 backdrop-blur-sm text-white text-[8px] font-bold rounded">Pathogen Detail</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Symptoms & Causes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-gray-850 dark:text-dark-200 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="text-amber-500" size={16} /> Observed Symptoms
                  </h4>
                  <ul className="space-y-1 bg-gray-50/50 dark:bg-dark-850/30 p-3 rounded-2xl border border-gray-150 dark:border-dark-800/20">
                    {result.symptoms?.map((sym: string, sIdx: number) => (
                      <li key={sIdx} className="text-xs text-gray-600 dark:text-dark-350 flex items-start gap-1">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-xs md:text-sm text-gray-850 dark:text-dark-200 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="text-red-500" size={16} /> Fungal/Pathogen Causes
                  </h4>
                  <ul className="space-y-1 bg-gray-50/50 dark:bg-dark-850/30 p-3 rounded-2xl border border-gray-150 dark:border-dark-800/20">
                    {result.causes?.map((cause: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-dark-350 flex items-start gap-1">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pesticide rich info */}
              {result.pesticideDetails && (
                <div className="bg-brand-50/20 dark:bg-brand-950/5 border border-brand-100/50 dark:border-brand-900/10 p-4 rounded-3xl space-y-3">
                  <h4 className="font-extrabold text-sm text-brand-800 dark:text-brand-400 flex items-center gap-1.5 border-b border-brand-100 dark:border-brand-900/25 pb-2">
                    <Sparkles size={16} /> Recommended Pesticide Medicine Details
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
                    <div>
                      <span className="font-bold text-gray-400 block text-[10px] uppercase">Local Name / Medicine</span>
                      <span className="font-bold text-gray-800 dark:text-dark-200">{result.pesticideDetails.localName} ({result.pesticideDetails.englishName})</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400 block text-[10px] uppercase">Indian Brand Examples</span>
                      <span className="font-medium text-gray-850 dark:text-dark-300">{result.pesticideDetails.brands?.join(', ')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-sm pt-2">
                    <div>
                      <span className="font-bold text-gray-400 block text-[10px] uppercase">Dosage Quantity</span>
                      <span className="font-semibold text-gray-850 dark:text-dark-300">{result.pesticideDetails.dosage}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-bold text-gray-400 block text-[10px] uppercase">Mixing & Spray Method</span>
                      <p className="text-gray-655 dark:text-dark-350 mt-0.5 leading-relaxed">{result.pesticideDetails.mixingMethod}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm pt-2 border-t border-brand-100/30 dark:border-brand-900/10">
                    <div>
                      <span className="font-bold text-red-500 block text-[10px] uppercase">Safety Precautions</span>
                      <p className="text-gray-655 dark:text-dark-350 mt-0.5 leading-relaxed">{result.pesticideDetails.precautions}</p>
                    </div>
                    <div>
                      <span className="font-bold text-amber-500 block text-[10px] uppercase">Waiting Period Before Harvest (PHI)</span>
                      <span className="font-semibold text-gray-850 dark:text-dark-300 block mt-0.5 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-md border border-amber-100/50 dark:border-amber-900/10 w-fit">{result.pesticideDetails.waitingPeriod}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Treatments organic vs chemical */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/50 dark:border-emerald-900/10 p-4 rounded-2xl">
                  <h4 className="font-bold text-xs md:text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 size={16} /> Organic Treatment Solutions
                  </h4>
                  <ul className="space-y-1.5">
                    {result.organicTreatment?.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-dark-300 flex items-start gap-1">
                        <span className="text-emerald-500 font-bold shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50/20 dark:bg-red-950/5 border border-red-100/50 dark:border-red-900/10 p-4 rounded-2xl">
                  <h4 className="font-bold text-xs md:text-sm text-red-655 dark:text-red-400 flex items-center gap-1.5 mb-2.5">
                    <ShieldAlert size={16} /> Chemical Treatment Emergency
                  </h4>
                  <ul className="space-y-1.5">
                    {result.chemicalTreatment?.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-dark-300 flex items-start gap-1">
                        <span className="text-red-500 font-bold shrink-0">⚠</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Prevention Tips */}
              <div className="bg-brand-50/50 dark:bg-brand-950/15 p-4 rounded-2xl border border-brand-100/50 dark:border-brand-900/10">
                <h4 className="font-bold text-xs md:text-sm text-brand-800 dark:text-brand-400 flex items-center gap-1.5 mb-2">
                  <Sparkles size={15} /> Long-Term Prevention Tips
                </h4>
                <ul className="space-y-1">
                  {result.preventiveTips?.map((tip: string, idx: number) => (
                    <li key={idx} className="text-xs text-gray-600 dark:text-dark-300 flex items-start gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end border-t border-gray-50 dark:border-dark-850 pt-4 print:hidden">
                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm min-h-[40px] transition-colors"
                >
                  <Download size={14} /> Download Diagnosis PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText size={48} className="text-gray-300 dark:text-dark-800 mb-3" />
              <p className="font-bold text-sm">No analysis reports loaded</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Please upload a leaf picture on the left panel to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
