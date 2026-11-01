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

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem */}
      <div 
        className={`${emblemSizes[size]} relative flex items-center justify-center rounded-xl bg-brand-700 dark:bg-brand-800 text-white shadow-sm shadow-brand-900/10 shrink-0 overflow-hidden transition-transform duration-200`}
        aria-hidden="true"
      >
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          className="w-full h-full p-1"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vertical crop stem */}
          <path 
            d="M14 11C14 10.4477 14.4477 10 15 10H18C18.5523 10 19 10.4477 19 11V37C19 37.5523 18.5523 38 18 38H15C14.4477 38 14 37.5523 14 37V11Z" 
            fill="#F7F9F5"
          />
          {/* Leaf blade (rising sunlight angle) */}
          <path 
            d="M19 25C21.5 22 26 16.5 33.5 13C34.2 12.7 35 13.3 34.8 14.1C33.2 20 29.5 25.5 25.2 27.8L19 25Z" 
            fill="#A5C96A"
          />
          {/* Terraced furrow line */}
          <path 
            d="M22.5 24L33.2 36.2C33.7 36.8 33.3 37.8 32.5 37.8H27.8C27.3 37.8 26.8 37.5 26.5 37.1L19 28V24H22.5Z" 
            fill="#4F8A4B"
          />
          {/* Apex growth node */}
          <circle cx="16.5" cy="11.5" r="1.5" fill="#A5C96A" />
        </svg>
      </div>

      {/* Typography Text block (hidden if symbol only) */}
      {variant !== 'symbol' && (
        <div className="flex flex-col text-left leading-tight">
          <span 
            className={`font-black tracking-tight ${titleSizes[size]} text-slate-900 dark:text-dark-50`}
          >
            {BRAND.name}
          </span>
          {showTagline && (
            <span 
              className={`font-bold tracking-wider uppercase text-brand-700 dark:text-brand-400 ${subtitleSizes[size]}`}
            >
              Smart Agriculture
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
