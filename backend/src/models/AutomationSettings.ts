import { Schema, model, Document } from 'mongoose';

export interface IAutomationSettings extends Document {
  userId: Schema.Types.ObjectId | string;
  farmId?: Schema.Types.ObjectId | string;
  organizationId?: Schema.Types.ObjectId | string;
  globalAutonomyLevel: number; // 0..5
  weatherMonitoring: boolean;
  autoTaskCreation: boolean;
  notificationsEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "06:00"
  };
  categories: {
    weather: { autonomyLevel: number; autoActionAllowed: boolean };
    irrigation: { autonomyLevel: number; autoActionAllowed: boolean };
    disease: { autonomyLevel: number; autoActionAllowed: boolean };
    market: { autonomyLevel: number; autoActionAllowed: boolean };
    external: { autonomyLevel: number; autoActionAllowed: boolean }; // Requires approval always
    financial: { autonomyLevel: number; autoActionAllowed: boolean }; // Disabled always
    chemical: { autonomyLevel: number; autoActionAllowed: boolean };  // Requires approval always
  };
  createdAt: Date;
  updatedAt: Date;
}

const AutomationSettingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    globalAutonomyLevel: { type: Number, default: 2, min: 0, max: 5 },
    weatherMonitoring: { type: Boolean, default: true },
    autoTaskCreation: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '06:00' }
    },
    categories: {
      weather: {
        autonomyLevel: { type: Number, default: 4 },
        autoActionAllowed: { type: Boolean, default: true }
      },
      irrigation: {
        autonomyLevel: { type: Number, default: 3 },
        autoActionAllowed: { type: Boolean, default: false }
      },
      disease: {
        autonomyLevel: { type: Number, default: 3 },
        autoActionAllowed: { type: Boolean, default: false }
      },
      market: {
        autonomyLevel: { type: Number, default: 2 },
        autoActionAllowed: { type: Boolean, default: true }
      },
      external: {
        autonomyLevel: { type: Number, default: 3 },
        autoActionAllowed: { type: Boolean, default: false }
      },
      financial: {
        autonomyLevel: { type: Number, default: 0 },
        autoActionAllowed: { type: Boolean, default: false }
      },
      chemical: {
        autonomyLevel: { type: Number, default: 3 },
        autoActionAllowed: { type: Boolean, default: false }
      }
    }
  },
  { timestamps: true }
);

export const AutomationSettings = model<IAutomationSettings>(
  'AutomationSettings',
  AutomationSettingsSchema
);
