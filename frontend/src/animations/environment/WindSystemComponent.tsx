import React from 'react';
import { useFrame } from '@react-three/fiber';
import { globalWind } from '../utils/windSystem';
import type { WindVector } from '../types/animationTypes';

interface WindSystemComponentProps {
  wind?: Partial<WindVector>;
}

export const WindSystemComponent: React.FC<WindSystemComponentProps> = ({ wind }) => {
  if (wind) {
    globalWind.setBaseWind(wind);
  }

  useFrame((state) => {
    // Keeps wind clock ticking smoothly
    const t = state.clock.getElapsedTime();
    // Wind parameters can evolve dynamically over time
  });

  return null;
};
