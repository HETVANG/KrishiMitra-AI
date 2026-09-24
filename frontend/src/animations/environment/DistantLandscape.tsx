import React from 'react';

export const DistantLandscape: React.FC = () => {
  return (
    <group position={[0, 0, -22]}>
      {/* Background rural hill 1 */}
      <mesh position={[-12, 1.5, -4]}>
        <sphereGeometry args={[14, 16, 8]} />
        <meshStandardMaterial color="#55755b" roughness={0.95} />
      </mesh>

      {/* Background rural hill 2 */}
      <mesh position={[10, 1.2, -6]}>
        <sphereGeometry args={[16, 16, 8]} />
        <meshStandardMaterial color="#49694f" roughness={0.95} />
      </mesh>

      {/* Horizon atmospheric tree silhouette band */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[60, 1.8, 0.5]} />
        <meshStandardMaterial color="#3f5a45" roughness={0.9} />
      </mesh>
    </group>
  );
};
