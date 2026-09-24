import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Sparrow3DMeshProps {
  wingFlapAngle?: number;
  wingSpreadAngle?: number;
  headRotation?: [number, number, number];
  scale?: number;
  castShadow?: boolean;
}

export const Sparrow3DMesh: React.FC<Sparrow3DMeshProps> = ({
  wingFlapAngle = 0,
  wingSpreadAngle = 0.5,
  headRotation = [0, 0, 0],
  scale = 0.7,
  castShadow = true,
}) => {
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const tailGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (leftWingRef.current && rightWingRef.current) {
      // Articulate left wing (Z-axis flap, Y-axis fold/spread)
      leftWingRef.current.rotation.z = wingFlapAngle;
      leftWingRef.current.rotation.y = -wingSpreadAngle * 0.4;

      // Articulate right wing (opposite Z-axis flap)
      rightWingRef.current.rotation.z = -wingFlapAngle;
      rightWingRef.current.rotation.y = wingSpreadAngle * 0.4;
    }

    if (headGroupRef.current) {
      headGroupRef.current.rotation.set(
        headRotation[0],
        headRotation[1],
        headRotation[2]
      );
    }
  });

  return (
    <group scale={scale}>
      {/* Torso / Body - Aerodynamic bird teardrop */}
      <mesh position={[0, 0, 0]} rotation={[0.2, 0, 0]} castShadow={castShadow}>
        <sphereGeometry args={[0.26, 16, 14]} />
        <meshStandardMaterial color="#d9cbb7" roughness={0.7} /> {/* Cream underbelly */}
      </mesh>

      {/* Mantle / Back Feathers */}
      <mesh position={[0, 0.04, -0.02]} rotation={[-0.15, 0, 0]} castShadow={castShadow}>
        <sphereGeometry args={[0.24, 14, 12]} />
        <meshStandardMaterial color="#785338" roughness={0.75} /> {/* Warm brown streaked back */}
      </mesh>

      {/* Head Group */}
      <group ref={headGroupRef} position={[0, 0.22, 0.16]}>
        {/* Skull */}
        <mesh castShadow={castShadow}>
          <sphereGeometry args={[0.16, 14, 12]} />
          <meshStandardMaterial color="#6b635a" roughness={0.7} /> {/* Grey-brown crown */}
        </mesh>

        {/* Throat bib */}
        <mesh position={[0, -0.06, 0.08]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.08, 0.12, 8]} />
          <meshStandardMaterial color="#2b211a" roughness={0.8} /> {/* Dark throat bib */}
        </mesh>

        {/* Beak - Conical granivore beak */}
        <mesh position={[0, -0.01, 0.19]} rotation={[Math.PI / 2, 0, 0]} castShadow={castShadow}>
          <coneGeometry args={[0.045, 0.13, 8]} />
          <meshStandardMaterial color="#bc9657" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Left Eye */}
        <mesh position={[0.11, 0.03, 0.09]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#111111" roughness={0.1} />
        </mesh>

        {/* Right Eye */}
        <mesh position={[-0.11, 0.03, 0.09]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#111111" roughness={0.1} />
        </mesh>
      </group>

      {/* Left Wing Group (Pivot at shoulder) */}
      <group ref={leftWingRef} position={[0.22, 0.08, 0.04]}>
        {/* Main Wing Body */}
        <mesh position={[0.25, 0, -0.08]} rotation={[0, 0.3, -0.2]} castShadow={castShadow}>
          <boxGeometry args={[0.45, 0.03, 0.22]} />
          <meshStandardMaterial color="#5e412a" roughness={0.7} />
        </mesh>
        {/* Primary Feathers Tip */}
        <mesh position={[0.48, -0.02, -0.16]} rotation={[-0.1, 0.4, -0.4]} castShadow={castShadow}>
          <coneGeometry args={[0.1, 0.38, 4]} />
          <meshStandardMaterial color="#3d2a1c" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Wing Group (Pivot at shoulder) */}
      <group ref={rightWingRef} position={[-0.22, 0.08, 0.04]}>
        {/* Main Wing Body */}
        <mesh position={[-0.25, 0, -0.08]} rotation={[0, -0.3, 0.2]} castShadow={castShadow}>
          <boxGeometry args={[0.45, 0.03, 0.22]} />
          <meshStandardMaterial color="#5e412a" roughness={0.7} />
        </mesh>
        {/* Primary Feathers Tip */}
        <mesh position={[-0.48, -0.02, -0.16]} rotation={[-0.1, -0.4, 0.4]} castShadow={castShadow}>
          <coneGeometry args={[0.1, 0.38, 4]} />
          <meshStandardMaterial color="#3d2a1c" roughness={0.8} />
        </mesh>
      </group>

      {/* Tail Feather Fan */}
      <group ref={tailGroupRef} position={[0, -0.08, -0.3]} rotation={[-0.3, 0, 0]}>
        <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow={castShadow}>
          <planeGeometry args={[0.18, 0.42]} />
          <meshStandardMaterial color="#402e20" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Feet / Legs */}
      <group position={[0.07, -0.24, -0.02]}>
        <mesh rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.14]} />
          <meshStandardMaterial color="#8c7058" />
        </mesh>
      </group>
      <group position={[-0.07, -0.24, -0.02]}>
        <mesh rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.14]} />
          <meshStandardMaterial color="#8c7058" />
        </mesh>
      </group>
    </group>
  );
};
