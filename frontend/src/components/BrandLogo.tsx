import React from 'react';
import { BRAND } from '../config/brand';

interface BrandLogoProps {
  variant?: 'full' | 'horizontal' | 'symbol' | 'compact';
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
  const isWhiteText = className.includes('text-white') || theme === 'dark';

  // Full original logo heights
  const fullHeights = {
    sm: 'h-9 md:h-10',
    md: 'h-13 md:h-15',
    lg: 'h-20 md:h-24',
    xl: 'h-28 md:h-32',
  };

  // Cropped symbol dimensions
  const symbolSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-sm font-extrabold',
    md: 'text-base md:text-lg font-black',
    lg: 'text-xl md:text-2xl font-black',
    xl: 'text-2xl md:text-3xl font-black',
  };

  const subtitleSizes = {
    sm: 'text-[8.5px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-xs md:text-sm',
  };

  // Full master original artwork (Login, Register, PDF statements, Footer)
  if (variant === 'full' || (variant === 'horizontal' && (size === 'lg' || size === 'xl'))) {
    return (
      <div className={`inline-flex flex-col items-start select-none ${className}`}>
        <img
          src={isWhiteText ? '/brand/the-khedut-full-dark-theme.png' : '/brand/the-khedut-full-transparent.png'}
          alt="The Khedut"
          className={`${fullHeights[size]} w-auto object-contain shrink-0 transition-transform duration-200`}
          loading="eager"
        />
        {showTagline && size !== 'sm' && (
          <span className={`mt-1 font-bold tracking-wider uppercase ${isWhiteText ? 'text-brand-200' : 'text-brand-700 dark:text-brand-400'} ${subtitleSizes[size]}`}>
            {BRAND.tagline}
          </span>
        )}
      </div>
    );
  }

  // Symbol-only variant cropped from master artwork (Navbar mobile, compact badges)
  if (variant === 'symbol') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${symbolSizes[size]} select-none ${className}`}>
        <img
          src="/brand/the-khedut-symbol.png"
          alt="The Khedut"
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>
    );
  }

  // Horizontal variant (Sidebar, Desktop Navbar, Sub-headers)
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Cropped Symbol from Master Artwork */}
      <div className={`relative flex items-center justify-center shrink-0 ${symbolSizes[size]}`}>
        <img
          src="/brand/the-khedut-symbol.png"
          alt="The Khedut"
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>

      {/* Typography Text block */}
      <div className="flex flex-col text-left leading-tight">
        <span 
          className={`tracking-tight ${titleSizes[size]} ${isWhiteText ? 'text-white' : 'text-slate-900 dark:text-dark-50'}`}
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
    </div>
  );
};

export default BrandLogo;
