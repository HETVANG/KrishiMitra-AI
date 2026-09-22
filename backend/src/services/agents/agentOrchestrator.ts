import { AgentRegistry } from './agentRegistry';
import { AgentExecutor } from './agentExecutor';
import { AgentVerifier } from './agentVerifier';
import { AgentActivity } from '../../models/AgentActivity';
import { CopilotContextService } from '../CopilotContextService';
import { farmEventBus, FarmEventPayload } from './agentEvents';

export class AgentOrchestrator {
  private static isInitialized = false;

  /**
   * Initialize event subscribers for automated farm events
   */
  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    farmEventBus.on('farmEvent', async (payload: FarmEventPayload) => {
      try {
        await this.runOrchestrator(payload.userId, payload.type, payload.metadata);
      } catch (err) {
        console.error('[AgentOrchestrator] Error processing event payload:', err);
      }
    });
  }

  /**
   * Core Orchestration Cycle
   */
  static async runOrchestrator(
    userId: string,
    eventType: string = 'SCHEDULED_DAILY_RUN',
    metadata?: any
  ): Promise<{
    processedAgentsCount: number;
    activitiesCount: number;
    pendingApprovalsCount: number;
  }> {
    const agents = AgentRegistry.getAllAgents();
    const context = await CopilotContextService.getFarmContext(userId);
    const farmId = context.farm.id;

    let activitiesCount = 0;
    let pendingApprovalsCount = 0;

    for (const agent of agents) {
      try {
        // 1. Perception & Reasoning -> Generate Plan
        const plan = await agent.evaluate(userId, eventType, metadata);
        if (!plan || plan.steps.length === 0) continue;

        // Create initial Audit Activity Record (PLANNED)
        const activityDoc = await AgentActivity.create({
          user: userId,
          farm: farmId,
          agentType: agent.id,
          eventType: eventType,
          observation: plan.objective,
          reasoningSummary: plan.explanation,
          evidence: plan.evidence,
          status: 'PLANNED',
          approvalRequired: plan.requiresApproval
        });

        activitiesCount++;

        // 2. Policy Check & Tool Execution Loop
        for (const step of plan.steps) {
          const execRes = await AgentExecutor.executeStep(userId, step);

          if (execRes.status === 'WAITING_APPROVAL') {
            pendingApprovalsCount++;
            await AgentActivity.findByIdAndUpdate(activityDoc._id, {
              status: 'WAITING_APPROVAL',
              approvalRequired: true,
              action: {
                toolName: step.toolName,
                parameters: step.parameters,
                summary: step.description
              }
            });
          } else if (execRes.status === 'EXECUTED') {
            // 3. Verification
            const verified = await AgentVerifier.verifyResult(step.toolName, execRes.result);
            await AgentActivity.findByIdAndUpdate(activityDoc._id, {
              status: verified ? 'VERIFIED' : 'EXECUTED',
              completedAt: new Date(),
              action: {
                toolName: step.toolName,
                parameters: step.parameters,
                summary: step.description
              }
            });
          } else if (execRes.status === 'FAILED' || execRes.status === 'REJECTED') {
            await AgentActivity.findByIdAndUpdate(activityDoc._id, {
              status: execRes.status,
              completedAt: new Date(),
              action: {
                toolName: step.toolName,
                parameters: step.parameters,
                summary: step.description
              }
            });
          }
        }
      } catch (agentErr) {
        console.error(`[AgentOrchestrator] Error running agent ${agent.id}:`, agentErr);
      }
    }

    return {
      processedAgentsCount: agents.length,
      activitiesCount,
      pendingApprovalsCount
    };
  }
}
