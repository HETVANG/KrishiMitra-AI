import React from 'react';
import { useQualitySettings } from './QualitySettingsProvider';

interface LightingProps {
  timeOfDay?: 'morning' | 'noon' | 'afternoon' | 'goldenHour';
  enableShadows?: boolean;
}

export const Lighting: React.FC<LightingProps> = ({
  timeOfDay = 'morning',
  enableShadows,
}) => {
  const { settings } = useQualitySettings();
  const shadowsActive = enableShadows !== undefined ? enableShadows : settings.shadows;

  // Agricultural warm natural colors
  const sunColors = {
    morning: '#fff4e0',
    noon: '#ffffff',
    afternoon: '#ffebd0',
    goldenHour: '#ffd89b',
  };

  const sunPositions: Record<string, [number, number, number]> = {
    morning: [8, 12, 6],
    noon: [2, 18, 4],
    afternoon: [-8, 10, 6],
    goldenHour: [12, 5, 8],
  };

  const ambientIntensities = {
    morning: 0.65,
    noon: 0.75,
    afternoon: 0.65,
    goldenHour: 0.55,
  };

  return (
    <>
      <ambientLight color="#f0f7f2" intensity={ambientIntensities[timeOfDay]} />
      
      <directionalLight
        position={sunPositions[timeOfDay]}
        intensity={1.2}
        color={sunColors[timeOfDay]}
        castShadow={shadowsActive}
        shadow-mapSize-width={shadowsActive ? 1024 : 256}
        shadow-mapSize-height={shadowsActive ? 1024 : 256}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />

      {/* Subtle sky fill light */}
      <directionalLight
        position={[-6, 10, -8]}
        intensity={0.35}
        color="#c8e4d2"
      />
    </>
  );
};
