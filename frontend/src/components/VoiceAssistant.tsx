import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

export const VoiceAssistant: React.FC = () => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [recognition, setRecognition] = useState<any>(null);

  const getLanguageLocale = (lang: string): string => {
    const localeMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      gu: 'gu-IN',
      mr: 'mr-IN',
      pa: 'pa-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      or: 'or-IN',
      as: 'as-IN'
    };
    return localeMap[lang] || 'en-US';
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      // Bind dynamic speech recognition locales
      rec.lang = getLanguageLocale(i18n.language);

      rec.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      rec.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        await processVoiceCommand(text);
      };

      rec.onerror = (err: any) => {
        console.error('[Voice Assistant Speech Error]', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [i18n.language]);

  const toggleListen = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.warn('Speech recognition start clash ignored.');
      }
    }
  };

  const processVoiceCommand = async (text: string) => {
    setLoading(true);
    try {
      const res = await api.post('/chatbot/message', {
        message: text,
        history: [],
        language: i18n.language
      });

      if (res.data && res.data.success) {
        const reply = res.data.reply;
        
        // Log original English text internally for debug checks
        console.info('[AI Debug: Original English Reply]', res.data.originalEnglishReply);
        
        setTranscript(reply);
        speakAloud(reply);
      }
    } catch (err) {
      console.error('[Voice Process Error]', err);
      speakAloud(
        i18n.language === 'hi' 
          ? 'सर्वर से त्रुटि हुई।' 
          : i18n.language === 'gu'
          ? 'સર્વરથી ત્રુટિ આવી.' 
          : 'Server connection error.'
      );
    } finally {
      setLoading(false);
    }
  };

  const speakAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      // Clean characters out of AI reply for text speaking
      const cleanText = text.replace(/[*#`_\-]/g, '').trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = getLanguageLocale(i18n.language);

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      // Bind speechSynthesis vocal dialect
      const voices = window.speechSynthesis.getVoices();
      const targetPrefix = i18n.language;
      const matchedVoice = voices.find(v => v.lang.startsWith(targetPrefix));
      if (matchedVoice) utterance.voice = matchedVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {transcript && (
        <div className="max-w-xs md:max-w-sm px-4 py-3 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 shadow-xl rounded-2xl rounded-br-none text-xs md:text-sm text-gray-700 dark:text-dark-200 animate-slide-up pointer-events-auto">
          <p className="font-bold text-[10px] text-brand-600 dark:text-brand-400 mb-1 uppercase tracking-wider">Voice Assistant</p>
          <p className="line-clamp-4">{transcript}</p>
        </div>
      )}

      <button
        onClick={toggleListen}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-auto transition-transform duration-200 hover:scale-105 active:scale-95 ${
          isListening 
            ? 'bg-red-500 animate-pulse' 
            : isSpeaking 
            ? 'bg-amber-500' 
            : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/20'
        }`}
        title={isSpeaking ? 'Stop Speaking' : isListening ? 'Listening...' : 'Voice Assistant'}
      >
        {loading ? (
          <Loader2 size={24} className="animate-spin" />
        ) : isSpeaking ? (
          <VolumeX size={24} />
        ) : isListening ? (
          <MicOff size={24} />
        ) : (
          <Mic size={24} />
        )}
      </button>
    </div>
  );
};
