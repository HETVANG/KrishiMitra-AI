import { Schema, model } from 'mongoose';

const WeatherHistorySchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    temp: { type: Number },
    humidity: { type: Number },
    description: { type: String },
    date: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const WeatherHistory = model('WeatherHistory', WeatherHistorySchema);
