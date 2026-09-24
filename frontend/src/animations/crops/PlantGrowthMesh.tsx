import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CROP_PROFILES } from './CropGrowthProfile';
import type { CropType } from '../types/animationTypes';
import { organicSway } from '../utils/naturalMovement';

interface PlantGrowthMeshProps {
  cropType?: CropType;
  progress?: number; // 0.0 to 1.0 growth progress
  windSway?: boolean;
}

export const PlantGrowthMesh: React.FC<PlantGrowthMeshProps> = ({
  cropType = 'potato',
  progress = 0.5,
  windSway = true,
}) => {
  const profile = CROP_PROFILES[cropType] || CROP_PROFILES.neutral;
  const plantGroupRef = useRef<THREE.Group>(null);

  const currentHeight = Math.max(0.02, profile.maxHeight * progress);
  const stemRadius = Math.max(0.01, 0.04 * Math.sqrt(progress));
  const leafScale = Math.min(1.0, progress * 1.3);

  // Generate leaf node layout around stem
  const leavesData = useMemo(() => {
    const list = [];
    const count = Math.floor(14 * Math.min(1.0, progress));
    for (let i = 0; i < count; i++) {
      const heightFrac = (i + 1) / (count + 1);
      const angle = i * 2.4; // Phyllotaxis golden spiral angle
      const rotZ = 0.4 + (i % 3) * 0.1;
      list.push({ heightFrac, angle, rotZ });
    }
    return list;
  }, [progress]);

  useFrame((state) => {
    if (!plantGroupRef.current || !windSway) return;

    const time = state.clock.getElapsedTime();
    const swayX = organicSway(time, 1.2, 0.05 * progress, 0);
    const swayZ = organicSway(time, 0.9, 0.04 * progress, 1.0);

    plantGroupRef.current.rotation.set(swayZ, 0, swayX);
  });

  return (
    <group ref={plantGroupRef} position={[0, 0, 0]}>
      {/* Seed (Visible at initial growth progress < 0.15) */}
      {progress < 0.2 && (
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#6e543c" roughness={0.9} />
        </mesh>
      )}

      {/* Main Stem */}
      {progress >= 0.1 && (
        <mesh position={[0, currentHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[stemRadius * 0.7, stemRadius, currentHeight, 10]} />
          <meshStandardMaterial color={profile.stemColor} roughness={0.7} />
        </mesh>
      )}

      {/* Leaves */}
      {progress >= 0.25 &&
        leavesData.map((leaf, idx) => {
          const leafY = leaf.heightFrac * currentHeight;
          return (
            <group key={`leaf-${idx}`} position={[0, leafY, 0]} rotation={[0, leaf.angle, 0]}>
              <mesh
                position={[0.12 * leafScale, 0, 0]}
                rotation={[0, 0, leaf.rotZ]}
                scale={[leafScale * 0.22, leafScale * 0.04, leafScale * 0.12]}
                castShadow
              >
                <sphereGeometry args={[1, 10, 8]} />
                <meshStandardMaterial color={profile.leafColor} roughness={0.65} />
              </mesh>
            </group>
          );
        })}
    </group>
  );
};
