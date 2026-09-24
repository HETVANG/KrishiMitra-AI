import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQualitySettings } from '../components/QualitySettingsProvider';

interface DustParticlesProps {
  count?: number;
  color?: string;
  size?: number;
}

export const DustParticles: React.FC<DustParticlesProps> = ({
  count: preferredCount,
  color = '#fffbe6',
  size = 0.05,
}) => {
  const { settings } = useQualitySettings();
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  const activeCount = Math.min(
    preferredCount || settings.particleCap,
    settings.particleCap
  );

  const particlesData = useMemo(() => {
    const data = [];
    for (let i = 0; i < activeCount; i++) {
      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          Math.random() * 8 + 0.5,
          (Math.random() - 0.5) * 16
        ),
        speed: Math.random() * 0.2 + 0.05,
        phase: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.5 + 0.5,
      });
    }
    return data;
  }, [activeCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!instancedMeshRef.current || activeCount === 0) return;

    const time = state.clock.getElapsedTime();

    particlesData.forEach((p, i) => {
      dummy.position.copy(p.position);
      // Gentle floating sway
      dummy.position.y += Math.sin(time * p.speed + p.phase) * 0.002;
      dummy.position.x += Math.cos(time * p.speed * 0.5 + p.phase) * 0.001;
      
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();

      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (activeCount === 0) return null;

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[undefined, undefined, activeCount]}
    >
      <sphereGeometry args={[size, 6, 6]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </instancedMesh>
  );
};
