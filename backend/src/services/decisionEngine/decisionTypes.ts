export type DecisionCategory =
  | 'IRRIGATION_DECISION'
  | 'CROP_HEALTH_DECISION'
  | 'DISEASE_RESPONSE_DECISION'
  | 'NUTRIENT_DECISION'
  | 'WEATHER_RESPONSE_DECISION'
  | 'CROP_STAGE_DECISION'
  | 'FARM_TASK_DECISION'
  | 'HARVEST_DECISION'
  | 'MARKET_INFORMATION_DECISION'
  | 'RISK_ALERT_DECISION'
  | 'EXPERT_CONSULTATION_DECISION';

export type DecisionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DecisionStatus =
  | 'EVALUATED'
  | 'INSUFFICIENT_DATA'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED'
  | 'FAILED';

export type DecisionTimeframe = 'NOW' | 'TODAY' | 'NEXT_24_HOURS' | 'NEXT_3_DAYS' | 'NEXT_7_DAYS' | 'SEASON';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';

export interface EvidenceItem {
  id: string;
  source: string;
  sourceType: string;
  value: any;
  observedAt: string;
  freshness: string;
  confidence: number;
  relevance: 'high' | 'medium' | 'low';
}

export interface RiskItem {
  category: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  reasons: string[];
  evidence: EvidenceItem[];
  timeHorizon: string;
  confidence: number;
}

export interface OptionItem {
  id: string;
  title: string;
  action: string;
  benefits: string[];
  risks: string[];
  requirements: string[];
  urgency: string;
  approvalRequired: boolean;
}

export interface ActionStepItem {
  stepNumber: number;
  action: string;
  reason: string;
  priority: string;
  deadline: string;
  approvalRequired: boolean;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

export interface StructuredDecision {
  decisionId: string;
  userId: string;
  farmId: string;
  fieldId?: string;
  cropCycleId?: string;
  decisionType: DecisionCategory;
  objective: string;
  status: DecisionStatus;
  priority: DecisionPriority;
  timeframe: DecisionTimeframe;
  evidence: EvidenceItem[];
  observations: string[];
  risks: RiskItem[];
  options: OptionItem[];
  recommendation: {
    action: string;
    summary: string;
    rationale: string;
    expectedOutcome: string;
  };
  confidence: ConfidenceLevel;
  confidenceScore: number;
  uncertainty: {
    identifiedUncertainties: string[];
    missingData: string[];
  };
  assumptions: string[];
  requiredApproval: boolean;
  policyReason: string;
  requiredTools: string[];
  actionPlan: ActionStepItem[];
  createdAt: string;
  expiresAt: string;
}
