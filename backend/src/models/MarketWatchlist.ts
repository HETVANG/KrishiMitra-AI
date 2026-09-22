import { Schema, model } from 'mongoose';

const MarketWatchlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    crop: { type: String, required: true, trim: true },
    commodity: { type: String, trim: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    market: { type: String, trim: true }
  },
  { timestamps: true }
);

MarketWatchlistSchema.index({ user: 1, crop: 1, state: 1, market: 1 }, { unique: true });

export const MarketWatchlist = model('MarketWatchlist', MarketWatchlistSchema);
