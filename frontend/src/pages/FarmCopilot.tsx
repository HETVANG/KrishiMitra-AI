import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Bot, 
  Send, 
  Loader2, 
  Sparkles, 
  MapPin, 
  Sun, 
  Sprout, 
  CloudSun, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  ListTodo, 
  ShieldAlert, 
  Compass, 
  ChevronRight, 
  PlusCircle, 
  TrendingUp,
  Brain,
  Info,
  Check,
  RefreshCw
} from 'lucide-react';

interface StructuredOutput {
  answer: string;
  summary: string;
  observations: string[];
  recommendations: string[];
  actions: Array<{
    title: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }>;
  warnings: string[];
  requiredInformation: string[];
  confidence: number;
  sources: string[];
  generatedAt: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  structured?: StructuredOutput;
  timestamp: Date;
}

interface ProactiveInsight {
  id: string;
  type: 'weather' | 'soil' | 'disease' | 'market' | 'harvest';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  actionableStep: string;
}

interface FarmTaskItem {
  _id?: string;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  durationMinutes?: number;
  completed: boolean;
  category?: string;
}

export const FarmCopilot: React.FC = () => {
  const { user, farmLocation } = useAuth();
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState<'chat' | 'daily' | 'weekly' | 'insights'>('chat');
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [farmContext, setFarmContext] = useState<any>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(true);

  // Tab Data States
  const [dailyTasks, setDailyTasks] = useState<FarmTaskItem[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<any[]>([]);
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load User Farms & Initial Context
  useEffect(() => {
    fetchFarmsAndContext();
  }, [user]);

  const fetchFarmsAndContext = async () => {
    try {
      setContextLoading(true);
      // Fetch user profile or farm list
      const meRes = await api.get('/auth/me');
      const userFarms = meRes.data?.user?.farms || [];
      setFarms(userFarms);

      const targetId = selectedFarmId || (userFarms[0] ? userFarms[0]._id : undefined);
      if (targetId) {
        setSelectedFarmId(targetId);
      }

      await loadContextData(targetId);
    } catch (err) {
      console.warn('[Farm Copilot] Failed to fetch context:', err);
    } finally {
      setContextLoading(false);
    }
  };

  const loadContextData = async (fId?: string) => {
    try {
      const param = fId ? `/${fId}` : '';
      const [ctxRes, insRes, dailyRes, weeklyRes] = await Promise.all([
        api.get(`/copilot/context${param}`).catch(() => null),
        api.get(`/copilot/insights${param}`).catch(() => null),
        api.get(`/copilot/daily-plan${param}`).catch(() => null),
        api.get(`/copilot/weekly-plan${param}`).catch(() => null)
      ]);

      if (ctxRes?.data?.success) {
        setFarmContext(ctxRes.data.context);
      }
      if (insRes?.data?.success) {
        setInsights(insRes.data.insights || []);
      }
      if (dailyRes?.data?.success) {
        setDailyTasks(dailyRes.data.tasks || []);
      }
      if (weeklyRes?.data?.success) {
        setWeeklyPlan(weeklyRes.data.schedule || []);
      }

      // Add initial greeting message if empty
      if (messages.length === 0) {
        const farmName = ctxRes?.data?.context?.farm?.name || 'your farm';
        const cropName = ctxRes?.data?.context?.farm?.crops?.[0]?.name || 'crop';
        setMessages([
          {
            id: 'msg-init',
            role: 'model',
            text: `Welcome to your AI Farm Copilot! I have loaded live context for **${farmName}** (${cropName}). How can I assist your farming operations today?`,
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error('[Farm Copilot] Error loading context data:', err);
    }
  };

  const handleFarmChange = async (farmId: string) => {
    setSelectedFarmId(farmId);
    setContextLoading(true);
    await loadContextData(farmId);
    setContextLoading(false);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/copilot/chat', {
        question: textToSend,
        farmId: selectedFarmId || undefined,
        conversationId: conversationId || undefined,
        language: i18n.language
      });

      if (res.data && res.data.success) {
        if (res.data.conversationId) {
          setConversationId(res.data.conversationId);
        }

        const modelMsg: Message = {
          id: `mod-${Date.now()}`,
          role: 'model',
          text: res.data.structured?.answer || 'Advisory analysis complete.',
          structured: res.data.structured,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, modelMsg]);
      }
    } catch (err: any) {
      console.error('[Farm Copilot Chat Error]', err);
      const errText = err.response?.data?.message || 'Failed to reach AI Farm Copilot backend. Please check network.';
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'model',
        text: errText,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId?: string, index?: number) => {
    if (taskId) {
      try {
        await api.put(`/copilot/tasks/${taskId}/toggle`);
      } catch (err) {
        console.warn('Failed to persist task toggle:', err);
      }
    }
    if (index !== undefined) {
      setDailyTasks(prev => prev.map((t, i) => i === index ? { ...t, completed: !t.completed } : t));
    }
  };

  // Dynamic context-aware suggested prompts
  const suggestedQuestions = [
    `What should I do today on ${farmContext?.farm?.name || 'my farm'}?`,
    `Is ${farmContext?.farm?.crops?.[0]?.name || 'my crop'} at risk from current weather?`,
    `Why are my crop leaves changing color?`,
    `When is the optimal time to irrigate?`,
    `How can I improve my soil nutrient balance?`,
    `What is the market price trend for ${farmContext?.farm?.crops?.[0]?.name || 'my crop'}?`
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Top Copilot Header */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-700 text-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-brand-100 uppercase tracking-wider">
            <Brain size={14} className="text-emerald-300" /> Farm Intelligence Layer
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">AI Farm Copilot</h1>
          <p className="text-xs md:text-sm text-brand-100 leading-relaxed">
            Multi-factor decision engine combining live weather telemetry, soil parameters, market pricing, and leaf pathology into personalized agronomic guidance.
          </p>
        </div>

        {/* Farm Selector Dropdown */}
        <div className="z-10 w-full md:w-auto shrink-0 bg-white/10 dark:bg-dark-900/40 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold text-brand-200 tracking-wider">Active Farm Context</span>
          {farms.length > 0 ? (
            <select
              value={selectedFarmId}
              onChange={(e) => handleFarmChange(e.target.value)}
              className="bg-white text-gray-800 dark:bg-dark-900 dark:text-dark-100 font-bold text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {farms.map((f: any) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.size || 1} Acres • {f.village || 'Farm'})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <MapPin size={14} className="text-emerald-300" />
              <span>{farmContext?.farm?.name || 'Primary Farm Location'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Farm Context Indicator Summary Bar */}
      {contextLoading ? (
        <div className="p-4 bg-white dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-dark-800/40 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Loader2 size={16} className="animate-spin text-brand-500" /> Loading live farm telemetry...
        </div>
      ) : farmContext ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-dark-900 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-800/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={12} className="text-brand-500" /> Location
            </span>
            <span className="text-xs font-bold text-gray-800 dark:text-dark-200 truncate mt-1">
              {farmContext.farm.location.district || farmContext.farm.location.address || 'Location Set'}
            </span>
          </div>

          <div className="bg-white dark:bg-dark-900 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-800/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Sprout size={12} className="text-emerald-500" /> Primary Crop
            </span>
            <span className="text-xs font-bold text-gray-800 dark:text-dark-200 truncate mt-1">
              {farmContext.farm.crops[0]?.name || 'General Crop'}
            </span>
          </div>

          <div className="bg-white dark:bg-dark-900 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-800/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Sun size={12} className="text-amber-500" /> Weather
            </span>
            <span className="text-xs font-bold text-gray-800 dark:text-dark-200 truncate mt-1">
              {farmContext.weather.available ? `${farmContext.weather.tempCelsius}°C (${farmContext.weather.condition})` : 'Telemetry Off'}
            </span>
          </div>

          <div className="bg-white dark:bg-dark-900 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-800/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <CloudSun size={12} className="text-blue-500" /> Soil Testing
            </span>
            <span className={`text-xs font-bold truncate mt-1 ${farmContext.soil.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {farmContext.soil.available ? `pH ${farmContext.soil.ph} • Tested` : 'Sample Pending'}
            </span>
          </div>

          <div className="bg-white dark:bg-dark-900 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-800/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert size={12} className="text-purple-500" /> Disease Scan
            </span>
            <span className="text-xs font-bold text-gray-800 dark:text-dark-200 truncate mt-1">
              {farmContext.disease.available ? `${farmContext.disease.recentScansCount} Logged` : 'Clean Log'}
            </span>
          </div>

          <div className="bg-white dark:bg-dark-900 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-800/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" /> Market Index
            </span>
            <span className="text-xs font-bold text-gray-800 dark:text-dark-200 truncate mt-1">
              {farmContext.market.available ? `₹${farmContext.market.avgPrice}/Qtl` : 'Agmarknet Off'}
            </span>
          </div>
        </div>
      ) : null}

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-dark-800 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'chat'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-dark-400'
          }`}
        >
          <Bot size={16} /> Live Copilot Conversation
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'daily'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-dark-400'
          }`}
        >
          <ListTodo size={16} /> Today's Farm Plan
          {dailyTasks.filter(t => !t.completed).length > 0 && (
            <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-[10px] rounded-full font-bold">
              {dailyTasks.filter(t => !t.completed).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'weekly'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-dark-400'
          }`}
        >
          <Calendar size={16} /> Weekly Schedule
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'insights'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-dark-400'
          }`}
        >
          <Sparkles size={16} /> Proactive Insights
          {insights.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-full font-bold">
              {insights.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Live Copilot Chat Interface */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[650px] bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/30 rounded-3xl overflow-hidden shadow-sm">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50 dark:bg-dark-950/20">
            {messages.map((msg) => {
              const isBot = msg.role === 'model';
              const struct = msg.structured;

              return (
                <div key={msg.id} className={`flex gap-3 max-w-[95%] md:max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                    isBot ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 dark:bg-dark-800 dark:text-dark-200'
                  }`}>
                    {isBot ? <Bot size={15} /> : 'ME'}
                  </div>

                  <div className="space-y-3 flex-1 text-left">
                    {/* Primary Text Message */}
                    <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${
                      isBot 
                        ? 'bg-white dark:bg-dark-900 text-gray-800 dark:text-dark-200 border border-gray-100 dark:border-dark-800 rounded-tl-none' 
                        : 'bg-brand-600 text-white rounded-tr-none'
                    }`}>
                      {msg.text.split('\n').map((line, idx) => (
                        <p key={idx} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
                          {line}
                        </p>
                      ))}
                    </div>

                    {/* Structured AI Response Cards (If Available) */}
                    {isBot && struct && (
                      <div className="space-y-3 mt-3">
                        {/* Executive Summary Card */}
                        {struct.summary && (
                          <div className="p-3 bg-brand-50/60 dark:bg-brand-950/20 border border-brand-100/60 dark:border-brand-900/30 rounded-xl text-xs font-semibold text-brand-900 dark:text-brand-300">
                            <strong>Summary:</strong> {struct.summary}
                          </div>
                        )}

                        {/* Observations & Recommendations */}
                        {((struct.observations && struct.observations.length > 0) || (struct.recommendations && struct.recommendations.length > 0)) && (
                          <div className="p-4 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-2xl space-y-2">
                            {struct.observations && struct.observations.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">Observed Telemetry Context</h5>
                                <ul className="list-disc list-inside text-xs text-gray-600 dark:text-dark-300 space-y-1">
                                  {struct.observations.map((obs, oIdx) => (
                                    <li key={oIdx}>{obs}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {struct.recommendations && struct.recommendations.length > 0 && (
                              <div className="pt-2">
                                <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Agronomic Recommendations</h5>
                                <ul className="list-disc list-inside text-xs text-gray-700 dark:text-dark-200 font-medium space-y-1">
                                  {struct.recommendations.map((rec, rIdx) => (
                                    <li key={rIdx}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Items List */}
                        {struct.actions && struct.actions.length > 0 && (
                          <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-2xl space-y-2">
                            <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Priority Action Steps
                            </h5>
                            <div className="space-y-2">
                              {struct.actions.map((act, aIdx) => (
                                <div key={aIdx} className="p-2.5 bg-white dark:bg-dark-900 rounded-xl border border-emerald-100 dark:border-dark-800 flex items-start justify-between gap-2">
                                  <div>
                                    <h6 className="text-xs font-extrabold text-gray-800 dark:text-dark-100">{act.title}</h6>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{act.reason}</p>
                                  </div>
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                                    act.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'
                                  }`}>
                                    {act.priority}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Safety & Agronomic Warning */}
                        {struct.warnings && struct.warnings.length > 0 && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                            <AlertTriangle size={14} className="shrink-0 text-amber-600 mt-0.5" />
                            <div>
                              {struct.warnings.map((warn, wIdx) => (
                                <p key={wIdx}>{warn}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sources Footer */}
                        {struct.sources && struct.sources.length > 0 && (
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold px-1">
                            <Info size={10} /> Data Sources: {struct.sources.join(' • ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 mr-auto items-center">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center">
                  <Bot size={15} />
                </div>
                <div className="px-4 py-3 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-2xl flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 size={14} className="animate-spin text-brand-500" />
                  <span>Synthesizing farm telemetry & AI agronomic model...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Dynamic Suggested Questions */}
          {messages.length <= 2 && (
            <div className="px-6 py-3 bg-white dark:bg-dark-900 border-t border-gray-100 dark:border-dark-800/40 text-left">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-brand-500" /> Context-Aware Questions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-brand-50 dark:bg-dark-800/50 dark:hover:bg-brand-950/20 text-gray-600 dark:text-dark-300 hover:text-brand-700 text-xs font-semibold rounded-xl border border-gray-200/50 dark:border-dark-800 transition-all text-left"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
            className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-100 dark:border-dark-800/40 bg-white dark:bg-dark-900 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot anything about your farm, weather risk, leaf yellowing, or market prices..."
              className="custom-input flex-1 min-h-[44px]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-100 dark:disabled:bg-dark-800 disabled:text-gray-400 text-white rounded-xl transition-all shadow-md flex items-center justify-center shrink-0 min-w-[44px]"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Today's Farm Plan */}
      {activeTab === 'daily' && (
        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800/40 pb-4">
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-gray-800 dark:text-dark-100">Today's Prioritized Tasks</h3>
              <p className="text-xs text-gray-500 mt-0.5">Automated 1-day agronomic checklist based on weather, soil, and crop growth stage.</p>
            </div>
            <button 
              onClick={() => loadContextData(selectedFarmId)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-dark-800 dark:text-dark-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={12} /> Refresh Plan
            </button>
          </div>

          <div className="space-y-3">
            {dailyTasks.map((task, idx) => (
              <div 
                key={idx}
                onClick={() => toggleTaskCompletion(task._id, idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  task.completed 
                    ? 'bg-gray-50 dark:bg-dark-950/40 border-gray-200 dark:border-dark-800/40 opacity-70' 
                    : 'bg-white dark:bg-dark-900 border-gray-100 dark:border-dark-800 shadow-sm hover:border-brand-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                  task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-dark-700'
                }`}>
                  {task.completed && <Check size={14} />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-extrabold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-dark-100'}`}>
                      {task.title}
                    </h4>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">{task.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Weekly Schedule */}
      {activeTab === 'weekly' && (
        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="font-extrabold text-base md:text-lg text-gray-800 dark:text-dark-100">7-Day Farm Management Plan</h3>
            <p className="text-xs text-gray-500 mt-0.5">Recommended weekly activities tailored to {farmContext?.farm?.name || 'your farm'}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyPlan.map((dayItem, idx) => (
              <div key={idx} className="p-4 bg-gray-50/60 dark:bg-dark-950/30 rounded-2xl border border-gray-100 dark:border-dark-800/40 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-800 pb-2">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-brand-700 dark:text-brand-400">{dayItem.day}</span>
                  <span className="text-[10px] font-bold text-gray-400">Day {idx + 1}</span>
                </div>

                <div className="space-y-2">
                  {dayItem.tasks?.map((tItem: any, tIdx: number) => (
                    <div key={tIdx} className="p-3 bg-white dark:bg-dark-900 rounded-xl border border-gray-100 dark:border-dark-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-gray-800 dark:text-dark-200">{tItem.title}</h5>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          tItem.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'
                        }`}>
                          {tItem.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">{tItem.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Proactive Insights */}
      {activeTab === 'insights' && (
        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="font-extrabold text-base md:text-lg text-gray-800 dark:text-dark-100">Live Proactive Insights</h3>
            <p className="text-xs text-gray-500 mt-0.5">Automated telemetry alerts generated by the Farm Context Engine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins) => (
              <div 
                key={ins.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  ins.severity === 'critical'
                    ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200/60'
                    : ins.severity === 'warning'
                    ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/60'
                    : 'bg-brand-50/50 dark:bg-brand-950/10 border-brand-200/60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      ins.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ins.severity} Alert
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{ins.type}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-800 dark:text-dark-100">{ins.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed">{ins.description}</p>
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-2 text-xs font-bold text-brand-700 dark:text-brand-400">
                  <ChevronRight size={14} /> Action: {ins.actionableStep}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
