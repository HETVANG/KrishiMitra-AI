import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQualitySettings } from '../components/QualitySettingsProvider';
import { organicSway } from '../utils/naturalMovement';

interface FarmTreesProps {
  count?: number;
}

export const FarmTrees: React.FC<FarmTreesProps> = () => {
  const { settings } = useQualitySettings();
  const treeCanopyRef1 = useRef<THREE.Group>(null);
  const treeCanopyRef2 = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Slow, broad wind movement for tree canopy
    if (treeCanopyRef1.current) {
      const swayZ = organicSway(time, 0.4, 0.04, 0);
      treeCanopyRef1.current.rotation.z = swayZ;
    }

    if (treeCanopyRef2.current) {
      const swayX = organicSway(time, 0.35, 0.05, 1.2);
      treeCanopyRef2.current.rotation.x = swayX;
    }
  });

  const activeShadows = settings.shadows && settings.level === 'HIGH';

  return (
    <group>
      {/* Tree 1 - Mid-Left Farm Boundary Tree */}
      <group position={[-5.2, 0, -3.5]}>
        {/* Trunk */}
        <mesh position={[0, 1.2, 0]} castShadow={activeShadows}>
          <cylinderGeometry args={[0.16, 0.28, 2.4, 8]} />
          <meshStandardMaterial color="#423123" roughness={0.9} />
        </mesh>
        {/* Canopy */}
        <group ref={treeCanopyRef1} position={[0, 2.8, 0]}>
          <mesh castShadow={activeShadows}>
            <dodecahedronGeometry args={[1.5, 1]} />
            <meshStandardMaterial color="#355e28" roughness={0.7} />
          </mesh>
          <mesh position={[0.4, 0.5, 0.3]} castShadow={activeShadows}>
            <dodecahedronGeometry args={[1.1, 1]} />
            <meshStandardMaterial color="#3e6b2f" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Tree 2 - Background Right Tree */}
      <group position={[6.5, 0, -6.0]} scale={1.2}>
        {/* Trunk */}
        <mesh position={[0, 1.4, 0]} castShadow={activeShadows}>
          <cylinderGeometry args={[0.18, 0.32, 2.8, 8]} />
          <meshStandardMaterial color="#38291c" roughness={0.9} />
        </mesh>
        {/* Canopy */}
        <group ref={treeCanopyRef2} position={[0, 3.2, 0]}>
          <mesh castShadow={activeShadows}>
            <dodecahedronGeometry args={[1.8, 1]} />
            <meshStandardMaterial color="#2d5220" roughness={0.75} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
