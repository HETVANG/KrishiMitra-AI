import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQualitySettings } from '../components/QualitySettingsProvider';

interface CloudSystemProps {
  coverage?: number; // 0.0 to 1.0
  isDark?: boolean;
  windSpeed?: number;
}

export const CloudSystem: React.FC<CloudSystemProps> = ({
  coverage = 0.3,
  isDark = false,
  windSpeed = 0.2,
}) => {
  const { settings } = useQualitySettings();
  const cloudsGroupRef = useRef<THREE.Group>(null);

  const activeCount = useMemo(() => {
    if (coverage <= 0.05) return 0;
    const base = settings.level === 'HIGH' ? 8 : settings.level === 'MEDIUM' ? 4 : 2;
    return Math.max(1, Math.floor(base * coverage));
  }, [coverage, settings.level]);

  const cloudClusters = useMemo(() => {
    const list = [];
    for (let i = 0; i < activeCount; i++) {
      list.push({
        x: (i / activeCount - 0.5) * 28 + (Math.random() - 0.5) * 4,
        y: 6.5 + (i % 2) * 1.2,
        z: -10 - (i % 3) * 3,
        scale: 1.8 + Math.random() * 1.4,
        speed: 0.15 + Math.random() * 0.1,
      });
    }
    return list;
  }, [activeCount]);

  useFrame((_, delta) => {
    if (!cloudsGroupRef.current || activeCount === 0) return;

    const driftSpeed = (0.2 + windSpeed * 0.8) * delta;

    cloudsGroupRef.current.children.forEach((cloud, idx) => {
      cloud.position.x += driftSpeed * (cloudClusters[idx]?.speed || 0.15);
      if (cloud.position.x > 20) {
        cloud.position.x = -20;
      }
    });
  });

  if (activeCount === 0) return null;

  const cloudColor = isDark ? '#606b75' : '#ffffff';

  return (
    <group ref={cloudsGroupRef}>
      {cloudClusters.map((c, i) => (
        <group key={`cloud-${i}`} position={[c.x, c.y, c.z]} scale={c.scale}>
          <mesh position={[0, 0, 0]}>
            <dodecahedronGeometry args={[1.2, 1]} />
            <meshStandardMaterial color={cloudColor} roughness={0.9} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.8, -0.2, 0.2]}>
            <dodecahedronGeometry args={[0.9, 1]} />
            <meshStandardMaterial color={cloudColor} roughness={0.9} transparent opacity={0.75} />
          </mesh>
          <mesh position={[-0.7, -0.1, -0.2]}>
            <dodecahedronGeometry args={[0.8, 1]} />
            <meshStandardMaterial color={cloudColor} roughness={0.9} transparent opacity={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
