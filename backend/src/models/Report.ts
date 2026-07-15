import { Schema, model } from 'mongoose';

const ReportSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['crop', 'weather', 'disease', 'expense'], required: true },
    downloadedAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const Report = model('Report', ReportSchema);
