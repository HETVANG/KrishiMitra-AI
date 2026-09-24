import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchInterview extends Document {
  participantId: mongoose.Types.ObjectId;
  interviewDate: Date;
  interviewer: string;
  workflowObserved: string;
  keyObservations: string[];
  quotes: string[];
  followUpRequired: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchInterviewSchema = new Schema<IResearchInterview>(
  {
    participantId: { type: Schema.Types.ObjectId, ref: 'ResearchParticipant', required: true, index: true },
    interviewDate: { type: Date, default: Date.now },
    interviewer: { type: String, required: true, trim: true },
    workflowObserved: { type: String, required: true, trim: true },
    keyObservations: [{ type: String }],
    quotes: [{ type: String }],
    followUpRequired: { type: Boolean, default: false },
    notes: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const ResearchInterview = mongoose.model<IResearchInterview>('ResearchInterview', ResearchInterviewSchema);
