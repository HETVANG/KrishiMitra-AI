import React, { useState, useMemo } from 'react';
import { SoilIrrigationScene } from '../scenes/SoilIrrigationScene';
import { resolveIrrigationState, NEUTRAL_IRRIGATION_VISUAL } from '../irrigation/irrigationResolver';
import type { NormalizedIrrigationVisual } from '../irrigation/irrigationResolver';
import { Droplets, Layers, Sparkles, AlertCircle, CheckCircle2, Play, Square, Info } from 'lucide-react';

interface DashboardSoilIrrigationWidgetProps {
  recommendation?: any;
  recentEvents?: any[];
  contextSummary?: any;
  className?: string;
}

export const DashboardSoilIrrigationWidget: React.FC<DashboardSoilIrrigationWidgetProps> = ({
  recommendation,
  recentEvents = [],
  contextSummary,
  className = '',
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'all' | 'surface' | 'root_zone' | 'deeper_soil'>('all');
  const [simulationActive, setSimulationActive] = useState<boolean>(false);

  const visualResult: NormalizedIrrigationVisual = useMemo(() => {
    if (!recommendation && recentEvents.length === 0) return NEUTRAL_IRRIGATION_VISUAL;
    return resolveIrrigationState(recommendation, recentEvents, contextSummary);
  }, [recommendation, recentEvents, contextSummary]);

  const isWaterFlowing = simulationActive || visualResult.isRaining;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl ${className}`}>
      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-72 md:h-80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <SoilIrrigationScene
          visualResult={visualResult}
          isIrrigating={isWaterFlowing}
          selectedHorizon={selectedHorizon}
        />

        {/* Top Header Badge & Telemetry Status Overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <Droplets size={14} className="text-blue-400" />
            <span className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider">
              3D Soil & Hydro Profile
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {visualResult.hasSoilMoistureData && visualResult.measuredMoisturePercent !== undefined ? (
              <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 font-extrabold text-[11px] backdrop-blur-md">
                Measured Moisture: {visualResult.measuredMoisturePercent}%
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 font-semibold text-[10px] backdrop-blur-md">
                Moisture Telemetry: Unmeasured
              </span>
            )}
          </div>
        </div>

        {/* Bottom Left Horizon Selector Overlay */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-auto flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => setSelectedHorizon('all')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
              selectedHorizon === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Horizons
          </button>
          <button
            onClick={() => setSelectedHorizon('surface')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
              selectedHorizon === 'surface' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Surface
          </button>
          <button
            onClick={() => setSelectedHorizon('root_zone')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
              selectedHorizon === 'root_zone' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Root Zone
          </button>
          <button
            onClick={() => setSelectedHorizon('deeper_soil')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
              selectedHorizon === 'deeper_soil' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Subsoil
          </button>
        </div>

        {/* Bottom Right Water Flow Simulation Toggle */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setSimulationActive(!simulationActive)}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold flex items-center gap-1.5 transition-all shadow-md backdrop-blur-md ${
              simulationActive
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {simulationActive ? <Square size={12} className="text-amber-400" /> : <Play size={12} className="text-blue-400" />}
            <span>{simulationActive ? 'Stop Water Simulation' : 'Simulate Infiltration'}</span>
          </button>
        </div>
      </div>

      {/* Visual Status Metric Footer */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-slate-300">Hydro Demand:</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase border ${
              visualResult.status === 'EXCESS_MOISTURE_RISK' ? 'bg-red-500/20 border-red-500/40 text-red-300' :
              visualResult.status === 'NEEDS_ATTENTION' || visualResult.status === 'LIKELY_NEEDED' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
              'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}>
              {visualResult.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
            <span>Soil Moisture: <strong className="text-slate-200">{visualResult.soilMoistureLevel}</strong></span>
            <span>Method: <strong className="text-slate-200 uppercase">{visualResult.method}</strong></span>
            <span>Crop: <strong className="text-slate-200 capitalize">{visualResult.cropType}</strong></span>
          </div>
        </div>

        {simulationActive && (
          <div className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-800/40 p-2 rounded-xl flex items-center gap-1.5">
            <Info size={13} className="shrink-0" />
            <span>Simulation Preview Active: Visual water flow does not modify official irrigation logs or AI recommendations.</span>
          </div>
        )}
      </div>
    </div>
  );
};
