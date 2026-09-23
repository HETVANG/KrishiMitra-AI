import { TemperatureUnit, LandAreaUnit, WeightUnit, VolumeUnit } from '../config/regions/regionTypes';

/**
 * Temperature Conversion
 */
export const convertTemperature = (val: number, from: TemperatureUnit, to: TemperatureUnit): number => {
  if (from === to || isNaN(val)) return Number(val.toFixed(1));
  if (from === 'C' && to === 'F') {
    return Number(((val * 9) / 5 + 32).toFixed(1));
  }
  if (from === 'F' && to === 'C') {
    return Number((((val - 32) * 5) / 9).toFixed(1));
  }
  return val;
};

/**
 * Land Area Conversion
 * 1 Hectare = 2.47105 Acres = 10,000 sq_meter = ~4 Bigha (standardized)
 */
export const convertArea = (val: number, from: LandAreaUnit, to: LandAreaUnit): number => {
  if (from === to || isNaN(val)) return Number(val.toFixed(2));

  // Convert from input unit to acres first as base
  let acres = val;
  if (from === 'hectare') acres = val * 2.47105;
  else if (from === 'sq_meter') acres = val / 4046.86;
  else if (from === 'bigha') acres = val * 0.619; // Standard Pakka Bigha average

  // Convert from acres to target unit
  if (to === 'acre') return Number(acres.toFixed(2));
  if (to === 'hectare') return Number((acres / 2.47105).toFixed(2));
  if (to === 'sq_meter') return Number((acres * 4046.86).toFixed(1));
  if (to === 'bigha') return Number((acres / 0.619).toFixed(2));

  return Number(val.toFixed(2));
};

/**
 * Weight Conversion
 * 1 Quintal = 100 kg
 * 1 Ton = 1000 kg = 2204.62 lbs
 */
export const convertWeight = (val: number, from: WeightUnit, to: WeightUnit): number => {
  if (from === to || isNaN(val)) return Number(val.toFixed(2));

  let kg = val;
  if (from === 'quintal') kg = val * 100;
  else if (from === 'ton') kg = val * 1000;
  else if (from === 'lb') kg = val * 0.453592;

  if (to === 'kg') return Number(kg.toFixed(2));
  if (to === 'quintal') return Number((kg / 100).toFixed(2));
  if (to === 'ton') return Number((kg / 1000).toFixed(3));
  if (to === 'lb') return Number((kg / 0.453592).toFixed(1));

  return Number(val.toFixed(2));
};

/**
 * Volume Conversion
 * 1 Gallon = 3.78541 Liters
 */
export const convertVolume = (val: number, from: VolumeUnit, to: VolumeUnit): number => {
  if (from === to || isNaN(val)) return Number(val.toFixed(2));

  let liters = val;
  if (from === 'gallon') liters = val * 3.78541;

  if (to === 'liter') return Number(liters.toFixed(2));
  if (to === 'gallon') return Number((liters / 3.78541).toFixed(2));

  return Number(val.toFixed(2));
};
