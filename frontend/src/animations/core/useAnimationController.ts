import { useState, useCallback, useRef } from 'react';
import type { AnimationState } from '../types/animationTypes';

export interface AnimationControllerOptions {
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  duration?: number;
  onStart?: () => void;
  onComplete?: () => void;
  onPause?: () => void;
}

export function useAnimationController(options: AnimationControllerOptions = {}) {
  const {
    autoPlay = true,
    loop = true,
    speed: initialSpeed = 1.0,
    duration = 0,
    onStart,
    onComplete,
    onPause,
  } = options;

  const [state, setState] = useState<AnimationState>(autoPlay ? 'PLAYING' : 'IDLE');
  const [speed, setSpeedState] = useState<number>(initialSpeed);
  const [progress, setProgress] = useState<number>(0);

  const startTimeRef = useRef<number | null>(null);

  const play = useCallback(() => {
    setState('PLAYING');
    if (onStart) onStart();
  }, [onStart]);

  const pause = useCallback(() => {
    setState('PAUSED');
    if (onPause) onPause();
  }, [onPause]);

  const resume = useCallback(() => {
    setState('PLAYING');
  }, []);

  const reset = useCallback(() => {
    setState('RESET');
    setProgress(0);
    startTimeRef.current = null;
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(Math.max(0.1, Math.min(5.0, newSpeed)));
  }, []);

  const updateProgress = useCallback(
    (currentProgress: number) => {
      const clamped = Math.max(0, Math.min(1, currentProgress));
      setProgress(clamped);
      if (clamped >= 1 && !loop && state === 'PLAYING') {
        setState('COMPLETED');
        if (onComplete) onComplete();
      }
    },
    [loop, state, onComplete]
  );

  return {
    state,
    speed,
    progress,
    isPlaying: state === 'PLAYING',
    isPaused: state === 'PAUSED',
    isCompleted: state === 'COMPLETED',
    play,
    pause,
    resume,
    reset,
    setSpeed,
    updateProgress,
  };
}
