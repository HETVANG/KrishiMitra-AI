import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQualitySettings } from '../components/QualitySettingsProvider';

export type ParticleType = 'pollen' | 'rain' | 'mist' | 'spores';

interface ParticleEmitterProps {
  type?: ParticleType;
  count?: number;
  areaSize?: [number, number, number];
}

export const ParticleEmitter: React.FC<ParticleEmitterProps> = ({
  type = 'pollen',
  count: requestedCount,
  areaSize = [20, 10, 20],
}) => {
  const { settings } = useQualitySettings();
  const instancedRef = useRef<THREE.InstancedMesh>(null);

  const activeCount = Math.min(
    requestedCount || settings.particleCap,
    settings.particleCap
  );

  const particleData = useMemo(() => {
    const list = [];
    for (let i = 0; i < activeCount; i++) {
      list.push({
        x: (Math.random() - 0.5) * areaSize[0],
        y: Math.random() * areaSize[1],
        z: (Math.random() - 0.5) * areaSize[2],
        vy: type === 'rain' ? -(Math.random() * 8 + 12) : Math.random() * 0.2 + 0.1,
        vx: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        scale: type === 'rain' ? 0.04 : Math.random() * 0.05 + 0.02,
      });
    }
    return list;
  }, [activeCount, type, areaSize]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!instancedRef.current || activeCount === 0) return;

    const clampedDelta = Math.min(delta, 0.1);

    particleData.forEach((p, i) => {
      p.y += p.vy * clampedDelta;
      p.x += p.vx * clampedDelta;
      p.z += p.vz * clampedDelta;

      // Wrap boundaries
      if (type === 'rain' && p.y < 0) {
        p.y = areaSize[1];
        p.x = (Math.random() - 0.5) * areaSize[0];
      } else if (p.y > areaSize[1]) {
        p.y = 0;
      }

      dummy.position.set(p.x, p.y, p.z);
      if (type === 'rain') {
        dummy.scale.set(0.01, p.scale * 4, 0.01);
      } else {
        dummy.scale.setScalar(p.scale);
      }
      dummy.updateMatrix();

      instancedRef.current!.setMatrixAt(i, dummy.matrix);
    });

    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  if (activeCount === 0) return null;

  return (
    <instancedMesh ref={instancedRef} args={[undefined, undefined, activeCount]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={type === 'rain' ? '#a5c9eb' : '#fff9d6'}
        transparent
        opacity={type === 'rain' ? 0.6 : 0.4}
        depthWrite={false}
      />
    </instancedMesh>
  );
};
