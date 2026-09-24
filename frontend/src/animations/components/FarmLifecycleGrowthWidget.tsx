import React, { useState } from 'react';
import { CropGrowthScene } from '../scenes/CropGrowthScene';
import type { CropType, GrowthStageDetailed, CameraViewMode } from '../types/animationTypes';
import { Sprout, Layers, Play, Pause, RotateCcw } from 'lucide-react';

interface FarmLifecycleGrowthWidgetProps {
  farmerCrop?: string;
  verifiedStage?: string;
  className?: string;
}

export const FarmLifecycleGrowthWidget: React.FC<FarmLifecycleGrowthWidgetProps> = ({
  farmerCrop,
  verifiedStage,
  className = 'w-full rounded-3xl overflow-hidden border border-emerald-900/10 dark:border-dark-800/30 bg-gradient-to-b from-emerald-900/5 to-transparent relative shadow-sm my-4 p-4',
}) => {
  const cropType: CropType = mapCropType(farmerCrop);
  const isPotato = cropType === 'potato';

  const [progress, setProgress] = useState<number>(0.7);
  const [viewMode, setViewMode] = useState<CameraViewMode>('ABOVE_GROUND');
  const [stageLabel, setStageLabel] = useState<GrowthStageDetailed>(() => {
    return verifiedStage ? (verifiedStage as GrowthStageDetailed) : 'VEGETATIVE_GROWTH';
  });

  const stages: { label: string; value: GrowthStageDetailed; prog: number }[] = [
    { label: 'Seed', value: 'SEED', prog: 0.05 },
    { label: 'Germination', value: 'GERMINATION', prog: 0.2 },
    { label: 'Sprout', value: 'SPROUT', prog: 0.35 },
    { label: 'Young Plant', value: 'YOUNG_PLANT', prog: 0.55 },
    { label: 'Vegetative', value: 'VEGETATIVE_GROWTH', prog: 0.75 },
    { label: 'Mature', value: 'MATURE', prog: 0.95 },
  ];

  const handleStageSelect = (s: { label: string; value: GrowthStageDetailed; prog: number }) => {
    setStageLabel(s.value);
    setProgress(s.prog);
  };

  return (
    <div className={className}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Sprout size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-800 dark:text-dark-100 tracking-tight">
              3D Crop Growth & Biological Lifecycle
            </h3>
            <p className="text-xs text-gray-500 dark:text-dark-400 font-medium">
              {farmerCrop ? `Verified Farm Crop: ${farmerCrop}` : 'Interactive Visual Growth Demonstration'}
            </p>
          </div>
        </div>

        {/* View Toggle Buttons */}
        {isPotato && (
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-dark-800/60 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('ABOVE_GROUND')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'ABOVE_GROUND'
                  ? 'bg-white dark:bg-dark-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-gray-600 dark:text-dark-400 hover:text-gray-900'
              }`}
            >
              Above Ground
            </button>
            <button
              onClick={() => setViewMode('UNDERGROUND')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'UNDERGROUND'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-dark-400 hover:text-gray-900'
              }`}
            >
              <Layers size={14} /> Underground Potato Cutaway
            </button>
          </div>
        )}
      </div>

      {/* 3D Scene Viewport */}
      <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden relative border border-emerald-900/10 dark:border-dark-800/20 shadow-inner">
        <CropGrowthScene
          cropType={cropType}
          progress={progress}
          viewMode={viewMode}
          includeSparrow={viewMode === 'ABOVE_GROUND'}
          className="w-full h-full pointer-events-none"
        />
      </div>

      {/* Interactive Timeline Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-gray-50 dark:bg-dark-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-dark-800/30">
        <span className="text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider">
          Growth Stage:
        </span>
        <div className="flex flex-wrap gap-1">
          {stages.map((st) => (
            <button
              key={st.value}
              onClick={() => handleStageSelect(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                stageLabel === st.value
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:bg-emerald-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

function mapCropType(farmerCrop?: string): CropType {
  if (!farmerCrop) return 'potato'; // Default demo crop
  const lower = farmerCrop.toLowerCase();
  if (lower.includes('potato') || lower.includes('aloo')) return 'potato';
  if (lower.includes('wheat') || lower.includes('gehun')) return 'wheat';
  if (lower.includes('rice') || lower.includes('paddy') || lower.includes('dhan')) return 'rice';
  if (lower.includes('maize') || lower.includes('corn') || lower.includes('makka')) return 'maize';
  if (lower.includes('cotton') || lower.includes('kapas')) return 'cotton';
  return 'neutral';
}
