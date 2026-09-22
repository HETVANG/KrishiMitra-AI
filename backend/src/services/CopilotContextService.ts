import { User } from '../models/User';
import { Farm } from '../models/Farm';
import { SoilAnalysis } from '../models/SoilAnalysis';
import { DiseaseHistory } from '../models/DiseaseHistory';
import { MarketPrice } from '../models/MarketPrice';
import { CropCycle } from '../models/CropCycle';
import { AgentActivity } from '../models/AgentActivity';
import { FarmTask } from '../models/FarmTask';
import { WeatherService } from './WeatherService';

export interface NormalizedFarmContext {
  user: {
    id: string;
    name: string;
    language: string;
    country: string;
    currency: string;
  };
  farm: {
    id: string | null;
    name: string;
    sizeAcres: number;
    soilType: string;
    waterSource: string;
    location: {
      address: string;
      village: string;
      district: string;
      state: string;
      latitude: number | null;
      longitude: number | null;
    };
    crops: Array<{
      name: string;
      variety?: string;
      growthStage?: string;
    }>;
  };
  soil: {
    available: boolean;
    ph: number | null;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
    organicMatter: number | null;
    lastTestedDate: Date | null;
  };
  weather: {
    available: boolean;
    tempCelsius: number | null;
    condition: string | null;
    humidity: number | null;
    rainProbability: number | null;
    windSpeed: number | null;
    forecastSummary: string | null;
  };
  disease: {
    available: boolean;
    recentScansCount: number;
    latestDiagnosis: {
      crop: string | null;
      disease: string | null;
      condition?: string | null;
      severity?: string | null;
      confidence: number | null;
      symptoms?: string[];
      recommendedActions?: any[];
      followUpDate?: Date | null;
      followUpStatus?: string | null;
      date: Date | null;
    } | null;
  };
  market: {
    available: boolean;
    commodity: string | null;
    avgPrice: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    marketName: string | null;
    trend?: string | null;
    unit?: string | null;
    lastUpdated: Date | null;
  };
  cropCycles?: Array<{
    id: string;
    cropName: string;
    variety?: string;
    fieldName: string;
    currentStage: string;
    plantingDate: Date;
    expectedHarvestDate?: Date;
  }>;
  agents?: {
    activeAgentsCount: number;
    pendingApprovalsCount: number;
    recentInsights: Array<{
      agentType: string;
      observation: string;
      reasoningSummary: string;
      status: string;
    }>;
  };
  meta: {
    generatedAt: string;
    missingFields: string[];
  };
}

