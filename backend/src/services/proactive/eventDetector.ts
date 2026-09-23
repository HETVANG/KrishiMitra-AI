import { NormalizedFarmGraphContext } from '../knowledgeGraph/graphTypes';
import { ProactiveEvent, ProactiveEventType, ProactiveEvidence } from './proactiveEventTypes';

export class EventDetector {
  /**
   * Detect meaningful agricultural events from Farm Knowledge Graph context
   */
  static detectEvents(graph: NormalizedFarmGraphContext): ProactiveEvent[] {
    const events: ProactiveEvent[] = [];
    const now = new Date();
    const nowIso = now.toISOString();

    const userId = graph.user.id;
    const farmId = graph.farm.id;
    const primaryCrop = graph.activeCropCycles[0];
    const fieldId = primaryCrop ? primaryCrop.fieldId : graph.fields[0]?.id;
    const cropCycleId = primaryCrop ? primaryCrop.id : undefined;
    const cropName = primaryCrop ? primaryCrop.cropName : 'Crop';

    // 1. Weather Event Detection
    if (graph.weatherContext && graph.weatherContext.available) {
      const rainProb = graph.weatherContext.rainProbability || 0;
      const tempC = graph.weatherContext.tempCelsius || 25;

      const weatherEvidence: ProactiveEvidence[] = [
        {
          source: 'Weather API',
          sourceType: 'WEATHER_PROVIDER',
          value: { rainProbability: rainProb, tempCelsius: tempC, condition: graph.weatherContext.condition },
          observedAt: graph.weatherContext.freshness.observedAt,
          freshness: graph.weatherContext.freshness.freshness,
          confidence: graph.weatherContext.freshness.confidence,
          relevance: 'high'
        }
      ];

      // Heavy Rain Event
      if (rainProb >= 60) {
        events.push({
          eventId: `evt_rain_${farmId}_${now.getTime()}`,
          eventType: 'HEAVY_RAIN_DETECTED',
          userId,
          farmId,
          fieldId,
          cropCycleId,
          cropName,
          source: 'WEATHER_PROVIDER',
          severity: rainProb >= 80 ? 'CRITICAL' : 'HIGH',
          priority: rainProb >= 80 ? 'HIGH' : 'MEDIUM',
          evidence: weatherEvidence,
          context: { rainProbability: rainProb },
          detectedAt: nowIso,
          observedAt: graph.weatherContext.freshness.observedAt,
          freshness: graph.weatherContext.freshness.freshness,
          confidence: graph.weatherContext.freshness.confidence,
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'DETECTED',
          fingerprint: `${farmId}_weather_heavy_rain_${Math.floor(now.getTime() / (6 * 3600 * 1000))}`,
          title: `Heavy Rain Forecast (${rainProb}%)`,
          summary: `High rainfall probability detected for ${graph.farm.name}. Delay planned irrigation to prevent waterlogging.`,
          recommendedAction: 'Hold scheduled irrigation and monitor field drainage channels.',
          category: 'IRRIGATION_DECISION',
          actionUrl: '/irrigation'
        });
      }

      // Heat Risk Event
      if (tempC >= 38) {
        events.push({
          eventId: `evt_heat_${farmId}_${now.getTime()}`,
          eventType: 'HEAT_RISK_DETECTED',
          userId,
          farmId,
          fieldId,
          cropCycleId,
          cropName,
          source: 'WEATHER_PROVIDER',
          severity: tempC >= 42 ? 'CRITICAL' : 'HIGH',
          priority: 'HIGH',
          evidence: weatherEvidence,
          context: { tempCelsius: tempC },
          detectedAt: nowIso,
          observedAt: graph.weatherContext.freshness.observedAt,
          freshness: graph.weatherContext.freshness.freshness,
          confidence: graph.weatherContext.freshness.confidence,
          expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
          status: 'DETECTED',
          fingerprint: `${farmId}_weather_heat_${Math.floor(now.getTime() / (12 * 3600 * 1000))}`,
          title: `Heat Stress Warning (${tempC}°C)`,
          summary: `Extreme temperature recorded at ${graph.farm.name}. Evapotranspiration is accelerated.`,
          recommendedAction: 'Verify topsoil moisture and schedule evening drip irrigation if needed.',
          category: 'WEATHER_RESPONSE_DECISION',
          actionUrl: '/irrigation'
        });
      }

      // Frost Risk Event
      if (tempC <= 5) {
        events.push({
          eventId: `evt_frost_${farmId}_${now.getTime()}`,
          eventType: 'FROST_RISK_DETECTED',
          userId,
          farmId,
          fieldId,
          cropCycleId,
          cropName,
          source: 'WEATHER_PROVIDER',
          severity: 'CRITICAL',
          priority: 'CRITICAL',
          evidence: weatherEvidence,
          context: { tempCelsius: tempC },
          detectedAt: nowIso,
          observedAt: graph.weatherContext.freshness.observedAt,
          freshness: graph.weatherContext.freshness.freshness,
          confidence: graph.weatherContext.freshness.confidence,
          expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
          status: 'DETECTED',
          fingerprint: `${farmId}_weather_frost_${Math.floor(now.getTime() / (12 * 3600 * 1000))}`,
          title: `Frost Warning (${tempC}°C)`,
          summary: `Low temperatures detected. Protect young ${cropName} seedlings against cold injury.`,
          recommendedAction: 'Apply light evening irrigation or thermal cover for sensitive crops.',
          category: 'WEATHER_RESPONSE_DECISION',
          actionUrl: '/dashboard'
        });
      }
    }

    // 2. Irrigation / Water Stress Detection
    if (graph.irrigationContext && graph.irrigationContext.waterAttentionNeeded) {
      events.push({
        eventId: `evt_irrig_${farmId}_${now.getTime()}`,
        eventType: 'WATER_STRESS_DETECTED',
        userId,
        farmId,
        fieldId,
        cropCycleId,
        cropName,
        source: 'IRRIGATION_RECORD',
        severity: 'MODERATE',
        priority: 'MEDIUM',
        evidence: [
          {
            source: 'Irrigation Engine',
            sourceType: 'FARM_RECORD',
            value: graph.irrigationContext.reason,
            confidence: 0.9,
            relevance: 'high'
          }
        ],
        context: { reason: graph.irrigationContext.reason },
        detectedAt: nowIso,
        observedAt: nowIso,
        freshness: 'FRESH',
        confidence: 0.9,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'DETECTED',
        fingerprint: `${farmId}_irrigation_water_stress_${Math.floor(now.getTime() / (24 * 3600 * 1000))}`,
        title: `Irrigation Attention Needed`,
        summary: graph.irrigationContext.reason,
        recommendedAction: graph.irrigationContext.recommendedAction,
        category: 'IRRIGATION_DECISION',
        actionUrl: '/irrigation'
      });
    }

    // 3. Disease Risk / Crop Health Detection
    if (graph.diseaseContext && graph.diseaseContext.available && graph.diseaseContext.latestDiagnosis) {
      const diag = graph.diseaseContext.latestDiagnosis;
      const isSevere = diag.severity === 'severe' || diag.severity === 'high';

      events.push({
        eventId: `evt_disease_${farmId}_${now.getTime()}`,
        eventType: isSevere ? 'DISEASE_RISK_INCREASED' : 'DISEASE_SCAN_COMPLETED',
        userId,
        farmId,
        fieldId,
        cropCycleId,
        cropName: diag.crop || cropName,
        source: 'DISEASE_SCAN',
        severity: isSevere ? 'HIGH' : 'MODERATE',
        priority: isSevere ? 'HIGH' : 'LOW',
        evidence: [
          {
            source: 'Leaf Pathology Scanner',
            sourceType: 'DISEASE_SCAN',
            value: diag,
            observedAt: graph.diseaseContext.freshness.observedAt,
            freshness: graph.diseaseContext.freshness.freshness,
            confidence: diag.confidenceScore || 0.85,
            relevance: 'high'
          }
        ],
        context: { disease: diag.disease || diag.diseaseName, severity: diag.severity },
        detectedAt: nowIso,
        observedAt: graph.diseaseContext.freshness.observedAt,
        freshness: graph.diseaseContext.freshness.freshness,
        confidence: diag.confidenceScore || 0.85,
        expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'DETECTED',
        fingerprint: `${farmId}_disease_${diag.disease || diag.diseaseName}_${diag.severity}`,
        title: isSevere ? `Crop Pathology Alert: ${diag.disease || diag.diseaseName}` : `Disease Scan Recorded: ${diag.disease || diag.diseaseName}`,
        summary: `Pathology scan detected ${diag.severity || 'moderate'} severity ${diag.disease || diag.diseaseName} on ${diag.crop || cropName}.`,
        recommendedAction: isSevere ? 'Schedule specialist advisory consultation and isolate affected crop patch.' : 'Review recommended organic treatment protocol.',
        category: 'DISEASE_RESPONSE_DECISION',
        actionUrl: '/disease'
      });
    }

    // 4. Crop Lifecycle Milestone Detection
    if (primaryCrop && primaryCrop.ageInDays >= 90) {
      events.push({
        eventId: `evt_harvest_${farmId}_${now.getTime()}`,
        eventType: 'HARVEST_WINDOW_APPROACHING',
        userId,
        farmId,
        fieldId,
        cropCycleId,
        cropName,
        source: 'CROP_LIFECYCLE',
        severity: 'MODERATE',
        priority: 'MEDIUM',
        evidence: [
          {
            source: 'Crop Lifecycle Manager',
            sourceType: 'FARM_RECORD',
            value: { cropAgeInDays: primaryCrop.ageInDays, stage: primaryCrop.currentStage },
            confidence: 0.9,
            relevance: 'high'
          }
        ],
        context: { cropAgeInDays: primaryCrop.ageInDays, stage: primaryCrop.currentStage },
        detectedAt: nowIso,
        observedAt: nowIso,
        freshness: 'FRESH',
        confidence: 0.9,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'DETECTED',
        fingerprint: `${farmId}_lifecycle_harvest_${primaryCrop.id}_${Math.floor(primaryCrop.ageInDays / 10)}`,
        title: `Harvest Window Approaching: ${cropName}`,
        summary: `${cropName} has reached ${primaryCrop.ageInDays} days growth stage. Prepare harvest logistics and APMC market check.`,
        recommendedAction: 'Check mandi market rates and schedule labor/machinery for harvest window.',
        category: 'HARVEST_DECISION',
        actionUrl: '/market'
      });
    }

    // 5. Market Price Trend Detection
    if (graph.marketContext && graph.marketContext.available && graph.marketContext.price) {
      events.push({
        eventId: `evt_mkt_${farmId}_${now.getTime()}`,
        eventType: 'MARKET_PRICE_CHANGED',
        userId,
        farmId,
        fieldId,
        cropCycleId,
        cropName,
        source: 'MARKET_PROVIDER',
        severity: 'LOW',
        priority: 'INFO',
        evidence: [
          {
            source: 'Agmarknet Market Provider',
            sourceType: 'MARKET_PROVIDER',
            value: { commodity: graph.marketContext.commodity, price: graph.marketContext.price, marketName: graph.marketContext.marketName },
            observedAt: graph.marketContext.freshness.observedAt,
            freshness: graph.marketContext.freshness.freshness,
            confidence: 0.9,
            relevance: 'medium'
          }
        ],
        context: { commodity: graph.marketContext.commodity, price: graph.marketContext.price, mandi: graph.marketContext.marketName },
        detectedAt: nowIso,
        observedAt: graph.marketContext.freshness.observedAt,
        freshness: graph.marketContext.freshness.freshness,
        confidence: 0.9,
        expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'DETECTED',
        fingerprint: `${farmId}_market_${graph.marketContext.commodity}_${graph.marketContext.price}`,
        title: `Market Intelligence: ${graph.marketContext.commodity}`,
        summary: `Current price at ${graph.marketContext.marketName || 'local APMC'} is ₹${graph.marketContext.price}/quintal (${graph.marketContext.trend || 'STABLE'} trend).`,
        recommendedAction: 'Compare prices across nearby markets before selling.',
        category: 'MARKET_INFORMATION_DECISION',
        actionUrl: '/market'
      });
    }

    // 6. Stale Soil Test Audit Event
    if (graph.soilContext && graph.soilContext.available && graph.soilContext.freshness.freshness === 'STALE') {
      events.push({
        eventId: `evt_soil_${farmId}_${now.getTime()}`,
        eventType: 'SOIL_CONDITION_CHANGED',
        userId,
        farmId,
        fieldId,
        cropCycleId,
        cropName,
        source: 'SOIL_ANALYSIS',
        severity: 'MODERATE',
        priority: 'LOW',
        evidence: [
          {
            source: 'Soil Analysis Database',
            sourceType: 'SOIL_ANALYSIS',
            value: { freshness: 'STALE' },
            confidence: 0.8,
            relevance: 'medium'
          }
        ],
        context: { freshness: 'STALE' },
        detectedAt: nowIso,
        observedAt: graph.soilContext.freshness.observedAt,
        freshness: 'STALE',
        confidence: 0.8,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'DETECTED',
        fingerprint: `${farmId}_soil_stale_${Math.floor(now.getTime() / (30 * 24 * 3600 * 1000))}`,
        title: `Soil Chemistry Audit Recommended`,
        summary: `Soil analysis data for ${graph.farm.name} is over 90 days old.`,
        recommendedAction: 'Schedule a fresh digital soil analysis test to update NPK basal recommendations.',
        category: 'NUTRIENT_DECISION',
        actionUrl: '/dashboard'
      });
    }

    return events;
  }
}
