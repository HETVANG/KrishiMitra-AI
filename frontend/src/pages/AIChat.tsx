import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { Send, Bot, User, Loader2, Sparkles, Volume2, Copy, Share2, VolumeX, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
  originalEnglish?: string; // Stored internally for debug inspections
}

export const AIChat: React.FC = () => {
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getLanguageLocale = (lang: string): string => {
    const localeMap: Record<string, string> = {
      en: 'en-US', hi: 'hi-IN', gu: 'gu-IN', mr: 'mr-IN', pa: 'pa-IN',
      bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN',
      or: 'or-IN', as: 'as-IN'
    };
    return localeMap[lang] || 'en-US';
  };

  const suggestions: Record<string, string[]> = {
    en: [
      'What crop should I grow in loamy soil?',
      'How much fertilizer for 5 acres of wheat?',
      'My tomato leaves have yellow spots. Best remedy?',
      'Best organic pesticide for whitefly?'
    ],
    hi: [
      'दोमट मिट्टी में मुझे कौन सी फसल उगानी चाहिए?',
      '5 एकड़ गेहूं के लिए कितनी खाद चाहिए?',
      'टमाटर की पत्तियों पर पीले धब्बे हैं। समाधान?',
      'कीट नियंत्रण के लिए नीम तेल का उपयोग कैसे करें?'
    ],
    gu: [
      'ગોરાડુ જમીન માટે કયો પાક ઉત્તમ છે?',
      '૫ એકર ઘઉંના પાક માટે કેટલું ખાતર જોઇશે?',
      'ટમેટાના પાનમાં પીળા ડાઘ છે. ઉપાય?',
      'સજીવ ખેતીમાં જીવાત નિયંત્રણ કેવી રીતે કરવું?'
    ]
  };

  const currentSuggestions = suggestions[i18n.language] || suggestions.en;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const greetings: Record<string, string> = {
      en: 'Hello! I am KrishiMitra AI. I can guide you with weather summaries, crop selections, soil fertility plans, disease remedies, and mandi prices. Ask me anything!',
      hi: 'नमस्ते! मैं कृषिमित्र एआई हूं। मैं फसल चयन, मौसम, खाद की गणना, पत्ती रोगों के उपचार और मंडी भाव में आपकी मदद कर सकता हूं। मुझसे कुछ भी पूछें!',
      gu: 'નમસ્તે! હું કૃષિમિત્ર એઆઈ છું. હું તમને પાક પસંદગી, હવામાન, ખાતરનું આયોજન, રોગ નિયંત્રણ અને મંડી ભાવો અંગે મદદ કરી શકું છું. ગમે તે પ્રશ્ન પૂછો!'
    };
    const newGreeting = greetings[i18n.language] || greetings.en;

    setMessages(prev => {
      if (prev.length <= 1) {
        return [{ role: 'model', parts: newGreeting }];
      }
      return prev;
    });
    
    // Stop any speech when switching languages
    window.speechSynthesis.cancel();
    setSpeakingMsgIdx(null);
  }, [i18n.language]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { role: 'user', parts: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        parts: m.parts
      }));

      const res = await api.post('/chatbot/message', {
        message: textToSend,
        history: historyPayload,
        language: i18n.language
      });

      if (res.data && res.data.success) {
        const botMsg: ChatMessage = {
          role: 'model',
          parts: res.data.reply,
          originalEnglish: res.data.originalEnglishReply // preserve English response internally
        };

        // Print debug log internally in browser dev console
        console.info('[AI Debug: Original English Reply]', res.data.originalEnglishReply);

        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      let errReply = 'Sorry, I had trouble processing that request. Please try again.';
      
      if (err.response?.data?.code === 'CHAT_LIMIT_EXCEEDED') {
        errReply = err.response.data.message;
      } else {
        errReply = i18n.language === 'hi' 
          ? 'क्षमा करें, जवाब पाने में असमर्थ। कृपया नेटवर्क की जाँच करें।' 
          : i18n.language === 'gu'
          ? 'દિલગીર છીએ, ઉત્તર મેળવવામાં ખામી રહી. નેટવર્ક ચેક કરો.'
          : 'Sorry, I had trouble processing that request. Please try again.';
      }
      setMessages(prev => [...prev, { role: 'model', parts: errReply }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = (text: string, index: number) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgIdx === index) {
        window.speechSynthesis.cancel();
        setSpeakingMsgIdx(null);
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_\-]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = getLanguageLocale(i18n.language);
      
      utterance.onend = () => setSpeakingMsgIdx(null);
      utterance.onerror = () => setSpeakingMsgIdx(null);

      // Bind local synthesizers
      const voices = window.speechSynthesis.getVoices();
      const matched = voices.find(v => v.lang.startsWith(i18n.language));
      if (matched) utterance.voice = matched;

      setSpeakingMsgIdx(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(index);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KrishiMitra AI Advisory',
          text: text,
        });
      } catch (err) {
        console.warn('Share API cancelled or failed:', err);
      }
    } else {
      handleCopy(text, -1);
      alert(t('common.copied'));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/30 rounded-3xl overflow-hidden shadow-sm">
      {/* Header Banner */}
      <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-xl">
          <Bot size={22} className="text-white" />
        </div>
        <div className="text-left">
          <h2 className="font-extrabold text-sm md:text-base tracking-tight">{t('nav.chatbot')}</h2>
          <p className="text-[10px] text-brand-100 font-medium">Powered by Gemini AI • Multilingual Support</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50 dark:bg-dark-950/20">
        {messages.map((msg, index) => {
          const isBot = msg.role === 'model';
          return (
            <div key={index} className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${isBot ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-400' : 'bg-gray-100 text-gray-700 dark:bg-dark-800 dark:text-dark-200'}`}>
                {isBot ? <Bot size={15} /> : <User size={15} />}
              </div>
              <div className="space-y-1 text-left">
                <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${
                  isBot 
                    ? 'bg-white dark:bg-dark-900 text-gray-800 dark:text-dark-200 border border-gray-100 dark:border-dark-800 rounded-tl-none' 
                    : 'bg-brand-600 text-white rounded-tr-none'
                }`}>
                  {msg.parts.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
                      {line}
                    </p>
                  ))}
                </div>

                {/* Chat Action Utility Buttons (Copy, Share, Speak) */}
                {isBot && (
                  <div className="flex gap-2 justify-start pl-1">
                    <button
                      onClick={() => handleReadAloud(msg.parts, index)}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors min-h-[30px] min-w-[30px] ${
                        speakingMsgIdx === index 
                          ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20' 
                          : 'bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-800 text-gray-500 hover:text-brand-600'
                      }`}
                      title={t('common.read_aloud')}
                    >
                      {speakingMsgIdx === index ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      <span className="hidden sm:inline">{speakingMsgIdx === index ? t('common.stop') : t('common.read_aloud')}</span>
                    </button>
                    <button
                      onClick={() => handleCopy(msg.parts, index)}
                      className="p-1.5 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg text-gray-500 hover:text-brand-600 text-[10px] font-bold flex items-center gap-1 min-h-[30px]"
                      title={t('common.copy')}
                    >
                      {copiedMsgIdx === index ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span className="hidden sm:inline">{copiedMsgIdx === index ? t('common.copied') : t('common.copy')}</span>
                    </button>
                    <button
                      onClick={() => handleShare(msg.parts)}
                      className="p-1.5 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg text-gray-500 hover:text-brand-600 text-[10px] font-bold flex items-center gap-1 min-h-[30px]"
                      title={t('common.share')}
                    >
                      <Share2 size={12} />
                      <span className="hidden sm:inline">{t('common.share')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 flex items-center justify-center">
              <Bot size={15} />
            </div>
            <div className="px-4 py-3 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-gray-400">
              <Loader2 size={14} className="animate-spin text-brand-500" />
              <span>Analyzing query...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts overlay */}
      {messages.length === 1 && (
        <div className="px-6 py-4 bg-white dark:bg-dark-900 border-t border-gray-100 dark:border-dark-800/40 text-left">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles size={12} className="text-brand-500" /> Common Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {currentSuggestions.map((sug, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSend(sug)}
                className="px-3 py-1.5 bg-gray-50 hover:bg-brand-50 dark:bg-dark-800/50 dark:hover:bg-brand-950/20 text-gray-600 dark:text-dark-300 hover:text-brand-700 dark:hover:text-brand-400 border border-gray-200/45 dark:border-dark-800 rounded-xl text-xs font-semibold text-left transition-all duration-150"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Message Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
        className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-100 dark:border-dark-800/40 bg-white dark:bg-dark-900 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your agriculture question here..."
          className="custom-input flex-1 min-h-[44px]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-100 dark:disabled:bg-dark-800 disabled:text-gray-400 text-white rounded-xl transition-all duration-150 shadow-md shadow-brand-600/10 flex items-center justify-center shrink-0 min-w-[44px]"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
