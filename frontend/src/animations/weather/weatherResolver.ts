import type { EnvironmentWeatherState } from '../types/animationTypes';

export interface ResolvedWeatherVisual {
  weatherState: EnvironmentWeatherState;
  isNight: boolean;
  rainIntensity: number; // 0.0 (none) to 1.0 (heavy storm)
  windSpeed: number; // 0.0 to 1.0
  cloudCoverage: number; // 0.0 to 1.0
  fogDensity: number; // 0.0 to 1.0
  sunlightIntensity: number; // 0.0 to 1.2
  skyColorTop: string;
  skyColorBottom: string;
  isWetGround: boolean;
  isStorm: boolean;
}

export const NEUTRAL_WEATHER_VISUAL: ResolvedWeatherVisual = {
  weatherState: 'CLEAR',
  isNight: false,
  rainIntensity: 0.0,
  windSpeed: 0.2,
  cloudCoverage: 0.2,
  fogDensity: 0.0,
  sunlightIntensity: 1.0,
  skyColorTop: '#7ab8d6',
  skyColorBottom: '#e2f0d9',
  isWetGround: false,
  isStorm: false,
};

/**
 * Deterministically resolves real weather telemetry into normalized 3D visual parameters.
 * Does NOT invent weather conditions if data is missing or invalid.
 */
export function resolveWeatherState(weatherData: any): ResolvedWeatherVisual {
  if (!weatherData) return NEUTRAL_WEATHER_VISUAL;

  const current = weatherData.current || weatherData;
  if (!current || typeof current !== 'object') return NEUTRAL_WEATHER_VISUAL;

  const condition = String(current.condition || current.description || '').toLowerCase();
  const temp = typeof current.temp === 'number' ? current.temp : 25;
  const rainProb = typeof current.rainProb === 'number' ? current.rainProb : 0;
  const windSpeedKm = typeof current.windSpeed === 'number' ? current.windSpeed : 8;
  const isNight = current.isDay === 0 || current.is_day === 0;

  let state: EnvironmentWeatherState = 'CLEAR';
  let rainIntensity = 0.0;
  let cloudCoverage = 0.25;
  let fogDensity = 0.0;
  let sunlightIntensity = isNight ? 0.2 : 1.0;
  let isStorm = false;

  // Evaluate condition string & telemetry values
  if (condition.includes('thunder') || condition.includes('storm') || condition.includes('squall')) {
    state = 'STORM';
    rainIntensity = 0.95;
    cloudCoverage = 0.95;
    sunlightIntensity = 0.25;
    isStorm = true;
  } else if (condition.includes('heavy rain') || (rainProb > 75 && condition.includes('rain'))) {
    state = 'HEAVY_RAIN';
    rainIntensity = 0.8;
    cloudCoverage = 0.85;
    sunlightIntensity = 0.4;
  } else if (condition.includes('rain') || condition.includes('drizzle') || rainProb > 45) {
    state = condition.includes('drizzle') || rainProb < 60 ? 'LIGHT_RAIN' : 'RAIN';
    rainIntensity = state === 'LIGHT_RAIN' ? 0.35 : 0.6;
    cloudCoverage = 0.7;
    sunlightIntensity = 0.55;
  } else if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) {
    state = 'FOG';
    fogDensity = 0.6;
    cloudCoverage = 0.5;
    sunlightIntensity = 0.6;
  } else if (condition.includes('overcast')) {
    state = 'OVERCAST';
    cloudCoverage = 0.9;
    sunlightIntensity = 0.5;
  } else if (condition.includes('cloud')) {
    state = condition.includes('partly') ? 'PARTLY_CLOUDY' : 'CLOUDY';
    cloudCoverage = state === 'PARTLY_CLOUDY' ? 0.45 : 0.75;
    sunlightIntensity = state === 'PARTLY_CLOUDY' ? 0.85 : 0.65;
  } else if (temp > 38) {
    state = 'HOT/SUNNY' as any;
    sunlightIntensity = 1.2;
    cloudCoverage = 0.1;
  } else {
    state = 'CLEAR';
    cloudCoverage = 0.2;
    sunlightIntensity = isNight ? 0.2 : 1.0;
  }

  if (isNight) {
    state = 'NIGHT';
    sunlightIntensity = 0.15;
  }

  // Sky color gradients
  let skyColorTop = '#7ab8d6';
  let skyColorBottom = '#e2f0d9';

  if (isNight) {
    skyColorTop = '#0a111e';
    skyColorBottom = '#1c2838';
  } else if (state === 'STORM' || state === 'HEAVY_RAIN') {
    skyColorTop = '#3a4652';
    skyColorBottom = '#606e7a';
  } else if (state === 'RAIN' || state === 'OVERCAST' || state === 'CLOUDY') {
    skyColorTop = '#5c7385';
    skyColorBottom = '#9ab1c2';
  } else if (state === ('HOT/SUNNY' as any)) {
    skyColorTop = '#5faee3';
    skyColorBottom = '#fff2cd';
  }

  const normalizedWindSpeed = Math.min(1.0, windSpeedKm / 40);

  return {
    weatherState: state,
    isNight,
    rainIntensity,
    windSpeed: normalizedWindSpeed,
    cloudCoverage,
    fogDensity,
    sunlightIntensity,
    skyColorTop,
    skyColorBottom,
    isWetGround: rainIntensity > 0.2,
    isStorm,
  };
}
