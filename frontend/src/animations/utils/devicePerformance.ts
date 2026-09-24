import type { QualityLevel, QualitySettings } from '../types/animationTypes';

export function detectDeviceQuality(): QualityLevel {
  if (typeof window === 'undefined') return 'MEDIUM';

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4;

  // Check device memory in GB (if available in modern Chrome/Android)
  const memory = (navigator as any).deviceMemory || 4;

  // Check touch / mobile screen size
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const isLowEndMobile = isMobile && (cores <= 4 || memory < 4);

  if (isLowEndMobile) {
    return 'LOW';
  }

  if (isMobile || cores < 6 || memory < 6) {
    return 'MEDIUM';
  }

  return 'HIGH';
}

export function getQualitySettings(level: QualityLevel): QualitySettings {
  switch (level) {
    case 'HIGH':
      return {
        level: 'HIGH',
        shadows: true,
        maxPixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        particleCap: 250,
        environmentDetail: 'full',
        enablePostProcessing: false, // keep off unless needed for calm agricultural visual
      };
    case 'MEDIUM':
      return {
        level: 'MEDIUM',
        shadows: false,
        maxPixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
        particleCap: 100,
        environmentDetail: 'simplified',
        enablePostProcessing: false,
      };
    case 'LOW':
    default:
      return {
        level: 'LOW',
        shadows: false,
        maxPixelRatio: 1.0,
        particleCap: 30,
        environmentDetail: 'minimal',
        enablePostProcessing: false,
      };
  }
}
