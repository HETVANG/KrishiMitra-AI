import React from 'react';
import { BRAND } from '../config/brand';

interface BrandLogoProps {
  variant?: 'horizontal' | 'symbol' | 'compact';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  theme = 'auto',
  className = '',
  size = 'md',
  showTagline = true,
}) => {
  // Dimension maps
  const emblemSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base md:text-lg',
    lg: 'text-xl md:text-2xl',
    xl: 'text-2xl md:text-3xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-xs md:text-sm',
  };

  const isWhiteText = className.includes('text-white') || theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem: Official Farmer Ploughing with Two Oxen */}
      <div 
        className={`${emblemSizes[size]} relative flex items-center justify-center rounded-xl bg-brand-700 dark:bg-brand-800 text-white shadow-sm shadow-brand-900/10 shrink-0 overflow-hidden transition-transform duration-200`}
        aria-hidden="true"
      >
        <svg 
          viewBox="0 0 64 64" 
          fill="none" 
          className="w-full h-full p-0.5"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Dawn Sun Aura */}
          <circle cx="21" cy="22" r="8" fill="#A5C96A" fillOpacity="0.3" />

          {/* Furrowed Soil Base Lines */}
          <path d="M6 52 C16 50 28 53 40 51 C48 50 56 52 60 51" stroke="#A5C96A" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M10 56 C20 54 32 57 44 55 C52 54 58 56 61 55" stroke="#4F8A4B" strokeWidth="1.2" strokeLinecap="round"/>

          {/* Indian Farmer (Khedut with Turban, Angrakha and Dhoti) */}
          <circle cx="17.5" cy="23" r="3.6" fill="#FFFFFF"/>
          <path d="M14 23.5 C14 20.8 21 20.8 21 23.5 C21 25 14 25 14 23.5 Z" fill="#A5C96A"/>
          <path d="M15 26.5 L19.5 26.5 L21.5 39 L14 39 Z" fill="#FFFFFF"/>
          <path d="M18 29 L25 33 L24 34.5 L17 30.5 Z" fill="#FFFFFF"/>
          <path d="M14 39 L17 51 L19 51 L17.5 39 Z" fill="#FFFFFF"/>
          <path d="M18.5 39 L22 50.5 L24 50.5 L21 39 Z" fill="#FFFFFF"/>

          {/* Traditional Plough (Hal) */}
          <path d="M24 32.5 L30 46 L28.5 46.5 L22.5 33 Z" fill="#A5C96A"/>
          <path d="M28 45 L34 46.5 L29.5 52 L26.5 50 Z" fill="#FFFFFF"/>
          <path d="M29.5 45.5 L46 31.5 L47 32.8 L30.5 46.8 Z" fill="#A5C96A"/>

          {/* Wooden Yoke (Dhoonsari) */}
          <path d="M37 30 L54 28.5 L54 30.2 L37 31.7 Z" fill="#FFFFFF"/>

          {/* Ox 2 (Background Bullock) */}
          <path d="M38 28.5 C37 24.5 40 21.5 43 23.5 C45 25 46 27.5 46 29.5 Z" fill="#4F8A4B"/>
          <path d="M46 22.5 C48 17.5 51 13.5 53 11.5 C52 14.5 50 18.5 48 23.5 Z" fill="#A5C96A"/>
          <path d="M44 25.5 C46 23.5 50 23.5 52 26.5 C53 28 51 30.5 49 30.5 Z" fill="#4F8A4B"/>
          <path d="M34 32.5 C33 29.5 36 27.5 39 28.5 L45 32.5 L44 42 L33 42 C32 37.5 33 33.5 34 32.5 Z" fill="#4F8A4B"/>
          <path d="M35 42 L36.5 50 L38 50 L37 42 Z" fill="#4F8A4B"/>
          <path d="M42 42 L43.5 49 L45 49 L44 42 Z" fill="#4F8A4B"/>

          {/* Ox 1 (Foreground Lead Bullock - Majestic Zebu Silhouette) */}
          <path d="M42 26.5 C41 21.5 45 18.5 48.5 20.5 C51 22 52 25.5 52 27.5 Z" fill="#FFFFFF"/>
          <path d="M52 19.5 C54 14.5 58 10.5 60 8.5 C59 12.5 57 16.5 54.5 21.5 Z" fill="#A5C96A"/>
          <path d="M50 19.5 C51 15.5 53 12.5 55 10.5 C54 13.5 53 16.5 51.5 20.5 Z" fill="#A5C96A"/>
          <path d="M49 22.5 C52 21.5 56 21.5 58 24.5 C59.5 26.5 58 29 55 29.5 L52 28.5 Z" fill="#FFFFFF"/>
          <path d="M41 30.5 C38 30.5 37 32.5 37 35.5 C37 39.5 40 42.5 45 42.5 L54 40.5 C56 38.5 57 33.5 55 29.5 C53 27.5 47 27.5 42 30.5 Z" fill="#FFFFFF"/>
          <path d="M50 40.5 L53 50.5 L54.5 50.5 L52 40.5 Z" fill="#FFFFFF"/>
          <path d="M53 40.5 L56.5 49.5 L58 49.5 L55 40.5 Z" fill="#FFFFFF"/>
          <path d="M38 38.5 L39.5 50.5 L41 50.5 L40 40.5 Z" fill="#FFFFFF"/>
          <path d="M41 40.5 L43 50 L44.5 50 L43 40.5 Z" fill="#FFFFFF"/>
        </svg>
      </div>

      {/* Typography Text block (hidden if symbol only) */}
      {variant !== 'symbol' && (
        <div className="flex flex-col text-left leading-tight">
          <span 
            className={`font-black tracking-tight ${titleSizes[size]} ${isWhiteText ? 'text-white' : 'text-slate-900 dark:text-dark-50'}`}
          >
            {BRAND.name}
          </span>
          {showTagline && (
            <span 
              className={`font-bold tracking-wider uppercase ${isWhiteText ? 'text-brand-200' : 'text-brand-700 dark:text-brand-400'} ${subtitleSizes[size]}`}
            >
              {BRAND.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
