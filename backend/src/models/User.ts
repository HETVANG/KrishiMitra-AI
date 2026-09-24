import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, sparse: true, trim: true },
    role: { type: String, enum: ['user', 'farmer', 'expert', 'admin'], default: 'user' },
    lastLogin: { type: Date },
    isBlocked: { type: Boolean, default: false },
    settings: {
      language: { type: String, enum: ['en', 'hi', 'gu', 'mr', 'pa', 'bn', 'ta', 'te', 'kn', 'ml', 'or', 'as'], default: 'en' },
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      regionalPreferences: {
        countryCode: { type: String, default: 'IN' },
        countryName: { type: String, default: 'India' },
        stateName: { type: String, default: '' },
        currency: { type: String, default: 'INR' },
        currencySymbol: { type: String, default: '₹' },
        temperatureUnit: { type: String, enum: ['C', 'F'], default: 'C' },
        landAreaUnit: { type: String, enum: ['acre', 'hectare', 'bigha', 'sq_meter'], default: 'acre' },
        measurementSystem: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
        timezone: { type: String, default: 'Asia/Kolkata' }
      }
    },

    // Step 33 Onboarding Tracking
    onboardingStatus: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
      default: 'NOT_STARTED',
      index: true
    },
    onboardingStep: { type: Number, default: 1 },
    onboardingVersion: { type: Number, default: 1 },
    onboardingCompletedAt: { type: Date },

    // Step 36 Customer Acquisition & Referral fields
    referralCode: { type: String, uppercase: true, trim: true, sparse: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    referralCount: { type: Number, default: 0 },

    farmLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
      village: { type: String },
      city: { type: String },
      district: { type: String },
      state: { type: String },
      postcode: { type: String },
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
