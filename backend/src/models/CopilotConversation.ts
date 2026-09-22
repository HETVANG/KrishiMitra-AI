import { Schema, model } from 'mongoose';

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'model'], required: true },
    parts: { type: String, required: true },
    structured: {
      summary: { type: String },
      observations: [{ type: String }],
      recommendations: [{ type: String }],
      actions: [
        {
          title: { type: String },
          priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
          reason: { type: String }
        }
      ],
      warnings: [{ type: String }],
      requiredInformation: [{ type: String }],
      confidence: { type: Number },
      sources: [{ type: String }]
    },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const CopilotConversationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    title: { type: String, required: true, trim: true },
    messages: [MessageSchema],
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const CopilotConversation = model('CopilotConversation', CopilotConversationSchema);
