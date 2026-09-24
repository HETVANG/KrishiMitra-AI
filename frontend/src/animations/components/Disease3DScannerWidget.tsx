import React, { useMemo } from 'react';
import { DiseaseScannerScene } from '../scenes/DiseaseScannerScene';
import { resolveDiseaseState, NEUTRAL_DISEASE_VISUAL } from '../disease/diseaseResolver';
import type { NormalizedDiseaseVisual } from '../disease/diseaseResolver';
import { Scan, Activity, CheckCircle2, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

interface Disease3DScannerWidgetProps {
  assessment?: any;
  isScanning?: boolean;
  className?: string;
  showVisualDetails?: boolean;
}

export const Disease3DScannerWidget: React.FC<Disease3DScannerWidgetProps> = ({
  assessment,
  isScanning = false,
  className = '',
  showVisualDetails = true,
}) => {
  const visualResult: NormalizedDiseaseVisual = useMemo(() => {
    if (!assessment) return NEUTRAL_DISEASE_VISUAL;
    return resolveDiseaseState(assessment);
  }, [assessment]);

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl ${className}`}>
      {/* 3D Scene Viewport */}
      <div className="relative w-full h-64 md:h-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <DiseaseScannerScene visualResult={visualResult} isScanning={isScanning} />

        {/* Live scanning overlay text */}
        {isScanning && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center pointer-events-none z-10">
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-full font-bold text-xs animate-pulse">
              <Scan size={16} className="animate-spin" />
              <span>Scanning Leaf Surface & Symptoms...</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              3D AI Spatial Mesh Sweep in Progress
            </p>
          </div>
        )}

        {/* Category Overlay Badge */}
        {!isScanning && visualResult.category !== 'INSUFFICIENT_DATA' && (
          <div className="absolute top-3 left-3 z-10">
            <div className={`px-3 py-1 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 backdrop-blur-md ${
              visualResult.isHealthy
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : visualResult.category === 'PEST'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : visualResult.category === 'NUTRIENT_ISSUE'
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                : 'bg-red-500/20 border-red-500/50 text-red-300'
            }`}>
              {visualResult.isHealthy ? (
                <CheckCircle2 size={13} />
              ) : visualResult.category === 'PEST' ? (
                <AlertTriangle size={13} />
              ) : (
                <Activity size={13} />
              )}
              <span>3D Symptom Analysis: {visualResult.category.replace(/_/g, ' ')}</span>
            </div>
          </div>
        )}

        {/* Watermark / Badge */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <span className="text-[10px] font-bold text-slate-400 bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
            <Sparkles size={11} className="text-emerald-400" /> KrishiMitra 3D Pathology Visualizer
          </span>
        </div>
      </div>

      {/* Visual breakdown details below 3D canvas */}
      {showVisualDetails && !isScanning && visualResult.category !== 'INSUFFICIENT_DATA' && (
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <h4 className="font-extrabold text-xs text-slate-200">
                AI Diagnosis: <span className="text-white">{visualResult.diseaseLabel}</span>
              </h4>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
              {visualResult.confidence}% Verified Confidence
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-semibold">Lesion Density</span>
              <span className="font-extrabold text-slate-200 text-xs mt-0.5 block">
                {(visualResult.spotDensity * 100).toFixed(0)}%
              </span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-semibold">Necrotic Margins</span>
              <span className={`font-extrabold text-xs mt-0.5 block ${visualResult.browningEdges ? 'text-amber-400' : 'text-emerald-400'}`}>
                {visualResult.browningEdges ? 'Detected' : 'None'}
              </span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-semibold">Chlorosis (Yellowing)</span>
              <span className={`font-extrabold text-xs mt-0.5 block ${visualResult.chlorosisYellow ? 'text-amber-400' : 'text-emerald-400'}`}>
                {visualResult.chlorosisYellow ? 'Present' : 'Normal'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
