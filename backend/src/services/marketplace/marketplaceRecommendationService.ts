import mongoose from 'mongoose';
import { NormalizedFarmGraphContext } from '../knowledgeGraph/graphTypes';
import { MarketplaceListing } from '../../models/MarketplaceListing';
import { MarketplaceCategoryService } from './marketplaceCategoryService';

export interface FarmMarketplaceRecommendation {
  farmId: string;
  cropName: string;
  stage: string;
  location: string;
  recommendedCategories: Array<{
    code: string;
    name: string;
    reason: string;
    icon: string;
  }>;
  verifiedListings: any[];
  hasVerifiedListings: boolean;
}

export class MarketplaceRecommendationService {
  /**
   * Produce context-aware agricultural marketplace category and service recommendations
   */
  static async getFarmRecommendations(graph: NormalizedFarmGraphContext): Promise<FarmMarketplaceRecommendation> {
    const farmId = graph.farm.id;
    const primaryCrop = graph.activeCropCycles[0];
    const cropName = primaryCrop ? primaryCrop.cropName : 'General Crop';
    const stage = primaryCrop ? primaryCrop.currentStage : 'Active';
    const district = graph.farm.location.district || '';
    const state = graph.farm.location.state || '';
    const locationStr = `${district}, ${state}`;

    const categories = await MarketplaceCategoryService.getCategories();
    const catMap = new Map(categories.map(c => [c.code, c]));

    const recommendedCategories: Array<{ code: string; name: string; reason: string; icon: string }> = [];

    // 1. Water Stress / Heat / Heavy Rain -> Irrigation Category
    if (graph.irrigationContext.waterAttentionNeeded || (graph.weatherContext.rainProbability || 0) >= 60 || (graph.weatherContext.tempCelsius || 0) >= 38) {
      const cat = catMap.get('IRRIGATION_SUPPLIES');
      if (cat) {
        recommendedCategories.push({
          code: 'IRRIGATION_SUPPLIES',
          name: cat.name,
          reason: `Water stress or weather telemetry indicates irrigation optimization needed for ${cropName}.`,
          icon: cat.icon
        });
      }
    }

    // 2. Severe Disease Scan -> Crop Protection & Advisory
    if (graph.diseaseContext.available && graph.diseaseContext.latestDiagnosis) {
      const diag = graph.diseaseContext.latestDiagnosis;
      const protCat = catMap.get('CROP_PROTECTION');
      const advCat = catMap.get('AGRICULTURAL_CONSULTING');

      if (protCat) {
        recommendedCategories.push({
          code: 'CROP_PROTECTION',
          name: protCat.name,
          reason: `Active ${diag.disease || diag.diseaseName || 'pathology'} scan detected on ${cropName}.`,
          icon: protCat.icon
        });
      }

      if (diag.severity === 'severe' && advCat) {
        recommendedCategories.push({
          code: 'AGRICULTURAL_CONSULTING',
          name: advCat.name,
          reason: `Severe pathology outbreak requires specialist agronomist advisory.`,
          icon: advCat.icon
        });
      }
    }

    // 3. Harvest Window Approaching -> Equipment, Logistics, Storage, Buyers
    if (primaryCrop && primaryCrop.ageInDays >= 80) {
      const rentCat = catMap.get('MACHINERY_RENTAL');
      const logCat = catMap.get('LOGISTICS');
      const buyCat = catMap.get('BUYERS');

      if (rentCat) {
        recommendedCategories.push({
          code: 'MACHINERY_RENTAL',
          name: rentCat.name,
          reason: `${cropName} is approaching harvest window (${primaryCrop.ageInDays} days growth).`,
          icon: rentCat.icon
        });
      }
      if (logCat) {
        recommendedCategories.push({
          code: 'LOGISTICS',
          name: logCat.name,
          reason: `Post-harvest APMC transport logistics support.`,
          icon: logCat.icon
        });
      }
      if (buyCat) {
        recommendedCategories.push({
          code: 'BUYERS',
          name: buyCat.name,
          reason: `Connect with verified crop aggregators and APMC buyers.`,
          icon: buyCat.icon
        });
      }
    }

    // 4. Stale Soil Test -> Soil Testing Service
    if (graph.soilContext.available && graph.soilContext.freshness.freshness === 'STALE') {
      const soilCat = catMap.get('SOIL_TESTING');
      if (soilCat) {
        recommendedCategories.push({
          code: 'SOIL_TESTING',
          name: soilCat.name,
          reason: `Soil chemistry analysis is over 90 days old. Re-testing recommended.`,
          icon: soilCat.icon
        });
      }
    }

    // Fallback: Default essential categories if no specific risks triggered
    if (recommendedCategories.length === 0) {
      const seedCat = catMap.get('SEEDS');
      const fertCat = catMap.get('FERTILIZERS');
      if (seedCat) recommendedCategories.push({ code: 'SEEDS', name: seedCat.name, reason: `Essential crop seed selection.`, icon: seedCat.icon });
      if (fertCat) recommendedCategories.push({ code: 'FERTILIZERS', name: fertCat.name, reason: `Basal soil nutrition and NPK supplements.`, icon: fertCat.icon });
    }

    // Query DB for verified listings matching recommended categories
    const recommendedCodes = recommendedCategories.map(c => c.code);
    let verifiedListings: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        verifiedListings = await MarketplaceListing.find({
          category: { $in: recommendedCodes },
          status: 'ACTIVE'
        })
          .populate('provider', 'name type verificationStatus contactInformation location rating profileImage')
          .limit(6)
          .lean();
      } catch (err: any) {
        console.warn('[MarketplaceRecommendationService] Listings query notice (offline mode):', err.message);
      }
    }

    return {
      farmId,
      cropName,
      stage,
      location: locationStr,
      recommendedCategories,
      verifiedListings,
      hasVerifiedListings: verifiedListings.length > 0
    };
  }
}
