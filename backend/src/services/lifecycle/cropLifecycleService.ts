import { CropCycle } from '../../models/CropCycle';
import { FarmActivity } from '../../models/FarmActivity';
import { Farm } from '../../models/Farm';
import { GrowthStageEngine, GrowthStage } from './growthStageEngine';
import { CopilotContextService } from '../CopilotContextService';
import { MarketIntelligenceService } from '../market/marketIntelligenceService';
import { DiseaseHistory } from '../../models/DiseaseHistory';

export interface CropCycleIntelligence {
  cycle: any;
  growthStageInfo: {
    stage: string;
    label: string;
    daysSincePlanting: number;
    progressPct: number;
  };
  weather: any;
  predictiveRisks: any[];
  irrigationStatus: any;
  diseaseDiagnosis: any;
  marketIntelligence: any;
  recentActivities: any[];
  tasks: any[];
}

export class CropLifecycleService {
  /**
   * Create a new Crop Cycle
   */
  static async createCropCycle(
    userId: string,
    payload: {
      farmId: string;
      field?: string;
      cropName: string;
      variety?: string;
      plantingDate: Date | string;
      expectedHarvestDate?: Date | string;
      area?: number;
      areaUnit?: string;
      seedSource?: string;
      notes?: string;
    }
  ) {
    const plantingDate = new Date(payload.plantingDate);
    const expectedHarvestDate = payload.expectedHarvestDate 
      ? new Date(payload.expectedHarvestDate) 
      : GrowthStageEngine.estimateExpectedHarvestDate(payload.cropName, plantingDate);

    const stageEst = GrowthStageEngine.estimateGrowthStage(payload.cropName, plantingDate);

    const cycle = await CropCycle.create({
      user: userId,
      farm: payload.farmId,
      field: payload.field || 'Field A',
      cropName: payload.cropName,
      variety: payload.variety || 'Standard',
      plantingDate,
      expectedHarvestDate,
      currentGrowthStage: stageEst.stage,
      isStageManuallySet: false,
      status: 'ACTIVE',
      area: payload.area || 1,
      areaUnit: payload.areaUnit || 'acres',
      seedSource: payload.seedSource,
      notes: payload.notes
    });

    // Automatically log initial planting activity
    await FarmActivity.create({
      user: userId,
      farm: payload.farmId,
      cropCycle: cycle._id,
      type: 'planting',
      date: plantingDate,
      title: `Planted ${payload.cropName} (${payload.variety || 'Standard'})`,
      description: `Crop cycle initialized on ${payload.field || 'Field A'}. Expected harvest on ${expectedHarvestDate.toLocaleDateString()}.`,
      metadata: { area: payload.area, seedSource: payload.seedSource }
    });

    // Update farm currentCrops array if not already present
    try {
      await Farm.findByIdAndUpdate(payload.farmId, {
        $addToSet: { currentCrops: payload.cropName }
      });
    } catch (farmErr) {
      console.warn('[CropLifecycleService] Update farm currentCrops warn:', farmErr);
    }

    return cycle;
  }

  /**
   * Fetch complete Crop Cycle Intelligence aggregating Step 16-20 engines
   */
  static async getCropCycleIntelligence(
    userId: string,
    cycleId: string
  ): Promise<CropCycleIntelligence> {
    const cycle = await CropCycle.findOne({ _id: cycleId, user: userId }).lean();
    if (!cycle) {
      throw new Error('Crop cycle record not found or access denied.');
    }

    // Growth Stage Info
    const stageInfo = cycle.isStageManuallySet
      ? {
          stage: cycle.currentGrowthStage,
          label: cycle.currentGrowthStage.replace(/_/g, ' '),
          daysSincePlanting: Math.floor((Date.now() - new Date(cycle.plantingDate).getTime()) / (1000 * 60 * 60 * 24)),
          progressPct: 50
        }
      : GrowthStageEngine.estimateGrowthStage(cycle.cropName, cycle.plantingDate);

    // Fetch Context via CopilotContextService
    const ctx = await CopilotContextService.getFarmContext(userId, cycle.farm?.toString());

    // Fetch Market Intelligence via Step 20 Engine
    let marketIntel: any = null;
    try {
      marketIntel = await MarketIntelligenceService.getCommodityIntelligence(cycle.cropName, {
        userId,
        state: ctx.farm?.location?.state || undefined,
        district: ctx.farm?.location?.district || undefined
      });
    } catch (mErr) {
      console.warn('[CropLifecycleService] Market intelligence fetch warn:', mErr);
    }

    // Fetch Latest Disease Scan for this crop
    let latestDiseaseScan: any = null;
    try {
      latestDiseaseScan = await DiseaseHistory.findOne({
        user: userId,
        crop: new RegExp(`^${cycle.cropName}$`, 'i')
      }).sort({ createdAt: -1 }).lean();
    } catch (dErr) {
      console.warn('[CropLifecycleService] Disease scan fetch warn:', dErr);
    }

    // Fetch Recent Activities Log
    const recentActivities = await FarmActivity.find({ cropCycle: cycleId })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    // Daily Action Tasks derived from real data
    const tasks: any[] = [];
    if (ctx.weather?.rainProbability && ctx.weather.rainProbability > 60) {
      tasks.push({
        title: 'Prepare for Rainfall',
        reason: `${ctx.weather.rainProbability}% rain forecast expected. Ensure field drainage channels are clear.`,
        category: 'weather_prep',
        priority: 'high'
      });
    }

    if (latestDiseaseScan && latestDiseaseScan.condition !== 'HEALTHY') {
      tasks.push({
        title: `Disease Re-check: ${latestDiseaseScan.diseaseName}`,
        reason: `Previous scan on ${new Date(latestDiseaseScan.createdAt).toLocaleDateString()} indicated ${latestDiseaseScan.diseaseName}. Inspect foliage for symptom spread.`,
        category: 'disease_check',
        priority: latestDiseaseScan.severity === 'high' ? 'high' : 'medium'
      });
    }

    tasks.push({
      title: 'Inspect Soil & Moisture',
      reason: 'Check root zone moisture before scheduled irrigation.',
      category: 'irrigation',
      priority: 'medium'
    });

    return {
      cycle,
      growthStageInfo: stageInfo,
      weather: ctx.weather,
      predictiveRisks: (ctx as any).predictiveRisks || (ctx as any).predictions?.signals || [],
      irrigationStatus: (ctx as any).irrigation || null,
      diseaseDiagnosis: latestDiseaseScan,
      marketIntelligence: marketIntel,
      recentActivities,
      tasks
    };
  }

