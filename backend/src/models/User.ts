import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, sparse: true, trim: true },
    role: { type: String, enum: ['farmer', 'expert', 'admin'], default: 'farmer' },
    settings: {
      language: { type: String, enum: ['en', 'hi', 'gu', 'mr', 'pa', 'bn', 'ta', 'te', 'kn', 'ml', 'or', 'as'], default: 'en' },
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    },
    farmLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
    },
    expertProfile: {
      specialization: { type: String },
      experienceYears: { type: Number },
      bio: { type: String },
      isAvailable: { type: Boolean, default: true },
      rating: { type: Number, default: 5 },
      consultationFee: { type: Number, default: 0 },
    },
    
    // Subscription Management fields
    plan: { 
      type: String, 
      enum: ['free', 'premium', 'enterprise'], 
      default: 'free' 
    },
    subscriptionStatus: { 
      type: String, 
      enum: ['active', 'inactive', 'expired', 'trialing'], 
      default: 'trialing' 
    },
    subscriptionType: { 
      type: String, 
      enum: ['monthly', 'yearly', 'trial', 'none'], 
      default: 'trial' 
    },
    paymentProvider: { 
      type: String, 
      enum: ['stripe', 'razorpay', 'upi', 'none'], 
      default: 'none' 
    },
    trialStartDate: { 
      type: Date, 
      default: Date.now 
    },
    trialEndDate: { 
      type: Date, 
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3-month free trial (90 days)
    },
    subscriptionExpiry: { 
      type: Date, 
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) 
    },
    lastPaymentDate: { type: Date },
    nextBillingDate: { type: Date },
    
    // Daily usage caps (resets daily via subscription middleware)
    scansUsedToday: { type: Number, default: 0 },
    chatMessagesToday: { type: Number, default: 0 },
    lastLimitResetDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = model('User', UserSchema);
