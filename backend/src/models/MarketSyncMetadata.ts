import { Schema, model } from 'mongoose';

const MarketSyncMetadataSchema = new Schema(
  {
    lastSyncTime: { type: Date, default: Date.now },
    activeSource: { type: String, required: true },
    status: { type: String, enum: ['Success', 'Fallback', 'Failed'], required: true },
    totalProcessed: { type: Number, default: 0 },
    successfulImports: { type: Number, default: 0 },
    noDataCommodities: [{ type: String }],
    apiErrors: [{ type: String }],
    recordsPerCommodity: { type: Map, of: Number },
    totalImported: { type: Number, default: 0 },
    executionTimeSeconds: { type: Number, default: 0 },
    message: { type: String, default: '' }
  },
  { timestamps: true }
);

export const MarketSyncMetadata = model('MarketSyncMetadata', MarketSyncMetadataSchema);