  /**
   * Log a new activity on a crop cycle
   */
  static async logActivity(
    userId: string,
    cycleId: string,
    payload: {
      type: string;
      title: string;
      description?: string;
      date?: Date | string;
      metadata?: any;
    }
  ) {
    const cycle = await CropCycle.findOne({ _id: cycleId, user: userId }).lean();
    if (!cycle) {
      throw new Error('Crop cycle record not found or access denied.');
    }

    const activity = await FarmActivity.create({
      user: userId,
      farm: cycle.farm,
      cropCycle: cycleId,
      type: payload.type,
      date: payload.date ? new Date(payload.date) : new Date(),
      title: payload.title,
      description: payload.description,
      metadata: payload.metadata
    });

    return activity;
  }

  /**
   * Record Harvest event and update crop cycle status
   */
  static async recordHarvest(
    userId: string,
    cycleId: string,
    payload: {
      harvestDate?: Date | string;
      quantity: number;
      unit?: string;
      grade?: string;
      sellingMarket?: string;
      notes?: string;
      completeCycle?: boolean;
    }
  ) {
    const harvestDate = payload.harvestDate ? new Date(payload.harvestDate) : new Date();

    const updated = await CropCycle.findOneAndUpdate(
      { _id: cycleId, user: userId },
      {
        status: payload.completeCycle ? 'COMPLETED' : 'HARVESTING',
        actualHarvestDate: harvestDate,
        currentGrowthStage: 'HARVEST',
        harvestYield: {
          quantity: payload.quantity,
          unit: payload.unit || 'kg',
          grade: payload.grade || 'Grade A',
          sellingMarket: payload.sellingMarket,
          notes: payload.notes
        }
      },
      { new: true }
    );

    if (!updated) {
      throw new Error('Crop cycle record not found or access denied.');
    }

    // Log harvest activity
    await FarmActivity.create({
      user: userId,
      farm: updated.farm,
      cropCycle: cycleId,
      type: 'harvesting',
      date: harvestDate,
      title: `Harvested ${payload.quantity} ${payload.unit || 'kg'} of ${updated.cropName}`,
      description: `Recorded harvest yield on field ${updated.field || 'Field A'}. Grade: ${payload.grade || 'Grade A'}. Market: ${payload.sellingMarket || 'Local Mandi'}.`,
      metadata: payload
    });

    return updated;
  }

  /**
   * Mark Crop Cycle COMPLETED and preserve history
   */
  static async completeCropCycle(userId: string, cycleId: string) {
    const updated = await CropCycle.findOneAndUpdate(
      { _id: cycleId, user: userId },
      {
        status: 'COMPLETED',
        currentGrowthStage: 'POST_HARVEST',
        actualHarvestDate: new Date()
      },
      { new: true }
    );

    if (!updated) {
      throw new Error('Crop cycle record not found or access denied.');
    }

    await FarmActivity.create({
      user: userId,
      farm: updated.farm,
      cropCycle: cycleId,
      type: 'note',
      date: new Date(),
      title: `Completed Crop Cycle: ${updated.cropName}`,
      description: `Crop cultivation cycle completed successfully. Historical records preserved in crop knowledge base.`
    });

    return updated;
  }

  /**
   * Update Crop Cycle details or manual growth stage
   */
  static async updateCropCycle(
    userId: string,
    cycleId: string,
    updates: any
  ) {
    if (updates.currentGrowthStage) {
      updates.isStageManuallySet = true;
    }

    const updated = await CropCycle.findOneAndUpdate(
      { _id: cycleId, user: userId },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      throw new Error('Crop cycle record not found or access denied.');
    }

    return updated;
  }

  /**
   * Get user's crop cycles list (active or historical)
   */
  static async getUserCropCycles(
    userId: string,
    farmId?: string,
    status?: string
  ) {
    const query: any = { user: userId };
    if (farmId) query.farm = farmId;
    if (status) query.status = status;

    const cycles = await CropCycle.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return cycles.map((c: any) => ({
      ...c,
      stageInfo: GrowthStageEngine.estimateGrowthStage(c.cropName, c.plantingDate)
    }));
  }
}
