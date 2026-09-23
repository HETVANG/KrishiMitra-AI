export type TemperatureUnit = 'C' | 'F';
export type LandAreaUnit = 'acre' | 'hectare' | 'bigha' | 'sq_meter';

/**
 * Format temperature from Celsius to preferred unit (°C or °F)
 */
export function formatTemperature(tempCelsius: number | null | undefined, unit: TemperatureUnit = 'C'): string {
  if (tempCelsius === null || tempCelsius === undefined) return 'N/A';
  if (unit === 'F') {
    const tempF = Math.round((tempCelsius * 9) / 5 + 32);
    return `${tempF}°F`;
  }
  return `${Math.round(tempCelsius)}°C`;
}

/**
 * Convert area in acres to preferred land area unit
 */
export function formatLandArea(areaAcres: number | null | undefined, unit: LandAreaUnit = 'acre'): string {
  if (areaAcres === null || areaAcres === undefined) return '0 acres';
  
  switch (unit) {
    case 'hectare': {
      const hectares = (areaAcres * 0.404686).toFixed(2);
      return `${hectares} ha`;
    }
    case 'bigha': {
      const bigha = (areaAcres * 1.6133).toFixed(1);
      return `${bigha} bigha`;
    }
    case 'sq_meter': {
      const sqM = Math.round(areaAcres * 4046.86);
      return `${sqM.toLocaleString()} m²`;
    }
    case 'acre':
    default:
      return `${areaAcres} acres`;
  }
}

/**
 * Format currency with fallback formatting
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'INR', symbol: string = '₹'): string {
  if (amount === null || amount === undefined) return `${symbol}0`;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${symbol}${amount.toLocaleString()}`;
  }
}
