import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, X, Clock, ArrowRight, ScanEye, CloudSun, Droplets, 
  Sprout, Bot, FileText, Layers, Sparkles, TrendingUp, Brain
} from 'lucide-react';
import { VoiceInputButton } from '../voice/VoiceInputButton';
import { resolveSearchIntent, type SearchIntentResult } from '../../utils/searchIntentRouting';
import { ModalPortal } from '../common/ModalPortal';

interface SearchItem {
  id: string;
  titleEn: string;
  titleGu: string;
  titleHi: string;
  category: 'crop' | 'disease' | 'market' | 'tool' | 'scheme';
  route: string;
  icon: any;
  keywords: string[];
}

const SEARCH_DATABASE: SearchItem[] = [
  // AI Farm Copilot
  {
    id: 'farm_copilot',
    titleEn: 'AI Farm Copilot & Advisory',
    titleGu: 'એઆઈ પાક સલાહકાર અને સહાયક',
    titleHi: 'एआई कृषि सलाहकार व कोपायलट',
    category: 'tool',
    route: '/copilot',
    icon: Bot,
    keywords: ['copilot', 'ai', 'advisor', 'chat', 'fertilizer', 'yield', 'सलाહકાર', 'સહાયક', 'ચેટબોટ', 'ખાતર', 'सलाहकार', 'चैट', 'सहायक', 'उर्वरक'],
  },
  // Diseases & Health
  {
    id: 'disease_scan',
    titleEn: 'Crop Leaf Disease Pathology Scan',
    titleGu: 'પાક રોગ નિદાન અને પાંદડા સ્કેન',
    titleHi: 'फसल रोग निदान एवं पत्ती स्कैन',
    category: 'disease',
    route: '/disease',
    icon: ScanEye,
    keywords: ['leaf scan', 'disease scan', 'blight', 'fungus', 'pest', 'રોગ નિદાન', 'જીવાત', 'બળાપો', 'रोग स्कैन', 'कीट', 'फफूंद', 'ब्लाइट'],
  },
  // Mandi Prices
  {
    id: 'mandi_prices',
    titleEn: 'Mandi Commodity Prices & Trends',
    titleGu: 'મંડી પાક ભાવો અને બજાર વલણ',
    titleHi: 'मंडी भाव एवं बाजार के रुझान',
    category: 'market',
    route: '/market',
    icon: TrendingUp,
    keywords: ['mandi', 'price', 'wheat', 'cotton', 'soybean', 'ભાવ', 'મંડી', 'ઘઉં', 'કપાસ', 'सोयाबीन', 'गेहूं', 'दाम', 'कपास'],
  },
  // Weather
  {
    id: 'weather_forecast',
    titleEn: 'Farm Weather Forecast & Spray Radar',
    titleGu: 'ખેતર હવામાન આગાહી અને સ્પ્રે સલાહ',
    titleHi: 'खेत का मौसम पूर्वानुमान व छिड़काव सलाह',
    category: 'tool',
    route: '/weather',
    icon: CloudSun,
    keywords: ['weather', 'rain', 'temp', 'spray', 'climate', 'હવામાન', 'વરસાદ', 'તાપમાન', 'તાપ', 'मौसम', 'बारिश', 'तापमान', 'छिड़काव'],
  },
  // Smart Irrigation
  {
    id: 'smart_irrigation',
    titleEn: 'Smart Irrigation & Soil Moisture',
    titleGu: 'સ્માર્ટ સિંચાઈ અને ભેજ વ્યવસ્થાપન',
    titleHi: 'स्मार्ट सिंचाई एवं नमी प्रबंधन',
    category: 'tool',
    route: '/irrigation',
    icon: Droplets,
    keywords: ['irrigation', 'water', 'pump', 'moisture', 'સિંચાઈ', 'પાણી', 'પંપ', 'ભેજ', 'सिंचाई', 'पानी', 'पंप', 'नमी'],
  },
  // Soil Analysis
  {
    id: 'soil_npk',
    titleEn: 'Soil Chemistry NPK & Fertilizer Plan',
    titleGu: 'જમીન વિશ્લેષણ NPK અને ખાતર આયોજન',
    titleHi: 'मृदा विश्लेषण NPK एवं खाद योजना',
    category: 'tool',
    route: '/soil',
    icon: Sprout,
    keywords: ['soil', 'npk', 'fertilizer', 'urea', 'dap', 'જમીન', 'ખાતર', 'યુરિયા', 'માટી', 'मिट्टी', 'उर्वरक', 'खाद', 'यूरिया'],
  },
  // Gov Schemes
  {
    id: 'gov_schemes',
    titleEn: 'Government Subsidies & Schemes (PM-KISAN)',
    titleGu: 'સરકારી સહાય અને યોજનાઓ (પીએમ-કિસાન)',
    titleHi: 'सरकारी योजनाएं व सब्सिडी (पीएम-किसान)',
    category: 'scheme',
    route: '/schemes',
    icon: Layers,
    keywords: ['scheme', 'pm kisan', 'subsidy', 'insurance', 'pmfby', 'યોજના', 'સબસિડી', 'વીમો', 'સહાય', 'योजना', 'सब्सिडी', 'बीमा'],
  },
  // Reports
  {
    id: 'pdf_reports',
    titleEn: 'Official The Khedut PDF Reports',
    titleGu: 'સત્તાવાર ધ ખેડૂત પીડીએફ રિપોર્ટ્સ',
    titleHi: 'આधिकारिक द खेड़ूत पीडीएफ रिपोर्ट्स',
    category: 'tool',
    route: '/reports',
    icon: FileText,
    keywords: ['report', 'pdf', 'download', 'statement', 'રિપોર્ટ', 'પીડીએફ', 'ડાઉનલોડ', 'દાખલો', 'रिपोर्ट', 'डाउनलोड', 'विवरण'],
  },
];

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVoice?: boolean;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, initialVoice = false }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('km-recent-searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentLang = i18n.language || 'gu';

  const getLocalizedTitle = (item: SearchItem): string => {
    if (currentLang === 'gu') return item.titleGu;
    if (currentLang === 'hi') return item.titleHi;
    return item.titleEn;
  };

  const getPlaceholder = (): string => {
    if (currentLang === 'gu') return 'ખેતી વિશે પ્રશ્ન પૂછો, પાક રોગ, મંડી ભાવ કે હવામાન...';
    if (currentLang === 'hi') return 'कृषि प्रश्न पूछें, फसल रोग, मंडी भाव या मौसम...';
    return 'Ask a farming question, search mandi prices, disease, or weather...';
  };

  // Live intent detection for the current input
  const liveIntent = query.trim() ? resolveSearchIntent(query.trim()) : null;

  // Filter items
  const cleanQ = query.trim().toLowerCase();
  const results = cleanQ
    ? SEARCH_DATABASE.filter((item) => {
        const titleMatch =
          item.titleEn.toLowerCase().includes(cleanQ) ||
          item.titleGu.toLowerCase().includes(cleanQ) ||
          item.titleHi.toLowerCase().includes(cleanQ);
        const keywordMatch = item.keywords.some((k) => k.toLowerCase().includes(cleanQ));
        return titleMatch || keywordMatch;
      })
    : SEARCH_DATABASE.slice(0, 5);

  const saveRecentSearch = (text: string) => {
    const updated = [text, ...recentSearches.filter((item) => item !== text)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('km-recent-searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Executes search intent routing and navigates with appropriate state
   */
  const handleExecuteSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    onClose();

    const intentResult = resolveSearchIntent(trimmed);
    navigate(intentResult.route, {
      state: intentResult.navigationState
    });
  };

  const handleSelectResult = (item: SearchItem) => {
    saveRecentSearch(getLocalizedTitle(item));
    onClose();
    navigate(item.route);
  };

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    setQuery(text);
    if (isFinal && text.trim()) {
      saveRecentSearch(text.trim());
    }
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('km-recent-searches');
  };

  const getActionBadgeInfo = (intentResult: SearchIntentResult) => {
    switch (intentResult.intent) {
      case 'copilot':
        return {
          label: 'AI Farm Copilot',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
          icon: Brain,
          subtitle: currentLang === 'gu' 
            ? 'એઆઈ કોપાયલટ પાસેથી સલાહ, ખાતર અને ઉપાય મેળવો' 
            : currentLang === 'hi' 
            ? 'एआई कोपायलट से कृषि सलाह, खाद व उपाय प्राप्त करें' 
            : 'Get tailored agronomic guidance, fertilizer recommendations & farm advisory'
        };
      case 'disease':
        return {
          label: 'Crop Health Diagnosis',
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
          icon: ScanEye,
          subtitle: currentLang === 'gu' 
            ? 'પાંદડા સ્કેનર અને પાક રોગ નિદાન કેમેરા ખોલો' 
            : currentLang === 'hi' 
            ? 'पत्ती स्कैनर एवं फसल रोग निदान कैमरा खोलें' 
            : 'Open leaf pathology scanner & upload photo for disease diagnosis'
        };
      case 'market':
        return {
          label: 'Mandi Prices',
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
          icon: TrendingUp,
          subtitle: currentLang === 'gu' 
            ? 'આજના મંડી ભાવો અને બજાર વલણ જુઓ' 
            : currentLang === 'hi' 
            ? 'आज के मंडी भाव एवं बाजार का रुझान देखें' 
            : 'Check live APMC arrival prices & commodity rates'
        };
      case 'weather':
        return {
          label: 'Weather Forecast',
          badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
          icon: CloudSun,
          subtitle: currentLang === 'gu' 
            ? '૭ દિવસનું હવામાન, વરસાદની આગાહી અને સ્પ્રે રડાર' 
            : currentLang === 'hi' 
            ? '7 दिन का मौसम, बारिश की संभावना व स्प्रे सलाह' 
            : 'View 7-day farm forecast, rain probability & spray radar'
        };
      case 'irrigation':
        return {
          label: 'Smart Irrigation',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
          icon: Droplets,
          subtitle: currentLang === 'gu' 
            ? 'જમીનમાં ભેજ સંતુલન અને સિંચાઈ આયોજન ચકાસો' 
            : currentLang === 'hi' 
            ? 'मिट्टी की नमी संतुलन व सिंचाई योजना जांचें' 
            : 'Check soil moisture balance & irrigation schedule'
        };
      default:
        return {
          label: 'AI Farm Copilot',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
          icon: Brain,
          subtitle: 'Ask AI Copilot for farm guidance'
        };
    }
  };

  // Structured suggested questions with dedicated intent destinations
  const SUGGESTED_QUESTIONS = [
    {
      text: currentLang === 'gu' 
        ? 'મારા પાકના પાંદડા પીળા કેમ પડી રહ્યા છે?' 
        : currentLang === 'hi' 
        ? 'मेरी फसल के पत्ते पीले क्यों पड़ रहे हैं?' 
        : 'Why are my crop leaves turning yellow?',
      category: 'AI Copilot',
      icon: Bot,
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40'
    },
    {
      text: currentLang === 'gu' 
        ? 'ઘઉંનું ઉત્પાદન કેવી રીતે વધારવું?' 
        : currentLang === 'hi' 
        ? 'गेहूं की पैदावार कैसे बढ़ाएं?' 
        : 'How can I increase wheat production?',
      category: 'AI Copilot',
      icon: Brain,
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40'
    },
    {
      text: t('voice.example_disease') || 'What disease does my crop have?',
      category: 'Crop Health',
      icon: ScanEye,
      color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/40'
    },
    {
      text: t('voice.example_mandi') || "Show today's mandi prices",
      category: 'Mandi Prices',
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40'
    },
    {
      text: t('voice.example_weather') || 'What is the weather forecast for my farm?',
      category: 'Weather',
      icon: CloudSun,
      color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60 dark:border-sky-900/40'
    },
    {
      text: t('voice.example_irrigation') || 'Do I need to irrigate my crop today?',
      category: 'Irrigation',
      icon: Droplets,
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/40'
    },
  ];

  return (
    <ModalPortal
      isOpen={isOpen}
      onClose={onClose}
      zIndex={100}
      backdropClassName="bg-slate-950/70 backdrop-blur-md"
      containerClassName="flex items-start justify-center pt-14 sm:pt-16 md:pt-20 px-3 sm:px-4 pb-6"
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar (Form enables mobile Go/Search & Desktop Enter key) */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch(query);
          }}
          className="flex items-center gap-2 p-3.5 md:p-4 border-b border-slate-100 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/40"
        >
          <Search size={20} className="text-brand-600 dark:text-brand-400 shrink-0 ml-1" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder()}
            className="flex-1 bg-transparent text-sm md:text-base font-medium text-slate-800 dark:text-dark-100 placeholder-slate-400 focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-dark-200 rounded-xl transition-colors"
              title={t('common.clear') || 'Clear'}
            >
              <X size={16} />
            </button>
          )}

          {/* Voice Input Button in Search Bar */}
          <VoiceInputButton
            onTranscript={handleVoiceTranscript}
            lang={currentLang}
            size="md"
            showTextFeedback
            autoStart={initialVoice}
          />

          {/* Quick Submit Arrow Button when query has content */}
          {query.trim() && (
            <button
              type="submit"
              className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors shrink-0 shadow-sm flex items-center justify-center"
              title="Search"
            >
              <ArrowRight size={18} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            data-modal-close="true"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-dark-200 rounded-xl transition-colors shrink-0"
            title={t('common.close') || 'Close (Esc)'}
          >
            <X size={20} />
          </button>
        </form>

        {/* Search Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* 1. DYNAMIC INTENT ACTION BANNER (When query is active) */}
          {liveIntent && query.trim() && (() => {
            const badge = getActionBadgeInfo(liveIntent);
            const BadgeIcon = badge.icon;
            return (
              <div className="bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-dark-800/80 dark:to-dark-900/80 border-2 border-brand-200/80 dark:border-brand-800/40 rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <BadgeIcon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${badge.badgeColor}`}>
                          {badge.label}
                        </span>
                        {liveIntent.extractedCrop && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            🌾 {liveIntent.extractedCrop}
                          </span>
                        )}
                        {liveIntent.extractedLocation && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                            📍 {liveIntent.extractedLocation}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-dark-100 mt-1 truncate">
                        "{query}"
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-dark-300 mt-0.5">
                        {badge.subtitle}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(query)}
                    className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 self-center"
                  >
                    <span>{liveIntent.intent === 'copilot' ? 'Ask Copilot' : 'Open'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 2. RECENT SEARCHES */}
          {!query && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100 dark:border-dark-800">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Clock size={12} /> {t('search.recent_searches') || 'Recent Searches'}
                </span>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {t('common.clear') || 'Clear'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {recentSearches.map((rec, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleExecuteSearch(rec)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-dark-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Clock size={11} className="text-slate-400" />
                    <span>{rec}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. QUICK SUGGESTIONS / VOICE PROMPTS */}
          {!query && (
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-500" />
                {t('voice.examples_title') || 'Try asking or searching:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleExecuteSearch(item.text)}
                      className={`p-3 text-left border rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${item.color} hover:shadow-sm`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/80 dark:bg-dark-900/80 flex items-center justify-center shrink-0 shadow-xs">
                          <ItemIcon size={14} />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate">{item.text}</span>
                          <span className="text-[9px] uppercase tracking-wider opacity-75 font-semibold">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0 ml-2 opacity-70 group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. RESULTS / CORE PLATFORM FEATURES */}
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
              {query ? (t('search.matching_results') || 'Matching Tools & Topics') : (t('search.popular_tools') || 'Core Platform Features')}
            </p>

            {results.length > 0 ? (
              <div className="space-y-1.5">
                {results.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectResult(item)}
                      className="w-full p-3 text-left hover:bg-slate-100 dark:hover:bg-dark-800/80 rounded-2xl transition-colors flex items-center justify-between gap-3 group border border-transparent hover:border-slate-200 dark:hover:border-dark-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0">
                          <Icon size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-dark-100 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors truncate">
                            {getLocalizedTitle(item)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {item.category} • The Khedut
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <p className="text-xs font-bold text-slate-600 dark:text-dark-300">
                  {t('search.no_results') || 'No matching topics found.'}
                </p>
                <p className="text-[11px]">
                  {t('search.try_voice_or_words') || 'Try asking a direct question to AI Copilot or using keywords like "wheat", "cotton", or "fertilizer".'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-3 bg-slate-50 dark:bg-dark-950/60 border-t border-slate-100 dark:border-dark-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-white dark:bg-dark-800 border rounded font-mono text-[10px]">Ctrl+K</span>
            <span>{t('search.shortcut_hint') || 'to open search anywhere'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-600 dark:text-dark-300">
              {currentLang === 'gu' ? 'ગુજરાતી વાણી સક્રિય' : currentLang === 'hi' ? 'हिन्दी आवाज सक्रिय' : 'Voice search active'}
            </span>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
