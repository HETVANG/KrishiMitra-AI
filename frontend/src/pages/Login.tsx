import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Phone, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const Login: React.FC = () => {
  const { login, token } = useAuth();
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

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submit

    setError('');

    const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');

    if (!cleanPhone) {
      setError(t('auth.mobile_required') || 'Please enter your mobile number.');
      return;
    }

    // Indian mobile number validation (+91 support, 10 digits starting with 6, 7, 8, or 9)
    const indianMobileRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
    if (!indianMobileRegex.test(cleanPhone)) {
      setError(t('auth.invalid_mobile') || 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    if (!password) {
      setError(t('auth.password_required') || 'Please enter your password.');
      return;
    }

    // Extract core 10 digits for clean delivery to authentication service
    const normalizedPhone = cleanPhone.startsWith('+91')
      ? cleanPhone.slice(3)
      : (cleanPhone.startsWith('91') && cleanPhone.length === 12)
      ? cleanPhone.slice(2)
      : (cleanPhone.startsWith('0') && cleanPhone.length === 11)
      ? cleanPhone.slice(1)
      : cleanPhone;

    setLoading(true);
    setSlowNotice(false);

    // Warm-up / cold-start notice timer if server response takes > 2.5s
    const slowTimer = setTimeout(() => {
      setSlowNotice(true);
    }, 2500);

    try {
      await login(normalizedPhone, password);
      navigate(getSafeRedirectPath(redirectParam), { replace: true });
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError(t('auth.timeout_error') || 'Server connection timed out. The server may be waking up from sleep. Please wait a moment and try again.');
      } else if (!err.response) {
        setError(t('auth.network_error') || 'Unable to connect to server. Please verify your internet connection or try again in a few moments.');
      } else if (err.response?.status === 400 && (err.response?.data?.code === 'INVALID_RESOURCE_IDENTIFIER' || err.response?.data?.message?.includes('resource identifier'))) {
        setError(t('auth.invalid_credentials') || 'Invalid mobile number or password.');
      } else {
        setError(err.response?.data?.message || t('auth.invalid_credentials') || 'Invalid mobile number or password.');
      }
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowNotice(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-950 safe-area-pt safe-area-pb">
      {/* Visual Banner on Left (Desktop & Tablets ≥ 1024px) */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" 
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1470')` }}
      >
        <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-[2px]" />

        <div className="absolute bottom-16 left-16 right-16 z-20 text-white">
          <div className="mb-6">
            <BrandLogo variant="full" size="lg" className="text-white" />
          </div>
          <h2 className="font-black text-3xl md:text-4xl mb-4 leading-tight">
            Empowering Indian Farmers with Smart Agricultural Intelligence.
          </h2>
          <p className="text-brand-100 font-medium max-w-md text-sm md:text-base leading-relaxed">
            Access hyper-local weather forecast, diagnose crop diseases, verify APMC mandi prices, check eligible subsidies, and consult agronomy experts.
          </p>
        </div>
      </div>

      {/* Form Area on Right (All Viewports) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200/80 dark:border-dark-800/50 my-auto">
          
          {/* 1-3. Official Branding Block */}
          <div className="flex flex-col items-center text-center select-none mb-6">
            {/* 1. Official The Khedut logo artwork */}
            <div className="flex items-center justify-center mb-2">
              <img
                src="/brand/the-khedut-symbol.png"
                alt="The Khedut"
                className="h-16 sm:h-20 w-auto object-contain shrink-0 transition-transform duration-200"
                loading="eager"
              />
            </div>

            {/* 2. The Khedut brand name */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-dark-100 tracking-tight">
              The Khedut
            </h1>

            {/* 3. Tagline: Centered directly underneath brand name with brand green styling */}
            <p className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-brand-700 dark:text-brand-400 mt-1">
              {BRAND.tagline.toUpperCase()}
            </p>
          </div>

          {/* Visual Separation Between Branding and Authentication Form */}
          <div className="border-t border-slate-200/70 dark:border-dark-800/70 mb-6" />

          {/* 4-5. Authentication Form Heading & Supporting Description */}
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-dark-100 tracking-tight">
              {t('auth.login_title') || 'Sign In to The Khedut'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-400 mt-1.5 font-medium">
              {t('auth.login_subtitle') || 'Please enter your mobile number and password to access your farm'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs md:text-sm text-red-600 dark:text-red-400 animate-fadeIn">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 6-8. Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Mobile Number Field */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">
                {t('auth.phone') || 'Mobile Number'}
              </label>
              <div className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/70 px-3 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                <div className="flex items-center gap-1.5 pr-2.5 mr-1 border-r border-gray-200 dark:border-dark-700 text-xs font-bold text-slate-700 dark:text-dark-300 select-none shrink-0">
                  <Phone size={15} className="text-gray-400 dark:text-dark-500 shrink-0" />
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    let val = e.target.value;
                    // Auto-strip leading +91, 91, or 0 if pasted
                    if (val.startsWith('+91')) {
                      val = val.slice(3).trim();
                    } else if (val.startsWith('91') && val.length > 10) {
                      val = val.slice(2).trim();
                    } else if (val.startsWith('0') && val.length > 10) {
                      val = val.slice(1).trim();
                    }
                    val = val.replace(/\D/g, '');
                    if (val.length <= 10) {
                      setPhone(val);
                    }
                  }}
                  placeholder="10-digit mobile number"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent py-0 px-2 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600 font-medium tracking-wide"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">
                {t('auth.password') || 'Password'}
              </label>
              <div className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/70 px-3 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                <div className="flex h-10 w-7 shrink-0 items-center justify-center text-gray-400 dark:text-dark-500">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent py-0 px-2 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="flex h-10 w-8 shrink-0 items-center justify-center text-gray-400 hover:text-gray-600 dark:text-dark-500 dark:hover:text-dark-300 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In Button with loading spinner & disabled state */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 font-bold text-sm min-h-[44px] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin shrink-0" />
                  <span>{t('auth.signing_in') || 'Signing in...'}</span>
                </>
              ) : (
                <span>{t('auth.sign_in') || 'Sign In'}</span>
              )}
            </button>

            {/* Connecting status notice during cold start / slow connection */}
            {loading && slowNotice && (
              <p className="text-xs text-center text-slate-500 dark:text-dark-400 animate-pulse pt-1">
                {t('auth.connecting_server') || 'Connecting to secure agricultural server, please wait...'}
              </p>
            )}
          </form>

          {/* Registration Link */}
          <div className="mt-8 text-center text-xs md:text-sm text-gray-500 dark:text-dark-400 border-t border-gray-100 dark:border-dark-800/50 pt-5">
            <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              {t('auth.dont_have_account') || "Don't have an account? Register now"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
