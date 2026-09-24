import React, { useState, useMemo } from 'react';
import { AICoreScene } from '../scenes/AICoreScene';
import { resolveAICoreState, NEUTRAL_AI_CORE_PAYLOAD } from '../ai/aiCoreState';
import type { NormalizedAICorePayload } from '../ai/aiCoreState';
import { Brain, Sparkles, CloudSun, Sprout, ShieldAlert, TrendingUp, Activity, Play, Square, Info } from 'lucide-react';

interface DashboardAICoreWidgetProps {
  loading?: boolean;
  contextLoading?: boolean;
  lastMessage?: any;
  isVoiceActive?: boolean;
  className?: string;
}

export const DashboardAICoreWidget: React.FC<DashboardAICoreWidgetProps> = ({
  loading = false,
  contextLoading = false,
  lastMessage,
  isVoiceActive = false,
  className = '',
}) => {
  const [simulationActive, setSimulationActive] = useState<boolean>(false);

  const visualResult: NormalizedAICorePayload = useMemo(() => {
    if (simulationActive) {
      return {
        state: 'ANALYZING',
        confidence: 94,
        activeSources: { weather: true, soil: true, disease: true, market: true, farmContext: true },
        isVoiceActive: false,
        statusText: 'Simulation Preview: Evaluating Multimodal Farm Context...',
      };
    }
    return resolveAICoreState(loading, contextLoading, lastMessage, isVoiceActive);
  }, [loading, contextLoading, lastMessage, isVoiceActive, simulationActive]);

  const getStateBadgeStyle = (state: string) => {
    switch (state) {
      case 'ANALYZING':
      case 'RECEIVING':
      case 'RETRIEVING_CONTEXT':
        return 'bg-blue-500/20 border-blue-500/40 text-blue-300 animate-pulse';
      case 'LISTENING':
        return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 animate-pulse';
      case 'SUCCESS':
      case 'RESPONDING':
        return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
      case 'UNCERTAIN':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-300';
      case 'ERROR':
        return 'bg-red-500/20 border-red-500/40 text-red-300';
      default:
        return 'bg-slate-800/80 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl ${className}`}>
      {/* 3D Scene Viewport */}
      <div className="relative w-full h-64 md:h-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <AICoreScene visualResult={visualResult} />

        {/* Top Header Badge & AI State Overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <Brain size={15} className="text-emerald-400" />
            <span className="text-[11px] font-extrabold text-slate-100 uppercase tracking-wider">
              KrishiMitra AI Core
            </span>
          </div>

          <span className={`px-3 py-1 rounded-xl border font-extrabold text-[11px] backdrop-blur-md ${getStateBadgeStyle(visualResult.state)}`}>
            Status: {visualResult.state.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Bottom Left Context Streams Indicator */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none flex flex-wrap items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Context Streams:</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-semibold">
            <CloudSun size={11} /> Weather
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-semibold">
            <Sprout size={11} /> Soil
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 font-semibold">
            <TrendingUp size={11} /> Market
          </span>
        </div>

        {/* Bottom Right Simulation Mode Button */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-auto">
          <button
            onClick={() => setSimulationActive(!simulationActive)}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold flex items-center gap-1.5 transition-all shadow-md backdrop-blur-md ${
              simulationActive
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {simulationActive ? <Square size={12} className="text-amber-400" /> : <Play size={12} className="text-emerald-400" />}
            <span>{simulationActive ? 'Stop AI Simulation' : 'Simulate AI Stream'}</span>
          </button>
        </div>
      </div>

      {/* Visual Status Metric Footer */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-400 shrink-0" />
            <span>{visualResult.statusText}</span>
          </p>

          {visualResult.confidence !== undefined && (
            <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/40">
              {(visualResult.confidence > 1 ? visualResult.confidence : visualResult.confidence * 100).toFixed(0)}% Verified Confidence
            </span>
          )}
        </div>

        {simulationActive && (
          <div className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-800/40 p-2 rounded-xl flex items-center gap-1.5">
            <Info size={13} className="shrink-0" />
            <span>Simulation Preview Active: Visual core pulses do not modify official Copilot chat history or LLM tokens.</span>
          </div>
        )}
      </div>
    </div>
  );
};
