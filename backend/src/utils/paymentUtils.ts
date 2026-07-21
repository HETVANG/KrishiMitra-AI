export type SubscriptionPlanName = 'free' | 'basic' | 'premium' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanDefinition {
  name: SubscriptionPlanName;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge: string;
  featured: boolean;
  features: string[];
}

export const PLAN_DEFINITIONS: Record<SubscriptionPlanName, PlanDefinition> = {
  free: {
    name: 'free',
    displayName: 'Free',
    description: 'Essential tools for everyday farm support.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    badge: 'Default',
    featured: false,
    features: ['Basic disease insights', 'Weather updates', 'Community access']
  },
  basic: {
    name: 'basic',
    displayName: 'Basic',
    description: 'More insights and a better daily workflow.',
    monthlyPrice: 99,
    yearlyPrice: 999,
    badge: 'Most Popular',
    featured: true,
    features: ['Unlimited disease scans', 'Expanded analytics', 'Priority support']
  },
  premium: {
    name: 'premium',
    displayName: 'Premium',
    description: 'Advanced advisory and professional farm planning.',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    badge: 'Pro',
    featured: true,
    features: ['Everything in Basic', 'AI farm planning', 'Premium reports', 'Priority experts']
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'Multi-farm operations and cooperative dashboards.',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    badge: 'Coming Soon',
    featured: false,
    features: ['Cooperative dashboards', 'Dedicated support', 'Expanded integrations']
  }
};

export const getPlanDefinition = (planName?: SubscriptionPlanName): PlanDefinition => {
  const normalized = (planName || 'free') as SubscriptionPlanName;
  return PLAN_DEFINITIONS[normalized] || PLAN_DEFINITIONS.free;
};

export const getPlanAmount = (planName: SubscriptionPlanName, billingCycle: BillingCycle): number => {
  const plan = getPlanDefinition(planName);
  return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
};

export const getMockPaymentMode = (): boolean => {
  return !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;
};

export const getSubscriptionExpiry = (billingCycle: BillingCycle): Date => {
  const amount = billingCycle === 'yearly' ? 365 : 30;
  return new Date(Date.now() + amount * 24 * 60 * 60 * 1000);
};
