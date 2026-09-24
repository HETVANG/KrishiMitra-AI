import type { CropType, GrowthStageDetailed } from '../types/animationTypes';

export interface CropGrowthProfile {
  cropType: CropType;
  name: string;
  stemColor: string;
  leafColor: string;
  hasUndergroundTubers: boolean;
  maxHeight: number;
  maxRootDepth: number;
  stages: Record<GrowthStageDetailed, {
    progressThreshold: number; // 0.0 to 1.0
    stemScale: number;
    leafCount: number;
    leafScale: number;
    rootBranchCount: number;
    tuberCount: number;
    tuberMaxScale: number;
  }>;
}

export const CROP_PROFILES: Record<CropType, CropGrowthProfile> = {
  potato: {
    cropType: 'potato',
    name: 'Potato (Solanum tuberosum)',
    stemColor: '#4f7d38',
    leafColor: '#396b27',
    hasUndergroundTubers: true,
    maxHeight: 1.2,
    maxRootDepth: 0.9,
    stages: {
      SEED: { progressThreshold: 0.0, stemScale: 0.0, leafCount: 0, leafScale: 0.0, rootBranchCount: 0, tuberCount: 0, tuberMaxScale: 0 },
      GERMINATION: { progressThreshold: 0.15, stemScale: 0.1, leafCount: 0, leafScale: 0.0, rootBranchCount: 3, tuberCount: 0, tuberMaxScale: 0 },
      SPROUT: { progressThreshold: 0.3, stemScale: 0.25, leafCount: 2, leafScale: 0.2, rootBranchCount: 6, tuberCount: 0, tuberMaxScale: 0 },
      YOUNG_PLANT: { progressThreshold: 0.5, stemScale: 0.5, leafCount: 6, leafScale: 0.5, rootBranchCount: 10, tuberCount: 3, tuberMaxScale: 0.15 },
      VEGETATIVE_GROWTH: { progressThreshold: 0.7, stemScale: 0.8, leafCount: 12, leafScale: 0.8, rootBranchCount: 14, tuberCount: 5, tuberMaxScale: 0.35 },
      MATURE: { progressThreshold: 0.9, stemScale: 1.0, leafCount: 16, leafScale: 1.0, rootBranchCount: 18, tuberCount: 7, tuberMaxScale: 0.5 },
      HARVEST_READY: { progressThreshold: 1.0, stemScale: 1.0, leafCount: 16, leafScale: 1.0, rootBranchCount: 18, tuberCount: 8, tuberMaxScale: 0.55 },
      STAGE_UNKNOWN: { progressThreshold: 0.5, stemScale: 0.6, leafCount: 8, leafScale: 0.6, rootBranchCount: 8, tuberCount: 3, tuberMaxScale: 0.25 },
    },
  },
  wheat: {
    cropType: 'wheat',
    name: 'Wheat (Triticum aestivum)',
    stemColor: '#a89448',
    leafColor: '#bdab53',
    hasUndergroundTubers: false,
    maxHeight: 1.4,
    maxRootDepth: 0.7,
    stages: {
      SEED: { progressThreshold: 0.0, stemScale: 0.0, leafCount: 0, leafScale: 0.0, rootBranchCount: 0, tuberCount: 0, tuberMaxScale: 0 },
      GERMINATION: { progressThreshold: 0.15, stemScale: 0.1, leafCount: 0, leafScale: 0.0, rootBranchCount: 3, tuberCount: 0, tuberMaxScale: 0 },
      SPROUT: { progressThreshold: 0.3, stemScale: 0.3, leafCount: 2, leafScale: 0.3, rootBranchCount: 5, tuberCount: 0, tuberMaxScale: 0 },
      YOUNG_PLANT: { progressThreshold: 0.5, stemScale: 0.6, leafCount: 4, leafScale: 0.6, rootBranchCount: 8, tuberCount: 0, tuberMaxScale: 0 },
      VEGETATIVE_GROWTH: { progressThreshold: 0.7, stemScale: 0.85, leafCount: 6, leafScale: 0.85, rootBranchCount: 10, tuberCount: 0, tuberMaxScale: 0 },
      MATURE: { progressThreshold: 0.9, stemScale: 1.0, leafCount: 8, leafScale: 1.0, rootBranchCount: 12, tuberCount: 0, tuberMaxScale: 0 },
      HARVEST_READY: { progressThreshold: 1.0, stemScale: 1.0, leafCount: 8, leafScale: 1.0, rootBranchCount: 12, tuberCount: 0, tuberMaxScale: 0 },
      STAGE_UNKNOWN: { progressThreshold: 0.5, stemScale: 0.6, leafCount: 4, leafScale: 0.6, rootBranchCount: 8, tuberCount: 0, tuberMaxScale: 0 },
    },
  },
  rice: {
    cropType: 'rice',
    name: 'Rice (Oryza sativa)',
    stemColor: '#529438',
    leafColor: '#43802b',
    hasUndergroundTubers: false,
    maxHeight: 1.1,
    maxRootDepth: 0.6,
    stages: {
      SEED: { progressThreshold: 0.0, stemScale: 0.0, leafCount: 0, leafScale: 0.0, rootBranchCount: 0, tuberCount: 0, tuberMaxScale: 0 },
      GERMINATION: { progressThreshold: 0.15, stemScale: 0.1, leafCount: 0, leafScale: 0.0, rootBranchCount: 2, tuberCount: 0, tuberMaxScale: 0 },
      SPROUT: { progressThreshold: 0.3, stemScale: 0.25, leafCount: 3, leafScale: 0.3, rootBranchCount: 4, tuberCount: 0, tuberMaxScale: 0 },
      YOUNG_PLANT: { progressThreshold: 0.5, stemScale: 0.55, leafCount: 6, leafScale: 0.6, rootBranchCount: 7, tuberCount: 0, tuberMaxScale: 0 },
      VEGETATIVE_GROWTH: { progressThreshold: 0.7, stemScale: 0.8, leafCount: 9, leafScale: 0.85, rootBranchCount: 10, tuberCount: 0, tuberMaxScale: 0 },
      MATURE: { progressThreshold: 0.9, stemScale: 1.0, leafCount: 12, leafScale: 1.0, rootBranchCount: 12, tuberCount: 0, tuberMaxScale: 0 },
      HARVEST_READY: { progressThreshold: 1.0, stemScale: 1.0, leafCount: 12, leafScale: 1.0, rootBranchCount: 12, tuberCount: 0, tuberMaxScale: 0 },
      STAGE_UNKNOWN: { progressThreshold: 0.5, stemScale: 0.55, leafCount: 6, leafScale: 0.6, rootBranchCount: 7, tuberCount: 0, tuberMaxScale: 0 },
    },
  },
  maize: {
    cropType: 'maize',
    name: 'Maize (Zea mays)',
    stemColor: '#5a9634',
    leafColor: '#4c8728',
    hasUndergroundTubers: false,
    maxHeight: 1.8,
    maxRootDepth: 0.8,
    stages: {
      SEED: { progressThreshold: 0.0, stemScale: 0.0, leafCount: 0, leafScale: 0.0, rootBranchCount: 0, tuberCount: 0, tuberMaxScale: 0 },
      GERMINATION: { progressThreshold: 0.15, stemScale: 0.1, leafCount: 0, leafScale: 0.0, rootBranchCount: 3, tuberCount: 0, tuberMaxScale: 0 },
      SPROUT: { progressThreshold: 0.3, stemScale: 0.3, leafCount: 2, leafScale: 0.3, rootBranchCount: 5, tuberCount: 0, tuberMaxScale: 0 },
      YOUNG_PLANT: { progressThreshold: 0.5, stemScale: 0.6, leafCount: 5, leafScale: 0.6, rootBranchCount: 8, tuberCount: 0, tuberMaxScale: 0 },
      VEGETATIVE_GROWTH: { progressThreshold: 0.7, stemScale: 0.85, leafCount: 8, leafScale: 0.85, rootBranchCount: 12, tuberCount: 0, tuberMaxScale: 0 },
      MATURE: { progressThreshold: 0.9, stemScale: 1.0, leafCount: 12, leafScale: 1.0, rootBranchCount: 15, tuberCount: 0, tuberMaxScale: 0 },
      HARVEST_READY: { progressThreshold: 1.0, stemScale: 1.0, leafCount: 12, leafScale: 1.0, rootBranchCount: 15, tuberCount: 0, tuberMaxScale: 0 },
      STAGE_UNKNOWN: { progressThreshold: 0.5, stemScale: 0.6, leafCount: 5, leafScale: 0.6, rootBranchCount: 8, tuberCount: 0, tuberMaxScale: 0 },
    },
  },
  cotton: {
    cropType: 'cotton',
    name: 'Cotton (Gossypium hirsutum)',
    stemColor: '#4d8238',
    leafColor: '#3a6e26',
    hasUndergroundTubers: false,
    maxHeight: 1.3,
    maxRootDepth: 0.7,
    stages: {
      SEED: { progressThreshold: 0.0, stemScale: 0.0, leafCount: 0, leafScale: 0.0, rootBranchCount: 0, tuberCount: 0, tuberMaxScale: 0 },
      GERMINATION: { progressThreshold: 0.15, stemScale: 0.1, leafCount: 0, leafScale: 0.0, rootBranchCount: 2, tuberCount: 0, tuberMaxScale: 0 },
      SPROUT: { progressThreshold: 0.3, stemScale: 0.25, leafCount: 2, leafScale: 0.2, rootBranchCount: 5, tuberCount: 0, tuberMaxScale: 0 },
      YOUNG_PLANT: { progressThreshold: 0.5, stemScale: 0.55, leafCount: 6, leafScale: 0.5, rootBranchCount: 8, tuberCount: 0, tuberMaxScale: 0 },
      VEGETATIVE_GROWTH: { progressThreshold: 0.7, stemScale: 0.8, leafCount: 10, leafScale: 0.8, rootBranchCount: 11, tuberCount: 0, tuberMaxScale: 0 },
      MATURE: { progressThreshold: 0.9, stemScale: 1.0, leafCount: 14, leafScale: 1.0, rootBranchCount: 14, tuberCount: 0, tuberMaxScale: 0 },
      HARVEST_READY: { progressThreshold: 1.0, stemScale: 1.0, leafCount: 14, leafScale: 1.0, rootBranchCount: 14, tuberCount: 0, tuberMaxScale: 0 },
      STAGE_UNKNOWN: { progressThreshold: 0.5, stemScale: 0.55, leafCount: 6, leafScale: 0.5, rootBranchCount: 8, tuberCount: 0, tuberMaxScale: 0 },
    },
  },
  neutral: {
    cropType: 'neutral',
    name: 'Agricultural Crop',
    stemColor: '#4f8534',
    leafColor: '#3d7025',
    hasUndergroundTubers: false,
    maxHeight: 1.2,
    maxRootDepth: 0.7,
    stages: {
      SEED: { progressThreshold: 0.0, stemScale: 0.0, leafCount: 0, leafScale: 0.0, rootBranchCount: 0, tuberCount: 0, tuberMaxScale: 0 },
      GERMINATION: { progressThreshold: 0.15, stemScale: 0.1, leafCount: 0, leafScale: 0.0, rootBranchCount: 2, tuberCount: 0, tuberMaxScale: 0 },
      SPROUT: { progressThreshold: 0.3, stemScale: 0.25, leafCount: 2, leafScale: 0.25, rootBranchCount: 4, tuberCount: 0, tuberMaxScale: 0 },
      YOUNG_PLANT: { progressThreshold: 0.5, stemScale: 0.55, leafCount: 5, leafScale: 0.55, rootBranchCount: 7, tuberCount: 0, tuberMaxScale: 0 },
      VEGETATIVE_GROWTH: { progressThreshold: 0.7, stemScale: 0.8, leafCount: 8, leafScale: 0.8, rootBranchCount: 10, tuberCount: 0, tuberMaxScale: 0 },
      MATURE: { progressThreshold: 0.9, stemScale: 1.0, leafCount: 10, leafScale: 1.0, rootBranchCount: 12, tuberCount: 0, tuberMaxScale: 0 },
      HARVEST_READY: { progressThreshold: 1.0, stemScale: 1.0, leafCount: 10, leafScale: 1.0, rootBranchCount: 12, tuberCount: 0, tuberMaxScale: 0 },
      STAGE_UNKNOWN: { progressThreshold: 0.5, stemScale: 0.55, leafCount: 5, leafScale: 0.55, rootBranchCount: 7, tuberCount: 0, tuberMaxScale: 0 },
    },
  },
};
