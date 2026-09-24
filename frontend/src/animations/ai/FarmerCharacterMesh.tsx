import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FarmerCharacterMeshProps {
  scale?: number;
  isInteracting?: boolean;
}

export const FarmerCharacterMesh: React.FC<FarmerCharacterMeshProps> = ({
  scale = 1.0,
  isInteracting = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const time = Date.now() * 0.001;

    // Subtle natural breathing / idle movement
    if (groupRef.current) {
      groupRef.current.position.y = -0.3 + Math.sin(time * 1.5) * 0.015;
    }

    // Subtle arm movement when interacting
    if (armRef.current) {
      armRef.current.rotation.z = isInteracting
        ? -0.4 + Math.sin(time * 3) * 0.08
        : -0.2;
    }
  });

  return (
    <group ref={groupRef} position={[-1.1, -0.3, 0.2]} rotation={[0, Math.PI / 6, 0]} scale={scale}>
      {/* Head & Farmer Sun Hat */}
      <group position={[0, 0.95, 0]}>
        {/* Head */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#C59B76" roughness={0.7} />
        </mesh>

        {/* Traditional Agricultural Sun Hat Brim */}
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.22, 24]} />
          <meshStandardMaterial color="#D4A373" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.08, 16]} />
          <meshStandardMaterial color="#C28E5C" roughness={0.9} />
        </mesh>
      </group>

      {/* Torso (Clean Agronomic Linen Shirt) */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.45, 12]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.8} />
      </mesh>

      {/* Trousers / Lower Body */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.12, 0.11, 0.45, 12]} />
        <meshStandardMaterial color="#4A5568" roughness={0.85} />
      </mesh>

      {/* Right Arm facing AI Core */}
      <mesh ref={armRef} position={[0.14, 0.68, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.035, 0.03, 0.35, 8]} position={[0, -0.15, 0]} />
        <meshStandardMaterial color="#DDBEA9" roughness={0.8} />
      </mesh>
    </group>
  );
};
