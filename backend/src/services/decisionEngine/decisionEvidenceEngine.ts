import { EvidenceItem } from './decisionTypes';
import { NormalizedFarmGraphContext } from '../knowledgeGraph/graphTypes';

export class DecisionEvidenceEngine {
  /**
   * Extract and tag all evidence items from NormalizedFarmGraphContext
   */
  static extractEvidence(graph: NormalizedFarmGraphContext): EvidenceItem[] {
    const evidence: EvidenceItem[] = [];

    // 1. Weather Evidence
    if (graph.weatherContext.available) {
      if (graph.weatherContext.rainProbability !== null) {
        evidence.push({
          id: 'ev_weather_rain',
          source: 'Live AgroWeather Telemetry Provider',
          sourceType: 'WEATHER_PROVIDER',
          value: `${graph.weatherContext.rainProbability}% Rain Probability`,
          observedAt: graph.weatherContext.freshness.observedAt,
          freshness: graph.weatherContext.freshness.freshness,
          confidence: graph.weatherContext.freshness.confidence,
          relevance: 'high'
        });
      }
      if (graph.weatherContext.tempCelsius !== null) {
        evidence.push({
          id: 'ev_weather_temp',
          source: 'Live AgroWeather Telemetry Provider',
          sourceType: 'WEATHER_PROVIDER',
          value: `${graph.weatherContext.tempCelsius}°C Ambient Temperature`,
          observedAt: graph.weatherContext.freshness.observedAt,
          freshness: graph.weatherContext.freshness.freshness,
          confidence: graph.weatherContext.freshness.confidence,
          relevance: 'high'
        });
      }
    }

    // 2. Soil Analysis Evidence
    if (graph.soilContext.available) {
      evidence.push({
        id: 'ev_soil_npk',
        source: 'Digital Soil Testing Lab Analysis',
        sourceType: 'SOIL_ANALYSIS',
        value: `Soil pH: ${graph.soilContext.ph ?? 'N/A'}, N: ${graph.soilContext.nitrogen ?? 'N/A'}, P: ${graph.soilContext.phosphorus ?? 'N/A'}, K: ${graph.soilContext.potassium ?? 'N/A'}`,
        observedAt: graph.soilContext.freshness.observedAt,
        freshness: graph.soilContext.freshness.freshness,
        confidence: graph.soilContext.freshness.confidence,
        relevance: 'high'
      });
    }

    // 3. Leaf Pathology Scan Evidence
    if (graph.diseaseContext.available && graph.diseaseContext.latestDiagnosis) {
      const diag = graph.diseaseContext.latestDiagnosis;
      evidence.push({
        id: 'ev_disease_scan',
        source: 'AI Leaf Pathology Diagnostics',
        sourceType: 'DISEASE_SCAN',
        value: `${diag.disease} on ${diag.crop} (Severity: ${diag.severity})`,
        observedAt: graph.diseaseContext.freshness.observedAt,
        freshness: graph.diseaseContext.freshness.freshness,
        confidence: diag.confidence || 0.85,
        relevance: 'high'
      });
    }

    // 4. Mandi Market Price Evidence
    if (graph.marketContext.available && graph.marketContext.price !== null) {
      evidence.push({
        id: 'ev_market_price',
        source: `Live Mandi Price Feed (${graph.marketContext.marketName || 'Agmarknet'})`,
        sourceType: 'MARKET_PROVIDER',
        value: `${graph.marketContext.commodity}: ${graph.regionalContext?.currencySymbol || '₹'}${graph.marketContext.price}`,
        observedAt: graph.marketContext.freshness.observedAt,
        freshness: graph.marketContext.freshness.freshness,
        confidence: graph.marketContext.freshness.confidence,
        relevance: 'medium'
      });
    }

    // 5. Active Crop Lifecycle Evidence
    if (graph.activeCropCycles.length > 0) {
      const activeCrop = graph.activeCropCycles[0];
      evidence.push({
        id: 'ev_crop_stage',
        source: 'Farm Lifecycle Registry',
        sourceType: 'FARM_RECORD',
        value: `${activeCrop.cropName} (${activeCrop.variety}) - Stage: ${activeCrop.currentStage} (${activeCrop.ageInDays} days old)`,
        observedAt: activeCrop.plantingDate,
        freshness: 'FRESH',
        confidence: 0.95,
        relevance: 'high'
      });
    }

    // 6. Agriculture Knowledge Engine Evidence
    if (graph.knowledgeContext?.sources && graph.knowledgeContext.sources.length > 0) {
      const primarySource = graph.knowledgeContext.sources[0];
      evidence.push({
        id: 'ev_agri_knowledge',
        source: primarySource.source || 'ICAR Verified Agronomic Guidelines',
        sourceType: 'AGRICULTURE_KNOWLEDGE',
        value: `Verified Agronomic Handbook (${primarySource.publisher || 'ICAR'})`,
        observedAt: primarySource.verifiedAt || new Date().toISOString(),
        freshness: 'FRESH',
        confidence: 0.95,
        relevance: 'high'
      });
    }

    return evidence;
  }
}
