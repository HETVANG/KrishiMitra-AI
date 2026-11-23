import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Sprout, User, Mail, Lock, Phone, UserCheck, Stethoscope, Briefcase, IndianRupee, AlertCircle, Loader2 } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Register: React.FC = () => {
  const { register, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectParam = searchParams.get('redirect');

  const getSafeRedirectPath = (param: string | null): string => {
    if (!param) return '/dashboard';
    if (param.startsWith('/') && !param.startsWith('//') && !param.includes('\\')) {
      return param;
    }
    return '/dashboard';
  };

  useEffect(() => {
    if (token) {
      navigate(getSafeRedirectPath(redirectParam), { replace: true });
    }
  }, [token, redirectParam, navigate]);

  const [role, setRole] = useState<'farmer' | 'expert'>('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const refParam = searchParams.get('ref');
  const [referralCode, setReferralCode] = useState(() => {
    return refParam || localStorage.getItem('pendingReferralCode') || '';
  });

  useEffect(() => {
    if (refParam) {
      setReferralCode(refParam);
      localStorage.setItem('pendingReferralCode', refParam);
    }
  }, [refParam]);

  // Expert fields
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  // Legal Consent & Marketing opt-in (DPDP Act 2023)
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);
    setSlowNotice(false);

    // Warm-up notice if server takes > 2.5s (e.g. Render cold start)
    const slowTimer = setTimeout(() => {
      setSlowNotice(true);
    }, 2500);

    const payload: any = {
      name,
      email,
      password,
      phone,
      role,
      referralCode: referralCode ? referralCode.trim() : undefined,
      marketingConsent,
    };

    if (role === 'expert') {
      payload.expertProfile = {
        specialization,
        experienceYears: Number(experienceYears),
        bio,
        consultationFee: Number(consultationFee) || 0,
        isAvailable: true,
      };
    }

    try {
      await register(payload);
      localStorage.removeItem('pendingReferralCode');
      navigate(getSafeRedirectPath(redirectParam), { replace: true });
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError(t('auth.timeout_error') || 'Server connection timed out. The server may be waking up from sleep. Please wait a moment and try again.');
      } else if (!err.response) {
        setError(t('auth.network_error') || 'Unable to connect to server. Please verify your internet connection or try again in a few moments.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please check details.');
      }
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowNotice(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-950 safe-area-pt safe-area-pb">
      {/* visual banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1470')` }}>
        <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-[2px]" />
        <div className="absolute bottom-16 left-16 right-16 z-20 text-white">
          <div className="mb-4">
            <BrandLogo variant="full" size="lg" className="text-white" />
          </div>
          <h2 className="font-black text-3xl md:text-4xl mb-4 leading-tight">Start Cultivating with Smarter Insights.</h2>
          <p className="text-brand-100 font-medium max-w-md">Connect with top agriculture experts, track daily mandi crops pricing, analyze soil chemistry, and consult our multi-lingual agronomy AI.</p>
        </div>
      </div>

      {/* form container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200/80 dark:border-dark-800/30 my-8">
          <div className="text-center mb-6">
            <div className="inline-flex lg:hidden mb-4 justify-center">
              <BrandLogo variant="full" size="md" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-dark-100 tracking-tight">
              {t('auth.register_title') || 'Create Farmer Account'}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-dark-400 mt-1.5 font-medium">
              {t('auth.register_subtitle') || 'Join thousands of farmers making smarter, data-driven agricultural decisions.'}
            </p>
          </div>

          {/* Role selector tab */}
          <div className="grid grid-cols-2 bg-gray-50 dark:bg-dark-800/50 p-1 rounded-xl border border-gray-200/40 dark:border-dark-800 mb-6">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${role === 'farmer' ? 'bg-white dark:bg-dark-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-500 dark:text-dark-400'}`}
            >
              {t('common.farmer') || 'I am a Farmer'}
            </button>
            <button
              type="button"
              onClick={() => setRole('expert')}
              className={`py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${role === 'expert' ? 'bg-white dark:bg-dark-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-500 dark:text-dark-400'}`}
            >
              {t('common.expert') || 'I am an Expert'}
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs md:text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Core Fields */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">
                {t('auth.name') || 'Full Name'}
              </label>
              <div className="flex h-12 w-full items-center rounded-lg border border-gray-200 bg-white/50 px-4 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand-500">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="h-full flex-1 border-0 bg-transparent py-0 pl-2 pr-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">
                {t('auth.email') || 'Email Address'}
              </label>
              <div className="flex h-12 w-full items-center rounded-lg border border-gray-200 bg-white/50 px-4 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand-500">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@farm.com"
                  className="h-full flex-1 border-0 bg-transparent py-0 pl-2 pr-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">
                {t('auth.phone') || 'Mobile Number'}
              </label>
              <div className="flex h-12 w-full items-center rounded-lg border border-gray-200 bg-white/50 px-4 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand-500">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="h-full flex-1 border-0 bg-transparent py-0 pl-2 pr-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">
                {t('auth.password') || 'Create Password'}
              </label>
              <div className="flex h-12 w-full items-center rounded-lg border border-gray-200 bg-white/50 px-4 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand-500">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-full flex-1 border-0 bg-transparent py-0 pl-2 pr-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600"
                />
              </div>
            </div>

            {/* EXPERT SPECIFIC FIELDS */}
            {role === 'expert' && (
              <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-dark-800">
                <p className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">
                  {t('auth.expert_details') || 'Expert Profile Details'}
                </p>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">
                    {t('auth.specialization') || 'Specialization'}
                  </label>
                  <div className="flex h-12 w-full items-center rounded-lg border border-gray-200 bg-white/50 px-4 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand-500">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400">
                      <Stethoscope size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Agronomy, Plant Pathology"
                      className="h-full flex-1 border-0 bg-transparent py-0 pl-2 pr-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">
                      {t('auth.experience_years') || 'Years of Exp'}
                    </label>
                    <div className="flex h-12 w-full items-center rounded-lg border border-gray-200 bg-white/50 px-4 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand-500">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400">
                        <Briefcase size={16} />
                      </div>
                      <input
                        type="number"
                        required
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="5"
                        className="h-full flex-1 border-0 bg-transparent py-0 pl-2 pr-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">
                      {t('experts.fee') || 'Fee (per session)'}
                    </label>
                    <div className="flex h-12 w-full items-center rounded-lg border border-gray-200 bg-white/50 px-4 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand-500">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400">
                        <IndianRupee size={16} />
                      </div>
                      <input
                        type="number"
                        required
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        placeholder="200"
                        className="h-full flex-1 border-0 bg-transparent py-0 pl-2 pr-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">
                    {t('experts.bio') || 'Professional Bio'}
                  </label>
                  <textarea
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your background, degrees, and consulting expertise..."
                    className="custom-input h-20 resize-none py-2"
                  />
                </div>
              </div>
            )}

            {/* Optional Referral Code Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  {t('auth.referral_code') || 'Referral Code (Optional)'}
                </label>
                {referralCode && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {t('auth.referral_applied') || 'Code Applied'}
                  </span>
                )}
              </div>
              <div className="flex h-12 w-full items-center rounded-lg border border-gray-200 bg-white/50 px-4 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand-500">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400">
                  <UserCheck size={16} />
                </div>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase();
                    setReferralCode(code);
                    if (code) {
                      localStorage.setItem('pendingReferralCode', code);
                    } else {
                      localStorage.removeItem('pendingReferralCode');
                    }
                  }}
                  placeholder={t('auth.referral_code_placeholder') || 'e.g. TK-6BF912'}
                  className="h-full flex-1 border-0 bg-transparent py-0 pl-2 pr-3 text-sm font-mono leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600 uppercase"
                />
              </div>
            </div>

            {/* Legal & Privacy Consent Notices */}
            <div className="space-y-2.5 pt-2 text-left">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms-consent"
                  required
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-dark-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="terms-consent" className="text-xs text-slate-600 dark:text-dark-300 cursor-pointer select-none">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold underline hover:text-brand-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold underline hover:text-brand-700">
                    Privacy Policy
                  </Link>.*
                </label>
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="marketing-consent"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-dark-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="marketing-consent" className="text-xs text-slate-500 dark:text-dark-400 cursor-pointer select-none">
                  (Optional) I agree to receive agricultural advisory updates and seasonal mandi alerts. You can withdraw consent anytime via{' '}
                  <Link to="/unsubscribe" target="_blank" className="text-brand-600 dark:text-brand-400 underline">
                    Unsubscribe
                  </Link>{' '}
                  or Settings.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !termsAgreed}
              className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin shrink-0" />
                  <span>{t('common.loading') || 'Creating Account...'}</span>
                </>
              ) : (
                <span>{t('auth.create_account') || 'Create Account'}</span>
              )}
            </button>

            {/* Connecting status notice during cold start / slow connection */}
            {loading && slowNotice && (
              <p className="text-xs text-center text-slate-500 dark:text-dark-400 animate-pulse pt-1">
                {t('auth.connecting_server') || 'Connecting to secure agricultural server, please wait...'}
              </p>
            )}
          </form>

          {/* Bottom redirection */}
          <div className="mt-6 text-center text-xs md:text-sm text-gray-500 dark:text-dark-400 border-t border-gray-100 dark:border-dark-800/50 pt-4">
            <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              {t('auth.have_account') || 'Already have an account? Sign In'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
