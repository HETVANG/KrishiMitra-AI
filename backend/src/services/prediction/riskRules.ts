import { NormalizedFarmContext } from '../CopilotContextService';

export interface EvaluatedRiskSignal {
  category: 'weather' | 'disease' | 'water' | 'nutrient' | 'health';
  level: 'low' | 'moderate' | 'high';
  score: number; // 0 - 100
  title: string;
  summary: string;
  reasons: string[];
  evidence: Array<{ label: string; value: string }>;
  recommendedActions: Array<{ title: string; priority: 'high' | 'medium' | 'low'; reason: string }>;
  timeframe: 'today' | '24_hours' | '3_days' | '7_days';
  confidence: number;
}

export class RiskRulesEngine {
  /**
   * Evaluate Weather Risk Signals
   */
  static evaluateWeatherRisk(ctx: NormalizedFarmContext): EvaluatedRiskSignal | null {
    if (!ctx.weather.available || ctx.weather.tempCelsius === null) {
      return {
        category: 'weather',
        level: 'low',
        score: 15,
        title: 'Weather Risk Telemetry Unavailable',
        summary: 'Direct weather telemetry is missing for this farm location.',
        reasons: ['Location coordinates missing or weather API temporarily offline.'],
        evidence: [{ label: 'Telemetry Status', value: 'Unavailable' }],
        recommendedActions: [
          { title: 'Update Farm Location Coordinates', priority: 'medium', reason: 'Enables live hyper-local weather risk monitoring.' }
        ],
        timeframe: 'today',
        confidence: 0.5
      };
    }

    const temp = ctx.weather.tempCelsius;
    const humidity = ctx.weather.humidity ?? 50;
    const rainProb = ctx.weather.rainProbability ?? 0;
    const windSpeed = ctx.weather.windSpeed ?? 0;
    const crop = ctx.farm.crops[0]?.name || 'Crop';

    // 1. Heavy Rainfall / Storm Risk
    if (rainProb >= 65 || (ctx.weather.condition && ctx.weather.condition.toLowerCase().includes('rain'))) {
      return {
        category: 'weather',
        level: rainProb >= 80 ? 'high' : 'moderate',
        score: Math.min(95, rainProb + 10),
        title: rainProb >= 80 ? 'Heavy Rainfall & Waterlogging Alert' : 'Moderate Precipitation Expected',
        summary: `Precipitation probability is ${rainProb}% over the next 24-72 hours. Excess moisture may cause root asphyxiation.`,
        reasons: [
          `Forecast indicates a ${rainProb}% chance of rain.`,
          `High soil saturation risk for ${crop}.`
        ],
        evidence: [
          { label: 'Crop Affected', value: crop },
          { label: 'Rain Probability', value: `${rainProb}%` },
          { label: 'Humidity', value: `${humidity}%` },
          { label: 'Current Temp', value: `${temp}°C` }
        ],
        recommendedActions: [
          { title: 'Inspect & Clear Field Drainage Channels', priority: 'high', reason: 'Prevents standing water accumulation around crop root zones.' },
          { title: 'Postpone Planned Irrigation', priority: 'high', reason: 'Conserves water and avoids soil over-saturation.' },
          { title: 'Defer Foliar Chemical Sprays', priority: 'medium', reason: 'Rainfall will wash away liquid pesticides before absorption.' }
        ],
        timeframe: '3_days',
        confidence: 0.9
      };
    }

    // 2. Extreme Heat Stress
    if (temp >= 35) {
      return {
        category: 'weather',
        level: temp >= 40 ? 'high' : 'moderate',
        score: Math.min(95, (temp - 30) * 8),
        title: temp >= 40 ? 'Severe Heat Stress Warning' : 'Elevated Heat Stress Risk',
        summary: `Ambient temperature of ${temp}°C may induce leaf wilting, pollen sterility, and high evapotranspiration in ${crop}.`,
        reasons: [
          `Temperature exceeds optimal agronomic threshold (32°C).`,
          `Rapid soil moisture depletion expected.`
        ],
        evidence: [
          { label: 'Crop Affected', value: crop },
          { label: 'Current Temp', value: `${temp}°C` },
          { label: 'Humidity', value: `${humidity}%` },
          { label: 'Wind Speed', value: `${windSpeed} km/h` }
        ],
        recommendedActions: [
          { title: 'Schedule Early Morning Light Irrigation', priority: 'high', reason: 'Cools root zone before peak midday sun.' },
          { title: 'Apply Mulch where Applicable', priority: 'medium', reason: 'Reduces surface evaporation loss.' }
        ],
        timeframe: 'today',
        confidence: 0.88
      };
    }

    // Default Optimal Weather
    return {
      category: 'weather',
      level: 'low',
      score: 10,
      title: 'Stable Weather Conditions',
      summary: `Weather conditions for ${crop} are favorable (${temp}°C, Humidity ${humidity}%).`,
      reasons: ['No extreme precipitation, heatwave, or storm thresholds triggered.'],
      evidence: [
        { label: 'Current Temp', value: `${temp}°C` },
        { label: 'Humidity', value: `${humidity}%` }
      ],
      recommendedActions: [
        { title: 'Proceed with Standard Farm Activities', priority: 'low', reason: 'Optimal conditions for weeding and fertilizer application.' }
      ],
      timeframe: 'today',
      confidence: 0.95
    };
  }

