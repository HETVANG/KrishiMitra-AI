import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { IrrigationVisualMethod } from './irrigationResolver';

interface IrrigationMethodSystemProps {
  method?: IrrigationVisualMethod;
  active?: boolean;
}

export const IrrigationMethodSystem: React.FC<IrrigationMethodSystemProps> = ({
  method = 'none',
  active = false,
}) => {
  const nozzleRef = useRef<THREE.Group>(null);
  const waterSheetRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    // Rotate sprinkler head if sprinkler method active
    if (method === 'sprinkler' && active && nozzleRef.current) {
      nozzleRef.current.rotation.y += delta * 4;
    }

    // Gentle wave/pulse on flood surface water sheet if flood active
    if (method === 'flood' && active && waterSheetRef.current) {
      const mat = waterSheetRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.4 + Math.sin(Date.now() * 0.003) * 0.1;
    }
  });

  if (method === 'none') return null;

  return (
    <group position={[0, 0.42, 0]}>
      {/* DRIP IRRIGATION SYSTEM */}
      {method === 'drip' && (
        <group>
          {/* Black Drip Lateral Pipe */}
          <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 3.0, 12]} />
            <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.8} />
          </mesh>

          {/* Drip Emitters at regular intervals */}
          {[-1.0, -0.5, 0, 0.5, 1.0].map((x, idx) => (
            <group key={`drip-emitter-${idx}`} position={[x, 0.02, 0]}>
              <mesh>
                <boxGeometry args={[0.04, 0.04, 0.04]} />
                <meshStandardMaterial color="#0F172A" />
              </mesh>

              {/* Dripping Water Drops when active */}
              {active && (
                <mesh position={[0, -0.04, 0]}>
                  <sphereGeometry args={[0.015, 8, 8]} />
                  <meshStandardMaterial color="#38BDF8" transparent opacity={0.85} />
                </mesh>
              )}
            </group>
          ))}
        </group>
      )}

      {/* SPRINKLER IRRIGATION SYSTEM */}
      {method === 'sprinkler' && (
        <group position={[0, 0, 0]}>
          {/* Vertical Sprinkler Riser Pipe */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 12]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.9} />
          </mesh>

          {/* Rotating Sprinkler Nozzle Head */}
          <group ref={nozzleRef} position={[0, 0.5, 0]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.025, 0.08, 12]} />
              <meshStandardMaterial color="#0284C7" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Nozzle arm */}
            <mesh position={[0.06, 0.02, 0]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.08, 0.02, 0.02]} />
              <meshStandardMaterial color="#0369A1" />
            </mesh>
          </group>
        </group>
      )}

      {/* FLOOD IRRIGATION SYSTEM */}
      {method === 'flood' && (
        <mesh ref={waterSheetRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.15, 2.15]} />
          <meshStandardMaterial
            color="#0284C7"
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
};
