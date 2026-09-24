import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AICoreVisualState } from './aiCoreState';

interface DataStreamParticlesProps {
  active?: boolean;
  state?: AICoreVisualState;
  particleCount?: number;
}

export const DataStreamParticles: React.FC<DataStreamParticlesProps> = ({
  active = false,
  state = 'IDLE',
  particleCount = 50,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize random particle stream positions starting at outer bounds
  const positions = useMemo(() => {
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 0.8;
      posArray[i * 3] = Math.cos(angle) * radius; // X
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 1.2 + 0.4; // Y
      posArray[i * 3 + 2] = Math.sin(angle) * radius; // Z
    }

    return posArray;
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !active) return;

    const geometry = pointsRef.current.geometry;
    const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
    const pos = positionAttr.array as Float32Array;

    const targetX = 0;
    const targetY = 0.4;
    const targetZ = 0;

    for (let i = 0; i < particleCount; i++) {
      const dx = targetX - pos[i * 3];
      const dy = targetY - pos[i * 3 + 1];
      const dz = targetZ - pos[i * 3 + 2];

      const dist = Math.hypot(dx, dy, dz);

      if (dist < 0.1) {
        // Reset to outer rim when reaching core
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.5 + Math.random() * 0.5;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2 + 0.4;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
      } else {
        // Move particle inward toward core
        const speed = delta * 1.8;
        pos[i * 3] += (dx / dist) * speed;
        pos[i * 3 + 1] += (dy / dist) * speed;
        pos[i * 3 + 2] += (dz / dist) * speed;
      }
    }

    positionAttr.needsUpdate = true;
  });

  const isStreamActive = active || state === 'RECEIVING' || state === 'ANALYZING' || state === 'RETRIEVING_CONTEXT';

  if (!isStreamActive) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#38BDF8"
        size={0.035}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
