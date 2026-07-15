import { Schema, model } from 'mongoose';

const GovernmentSchemeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    eligibility: [{ type: String }],
    benefits: { type: String },
    documentsRequired: [{ type: String }],
    applyLink: { type: String, trim: true },
    deadline: { type: Date },
    category: { type: String, trim: true }, // e.g. "Subsidy", "Loan", "Insurance"
  },
  { timestamps: true }
);

export const GovernmentScheme = model('GovernmentScheme', GovernmentSchemeSchema);
