import React from 'react';
import { WeatherScene } from '../scenes/WeatherScene';
import type { CropType } from '../types/animationTypes';

interface DashboardWeatherVisualWidgetProps {
  weatherData?: any;
  farmerCrop?: string;
  className?: string;
  height?: string;
}

export const DashboardWeatherVisualWidget: React.FC<DashboardWeatherVisualWidgetProps> = ({
  weatherData,
  farmerCrop,
  className = 'w-full rounded-3xl overflow-hidden border border-emerald-900/10 dark:border-dark-800/30 bg-gradient-to-b from-emerald-900/5 to-transparent relative shadow-sm my-4',
  height = 'h-48 sm:h-60',
}) => {
  const current = weatherData?.current || weatherData;
  const conditionStr = current?.condition || current?.description || 'Live Weather Visual';
  const tempStr = typeof current?.temp === 'number' ? `${Math.round(current.temp)}°C` : '';

  const cropType: CropType = mapCropType(farmerCrop);

  return (
    <div className={`${className} ${height}`}>
      {/* Top Banner Tag */}
      <div className="absolute top-3 left-4 z-20 pointer-events-none flex items-center gap-2">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase bg-emerald-100/90 dark:bg-emerald-950/70 px-3 py-1 rounded-full backdrop-blur-sm border border-emerald-500/20 shadow-xs">
          3D Weather Telemetry • {conditionStr} {tempStr ? `(${tempStr})` : ''}
        </span>
      </div>

      <WeatherScene
        weatherData={weatherData}
        cropType={cropType}
        className="w-full h-full pointer-events-none"
      />
    </div>
  );
};

function mapCropType(farmerCrop?: string): CropType {
  if (!farmerCrop) return 'neutral';
  const lower = farmerCrop.toLowerCase();
  if (lower.includes('wheat') || lower.includes('gehun')) return 'wheat';
  if (lower.includes('rice') || lower.includes('paddy') || lower.includes('dhan')) return 'rice';
  if (lower.includes('potato') || lower.includes('aloo')) return 'potato';
  if (lower.includes('cotton') || lower.includes('kapas')) return 'cotton';
  if (lower.includes('maize') || lower.includes('corn') || lower.includes('makka')) return 'maize';
  return 'neutral';
}
