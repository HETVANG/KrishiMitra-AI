export interface AgentPlanStep {
  toolName: string;
  parameters: Record<string, any>;
  description: string;
  requiresApproval: boolean;
}

export interface AgentStructuredPlan {
  agentType: string;
  objective: string;
  steps: AgentPlanStep[];
  requiredData: string[];
  risksIdentified: string[];
  expectedOutcome: string;
  requiresApproval: boolean;
  explanation: string;
  evidence: Record<string, any>;
}

export class AgentPlanner {
  /**
   * Constructs a structured plan from agent perception and observations
   */
  static createPlan(
    agentType: string,
    objective: string,
    steps: AgentPlanStep[],
    requiredData: string[],
    risksIdentified: string[],
    expectedOutcome: string,
    explanation: string,
    evidence: Record<string, any> = {}
  ): AgentStructuredPlan {
    const requiresApproval = steps.some(s => s.requiresApproval);

    return {
      agentType,
      objective,
      steps,
      requiredData,
      risksIdentified,
      expectedOutcome,
      requiresApproval,
      explanation,
      evidence
    };
  }
}
