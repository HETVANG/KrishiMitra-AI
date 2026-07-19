import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: Schema.Types.ObjectId;
  action: string;
  target: string;
  details: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ adminId: 1 });

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
