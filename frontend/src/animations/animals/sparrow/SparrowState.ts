import type { SparrowFlightState, SparrowFlightConfig } from '../../types/animationTypes';

export interface SparrowState {
  flightState: SparrowFlightState;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  flightSpeed: number;
  wingFlapSpeed: number;
  headRotation: [number, number, number];
  targetLandingPos?: [number, number, number];
}

export const initialSparrowState: SparrowState = {
  flightState: 'IDLE',
  position: [0, 2, 0],
  rotation: [0, 0, 0],
  scale: 0.8,
  flightSpeed: 1.0,
  wingFlapSpeed: 12.0,
  headRotation: [0, 0, 0],
  targetLandingPos: [0.5, 1.2, 0],
};
