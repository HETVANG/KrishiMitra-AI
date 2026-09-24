import React from 'react';
import { useQualitySettings } from '../components/QualitySettingsProvider';

interface FarmSoilProps {
  size?: number;
  color?: string;
}

export const FarmSoil: React.FC<FarmSoilProps> = ({
  size = 60,
  color = '#3b2f23', // Rich fertile alluvial soil brown
}) => {
  const { settings } = useQualitySettings();

  return (
    <group position={[0, -0.02, 0]}>
      {/* Main fertile soil plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={settings.shadows}>
        <planeGeometry args={[size, size, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.92}
          metalness={0.03}
        />
      </mesh>

      {/* Subtle organic field ridges / furrows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[size * 0.8, size * 0.8, 12, 12]} />
        <meshStandardMaterial
          color="#483a2b"
          roughness={0.88}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};
