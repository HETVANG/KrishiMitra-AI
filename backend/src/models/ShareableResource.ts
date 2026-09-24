import mongoose, { Schema, Document } from 'mongoose';

export type ShareableResourceType = 'weather' | 'disease' | 'market' | 'crop_health' | 'knowledge';

export interface IShareableResource extends Document {
  publicId: string;
  userId: mongoose.Types.ObjectId;
  resourceType: ShareableResourceType;
  title: string;
  summary: string;
  payload: Record<string, any>;
  viewsCount: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShareableResourceSchema = new Schema<IShareableResource>(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resourceType: {
      type: String,
      enum: ['weather', 'disease', 'market', 'crop_health', 'knowledge'],
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    payload: { type: Schema.Types.Mixed, required: true },
    viewsCount: { type: Number, default: 0 },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

export const ShareableResource = mongoose.model<IShareableResource>('ShareableResource', ShareableResourceSchema);
