import React, { ReactNode } from 'react';
import { AnimationCanvas } from '../components/AnimationCanvas';
import { QualitySettingsProvider } from '../components/QualitySettingsProvider';
import { Lighting } from '../components/Lighting';
import { FarmSky } from '../environment/FarmSky';
import { FarmGround } from '../environment/FarmGround';
import { Atmosphere } from '../environment/Atmosphere';
import { DustParticles } from '../environment/DustParticles';
import { WindSystemComponent } from '../environment/WindSystemComponent';

interface BaseSceneProps {
  children?: ReactNode;
  showGround?: boolean;
  showSky?: boolean;
  showDust?: boolean;
  cameraPosition?: [number, number, number];
  timeOfDay?: 'morning' | 'noon' | 'afternoon' | 'goldenHour';
  className?: string;
  fallback?: ReactNode;
}

export const BaseScene: React.FC<BaseSceneProps> = ({
  children,
  showGround = true,
  showSky = true,
  showDust = true,
  cameraPosition = [0, 2, 8],
  timeOfDay = 'morning',
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
        <Atmosphere />
        {showSky && <FarmSky />}
        {showGround && <FarmGround />}
        {showDust && <DustParticles />}
        {children}
      </AnimationCanvas>
    </QualitySettingsProvider>
  );
};
