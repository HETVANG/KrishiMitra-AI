import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketPriceChangeIndicatorProps {
  currentPrice: number | string;
  previousPrice?: number | string;
  currency?: string;
  unit?: string;
  className?: string;
}

export const MarketPriceChangeIndicator: React.FC<MarketPriceChangeIndicatorProps> = ({
  currentPrice,
  previousPrice,
  currency = '₹',
  unit = 'Qtl',
  className = '',
}) => {
  const currentNum = typeof currentPrice === 'number' ? currentPrice : parseFloat(String(currentPrice));
  const previousNum = previousPrice !== undefined ? (typeof previousPrice === 'number' ? previousPrice : parseFloat(String(previousPrice))) : undefined;

  // Strict validation: Only compute delta if both current and previous are valid positive numbers
  const isValid = !isNaN(currentNum) && currentNum > 0 && previousNum !== undefined && !isNaN(previousNum) && previousNum > 0;
  const diff = isValid && previousNum ? currentNum - previousNum : 0;
  const percentChange = isValid && previousNum ? ((diff / previousNum) * 100).toFixed(1) : undefined;

  const [animating, setAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (isValid && diff !== 0) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [currentNum, previousNum]);

  if (isNaN(currentNum) || currentNum <= 0) {
    return (
      <span className={`text-xs text-gray-400 font-semibold italic ${className}`}>
        Price Not Available
      </span>
    );
  }

  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className={`inline-flex items-center gap-1.5 transition-all duration-300 ${animating ? 'scale-105' : 'scale-100'} ${className}`}>
      <span className="font-black text-base md:text-lg text-gray-900 dark:text-dark-100">
        {currency}{currentNum.toLocaleString()}
        <span className="text-[10px] font-normal text-gray-500 dark:text-dark-400 ml-1">/{unit}</span>
      </span>

      {isValid && diff !== 0 && (
        <span
          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all duration-300 ${
            isUp
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
          }`}
        >
          {isUp ? <TrendingUp size={11} className="animate-bounce" /> : <TrendingDown size={11} className="animate-bounce" />}
          <span>
            {isUp ? '+' : ''}{diff.toLocaleString()} ({percentChange}%)
          </span>
        </span>
      )}
    </div>
  );
};
