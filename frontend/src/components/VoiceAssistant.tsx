import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Square, X } from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

export const VoiceAssistant: React.FC = () => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Speech Recognition references
  const recognitionRef = useRef<any>(null);
  
  // MediaRecorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isCanceledRef = useRef<boolean>(false);

  const getLanguageLocale = (lang: string): string => {
    const localeMap: Record<string, string> = {
      en: 'en-US', hi: 'hi-IN', gu: 'gu-IN', mr: 'mr-IN', pa: 'pa-IN',
      bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN',
      or: 'or-IN', as: 'as-IN'
    };
    return localeMap[lang] || 'en-US';
  };

  // 1. Initialize SpeechRecognition (Web Speech API) if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('[Voice Assistant] Web Speech API detected. Initializing client-side recognition.');
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = getLanguageLocale(i18n.language);

      rec.onstart = () => {
        console.log('[Web Speech API] Recording started');
        setIsListening(true);
        setTranscript('');
        setErrorMsg(null);
      };

      rec.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        console.log('[Web Speech API] Transcript result:', text);
        setTranscript(text);
        setIsListening(false);
        await processVoiceCommand(text);
      };

      rec.onerror = (err: any) => {
        console.error('[Web Speech API Error]', err);
        setIsListening(false);
        handleSpeechError(err);
      };

      rec.onend = () => {
        console.log('[Web Speech API] Recording ended');
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      console.warn('[Voice Assistant] Web Speech API is not supported on this browser. Falling back to MediaRecorder file uploads.');
    }

    // Cleanup: Cancel SpeechSynthesis and Recognition on unmount to prevent memory leaks
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [i18n.language]);

  // Synchronize language locale if recognition language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLanguageLocale(i18n.language);
    }
  }, [i18n.language]);

  // 2. Handle generic permission/media errors
  const handleSpeechError = (err: any) => {
    const errorType = err.error || err.name;
    console.error('[Voice Assistant Detailed Error Debug]', errorType, err);

    switch (errorType) {
      case 'not-allowed':
      case 'PermissionDeniedError':
      case 'NotAllowedError':
        setErrorMsg('Microphone access blocked. Please enable microphone permissions in your browser settings.');
        break;
      case 'no-speech':
        setErrorMsg('No speech detected. Please try speaking again.');
        break;
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        setErrorMsg('No microphone detected. Please connect a microphone and try again.');
        break;
      case 'NotReadableError':
      case 'TrackStartError':
        setErrorMsg('Microphone is busy. Please close other apps using the microphone.');
        break;
      case 'network':
        setErrorMsg('Network error. Please check your internet connection.');
        break;
      case 'aborted':
        // User aborted, do not show error banner
        break;
      default:
        setErrorMsg('Voice assistant error occurred. Please try again.');
    }
  };

  // 3. Start voice recording (Dual Mode)
  const startRecording = async () => {
    setErrorMsg(null);
    setTranscript('');
    isCanceledRef.current = false;

    // Check if speechSynthesis is talking - stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Try Web Speech API recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        return;
      } catch (err) {
        console.warn('Speech recognition start failed, fallback to MediaRecorder:', err);
      }
    }

    // Fallback: MediaRecorder audio capture
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Microphone recording is not supported by your browser.');
      return;
    }

    try {
      console.log('[MediaRecorder] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Determine supported MIME types
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }

      console.log(`[MediaRecorder] Initializing with MIME type: ${mimeType}`);
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        console.log('[MediaRecorder] Recording started');
        setIsListening(true);
      };

      mediaRecorder.onstop = async () => {
        console.log('[MediaRecorder] Recording stopped');
        setIsListening(false);
        
        // Clean up audio track streams
        cleanupAudioTracks();

        if (isCanceledRef.current) {
          console.log('[MediaRecorder] Recording discarded by user');
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log(`[MediaRecorder] Audio blob compiled. Size: ${audioBlob.size} bytes`);
        if (audioBlob.size < 2000) {
          setErrorMsg('No speech detected. Please speak louder or longer.');
          return;
        }

        await uploadAudioBlob(audioBlob, mimeType);
      };

      mediaRecorder.start();
    } catch (err: any) {
      console.error('[MediaRecorder Initialization Error]', err);
      handleSpeechError(err);
    }
  };

  // 4. Stop voice recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  // 5. Cancel voice recording
  const cancelRecording = () => {
    isCanceledRef.current = true;
    stopRecording();
    setErrorMsg(null);
    setTranscript('');
  };

  // 6. Clean up active audio streams
  const cleanupAudioTracks = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log(`[Audio Track Cleanup] Stopped: ${track.label}`);
      });
      audioStreamRef.current = null;
    }
  };

  // 7. Ingest audio recording payload to backend Gemini API
  const uploadAudioBlob = async (blob: Blob, mimeType: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      console.info('[Voice Ingestion] Uploading audio recording to backend...');
      const res = await api.post(`/chatbot/audio?language=${i18n.language}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        const { transcript: userQuestion, reply, originalEnglishReply } = res.data;
        console.log('[Voice Ingestion Ingested Text]', userQuestion);
        setTranscript(`Q: "${userQuestion}" \n\nA: ${reply}`);
        
        console.info('[AI Debug: Original English Reply]', originalEnglishReply);
        speakAloud(reply);
      }
    } catch (err: any) {
      console.error('[Voice Ingestion Error]', err);
      setErrorMsg(err.response?.data?.message || 'Server connection error during audio sync.');
    } finally {
      setLoading(false);
    }
  };

  // 8. Process plain text queries (SpeechRecognition Result)
  const processVoiceCommand = async (text: string) => {
    setLoading(true);
    try {
      console.info('[Voice Process Command] Sending transcript:', text);
      const res = await api.post('/chatbot/message', {
        message: text,
        history: [],
        language: i18n.language
      });

      if (res.data && res.data.success) {
        const reply = res.data.reply;
        console.info('[AI Debug: Original English Reply]', res.data.originalEnglishReply);
        
        setTranscript(`Q: "${text}" \n\nA: ${reply}`);
        speakAloud(reply);
      }
    } catch (err: any) {
      console.error('[Voice Process Command Error]', err);
      setErrorMsg(err.response?.data?.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // 9. Speak AI Response Aloud
  const speakAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const cleanText = text.replace(/[*#`_\-]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = getLanguageLocale(i18n.language);

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      const voices = window.speechSynthesis.getVoices();
      const targetPrefix = i18n.language;
      const matchedVoice = voices.find(v => v.lang.startsWith(targetPrefix));
      if (matchedVoice) utterance.voice = matchedVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  // 10. Toggle button handler
  const toggleListen = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {/* Transcript / Result Overlay */}
      {transcript && (
        <div className="max-w-xs md:max-w-sm px-4 py-3 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 shadow-xl rounded-2xl rounded-br-none text-xs md:text-sm text-gray-700 dark:text-dark-200 animate-slide-up pointer-events-auto">
          <p className="font-bold text-[10px] text-brand-600 dark:text-brand-400 mb-1 uppercase tracking-wider">Voice Assistant</p>
          <p className="whitespace-pre-line leading-relaxed max-h-[150px] overflow-y-auto pr-1">{transcript}</p>
        </div>
      )}

      {/* Error Alert Overlay */}
      {errorMsg && (
        <div className="max-w-xs px-4 py-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 shadow-xl rounded-2xl rounded-br-none text-[11px] text-red-600 dark:text-red-400 font-semibold pointer-events-auto flex items-center justify-between gap-2">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 transition-colors">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Recording Wave Visualizer & Cancellation Controls */}
      {isListening && (
        <div className="flex items-center gap-2 pointer-events-auto animate-slide-up">
          <button
            type="button"
            onClick={cancelRecording}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors shadow-md"
            title="Cancel Recording"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-3.5 py-2 rounded-2xl text-[10px] text-red-600 dark:text-red-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span>Recording...</span>
            <div className="flex gap-0.5 ml-1.5 items-end h-3">
              <span className="w-0.5 bg-red-400 animate-bar-wave-1 rounded-full"></span>
              <span className="w-0.5 bg-red-400 animate-bar-wave-2 rounded-full"></span>
              <span className="w-0.5 bg-red-400 animate-bar-wave-3 rounded-full"></span>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Action Button */}
      <button
        onClick={toggleListen}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-auto transition-transform duration-200 hover:scale-105 active:scale-95 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
            : isSpeaking 
            ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
            : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/20'
        }`}
        title={isSpeaking ? 'Stop Speaking' : isListening ? 'Stop Recording' : 'Voice Assistant'}
      >
        {loading ? (
          <Loader2 size={24} className="animate-spin" />
        ) : isSpeaking ? (
          <VolumeX size={24} />
        ) : isListening ? (
          <Square size={20} className="fill-white" />
        ) : (
          <Mic size={24} />
        )}
      </button>
    </div>
  );
};
