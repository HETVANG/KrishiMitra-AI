import { Schema, model } from 'mongoose';

const WeatherSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    forecastData: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// Indexing for geospatial or fast coordinate lookups
WeatherSchema.index({ latitude: 1, longitude: 1 }, { unique: true });

export const Weather = model('Weather', WeatherSchema);
