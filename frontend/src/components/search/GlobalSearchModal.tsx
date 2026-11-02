import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, X, Clock, ArrowRight, ScanEye, CloudSun, Droplets, 
  Sprout, Bot, FileText, Layers, Sparkles, TrendingUp
} from 'lucide-react';
import { VoiceInputButton } from '../voice/VoiceInputButton';

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
  // Diseases & Health
  {
    id: 'disease_scan',
    titleEn: 'Crop Leaf Disease Pathology Scan',
    titleGu: 'પાક રોગ નિદાન અને પાંદડા સ્કેન',
    titleHi: 'फसल रोग निदान एवं पत्ती स्कैन',
    category: 'disease',
    route: '/disease',
    icon: ScanEye,
    keywords: ['leaf', 'disease', 'blight', 'fungus', 'pest', 'રોગ', 'જીવાત', 'બળાપો', 'रोग', 'कीट', 'फफूंद', 'ब्लाइट'],
  },
  // Mandi Prices
  {
    id: 'mandi_prices',
    titleEn: 'Mandi Commodity Prices & Trends',
    titleGu: 'મંડી પાક ભાવો અને બજાર વલણ',
    titleHi: 'मंडी भाव एवं बाजार के रुझान',
    category: 'market',
    route: '/market',
    icon: CloudSun,
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
  // AI Farm Copilot
  {
    id: 'farm_copilot',
    titleEn: 'AI Farm Copilot & Advisory',
    titleGu: 'એઆઈ પાક સલાહકાર અને સહાયક',
    titleHi: 'एआई कृषि सलाहकार व कोपायलट',
    category: 'tool',
    route: '/copilot',
    icon: Bot,
    keywords: ['copilot', 'ai', 'advisor', 'chat', 'सलाહકાર', 'સહાયક', 'ચેટબોટ', 'सलाहकार', 'चैट', 'सहायक'],
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
    titleHi: 'आधिकारिक द खेड़ूत पीडीएफ रिपोर्ट्स',
    category: 'tool',
    route: '/reports',
    icon: FileText,
    keywords: ['report', 'pdf', 'download', 'statement', 'રિપોર્ટ', 'પીડીએફ', 'ડાઉનલોડ', 'દાખલો', 'रिपोर्ट', 'डाउनलोड', 'विवरण'],
  },
];

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
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
    if (currentLang === 'gu') return 'પાક, રોગ, મંડી ભાવ કે સરકારી યોજનાઓ શોધો...';
    if (currentLang === 'hi') return 'फसल, रोग, मंडी भाव या सरकारी योजनाएं खोजें...';
    return 'Search crops, diseases, mandi prices, or schemes...';
  };

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

  const handleSelectResult = (item: SearchItem) => {
    saveRecentSearch(getLocalizedTitle(item));
    onClose();
    navigate(item.route);
  };

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    setQuery(text);
    if (isFinal) {
      saveRecentSearch(text);
    }
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('km-recent-searches');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 p-3.5 md:p-4 border-b border-slate-100 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/40">
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
          />

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-dark-200 rounded-xl transition-colors shrink-0"
            title={t('common.close') || 'Close (Esc)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Recent Searches */}
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
                    onClick={() => setQuery(rec)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-dark-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Clock size={11} className="text-slate-400" />
                    <span>{rec}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Suggestions / Farmer Voice Prompts */}
          {!query && (
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-500" />
                {t('voice.examples_title') || 'Try asking or searching:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { text: t('voice.example_disease') || 'What disease does my crop have?', route: '/disease' },
                  { text: t('voice.example_mandi') || "Show today's mandi prices", route: '/market' },
                  { text: t('voice.example_weather') || 'What is the weather forecast for my farm?', route: '/weather' },
                  { text: t('voice.example_irrigation') || 'Do I need to irrigate my crop today?', route: '/irrigation' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      saveRecentSearch(item.text);
                      onClose();
                      navigate(item.route);
                    }}
                    className="p-3 text-left bg-brand-50/70 hover:bg-brand-100/80 dark:bg-dark-800/60 dark:hover:bg-dark-800 border border-brand-200/50 dark:border-dark-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-dark-100 transition-all flex items-center justify-between group"
                  >
                    <span>{item.text}</span>
                    <ArrowRight size={14} className="text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
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
                  {t('search.try_voice_or_words') || 'Try using voice search or simple keywords like "wheat", "cotton", or "fertilizer".'}
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
    </div>
  );
};
