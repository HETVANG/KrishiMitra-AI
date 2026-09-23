import { Schema, model } from 'mongoose';

const MarketplaceFavoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    listing: { type: Schema.Types.ObjectId, ref: 'MarketplaceListing', required: true, index: true }
  },
  { timestamps: true }
);

MarketplaceFavoriteSchema.index({ user: 1, listing: 1 }, { unique: true });

export const MarketplaceFavorite = model('MarketplaceFavorite', MarketplaceFavoriteSchema);
