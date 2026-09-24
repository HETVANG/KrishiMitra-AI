export type AICoreVisualState =
  | 'IDLE'
  | 'LISTENING'
  | 'RECEIVING'
  | 'UNDERSTANDING'
  | 'ANALYZING'
  | 'REASONING'
  | 'RETRIEVING_CONTEXT'
  | 'GENERATING'
  | 'RESPONDING'
  | 'WAITING'
  | 'SUCCESS'
  | 'UNCERTAIN'
  | 'ERROR'
  | 'DISABLED';

export interface AICoreContextSources {
  weather?: boolean;
  soil?: boolean;
  disease?: boolean;
  market?: boolean;
  farmContext?: boolean;
}

export interface NormalizedAICorePayload {
  state: AICoreVisualState;
  confidence?: number;
  activeSources: AICoreContextSources;
  isVoiceActive: boolean;
  statusText: string;
}

export const NEUTRAL_AI_CORE_PAYLOAD: NormalizedAICorePayload = {
  state: 'IDLE',
  confidence: undefined,
  activeSources: {
    weather: true,
    soil: true,
    disease: false,
    market: true,
    farmContext: true,
  },
  isVoiceActive: false,
  statusText: 'AI Core Online • Standing by for farm queries',
};

/**
 * Resolves application & Copilot state into normalized AI Core visual payload.
 * Never exposes hidden chain-of-thought or invents fake confidence numbers.
 */
export function resolveAICoreState(
  loading: boolean,
  contextLoading: boolean,
  lastMessage?: any,
  isVoiceActive = false
): NormalizedAICorePayload {
  if (contextLoading) {
    return {
      state: 'RETRIEVING_CONTEXT',
      confidence: undefined,
      activeSources: { weather: true, soil: true, farmContext: true },
      isVoiceActive: false,
      statusText: 'Retrieving Farm Telemetry & Field History...',
    };
  }

  if (isVoiceActive) {
    return {
      state: 'LISTENING',
      confidence: undefined,
      activeSources: { weather: true, soil: true, farmContext: true },
      isVoiceActive: true,
      statusText: 'Listening to Farmer Voice Input...',
    };
  }

  if (loading) {
    return {
      state: 'ANALYZING',
      confidence: undefined,
      activeSources: { weather: true, soil: true, disease: true, market: true, farmContext: true },
      isVoiceActive: false,
      statusText: 'Evaluating Agronomic Rules & Context...',
    };
  }

  if (lastMessage && lastMessage.role === 'model') {
    const confidence = lastMessage.structured?.confidence;
    const isUncertain = confidence !== undefined && confidence < 50;

    return {
      state: isUncertain ? 'UNCERTAIN' : 'SUCCESS',
      confidence,
      activeSources: {
        weather: true,
        soil: true,
        disease: Boolean(lastMessage.structured?.warnings?.length),
        market: true,
        farmContext: true,
      },
      isVoiceActive: false,
      statusText: isUncertain ? 'Agronomic Evaluation Complete (Low Confidence)' : 'Response Ready',
    };
  }

  return NEUTRAL_AI_CORE_PAYLOAD;
}
