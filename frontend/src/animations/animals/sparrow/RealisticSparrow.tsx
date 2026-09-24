import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SparrowFlightController } from './SparrowController';
import { Sparrow3DMesh } from './Sparrow3DMesh';
import { PerchBranch } from './PerchBranch';
import { useQualitySettings } from '../../components/QualitySettingsProvider';
import { useReducedMotion } from '../../core/useReducedMotion';

interface RealisticSparrowProps {
  autoStart?: boolean;
  modelPath?: string; // Optional GLTF / GLB model path (e.g. '/models/sparrow.glb')
  showBranch?: boolean;
  scale?: number;
  position?: [number, number, number];
}

export const RealisticSparrow: React.FC<RealisticSparrowProps> = ({
  autoStart = true,
  modelPath = '/models/sparrow.glb',
  showBranch = true,
  scale = 0.7,
  position,
}) => {
  const sparrowGroupRef = useRef<THREE.Group>(null);
  const { settings } = useQualitySettings();
  const isReducedMotion = useReducedMotion();

  const controller = useMemo(() => new SparrowFlightController(), []);

  useEffect(() => {
    if (isReducedMotion) {
      // In reduced motion mode, place bird directly on perch branch in calm idle state
      controller.transitionTo('IDLE');
      if (sparrowGroupRef.current) {
        sparrowGroupRef.current.position.set(0.6, 0.45, 0.0);
        sparrowGroupRef.current.rotation.set(0, 0, 0);
      }
    } else if (autoStart) {
      controller.startFlightSequence();
    }
  }, [autoStart, controller, isReducedMotion]);

  useFrame((state, delta) => {
    if (!sparrowGroupRef.current) return;

    const time = state.clock.getElapsedTime();
    const updatedState = controller.update(delta, time);

    if (updatedState.flightState !== 'OFFSCREEN' && updatedState.flightState !== 'DISABLED') {
      sparrowGroupRef.current.position.set(
        updatedState.position[0],
        updatedState.position[1],
        updatedState.position[2]
      );

      sparrowGroupRef.current.rotation.set(
        updatedState.rotation[0],
        updatedState.rotation[1],
        updatedState.rotation[2]
      );
    }
  });

  const flapAngle = controller.getWingFlapAngle();
  const spreadAngle = controller.getWingSpreadAngle();
  const currentState = controller.getState();

  const activeShadows = settings.shadows && settings.level === 'HIGH';

  return (
    <group position={position}>
      {showBranch && <PerchBranch position={[1.0, 0.4, 0]} scale={1.0} />}

      <group ref={sparrowGroupRef}>
        <Sparrow3DMesh
          wingFlapAngle={flapAngle}
          wingSpreadAngle={spreadAngle}
          headRotation={currentState.headRotation}
          scale={scale}
          castShadow={activeShadows}
        />
      </group>
    </group>
  );
};
