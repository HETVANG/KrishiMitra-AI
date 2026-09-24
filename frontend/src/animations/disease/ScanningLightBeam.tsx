import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ScanningLightBeamProps {
  active?: boolean;
}

export const ScanningLightBeam: React.FC<ScanningLightBeamProps> = ({ active = false }) => {
  const beamGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!beamGroupRef.current || !active) return;

    const time = state.clock.getElapsedTime();
    // Gentle natural light sweep pass over leaf surface
    const sweepY = Math.sin(time * 2.5) * 0.9;
    beamGroupRef.current.position.y = sweepY;
  });

  if (!active) return null;

  return (
    <group ref={beamGroupRef} position={[0, 0, 0.1]}>
      {/* Light sweep beam bar */}
      <mesh rotation={[0, 0, 0]}>
        <boxGeometry args={[1.8, 0.04, 0.05]} />
        <meshBasicMaterial color="#a3e635" transparent opacity={0.65} />
      </mesh>
      {/* Soft lighting highlight spotlight */}
      <pointLight color="#bef264" intensity={1.5} distance={1.2} />
    </group>
  );
};
