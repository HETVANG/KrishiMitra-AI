import { CopilotContextService, NormalizedFarmContext } from '../CopilotContextService';
import { RiskRulesEngine, EvaluatedRiskSignal } from './riskRules';
import { PredictiveInsight } from '../../models/PredictiveInsight';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL?.trim() || 'gemini-3.1-flash-lite';
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.error('[PredictiveCropService] Failed to initialize Gemini API Client', err);
  }
}

export class PredictiveCropService {
  /**
   * Main pipeline to compute and persist predictive risk signals for a farm.
   */
  static async evaluateAndGetPredictions(userId: string, farmId?: string, language: string = 'en'): Promise<{
    overallOutlook: 'low' | 'moderate' | 'high';
    riskScore: number; // 0-100
    signals: any[];
    timeline: any[];
    contextSummary: any;
    lastEvaluatedAt: string;
  }> {
    // 1. Gather Normalized Farm Context
    const ctx = await CopilotContextService.getFarmContext(userId, farmId);
    const targetFarmId = ctx.farm.id;
    if (!targetFarmId) {
      return {
        overallOutlook: 'low',
        riskScore: 10,
        signals: [],
        timeline: [],
        contextSummary: null,
        lastEvaluatedAt: new Date().toISOString()
      };
    }

    // 2. Evaluate Deterministic Risk Signals
    const rawSignals: EvaluatedRiskSignal[] = [];
    
    const weatherRisk = RiskRulesEngine.evaluateWeatherRisk(ctx);
    if (weatherRisk) rawSignals.push(weatherRisk);

    const diseaseRisk = RiskRulesEngine.evaluateDiseaseRisk(ctx);
    if (diseaseRisk) rawSignals.push(diseaseRisk);

    const waterRisk = RiskRulesEngine.evaluateWaterStressRisk(ctx);
    if (waterRisk) rawSignals.push(waterRisk);

    const nutrientRisk = RiskRulesEngine.evaluateNutrientRisk(ctx);
    if (nutrientRisk) rawSignals.push(nutrientRisk);

    // 3. Compute Overall Farm Risk Outlook & Score
    const maxScore = Math.max(...rawSignals.map(s => s.score), 10);
    const overallOutlook: 'low' | 'moderate' | 'high' = 
      maxScore >= 70 ? 'high' : maxScore >= 40 ? 'moderate' : 'low';

    // 4. Save/Upsert Predictive Insights in MongoDB
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours TTL

    for (const signal of rawSignals) {
      await PredictiveInsight.findOneAndUpdate(
        { user: userId, farm: targetFarmId, category: signal.category },
        {
          $set: {
            user: userId,
            farm: targetFarmId,
            category: signal.category,
            level: signal.level,
            score: signal.score,
            title: signal.title,
            summary: signal.summary,
            reasons: signal.reasons,
            evidence: signal.evidence,
            recommendedActions: signal.recommendedActions,
            affectedCrop: ctx.farm.crops[0]?.name || 'Crop',
            timeframe: signal.timeframe,
            confidence: signal.confidence,
            dataTimestamp: now,
            expiresAt: expiresAt
          }
        },
        { upsert: true, new: true }
      );
    }

    // 5. Fetch Active Persisted Insights
    const savedInsights = await PredictiveInsight.find({
      user: userId,
      farm: targetFarmId,
      expiresAt: { $gt: now }
    }).sort({ score: -1 }).lean();

    // 6. Build Risk Timeline
    const timeline = this.buildTimeline(savedInsights);

    return {
      overallOutlook,
      riskScore: maxScore,
      signals: savedInsights.map(s => ({
        id: s._id.toString(),
        category: s.category,
        level: s.level,
        score: s.score,
        title: s.title,
        summary: s.summary,
        reasons: s.reasons,
        evidence: s.evidence,
        recommendedActions: s.recommendedActions,
        affectedCrop: s.affectedCrop,
        timeframe: s.timeframe,
        confidence: s.confidence,
        dataTimestamp: s.dataTimestamp
      })),
      timeline,
      contextSummary: {
        farmName: ctx.farm.name,
        location: ctx.farm.location.address,
        crop: ctx.farm.crops[0]?.name || 'Crop',
        tempCelsius: ctx.weather.tempCelsius,
        rainProb: ctx.weather.rainProbability,
        soilPh: ctx.soil.ph,
        soilN: ctx.soil.nitrogen
      },
      lastEvaluatedAt: now.toISOString()
    };
  }

  /**
   * Build Risk Timeline for Today, Next 24 Hours, Next 3 Days, Next 7 Days
   */
  private static buildTimeline(insights: any[]): Array<{
    timeframeLabel: string;
    timeframeKey: string;
    activeRisks: Array<{
      category: string;
      level: string;
      title: string;
      summary: string;
    }>;
  }> {
    const horizons = [
      { key: 'today', label: 'Today' },
      { key: '24_hours', label: 'Next 24 Hours' },
      { key: '3_days', label: 'Next 3 Days' },
      { key: '7_days', label: 'Next 7 Days' }
    ];

    return horizons.map(h => {
      const matched = insights.filter(i => i.timeframe === h.key || (h.key === '3_days' && (i.category === 'weather' || i.category === 'disease')));
      return {
        timeframeLabel: h.label,
        timeframeKey: h.key,
        activeRisks: matched.map(m => ({
          category: m.category,
          level: m.level,
          title: m.title,
          summary: m.summary
        }))
      };
    });
  }

  /**
   * Connect Predictions with Copilot queries
   */
  static async getCopilotPredictiveSummary(userId: string, farmId?: string): Promise<string> {
    const data = await this.evaluateAndGetPredictions(userId, farmId);
    if (!data.signals.length) {
      return 'No active crop risks detected on your farm. Environmental conditions are optimal.';
    }

    const highRisks = data.signals.filter(s => s.level === 'high' || s.level === 'moderate');
    if (highRisks.length === 0) {
      return 'All crop risk signals are currently LOW. Continue standard farm maintenance.';
    }

    const summaryParts = highRisks.map(r => `• ${r.title} (${r.timeframe}): ${r.summary}`);
    return `Your farm has ${highRisks.length} active risk condition(s):\n${summaryParts.join('\n')}`;
  }
}
