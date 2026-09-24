import React from 'react';

interface UndergroundSoilCutawayProps {
  depth?: number;
  width?: number;
}

export const UndergroundSoilCutaway: React.FC<UndergroundSoilCutawayProps> = ({
  depth = 1.6,
  width = 3.5,
}) => {
  return (
    <group position={[0, -depth / 2, 0]}>
      {/* Front cutaway soil plane */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#382a1d"
          roughness={0.95}
          metalness={0.02}
        />
      </mesh>

      {/* Stratified topsoil layer accent */}
      <mesh position={[0, depth / 2 - 0.15, 0.02]}>
        <planeGeometry args={[width, 0.3]} />
        <meshStandardMaterial
          color="#2b1f14"
          roughness={0.92}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Stratified subsoil clay horizon accent */}
      <mesh position={[0, -depth / 2 + 0.2, 0.02]}>
        <planeGeometry args={[width, 0.4]} />
        <meshStandardMaterial
          color="#423020"
          roughness={0.98}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};
