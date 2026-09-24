import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CropType, GrowthStage } from '../types/animationTypes';
import { useQualitySettings } from '../components/QualitySettingsProvider';
import { organicSway } from '../utils/naturalMovement';

interface InstancedCropsProps {
  cropType?: CropType;
  growthStage?: GrowthStage;
  count?: number;
  fieldBounds?: [number, number];
}

export const InstancedCrops: React.FC<InstancedCropsProps> = ({
  cropType = 'neutral',
  growthStage = 'mature',
  count: requestedCount,
  fieldBounds = [16, 12],
}) => {
  const { settings } = useQualitySettings();
  const instancedRef = useRef<THREE.InstancedMesh>(null);

  // Quality-aware instance capping
  const instanceCount = useMemo(() => {
    const base = requestedCount || (settings.level === 'HIGH' ? 320 : settings.level === 'MEDIUM' ? 140 : 50);
    return Math.min(base, 400);
  }, [requestedCount, settings.level]);

  // Crop colors based on type and stage
  const cropColor = useMemo(() => {
    if (growthStage === 'harvest') return '#d4b14d'; // Golden harvest
    if (growthStage === 'sprout' || growthStage === 'young') return '#76b843'; // Fresh shoot green

    switch (cropType) {
      case 'wheat':
        return '#c8b258'; // Golden wheat
      case 'rice':
        return '#58a038'; // Emerald rice
      case 'potato':
        return '#3f782c'; // Rich dark potato leaves
      case 'cotton':
        return '#4d8836'; // Cotton foliage green
      case 'maize':
        return '#629e34'; // Bright corn foliage
      case 'neutral':
      default:
        return '#4f8534'; // Natural crop green
    }
  }, [cropType, growthStage]);

  // Generate plant instance positions and phase offsets
  const plantsData = useMemo(() => {
    const list = [];
    const rows = Math.floor(Math.sqrt(instanceCount));
    const cols = Math.ceil(instanceCount / rows);

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (idx >= instanceCount) break;
        const x = (c / cols - 0.5) * fieldBounds[0] + (Math.random() - 0.5) * 0.3;
        const z = (r / rows - 0.5) * fieldBounds[1] + (Math.random() - 0.5) * 0.3;
        const scaleY = 0.8 + Math.random() * 0.4;
        const phase = x * 0.5 + z * 0.8 + Math.random() * 2.0;

        list.push({ x, z, scaleY, phase });
        idx++;
      }
    }
    return list;
  }, [instanceCount, fieldBounds]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!instancedRef.current || instanceCount === 0) return;

    const time = state.clock.getElapsedTime();

    plantsData.forEach((p, i) => {
      const windSwayX = organicSway(time, 1.2, 0.08, p.phase);
      const windSwayZ = organicSway(time, 0.9, 0.05, p.phase * 1.3);

      dummy.position.set(p.x, 0, p.z);
      dummy.rotation.set(windSwayZ, 0, windSwayX);
      dummy.scale.set(0.8, p.scaleY, 0.8);
      dummy.updateMatrix();

      instancedRef.current!.setMatrixAt(i, dummy.matrix);
    });

    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  if (instanceCount === 0) return null;

  return (
    <instancedMesh
      ref={instancedRef}
      args={[undefined, undefined, instanceCount]}
      castShadow={settings.shadows}
      receiveShadow={settings.shadows}
    >
      <coneGeometry args={[0.18, 0.9, 5]} />
      <meshStandardMaterial color={cropColor} roughness={0.7} />
    </instancedMesh>
  );
};
