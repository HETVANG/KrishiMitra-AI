import { Schema, model } from 'mongoose';

const OrganizationReportSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true, trim: true },
    reportType: {
      type: String,
      enum: [
        'FARM_ACTIVITY',
        'CROP_OVERVIEW',
        'DISEASE_INTELLIGENCE',
        'IRRIGATION_SUMMARY',
        'WEATHER_RISKS',
        'MARKET_SNAPSHOT',
        'MEMBER_DIRECTORY'
      ],
      required: true,
      index: true
    },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    farmsIncludedCount: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, required: true },
    exportFormat: { type: String, enum: ['JSON', 'CSV', 'PDF'], default: 'JSON' }
  },
  { timestamps: true }
);

OrganizationReportSchema.index({ organization: 1, createdAt: -1 });

export const OrganizationReport = model('OrganizationReport', OrganizationReportSchema);
