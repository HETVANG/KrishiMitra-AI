import { Schema, model } from 'mongoose';

const AppointmentSchema = new Schema(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expert: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Format YYYY-MM-DD
    timeSlot: { type: String, required: true }, // e.g. "10:00 AM - 10:30 AM"
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, trim: true },
    meetLink: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Appointment = model('Appointment', AppointmentSchema);
