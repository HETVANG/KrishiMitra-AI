import { Schema, model } from 'mongoose';

const AppointmentSchema = new Schema(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expert: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional for general bookings
    date: { type: String, required: true }, // Format YYYY-MM-DD
    timeSlot: { type: String, required: true }, // e.g. "10:00 AM - 10:30 AM" or preferred time
    status: {
      type: String,
      enum: ['pending', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, trim: true },
    meetLink: { type: String, trim: true },
    cropName: { type: String, default: '' },
    category: { type: String, default: 'Other' },
    description: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'English' },
    consultationType: { type: String, enum: ['Video', 'Audio', 'Chat'], default: 'Video' },
    images: [{ type: String }],
    videos: [{ type: String }],
  },
  { timestamps: true }
);

export const Appointment = model('Appointment', AppointmentSchema);
