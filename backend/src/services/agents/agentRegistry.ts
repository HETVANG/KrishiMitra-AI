import { CopilotContextService } from '../CopilotContextService';
import { AgentPlanner, AgentStructuredPlan } from './agentPlanner';

export interface SpecializedAgent {
  id: string;
  name: string;
  description: string;
  evaluate: (userId: string, eventType: string, metadata?: any) => Promise<AgentStructuredPlan | null>;
}

export class AgentRegistry {
  private static agents: Map<string, SpecializedAgent> = new Map();

  static registerAgent(agent: SpecializedAgent) {
    this.agents.set(agent.id, agent);
  }

  static getAgent(id: string): SpecializedAgent | undefined {
    return this.agents.get(id);
  }

  static getAllAgents(): SpecializedAgent[] {
    return Array.from(this.agents.values());
  }
}

// 1. Farm Monitoring Agent
AgentRegistry.registerAgent({
  id: 'farm_monitoring',
  name: 'Farm Monitoring Agent',
  description: 'Continuously monitors overall farm health, weather events, environmental threats, and field condition stability.',
  evaluate: async (userId: string, eventType: string) => {
    const context = await CopilotContextService.getFarmContext(userId);
    const observations: string[] = [];
    const steps: any[] = [];
    const risks: string[] = [];

    // Weather checks
    if (context.weather.available) {
      if ((context.weather.rainProbability || 0) > 70) {
        observations.push(`High rainfall probability detected: ${context.weather.rainProbability}%`);
        risks.push('Potential waterlogging or fertilizer run-off');
      }
      if ((context.weather.tempCelsius || 25) > 38) {
        observations.push(`High heat conditions detected: ${context.weather.tempCelsius}°C`);
        risks.push('Heat stress and increased transpiration');
      }
    }

    // Disease checks
    if (context.disease.available && context.disease.latestDiagnosis) {
      const diag = context.disease.latestDiagnosis;
      observations.push(`Latest disease scan: ${diag.disease} (${diag.severity || 'moderate'}) on ${diag.crop}`);
      if (diag.severity === 'severe' || diag.severity === 'high') {
        risks.push(`Active severe disease outbreak: ${diag.disease}`);
      }
    }

    if (observations.length === 0) return null;

    if (risks.length > 0) {
      steps.push({
        toolName: 'createNotification',
        parameters: {
          title: 'Farm Environment Alert',
          message: `Monitoring Agent detected: ${observations.join('. ')}. Recommendations: Inspect field conditions.`,
          type: 'weather'
        },
        description: 'Send farm environment alert notification',
        requiresApproval: false
      });
    }

    return AgentPlanner.createPlan(
      'farm_monitoring',
      'Monitor overall farm environmental stability and risk factors',
      steps,
      ['weather', 'disease', 'farmContext'],
      risks,
      'Maintain farm environment awareness and notify farmer of sudden shifts',
      `Evaluated farm context for ${context.farm.name}. Triggered by event: ${eventType}`,
      { weather: context.weather, disease: context.disease }
    );
  }
});

// 2. Crop Health Agent
AgentRegistry.registerAgent({
  id: 'crop_health',
  name: 'Crop Health Agent',
  description: 'Specializes in leaf pathology, disease follow-ups, treatment progress, and specialist advisory recommendations.',
  evaluate: async (userId: string, eventType: string) => {
    const context = await CopilotContextService.getFarmContext(userId);
    if (!context.disease.available || !context.disease.latestDiagnosis) return null;

    const diag = context.disease.latestDiagnosis;
    const steps: any[] = [];
    const risks: string[] = [];

    if (diag.severity === 'high' || diag.severity === 'severe') {
      risks.push(`High severity pathology diagnosis: ${diag.disease}`);

      // Recommend Expert Consultation
      steps.push({
        toolName: 'requestExpertConsultation',
        parameters: {
          topic: `Severe ${diag.disease} Advisory`,
          reason: `Pathology analysis detected high severity ${diag.disease} on ${diag.crop || 'crop'}. Recommended specialist review.`,
          agentType: 'crop_health',
          explanation: `Leaf pathology scan identified ${diag.disease} with ${diag.confidence ? Math.round(diag.confidence * 100) : 85}% confidence.`
        },
        description: 'Draft expert consultation task for specialist review',
        requiresApproval: true
      });
    } else {
      steps.push({
        toolName: 'createFarmTask',
        parameters: {
          title: `Inspect ${diag.crop || 'Crop'} for ${diag.disease}`,
          reason: `Follow up on recent pathology diagnosis (${diag.disease}). Check if symptoms have improved.`,
          priority: 'medium',
          category: 'disease_check',
          agentType: 'crop_health',
          explanation: `Routine follow-up scan recommendation for ${diag.disease}.`,
          evidence: { disease: diag.disease, severity: diag.severity }
        },
        description: 'Create follow-up inspection task',
        requiresApproval: true
      });
    }

    return AgentPlanner.createPlan(
      'crop_health',
      `Monitor crop pathology and follow up on ${diag.disease}`,
      steps,
      ['diseaseHistory', 'cropStage'],
      risks,
      'Ensure disease recovery and prevent crop loss',
      `Evaluated leaf pathology data for ${diag.crop || 'active crop'}. Identified disease: ${diag.disease}`,
      { diagnosis: diag }
    );
  }
});

