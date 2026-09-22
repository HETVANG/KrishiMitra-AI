import { DiseaseAnalysisResult } from './diseaseAnalysisService';
import { EnvironmentalRiskResult } from './diseaseRiskEngine';

export class DiseaseSeverityService {
  /**
   * Determine severity grade considering visual analysis, environmental risk, and confidence
   */
  static assessSeverity(
    analysis: DiseaseAnalysisResult,
    envRisk: EnvironmentalRiskResult
  ): 'low' | 'moderate' | 'high' | 'uncertain' {
    if (analysis.condition === 'HEALTHY') {
      return 'low';
    }

    if (analysis.condition === 'UNCERTAIN' || analysis.condition === 'INSUFFICIENT_IMAGE_QUALITY') {
      return 'uncertain';
    }

    // Base severity from visual AI analysis
    let score = analysis.severity === 'high' ? 3 : analysis.severity === 'moderate' ? 2 : 1;

    // Environmental risk acceleration
    if (envRisk.contributesToDisease || envRisk.contributesToMoistureStress) {
      score += 1;
    }

    // Confidence scaling
    if (analysis.confidence === 'low') {
      // If AI confidence is low, cap severity or label uncertain if score is edge
      if (score >= 3) return 'moderate';
    }

    if (score >= 3) return 'high';
    if (score === 2) return 'moderate';
    return 'low';
  }
}
