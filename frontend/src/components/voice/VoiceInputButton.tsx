import React from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpeechRecognition, type SpeechRecognitionState } from '../../hooks/useSpeechRecognition';

export interface VoiceInputButtonProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  lang?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  title?: string;
  showTextFeedback?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  onError,
  lang,
  size = 'md',
  className = '',
  disabled = false,
  title,
  showTextFeedback = false,
}) => {
  const { t, i18n } = useTranslation();

  const {
    isSupported,
    state,
    isListening,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    cancelListening,
    currentLocale,
  } = useSpeechRecognition({
    lang: lang || i18n.language,
    onTranscript: (text, isFinal) => {
      onTranscript(text, isFinal);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size];

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 22,
  }[size];

  const getAriaLabel = () => {
    if (isListening) return t('voice.stop_recording') || 'Stop recording';
    if (!isSupported) return t('voice.not_supported') || 'Voice input not supported';
    return t('voice.speak_to_type') || 'Click to speak';
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || !isSupported}
        aria-label={getAriaLabel()}
        title={
          title ||
          (isListening
            ? `${t('voice.listening') || 'Listening...'} (${currentLocale})`
            : !isSupported
            ? t('voice.not_supported') || 'Speech recognition not supported in this browser'
            : `${t('voice.speak_to_type') || 'Speak to type'} (${currentLocale})`)
        }
        className={`relative flex items-center justify-center rounded-xl font-bold transition-all duration-200 select-none shadow-xs ${sizeClasses} ${
          isListening
            ? 'bg-red-600 text-white animate-pulse shadow-red-500/30 shadow-md ring-4 ring-red-400/30'
            : state === 'processing'
            ? 'bg-amber-600 text-white shadow-amber-500/30'
            : state === 'error'
            ? 'bg-red-100 text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-800'
            : !isSupported
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-800 dark:text-dark-600'
            : 'bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-brand-400 border border-brand-200/60 dark:border-dark-700 hover:scale-105 active:scale-95'
        } ${className}`}
      >
        {isListening ? (
          <Square size={iconSizes - 2} className="fill-white" />
        ) : state === 'processing' ? (
          <Loader2 size={iconSizes} className="animate-spin" />
        ) : state === 'error' ? (
          <AlertCircle size={iconSizes} />
        ) : (
          <Mic size={iconSizes} />
        )}

        {/* Audio Wave Visualizer when listening */}
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Popover feedback when listening and showTextFeedback is enabled */}
      {showTextFeedback && isListening && (
        <div className="absolute right-0 bottom-full mb-2 z-50 min-w-[220px] max-w-xs p-2.5 bg-white dark:bg-dark-900 border border-brand-300 dark:border-brand-700 rounded-2xl shadow-xl animate-fade-in text-left">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-100 dark:border-dark-800">
            <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span>{t('voice.listening') || 'Listening...'}</span>
            </div>
            <button
              type="button"
              onClick={cancelListening}
              className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-dark-200 font-semibold"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
          </div>
          <p className="text-xs text-gray-700 dark:text-dark-200 italic pt-1.5 min-h-[28px]">
            {interimTranscript || t('voice.speak_now') || 'Speak now...'}
          </p>
        </div>
      )}

      {/* Popover feedback on error */}
      {showTextFeedback && errorMessage && (
        <div className="absolute right-0 bottom-full mb-2 z-50 min-w-[220px] max-w-xs p-2.5 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900 rounded-2xl shadow-xl text-left">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
