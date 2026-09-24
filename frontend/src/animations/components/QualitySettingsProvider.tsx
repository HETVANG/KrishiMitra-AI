import React, { createContext, useContext, ReactNode } from 'react';
import type { QualityLevel, QualitySettings } from '../types/animationTypes';
import { useDevicePerformance } from '../core/useDevicePerformance';

interface QualityContextType {
  qualityLevel: QualityLevel;
  settings: QualitySettings;
  overrideQuality: (level: QualityLevel) => void;
}

const QualityContext = createContext<QualityContextType | undefined>(undefined);

export const QualitySettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { qualityLevel, settings, overrideQuality } = useDevicePerformance();

  return (
    <QualityContext.Provider value={{ qualityLevel, settings, overrideQuality }}>
      {children}
    </QualityContext.Provider>
  );
};

export const useQualitySettings = (): QualityContextType => {
  const context = useContext(QualityContext);
  if (!context) {
    // Default fallback if used outside provider
    const { detectDeviceQuality, getQualitySettings } = require('../utils/devicePerformance');
    const level = detectDeviceQuality();
    return {
      qualityLevel: level,
      settings: getQualitySettings(level),
      overrideQuality: () => {},
    };
  }
  return context;
};
