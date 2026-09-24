import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQualitySettings } from '../components/QualitySettingsProvider';
import { organicSway } from '../utils/naturalMovement';

interface InstancedGrassProps {
  count?: number;
  areaSize?: [number, number];
}

export const InstancedGrass: React.FC<InstancedGrassProps> = ({
  count: requestedCount,
  areaSize = [24, 18],
}) => {
  const { settings } = useQualitySettings();
  const instancedRef = useRef<THREE.InstancedMesh>(null);

  const activeCount = useMemo(() => {
    const base = requestedCount || (settings.level === 'HIGH' ? 450 : settings.level === 'MEDIUM' ? 180 : 60);
    return Math.min(base, 500);
  }, [requestedCount, settings.level]);

  const grassData = useMemo(() => {
    const list = [];
    for (let i = 0; i < activeCount; i++) {
      const x = (Math.random() - 0.5) * areaSize[0];
      const z = (Math.random() - 0.5) * areaSize[1];
      const scale = Math.random() * 0.4 + 0.6;
      const rotY = Math.random() * Math.PI * 2;
      const phase = x * 0.7 + z * 0.5;
      list.push({ x, z, scale, rotY, phase });
    }
    return list;
  }, [activeCount, areaSize]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!instancedRef.current || activeCount === 0) return;

    const time = state.clock.getElapsedTime();

    grassData.forEach((g, i) => {
      // Grass moves with small, rapid wind sway
      const swayX = organicSway(time, 2.2, 0.12, g.phase);
      const swayZ = organicSway(time, 1.8, 0.08, g.phase * 0.9);

      dummy.position.set(g.x, 0, g.z);
      dummy.rotation.set(swayZ, g.rotY, swayX);
      dummy.scale.set(0.04, g.scale * 0.4, 0.04);
      dummy.updateMatrix();

      instancedRef.current!.setMatrixAt(i, dummy.matrix);
    });

    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  if (activeCount === 0) return null;

  return (
    <instancedMesh ref={instancedRef} args={[undefined, undefined, activeCount]}>
      <coneGeometry args={[0.5, 1.2, 3]} />
      <meshStandardMaterial color="#5fa038" roughness={0.7} />
    </instancedMesh>
  );
};
