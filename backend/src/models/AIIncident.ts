import { Schema, model, Document } from 'mongoose';

export interface IAIIncident extends Document {
  incidentId: string;
  evaluationId?: string;
  userId: Schema.Types.ObjectId | string;
  farmId?: Schema.Types.ObjectId | string;
  feature: string;
  category:
    | 'UNSAFE_RECOMMENDATION'
    | 'PATHOLOGY_MISDIAGNOSIS'
    | 'UNAUTHORIZED_TOOL_EXECUTION'
    | 'CROSS_FARM_EXPOSURE'
    | 'REGULATORY_MISALIGNMENT'
    | 'HALLUCINATION'
    | 'PROMPT_INJECTION_ATTEMPT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  evidence?: any;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  assignedTo?: Schema.Types.ObjectId | string;
  resolutionNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIIncidentSchema = new Schema(
  {
    incidentId: { type: String, required: true, unique: true, index: true },
    evaluationId: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    feature: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: [
        'UNSAFE_RECOMMENDATION',
        'PATHOLOGY_MISDIAGNOSIS',
        'UNAUTHORIZED_TOOL_EXECUTION',
        'CROSS_FARM_EXPOSURE',
        'REGULATORY_MISALIGNMENT',
        'HALLUCINATION',
        'PROMPT_INJECTION_ATTEMPT'
      ],
      required: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true
    },
    description: { type: String, required: true },
    evidence: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN',
      index: true
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionNotes: { type: String },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

export const AIIncident = model<IAIIncident>('AIIncident', AIIncidentSchema);
