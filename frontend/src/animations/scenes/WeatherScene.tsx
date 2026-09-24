import React, { ReactNode, useMemo } from 'react';
import { AnimationCanvas } from '../components/AnimationCanvas';
import { QualitySettingsProvider } from '../components/QualitySettingsProvider';
import { Lighting } from '../components/Lighting';
import { Atmosphere } from '../environment/Atmosphere';
import { FarmSky } from '../environment/FarmSky';
import { FarmSoil } from '../environment/FarmSoil';
import { InstancedGrass } from '../environment/InstancedGrass';
import { InstancedCrops } from '../environment/InstancedCrops';
import { FarmTrees } from '../environment/FarmTrees';
import { DistantLandscape } from '../environment/DistantLandscape';
import { DustParticles } from '../environment/DustParticles';
import { WindSystemComponent } from '../environment/WindSystemComponent';
import { RainSystem } from '../weather/RainSystem';
import { CloudSystem } from '../weather/CloudSystem';
import { LightningEffect } from '../weather/LightningEffect';
import { RealisticSparrow } from '../animals/sparrow/RealisticSparrow';
import { resolveWeatherState } from '../weather/weatherResolver';
import type { ResolvedWeatherVisual } from '../weather/weatherResolver';
import type { CropType } from '../types/animationTypes';

interface WeatherSceneProps {
  weatherData?: any;
  cropType?: CropType;
  children?: ReactNode;
  className?: string;
  fallback?: ReactNode;
}

export const WeatherScene: React.FC<WeatherSceneProps> = ({
  weatherData,
  cropType = 'neutral',
  children,
  className = 'w-full h-full pointer-events-none',
  fallback,
}) => {
  const resolved: ResolvedWeatherVisual = useMemo(
    () => resolveWeatherState(weatherData),
    [weatherData]
  );

  const isRaining = resolved.rainIntensity > 0.1;

  return (
    <QualitySettingsProvider>
      <AnimationCanvas
        cameraPosition={[0, 2.2, 7.5]}
        className={className}
        fallback={fallback}
      >
        <Lighting timeOfDay={resolved.isNight ? 'afternoon' : 'morning'} />
        <WindSystemComponent wind={{ speed: 1.0 + resolved.windSpeed * 3.0 }} />

        {/* Dynamic Fog & Atmosphere */}
        <Atmosphere
          color={isRaining ? '#6d7f8e' : resolved.skyColorBottom}
          near={isRaining ? 4 : 8}
          far={isRaining ? 24 : 40}
        />

        {/* Dynamic Sky */}
        <FarmSky colorTop={resolved.skyColorTop} colorBottom={resolved.skyColorBottom} />
        <DistantLandscape />

        {/* Dynamic Soil Ground */}
        <FarmSoil color={resolved.isWetGround ? '#281f17' : '#3b2f23'} />
        <InstancedGrass />
        <InstancedCrops cropType={cropType} />
        <FarmTrees />

        {/* Weather 3D Layers */}
        <CloudSystem
          coverage={resolved.cloudCoverage}
          isDark={isRaining}
          windSpeed={resolved.windSpeed}
        />

        <RainSystem
          intensity={resolved.rainIntensity}
          windSpeed={resolved.windSpeed}
        />

        <LightningEffect active={resolved.isStorm} />

        {!isRaining && <DustParticles />}

        {/* Sparrow Response: Shelter on branch during rain */}
        <RealisticSparrow showBranch={true} autoStart={!isRaining} scale={0.7} />

        {children}
      </AnimationCanvas>
    </QualitySettingsProvider>
  );
};
