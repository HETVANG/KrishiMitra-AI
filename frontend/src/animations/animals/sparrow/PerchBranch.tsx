import React from 'react';

interface PerchBranchProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const PerchBranch: React.FC<PerchBranchProps> = ({
  position = [1.2, 0.4, 0],
  rotation = [0.1, -0.4, -0.15],
  scale = 1.0,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main branch shaft */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.07, 3.5, 12]} />
        <meshStandardMaterial
          color="#4a3525" // Organic dark oak bark
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Sub-branch twig 1 */}
      <mesh position={[-0.6, 0.1, 0.15]} rotation={[0.4, 0.3, Math.PI / 3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.035, 1.2, 8]} />
        <meshStandardMaterial color="#3d2a1c" roughness={0.95} />
      </mesh>

      {/* Sub-branch twig 2 */}
      <mesh position={[0.8, -0.12, -0.1]} rotation={[-0.3, -0.2, Math.PI / 1.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.015, 0.03, 1.0, 8]} />
        <meshStandardMaterial color="#3d2a1c" roughness={0.95} />
      </mesh>

      {/* Small leaf clusters */}
      <group position={[-0.9, 0.3, 0.3]} scale={0.8}>
        <mesh position={[0, 0, 0]} rotation={[0.2, 0.5, 0.1]}>
          <coneGeometry args={[0.06, 0.22, 5]} />
          <meshStandardMaterial color="#4a7c36" roughness={0.5} />
        </mesh>
        <mesh position={[0.08, 0.05, -0.05]} rotation={[-0.3, 0.1, 0.4]}>
          <coneGeometry args={[0.05, 0.18, 5]} />
          <meshStandardMaterial color="#3d6b2c" roughness={0.5} />
        </mesh>
      </group>

      <group position={[1.1, -0.25, -0.2]} scale={0.7}>
        <mesh position={[0, 0, 0]} rotation={[-0.1, 0.3, -0.2]}>
          <coneGeometry args={[0.05, 0.2, 5]} />
          <meshStandardMaterial color="#558b3e" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};
