import React, { ReactNode } from 'react';
import { AnimationCanvas } from '../components/AnimationCanvas';
import { QualitySettingsProvider } from '../components/QualitySettingsProvider';
import { Lighting } from '../components/Lighting';
import { Atmosphere } from '../environment/Atmosphere';
import { SoilCrossSectionMesh } from '../irrigation/SoilCrossSectionMesh';
import { WaterInfiltrationSystem } from '../irrigation/WaterInfiltrationSystem';
import { IrrigationMethodSystem } from '../irrigation/IrrigationMethodSystem';
import type { NormalizedIrrigationVisual } from '../irrigation/irrigationResolver';

interface SoilIrrigationSceneProps {
  visualResult?: NormalizedIrrigationVisual;
  isIrrigating?: boolean;
  selectedHorizon?: 'all' | 'surface' | 'root_zone' | 'deeper_soil';
  children?: ReactNode;
  className?: string;
  fallback?: ReactNode;
}

export const SoilIrrigationScene: React.FC<SoilIrrigationSceneProps> = ({
  visualResult,
  isIrrigating = false,
  selectedHorizon = 'all',
  children,
  className = 'w-full h-full pointer-events-none',
  fallback,
}) => {
  const activeWaterFlow = isIrrigating || Boolean(visualResult?.isRaining);

  return (
    <QualitySettingsProvider>
      <AnimationCanvas
        cameraPosition={[2.2, 1.4, 3.2]}
        className={className}
        fallback={fallback}
      >
        <Lighting timeOfDay="afternoon" />
        <Atmosphere near={5} far={20} />

        {/* 3D Soil Horizon & Crop Root Mesh */}
        <SoilCrossSectionMesh
          soilMoistureLevel={visualResult?.soilMoistureLevel}
          cropType={visualResult?.cropType}
          soilType={visualResult?.soilType}
          selectedHorizon={selectedHorizon}
        />

        {/* 3D Water Infiltration Particles */}
        <WaterInfiltrationSystem active={activeWaterFlow} particleCount={70} speed={1.1} />

        {/* 3D Irrigation Hardware & Surface Distribution */}
        <IrrigationMethodSystem method={visualResult?.method} active={isIrrigating} />

        {children}
      </AnimationCanvas>
    </QualitySettingsProvider>
  );
};
