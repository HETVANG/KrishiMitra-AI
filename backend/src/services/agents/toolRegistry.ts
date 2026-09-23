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
import { KnowledgeRetrievalService } from '../knowledge/knowledgeRetrievalService';
import { FarmKnowledgeGraphService } from '../knowledgeGraph/farmKnowledgeGraphService';
import { DecisionEngine } from '../decisionEngine/decisionEngine';
import { ProactiveEngine } from '../proactive/proactiveEngine';
import { MultiFarmService } from '../multiFarmService';
import { MarketplaceSearchService } from '../marketplace/marketplaceSearchService';
import { MarketplaceService } from '../marketplace/marketplaceService';
import { MarketplaceCategoryService } from '../marketplace/marketplaceCategoryService';
import { ProviderRegistry } from '../providers/ProviderRegistry';
import { ProviderHealthService } from '../providers/ProviderHealthService';

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

// Knowledge Retrieval READ_ONLY Tools
ToolRegistry.registerTool({
  name: 'getCropKnowledge',
  description: 'Retrieve verified crop agronomic profile, growth stages, soil, water, and climate requirements.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const res = KnowledgeRetrievalService.getCropKnowledge(params?.crop || 'wheat');
    return { success: res.success, result: res.crop, sources: res.sources };
  }
});

ToolRegistry.registerTool({
  name: 'getDiseaseKnowledge',
  description: 'Retrieve verified plant pathology disease details, symptoms, risk conditions, and prevention.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const res = KnowledgeRetrievalService.getDiseaseKnowledge(params?.disease || 'yellow_rust');
    return { success: res.success, result: res.disease, sources: res.sources };
  }
});

ToolRegistry.registerTool({
  name: 'getPestKnowledge',
  description: 'Retrieve verified pest information, symptoms, life cycle, and IPM prevention guidance.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const res = KnowledgeRetrievalService.getPestKnowledge(params?.pest || 'pink_bollworm');
    return { success: res.success, result: res.pest, sources: res.sources };
  }
});

ToolRegistry.registerTool({
  name: 'getSoilKnowledge',
  description: 'Retrieve soil profile, pH range, NPK characteristics, drainage, and suitable crops.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const res = KnowledgeRetrievalService.getSoilKnowledge(params?.soil || 'alluvial');
    return { success: res.success, result: res.soil, sources: res.sources };
  }
});

ToolRegistry.registerTool({
  name: 'getNutrientKnowledge',
  description: 'Retrieve role, deficiency symptoms, excess symptoms, and management for macro/micronutrients.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const res = KnowledgeRetrievalService.getNutrientKnowledge(params?.nutrient || 'nitrogen');
    return { success: res.success, result: res.nutrient, sources: res.sources };
  }
});

ToolRegistry.registerTool({
  name: 'getAgriculturalPractice',
  description: 'Retrieve verified agricultural practice guidelines (seed treatment, irrigation, post-harvest).',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const res = KnowledgeRetrievalService.getPracticeKnowledge(params?.category || params?.id || 'seed_treatment');
    return { success: res.success, result: res.practices, sources: res.sources };
  }
});

ToolRegistry.registerTool({
  name: 'searchAgricultureKnowledge',
  description: 'Perform universal search across crops, diseases, pests, soils, nutrients, and practices.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const res = KnowledgeRetrievalService.searchKnowledge({ search: params?.query || '' });
    return { success: res.success, result: res.searchResults, sources: res.sources };
  }
});

// Step 25 Knowledge Graph READ_ONLY Tools
ToolRegistry.registerTool({
  name: 'getFarmGraph',
  description: 'Retrieve normalized relationship graph for a farm including fields, crops, soil, weather, disease, and agents.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    const graph = await FarmKnowledgeGraphService.getFarmGraph(userId, params?.farmId);
    return { success: true, result: graph };
  }
});

ToolRegistry.registerTool({
  name: 'getCropContext',
  description: 'Retrieve crop-cycle relationship context linking crop, growth stage, soil, weather, disease, and market.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    const context = await FarmKnowledgeGraphService.getCropContext(userId, params?.cropCycleId);
    return { success: true, result: context };
  }
});

ToolRegistry.registerTool({
  name: 'getFarmRisks',
  description: 'Retrieve aggregated farm risks from weather, leaf pathology, and stale soil data.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    const risks = await FarmKnowledgeGraphService.getFarmRisks(userId, params?.farmId);
    return { success: true, result: risks };
  }
});

// Step 26 Advanced AI Decision Engine Tools
ToolRegistry.registerTool({
  name: 'evaluateDecision',
  description: 'Evaluate evidence, risks, deterministic rules, and policy to produce a structured decision recommendation.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    const decision = await DecisionEngine.evaluateDecision(userId, params?.farmId, params?.category);
    return { success: true, result: decision };
  }
});

