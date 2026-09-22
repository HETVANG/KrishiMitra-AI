import { DiseaseAnalysisResult } from './diseaseAnalysisService';
import { EnvironmentalRiskResult } from './diseaseRiskEngine';

export interface ActionPlanItem {
  actionType: 'IMMEDIATE_CHECK' | 'MONITOR' | 'PREVENTION' | 'EXPERT_CONSULTATION' | 'FOLLOW_UP';
  title: string;
  details: string;
}

export class DiseaseRecommendationService {
  /**
   * Build structured action plan categorized for farmer decision-making
   */
  static generateActionPlan(
    analysis: DiseaseAnalysisResult,
    severity: 'low' | 'moderate' | 'high' | 'uncertain',
    envRisk: EnvironmentalRiskResult
  ): ActionPlanItem[] {
    const plan: ActionPlanItem[] = [];

    if (analysis.condition === 'HEALTHY') {
      plan.push({
        actionType: 'MONITOR',
        title: 'Routine Field Observation',
        details: 'Crop leaf shows no active disease symptoms. Continue standard cultural practices and monitor foliage weekly.'
      });
      plan.push({
        actionType: 'PREVENTION',
        title: 'Balanced Agronomy',
        details: 'Maintain balanced irrigation and fertilizer schedules to support natural crop immunity.'
      });
      return plan;
    }

    if (analysis.condition === 'INSUFFICIENT_IMAGE_QUALITY' || analysis.condition === 'UNCERTAIN') {
      plan.push({
        actionType: 'IMMEDIATE_CHECK',
        title: 'Re-Scan Clear Leaf Image',
        details: 'Capture a well-lit, close-up photograph of the affected leaf blade under daylight to re-evaluate symptoms.'
      });
      plan.push({
        actionType: 'EXPERT_CONSULTATION',
        title: 'Consult Local Agronomist',
        details: 'If leaf damage persists or spreads, schedule a physical inspection with an agricultural officer.'
      });
      return plan;
    }

    // 1. IMMEDIATE CHECK
    plan.push({
      actionType: 'IMMEDIATE_CHECK',
      title: 'Inspect Neighboring Plants',
      details: `Examine surrounding ${analysis.crop || 'crop'} leaves and stalks within 5 meters to determine if symptoms (${analysis.symptoms.slice(0, 2).join(', ')}) are isolated or spreading.`
    });

    // 2. MONITOR
    plan.push({
      actionType: 'MONITOR',
      title: 'Track Symptom Progression',
      details: 'Check affected foliage daily over the next 48 to 72 hours. Re-scan using KrishiMitra if lesion size or yellowing increases.'
    });

    // 3. PREVENTION
    if (analysis.preventiveTips && analysis.preventiveTips.length > 0) {
      plan.push({
        actionType: 'PREVENTION',
        title: 'Foliage Protection & Aeration',
        details: analysis.preventiveTips.slice(0, 2).join(' ')
      });
    } else {
      plan.push({
        actionType: 'PREVENTION',
        title: 'Moisture Management',
        details: 'Avoid late evening overhead watering to reduce leaf wetness duration. Ensure clean field tools when pruning.'
      });
    }

    // 4. EXPERT CONSULTATION
    if (severity === 'high' || severity === 'moderate') {
      plan.push({
        actionType: 'EXPERT_CONSULTATION',
        title: 'Connect with Certified Agronomist',
        details: 'Use the "Ask an Expert" button to share this pathology report and photo with a verified specialist for custom treatment advice.'
      });
    }

    // 5. FOLLOW UP
    const recheckDays = severity === 'high' ? 2 : severity === 'moderate' ? 5 : 7;
    plan.push({
      actionType: 'FOLLOW_UP',
      title: `Scheduled Re-check in ${recheckDays} Days`,
      details: `Set a follow-up reminder to evaluate whether cultural adjustments or treatments have contained the ${analysis.diseaseName}.`
    });

    return plan;
  }
}
