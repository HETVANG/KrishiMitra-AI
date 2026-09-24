import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SoilMoistureVisualLevel } from './irrigationResolver';

interface SoilCrossSectionMeshProps {
  soilMoistureLevel?: SoilMoistureVisualLevel;
  cropType?: string;
  soilType?: string;
  selectedHorizon?: 'all' | 'surface' | 'root_zone' | 'deeper_soil';
}

export const SoilCrossSectionMesh: React.FC<SoilCrossSectionMeshProps> = ({
  soilMoistureLevel = 'UNKNOWN',
  cropType = 'wheat',
  soilType = 'loam',
  selectedHorizon = 'all',
}) => {
  // Compute realistic soil layer colors and materials based on moisture status
  const materialProps = useMemo(() => {
    switch (soilMoistureLevel) {
      case 'LOW':
        return {
          topsoilColor: '#8C6F56', // dry light earthy loam
          rootZoneColor: '#7A5E46',
          subsoilColor: '#6B5038',
          roughness: 0.95,
          metalness: 0.01,
          wetnessShininess: 0.0,
        };
      case 'MODERATE':
        return {
          topsoilColor: '#523A26', // rich moist soil
          rootZoneColor: '#422D1C',
          subsoilColor: '#362315',
          roughness: 0.85,
          metalness: 0.03,
          wetnessShininess: 0.1,
        };
      case 'HIGH':
      case 'EXCESS':
        return {
          topsoilColor: '#2B1B10', // dark saturated soil
          rootZoneColor: '#211309',
          subsoilColor: '#170C05',
          roughness: 0.65,
          metalness: 0.12,
          wetnessShininess: 0.4,
        };
      case 'UNKNOWN':
      default:
        return {
          topsoilColor: '#684E37', // neutral earthy soil
          rootZoneColor: '#573E28',
          subsoilColor: '#4A331E',
          roughness: 0.9,
          metalness: 0.02,
          wetnessShininess: 0.05,
        };
    }
  }, [soilMoistureLevel]);

  // Generate procedural crop roots
  const rootsData = useMemo(() => {
    const list = [];
    const isDeepRoot = cropType === 'potato' || cropType === 'cotton' || cropType === 'sugarcane';
    const count = isDeepRoot ? 10 : 7;
    const depth = isDeepRoot ? 0.7 : 0.45;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.1 + (i % 3) * 0.06;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -0.15 - (i * (depth / count));
      const scaleX = 0.012 - (i * 0.0008);
      const length = 0.2 + (i % 2) * 0.08;

      list.push({ x, y, z, scaleX, length, angle });
    }
    return { list, mainDepth: depth };
  }, [cropType]);

  const showTopsoil = selectedHorizon === 'all' || selectedHorizon === 'surface';
  const showRootZone = selectedHorizon === 'all' || selectedHorizon === 'root_zone';
  const showSubsoil = selectedHorizon === 'all' || selectedHorizon === 'deeper_soil';

  return (
    <group position={[0, -0.2, 0]}>
      {/* Surface Crust */}
      {showTopsoil && (
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[3.2, 0.05, 2.2]} />
          <meshStandardMaterial
            color={materialProps.topsoilColor}
            roughness={materialProps.roughness}
            metalness={materialProps.metalness}
          />
        </mesh>
      )}

      {/* Topsoil Horizon (0m to -0.35m) */}
      {showTopsoil && (
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[3.18, 0.35, 2.18]} />
          <meshStandardMaterial
            color={materialProps.topsoilColor}
            roughness={materialProps.roughness}
            metalness={materialProps.metalness}
          />
        </mesh>
      )}

      {/* Root Zone Horizon (-0.35m to -0.9m) */}
      {showRootZone && (
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[3.18, 0.5, 2.18]} />
          <meshStandardMaterial
            color={materialProps.rootZoneColor}
            roughness={materialProps.roughness}
            metalness={materialProps.metalness}
          />
        </mesh>
      )}

      {/* Deeper Subsoil Horizon (-0.9m to -1.5m) */}
      {showSubsoil && (
        <mesh position={[0, -0.72, 0]}>
          <boxGeometry args={[3.18, 0.5, 2.18]} />
          <meshStandardMaterial
            color={materialProps.subsoilColor}
            roughness={materialProps.roughness}
            metalness={materialProps.metalness}
          />
        </mesh>
      )}

      {/* Procedural Crop Root System in Root Zone */}
      {showRootZone && (
        <group position={[0, 0.38, 0]}>
          {/* Primary Taproot */}
          <mesh position={[0, -rootsData.mainDepth / 2, 0]}>
            <cylinderGeometry args={[0.02, 0.005, rootsData.mainDepth, 8]} />
            <meshStandardMaterial color="#D4C5B3" roughness={0.8} />
          </mesh>

          {/* Lateral Branching Roots */}
          {rootsData.list.map((r, idx) => (
            <mesh
              key={`root-branch-${idx}`}
              position={[r.x / 2, r.y, r.z / 2]}
              rotation={[0, r.angle, Math.PI / 4]}
            >
              <cylinderGeometry args={[r.scaleX, 0.003, r.length, 6]} />
              <meshStandardMaterial color="#C2B29E" roughness={0.85} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
