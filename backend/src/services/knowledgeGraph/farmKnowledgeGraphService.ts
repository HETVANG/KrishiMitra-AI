import { User } from '../../models/User';
import { Farm } from '../../models/Farm';
import { Field } from '../../models/Field';
import { CropCycle } from '../../models/CropCycle';
import { SoilAnalysis } from '../../models/SoilAnalysis';
import { DiseaseHistory } from '../../models/DiseaseHistory';
import { MarketPrice } from '../../models/MarketPrice';
import { FarmTask } from '../../models/FarmTask';
import { AgentActivity } from '../../models/AgentActivity';
import { WeatherService } from '../WeatherService';
import { RegionalContextService } from '../regionalContextService';
import { KnowledgeRetrievalService } from '../knowledge/knowledgeRetrievalService';
import { RelationshipResolver } from './relationshipResolver';
import { NormalizedFarmGraphContext, FieldGraphNode, CropCycleGraphNode, FreshnessMetadata } from './graphTypes';

export class FarmKnowledgeGraphService {
  /**
   * Resolve complete NormalizedFarmGraphContext for a given user and farmId.
   * Performs batch parallel database queries to prevent N+1 overhead.
   */
  static async getFarmGraph(userId: string, farmId?: string): Promise<NormalizedFarmGraphContext> {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    // Resolve Target Farm
    let selectedFarm: any = null;
    if (farmId) {
      selectedFarm = await Farm.findOne({ _id: farmId, user: userId }).lean();
    }
    if (!selectedFarm) {
      selectedFarm = await Farm.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
    }

    const targetFarmId = selectedFarm?._id?.toString() || null;
    const lat = selectedFarm?.latitude ?? user.farmLocation?.latitude ?? null;
    const lng = selectedFarm?.longitude ?? user.farmLocation?.longitude ?? null;
    const district = selectedFarm?.district || user.farmLocation?.district || 'Default District';
    const state = selectedFarm?.state || user.farmLocation?.state || 'Default State';
    const primaryCropName = selectedFarm?.currentCrops?.[0] || 'Wheat';

    // Parallel Batch Database Queries (N+1 Prevention)
    const [
      fieldDocs,
      cropCycleDocs,
      latestSoil,
      latestDisease,
      scansCount,
      marketPriceRec,
      pendingTaskDocs,
      recentActivities,
      regionalContext
    ] = await Promise.all([
      targetFarmId ? Field.find({ farm: targetFarmId, user: userId }).lean() : Promise.resolve([]),
      targetFarmId ? CropCycle.find({ farm: targetFarmId, user: userId, status: 'ACTIVE' }).lean() : Promise.resolve([]),
      SoilAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
      DiseaseHistory.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
      DiseaseHistory.countDocuments({ user: userId }),
      MarketPrice.findOne({ crop: new RegExp(primaryCropName, 'i') }).sort({ lastUpdated: -1 }).lean(),
      FarmTask.find({ user: userId, status: { $in: ['TODO', 'WAITING_APPROVAL'] } }).sort({ priority: -1, createdAt: -1 }).limit(10).lean(),
      AgentActivity.find({ user: userId }).sort({ createdAt: -1 }).limit(3).lean(),
      RegionalContextService.getRegionalContext(userId, targetFarmId || undefined).catch(() => undefined)
    ]);

    // Synthesize Field Graph Nodes (Fallback to single virtual main field if no explicit fields saved)
    let fields: FieldGraphNode[] = fieldDocs.map((f: any) => ({
      id: f._id.toString(),
      name: f.name,
      sizeAcres: f.sizeAcres,
      soilType: f.soilType,
      waterSource: f.waterSource,
      irrigationType: f.irrigationType,
      status: f.status,
      boundary: f.boundary
    }));

    if (fields.length === 0) {
      fields = [{
        id: targetFarmId ? `field_${targetFarmId}` : 'field_main',
        name: 'Main Field',
        sizeAcres: selectedFarm?.size || 1,
        soilType: selectedFarm?.soilType || 'Loam',
        waterSource: selectedFarm?.waterSource || 'Borewell',
        irrigationType: 'Drip / Surface',
        status: 'ACTIVE',
        boundary: selectedFarm?.boundary || []
      }];
    }

    // Synthesize Active Crop Cycle Graph Nodes
    const activeCropCycles: CropCycleGraphNode[] = cropCycleDocs.map((c: any) => ({
      id: c._id.toString(),
      fieldId: c.field ? `field_${c.field}` : fields[0].id,
      fieldName: c.field || fields[0].name,
      cropName: c.cropName,
      variety: c.variety || 'Standard',
      currentStage: c.currentGrowthStage || 'VEGETATIVE',
      plantingDate: new Date(c.plantingDate).toISOString(),
      expectedHarvestDate: c.expectedHarvestDate ? new Date(c.expectedHarvestDate).toISOString() : undefined,
      status: c.status,
      ageInDays: RelationshipResolver.calculateCropAgeInDays(c.plantingDate)
    }));

    // Fetch Weather Data & Freshness
    let weatherData = {
      available: false,
      tempCelsius: null as number | null,
      condition: null as string | null,
      humidity: null as number | null,
      rainProbability: null as number | null,
      windSpeed: null as number | null,
      freshness: RelationshipResolver.calculateFreshness(null, 'WEATHER_PROVIDER', 12, 48)
    };

    if (lat !== null && lng !== null) {
      try {
        const liveWeather = await WeatherService.getWeatherData(lat, lng);
        if (liveWeather) {
          weatherData = {
            available: true,
            tempCelsius: liveWeather.current?.temp ?? null,
            condition: liveWeather.current?.condition ?? null,
            humidity: liveWeather.current?.humidity ?? null,
            rainProbability: liveWeather.current?.rainProb ?? null,
            windSpeed: liveWeather.current?.windSpeed ?? null,
            freshness: RelationshipResolver.calculateFreshness(new Date(), 'WEATHER_PROVIDER', 6, 24)
          };
        }
      } catch {
        // Fallback
      }
    }

    // Soil Freshness & Context
    const soilFreshness = RelationshipResolver.calculateFreshness(
      latestSoil ? (latestSoil as any).createdAt : null,
      'SOIL_ANALYSIS',
      720, // 30 days fresh
      2160 // 90 days recent
    );

    const soilContext = {
      available: !!latestSoil,
      ph: (latestSoil as any)?.pH ?? (latestSoil as any)?.ph ?? null,
      nitrogen: (latestSoil as any)?.N ?? (latestSoil as any)?.nitrogen ?? null,
      phosphorus: (latestSoil as any)?.P ?? (latestSoil as any)?.phosphorus ?? null,
      potassium: (latestSoil as any)?.K ?? (latestSoil as any)?.potassium ?? null,
      organicMatter: (latestSoil as any)?.organicCarbon ?? (latestSoil as any)?.organicMatter ?? null,
      freshness: soilFreshness
    };

    // Disease Freshness & Context
    const diseaseFreshness = RelationshipResolver.calculateFreshness(
      latestDisease ? (latestDisease as any).createdAt : null,
      'DISEASE_SCAN',
      72, // 3 days fresh
      168 // 7 days recent
    );

    const diseaseContext = {
      available: !!latestDisease,
      scansCount,
      latestDiagnosis: latestDisease ? {
        crop: (latestDisease as any).crop || (latestDisease as any).cropName || primaryCropName,
        disease: (latestDisease as any).diseaseName || 'Unknown',
        severity: (latestDisease as any).severity || 'moderate',
        confidence: (latestDisease as any).confidenceScore || 0.85,
        date: (latestDisease as any).createdAt || null
      } : null,
      freshness: diseaseFreshness
    };

    // Market Freshness & Context
    const marketFreshness = RelationshipResolver.calculateFreshness(
      marketPriceRec ? marketPriceRec.lastUpdated : null,
      'MARKET_PROVIDER',
      24,
      72
    );

    const marketContext = {
      available: !!marketPriceRec,
      commodity: primaryCropName,
      price: marketPriceRec ? (marketPriceRec.avgPrice || marketPriceRec.modalPrice || null) : null,
      marketName: marketPriceRec ? (marketPriceRec.market || marketPriceRec.district || null) : null,
      trend: 'RISING',
      freshness: marketFreshness
    };

    // Smart Irrigation Attention Check
    const rainProb = weatherData.rainProbability || 0;
    const tempC = weatherData.tempCelsius || 25;
    let irrigationAttention = false;
    let irrigationReason = 'Optimal soil moisture conditions.';
    let recommendedAction = 'Maintain current watering schedule.';

    if (rainProb > 60) {
      irrigationAttention = true;
      irrigationReason = `High rainfall probability (${rainProb}%) forecast.`;
      recommendedAction = 'Pause scheduled irrigation to avoid root waterlogging.';
    } else if (tempC > 35 && rainProb < 20) {
      irrigationAttention = true;
      irrigationReason = `High temperature (${tempC}°C) and low rainfall chance (${rainProb}%).`;
      recommendedAction = 'Increase irrigation volume to counteract high evapotranspiration.';
    }

    // Knowledge Context Retrieval
    const cropKnowledge = KnowledgeRetrievalService.getCropKnowledge(primaryCropName);
    const diseaseKnowledge = diseaseContext.latestDiagnosis?.disease ? KnowledgeRetrievalService.getDiseaseKnowledge(diseaseContext.latestDiagnosis.disease) : null;
    const soilKnowledge = selectedFarm?.soilType ? KnowledgeRetrievalService.getSoilKnowledge(selectedFarm.soilType) : null;

    const sourcesList = [
      ...(cropKnowledge?.sources || []),
      ...(diseaseKnowledge?.sources || []),
      ...(soilKnowledge?.sources || [])
    ];

    const knowledgeContext = {
      cropKnowledge: cropKnowledge?.crop || null,
      diseaseKnowledge: diseaseKnowledge?.disease || null,
      soilKnowledge: soilKnowledge?.soil || null,
      sources: Array.from(new Set(sourcesList.map((s: any) => JSON.stringify(s)))).map((s: any) => JSON.parse(s))
    };

    // Construct Freshness Map
    const freshnessMap: Record<string, FreshnessMetadata> = {
      weather: weatherData.freshness,
      soil: soilFreshness,
      disease: diseaseFreshness,
      market: marketFreshness,
      farm: RelationshipResolver.calculateFreshness(selectedFarm?.updatedAt || selectedFarm?.createdAt, 'FARM_RECORD', 168, 720)
    };

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        country: regionalContext?.countryCode || 'IN'
      },
      farm: {
        id: targetFarmId || 'farm_primary',
        name: selectedFarm?.name || 'My Primary Farm',
        sizeAcres: selectedFarm?.size || 1,
        soilType: selectedFarm?.soilType || 'Loam',
        waterSource: selectedFarm?.waterSource || 'Borewell',
        location: {
          address: selectedFarm?.village ? `${selectedFarm.village}, ${district}, ${state}` : user.farmLocation?.address || `${district}, ${state}`,
          village: selectedFarm?.village || user.farmLocation?.village || '',
          district,
          state,
          latitude: lat,
          longitude: lng
        }
      },
      fields,
      activeCropCycles,
      soilContext,
      weatherContext: weatherData,
      irrigationContext: {
        waterAttentionNeeded: irrigationAttention,
        reason: irrigationReason,
        recommendedAction
      },
      diseaseContext,
      marketContext,
      taskContext: {
        pendingTasksCount: pendingTaskDocs.length,
        urgentTasks: pendingTaskDocs.map((t: any) => ({
          id: t._id.toString(),
          title: t.title,
          priority: t.priority,
          reason: t.reason,
          status: t.status
        }))
      },
      regionalContext,
      knowledgeContext,
      agentContext: {
        activeAgentsCount: 5,
        recentInsights: recentActivities.map((a: any) => ({
          agentType: a.agentType,
          observation: a.observation,
          reasoningSummary: a.reasoningSummary,
          status: a.status
        }))
      },
      freshnessMap
    };
  }

  /**
   * Resolve crop context for a specific crop cycle ID
   */
  static async getCropContext(userId: string, cropCycleId: string) {
    const cycle = await CropCycle.findOne({ _id: cropCycleId, user: userId }).lean();
    if (!cycle) {
      throw new Error('Crop cycle not found');
    }

    const farmGraph = await this.getFarmGraph(userId, (cycle as any).farm?.toString());
    const cropKnowledge = KnowledgeRetrievalService.getCropKnowledge(cycle.cropName);

    return {
      cropCycle: {
        id: cycle._id.toString(),
        cropName: cycle.cropName,
        variety: cycle.variety,
        field: cycle.field,
        plantingDate: cycle.plantingDate,
        expectedHarvestDate: cycle.expectedHarvestDate,
        currentStage: cycle.currentGrowthStage,
        status: cycle.status,
        ageInDays: RelationshipResolver.calculateCropAgeInDays(cycle.plantingDate)
      },
      farm: farmGraph.farm,
      weather: farmGraph.weatherContext,
      soil: farmGraph.soilContext,
      disease: farmGraph.diseaseContext,
      market: farmGraph.marketContext,
      knowledge: cropKnowledge.crop,
      sources: cropKnowledge.sources
    };
  }

  /**
   * Get overall farm health and active risk alerts
   */
  static async getFarmRisks(userId: string, farmId?: string) {
    const graph = await this.getFarmGraph(userId, farmId);
    const risks: Array<{ level: 'high' | 'medium' | 'low'; category: string; title: string; description: string }> = [];

    if (graph.weatherContext.rainProbability && graph.weatherContext.rainProbability > 70) {
      risks.push({
        level: 'high',
        category: 'weather',
        title: 'Heavy Rainfall Risk',
        description: `High rainfall chance (${graph.weatherContext.rainProbability}%). Risk of waterlogging or fertilizer leaching.`
      });
    }

    if (graph.diseaseContext.available && graph.diseaseContext.latestDiagnosis) {
      const diag = graph.diseaseContext.latestDiagnosis;
      if (diag.severity === 'severe' || diag.severity === 'high') {
        risks.push({
          level: 'high',
          category: 'pathology',
          title: `Severe ${diag.disease} Infection`,
          description: `Active severe leaf pathology detected on ${diag.crop}. Recommended specialist intervention.`
        });
      }
    }

    if (graph.soilContext.available && graph.soilContext.freshness.freshness === 'STALE') {
      risks.push({
        level: 'medium',
        category: 'soil',
        title: 'Stale Soil Test Data',
        description: 'Soil test result is over 90 days old. Schedule a fresh digital soil analysis.'
      });
    }

    return {
      success: true,
      farmId: graph.farm.id,
      risksCount: risks.length,
      risks
    };
  }
}
