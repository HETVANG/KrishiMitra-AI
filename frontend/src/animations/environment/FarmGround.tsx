import React from 'react';
import { useQualitySettings } from '../components/QualitySettingsProvider';

interface FarmGroundProps {
  size?: number;
  color?: string;
  receiveShadow?: boolean;
}

export const FarmGround: React.FC<FarmGroundProps> = ({
  size = 50,
  color = '#4a6b38', // rich natural farm green
  receiveShadow,
}) => {
  const { settings } = useQualitySettings();
  const shadowsActive = receiveShadow !== undefined ? receiveShadow : settings.shadows;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow={shadowsActive}
    >
      <planeGeometry args={[size, size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  );
};
