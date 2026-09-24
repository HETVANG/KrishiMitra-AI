import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQualitySettings } from '../components/QualitySettingsProvider';

interface RainSystemProps {
  intensity?: number; // 0.0 to 1.0
  windSpeed?: number; // 0.0 to 1.0
}

export const RainSystem: React.FC<RainSystemProps> = ({
  intensity = 0.5,
  windSpeed = 0.2,
}) => {
  const { settings } = useQualitySettings();
  const instancedRef = useRef<THREE.InstancedMesh>(null);

  const activeCount = useMemo(() => {
    if (intensity <= 0.05) return 0;
    const maxForTier = settings.level === 'HIGH' ? 350 : settings.level === 'MEDIUM' ? 150 : 40;
    return Math.floor(maxForTier * intensity);
  }, [intensity, settings.level]);

  const rainData = useMemo(() => {
    const list = [];
    const areaX = 22;
    const areaY = 12;
    const areaZ = 22;

    for (let i = 0; i < activeCount; i++) {
      list.push({
        x: (Math.random() - 0.5) * areaX,
        y: Math.random() * areaY,
        z: (Math.random() - 0.5) * areaZ,
        vy: -(Math.random() * 12 + 16),
        length: Math.random() * 0.35 + 0.25,
      });
    }
    return list;
  }, [activeCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!instancedRef.current || activeCount === 0) return;

    const clampedDelta = Math.min(delta, 0.1);
    const windAngle = windSpeed * 0.45; // Slant rain with wind

    rainData.forEach((r, i) => {
      r.y += r.vy * clampedDelta;
      r.x += windAngle * r.vy * clampedDelta * 0.2;

      // Wrap boundary
      if (r.y < -0.5) {
        r.y = 12;
        r.x = (Math.random() - 0.5) * 22;
      }

      dummy.position.set(r.x, r.y, r.z);
      dummy.rotation.set(0, 0, -windAngle);
      dummy.scale.set(0.015, r.length * 3.5, 0.015);
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
        color="#b0d4f1"
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </instancedMesh>
  );
};
