import { Schema, model } from 'mongoose';

const VideoConsultationSchema = new Schema(
  {
    requestId: { type: String, required: true, unique: true },
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expert: { type: Schema.Types.ObjectId, ref: 'User' },
    videoUrl: { type: String, required: true },
    cropName: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Disease', 'Pest', 'Soil', 'Irrigation', 'Fertilizer', 'Weather', 'Other']
    },
    description: { type: String, required: true, trim: true },
    farmDetails: {
      farmName: { type: String, default: '' },
      village: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' }
    },
    priority: {
      type: String,
      required: true,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal'
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Assigned', 'Under Review', 'Expert Replied', 'Completed'],
      default: 'Pending'
    },
    response: {
      text: { type: String, default: '' },
      videoUrl: { type: String, default: '' },
      attachments: [{ type: String }], // document or image secure urls
      recommendations: { type: String, default: '' },
      repliedAt: { type: Date }
    },
    notifications: [
      {
        message: { type: String, required: true },
        type: { type: String, enum: ['accepted', 'replied', 'completed'], required: true },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const VideoConsultation = model('VideoConsultation', VideoConsultationSchema);