export class CopilotContextService {
  /**
   * Build a comprehensive, safe FarmContext for a given user and optional farmId.
   */
  static async getFarmContext(userId: string, targetFarmId?: string): Promise<NormalizedFarmContext> {
    const missingFields: string[] = [];

    // 1. Fetch User Profile
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Fetch Selected Farm (or user's primary farm, or location fallback)
    let selectedFarm: any = null;
    if (targetFarmId) {
      selectedFarm = await Farm.findOne({ _id: targetFarmId, user: userId }).lean();
    }
    
    if (!selectedFarm) {
      selectedFarm = await Farm.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
    }

    const primaryCropName = selectedFarm?.currentCrops?.[0] || 'General Crop';
    const lat = selectedFarm?.latitude || user.farmLocation?.latitude || null;
    const lng = selectedFarm?.longitude || user.farmLocation?.longitude || null;
    const district = selectedFarm?.district || user.farmLocation?.district || 'Default District';
    const state = selectedFarm?.state || user.farmLocation?.state || 'Default State';

    if (!selectedFarm) {
      missingFields.push('farmRecord');
    }

    // 3. Fetch Soil Analysis
    let soilData = {
      available: false,
      ph: null as number | null,
      nitrogen: null as number | null,
      phosphorus: null as number | null,
      potassium: null as number | null,
      organicMatter: null as number | null,
      lastTestedDate: null as Date | null
    };

    try {
      const latestSoil = await SoilAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
      if (latestSoil) {
        soilData = {
          available: true,
          ph: (latestSoil as any).pH ?? (latestSoil as any).ph ?? null,
          nitrogen: (latestSoil as any).N ?? (latestSoil as any).nitrogen ?? null,
          phosphorus: (latestSoil as any).P ?? (latestSoil as any).phosphorus ?? null,
          potassium: (latestSoil as any).K ?? (latestSoil as any).potassium ?? null,
          organicMatter: (latestSoil as any).organicCarbon ?? (latestSoil as any).organicMatter ?? null,
          lastTestedDate: (latestSoil as any).createdAt || null
        };
      } else {
        missingFields.push('soilAnalysis');
      }
    } catch {
      missingFields.push('soilAnalysis');
    }

    // 4. Fetch Weather Information
    let weatherData = {
      available: false,
      tempCelsius: null as number | null,
      condition: null as string | null,
      humidity: null as number | null,
      rainProbability: null as number | null,
      windSpeed: null as number | null,
      forecastSummary: null as string | null
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
            forecastSummary: liveWeather.forecast?.[0]?.condition || liveWeather.current?.condition || null
          };
        }
      } catch {
        missingFields.push('weatherLive');
      }
    } else {
      missingFields.push('locationCoordinates');
    }

    // 5. Fetch Disease History
    let diseaseData = {
      available: false,
      recentScansCount: 0,
      latestDiagnosis: null as any
    };

    try {
      const scansCount = await DiseaseHistory.countDocuments({ user: userId });
      const latestDisease = await DiseaseHistory.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
      if (latestDisease) {
        diseaseData = {
          available: true,
          recentScansCount: scansCount,
          latestDiagnosis: {
            crop: (latestDisease as any).crop || (latestDisease as any).cropName || primaryCropName,
            disease: (latestDisease as any).diseaseName || 'Unknown Disease',
            condition: (latestDisease as any).condition || 'POSSIBLE_DISEASE',
            severity: (latestDisease as any).severity || 'moderate',
            confidence: (latestDisease as any).confidenceScore || 0.85,
            symptoms: (latestDisease as any).symptoms || [],
            recommendedActions: (latestDisease as any).recommendedActions || [],
            followUpDate: (latestDisease as any).followUpDate || null,
            followUpStatus: (latestDisease as any).followUpStatus || 'none',
            date: (latestDisease as any).createdAt || null
          }
        };
      } else {
        missingFields.push('diseaseHistory');
      }
    } catch {
      missingFields.push('diseaseHistory');
    }

    // 6. Fetch Market Prices
    let marketData = {
      available: false,
      commodity: primaryCropName,
      avgPrice: null as number | null,
      minPrice: null as number | null,
      maxPrice: null as number | null,
      marketName: null as string | null,
      trend: null as string | null,
      unit: null as string | null,
      lastUpdated: null as Date | null
    };

    try {
      const marketPriceRec = await MarketPrice.findOne({
        crop: new RegExp(primaryCropName, 'i')
      }).sort({ lastUpdated: -1 }).lean();

      if (marketPriceRec) {
        marketData = {
          available: true,
          commodity: marketPriceRec.crop,
          avgPrice: marketPriceRec.avgPrice || marketPriceRec.modalPrice || null,
          minPrice: marketPriceRec.minPrice || null,
          maxPrice: marketPriceRec.maxPrice || null,
          marketName: marketPriceRec.market || marketPriceRec.district || null,
          trend: 'RISING', // Default recent trend indicator
          unit: marketPriceRec.unit || 'Qtl',
          lastUpdated: marketPriceRec.lastUpdated || null
        };
      } else {
        missingFields.push('marketPrice');
      }
    } catch {
      missingFields.push('marketPrice');
    }

    // 7. Fetch Active Crop Cycles
    let activeCycles: any[] = [];
    try {
      const activeCycleDocs = await CropCycle.find({ user: userId, status: 'ACTIVE' }).lean();
      activeCycles = activeCycleDocs.map((c: any) => ({
        id: c._id.toString(),
        cropName: c.cropName,
        variety: c.variety,
        fieldName: c.fieldName || 'Main Field',
        currentStage: c.currentStage,
        plantingDate: c.plantingDate,
        expectedHarvestDate: c.expectedHarvestDate
      }));
    } catch {
      // Ignore if fetch fails
    }

    // 8. Fetch Agents Summary & Recent Insights
    let agentSummary = {
      activeAgentsCount: 5,
      pendingApprovalsCount: 0,
      recentInsights: [] as any[]
    };
    try {
      const pendingCount = await FarmTask.countDocuments({ user: userId, status: 'WAITING_APPROVAL' });
      const recentActivities = await AgentActivity.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      agentSummary = {
        activeAgentsCount: 5,
        pendingApprovalsCount: pendingCount,
        recentInsights: recentActivities.map((a: any) => ({
          agentType: a.agentType,
          observation: a.observation,
          reasoningSummary: a.reasoningSummary,
          status: a.status
        }))
      };
    } catch {
      // Ignore if fetch fails
    }

    // Build final Context JSON
    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        language: user.settings?.language || 'en',
        country: (user as any).countryCode || 'IN',
        currency: (user as any).currency || 'INR'
      },
      farm: {
        id: selectedFarm ? selectedFarm._id.toString() : null,
        name: selectedFarm?.name || 'My Primary Farm',
        sizeAcres: selectedFarm?.size || 1,
        soilType: selectedFarm?.soilType || 'Loam',
        waterSource: selectedFarm?.waterSource || 'Borewell',
        location: {
          address: selectedFarm?.village ? `${selectedFarm.village}, ${district}, ${state}` : user.farmLocation?.address || `${district}, ${state}`,
          village: selectedFarm?.village || user.farmLocation?.village || '',
          district: district,
          state: state,
          latitude: lat,
          longitude: lng
        },
        crops: selectedFarm?.currentCrops?.map((c: string) => ({ name: c, growthStage: 'Active' })) || [
          { name: primaryCropName, growthStage: 'Active' }
        ]
      },
      soil: soilData,
      weather: weatherData,
      disease: diseaseData,
      market: marketData,
      cropCycles: activeCycles,
      agents: agentSummary,
      meta: {
        generatedAt: new Date().toISOString(),
        missingFields
      }
    };
  }
}
