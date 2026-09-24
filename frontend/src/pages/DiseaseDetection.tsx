import React, { useState, useEffect } from 'react';
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
  ScanEye,
  Calendar,
  MessageSquare,
  Clock,
  History,
  Activity,
  ChevronRight,
  Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Disease3DScannerWidget } from '../animations';

export const DiseaseDetection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');

  // Input states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [variety, setVariety] = useState<string>('');
  const [growthStage, setGrowthStage] = useState<string>('');
  const [farmerNotes, setFarmerNotes] = useState<string>('');

  // Farms list for dropdown
  const [farms, setFarms] = useState<any[]>([]);
  
  // Execution states
  const [loading, setLoading] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<string>('');
  
  // Audio & Utilities
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Follow-up modal
  const [showFollowUpModal, setShowFollowUpModal] = useState<boolean>(false);
  const [followUpDays, setFollowUpDays] = useState<number>(5);
  const [followUpNotesInput, setFollowUpNotesInput] = useState<string>('');
  const [schedulingFollowUp, setSchedulingFollowUp] = useState<boolean>(false);

  // History list
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Load user's farms if authenticated
  useEffect(() => {
    if (token) {
      api.get('/farms')
        .then(res => {
          if (res.data?.success && Array.isArray(res.data.farms)) {
            setFarms(res.data.farms);
            if (res.data.farms.length > 0) {
              setSelectedFarmId(res.data.farms[0]._id);
              if (res.data.farms[0].currentCrops && res.data.farms[0].currentCrops.length > 0) {
                setSelectedCrop(res.data.farms[0].currentCrops[0]);
              }
            }
          }
        })
        .catch(err => console.warn('Error fetching farms for disease scan:', err));
    }
  }, [token]);

  // Load scan history when tab switches to history
  useEffect(() => {
    if (activeTab === 'history' && token) {
      setLoadingHistory(true);
      api.get('/diseases/history')
        .then(res => {
          if (res.data?.success) {
            setHistoryList(res.data.history || []);
          }
        })
        .catch(err => console.warn('History fetch error:', err))
        .finally(() => setLoadingHistory(false));
    }
  }, [activeTab, token]);

  const validateFile = (file: File): boolean => {
    setValidationMessage('');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setValidationMessage('Please select a valid image file (JPG, PNG, WEBP, or HEIC).');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setValidationMessage('File size exceeds 10MB limit. Please upload a smaller leaf image.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateFile(file)) return;
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAssessment(null);
      setError('');
      setSpeaking(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a leaf photo to analyze.');
      return;
    }

    if (!validateFile(selectedFile)) return;

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);
    if (selectedFarmId) formData.append('farmId', selectedFarmId);
    if (selectedCrop) formData.append('crop', selectedCrop);
    if (variety) formData.append('variety', variety);
    if (growthStage) formData.append('growthStage', growthStage);
    if (farmerNotes) formData.append('farmerNotes', farmerNotes);

    try {
      const res = await api.post(`/diseases/analyze?lang=${i18n.language}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        setAssessment(res.data.assessment);
      } else {
        setError(res.data?.message || 'Failed to complete disease analysis.');
      }
    } catch (err: any) {
      console.error('Disease scan error:', err);
      setError(err.response?.data?.message || 'Failed to analyze crop image.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!assessment?.id) return;
    setSchedulingFollowUp(true);
    try {
      const res = await api.post(`/diseases/${assessment.id}/follow-up`, {
        days: followUpDays,
        notes: followUpNotesInput
      });
      if (res.data?.success) {
        setAssessment((prev: any) => ({
          ...prev,
          followUpStatus: 'scheduled',
          followUpDate: res.data.scan?.followUpDate
        }));
        setShowFollowUpModal(false);
        alert(`Follow-up successfully scheduled in ${followUpDays} days!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule follow-up.');
    } finally {
      setSchedulingFollowUp(false);
    }
  };

  const handleAskExpert = () => {
    if (!assessment) return;
    navigate('/experts', {
      state: {
        prefill: {
          crop: assessment.crop,
          diseaseName: assessment.diseaseName,
          severity: assessment.severity,
          symptoms: assessment.symptoms?.join(', '),
          imageUrl: assessment.imageUri,
          scanDate: assessment.analyzedAt
        }
      }
    });
  };

  const handleReadAloud = () => {
    if (!assessment) return;
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const txt = `${assessment.diseaseName}. Condition is ${assessment.condition}. Severity is ${assessment.severity}. Symptoms: ${assessment.symptoms?.join(', ')}. Environmental note: ${assessment.environmentalContext?.favorabilityNote || ''}`;
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
    if (!assessment) return;
    const txt = `KrishiMitra Disease Assessment:\nCondition: ${assessment.condition}\nDisease: ${assessment.diseaseName} (${assessment.scientificName})\nSeverity: ${assessment.severity}\nSymptoms: ${assessment.symptoms?.join(', ')}\nAction Plan: ${assessment.recommendedActions?.map((a: any) => a.title).join(' | ')}`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!assessment) return;
    const txt = `KrishiMitra Pathology Assessment:\nDisease: ${assessment.diseaseName}\nCondition: ${assessment.condition}\nSeverity: ${assessment.severity}`;
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
      alert('Copied assessment summary to clipboard!');
    }
  };

  const handleDownloadPdf = () => {
    if (!assessment) return;
    if (!token) {
      alert('Please create a free account to download PDF reports.');
      navigate('/register');
      return;
    }
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/reports/download?type=disease&diseaseName=${encodeURIComponent(assessment.diseaseName)}&lang=${i18n.language}&Authorization=Bearer ${token}`;
    window.open(url, '_blank');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAssessment(null);
    setError('');
    setValidationMessage('');
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const getConditionBadgeStyle = (condition: string) => {
    switch (condition) {
      case 'HEALTHY':
        return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200';
      case 'POSSIBLE_DISEASE':
        return 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200';
      case 'POSSIBLE_PEST_DAMAGE':
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200';
      case 'NUTRIENT_RELATED_SYMPTOMS':
      case 'ENVIRONMENTAL_STRESS':
        return 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200';
      default:
        return 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 border-gray-200';
    }
  };

  const getSeverityBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500 text-white font-bold';
      case 'moderate':
        return 'bg-amber-500 text-white font-bold';
      case 'low':
        return 'bg-emerald-500 text-white font-bold';
      default:
        return 'bg-gray-500 text-white font-bold';
    }
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:bg-white print:text-black text-left">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-6 rounded-3xl shadow-lg print:hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ScanEye size={24} className="text-emerald-300" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Advanced Disease Intelligence Engine</h1>
          </div>
          <p className="text-emerald-100 text-xs md:text-sm mt-1 font-medium max-w-2xl">
            Multimodal AI leaf analysis combined with farm context, weather risk signals, and structured agronomic action plans.
          </p>
        </div>

        {/* Navigation Tabs */}
        {token && (
          <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-2xl backdrop-blur-sm self-stretch md:self-auto justify-center">
            <button
              onClick={() => setActiveTab('scan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'scan' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              <ScanEye size={14} /> Scan & Diagnose
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              <History size={14} /> Scan History
            </button>
          </div>
        )}
      </div>

      {activeTab === 'scan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Scanner Controls (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm print:hidden space-y-4">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center justify-between">
              <span>Leaf Photo Uploader</span>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-md">
                Step 19 Intelligence
              </span>
            </h3>

            {/* Farm & Crop Context Selectors */}
            {user && (
              <div className="space-y-3 bg-gray-50/70 dark:bg-dark-950/40 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-800/40">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Farm & Crop Context (Optional)</span>
                
                {farms.length > 0 && (
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 dark:text-dark-300 block mb-1">Target Farm</label>
                    <select
                      value={selectedFarmId}
                      onChange={(e) => {
                        setSelectedFarmId(e.target.value);
                        const found = farms.find(f => f._id === e.target.value);
                        if (found && found.currentCrops?.length > 0) {
                          setSelectedCrop(found.currentCrops[0]);
                        }
                      }}
                      className="w-full text-xs font-medium bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl p-2 text-gray-800 dark:text-dark-100"
                    >
                      {farms.map((f: any) => (
                        <option key={f._id} value={f._id}>{f.name} ({f.village || f.district || 'Farm'})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 dark:text-dark-300 block mb-1">Crop Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Tomato, Wheat"
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="w-full text-xs font-medium bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl p-2 text-gray-800 dark:text-dark-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 dark:text-dark-300 block mb-1">Growth Stage</label>
                    <input
                      type="text"
                      placeholder="e.g. Flowering, Seedling"
                      value={growthStage}
                      onChange={(e) => setGrowthStage(e.target.value)}
                      className="w-full text-xs font-medium bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl p-2 text-gray-800 dark:text-dark-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-dark-300 block mb-1">Farmer Notes / Observations</label>
                  <input
                    type="text"
                    placeholder="e.g. Yellow spots appeared 2 days ago after rain"
                    value={farmerNotes}
                    onChange={(e) => setFarmerNotes(e.target.value)}
                    className="w-full text-xs font-medium bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl p-2 text-gray-800 dark:text-dark-100"
                  />
                </div>
              </div>
            )}

            {validationMessage && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>{validationMessage}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs md:text-sm text-red-600 dark:text-red-400">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!previewUrl ? (
              <label className="border-2 border-dashed border-gray-200 dark:border-dark-850 hover:border-brand-500 rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-200 group h-56 bg-gray-50/50 dark:bg-dark-950/25">
                <Upload className="w-10 h-10 text-gray-400 group-hover:text-brand-500 transition-colors duration-150 mb-3" />
                <span className="font-bold text-sm text-gray-700 dark:text-dark-200">Upload leaf photo</span>
                <span className="text-[10px] text-gray-400 dark:text-dark-500 mt-1 font-semibold uppercase">Supports JPG, PNG, WEBP up to 10MB</span>
                <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-dark-800/50 aspect-video bg-gray-50 dark:bg-dark-950">
                  <img src={previewUrl} alt="Leaf preview" className="w-full h-full object-cover" />
                  {!assessment && !loading && (
                    <button 
                      onClick={handleReset}
                      className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg hover:bg-black/80 transition-colors min-h-[30px]"
                    >
                      Change Image
                    </button>
                  )}
                </div>

                {!assessment && (
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="btn-primary w-full py-3.5 min-h-[44px]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        <span>Analyzing leaf & farm context...</span>
                      </>
                    ) : (
                      <span>Run Advanced Pathology Scan</span>
                    )}
                  </button>
                )}

                {assessment && (
                  <button
                    onClick={handleReset}
                    className="btn-secondary w-full py-3 min-h-[44px]"
                  >
                    Scan Another Leaf Photo
                  </button>
                )}
              </div>
            )}

            {/* Interactive 3D Leaf Scanner & Symptom Visualizer */}
            <Disease3DScannerWidget assessment={assessment} isScanning={loading} className="mt-4" />
          </div>

          {/* Assessment Results Display (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-brand-600 gap-3">
                <div className="w-10 h-10 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
                <p className="text-xs text-gray-400 font-semibold uppercase animate-pulse">Evaluating visual symptoms & environmental risk signals...</p>
              </div>
            ) : assessment ? (
              <div className="space-y-6 text-left">
                {/* Actions Toolbar */}
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
                    onClick={() => window.print()}
                    className="p-2 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl text-gray-600 hover:text-brand-600 text-xs font-bold flex items-center gap-1.5 min-h-[38px]"
                  >
                    <Printer size={14} />
                    <span>{t('common.print')}</span>
                  </button>
                </div>

                {/* Condition Status & Disease Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-dark-800">
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase border ${getConditionBadgeStyle(assessment.condition)}`}>
                        {assessment.condition.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${getSeverityBadgeStyle(assessment.severity)}`}>
                        {assessment.severity} Severity
                      </span>
                      <span className="text-[10px] font-bold bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-dark-300 px-2 py-0.5 rounded-full uppercase">
                        {assessment.confidence} Confidence ({(assessment.confidenceScore * 100).toFixed(0)}%)
                      </span>
                    </div>
                    
                    <h3 className="font-extrabold text-xl md:text-2xl text-gray-800 dark:text-dark-100 pt-1 leading-tight">
                      {assessment.diseaseName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-dark-400 font-semibold italic">
                      Crop: <span className="text-brand-600 dark:text-brand-400 font-bold">{assessment.crop}</span> | Scientific: {assessment.scientificName} | Local: {assessment.localName}
                    </p>
                  </div>
                </div>

                {/* Progression Note */}
                {assessment.progressionNote && (
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 rounded-2xl text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <History size={16} className="shrink-0 mt-0.5" />
                    <span>{assessment.progressionNote}</span>
                  </div>
                )}

                {/* Environmental Context Box (Step 17 + Step 18 Integration) */}
                {assessment.environmentalContext && (
                  <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-2xl space-y-2">
                    <h4 className="font-bold text-xs md:text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <Activity size={16} /> Environmental & Hydro-Risk Context
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed">
                      {assessment.environmentalContext.favorabilityNote}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-gray-500 dark:text-dark-400 font-medium">
                      {typeof assessment.environmentalContext.temperature === 'number' && (
                        <span>Temp: <strong>{assessment.environmentalContext.temperature}°C</strong></span>
                      )}
                      {typeof assessment.environmentalContext.humidity === 'number' && (
                        <span>Humidity: <strong>{assessment.environmentalContext.humidity}%</strong></span>
                      )}
                      {typeof assessment.environmentalContext.rainProb === 'number' && (
                        <span>Rain Chance: <strong>{assessment.environmentalContext.rainProb}%</strong></span>
                      )}
                      {typeof assessment.environmentalContext.soilMoisture === 'number' && (
                        <span>Soil Moisture: <strong>{assessment.environmentalContext.soilMoisture}%</strong></span>
                      )}
                    </div>
                  </div>
                )}

                {/* Observed Symptoms & Evidence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-200 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="text-amber-500" size={16} /> Observed Symptoms
                    </h4>
                    <ul className="space-y-1 bg-gray-50/50 dark:bg-dark-850/30 p-3 rounded-2xl border border-gray-150 dark:border-dark-800/20">
                      {assessment.symptoms?.map((sym: string, sIdx: number) => (
                        <li key={sIdx} className="text-xs text-gray-600 dark:text-dark-350 flex items-start gap-1">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-200 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="text-red-500" size={16} /> Pathogen / Stress Causes
                    </h4>
                    <ul className="space-y-1 bg-gray-50/50 dark:bg-dark-850/30 p-3 rounded-2xl border border-gray-150 dark:border-dark-800/20">
                      {assessment.possibleCauses?.map((cause: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-dark-350 flex items-start gap-1">
                          <span className="text-red-500 font-bold">•</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Structured Action Plan */}
                {assessment.recommendedActions && assessment.recommendedActions.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="font-extrabold text-xs md:text-sm text-gray-800 dark:text-dark-200 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-brand-600" /> Agronomic Action Plan
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {assessment.recommendedActions.map((act: any, aIdx: number) => (
                        <div key={aIdx} className="p-3 bg-gray-50 dark:bg-dark-850 rounded-2xl border border-gray-100 dark:border-dark-800/50 flex items-start gap-3">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase shrink-0 ${
                            act.actionType === 'IMMEDIATE_CHECK' ? 'bg-red-100 text-red-700' :
                            act.actionType === 'MONITOR' ? 'bg-amber-100 text-amber-700' :
                            act.actionType === 'PREVENTION' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {act.actionType.replace('_', ' ')}
                          </span>
                          <div>
                            <h5 className="font-bold text-xs text-gray-800 dark:text-dark-100">{act.title}</h5>
                            <p className="text-[11px] text-gray-500 dark:text-dark-400 mt-0.5">{act.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safe Pesticide Medicine Details */}
                {assessment.pesticideDetails && (
                  <div className="bg-brand-50/20 dark:bg-brand-950/5 border border-brand-100/50 dark:border-brand-900/10 p-4 rounded-3xl space-y-3">
                    <h4 className="font-extrabold text-sm text-brand-800 dark:text-brand-400 flex items-center gap-1.5 border-b border-brand-100 dark:border-brand-900/25 pb-2">
                      <Sparkles size={16} /> Agronomic Treatment Guidelines
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
                      <div>
                        <span className="font-bold text-gray-400 block text-[10px] uppercase">Active Ingredient</span>
                        <span className="font-bold text-gray-800 dark:text-dark-200">{assessment.pesticideDetails.localName} ({assessment.pesticideDetails.englishName})</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-400 block text-[10px] uppercase">Example Formulations</span>
                        <span className="font-medium text-gray-800 dark:text-dark-300">{assessment.pesticideDetails.brands?.join(', ')}</span>
                      </div>
                    </div>

                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-100 dark:border-red-900/20 flex items-start gap-2">
                      <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                      <span>{assessment.chemicalSafetyNotice}</span>
                    </div>
                  </div>
                )}

                {/* Organic vs Chemical Treatments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/50 dark:border-emerald-900/10 p-4 rounded-2xl">
                    <h4 className="font-bold text-xs md:text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2.5">
                      <CheckCircle2 size={16} /> Organic & Cultural Solutions
                    </h4>
                    <ul className="space-y-1.5">
                      {assessment.organicTreatment?.map((item: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-dark-300 flex items-start gap-1">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50/20 dark:bg-red-950/5 border border-red-100/50 dark:border-red-900/10 p-4 rounded-2xl">
                    <h4 className="font-bold text-xs md:text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-2.5">
                      <ShieldAlert size={16} /> Chemical Protection Options
                    </h4>
                    <ul className="space-y-1.5">
                      {assessment.chemicalTreatment?.map((item: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-dark-300 flex items-start gap-1">
                          <span className="text-red-500 font-bold shrink-0">⚠</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Limitations */}
                <p className="text-[11px] text-gray-400 dark:text-dark-500 italic bg-gray-50 dark:bg-dark-950/30 p-3 rounded-xl border border-gray-100 dark:border-dark-850">
                  Note: {assessment.limitations}
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 dark:border-dark-850 pt-4 print:hidden">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleAskExpert}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm min-h-[40px] transition-colors"
                    >
                      <MessageSquare size={14} /> Ask an Expert Specialist
                    </button>
                    {user && (
                      <button
                        onClick={() => setShowFollowUpModal(true)}
                        className="px-4 py-2.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-brand-200/50 min-h-[40px] transition-colors"
                      >
                        <Calendar size={14} /> 
                        {assessment.followUpStatus === 'scheduled' ? 'Follow-up Scheduled' : 'Schedule Re-check'}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleDownloadPdf}
                    className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm min-h-[40px] transition-colors"
                  >
                    <Download size={14} /> Download Report PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FileText size={48} className="text-gray-300 dark:text-dark-800 mb-3" />
                <p className="font-bold text-sm text-gray-700 dark:text-dark-300">No active disease scan loaded</p>
                <p className="text-[11px] text-gray-400 mt-0.5 max-w-sm text-center">
                  Upload a leaf photo on the left panel to execute an advanced pathology diagnosis.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History Timeline Tab */
        <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center justify-between">
            <span>Scan History & Re-check Timeline</span>
            <span className="text-xs font-semibold text-gray-400">{historyList.length} Scans Logged</span>
          </h3>

          {loadingHistory ? (
            <div className="py-12 text-center text-gray-400">
              <div className="w-8 h-8 border-3 border-t-transparent border-brand-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs font-semibold">Loading scan history log...</p>
            </div>
          ) : historyList.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <History size={40} className="mx-auto text-gray-300 dark:text-dark-800" />
              <p className="font-bold text-sm">No historical leaf scans found</p>
              <p className="text-xs text-gray-400">Run a scan on your crop to build a health timeline.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((item: any) => (
                <div 
                  key={item._id}
                  className="p-4 bg-gray-50/70 dark:bg-dark-950/40 rounded-2xl border border-gray-100 dark:border-dark-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    {item.imageUri ? (
                      <img src={item.imageUri} alt="Scan" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-dark-800" />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 dark:bg-dark-800 rounded-xl flex items-center justify-center shrink-0 text-gray-400">
                        <ScanEye size={20} />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${getConditionBadgeStyle(item.condition || 'POSSIBLE_DISEASE')}`}>
                          {item.condition ? item.condition.replace(/_/g, ' ') : 'DISEASE'}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${getSeverityBadgeStyle(item.severity || 'moderate')}`}>
                          {item.severity || 'moderate'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-dark-100 mt-1">{item.diseaseName}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-dark-400">
                        Crop: <strong>{item.crop || 'Crop'}</strong> • Scanned on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    {item.followUpDate && (
                      <span className="text-[10px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-lg border border-brand-100 dark:border-brand-900/20 flex items-center gap-1">
                        <Clock size={12} /> Follow-up: {new Date(item.followUpDate).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setAssessment(item);
                        setActiveTab('scan');
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl text-xs font-bold text-gray-700 dark:text-dark-200 hover:text-brand-600 flex items-center gap-1"
                    >
                      <span>View Report</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-gray-100 dark:border-dark-800 shadow-xl text-left">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <Calendar size={18} className="text-brand-600" /> Schedule Pathology Re-check
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Set a follow-up reminder to evaluate symptom progression on <strong>{assessment?.crop}</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-dark-200 block mb-1">Re-check Schedule</label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 5, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFollowUpDays(d)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        followUpDays === d 
                          ? 'bg-brand-500 text-white border-brand-500' 
                          : 'bg-gray-50 dark:bg-dark-850 text-gray-700 dark:text-dark-300 border-gray-200 dark:border-dark-800'
                      }`}
                    >
                      In {d} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-dark-200 block mb-1">Follow-up Reminder Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Check if leaf spots have spread or faded"
                  value={followUpNotesInput}
                  onChange={(e) => setFollowUpNotesInput(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-dark-850 border border-gray-200 dark:border-dark-800 rounded-xl p-2.5 text-gray-800 dark:text-dark-100"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="btn-secondary py-2 px-4 text-xs min-h-[38px]"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleFollowUp}
                disabled={schedulingFollowUp}
                className="btn-primary py-2 px-4 text-xs min-h-[38px]"
              >
                {schedulingFollowUp ? 'Scheduling...' : 'Set Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