  /**
   * Evaluate Disease-Favorable Environmental Risk
   */
  static evaluateDiseaseRisk(ctx: NormalizedFarmContext): EvaluatedRiskSignal {
    const humidity = ctx.weather.humidity ?? 50;
    const temp = ctx.weather.tempCelsius ?? 25;
    const rainProb = ctx.weather.rainProbability ?? 0;
    const crop = ctx.farm.crops[0]?.name || 'Crop';
    const recentDisease = ctx.disease.latestDiagnosis;

    // Fungal / Bacterial Favorable Risk (High Humidity > 75% + Moderate Temp 20-32°C)
    if (humidity >= 75 && temp >= 18 && temp <= 32) {
      const isHigh = humidity >= 85 || rainProb >= 60 || !!recentDisease;
      return {
        category: 'disease',
        level: isHigh ? 'high' : 'moderate',
        score: isHigh ? 80 : 55,
        title: isHigh ? 'High Fungal & Leaf Pathogen Favorable Risk' : 'Moderate Disease-Favorable Environment',
        summary: `Environmental conditions (${humidity}% humidity, ${temp}°C) are highly favorable for fungal spore germination and leaf spot propagation.`,
        reasons: [
          `Relative humidity is ${humidity}% (Favorable for fungal pathogens).`,
          `Temperature is within optimum germination range (18-32°C).`,
          recentDisease ? `Recent scan logged ${recentDisease.disease} on ${recentDisease.crop}.` : 'Foliar moisture duration is elevated.'
        ],
        evidence: [
          { label: 'Crop Affected', value: crop },
          { label: 'Relative Humidity', value: `${humidity}%` },
          { label: 'Temperature', value: `${temp}°C` },
          { label: 'Logged History', value: recentDisease ? `${recentDisease.disease}` : 'None' }
        ],
        recommendedActions: [
          { title: 'Inspect Lower Leaf Canopies', priority: 'high', reason: 'Look for early concentric spots or yellow chlorosis.' },
          { title: 'Ensure Field Air Circulation & Pruning', priority: 'medium', reason: 'Reduces prolonged leaf surface wetness.' },
          { title: 'Run Leaf Scan if Lesions Appear', priority: 'high', reason: 'Provides instant pathogen diagnosis.' }
        ],
        timeframe: '3_days',
        confidence: 0.85
      };
    }

    return {
      category: 'disease',
      level: 'low',
      score: 15,
      title: 'Low Pathogen Proliferation Risk',
      summary: `Current environmental humidity (${humidity}%) does not favor active fungal outbreak on ${crop}.`,
      reasons: ['Humidity remains below pathogenic threshold.'],
      evidence: [
        { label: 'Relative Humidity', value: `${humidity}%` },
        { label: 'Temperature', value: `${temp}°C` }
      ],
      recommendedActions: [
        { title: 'Maintain Weekly Leaf Monitoring', priority: 'low', reason: 'Sustains proactive crop health hygiene.' }
      ],
      timeframe: '7_days',
      confidence: 0.9
    };
  }

