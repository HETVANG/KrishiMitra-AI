import { useState, useEffect } from 'react';
import type { QualityLevel, QualitySettings } from '../types/animationTypes';
import { detectDeviceQuality, getQualitySettings } from '../utils/devicePerformance';

export function useDevicePerformance(): {
  qualityLevel: QualityLevel;
  settings: QualitySettings;
  overrideQuality: (level: QualityLevel) => void;
} {
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>(() => detectDeviceQuality());
  const [settings, setSettings] = useState<QualitySettings>(() => getQualitySettings(qualityLevel));

  useEffect(() => {
    const handleResize = () => {
      const newLevel = detectDeviceQuality();
      setQualityLevel(newLevel);
      setSettings(getQualitySettings(newLevel));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const overrideQuality = (level: QualityLevel) => {
    setQualityLevel(level);
    setSettings(getQualitySettings(level));
  };

  return {
    qualityLevel,
    settings,
    overrideQuality,
  };
}
