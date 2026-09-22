import { AgentMemory } from '../../models/AgentMemory';

export interface ShortTermContext {
  userId: string;
  farmId?: string;
  triggerEvent: string;
  currentObservations: string[];
  activeCropName?: string;
  activeGrowthStage?: string;
  weatherTemp?: number;
  weatherCondition?: string;
  rainProbability?: number;
  latestDiseaseName?: string;
  marketPrice?: number;
}

export class AgentMemoryService {
  /**
   * Store or update a long-term farm memory fact for a user
   */
  static async rememberFact(
    userId: string,
    category: 'preference' | 'crop_fact' | 'soil_fact' | 'irrigation_pattern' | 'historical_observation',
    factKey: string,
    factValue: any,
    sourceAgent: string = 'system',
    farmId?: string
  ) {
    try {
      return await AgentMemory.findOneAndUpdate(
        { user: userId, category, factKey },
        {
          user: userId,
          farm: farmId || null,
          category,
          factKey,
          factValue,
          sourceAgent,
          lastVerifiedAt: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('[AgentMemoryService] Failed to save memory fact:', err);
      return null;
    }
  }

  /**
   * Recall long-term memory facts for a user
   */
  static async recallUserMemory(userId: string, category?: string) {
    try {
      const query: any = { user: userId };
      if (category) query.category = category;
      return await AgentMemory.find(query).lean();
    } catch (err) {
      console.error('[AgentMemoryService] Failed to recall memory:', err);
      return [];
    }
  }
}
