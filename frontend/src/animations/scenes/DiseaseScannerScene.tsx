import React, { ReactNode } from 'react';
import { AnimationCanvas } from '../components/AnimationCanvas';
import { QualitySettingsProvider } from '../components/QualitySettingsProvider';
import { Lighting } from '../components/Lighting';
import { Atmosphere } from '../environment/Atmosphere';
import { LeafScannerMesh } from '../disease/LeafScannerMesh';
import { ScanningLightBeam } from '../disease/ScanningLightBeam';
import type { NormalizedDiseaseVisual } from '../disease/diseaseResolver';

interface DiseaseScannerSceneProps {
  visualResult?: NormalizedDiseaseVisual;
  isScanning?: boolean;
  children?: ReactNode;
  className?: string;
  fallback?: ReactNode;
}

export const DiseaseScannerScene: React.FC<DiseaseScannerSceneProps> = ({
  visualResult,
  isScanning = false,
  children,
  className = 'w-full h-full pointer-events-none',
  fallback,
}) => {
  return (
    <QualitySettingsProvider>
      <AnimationCanvas
        cameraPosition={[0, 0, 3.2]}
        className={className}
        fallback={fallback}
      >
        <Lighting timeOfDay="morning" />
        <Atmosphere near={4} far={18} />

        {/* 3D Leaf Model with AI symptom overlays */}
        <LeafScannerMesh visualResult={visualResult} scale={1.1} />

        {/* Agricultural AI Light Beam Sweep */}
        <ScanningLightBeam active={isScanning} />

        {children}
      </AnimationCanvas>
    </QualitySettingsProvider>
  );
};
