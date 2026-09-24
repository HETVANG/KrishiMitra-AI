import { useState, useCallback, useRef } from 'react';
import type { CropType, GrowthStageDetailed, CameraViewMode } from '../types/animationTypes';
import { CROP_PROFILES } from './CropGrowthProfile';

export interface CropGrowthControllerOptions {
  initialCrop?: CropType;
  initialStage?: GrowthStageDetailed;
  autoPlay?: boolean;
  speed?: number;
}

export function useCropGrowthController(options: CropGrowthControllerOptions = {}) {
  const {
    initialCrop = 'potato',
    initialStage = 'MATURE',
    autoPlay = false,
    speed = 0.1,
  } = options;

  const [cropType, setCropType] = useState<CropType>(initialCrop);
  const [currentStage, setCurrentStage] = useState<GrowthStageDetailed>(initialStage);
  const [progress, setProgress] = useState<number>(() => {
    const profile = CROP_PROFILES[initialCrop] || CROP_PROFILES.neutral;
    return profile.stages[initialStage]?.progressThreshold ?? 0.8;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [viewMode, setViewMode] = useState<CameraViewMode>('ABOVE_GROUND');

  const speedRef = useRef<number>(speed);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const resume = useCallback(() => setIsPlaying(true), []);
  
  const reset = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentStage('SEED');
  }, []);

  const setCrop = useCallback((newCrop: CropType) => {
    setCropType(newCrop);
  }, []);

  const setStage = useCallback((stage: GrowthStageDetailed) => {
    setCurrentStage(stage);
    const profile = CROP_PROFILES[cropType] || CROP_PROFILES.neutral;
    const targetProg = profile.stages[stage]?.progressThreshold ?? 0.5;
    setProgress(targetProg);
  }, [cropType]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'ABOVE_GROUND' ? 'UNDERGROUND' : 'ABOVE_GROUND'));
  }, []);

  return {
    cropType,
    currentStage,
    progress,
    isPlaying,
    viewMode,
    play,
    pause,
    resume,
    reset,
    setCrop,
    setStage,
    setProgress,
    setViewMode,
    toggleViewMode,
  };
}
