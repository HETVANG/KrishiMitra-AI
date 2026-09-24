import React, { useRef, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDevicePerformance } from '../core/useDevicePerformance';
import { useAnimationVisibility } from '../core/useAnimationVisibility';
import { useReducedMotion } from '../core/useReducedMotion';
import { AnimationErrorBoundary } from '../core/AnimationErrorBoundary';

interface AnimationCanvasProps {
  children: ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
  shadows?: boolean;
  style?: React.CSSProperties;
  fallback?: ReactNode;
}

export const AnimationCanvas: React.FC<AnimationCanvasProps> = ({
  children,
  className = 'w-full h-full pointer-events-none',
  cameraPosition = [0, 2, 8],
  fov = 45,
  shadows,
  style,
  fallback,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useDevicePerformance();
  const isVisible = useAnimationVisibility(containerRef);
  const reducedMotion = useReducedMotion();

  const activeShadows = shadows !== undefined ? shadows : settings.shadows;

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`} style={style}>
      <AnimationErrorBoundary fallback={fallback}>
        {isVisible && (
          <Canvas
            shadows={activeShadows}
            dpr={settings.maxPixelRatio}
            camera={{ position: cameraPosition, fov }}
            gl={{
              antialias: settings.level !== 'LOW',
              powerPreference: 'high-performance',
              alpha: true,
              preserveDrawingBuffer: false,
            }}
            frameloop={isVisible && !reducedMotion ? 'always' : 'demand'}
            className="w-full h-full"
          >
            {children}
          </Canvas>
        )}
      </AnimationErrorBoundary>
    </div>
  );
};
