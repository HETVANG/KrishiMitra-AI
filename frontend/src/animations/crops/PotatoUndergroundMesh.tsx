import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PotatoUndergroundMeshProps {
  progress?: number; // 0.0 to 1.0 growth progress
  tuberCount?: number;
  tuberMaxScale?: number;
  rootDepth?: number;
}

export const PotatoUndergroundMesh: React.FC<PotatoUndergroundMeshProps> = ({
  progress = 0.5,
  tuberCount = 6,
  tuberMaxScale = 0.45,
  rootDepth = 0.8,
}) => {
  // Generate deterministic irregular tubers attached to root nodes
  const tubersData = useMemo(() => {
    const list = [];
    for (let i = 0; i < tuberCount; i++) {
      const angle = (i / tuberCount) * Math.PI * 2 + (i % 2) * 0.4;
      const radius = 0.15 + (i % 3) * 0.08;
      const x = Math.cos(angle) * radius;
      const y = -0.25 - (i * 0.07);
      const z = Math.sin(angle) * radius;

      const scaleX = 0.18 + (i % 2) * 0.04;
      const scaleY = 0.14 + (i % 3) * 0.03;
      const scaleZ = 0.16 + (i % 2) * 0.05;
      const rot = [Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.3];

      list.push({ x, y, z, scaleX, scaleY, scaleZ, rot, delay: i * 0.08 });
    }
    return list;
  }, [tuberCount]);

  const currentRootLength = Math.max(0.05, rootDepth * Math.min(1, progress * 1.3));

  return (
    <group position={[0, -0.05, 0]}>
      {/* Taproot */}
      <mesh position={[0, -currentRootLength / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.005, currentRootLength, 8]} />
        <meshStandardMaterial color="#8a735c" roughness={0.9} />
      </mesh>

      {/* Lateral Root Branches */}
      {tubersData.map((t, idx) => {
        const branchLength = Math.hypot(t.x, t.z);
        if (progress < t.delay) return null;

        return (
          <group key={`root-branch-${idx}`} position={[0, t.y, 0]}>
            {/* Root stolon connector to tuber */}
            <mesh
              position={[t.x / 2, 0, t.z / 2]}
              rotation={[0, -Math.atan2(t.z, t.x), 0]}
            >
              <cylinderGeometry args={[0.008, 0.006, branchLength, 6]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#a68e74" roughness={0.85} />
            </mesh>
          </group>
        );
      })}

      {/* Potato Tubers */}
      {tubersData.map((t, idx) => {
        const localProgress = Math.max(0, Math.min(1, (progress - t.delay) / (1.0 - t.delay)));
        if (localProgress <= 0) return null;

        const currentScaleX = t.scaleX * localProgress * (tuberMaxScale / 0.45);
        const currentScaleY = t.scaleY * localProgress * (tuberMaxScale / 0.45);
        const currentScaleZ = t.scaleZ * localProgress * (tuberMaxScale / 0.45);

        return (
          <mesh
            key={`potato-tuber-${idx}`}
            position={[t.x, t.y, t.z]}
            rotation={t.rot as [number, number, number]}
            scale={[currentScaleX, currentScaleY, currentScaleZ]}
            castShadow
          >
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial
              color="#8c6239" // Natural potato skin brown
              roughness={0.88}
              metalness={0.02}
            />
          </mesh>
        );
      })}
    </group>
  );
};
