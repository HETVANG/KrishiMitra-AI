import { ConfidenceLevel, EvidenceItem } from './decisionTypes';
import { NormalizedFarmGraphContext } from '../knowledgeGraph/graphTypes';

export interface ConfidenceEvaluation {
  confidence: ConfidenceLevel;
  confidenceScore: number;
  missingData: string[];
  uncertainties: string[];
  isInsufficient: boolean;
}

export class DecisionConfidenceEngine {
  /**
   * Evaluate confidence level and detect missing critical information
   */
  static evaluateConfidence(
    graph: NormalizedFarmGraphContext,
    evidence: EvidenceItem[]
  ): ConfidenceEvaluation {
    const missingData: string[] = [];
    const uncertainties: string[] = [];

    // Critical Data Checks
    if (!graph.farm || !graph.farm.id) {
      missingData.push('farmRecord');
    }
    if (graph.farm.location.latitude === null || graph.farm.location.longitude === null) {
      missingData.push('farmCoordinates');
    }
    if (!graph.weatherContext.available) {
      missingData.push('liveWeatherData');
      uncertainties.push('Weather telematics unavailable for target location.');
    }
    if (!graph.soilContext.available) {
      missingData.push('soilAnalysisData');
      uncertainties.push('Soil chemistry analysis unrecorded.');
    }

    if (missingData.includes('farmRecord') || missingData.includes('farmCoordinates')) {
      return {
        confidence: 'INSUFFICIENT_DATA',
        confidenceScore: 0.2,
        missingData,
        uncertainties,
        isInsufficient: true
      };
    }

    // Evaluate Average Evidence Confidence
    let totalConfidence = 0;
    let freshCount = 0;

    evidence.forEach(e => {
      totalConfidence += e.confidence;
      if (e.freshness === 'FRESH') freshCount++;
    });

    const avgConfidence = evidence.length > 0 ? totalConfidence / evidence.length : 0.7;

    let confidenceLevel: ConfidenceLevel = 'MEDIUM';
    if (avgConfidence >= 0.85 && freshCount >= 2 && missingData.length === 0) {
      confidenceLevel = 'HIGH';
    } else if (avgConfidence < 0.6 || missingData.length >= 2) {
      confidenceLevel = 'LOW';
    }

    return {
      confidence: confidenceLevel,
      confidenceScore: Number(avgConfidence.toFixed(2)),
      missingData,
      uncertainties,
      isInsufficient: false
    };
  }
}
