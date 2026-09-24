import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaterInfiltrationSystemProps {
  active?: boolean;
  particleCount?: number;
  speed?: number;
}

export const WaterInfiltrationSystem: React.FC<WaterInfiltrationSystemProps> = ({
  active = false,
  particleCount = 60,
  speed = 1.0,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize random particle positions across surface area and depth
  const [positions, initialDepths] = useMemo(() => {
    const posArray = new Float32Array(particleCount * 3);
    const depthArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 2.8; // X within soil block width
      posArray[i * 3 + 1] = 0.45 - Math.random() * 0.9; // Y position
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 1.8; // Z within soil block depth

      depthArray[i] = Math.random() * 0.02 + 0.008; // falling speed
    }

    return [posArray, depthArray];
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!active || !pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
    const posArray = positionAttribute.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      // Move particle downward
      posArray[i * 3 + 1] -= initialDepths[i] * speed * delta * 60;

      // Reset to top surface when reaching lower subsoil
      if (posArray[i * 3 + 1] < -0.65) {
        posArray[i * 3 + 1] = 0.45;
        posArray[i * 3] = (Math.random() - 0.5) * 2.8;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
      }
    }

    positionAttribute.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#38BDF8"
        size={0.04}
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
