import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AICoreVisualState } from './aiCoreState';

interface AICoreMeshProps {
  state?: AICoreVisualState;
  scale?: number;
}

export const AICoreMesh: React.FC<AICoreMeshProps> = ({
  state = 'IDLE',
  scale = 1.0,
}) => {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Group>(null);

  // Compute color & pulse speed based on visual state
  const stateConfig = useMemo(() => {
    switch (state) {
      case 'LISTENING':
        return { color: '#06B6D4', pulseSpeed: 4.0, rotSpeed: 2.0, size: 0.45 };
      case 'RECEIVING':
      case 'ANALYZING':
      case 'REASONING':
      case 'RETRIEVING_CONTEXT':
        return { color: '#0284C7', pulseSpeed: 5.5, rotSpeed: 3.5, size: 0.48 };
      case 'GENERATING':
      case 'RESPONDING':
      case 'SUCCESS':
        return { color: '#10B981', pulseSpeed: 2.5, rotSpeed: 1.5, size: 0.44 };
      case 'UNCERTAIN':
        return { color: '#F59E0B', pulseSpeed: 1.8, rotSpeed: 0.8, size: 0.42 };
      case 'ERROR':
        return { color: '#E11D48', pulseSpeed: 1.0, rotSpeed: 0.5, size: 0.40 };
      case 'IDLE':
      default:
        return { color: '#059669', pulseSpeed: 1.2, rotSpeed: 0.8, size: 0.42 };
    }
  }, [state]);

  useFrame((_, delta) => {
    const time = Date.now() * 0.001;

    // Pulse inner core
    if (innerRef.current) {
      const pulse = 1 + Math.sin(time * stateConfig.pulseSpeed) * 0.06;
      innerRef.current.scale.set(pulse * scale, pulse * scale, pulse * scale);
    }

    // Rotate outer orbital ring
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y += delta * stateConfig.rotSpeed * 0.4;
      outerRingRef.current.rotation.x += delta * stateConfig.rotSpeed * 0.2;
    }
  });

  return (
    <group position={[0, 0.4, 0]}>
      {/* Inner Luminescent Core */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[stateConfig.size, 2]} />
        <meshStandardMaterial
          color={stateConfig.color}
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
        />
      </mesh>

      {/* Outer Orbital Rings representing agronomic knowledge horizons */}
      <group ref={outerRingRef}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.65 * scale, 0.012, 16, 64]} />
          <meshStandardMaterial
            color={stateConfig.color}
            roughness={0.3}
            metalness={0.9}
            transparent
            opacity={0.7}
          />
        </mesh>

        <mesh rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
          <torusGeometry args={[0.78 * scale, 0.008, 16, 64]} />
          <meshStandardMaterial
            color={stateConfig.color}
            roughness={0.4}
            metalness={0.7}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
    </group>
  );
};
