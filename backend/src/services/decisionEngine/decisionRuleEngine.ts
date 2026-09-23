import { NormalizedFarmGraphContext } from '../knowledgeGraph/graphTypes';
import { DecisionCategory } from './decisionTypes';

export interface RuleMatch {
  ruleId: string;
  category: DecisionCategory;
  title: string;
  conditionMet: boolean;
  explanation: string;
  recommendedAction: string;
  requiresApproval: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class DecisionRuleEngine {
  /**
   * Evaluate deterministic agronomic rules on Farm Graph Context
   */
  static evaluateRules(graph: NormalizedFarmGraphContext): RuleMatch[] {
    const matches: RuleMatch[] = [];

    // Rule 1: High Rainfall Forecast -> Hold Irrigation
    const rainProb = graph.weatherContext.rainProbability || 0;
    if (rainProb >= 60) {
      matches.push({
        ruleId: 'rule_rain_irrigation_hold',
        category: 'IRRIGATION_DECISION',
        title: 'Rainfall Forecast Rule: Delay Irrigation',
        conditionMet: true,
        explanation: `Rainfall probability is ${rainProb}%. Holding irrigation prevents root waterlogging and saves water.`,
        recommendedAction: 'Hold scheduled irrigation for 24-48 hours and monitor rain accumulation.',
        requiresApproval: false,
        priority: 'HIGH'
      });
    }

    // Rule 2: High Ambient Temperature + Dry Weather -> Heat Stress Watch
    const tempC = graph.weatherContext.tempCelsius || 25;
    if (tempC >= 38 && rainProb < 20) {
      matches.push({
        ruleId: 'rule_heat_stress_irrigation',
        category: 'WEATHER_RESPONSE_DECISION',
        title: 'Heat Stress Prevention Rule',
        conditionMet: true,
        explanation: `Ambient temperature reached ${tempC}°C with low rain probability (${rainProb}%). Evapotranspiration is high.`,
        recommendedAction: 'Verify field soil moisture and schedule light evening irrigation if topsoil is dry.',
        requiresApproval: true,
        priority: 'HIGH'
      });
    }

    // Rule 3: Severe Disease Diagnosis -> Expert Consultation
    if (graph.diseaseContext.available && graph.diseaseContext.latestDiagnosis) {
      const diag = graph.diseaseContext.latestDiagnosis;
      if (diag.severity === 'severe' || diag.severity === 'high') {
        matches.push({
          ruleId: 'rule_severe_disease_expert',
          category: 'EXPERT_CONSULTATION_DECISION',
          title: 'Pathology Outbreak Escalation Rule',
          conditionMet: true,
          explanation: `Leaf pathology scan identified high severity ${diag.disease} on ${diag.crop}. Specialist advisory recommended.`,
          recommendedAction: 'Draft expert consultation task for specialist review and isolate affected field patch.',
          requiresApproval: true,
          priority: 'CRITICAL'
        });
      }
    }

    // Rule 4: Stale Soil Test Data -> Schedule Soil Re-test
    if (graph.soilContext.available && graph.soilContext.freshness.freshness === 'STALE') {
      matches.push({
        ruleId: 'rule_stale_soil_retest',
        category: 'NUTRIENT_DECISION',
        title: 'Soil Nutrient Audit Rule',
        conditionMet: true,
        explanation: 'Soil chemistry analysis data is over 90 days old.',
        recommendedAction: 'Schedule a fresh digital soil analysis test to update NPK basal recommendations.',
        requiresApproval: true,
        priority: 'MEDIUM'
      });
    }

    // Rule 5: Unsupported Regional Market Feed -> Suppress Market Advice
    if (graph.regionalContext && graph.regionalContext.supported === false) {
      matches.push({
        ruleId: 'rule_unsupported_market_suppress',
        category: 'MARKET_INFORMATION_DECISION',
        title: 'Regional Provider Rule: Factual Market Status',
        conditionMet: true,
        explanation: `Live market provider feeds are currently active for India (Agmarknet). Regional market feeds for ${graph.regionalContext.countryName} are not active.`,
        recommendedAction: 'Display market feed unavailability status without generating fake price estimations.',
        requiresApproval: false,
        priority: 'LOW'
      });
    }

    return matches;
  }
}
