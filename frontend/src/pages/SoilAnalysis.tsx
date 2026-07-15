import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Sprout, 
  RefreshCw, 
  Volume2, 
  VolumeX,
  Copy, 
  Share2, 
  Printer, 
  Download, 
  Sparkles, 
  TrendingUp, 
  Check, 
  FileText,
  Calculator
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SoilAnalysis: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Soil parameters
  const [pH, setPh] = useState<string>('6.5');
  const [n, setN] = useState<string>('240');
  const [p, setP] = useState<string>('45');
  const [k, setK] = useState<string>('180');
  const [organicCarbon, setOc] = useState<string>('0.55');

  // Fertilizer calculator
  const [farmSize, setFarmSize] = useState<string>('2');
  const [cropType, setCropType] = useState<string>('wheat');
  const [calculatedBags, setCalculatedBags] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const [speaking, setSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchSoilAnalysis = async (lang: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/crops/soil-analysis?lang=${lang}`, {
        pH: Number(pH),
        N: Number(n),
        P: Number(p),
        K: Number(k),
        organicCarbon: Number(organicCarbon)
      });
      if (res.data && res.data.success) {
        setResult(res.data.analysis);
      }
    } catch (err: any) {
      console.error('Soil check error:', err);
      setError(err.response?.data?.message || 'Failed to compute soil chemistry recommendations.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-translate / re-evaluate when user switches active language
  React.useEffect(() => {
    if (result && !loading) {
      fetchSoilAnalysis(i18n.language);
    }
  }, [i18n.language]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchSoilAnalysis(i18n.language);
  };

  const handleCalculateFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    const size = Number(farmSize);
    
    // NPK standard calculation rules based on crop types
    let urea = 0;
    let dap = 0;
    let potash = 0;

    if (cropType === 'wheat') {
      urea = 2.2 * size; // bags
      dap = 1.0 * size;
      potash = 0.5 * size;
    } else if (cropType === 'rice') {
      urea = 2.5 * size;
      dap = 1.2 * size;
      potash = 0.8 * size;
    } else {
      urea = 1.5 * size;
      dap = 0.8 * size;
      potash = 1.0 * size;
    }

    setCalculatedBags({
      urea: Math.ceil(urea),
      dap: Math.ceil(dap),
      potash: Math.ceil(potash),
      farmSize: size,
      crop: cropType
    });
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
      const txt = `Soil analysis results. Crop suitability: ${result.suitability?.join(', ')}. Improvement guidelines: ${result.soilImprovementSuggestions?.join('. ')}`;
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
    const txt = `KrishiMitra Soil Report:\nCrops Suitability: ${result.suitability?.join(', ')}\nImprovement: ${result.soilImprovementSuggestions?.join('\n')}`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!result) return;
    const txt = `Soil Suitability: ${result.suitability?.join(', ')}\nFertilizer: ${result.fertilizerPlan?.join(', ')}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KrishiMitra Soil Analysis',
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
    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api/reports/download?type=crop&lang=${i18n.language}&Authorization=Bearer ${token}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:bg-white print:text-black">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-6 rounded-3xl shadow-lg print:hidden">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Soil Chemistry & Fertilizer Planner</h1>
        <p className="text-emerald-100 text-xs md:text-sm mt-1 font-medium">Input chemical concentrations to suggest suitable harvests and calculate specific fertilizer bags.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* NPK Parameters Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          {/* Soil Input Card */}
          <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm text-left">
            <h3 className="font-extrabold text-base text-gray-805 dark:text-dark-100 mb-4 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center gap-2">
              <Sprout className="text-brand-600" size={18} /> Soil Nutrients Check
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-955/20 border border-red-200/50 rounded-xl text-xs text-red-655">
                {error}
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">pH Level (Acidity)</label>
                <input 
                  type="number" step="0.1" value={pH} onChange={(e) => setPh(e.target.value)} 
                  className="custom-input w-full min-h-[44px]" required min="0" max="14"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nitrogen (N)</label>
                  <input 
                    type="number" value={n} onChange={(e) => setN(e.target.value)} 
                    className="custom-input w-full min-h-[44px]" required min="0"
                  />
                  <span className="text-[9px] text-gray-400 block mt-1">kg/ha</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phosphorus (P)</label>
                  <input 
                    type="number" value={p} onChange={(e) => setP(e.target.value)} 
                    className="custom-input w-full min-h-[44px]" required min="0"
                  />
                  <span className="text-[9px] text-gray-400 block mt-1">kg/ha</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Potassium (K)</label>
                  <input 
                    type="number" value={k} onChange={(e) => setK(e.target.value)} 
                    className="custom-input w-full min-h-[44px]" required min="0"
                  />
                  <span className="text-[9px] text-gray-400 block mt-1">kg/ha</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Organic Carbon (%)</label>
                <input 
                  type="number" step="0.01" value={organicCarbon} onChange={(e) => setOc(e.target.value)} 
                  className="custom-input w-full min-h-[44px]" required min="0" max="100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    <span>Analyzing Chemistry...</span>
                  </>
                ) : (
                  <span>Evaluate Soil Health</span>
                )}
              </button>
            </form>
          </div>

          {/* Fertilizer Calculator Card */}
          <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm text-left">
            <h3 className="font-extrabold text-base text-gray-805 dark:text-dark-100 mb-4 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center gap-2">
              <Calculator className="text-brand-600" size={18} /> Fertilizer Dose Calculator
            </h3>

            <form onSubmit={handleCalculateFertilizer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Select Crop</label>
                <select 
                  value={cropType} onChange={(e) => setCropType(e.target.value)} 
                  className="custom-input w-full min-h-[44px]"
                >
                  <option value="wheat">Wheat (गेहूं / ઘઉં)</option>
                  <option value="rice">Paddy (धान / ડાંગર)</option>
                  <option value="cotton">Cotton (कपास / કપાસ)</option>
                  <option value="mustard">Mustard (सरसों / રાઈ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Farm Land Size (Acres)</label>
                <input 
                  type="number" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} 
                  className="custom-input w-full min-h-[44px]" required min="1"
                />
              </div>

              <button type="submit" className="btn-secondary w-full py-3 min-h-[44px]">
                Calculate Bags Needed
              </button>
            </form>

            {calculatedBags && (
              <div className="mt-4 p-4 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100/40 rounded-2xl space-y-2">
                <span className="block text-[10px] text-brand-700 font-bold uppercase">Required Bags (50kg each)</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="bg-white dark:bg-dark-900 p-2.5 rounded-xl border">
                    <span className="block text-[9px] text-gray-400 uppercase">Urea</span>
                    <span className="block text-base font-extrabold text-brand-700 mt-1">{calculatedBags.urea}</span>
                  </div>
                  <div className="bg-white dark:bg-dark-900 p-2.5 rounded-xl border">
                    <span className="block text-[9px] text-gray-400 uppercase">DAP</span>
                    <span className="block text-base font-extrabold text-brand-700 mt-1">{calculatedBags.dap}</span>
                  </div>
                  <div className="bg-white dark:bg-dark-900 p-2.5 rounded-xl border">
                    <span className="block text-[9px] text-gray-400 uppercase">Potash</span>
                    <span className="block text-base font-extrabold text-brand-700 mt-1">{calculatedBags.potash}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm min-h-[300px] text-left">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand-600 gap-3">
              <div className="w-10 h-10 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400 font-semibold uppercase animate-pulse">AI evaluating soil biochemistry properties...</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Actions header */}
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

              {/* Crop Suitability */}
              <div>
                <h4 className="font-extrabold text-sm md:text-base text-gray-800 dark:text-dark-150 flex items-center gap-1.5 mb-3">
                  <TrendingUp className="text-brand-600" size={18} /> Recommended Suitable Crops
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {result.suitability?.map((crop: string, idx: number) => (
                    <div key={idx} className="bg-brand-50/30 dark:bg-brand-950/10 border border-brand-100/50 dark:border-brand-900/10 p-4 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-700 font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-205">{crop}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fertilizer application */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-sm md:text-base text-gray-850 dark:text-dark-150 flex items-center gap-1.5">
                  <Sparkles className="text-brand-600" size={16} /> Customized NPK Balancing plan
                </h4>
                <ul className="space-y-2 bg-gray-50/50 dark:bg-dark-850/30 p-4 rounded-2xl border border-gray-150 dark:border-dark-800/20">
                  {result.fertilizerPlan?.map((item: string, idx: number) => (
                    <li key={idx} className="text-xs md:text-sm text-gray-600 dark:text-dark-350 flex items-start gap-2 leading-relaxed">
                      <span className="text-brand-600 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Organic soil improvements */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-sm md:text-base text-gray-855 dark:text-dark-150 flex items-center gap-1.5">
                  <Sprout className="text-brand-600" size={16} /> Soil Health restoration advice
                </h4>
                <ul className="space-y-2 bg-gray-50/50 dark:bg-dark-850/30 p-4 rounded-2xl border border-gray-150 dark:border-dark-800/20">
                  {result.soilImprovementSuggestions?.map((item: string, idx: number) => (
                    <li key={idx} className="text-xs md:text-sm text-gray-600 dark:text-dark-350 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer PDF */}
              <div className="flex gap-2 justify-end border-t border-gray-50 dark:border-dark-850 pt-4 print:hidden">
                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm min-h-[40px] transition-colors"
                >
                  <Download size={14} /> Download Soil PDF Report
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-405">
              <FileText size={48} className="text-gray-300 dark:text-dark-800 mb-3" />
              <p className="font-bold text-sm">No evaluated chemistry reports</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Please fill parameters on the left and submit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
