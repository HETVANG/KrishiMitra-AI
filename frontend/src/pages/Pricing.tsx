import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Check, 
  Sparkles, 
  HelpCircle, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Coins, 
  ChevronRight,
  Gift,
  Building,
  UserCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Pricing: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [provider, setProvider] = useState<'stripe' | 'razorpay' | 'upi'>('upi');
  
  // Promotion states
  const [coupon, setCoupon] = useState('');
  const [referral, setReferral] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [sponsorType, setSponsorType] = useState<'none' | 'ngo' | 'gov'>('none');
  
  // Price computation states
  const [basePrice, setBasePrice] = useState(99);
  const [finalPrice, setFinalPrice] = useState(99);
  const [discountMessage, setDiscountMessage] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. Determine base price
    const base = billingCycle === 'monthly' ? 99 : 999;
    setBasePrice(base);

    // 2. Process discounts sequentially (mirroring backend DiscountEngine logic)
    let price = base;
    let messages: string[] = [];

    if (sponsorType === 'gov') {
      price = price * 0.1; // 90% subsidy
      messages.push('90% Government Farmer Subsidy Applied');
    } else if (sponsorType === 'ngo') {
      price = price * 0.2; // 80% discount
      messages.push('80% NGO Cooperative Discount Applied');
    } else if (isStudent) {
      price = price * 0.5; // 50% discount
      messages.push('50% Young Farmer Academic Discount Applied');
    }

    if (coupon) {
      const code = coupon.toUpperCase().trim();
      if (code === 'KRISHI50') {
        price = price * 0.5;
        messages.push('Promo Code KRISHI50 (50% Off) Active');
      } else if (code === 'MITRA20') {
        price = price * 0.8;
        messages.push('Promo Code MITRA20 (20% Off) Active');
      }
    }

    if (referral.trim().length > 3) {
      price = Math.max(0, price - 100);
      messages.push('Referral Rebate (-₹100) Active');
    }

    const calculated = Math.round(price);
    setFinalPrice(calculated);
    setDiscountMessage(messages.join(' | '));
  }, [billingCycle, coupon, referral, isStudent, sponsorType]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let discountType: 'student' | 'ngo' | 'gov' | 'none' = 'none';
      if (sponsorType === 'gov') discountType = 'gov';
      else if (sponsorType === 'ngo') discountType = 'ngo';
      else if (isStudent) discountType = 'student';

      const res = await api.post('/billing/checkout', {
        planType: billingCycle,
        paymentProvider: provider,
        couponCode: coupon || undefined,
        referralCode: referral || undefined,
        discountType
      });

      if (res.data && res.data.success) {
        updateUser(res.data.user);
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to initialize subscription checkout.');
    } finally {
      setLoading(false);
    }
  };

  const freeFeatures = [
    'Disease Detection (10 scans/day)',
    'Real-time hyper-local weather alerts',
    'Mandi market commodity price search',
    'National Government Subsidies Portal',
    'Basic chatbot helper (20 questions/day)',
    '12 regional languages & Voice assistance',
    'Community expert discussion forums'
  ];

  const premiumFeatures = [
    'Unlimited Leaf Disease Pathology Scans',
    'Unlimited AI Chatbot consultations',
    'Custom soil NPK fertilization optimization',
    'Smart crop yield prediction charts',
    'Advanced multi-crop irrigation calendars',
    'Expert agriculture specialist calendar bookings',
    'Priority high-speed GPU processing queue',
    'Unlimited dynamic printable PDF reports',
    'Export ledgers and data arrays to Microsoft Excel',
    'Multi-device syncing & encrypted cloud backups'
  ];

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Agricultural Premium Plans</h1>
        <p className="text-emerald-100 text-xs md:text-sm mt-1 font-medium">Unlock advanced agronomic AI tools, unlimited leaf scanning diagnostics, and priority expert consultations.</p>
      </div>

      {success ? (
        <div className="max-w-xl mx-auto bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-dark-50">Premium Activated Successfully!</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-dark-300">
            Thank you for supporting KrishiMitra AI. Your subscription is active. All premium calculators, yield predictors, unlimited chat capacity, and PDF templates are now unlocked.
          </p>
          <div className="bg-gray-50 dark:bg-dark-950 p-4 rounded-2xl border text-xs text-gray-600 dark:text-dark-400 space-y-1">
            <div className="flex justify-between">
              <span>Selected Billing Plan:</span>
              <span className="font-bold capitalize text-gray-800 dark:text-dark-200">{billingCycle} Premium</span>
            </div>
            <div className="flex justify-between">
              <span>Paid via:</span>
              <span className="font-bold uppercase text-gray-800 dark:text-dark-200">{provider}</span>
            </div>
            <div className="flex justify-between">
              <span>Subscription Expiry:</span>
              <span className="font-bold text-gray-800 dark:text-dark-200">
                {billingCycle === 'monthly' ? '1 Month from today' : '1 Year from today'}
              </span>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary w-full py-3 min-h-[44px]"
          >
            Go to Farmer Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Plan Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Active Subscription status alert */}
            {user?.plan === 'premium' && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-2xl flex items-center gap-3 text-xs md:text-sm text-emerald-800 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
                <span>You are currently subscribed to the Premium Plan! You have full access to all features. Feel free to review or renew below.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Free Plan Card */}
              <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-150 dark:border-dark-800/40 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-dark-500 uppercase tracking-wider block">Standard Access</span>
                    <h3 className="text-xl font-extrabold text-gray-800 dark:text-dark-50 mt-1">Free Plan</h3>
                    <div className="mt-3 flex items-baseline">
                      <span className="text-3xl font-extrabold text-gray-800 dark:text-dark-50">₹0</span>
                      <span className="text-gray-400 text-xs font-semibold ml-1">/ Free Forever</span>
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-dark-800/60" />

                  <ul className="space-y-2.5">
                    {freeFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-dark-300">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-50 dark:border-dark-800/40">
                  <button 
                    disabled 
                    className="w-full py-3 bg-gray-100 dark:bg-dark-800 text-gray-400 dark:text-dark-500 font-bold rounded-xl text-xs uppercase cursor-not-allowed min-h-[44px]"
                  >
                    Active Plan (Default)
                  </button>
                </div>
              </div>

              {/* Premium Plan Card */}
              <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border-2 border-brand-500 shadow-lg flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-brand-500 text-white text-[9px] font-extrabold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={10} /> Popular
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">Agronomic Intelligence Suite</span>
                    <h3 className="text-xl font-extrabold text-gray-800 dark:text-dark-50 mt-1">Premium Plan</h3>
                    
                    {/* Billing cycle switch */}
                    <div className="mt-3 flex justify-between items-baseline">
                      <div>
                        <span className="text-3xl font-extrabold text-gray-800 dark:text-dark-50">
                          {billingCycle === 'monthly' ? '₹99' : '₹999'}
                        </span>
                        <span className="text-gray-400 text-xs font-semibold ml-1">
                          / {billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100">
                          Save 2 Months!
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-50 dark:bg-dark-950 rounded-xl mt-3.5">
                      <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`py-2 text-[10px] font-bold rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-dark-900 text-brand-700 shadow-sm' : 'text-gray-400'}`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`py-2 text-[10px] font-bold rounded-lg transition-all ${billingCycle === 'yearly' ? 'bg-white dark:bg-dark-900 text-brand-700 shadow-sm' : 'text-gray-400'}`}
                      >
                        Yearly (₹999)
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-dark-800/60" />

                  <ul className="space-y-2.5">
                    {premiumFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-dark-250">
                        <Check size={14} className="text-brand-650 shrink-0 mt-0.5" />
                        <span className="font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Enterprise Card */}
            <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-150 dark:border-dark-800/40 shadow-sm text-left flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Cooperative & NGOs</span>
                <h4 className="font-extrabold text-base text-gray-800 dark:text-dark-150">Enterprise Organization Plan</h4>
                <p className="text-xs text-gray-500 dark:text-dark-400 max-w-lg">Dedicated agronomic dashboards, expert calendar slots allocation for cooperative clusters, government subsidized integrations, and API accesses.</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/20 px-3 py-1.5 rounded-xl uppercase border">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Checkout Checkout Forms (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-150 dark:border-dark-800/40 shadow-sm text-left space-y-6">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-50 flex items-center gap-2 pb-2 border-b">
              <CreditCard size={18} className="text-brand-600" /> Checkout Portal
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-655 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-5">
              
              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProvider('upi')}
                    className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 hover:border-brand-500 transition-all ${provider === 'upi' ? 'border-brand-500 bg-brand-50/10' : 'border-gray-250 dark:border-dark-800'}`}
                  >
                    <Coins size={16} className="text-brand-600" />
                    <span className="text-[9px] font-bold">UPI QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('stripe')}
                    className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 hover:border-brand-500 transition-all ${provider === 'stripe' ? 'border-brand-500 bg-brand-50/10' : 'border-gray-250 dark:border-dark-800'}`}
                  >
                    <CreditCard size={16} className="text-blue-500" />
                    <span className="text-[9px] font-bold">Stripe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('razorpay')}
                    className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 hover:border-brand-500 transition-all ${provider === 'razorpay' ? 'border-brand-500 bg-brand-50/10' : 'border-gray-250 dark:border-dark-800'}`}
                  >
                    <Building size={16} className="text-orange-500" />
                    <span className="text-[9px] font-bold">Razorpay</span>
                  </button>
                </div>
              </div>

              {/* Subsidies & Sponsorships */}
              <div className="space-y-3.5 border-t pt-4">
                <label className="block text-xs font-bold text-gray-400 uppercase">Agriculture Subsidies</label>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-dark-300">
                    <input
                      type="checkbox"
                      checked={isStudent}
                      onChange={(e) => {
                        setIsStudent(e.target.checked);
                        if (e.target.checked) setSponsorType('none'); // mutual exclusive
                      }}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>Young Farmer / Student (50% Off)</span>
                  </label>

                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-dark-300">
                      <input
                        type="radio"
                        name="sponsor"
                        checked={sponsorType === 'none'}
                        onChange={() => setSponsorType('none')}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>No Sponsorship / Private Plan</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-dark-300">
                      <input
                        type="radio"
                        name="sponsor"
                        checked={sponsorType === 'ngo'}
                        onChange={() => {
                          setSponsorType('ngo');
                          setIsStudent(false);
                        }}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>NGO Cooperative Sponsored (80% Off)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-dark-300">
                      <input
                        type="radio"
                        name="sponsor"
                        checked={sponsorType === 'gov'}
                        onChange={() => {
                          setSponsorType('gov');
                          setIsStudent(false);
                        }}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>Government Smallholder Subsidy (90% Off)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Coupons & Promo Codes */}
              <div className="space-y-3.5 border-t pt-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-400 uppercase">Promo Coupon Code</label>
                  <span className="text-[9px] text-gray-400 font-medium">Try: KRISHI50 or MITRA20</span>
                </div>
                <div className="relative">
                  <Gift className="absolute left-3.5 top-3.5 text-gray-400" size={15} />
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="e.g. KRISHI50"
                    className="custom-input text-xs pl-10"
                  />
                </div>
              </div>

              {/* Referral Codes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">Friend Referral Code</label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-3.5 text-gray-400" size={15} />
                  <input
                    type="text"
                    value={referral}
                    onChange={(e) => setReferral(e.target.value)}
                    placeholder="Referral code for rebate"
                    className="custom-input text-xs pl-10"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-dark-950 p-4 rounded-2xl border space-y-2.5 text-xs text-gray-600 dark:text-dark-400">
                <div className="flex justify-between">
                  <span>Base Premium plan price:</span>
                  <span className="font-semibold text-gray-800 dark:text-dark-200">₹{basePrice}</span>
                </div>
                
                {discountMessage && (
                  <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-lg leading-relaxed">
                    {discountMessage}
                  </div>
                )}

                <hr className="border-dashed" />

                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-800 dark:text-dark-100">Calculated Final Due:</span>
                  <span className="text-brand-700 dark:text-brand-405 font-extrabold text-base">₹{finalPrice}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-xs md:text-sm font-extrabold tracking-wide min-h-[48px] uppercase flex items-center justify-center gap-1.5 shadow-md"
              >
                {loading ? 'Processing Transaction...' : `Activate Premium (Pay ₹${finalPrice})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
