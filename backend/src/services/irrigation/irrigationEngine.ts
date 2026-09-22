import { NormalizedFarmContext } from '../CopilotContextService';
import { CropWaterRulesEngine, CropWaterProfile } from './cropWaterRules';

export type IrrigationStatusType =
  | 'NEEDS_ATTENTION'
  | 'LIKELY_NEEDED'
  | 'MONITOR'
  | 'LIKELY_NOT_NEEDED'
  | 'EXCESS_MOISTURE_RISK'
  | 'INSUFFICIENT_DATA';

export interface EvaluatedIrrigationResult {
  status: IrrigationStatusType;
  level: 'low' | 'moderate' | 'high';
  summary: string;
  reasons: string[];
  evidence: Array<{ label: string; value: string }>;
  recommendedActions: Array<{ title: string; priority: 'high' | 'medium' | 'low'; reason: string }>;
  timeframe: string;
  confidence: number;
  dataFreshness: {
    weatherUpdated: Date | null;
    lastIrrigationDate: Date | null;
    hasSoilMoisture: boolean;
  };
}

export class IrrigationEngine {
  /**
   * Evaluate multi-factor irrigation status
   */
  static evaluate(
    ctx: NormalizedFarmContext,
    predictiveSignals: any[] = [],
    lastIrrigationEvent: any = null
  ): EvaluatedIrrigationResult {
    const cropName = ctx.farm.crops[0]?.name || 'Crop';
    const profile: CropWaterProfile = CropWaterRulesEngine.getProfile(cropName);

    const temp = ctx.weather.tempCelsius;
    const rainProb = ctx.weather.rainProbability ?? 0;
    const humidity = ctx.weather.humidity ?? 50;
    const waterSource = ctx.farm.waterSource || 'Borewell';

    const lastIrrigatedDate = lastIrrigationEvent?.date ? new Date(lastIrrigationEvent.date) : null;
    const daysSinceLastIrrigation = lastIrrigatedDate
      ? Math.floor((Date.now() - lastIrrigatedDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Check Predictive Signals from Step 17
    const hasHeavyRainRisk = predictiveSignals.some(s => s.category === 'weather' && (s.level === 'high' || s.title.toLowerCase().includes('rain')));
    const hasWaterStressRisk = predictiveSignals.some(s => s.category === 'water' && (s.level === 'high' || s.level === 'moderate'));
    const hasHeatRisk = predictiveSignals.some(s => s.category === 'weather' && s.title.toLowerCase().includes('heat'));

    const evidence: Array<{ label: string; value: string }> = [
      { label: 'Crop Affected', value: profile.cropName },
      { label: 'Water Sensitivity', value: profile.waterSensitivity.toUpperCase() },
      { label: 'Current Temp', value: temp !== null ? `${temp}°C` : 'N/A' },
      { label: 'Rain Forecast', value: `${rainProb}%` },
      { label: 'Relative Humidity', value: `${humidity}%` },
      { label: 'Water Source', value: waterSource },
      { label: 'Last Irrigated', value: daysSinceLastIrrigation !== null ? `${daysSinceLastIrrigation} day(s) ago` : 'No Recent Log' },
      { label: 'Direct Soil Sensor', value: 'Unavailable (Manual Check Recommended)' }
    ];

    // 1. EXCESS MOISTURE RISK (Heavy Rain or Irrigated recently + High Rain Forecast)
    if (hasHeavyRainRisk || rainProb >= 75) {
      return {
        status: 'EXCESS_MOISTURE_RISK',
        level: 'high',
        summary: `Heavy rainfall forecast (${rainProb}%) detected. Additional irrigation presents high excess moisture and root asphyxiation risk for ${profile.cropName}.`,
        reasons: [
          `Forecast indicates a ${rainProb}% precipitation probability.`,
          `Excess moisture can lead to root rot and nutrient leaching.`,
          daysSinceLastIrrigation !== null ? `Field was already irrigated ${daysSinceLastIrrigation} day(s) ago.` : 'No irrigation needed before precipitation.'
        ],
        evidence,
        recommendedActions: [
          { title: 'Postpone All Planned Irrigation', priority: 'high', reason: 'Prevents waterlogging and conserves energy.' },
          { title: 'Inspect Field Drainage Channels', priority: 'high', reason: 'Ensures excess rainwater drains out of the root zone.' }
        ],
        timeframe: 'Next 24-72 Hours',
        confidence: 0.92,
        dataFreshness: {
          weatherUpdated: new Date(),
          lastIrrigationDate: lastIrrigatedDate,
          hasSoilMoisture: false
        }
      };
    }

    // 2. LIKELY NOT NEEDED (Imminent moderate rain OR recently irrigated within 2 days)
    if (rainProb >= 50 || (daysSinceLastIrrigation !== null && daysSinceLastIrrigation <= 2)) {
      return {
        status: 'LIKELY_NOT_NEEDED',
        level: 'low',
        summary: `Irrigation is likely unnecessary today. Rain probability is ${rainProb}% and recent field moisture is adequate.`,
        reasons: [
          rainProb >= 50 ? `Precipitation probability is moderate (${rainProb}%).` : `Irrigation logged ${daysSinceLastIrrigation} day(s) ago.`,
          `Direct soil moisture sensors are unavailable; manual moisture check advised.`
        ],
        evidence,
        recommendedActions: [
          { title: 'Check Root Zone Soil Moisture Before Watering', priority: 'medium', reason: 'Squeeze soil sample at 10cm depth to verify retention.' }
        ],
        timeframe: 'Today',
        confidence: 0.88,
        dataFreshness: {
          weatherUpdated: new Date(),
          lastIrrigationDate: lastIrrigatedDate,
          hasSoilMoisture: false
        }
      };
    }

    // 3. NEEDS ATTENTION / LIKELY NEEDED (High heat, no recent rain, high crop water sensitivity, or > max dry days)
    if (hasWaterStressRisk || (temp !== null && temp >= 34) || (daysSinceLastIrrigation !== null && daysSinceLastIrrigation >= profile.maxDryPeriodDays)) {
      return {
        status: daysSinceLastIrrigation && daysSinceLastIrrigation >= profile.maxDryPeriodDays ? 'NEEDS_ATTENTION' : 'LIKELY_NEEDED',
        level: 'high',
        summary: `Increased water demand detected for ${profile.cropName} due to elevated temperatures (${temp}°C) and low rainfall forecast (${rainProb}%).`,
        reasons: [
          `Ambient temperature (${temp}°C) drives high crop transpiration.`,
          `Low rainfall forecast (${rainProb}%).`,
          profile.notes
        ],
        evidence,
        recommendedActions: [
          { title: 'Schedule Early Morning Irrigation', priority: 'high', reason: 'Minimizes water loss to midday evaporation.' },
          { title: 'Inspect Crop Canopy for Wilting Symptoms', priority: 'medium', reason: 'Early detection prevents yield penalty at critical growth stages.' }
        ],
        timeframe: 'Today',
        confidence: 0.9,
        dataFreshness: {
          weatherUpdated: new Date(),
          lastIrrigationDate: lastIrrigatedDate,
          hasSoilMoisture: false
        }
      };
    }

    // 4. MONITOR (Default stable status)
    return {
      status: 'MONITOR',
      level: 'moderate',
      summary: `Current environmental moisture balance for ${profile.cropName} is stable. Continue routine monitoring.`,
      reasons: [
        `Weather conditions are stable (${temp}°C, Humidity ${humidity}%).`,
        `Rain probability is low (${rainProb}%).`,
        `Direct soil moisture data is unavailable. Check soil before watering.`
      ],
      evidence,
      recommendedActions: [
        { title: 'Check Soil Moisture Manually', priority: 'medium', reason: 'Determines exact watering requirement.' },
        { title: 'Review Forecast Tomorrow Morning', priority: 'low', reason: 'Adjusts schedule to incoming weather updates.' }
      ],
      timeframe: 'Next 24 Hours',
      confidence: 0.85,
      dataFreshness: {
        weatherUpdated: new Date(),
        lastIrrigationDate: lastIrrigatedDate,
        hasSoilMoisture: false
      }
    };
  }
}
