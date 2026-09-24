import React, { ReactNode } from 'react';
import { AnimationCanvas } from '../components/AnimationCanvas';
import { QualitySettingsProvider } from '../components/QualitySettingsProvider';
import { Lighting } from '../components/Lighting';
import { Atmosphere } from '../environment/Atmosphere';
import { AICoreMesh } from '../ai/AICoreMesh';
import { DataStreamParticles } from '../ai/DataStreamParticles';
import { FarmerCharacterMesh } from '../ai/FarmerCharacterMesh';
import type { NormalizedAICorePayload } from '../ai/aiCoreState';

interface AICoreSceneProps {
  visualResult?: NormalizedAICorePayload;
  children?: ReactNode;
  className?: string;
  fallback?: ReactNode;
}

export const AICoreScene: React.FC<AICoreSceneProps> = ({
  visualResult,
  children,
  className = 'w-full h-full pointer-events-none',
  fallback,
}) => {
  const currentState = visualResult?.state || 'IDLE';
  const isInteracting = currentState !== 'IDLE';

  return (
    <QualitySettingsProvider>
      <AnimationCanvas
        cameraPosition={[0, 0.4, 3.2]}
        className={className}
        fallback={fallback}
      >
        <Lighting timeOfDay="morning" />
        <Atmosphere near={4} far={18} />

        {/* 3D AI Core Luminescent Core & Orbital Horizons */}
        <AICoreMesh state={currentState} scale={1.05} />

        {/* 3D Data Streams from Context Origins */}
        <DataStreamParticles active={isInteracting} state={currentState} particleCount={55} />

        {/* 3D Respectful Neutral Farmer Figure */}
        <FarmerCharacterMesh isInteracting={isInteracting} scale={1.0} />

        {children}
      </AnimationCanvas>
    </QualitySettingsProvider>
  );
};
