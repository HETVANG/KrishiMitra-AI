// Utility mathematical functions for smooth, natural movement

export function lerp(start: number, end: number, amt: number): number {
  return (1 - amt) * start + amt * end;
}

export function damp(current: number, target: number, lambda: number, delta: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * delta));
}

export function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Superposition of sine waves for organic idle swaying (leaves, grass, birds)
 */
export function organicSway(
  time: number,
  frequency: number = 1.0,
  amplitude: number = 0.1,
  phaseOffset: number = 0
): number {
  const t = time * frequency + phaseOffset;
  return (
    (Math.sin(t) * 0.6 +
      Math.sin(t * 1.7 + 0.3) * 0.3 +
      Math.sin(t * 0.3 + 1.2) * 0.1) *
    amplitude
  );
}

/**
 * Natural spring physics interpolation for inertia and organic momentum
 */
export interface SpringState {
  value: number;
  velocity: number;
}

export function updateSpring(
  current: SpringState,
  target: number,
  stiffness: number = 120,
  damping: number = 14,
  deltaTime: number = 0.016
): SpringState {
  const force = (target - current.value) * stiffness;
  const dampingForce = -current.velocity * damping;
  const acceleration = force + dampingForce;

  const newVelocity = current.velocity + acceleration * deltaTime;
  const newValue = current.value + newVelocity * deltaTime;

  return {
    value: newValue,
    velocity: newVelocity,
  };
}
