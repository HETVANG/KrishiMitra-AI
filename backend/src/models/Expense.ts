import { Schema, model } from 'mongoose';

const ExpenseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: {
      type: String,
      enum: ['seeds', 'fertilizer', 'labor', 'fuel', 'equipment', 'other'],
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Expense = model('Expense', ExpenseSchema);
