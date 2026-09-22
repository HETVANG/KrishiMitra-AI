import { ToolRegistry } from './toolRegistry';
import { AgentPolicyEngine } from './agentPolicyEngine';
import { AgentPlanStep } from './agentPlanner';

export interface StepExecutionResult {
  step: AgentPlanStep;
  success: boolean;
  status: 'EXECUTED' | 'WAITING_APPROVAL' | 'REJECTED' | 'FAILED';
  result?: any;
  error?: string;
  approvalRequired: boolean;
}

export class AgentExecutor {
  /**
   * Safely execute a planned step according to tool permissions and policy rules
   */
  static async executeStep(
    userId: string,
    step: AgentPlanStep
  ): Promise<StepExecutionResult> {
    const tool = ToolRegistry.getTool(step.toolName);
    if (!tool) {
      return {
        step,
        success: false,
        status: 'FAILED',
        error: `Tool ${step.toolName} not registered in ToolRegistry`,
        approvalRequired: false
      };
    }

    // Evaluate Policy Engine
    const policyDecision = await AgentPolicyEngine.evaluateAction(userId, step.toolName, tool.permission);

    if (!policyDecision.allowed) {
      return {
        step,
        success: false,
        status: 'REJECTED',
        error: policyDecision.reason,
        approvalRequired: false
      };
    }

    // Check if farmer approval is required
    const needsApproval = tool.requiresApproval || policyDecision.requiresApproval;

    if (needsApproval && !step.parameters?.approvedByFarmer) {
      // Step requires farmer approval first; do not execute automatically!
      return {
        step,
        success: true,
        status: 'WAITING_APPROVAL',
        result: { message: 'Action queued for farmer approval.' },
        approvalRequired: true
      };
    }

    // Execute registered tool handler
    try {
      const execRes = await tool.handler(userId, step.parameters);
      if (execRes.success) {
        return {
          step,
          success: true,
          status: 'EXECUTED',
          result: execRes.result,
          approvalRequired: false
        };
      } else {
        return {
          step,
          success: false,
          status: 'FAILED',
          error: execRes.error || 'Tool execution failed',
          approvalRequired: false
        };
      }
    } catch (err: any) {
      return {
        step,
        success: false,
        status: 'FAILED',
        error: err.message,
        approvalRequired: false
      };
    }
  }
}
