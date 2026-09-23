import { NormalizedRegionalContext } from '../regionalContextService';

export type DataFreshness = 'FRESH' | 'RECENT' | 'STALE' | 'UNKNOWN';

export type SourceType =
  | 'FARM_RECORD'
  | 'USER_INPUT'
  | 'WEATHER_PROVIDER'
  | 'MARKET_PROVIDER'
  | 'SOIL_ANALYSIS'
  | 'DISEASE_SCAN'
  | 'AGRICULTURE_KNOWLEDGE'
  | 'AGENT_OBSERVATION'
  | 'EXPERT_CONSULTATION'
  | 'IRRIGATION_RECORD'
  | 'CROP_LIFECYCLE';

export interface FreshnessMetadata {
  observedAt: string;
  expiresAt?: string;
  freshness: DataFreshness;
  confidence: number;
  source: SourceType;
}

export interface FieldGraphNode {
  id: string;
  name: string;
  sizeAcres: number;
  soilType: string;
  waterSource: string;
  irrigationType: string;
  status: string;
  boundary?: number[][];
}

export interface CropCycleGraphNode {
  id: string;
  fieldId: string;
  fieldName: string;
  cropName: string;
  variety: string;
  currentStage: string;
  plantingDate: string;
  expectedHarvestDate?: string;
  status: string;
  ageInDays: number;
}

export interface NormalizedFarmGraphContext {
  user: {
    id: string;
    name: string;
    role: string;
    country: string;
  };
  farm: {
    id: string;
    name: string;
    sizeAcres: number;
    soilType: string;
    waterSource: string;
    location: {
      address: string;
      village: string;
      district: string;
      state: string;
      latitude: number | null;
      longitude: number | null;
    };
  };
  fields: FieldGraphNode[];
  activeCropCycles: CropCycleGraphNode[];
  soilContext: {
    available: boolean;
    ph: number | null;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
    organicMatter: number | null;
    freshness: FreshnessMetadata;
  };
  weatherContext: {
    available: boolean;
    tempCelsius: number | null;
    condition: string | null;
    humidity: number | null;
    rainProbability: number | null;
    windSpeed: number | null;
    freshness: FreshnessMetadata;
  };
  irrigationContext: {
    waterAttentionNeeded: boolean;
    reason: string;
    recommendedAction: string;
  };
  diseaseContext: {
    available: boolean;
    scansCount: number;
    latestDiagnosis: any;
    freshness: FreshnessMetadata;
  };
  marketContext: {
    available: boolean;
    commodity: string;
    price: number | null;
    marketName: string | null;
    trend: string | null;
    freshness: FreshnessMetadata;
  };
  taskContext: {
    pendingTasksCount: number;
    urgentTasks: any[];
  };
  regionalContext?: NormalizedRegionalContext;
  knowledgeContext?: {
    cropKnowledge?: any;
    diseaseKnowledge?: any;
    soilKnowledge?: any;
    sources: any[];
  };
  agentContext?: {
    activeAgentsCount: number;
    recentInsights: any[];
  };
  freshnessMap: Record<string, FreshnessMetadata>;
}
