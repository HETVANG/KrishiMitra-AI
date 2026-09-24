import { Schema, model } from 'mongoose';

const OrganizationTaskSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    field: { type: String, trim: true, default: '' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['irrigation', 'fertilizer', 'disease_check', 'weather_prep', 'market', 'general'],
      default: 'general'
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedRole: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bulkBatchId: { type: String, index: true, default: null },
    completionNotes: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

OrganizationTaskSchema.index({ organization: 1, farm: 1, status: 1 });
OrganizationTaskSchema.index({ assignedTo: 1, status: 1 });

export const OrganizationTask = model('OrganizationTask', OrganizationTaskSchema);
