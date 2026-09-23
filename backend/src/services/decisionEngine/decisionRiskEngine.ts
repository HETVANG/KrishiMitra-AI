import { RiskItem, EvidenceItem } from './decisionTypes';
import { NormalizedFarmGraphContext } from '../knowledgeGraph/graphTypes';

export class DecisionRiskEngine {
  /**
   * Evaluate multi-factor farm risk scores and classifications
   */
  static evaluateRisks(graph: NormalizedFarmGraphContext, evidence: EvidenceItem[]): RiskItem[] {
    const risks: RiskItem[] = [];

    // 1. Weather Risk Evaluation
    const rainProb = graph.weatherContext.rainProbability || 0;
    const tempC = graph.weatherContext.tempCelsius || 25;
    const weatherEv = evidence.filter(e => e.sourceType === 'WEATHER_PROVIDER');

    if (rainProb > 70) {
      risks.push({
        category: 'WEATHER',
        riskScore: 0.85,
        riskLevel: 'HIGH',
        reasons: [`High rainfall probability (${rainProb}%) forecast`],
        evidence: weatherEv,
        timeHorizon: 'NEXT_24_HOURS',
        confidence: 0.9
      });
    } else if (tempC > 38) {
      risks.push({
        category: 'WEATHER',
        riskScore: 0.75,
        riskLevel: 'HIGH',
        reasons: [`Extremely high ambient temperature (${tempC}°C)`],
        evidence: weatherEv,
        timeHorizon: 'TODAY',
        confidence: 0.85
      });
    }

    // 2. Water / Irrigation Risk Evaluation
    if (graph.irrigationContext.waterAttentionNeeded) {
      risks.push({
        category: 'WATER',
        riskScore: 0.7,
        riskLevel: 'MODERATE',
        reasons: [graph.irrigationContext.reason],
        evidence: weatherEv,
        timeHorizon: 'NEXT_24_HOURS',
        confidence: 0.85
      });
    }

    // 3. Leaf Pathology Disease Risk Evaluation
    if (graph.diseaseContext.available && graph.diseaseContext.latestDiagnosis) {
      const diag = graph.diseaseContext.latestDiagnosis;
      const diseaseEv = evidence.filter(e => e.sourceType === 'DISEASE_SCAN');
      let score = 0.4;
      let level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';

      if (diag.severity === 'severe') {
        score = 0.95;
        level = 'CRITICAL';
      } else if (diag.severity === 'high') {
        score = 0.8;
        level = 'HIGH';
      }

      risks.push({
        category: 'DISEASE',
        riskScore: score,
        riskLevel: level,
        reasons: [`Active ${diag.disease} infection detected on ${diag.crop}`],
        evidence: diseaseEv,
        timeHorizon: 'NEXT_3_DAYS',
        confidence: diag.confidence || 0.85
      });
    }

    // 4. Soil Nutrient Data Risk Evaluation
    if (graph.soilContext.available && graph.soilContext.freshness.freshness === 'STALE') {
      const soilEv = evidence.filter(e => e.sourceType === 'SOIL_ANALYSIS');
      risks.push({
        category: 'SOIL',
        riskScore: 0.5,
        riskLevel: 'MODERATE',
        reasons: ['Soil test data is older than 90 days'],
        evidence: soilEv,
        timeHorizon: 'SEASON',
        confidence: 0.7
      });
    }

    if (risks.length === 0) {
      risks.push({
        category: 'CROP_HEALTH',
        riskScore: 0.1,
        riskLevel: 'LOW',
        reasons: ['All farm telemetry and health indicators are within normal parameters.'],
        evidence: [],
        timeHorizon: 'TODAY',
        confidence: 0.95
      });
    }

    return risks;
  }
}
