import { AgentPolicy } from '../../models/AgentPolicy';
import { ToolPermissionLevel } from './toolRegistry';

export interface PolicyDecision {
  allowed: boolean;
  requiresApproval: boolean;
  reason: string;
}

export class AgentPolicyEngine {
  /**
   * Fetch or initialize default user AgentPolicy
   */
  static async getUserPolicy(userId: string) {
    let policy = await AgentPolicy.findOne({ user: userId });
    if (!policy) {
      policy = await AgentPolicy.create({
        user: userId,
        autoAlertsEnabled: true,
        autoRemindersEnabled: true,
        autoTaskCreationEnabled: false, // Default requires approval
        expertConsultationPolicy: 'ALWAYS_ASK',
        externalActionsEnabled: false
      });
    }
    return policy;
  }

  /**
   * Evaluate policy for a proposed tool execution
   */
  static async evaluateAction(
    userId: string,
    toolName: string,
    permission: ToolPermissionLevel
  ): Promise<PolicyDecision> {
    const policy = await this.getUserPolicy(userId);

    if (permission === 'READ_ONLY') {
      return {
        allowed: true,
        requiresApproval: false,
        reason: 'Read-only tool operations are always permitted.'
      };
    }

    if (toolName === 'createNotification') {
      if (!policy.autoAlertsEnabled) {
        return {
          allowed: false,
          requiresApproval: false,
          reason: 'Automatic alerts disabled in user policy settings.'
        };
      }
      return {
        allowed: true,
        requiresApproval: false,
        reason: 'Notification creation permitted by user policy.'
      };
    }

    if (toolName === 'createFarmTask') {
      if (policy.autoTaskCreationEnabled) {
        return {
          allowed: true,
          requiresApproval: false,
          reason: 'Automatic task creation enabled in user policy.'
        };
      } else {
        return {
          allowed: true,
          requiresApproval: true,
          reason: 'Task creation requires farmer approval by policy configuration.'
        };
      }
    }

    if (toolName === 'requestExpertConsultation') {
      return {
        allowed: true,
        requiresApproval: true,
        reason: 'Expert consultation requests unconditionally require farmer approval.'
      };
    }

    // Default safety fallback for unknown or modifying tools
    return {
      allowed: true,
      requiresApproval: true,
      reason: 'Safety fallback: Modifying action requires explicit farmer approval.'
    };
  }
}