// 3. Irrigation Agent
AgentRegistry.registerAgent({
  id: 'irrigation',
  name: 'Irrigation Agent',
  description: 'Evaluates hydro-telemetry, soil moisture levels, and rainfall forecasts to prevent drought stress or excess moisture.',
  evaluate: async (userId: string, eventType: string) => {
    const context = await CopilotContextService.getFarmContext(userId);
    const steps: any[] = [];
    const risks: string[] = [];

    const rainProb = context.weather.rainProbability || 0;
    const temp = context.weather.tempCelsius || 25;

    if (rainProb > 60) {
      steps.push({
        toolName: 'createNotification',
        parameters: {
          title: 'Irrigation Advisory: Pause Watering',
          message: `Rainfall probability is ${rainProb}%. Consider holding planned irrigation to prevent root waterlogging.`,
          type: 'weather'
        },
        description: 'Notify farmer to delay irrigation due to expected rainfall',
        requiresApproval: false
      });
    } else if (temp > 35 && rainProb < 20) {
      risks.push('High evaporative loss and potential moisture stress');
      steps.push({
        toolName: 'createFarmTask',
        parameters: {
          title: 'Review Field Irrigation & Soil Moisture',
          reason: `High temperature (${temp}°C) and low rainfall chance (${rainProb}%). Verify soil moisture.`,
          priority: 'high',
          category: 'irrigation',
          agentType: 'irrigation',
          explanation: 'Evaporative moisture loss is high due to heat conditions.',
          evidence: { temp, rainProb }
        },
        description: 'Create high-priority irrigation review task',
        requiresApproval: true
      });
    }

    if (steps.length === 0) return null;

    return AgentPlanner.createPlan(
      'irrigation',
      'Optimize crop watering schedules based on hydro-telemetry and weather',
      steps,
      ['weather', 'soilMoisture', 'cropStage'],
      risks,
      'Maintain optimal soil moisture while avoiding over-irrigation',
      `Evaluated moisture parameters. Temperature: ${temp}°C, Rain Probability: ${rainProb}%`,
      { temp, rainProb }
    );
  }
});

// 4. Market Intelligence Agent
AgentRegistry.registerAgent({
  id: 'market',
  name: 'Market Intelligence Agent',
  description: 'Monitors market mandi price trends and arrival volumes to provide factual summaries without price speculation.',
  evaluate: async (userId: string, eventType: string) => {
    const context = await CopilotContextService.getFarmContext(userId);
    if (!context.market.available || !context.market.avgPrice) return null;

    const steps: any[] = [];
    const commodity = context.market.commodity || 'Wheat';
    const price = context.market.avgPrice;
    const unit = context.market.unit || 'Qtl';
    const currencySymbol = context.regionalContext?.currencySymbol || '₹';
    const isSupported = context.regionalContext?.supported ?? true;

    if (!isSupported) {
      steps.push({
        toolName: 'createNotification',
        parameters: {
          title: `Market Intelligence (${context.regionalContext?.countryName || 'Global'})`,
          message: `Live market provider feeds are currently active for India (Agmarknet). Regional market feeds for ${context.regionalContext?.countryName} are not active yet.`,
          type: 'market'
        },
        description: 'Send regional market provider status notification',
        requiresApproval: false
      });
    } else {
      steps.push({
        toolName: 'createNotification',
        parameters: {
          title: `Market Rate Update: ${commodity}`,
          message: `Current modal price in ${context.market.marketName || 'local market'} is ${currencySymbol}${price}/${unit} (${context.market.trend || 'STABLE'} trend).`,
          type: 'market'
        },
        description: 'Send factual market price notification',
        requiresApproval: false
      });
    }

    return AgentPlanner.createPlan(
      'market',
      `Monitor market price movement for ${commodity}`,
      steps,
      ['marketPrices', 'historicalTrends'],
      [],
      'Keep farmer informed of factual mandi rates',
      `Retrieved latest market rate for ${commodity}: ${currencySymbol}${price}/${unit} in ${context.market.marketName || 'local market'}`,
      { market: context.market, regionalContext: context.regionalContext }
    );
  }
});

// 5. Farm Planning Agent
AgentRegistry.registerAgent({
  id: 'planning',
  name: 'Farm Planning Agent',
  description: 'Synthesizes crop lifecycle milestones, weather forecasts, and field activities to generate prioritized task plans.',
  evaluate: async (userId: string, eventType: string) => {
    const context = await CopilotContextService.getFarmContext(userId);
    const activeCrops = context.cropCycles || [];
    if (activeCrops.length === 0) return null;

    const currentCrop = activeCrops[0];
    const steps: any[] = [];

    steps.push({
      toolName: 'createFarmTask',
      parameters: {
        title: `Field Inspection: ${currentCrop.cropName} (${currentCrop.currentStage})`,
        reason: `Routine lifecycle inspection for ${currentCrop.cropName} in ${currentCrop.fieldName}. Current stage: ${currentCrop.currentStage}.`,
        priority: 'medium',
        category: 'general',
        agentType: 'planning',
        cropCycleId: currentCrop.id,
        explanation: `Task generated by Farm Planning Agent for stage: ${currentCrop.currentStage}`
      },
      description: 'Create routine crop stage inspection task',
      requiresApproval: true
    });

    return AgentPlanner.createPlan(
      'planning',
      `Generate prioritized field tasks for ${currentCrop.cropName}`,
      steps,
      ['cropLifecycle', 'weather', 'activities'],
      [],
      'Ensure timely completion of crop growth stage management tasks',
      `Evaluated active crop cycle for ${currentCrop.cropName} (${currentCrop.fieldName}). Growth stage: ${currentCrop.currentStage}`,
      { cropCycle: currentCrop }
    );
  }
});
