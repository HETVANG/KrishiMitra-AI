export type IrrigationVisualStatus =
  | 'INSUFFICIENT_DATA'
  | 'NEEDS_ATTENTION'
  | 'LIKELY_NEEDED'
  | 'MONITOR'
  | 'LIKELY_NOT_NEEDED'
  | 'EXCESS_MOISTURE_RISK'
  | 'IRRIGATION_ACTIVE';

export type IrrigationVisualMethod = 'drip' | 'sprinkler' | 'flood' | 'manual' | 'none';

export type SoilMoistureVisualLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXCESS' | 'UNKNOWN';

export interface NormalizedIrrigationVisual {
  status: IrrigationVisualStatus;
  level: 'low' | 'moderate' | 'high';
  method: IrrigationVisualMethod;
  soilMoistureLevel: SoilMoistureVisualLevel;
  measuredMoisturePercent?: number; // Only set if actual telemetry data exists!
  isRaining: boolean;
  cropType: string;
  soilType: string;
  hasSoilMoistureData: boolean;
  summary: string;
  timeframe: string;
}

export const NEUTRAL_IRRIGATION_VISUAL: NormalizedIrrigationVisual = {
  status: 'INSUFFICIENT_DATA',
  level: 'moderate',
  method: 'none',
  soilMoistureLevel: 'UNKNOWN',
  isRaining: false,
  cropType: 'general',
  soilType: 'loam',
  hasSoilMoistureData: false,
  summary: 'No active hydro-telemetry payload available',
  timeframe: 'Today',
};

/**
 * Resolves verified irrigation recommendation and event payload into normalized visual state.
 * Strictly avoids fabricating soil moisture numbers or irrigation events if missing.
 */
export function resolveIrrigationState(
  recommendation: any,
  recentEvents: any[] = [],
  contextSummary: any = {}
): NormalizedIrrigationVisual {
  if (!recommendation && recentEvents.length === 0) {
    return NEUTRAL_IRRIGATION_VISUAL;
  }

  const rawStatus = (recommendation?.status || 'INSUFFICIENT_DATA') as IrrigationVisualStatus;
  const level = recommendation?.level || 'moderate';
  const summary = recommendation?.summary || 'Hydro-telemetry evaluation active';
  const timeframe = recommendation?.timeframe || 'Today';

  // Determine active/recent method from logged events
  let method: IrrigationVisualMethod = 'none';
  if (recentEvents && recentEvents.length > 0) {
    const latest = recentEvents[0];
    const m = (latest?.method || '').toLowerCase();
    if (m.includes('drip')) method = 'drip';
    else if (m.includes('sprinkler')) method = 'sprinkler';
    else if (m.includes('flood')) method = 'flood';
    else if (m.includes('manual')) method = 'manual';
    else method = 'drip'; // default if method present
  }

  // Parse evidence list for measured soil moisture if explicitly present
  let measuredMoisturePercent: number | undefined = undefined;
  let hasSoilMoistureData = Boolean(recommendation?.dataFreshness?.hasSoilMoisture);

  if (Array.isArray(recommendation?.evidence)) {
    for (const item of recommendation.evidence) {
      if (item.label?.toLowerCase().includes('moisture')) {
        const match = item.value?.match(/(\d+)%/);
        if (match) {
          measuredMoisturePercent = parseInt(match[1], 10);
          hasSoilMoistureData = true;
          break;
        }
      }
    }
  }

  // Derive soil moisture visual category strictly from data signals
  let soilMoistureLevel: SoilMoistureVisualLevel = 'UNKNOWN';
  if (measuredMoisturePercent !== undefined) {
    if (measuredMoisturePercent < 25) soilMoistureLevel = 'LOW';
    else if (measuredMoisturePercent <= 60) soilMoistureLevel = 'MODERATE';
    else if (measuredMoisturePercent <= 85) soilMoistureLevel = 'HIGH';
    else soilMoistureLevel = 'EXCESS';
  } else if (rawStatus === 'EXCESS_MOISTURE_RISK') {
    soilMoistureLevel = 'EXCESS';
  } else if (rawStatus === 'NEEDS_ATTENTION' || rawStatus === 'LIKELY_NEEDED') {
    soilMoistureLevel = 'LOW';
  } else if (rawStatus === 'LIKELY_NOT_NEEDED' || rawStatus === 'MONITOR') {
    soilMoistureLevel = 'MODERATE';
  }

  const isRaining = Boolean(contextSummary?.isRaining || contextSummary?.weather?.condition?.toLowerCase().includes('rain'));
  const cropType = contextSummary?.crop || contextSummary?.cropType || 'wheat';
  const soilType = contextSummary?.soilType || 'loam';

  return {
    status: rawStatus,
    level,
    method,
    soilMoistureLevel,
    measuredMoisturePercent,
    isRaining,
    cropType,
    soilType,
    hasSoilMoistureData,
    summary,
    timeframe,
  };
}
