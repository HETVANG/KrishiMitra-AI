import { CopilotContextService } from '../CopilotContextService';
import { PredictiveCropService } from '../prediction/predictiveCropService';
import { IrrigationEngine, EvaluatedIrrigationResult } from './irrigationEngine';
import { IrrigationEvent } from '../../models/IrrigationEvent';
import { IrrigationRecommendation } from '../../models/IrrigationRecommendation';

export class IrrigationService {
  /**
   * Main pipeline to compute and retrieve smart irrigation status
   */
  static async getIrrigationStatus(userId: string, farmId?: string, language: string = 'en'): Promise<{
    recommendation: EvaluatedIrrigationResult;
    recentEvents: any[];
    contextSummary: any;
  }> {
    // 1. Gather Normalized Context
    const ctx = await CopilotContextService.getFarmContext(userId, farmId);
    const targetFarmId = ctx.farm.id;

    if (!targetFarmId) {
      const fallbackResult = IrrigationEngine.evaluate(ctx, [], null);
      return {
        recommendation: fallbackResult,
        recentEvents: [],
        contextSummary: null
      };
    }

    // 2. Gather Step 17 Predictive Risk Signals & Recent Irrigation History
    const [predictiveData, lastEvent, recentEvents] = await Promise.all([
      PredictiveCropService.evaluateAndGetPredictions(userId, targetFarmId).catch(() => ({ signals: [] })),
      IrrigationEvent.findOne({ user: userId, farm: targetFarmId }).sort({ date: -1 }).lean(),
      IrrigationEvent.find({ user: userId, farm: targetFarmId }).sort({ date: -1 }).limit(10).lean()
    ]);

    // 3. Evaluate Irrigation Engine
    const evalResult = IrrigationEngine.evaluate(ctx, predictiveData.signals || [], lastEvent);

    // 4. Save/Upsert Recommendation in MongoDB
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours TTL

    await IrrigationRecommendation.findOneAndUpdate(
      { user: userId, farm: targetFarmId },
      {
        $set: {
          user: userId,
          farm: targetFarmId,
          status: evalResult.status,
          level: evalResult.level,
          summary: evalResult.summary,
          reasons: evalResult.reasons,
          evidence: evalResult.evidence,
          recommendedActions: evalResult.recommendedActions,
          timeframe: evalResult.timeframe,
          confidence: evalResult.confidence,
          dataFreshness: evalResult.dataFreshness,
          expiresAt: expiresAt
        }
      },
      { upsert: true, new: true }
    );

    return {
      recommendation: evalResult,
      recentEvents: recentEvents.map(e => ({
        id: e._id.toString(),
        cropName: e.cropName,
        date: e.date,
        method: e.method,
        durationMinutes: e.durationMinutes,
        waterAmount: e.waterAmount,
        waterUnit: e.waterUnit,
        notes: e.notes
      })),
      contextSummary: {
        farmName: ctx.farm.name,
        crop: ctx.farm.crops[0]?.name || 'Crop',
        waterSource: ctx.farm.waterSource,
        tempCelsius: ctx.weather.tempCelsius,
        rainProbability: ctx.weather.rainProbability,
        humidity: ctx.weather.humidity
      }
    };
  }

  /**
   * Log a new Irrigation Event
   */
  static async logIrrigationEvent(userId: string, payload: {
    farmId?: string;
    cropName?: string;
    date?: string | Date;
    method: 'drip' | 'sprinkler' | 'flood' | 'manual' | 'other';
    durationMinutes?: number;
    waterAmount?: number;
    waterUnit?: string;
    notes?: string;
  }) {
    const ctx = await CopilotContextService.getFarmContext(userId, payload.farmId);
    const targetFarmId = ctx.farm.id;
    if (!targetFarmId) {
      throw new Error('No farm record found to attach irrigation log.');
    }

    const newEvent = await IrrigationEvent.create({
      user: userId,
      farm: targetFarmId,
      cropName: payload.cropName || ctx.farm.crops[0]?.name || 'Crop',
      date: payload.date ? new Date(payload.date) : new Date(),
      method: payload.method || 'drip',
      durationMinutes: payload.durationMinutes || 30,
      waterAmount: payload.waterAmount,
      waterUnit: payload.waterUnit || 'Liters',
      notes: payload.notes
    });

    // Re-evaluate irrigation status immediately
    await this.getIrrigationStatus(userId, targetFarmId);

    return newEvent;
  }

  /**
   * Format irrigation context for Step 16 Copilot queries
   */
  static async getCopilotIrrigationSummary(userId: string, farmId?: string): Promise<string> {
    const data = await this.getIrrigationStatus(userId, farmId);
    const rec = data.recommendation;

    return `Irrigation Status for ${data.contextSummary?.farmName || 'your farm'} is "${rec.status}". Reason: ${rec.summary} Recommended Action: ${rec.recommendedActions[0]?.title || 'Check soil moisture before watering.'}`;
  }
}
