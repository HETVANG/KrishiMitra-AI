import type { WindVector } from '../types/animationTypes';
import { organicSway } from './naturalMovement';

export class WindController {
  private baseWind: WindVector = {
    speed: 1.5,
    direction: [1, 0, 0.5],
    gustiness: 0.8,
    frequency: 0.5,
  };

  setBaseWind(wind: Partial<WindVector>): void {
    this.baseWind = { ...this.baseWind, ...wind };
  }

  /**
   * Calculates current wind displacement for an object based on position and time
   * @param time elapsed time in seconds
   * @param x position x
   * @param z position z
   * @param stiffness 1.0 for grass (very flexible), 0.5 for crops, 0.1 for tree branches
   */
  getWindDisplacement(
    time: number,
    x: number,
    z: number,
    stiffness: number = 1.0
  ): [number, number, number] {
    const spatialPhase = x * 0.4 + z * 0.6;
    const sway = organicSway(
      time,
      this.baseWind.frequency,
      this.baseWind.speed * 0.1,
      spatialPhase
    );

    const gust = organicSway(
      time * 0.3,
      0.2,
      this.baseWind.gustiness * 0.15,
      spatialPhase * 0.5
    );

    const totalStrength = (sway + Math.max(0, gust)) * stiffness;

    return [
      this.baseWind.direction[0] * totalStrength,
      this.baseWind.direction[1] * totalStrength + Math.abs(totalStrength) * 0.1,
      this.baseWind.direction[2] * totalStrength,
    ];
  }
}

export const globalWind = new WindController();
