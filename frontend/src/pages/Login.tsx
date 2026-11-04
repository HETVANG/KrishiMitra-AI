import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submit

    setError('');
    setLoading(true);
    setSlowNotice(false);

    // Warm-up / cold-start notice timer if server response takes > 2.5s
    const slowTimer = setTimeout(() => {
      setSlowNotice(true);
    }, 2500);

    try {
      await login(email, password);
      navigate(getSafeRedirectPath(redirectParam), { replace: true });
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError(t('auth.timeout_error') || 'Server connection timed out. Please check your network and try again.');
      } else if (!err.response) {
        setError(t('auth.network_error') || 'Network error. Please verify your internet connection.');
      } else {
        setError(err.response?.data?.message || t('auth.invalid_credentials') || 'Invalid email or password.');
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
              {t('auth.login_subtitle') || 'Please enter your credentials to access your farm'}
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
            {/* 6. Email Field */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">
                {t('auth.email') || 'Email Address'}
              </label>
              <div className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/70 px-4 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400 dark:text-dark-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@farm.com"
                  className="h-full flex-1 border-0 bg-transparent py-0 pl-2 pr-3 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600"
                />
              </div>
            </div>

            {/* 7. Password Field */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">
                {t('auth.password') || 'Password'}
              </label>
              <div className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/70 px-4 transition-all duration-200 dark:border-dark-800 dark:bg-dark-900/50 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400 dark:text-dark-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-full flex-1 border-0 bg-transparent py-0 pl-2 pr-3 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-dark-50 dark:placeholder:text-dark-600"
                />
              </div>
            </div>

            {/* 8. Sign In Button with loading spinner & disabled state */}
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

          {/* 9. Registration Link */}
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
