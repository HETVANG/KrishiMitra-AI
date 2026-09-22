import { CopilotContextService } from '../CopilotContextService';
import { CropCycle } from '../../models/CropCycle';
import { SoilAnalysis } from '../../models/SoilAnalysis';
import { DiseaseHistory } from '../../models/DiseaseHistory';
import { MarketPrice } from '../../models/MarketPrice';
import { FarmActivity } from '../../models/FarmActivity';
import { FarmTask } from '../../models/FarmTask';
import { Notification } from '../../models/Notification';
import { PredictiveController } from '../../controllers/PredictiveController';
import { IrrigationController } from '../../controllers/IrrigationController';

export type ToolPermissionLevel = 'READ_ONLY' | 'RECOMMENDATION' | 'REQUIRES_APPROVAL' | 'AUTOMATED_ALLOWED';

export interface AgentToolDefinition {
  name: string;
  description: string;
  permission: ToolPermissionLevel;
  requiresApproval: boolean;
  handler: (userId: string, params: any) => Promise<{ success: boolean; result?: any; error?: string }>;
}

export class ToolRegistry {
  private static tools: Map<string, AgentToolDefinition> = new Map();

  static registerTool(tool: AgentToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  static getTool(name: string): AgentToolDefinition | undefined {
    return this.tools.get(name);
  }

  static getAllTools(): AgentToolDefinition[] {
    return Array.from(this.tools.values());
  }
}

// Initialize & register tools
ToolRegistry.registerTool({
  name: 'getFarmContext',
  description: 'Retrieve normalized farm context including location, soil, weather, disease, and market overview.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    try {
      const context = await CopilotContextService.getFarmContext(userId, params?.farmId);
      return { success: true, result: context };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
});

ToolRegistry.registerTool({
  name: 'getCropCycle',
  description: 'Retrieve active or recent crop cycles for the user.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    try {
      const filter: any = { user: userId };
      if (params?.status) filter.status = params.status;
      const cycles = await CropCycle.find(filter).sort({ createdAt: -1 }).lean();
      return { success: true, result: cycles };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
});

ToolRegistry.registerTool({
  name: 'getSoilAnalysis',
  description: 'Retrieve latest soil analysis test results for the user.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string) => {
    try {
      const soil = await SoilAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
      return { success: true, result: soil };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
});

ToolRegistry.registerTool({
  name: 'getDiseaseHistory',
  description: 'Retrieve leaf pathology disease scan history.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    try {
      const limit = params?.limit || 5;
      const history = await DiseaseHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean();
      return { success: true, result: history };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
});

ToolRegistry.registerTool({
  name: 'getMarketPrices',
  description: 'Retrieve live market prices for a commodity.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    try {
      const crop = params?.crop || 'Wheat';
      const prices = await MarketPrice.find({ crop: new RegExp(crop, 'i') }).sort({ lastUpdated: -1 }).limit(5).lean();
      return { success: true, result: prices };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
});

ToolRegistry.registerTool({
  name: 'getFarmActivities',
  description: 'Retrieve historical farm activities for a crop cycle.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    try {
      const filter: any = { user: userId };
      if (params?.cropCycleId) filter.cropCycle = params.cropCycleId;
      const activities = await FarmActivity.find(filter).sort({ date: -1 }).limit(10).lean();
      return { success: true, result: activities };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
});

// Write / Modifying Tools (Requires Approval)
ToolRegistry.registerTool({
  name: 'createFarmTask',
  description: 'Create a farmer-facing farm task.',
  permission: 'REQUIRES_APPROVAL',
  requiresApproval: true,
  handler: async (userId: string, params: any) => {
    try {
      const context = await CopilotContextService.getFarmContext(userId, params?.farmId);
      const farmId = context.farm.id;
      if (!farmId) {
        return { success: false, error: 'No active farm found for user' };
      }
      const task = await FarmTask.create({
        user: userId,
        farm: farmId,
        title: params.title || 'Agent Recommended Task',
        reason: params.reason || 'Automated agent recommendation',
        priority: params.priority || 'medium',
        dueDate: params.dueDate || new Date().toISOString().split('T')[0],
        category: params.category || 'general',
        status: params.requiresApproval ? 'WAITING_APPROVAL' : 'TODO',
        approvalRequired: params.requiresApproval ?? true,
        approvedBy: params.approvedBy || null,
        agentType: params.agentType || 'system',
        cropCycleId: params.cropCycleId || null,
        evidence: params.evidence || null,
        explanation: params.explanation || null
      });
      return { success: true, result: task };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
});

ToolRegistry.registerTool({
  name: 'createNotification',
  description: 'Send an in-app notification to the farmer.',
  permission: 'REQUIRES_APPROVAL',
  requiresApproval: false, // Notifications can be auto-allowed if policy permits
  handler: async (userId: string, params: any) => {
    try {
      const notif = await Notification.create({
        user: userId,
        title: params.title || 'Agent Insight',
        message: params.message || 'New farm observation',
        type: params.type || 'general'
      });
      return { success: true, result: notif };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
});

ToolRegistry.registerTool({
  name: 'requestExpertConsultation',
  description: 'Suggest or draft an expert consultation request.',
  permission: 'REQUIRES_APPROVAL',
  requiresApproval: true,
  handler: async (userId: string, params: any) => {
    try {
      // Creates a high priority task for booking consultation
      const context = await CopilotContextService.getFarmContext(userId);
      if (!context.farm.id) return { success: false, error: 'No farm found' };
      const task = await FarmTask.create({
        user: userId,
        farm: context.farm.id,
        title: `Expert Consultation: ${params.topic || 'Crop Health Advisory'}`,
        reason: params.reason || 'Agent identified severe disease condition requiring specialist review.',
        priority: 'high',
        dueDate: new Date().toISOString().split('T')[0],
        category: 'disease_check',
        status: 'WAITING_APPROVAL',
        approvalRequired: true,
        agentType: params.agentType || 'crop_health',
        explanation: params.explanation || 'Recommended expert consultation based on leaf diagnosis.'
      });
      return { success: true, result: task };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
});
