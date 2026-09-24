import type { SparrowFlightState } from '../../types/animationTypes';
import type { SparrowState } from './SparrowState';
import { damp, organicSway } from '../../utils/naturalMovement';

export interface FlightWaypoint {
  pos: [number, number, number];
  rot: [number, number, number];
  state: SparrowFlightState;
  duration: number;
}

export class SparrowFlightController {
  private currentState: SparrowState;
  private elapsedTime: number = 0;
  private wingFlapPhase: number = 0;

  // Realistic curved flight waypoints starting from upper-right outside screen to perch branch
  private waypoints: FlightWaypoint[] = [
    { pos: [5.5, 3.8, -2.0], rot: [0.1, -0.6, 0], state: 'FLY_IN', duration: 1.5 },
    { pos: [3.2, 2.4, -0.5], rot: [0.15, -0.8, 0.35], state: 'FLY_ACROSS', duration: 1.8 },
    { pos: [1.8, 1.4, 0.4], rot: [0.05, -0.4, -0.2], state: 'TURN', duration: 1.6 },
    { pos: [1.0, 0.85, 0.2], rot: [0.0, -0.25, -0.05], state: 'SLOW_DOWN', duration: 1.4 },
    { pos: [0.65, 0.52, 0.05], rot: [-0.1, -0.15, 0], state: 'APPROACH_BRANCH', duration: 1.2 },
    { pos: [0.6, 0.45, 0.0], rot: [0, 0, 0], state: 'LAND', duration: 0.8 },
  ];

  private currentWaypointIdx: number = 0;
  private wayPointProgress: number = 0;

  constructor(initialState?: Partial<SparrowState>) {
    this.currentState = {
      flightState: 'OFFSCREEN',
      position: [5.5, 3.8, -2.0],
      rotation: [0.1, -0.6, 0],
      scale: 0.7,
      flightSpeed: 2.5,
      wingFlapSpeed: 18.0,
      headRotation: [0, 0, 0],
      targetLandingPos: [0.6, 0.45, 0.0],
      ...initialState,
    };
  }

  getState(): SparrowState {
    return { ...this.currentState };
  }

  getWingFlapAngle(): number {
    return Math.sin(this.wingFlapPhase) * (this.currentState.wingFlapSpeed > 2 ? 0.65 : 0.1);
  }

  getWingSpreadAngle(): number {
    const { flightState } = this.currentState;
    if (flightState === 'APPROACH_BRANCH' || flightState === 'LAND') return 0.9;
    if (flightState === 'IDLE' || flightState === 'HEAD_MOVEMENT') return 0.15;
    return 0.55;
  }

  startFlightSequence(): void {
    this.currentWaypointIdx = 0;
    this.wayPointProgress = 0;
    this.elapsedTime = 0;
    this.transitionTo('FLY_IN');
  }

  transitionTo(newState: SparrowFlightState): void {
    this.currentState.flightState = newState;

    switch (newState) {
      case 'FLY_IN':
      case 'FLY_ACROSS':
        this.currentState.wingFlapSpeed = 18.0;
        this.currentState.flightSpeed = 3.2;
        break;
      case 'TURN':
        this.currentState.wingFlapSpeed = 15.0;
        this.currentState.flightSpeed = 2.4;
        break;
      case 'SLOW_DOWN':
      case 'APPROACH_BRANCH':
        this.currentState.wingFlapSpeed = 9.0;
        this.currentState.flightSpeed = 1.2;
        break;
      case 'LAND':
        this.currentState.wingFlapSpeed = 4.0;
        this.currentState.flightSpeed = 0.4;
        break;
      case 'IDLE':
      case 'HEAD_MOVEMENT':
        this.currentState.wingFlapSpeed = 0.0;
        this.currentState.flightSpeed = 0.0;
        break;
      case 'PREPARING_TAKEOFF':
        this.currentState.wingFlapSpeed = 12.0;
        break;
      case 'FLY_AWAY':
        this.currentState.wingFlapSpeed = 22.0;
        this.currentState.flightSpeed = 4.0;
        break;
    }
  }

  /**
   * Updates flight path position, wing phase, roll banking angle, and perching head twitches
   */
  update(delta: number, time: number): SparrowState {
    this.elapsedTime += delta;
    this.wingFlapPhase += delta * this.currentState.wingFlapSpeed;

    const { flightState, targetLandingPos } = this.currentState;

    if (flightState === 'OFFSCREEN' || flightState === 'DISABLED') {
      return this.getState();
    }

    if (this.currentWaypointIdx < this.waypoints.length) {
      const targetWp = this.waypoints[this.currentWaypointIdx];
      const wpDuration = targetWp.duration;

      this.wayPointProgress += delta / wpDuration;

      if (this.currentState.flightState !== targetWp.state) {
        this.transitionTo(targetWp.state);
      }

      // Interpolate 3D position
      this.currentState.position[0] = damp(this.currentState.position[0], targetWp.pos[0], 5, delta);
      this.currentState.position[1] = damp(this.currentState.position[1], targetWp.pos[1], 5, delta);
      this.currentState.position[2] = damp(this.currentState.position[2], targetWp.pos[2], 5, delta);

      // Interpolate rotation (including banking roll)
      this.currentState.rotation[0] = damp(this.currentState.rotation[0], targetWp.rot[0], 6, delta);
      this.currentState.rotation[1] = damp(this.currentState.rotation[1], targetWp.rot[1], 6, delta);
      this.currentState.rotation[2] = damp(this.currentState.rotation[2], targetWp.rot[2], 6, delta);

      if (this.wayPointProgress >= 1.0) {
        this.currentWaypointIdx++;
        this.wayPointProgress = 0;
        if (this.currentWaypointIdx >= this.waypoints.length) {
          this.transitionTo('IDLE');
        }
      }
    } else if (flightState === 'IDLE' || flightState === 'HEAD_MOVEMENT') {
      // Perched idle state with realistic head twitching and body breathing
      const headTwitchX = organicSway(time, 3.5, 0.18, 0);
      const headTwitchY = organicSway(time, 1.8, 0.45, 0.8);
      this.currentState.headRotation = [headTwitchX, headTwitchY, 0];

      // Subtle breathing motion
      const breathing = Math.sin(time * 3.2) * 0.003;
      if (targetLandingPos) {
        this.currentState.position[1] = targetLandingPos[1] + breathing;
      }
    }

    return this.getState();
  }
}
