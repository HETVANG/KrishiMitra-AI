import { EventEmitter } from 'events';

export type FarmEventType =
  | 'WEATHER_UPDATED'
  | 'HEAVY_RAIN_DETECTED'
  | 'HEAT_RISK_DETECTED'
  | 'DISEASE_SCAN_COMPLETED'
  | 'DISEASE_RISK_INCREASED'
  | 'SOIL_ANALYSIS_COMPLETED'
  | 'IRRIGATION_RECORDED'
  | 'WATER_STRESS_DETECTED'
  | 'MARKET_PRICE_CHANGED'
  | 'CROP_STAGE_CHANGED'
  | 'HARVEST_WINDOW_APPROACHING'
  | 'FARM_ACTIVITY_RECORDED'
  | 'SCHEDULED_DAILY_RUN';

export interface FarmEventPayload {
  type: FarmEventType;
  userId: string;
  farmId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class AgentEventBus extends EventEmitter {
  emitFarmEvent(payload: FarmEventPayload) {
    console.log(`[AgentEventBus] Event emitted: ${payload.type} for user: ${payload.userId}`);
    this.emit('farmEvent', payload);
    this.emit(payload.type, payload);
  }
}

export const farmEventBus = new AgentEventBus();
