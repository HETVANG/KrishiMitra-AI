import mongoose, { Schema, Document } from 'mongoose';

export type ProductEventType =
  | 'USER_REGISTERED'
  | 'FARM_CREATED'
  | 'FARM_UPDATED'
  | 'CROP_CREATED'
  | 'DISEASE_SCAN_STARTED'
  | 'DISEASE_SCAN_COMPLETED'
  | 'DISEASE_SCAN_FAILED'
  | 'COPILOT_QUERY'
  | 'COPILOT_RESPONSE'
  | 'COPILOT_FEEDBACK'
  | 'IRRIGATION_VIEWED'
  | 'MARKET_VIEWED'
  | 'WEATHER_VIEWED'
  | 'EXPERT_CONSULTATION_CREATED'
  | 'MARKETPLACE_SEARCH'
  | 'MARKETPLACE_INQUIRY'
  | 'AGENT_RECOMMENDATION_VIEWED'
  | 'AGENT_RECOMMENDATION_APPROVED'
  | 'AGENT_RECOMMENDATION_REJECTED'
  | 'TASK_COMPLETED'
  | 'NOTIFICATION_OPENED'
  | 'NOTIFICATION_DISMISSED'
  | 'ERROR_OCCURRED'
  | 'SUPPORT_REQUESTED'
  | 'ONBOARDING_STARTED'
  | 'ONBOARDING_STEP_COMPLETED'
  | 'ONBOARDING_SKIPPED'
  | 'ONBOARDING_COMPLETED';

export interface IProductEvent extends Document {
  eventType: ProductEventType;
  userId?: string;
  farmId?: string;
  feature: string;
  region?: string;
  countryCode?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ProductEventSchema: Schema = new Schema(
  {
    eventType: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    farmId: { type: String, index: true },
    feature: { type: String, required: true, index: true },
    region: { type: String },
    countryCode: { type: String, uppercase: true, default: 'IN' },
    sessionId: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ProductEventSchema.index({ feature: 1, eventType: 1, createdAt: -1 });

export const ProductEvent = mongoose.model<IProductEvent>('ProductEvent', ProductEventSchema);
