import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useReducedMotion } from '../core/useReducedMotion';

interface LightningEffectProps {
  active?: boolean;
}

export const LightningEffect: React.FC<LightningEffectProps> = ({ active = false }) => {
  const reducedMotion = useReducedMotion();
  const [flashIntensity, setFlashIntensity] = useState<number>(0);
  const nextFlashTimeRef = useRef<number>(5 + Math.random() * 8);

  useFrame((state, delta) => {
    if (!active || reducedMotion) {
      if (flashIntensity > 0) setFlashIntensity(0);
      return;
    }

    const time = state.clock.getElapsedTime();

    if (time > nextFlashTimeRef.current) {
      setFlashIntensity(2.5 + Math.random() * 1.5);
      nextFlashTimeRef.current = time + 8 + Math.random() * 12; // Infrequent flashes
    } else if (flashIntensity > 0) {
      setFlashIntensity((prev) => Math.max(0, prev - delta * 12)); // Fast decay
    }
  });

  if (!active || reducedMotion || flashIntensity <= 0) return null;

  return (
    <directionalLight
      position={[0, 20, 0]}
      intensity={flashIntensity}
      color="#e6f2ff"
    />
  );
};