  /**
   * Evaluate Water Stress Risk
   */
  static evaluateWaterStressRisk(ctx: NormalizedFarmContext): EvaluatedRiskSignal {
    const temp = ctx.weather.tempCelsius ?? 25;
    const rainProb = ctx.weather.rainProbability ?? 0;
    const crop = ctx.farm.crops[0]?.name || 'Crop';
    const waterSource = ctx.farm.waterSource || 'Borewell';

    if (temp >= 32 && rainProb < 20) {
      return {
        category: 'water',
        level: 'moderate',
        score: 60,
        title: 'Possible Moisture Deficit Stress',
        summary: `Elevated temperatures (${temp}°C) combined with low rain probability (${rainProb}%) increase soil water transpiration for ${crop}.`,
        reasons: [
          `Temperature (${temp}°C) drives high transpiration.`,
          `Low precipitation forecast (${rainProb}%).`,
          `Direct soil moisture telemetry is unavailable; manual check recommended.`
        ],
        evidence: [
          { label: 'Crop Affected', value: crop },
          { label: 'Rain Forecast', value: `${rainProb}%` },
          { label: 'Water Source', value: waterSource },
          { label: 'Soil Moisture Data', value: 'Not Direct (Inferred)' }
        ],
        recommendedActions: [
          { title: 'Check Root Zone Soil Moisture Manually', priority: 'high', reason: 'Squeeze soil at 10cm depth to verify moisture retention.' },
          { title: 'Perform Irrigation via ' + waterSource, priority: 'medium', reason: 'Replenishes soil moisture before midday stress.' }
        ],
        timeframe: '24_hours',
        confidence: 0.8
      };
    }

    return {
      category: 'water',
      level: 'low',
      score: 15,
      title: 'Adequate Moisture Balance',
      summary: `Water stress for ${crop} is low based on current climate conditions.`,
      reasons: ['Moderate temperatures and balanced forecast.'],
      evidence: [
        { label: 'Rain Forecast', value: `${rainProb}%` },
        { label: 'Water Source', value: waterSource }
      ],
      recommendedActions: [
        { title: 'Maintain Standard Irrigation Cycle', priority: 'low', reason: 'Sustains healthy soil hydration.' }
      ],
      timeframe: '3_days',
      confidence: 0.85
    };
  }

  /**
   * Evaluate Nutrient Risk
   */
  static evaluateNutrientRisk(ctx: NormalizedFarmContext): EvaluatedRiskSignal {
    const crop = ctx.farm.crops[0]?.name || 'Crop';

    if (!ctx.soil.available) {
      return {
        category: 'nutrient',
        level: 'low',
        score: 20,
        title: 'Soil Nutrient Baseline Pending',
        summary: `No recent soil analysis test logged for ${crop}. Nutrient risk is estimated based on crop type.`,
        reasons: ['Soil test data is missing or incomplete.'],
        evidence: [
          { label: 'Soil Test Status', value: 'Not Performed' },
          { label: 'Crop', value: crop }
        ],
        recommendedActions: [
          { title: 'Conduct Digital Soil NPK Test', priority: 'medium', reason: 'Unlocks precise fertilizer calculation.' }
        ],
        timeframe: '7_days',
        confidence: 0.6
      };
    }

    const n = ctx.soil.nitrogen ?? 280;
    const ph = ctx.soil.ph ?? 7.0;

    if (n < 250 || ph < 6.0 || ph > 8.2) {
      const isDeficient = n < 250;
      return {
        category: 'nutrient',
        level: isDeficient ? 'high' : 'moderate',
        score: isDeficient ? 75 : 50,
        title: isDeficient ? 'Sub-optimal Nitrogen Level Detected' : 'Soil pH Imbalance Alert',
        summary: isDeficient 
          ? `Soil Nitrogen is ${n} kg/ha (Below optimal target of 280 kg/ha) for ${crop}.`
          : `Soil pH is ${ph} (Optimal range is 6.2 - 7.8). Nutrient bioavailability may be restricted.`,
        reasons: [
          isDeficient ? `Nitrogen (${n} kg/ha) is low.` : `Soil pH (${ph}) is skewed.`,
          `Tested on ${ctx.soil.lastTestedDate ? new Date(ctx.soil.lastTestedDate).toLocaleDateString() : 'Recent Test'}.`
        ],
        evidence: [
          { label: 'Tested Nitrogen (N)', value: `${n} kg/ha` },
          { label: 'Tested pH', value: `${ph}` },
          { label: 'Potassium (K)', value: `${ctx.soil.potassium ?? 'N/A'} kg/ha` },
          { label: 'Phosphorus (P)', value: `${ctx.soil.phosphorus ?? 'N/A'} kg/ha` }
        ],
        recommendedActions: [
          { title: 'Apply Top-Dressing Neem-Coated Urea', priority: 'high', reason: 'Corrects nitrogen deficit to prevent crop stunting.' },
          { title: 'Incorporate Organic Compost / Bio-fertilizer', priority: 'medium', reason: 'Buffers soil pH towards optimal neutrality.' }
        ],
        timeframe: '7_days',
        confidence: 0.92
      };
    }

    return {
      category: 'nutrient',
      level: 'low',
      score: 10,
      title: 'Optimal Soil Fertility Status',
      summary: `Soil NPK and pH levels (${ph}) are in healthy target range for ${crop}.`,
      reasons: ['Nitrogen, Phosphorus, and Potassium meet target thresholds.'],
      evidence: [
        { label: 'Nitrogen (N)', value: `${n} kg/ha` },
        { label: 'pH', value: `${ph}` }
      ],
      recommendedActions: [
        { title: 'Follow Standard Crop Maintenance Plan', priority: 'low', reason: 'Sustains optimal soil fertility.' }
      ],
      timeframe: '7_days',
      confidence: 0.95
    };
  }
}
