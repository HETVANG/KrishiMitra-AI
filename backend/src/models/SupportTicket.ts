import mongoose, { Schema, Document } from 'mongoose';

export type SupportCategory =
  | 'ACCOUNT'
  | 'FARM'
  | 'CROP'
  | 'DISEASE'
  | 'WEATHER'
  | 'MARKET'
  | 'IRRIGATION'
  | 'COPILOT'
  | 'AGENTS'
  | 'PAYMENT'
  | 'SUBSCRIPTION'
  | 'MARKETPLACE'
  | 'ORGANIZATION'
  | 'PARTNER'
  | 'OTHER';

export type SupportStatus = 'OPEN' | 'IN_REVIEW' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
export type SupportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ISupportMessage {
  sender: 'USER' | 'SUPPORT_AGENT' | 'SYSTEM';
  text: string;
  senderName?: string;
  timestamp: Date;
}

export interface ISupportTicket extends Document {
  ticketId: string;
  userId: mongoose.Types.ObjectId;
  farmId?: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  subject: string;
  description: string;
  language: string;
  messages: ISupportMessage[];
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    category: {
      type: String,
      enum: [
        'ACCOUNT', 'FARM', 'CROP', 'DISEASE', 'WEATHER', 'MARKET',
        'IRRIGATION', 'COPILOT', 'AGENTS', 'PAYMENT', 'SUBSCRIPTION',
        'MARKETPLACE', 'ORGANIZATION', 'PARTNER', 'OTHER'
      ],
      required: true,
      index: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_REVIEW', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    language: { type: String, default: 'en' },
    messages: [
      {
        sender: { type: String, enum: ['USER', 'SUPPORT_AGENT', 'SYSTEM'], required: true },
        text: { type: String, required: true },
        senderName: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    assignedTo: { type: String, default: null },
    resolutionNotes: { type: String, default: null }
  },
  { timestamps: true }
);

SupportTicketSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
