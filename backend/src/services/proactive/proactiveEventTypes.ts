import { SourceType, DataFreshness } from '../knowledgeGraph/graphTypes';
import { DecisionCategory } from '../decisionEngine/decisionTypes';

export type EventSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type EventPriority = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ProactiveEventStatus =
  | 'DETECTED'
  | 'EVALUATING'
  | 'ACTION_REQUIRED'
  | 'NOTIFIED'
  | 'ACKNOWLEDGED'
  | 'RESOLVED'
  | 'EXPIRED'
  | 'DISMISSED';

export type ProactiveEventType =
  | 'WEATHER_UPDATED'
  | 'HEAVY_RAIN_DETECTED'
  | 'RAINFALL_EXPECTED'
  | 'HEAT_RISK_DETECTED'
  | 'COLD_RISK_DETECTED'
  | 'FROST_RISK_DETECTED'
  | 'WATER_STRESS_DETECTED'
  | 'EXCESS_MOISTURE_DETECTED'
  | 'IRRIGATION_RECOMMENDED'
  | 'IRRIGATION_OVERDUE'
  | 'DISEASE_RISK_INCREASED'
  | 'DISEASE_SCAN_COMPLETED'
  | 'DISEASE_PROGRESS_DETECTED'
  | 'CROP_HEALTH_DETERIORATION'
  | 'CROP_STAGE_CHANGED'
  | 'CROP_STAGE_APPROACHING'
  | 'PLANTING_WINDOW_APPROACHING'
  | 'HARVEST_WINDOW_APPROACHING'
  | 'MARKET_PRICE_CHANGED'
  | 'MARKET_TREND_CHANGED'
  | 'MARKET_DATA_BECAME_STALE'
  | 'TASK_DUE'
  | 'TASK_OVERDUE'
  | 'TASK_CREATED'
  | 'TASK_APPROVAL_REQUIRED'
  | 'SOIL_ANALYSIS_COMPLETED'
  | 'SOIL_CONDITION_CHANGED'
  | 'EXPERT_RESPONSE_RECEIVED'
  | 'AGENT_RECOMMENDATION_READY';

export interface ProactiveEvidence {
  source: string;
  sourceType: SourceType;
  value?: any;
  observedAt?: string;
  freshness?: DataFreshness;
  confidence?: number;
  relevance?: 'high' | 'medium' | 'low';
}

export interface ProactiveEvent {
  eventId: string;
  eventType: ProactiveEventType;
  userId: string;
  farmId?: string;
  fieldId?: string;
  cropCycleId?: string;
  cropName?: string;
  source: SourceType;
  severity: EventSeverity;
  priority: EventPriority;
  evidence: ProactiveEvidence[];
  context: Record<string, any>;
  detectedAt: string;
  observedAt: string;
  freshness: DataFreshness;
  confidence: number;
  expiresAt: string;
  status: ProactiveEventStatus;
  fingerprint: string;
  title: string;
  summary: string;
  recommendedAction?: string;
  category: DecisionCategory;
  actionUrl?: string;
}

export interface DailyFarmBrief {
  date: string;
  farmId: string;
  farmName: string;
  location: string;
  weatherSummary: {
    temp: string;
    condition: string;
    rainProbability: string;
    alert?: string;
  };
  cropLifecycleSummary: Array<{
    cropName: string;
    stage: string;
    ageDays: number;
    harvestStatus?: string;
  }>;
  cropHealthStatus: {
    overall: string;
    activeRisksCount: number;
    latestScan?: string;
  };
  irrigationStatus: {
    attentionNeeded: boolean;
    recommendation: string;
  };
  priorityTasks: Array<{
    id: string;
    title: string;
    priority: string;
    dueDate?: string;
  }>;
  marketSummary?: {
    commodity: string;
    price: string;
    mandi: string;
    trend: string;
  };
  activeAlerts: Array<{
    id: string;
    title: string;
    priority: string;
    eventType: string;
  }>;
  copilotSuggestedAction: string;
}
