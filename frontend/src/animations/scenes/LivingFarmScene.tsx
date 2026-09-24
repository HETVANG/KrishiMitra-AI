import React, { ReactNode } from 'react';
import { AnimationCanvas } from '../components/AnimationCanvas';
import { QualitySettingsProvider } from '../components/QualitySettingsProvider';
import { Lighting } from '../components/Lighting';
import { Atmosphere } from '../environment/Atmosphere';
import { FarmSky } from '../environment/FarmSky';
import { FarmSoil } from '../environment/FarmSoil';
import { InstancedCrops } from '../environment/InstancedCrops';
import { InstancedGrass } from '../environment/InstancedGrass';
import { FarmTrees } from '../environment/FarmTrees';
import { DistantLandscape } from '../environment/DistantLandscape';
import { DustParticles } from '../environment/DustParticles';
import { WindSystemComponent } from '../environment/WindSystemComponent';
import { RealisticSparrow } from '../animals/sparrow/RealisticSparrow';
import type { CropType, GrowthStage, CropHealthState, EnvironmentWeatherState } from '../types/animationTypes';

interface LivingFarmSceneProps {
  children?: ReactNode;
  cropType?: CropType;
  growthStage?: GrowthStage;
  healthState?: CropHealthState;
  weatherState?: EnvironmentWeatherState;
  timeOfDay?: 'morning' | 'noon' | 'afternoon' | 'goldenHour';
  includeSparrow?: boolean;
  cameraPosition?: [number, number, number];
  className?: string;
  fallback?: ReactNode;
}

export const LivingFarmScene: React.FC<LivingFarmSceneProps> = ({
  children,
  cropType = 'neutral',
  growthStage = 'mature',
  healthState = 'HEALTHY',
  weatherState = 'CLEAR',
  timeOfDay = 'morning',
  includeSparrow = true,
  cameraPosition = [0, 2.2, 7.5],
  className = 'w-full h-full pointer-events-none',
  fallback,
}) => {
  return (
    <QualitySettingsProvider>
      <AnimationCanvas
        cameraPosition={cameraPosition}
        className={className}
        fallback={fallback}
      >
        <Lighting timeOfDay={timeOfDay} />
        <WindSystemComponent />
        <Atmosphere near={6} far={35} />
        <FarmSky />
        <DistantLandscape />
        <FarmSoil />
        <InstancedGrass />
        <InstancedCrops cropType={cropType} growthStage={growthStage} />
        <FarmTrees />
        <DustParticles />
        {includeSparrow && <RealisticSparrow showBranch={true} autoStart={true} scale={0.7} />}
        {children}
      </AnimationCanvas>
    </QualitySettingsProvider>
  );
};
