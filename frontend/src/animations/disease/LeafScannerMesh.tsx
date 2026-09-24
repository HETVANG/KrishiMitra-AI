import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { NormalizedDiseaseVisual } from './diseaseResolver';
import { organicSway } from '../utils/naturalMovement';

interface LeafScannerMeshProps {
  visualResult?: NormalizedDiseaseVisual;
  scale?: number;
}

export const LeafScannerMesh: React.FC<LeafScannerMeshProps> = ({
  visualResult,
  scale = 1.0,
}) => {
  const leafGroupRef = useRef<THREE.Group>(null);

  const {
    isHealthy = true,
    spotDensity = 0,
    browningEdges = false,
    chlorosisYellow = false,
  } = visualResult || {};

  // Compute leaf base color based on verified health state
  const baseColor = useMemo(() => {
    if (isHealthy) return '#3d7828'; // Rich healthy leaf green
    if (chlorosisYellow) return '#a39c32'; // Chlorosis yellowing
    if (browningEdges) return '#5e5a2b'; // Stressed/scorched brown-green
    return '#4a6927'; // Dark diseased leaf green
  }, [isHealthy, chlorosisYellow, browningEdges]);

  // Generate deterministic lesion / spot positions on leaf blade
  const spotPositions = useMemo(() => {
    if (isHealthy || spotDensity <= 0) return [];
    const count = Math.floor(16 * spotDensity);
    const list = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 0.7;
      const y = (Math.random() - 0.5) * 1.1;
      const radius = 0.04 + Math.random() * 0.06;
      list.push({ x, y, radius });
    }
    return list;
  }, [isHealthy, spotDensity]);

  useFrame((state) => {
    if (!leafGroupRef.current) return;

    const time = state.clock.getElapsedTime();
    // Gentle natural leaf breathing/sway
    const swayX = organicSway(time, 0.8, 0.04, 0);
    const swayZ = organicSway(time, 0.6, 0.03, 1.0);

    leafGroupRef.current.rotation.set(swayZ, 0, swayX);
  });

  return (
    <group ref={leafGroupRef} scale={scale} position={[0, 0, 0]}>
      {/* Leaf Stem / Petiole */}
      <mesh position={[0, -0.75, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#2d521e" roughness={0.8} />
      </mesh>

      {/* Main Curved Leaf Blade */}
      <mesh position={[0, 0.05, 0]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.65}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Central Midrib Vein */}
      <mesh position={[0, 0.05, 0.02]}>
        <cylinderGeometry args={[0.012, 0.02, 1.3, 6]} />
        <meshStandardMaterial color="#508738" roughness={0.7} />
      </mesh>

      {/* Symptom Lesion Spots (Rendered ONLY when AI confirms disease) */}
      {!isHealthy &&
        spotPositions.map((spot, idx) => (
          <mesh
            key={`lesion-spot-${idx}`}
            position={[spot.x, spot.y, 0.03]}
            scale={[spot.radius, spot.radius, 0.01]}
          >
            <circleGeometry args={[1, 10]} />
            <meshStandardMaterial
              color="#362214" // Dark fungal / necrosis spot
              roughness={0.9}
            />
          </mesh>
        ))}
    </group>
  );
};
