import React, { useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VoiceInputButton } from './VoiceInputButton';

export interface VoiceInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange: (value: string) => void;
  onClear?: () => void;
  onSubmitVoice?: (finalText: string) => void;
  icon?: React.ReactNode;
  containerClassName?: string;
  voiceLang?: string;
  enableVoice?: boolean;
}

export const VoiceInputField: React.FC<VoiceInputFieldProps> = ({
  value = '',
  onValueChange,
  onClear,
  onSubmitVoice,
  icon = <Search size={16} className="text-gray-400" />,
  containerClassName = '',
  voiceLang,
  enableVoice = true,
  placeholder,
  className = '',
  disabled,
  ...props
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [interimText, setInterimText] = useState<string>('');

  const stringVal = typeof value === 'string' ? value : String(value || '');

  const handleTranscript = (text: string, isFinal: boolean) => {
    if (!isFinal) {
      setInterimText(text);
    } else {
      setInterimText('');
      const combined = stringVal ? `${stringVal} ${text}`.trim() : text;
      onValueChange(combined);
      if (onSubmitVoice) {
        onSubmitVoice(combined);
      }
    }
  };

  const handleClear = () => {
    onValueChange('');
    setInterimText('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center w-full ${containerClassName}`}>
      {/* Leading Icon */}
      {icon && (
        <div className="absolute left-3.5 flex items-center pointer-events-none z-10">
          {icon}
        </div>
      )}

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={interimText ? `${stringVal} [${interimText}]` : stringVal}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder || t('search.placeholder') || 'Search crops, diseases, mandi prices...'}
        disabled={disabled}
        className={`w-full py-2.5 ${icon ? 'pl-10' : 'pl-3.5'} ${
          enableVoice ? 'pr-20' : 'pr-10'
        } bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-750 rounded-2xl text-xs md:text-sm text-gray-800 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all ${className}`}
        {...props}
      />

      {/* Action Buttons: Clear & Voice */}
      <div className="absolute right-2 flex items-center gap-1">
        {stringVal && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-dark-200 rounded-lg transition-colors"
            title={t('common.clear') || 'Clear'}
            aria-label="Clear input text"
          >
            <X size={15} />
          </button>
        )}

        {enableVoice && (
          <VoiceInputButton
            onTranscript={handleTranscript}
            lang={voiceLang}
            size="sm"
            disabled={disabled}
            showTextFeedback
          />
        )}
      </div>
    </div>
  );
};
