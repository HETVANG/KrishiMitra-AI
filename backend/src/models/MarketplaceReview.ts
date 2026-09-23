import { Schema, model } from 'mongoose';

const MarketplaceReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: Schema.Types.ObjectId, ref: 'MarketplaceProvider', required: true, index: true },
    listing: { type: Schema.Types.ObjectId, ref: 'MarketplaceListing', index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'PUBLISHED', 'REJECTED'],
      default: 'PUBLISHED',
      index: true
    }
  },
  { timestamps: true }
);

export const MarketplaceReview = model('MarketplaceReview', MarketplaceReviewSchema);
