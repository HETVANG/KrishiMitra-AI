import { Schema, model } from 'mongoose';

const MarketplaceInquirySchema = new Schema(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    listing: { type: Schema.Types.ObjectId, ref: 'MarketplaceListing', required: true, index: true },
    provider: { type: Schema.Types.ObjectId, ref: 'MarketplaceProvider', required: true, index: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    farmContext: {
      cropName: { type: String, default: '' },
      growthStage: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['PENDING', 'RESPONDED', 'CLOSED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    responseMessage: { type: String, default: '' },
    respondedAt: { type: Date }
  },
  { timestamps: true }
);

export const MarketplaceInquiry = model('MarketplaceInquiry', MarketplaceInquirySchema);