ToolRegistry.registerTool({
  name: 'getDecisionHistory',
  description: 'Retrieve historical decision records and audit logs for a farm.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    const history = await DecisionEngine.getDecisionHistory(userId, params?.farmId);
    return { success: true, result: history };
  }
});

// Step 27 Proactive Farm Intelligence Tools
ToolRegistry.registerTool({
  name: 'evaluateProactiveEvents',
  description: 'Run proactive event detection and notification dispatch sweep for a farm.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    const res = await ProactiveEngine.evaluateFarmProactiveEvents(userId, params?.farmId);
    return { success: true, result: res };
  }
});

ToolRegistry.registerTool({
  name: 'getDailyFarmBrief',
  description: 'Retrieve Daily Farm Intelligence Brief summarizing weather, crops, pathology, irrigation, and tasks.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    const brief = await ProactiveEngine.getDailyFarmBrief(userId, params?.farmId);
    return { success: true, result: brief };
  }
});

// Step 28 Multi-Farm & Enterprise Tools
ToolRegistry.registerTool({
  name: 'getUserFarms',
  description: 'Retrieve list of all authorized farms for the authenticated user.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string) => {
    const farms = await MultiFarmService.getUserFarms(userId);
    return { success: true, result: farms };
  }
});

ToolRegistry.registerTool({
  name: 'compareFarms',
  description: 'Compare two authorized farms side-by-side on area, crops, weather, soil, tasks, and alerts.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    const comparison = await MultiFarmService.compareFarms(userId, params?.farmId1, params?.farmId2);
    return { success: true, result: comparison };
  }
});

// Step 29 Agricultural Marketplace & Services Tools
ToolRegistry.registerTool({
  name: 'searchMarketplace',
  description: 'Search agricultural products, equipment rental, soil testing, drone spraying, and farm support services.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const res = await MarketplaceSearchService.searchListings(params || {});
    return { success: true, result: res };
  }
});

ToolRegistry.registerTool({
  name: 'getMarketplaceListing',
  description: 'Retrieve detailed information for a specific agricultural listing or service.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const res = await MarketplaceService.getListingById(params?.listingId);
    return { success: true, result: res };
  }
});

ToolRegistry.registerTool({
  name: 'getMarketplaceCategories',
  description: 'Retrieve active agricultural categories (seeds, fertilizers, drone spraying, soil testing, equipment rental).',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const categories = await MarketplaceCategoryService.getCategories(params?.group, params?.countryCode || 'IN');
    return { success: true, result: categories };
  }
});

ToolRegistry.registerTool({
  name: 'createMarketplaceInquiry',
  description: 'Submit an inquiry to an agricultural provider (requires explicit farmer authorization).',
  permission: 'REQUIRES_APPROVAL',
  requiresApproval: true,
  handler: async (userId: string, params: any) => {
    const inquiry = await MarketplaceService.createInquiry(userId, params?.farmId, params?.listingId, params?.message, params?.subject);
    return { success: true, result: inquiry };
  }
});

ToolRegistry.registerTool({
  name: 'saveMarketplaceListing',
  description: 'Save or toggle a marketplace listing in user favorites.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (userId: string, params: any) => {
    const fav = await MarketplaceService.toggleFavorite(userId, params?.farmId, params?.listingId);
    return { success: true, result: fav };
  }
});

// Step 30 Global Provider & Partner Ecosystem Tools
ToolRegistry.registerTool({
  name: 'getProviderCapabilities',
  description: 'Retrieve capabilities supported by agricultural data and service providers for a specific country/region.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const providers = await ProviderRegistry.getProviders(params?.type, params?.countryCode || 'IN');
    const capabilities = providers.map(p => ({
      providerId: p.id,
      name: p.name,
      type: p.providerType,
      capabilities: p.capabilities,
      verificationStatus: p.verificationStatus
    }));
    return { success: true, result: capabilities };
  }
});

ToolRegistry.registerTool({
  name: 'getProviderStatus',
  description: 'Inspect operational status and health metrics of platform data feeds.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const health = ProviderHealthService.getAllHealthRecords();
    return { success: true, result: health };
  }
});

ToolRegistry.registerTool({
  name: 'searchEcosystemProviders',
  description: 'Discover active verified agricultural data providers, research institutions, and service networks.',
  permission: 'READ_ONLY',
  requiresApproval: false,
  handler: async (_userId: string, params: any) => {
    const providers = await ProviderRegistry.getProviders(params?.providerType, params?.countryCode || 'IN');
    return { success: true, result: providers };
  }
});

