import { CopilotContextService } from '../CopilotContextService';

export interface EnvironmentalRiskResult {
  temperature?: number;
  humidity?: number;
  rainProb?: number;
  soilMoisture?: number;
  favorabilityNote: string;
  contributesToDisease: boolean;
  contributesToMoistureStress: boolean;
}

export class DiseaseRiskEngine {
  /**
   * Evaluate contextual environmental risks for disease development
   */
  static async evaluateEnvironmentalContext(
    userId?: string,
    farmId?: string
  ): Promise<EnvironmentalRiskResult> {
    try {
      if (!userId) {
        return {
          favorabilityNote: 'Environmental context unavailable for guest scan.',
          contributesToDisease: false,
          contributesToMoistureStress: false
        };
      }

      // Fetch live context using CopilotContextService
      const ctx = await CopilotContextService.getFarmContext(userId, farmId);

      const temp = ctx.weather?.tempCelsius ?? undefined;
      const humidity = ctx.weather?.humidity ?? undefined;
      const rainProb = ctx.weather?.rainProbability ?? undefined;
      const soilMoisture = (ctx as any).irrigation?.moisture ?? (ctx as any).soil?.moisture ?? undefined;

      let notes: string[] = [];
      let contributesToDisease = false;
      let contributesToMoistureStress = false;

      // Fungal disease environmental risk evaluation
      if (typeof humidity === 'number' && humidity >= 75) {
        if (typeof temp === 'number' && temp >= 18 && temp <= 32) {
          notes.push(`High relative humidity (${humidity}%) paired with moderate temperature (${temp}°C) creates favorable conditions for fungal spore germination and leaf spot spread.`);
          contributesToDisease = true;
        } else {
          notes.push(`High atmospheric humidity (${humidity}%) may prolong leaf surface wetness.`);
          contributesToDisease = true;
        }
      }

      // Excess moisture / soil waterlogging risk evaluation
      if (typeof rainProb === 'number' && rainProb >= 60) {
        notes.push(`Recent or upcoming rainfall forecast (${rainProb}% chance) increases foliage wetness duration.`);
      }

      if (typeof soilMoisture === 'number' && soilMoisture > 75) {
        notes.push(`Elevated soil moisture (${soilMoisture}%) may contribute to root zone saturation and soft rot or wilt symptoms.`);
        contributesToMoistureStress = true;
      } else if (typeof soilMoisture === 'number' && soilMoisture < 25) {
        notes.push(`Low soil moisture (${soilMoisture}%) combined with heat may cause leaf margin scorching resembling disease symptoms.`);
        contributesToMoistureStress = true;
      }

      const favorabilityNote = notes.length > 0
        ? notes.join(' ')
        : 'Current environmental conditions (temperature and humidity) present standard disease risk levels.';

      return {
        temperature: temp,
        humidity,
        rainProb,
        soilMoisture,
        favorabilityNote,
        contributesToDisease,
        contributesToMoistureStress
      };
    } catch (error) {
      console.warn('[DiseaseRiskEngine] Risk evaluation warning:', error);
      return {
        favorabilityNote: 'Environmental context evaluated with default parameters.',
        contributesToDisease: false,
        contributesToMoistureStress: false
      };
    }
  }
}
