export type QualityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type AnimationState =
  | 'IDLE'
  | 'PLAYING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'RESET';

export type SparrowFlightState =
  | 'OFFSCREEN'
  | 'FLY_IN'
  | 'FLY_ACROSS'
  | 'TURN'
  | 'SLOW_DOWN'
  | 'APPROACH_BRANCH'
  | 'LAND'
  | 'IDLE'
  | 'HEAD_MOVEMENT'
  | 'PREPARING_TAKEOFF'
  | 'FLY_AWAY'
  | 'DISABLED';

export interface SparrowFlightConfig {
  position: [number, number, number];
  targetPosition: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  flightSpeed: number;
  wingSpeed: number;
  perchTarget?: [number, number, number];
}

export type AnimationEventType =
  | 'ANIMATION_STARTED'
  | 'ANIMATION_COMPLETED'
  | 'ANIMATION_PAUSED'
  | 'ANIMATION_RESUMED'
  | 'LOGIN_COMPLETED'
  | 'DASHBOARD_LOADED'
  | 'WEATHER_CHANGED'
  | 'RAIN_STARTED'
  | 'DISEASE_SCAN_STARTED'
  | 'DISEASE_SCAN_COMPLETED'
  | 'IRRIGATION_STARTED'
  | 'MARKET_UPDATED';

export interface AnimationEventPayload<T = any> {
  type: AnimationEventType;
  timestamp: number;
  data?: T;
}

export interface WindVector {
  speed: number;
  direction: [number, number, number];
  gustiness: number;
  frequency: number;
}

export interface QualitySettings {
  level: QualityLevel;
  shadows: boolean;
  maxPixelRatio: number;
  particleCap: number;
  environmentDetail: 'full' | 'simplified' | 'minimal';
  enablePostProcessing: boolean;
}

export type CropType = 'wheat' | 'rice' | 'potato' | 'cotton' | 'maize' | 'neutral';

export type GrowthStage = 'seed' | 'sprout' | 'young' | 'mature' | 'flowering' | 'harvest';

export type CropHealthState = 'HEALTHY' | 'AT_RISK' | 'AFFECTED' | 'RECOVERING';

export type EnvironmentWeatherState = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'HEAT' | 'FOG' | 'NIGHT';

export interface CropConfig {
  cropType: CropType;
  growthStage: GrowthStage;
  healthState: CropHealthState;
  density: number;
  height: number;
  windSensitivity: number;
}

export type GrowthStageDetailed =
  | 'SEED'
  | 'GERMINATION'
  | 'SPROUT'
  | 'YOUNG_PLANT'
  | 'VEGETATIVE_GROWTH'
  | 'MATURE'
  | 'HARVEST_READY'
  | 'STAGE_UNKNOWN';

export type CameraViewMode = 'ABOVE_GROUND' | 'UNDERGROUND' | 'SPLIT_VIEW';

