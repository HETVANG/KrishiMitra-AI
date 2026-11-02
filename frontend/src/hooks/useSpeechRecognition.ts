import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type SpeechRecognitionState = 'idle' | 'listening' | 'processing' | 'recognized' | 'error';

export interface UseSpeechRecognitionOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  lang?: string;
  continuous?: boolean;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  state: SpeechRecognitionState;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  startListening: (overrideLang?: string) => void;
  stopListening: () => void;
  cancelListening: () => void;
  resetTranscript: () => void;
  currentLocale: string;
}

export const getSpeechLocale = (lang: string): string => {
  const map: Record<string, string> = {
    en: 'en-IN',
    gu: 'gu-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
    pa: 'pa-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    or: 'or-IN',
    as: 'as-IN',
  };
  return map[lang] || 'gu-IN'; // Fallback to Indian English or regional
};

export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const { i18n, t } = useTranslation();
  const [state, setState] = useState<SpeechRecognitionState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isCanceledRef = useRef<boolean>(false);
  const timeoutRef = useRef<any>(null);

  const activeLang = options.lang || i18n.language || 'gu';
  const currentLocale = getSpeechLocale(activeLang);

  const isSupported = typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const getLocalizedErrorMessage = useCallback((errorType: string): string => {
    switch (errorType) {
      case 'not-allowed':
      case 'PermissionDeniedError':
      case 'NotAllowedError':
        return t('voice.permission_denied') || 'Microphone access denied. Please grant permission in your browser.';
      case 'no-speech':
        return t('voice.no_speech') || 'No speech detected. Please speak clearly into the microphone.';
      case 'network':
        return t('voice.network_error') || 'Network error occurred. Please check your internet connection.';
      case 'audio-capture':
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return t('voice.no_mic') || 'No microphone found. Please connect a microphone and try again.';
      case 'not-supported':
        return t('voice.not_supported') || 'Speech recognition is not supported in this browser. Please type your query.';
      case 'timeout':
        return t('voice.timeout') || 'Speech recognition timed out. Please tap the mic and try again.';
      default:
        return t('voice.generic_error') || 'Could not recognize speech. Please try speaking again.';
    }
  }, [t]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (recognitionRef.current) {
      try {
        setState('processing');
        recognitionRef.current.stop();
      } catch {
        setState('idle');
      }
    } else {
      setState('idle');
    }
  }, []);

  const cancelListening = useCallback(() => {
    isCanceledRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    setState('idle');
    setInterimTranscript('');
    setErrorMessage(null);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    setState('idle');
  }, []);

  const startListening = useCallback((overrideLang?: string) => {
    if (!isSupported) {
      const msg = getLocalizedErrorMessage('not-supported');
      setErrorMessage(msg);
      setState('error');
      options.onError?.(msg);
      return;
    }

    // Stop existing instance if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    isCanceledRef.current = false;
    setErrorMessage(null);
    setInterimTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = getSpeechLocale(overrideLang || activeLang);

    recognition.onstart = () => {
      setState('listening');
      // Safety auto-timeout after 15 seconds if silence
      timeoutRef.current = setTimeout(() => {
        if (!isCanceledRef.current) {
          stopListening();
        }
      }, 15000);
    };

    recognition.onresult = (event: any) => {
      if (isCanceledRef.current) return;

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
        options.onTranscript?.(interim, false);
      }

      if (final) {
        const cleaned = final.trim();
        setTranscript(prev => (prev ? `${prev} ${cleaned}` : cleaned));
        setInterimTranscript('');
        setState('recognized');
        options.onTranscript?.(cleaned, true);
      }
    };

    recognition.onerror = (event: any) => {
      if (isCanceledRef.current || event.error === 'aborted') {
        setState('idle');
        return;
      }
      console.warn('[The Khedut Speech] Recognition error:', event.error);
      const localizedError = getLocalizedErrorMessage(event.error);
      setErrorMessage(localizedError);
      setState('error');
      options.onError?.(localizedError);
    };

    recognition.onend = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!isCanceledRef.current && state !== 'error') {
        setState('idle');
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err: any) {
      console.error('[The Khedut Speech] Start error:', err);
      const msg = getLocalizedErrorMessage(err.name || 'generic');
      setErrorMessage(msg);
      setState('error');
      options.onError?.(msg);
    }
  }, [isSupported, activeLang, options, getLocalizedErrorMessage, state, stopListening]);

  return {
    isSupported,
    state,
    isListening: state === 'listening',
    transcript,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    cancelListening,
    resetTranscript,
    currentLocale,
  };
};
