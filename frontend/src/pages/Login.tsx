import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Mail, Lock, Phone, MessageSquareCode, Chrome, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, googleLogin, otpLogin } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'email' | 'otp' | 'google'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [name, setName] = useState(''); // For registration via OTP
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulate sending SMS OTP
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setInfo('Verification code sent! Use code 123456 to login.');
    }, 1200);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await otpLogin(phone, otp, name);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMockLogin = async () => {
    setError('');
    setLoading(true);
    // Simulate Google account chooser
    setTimeout(async () => {
      try {
        const dummyProfile = {
          email: 'farmer_rajesh@gmail.com',
          name: 'Rajesh Kumar',
          googleId: 'g_oauth_123456789',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        };
        await googleLogin(dummyProfile);
        setLoading(false);
        navigate('/');
      } catch (err: any) {
        setError('Google login failed.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-950">
      {/* Visual Banner on Left */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1470')` }}>
        <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-[2px]" />
        <div className="absolute bottom-16 left-16 right-16 z-20 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-lg">
              <Sprout size={28} />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tight">KrishiMitra AI</h1>
          </div>
          <h2 className="font-extrabold text-4xl mb-4 leading-tight">Empowering Indian Farmers with Smart Agricultural AI.</h2>
          <p className="text-brand-100 font-medium max-w-md">Access hyper-local weather forecast, identify leaf diseases using image scan, verify mandi prices, check eligible subsidies, and chat with AI experts instantly.</p>
        </div>
      </div>

      {/* Form Area on Right */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-dark-800/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex lg:hidden items-center justify-center w-12 h-12 bg-brand-500 rounded-2xl text-white mb-3 shadow-md shadow-brand-500/20">
              <Sprout size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-dark-100 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1.5 font-medium">Choose your preferred login mode</p>
          </div>

          {/* Toggle Tabs */}
          <div className="grid grid-cols-3 bg-gray-50 dark:bg-dark-800/50 p-1.5 rounded-xl border border-gray-200/40 dark:border-dark-800 mb-6">
            <button
              onClick={() => { setAuthMode('email'); setError(''); }}
              className={`py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${authMode === 'email' ? 'bg-white dark:bg-dark-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-500 dark:text-dark-400'}`}
            >
              Email
            </button>
            <button
              onClick={() => { setAuthMode('otp'); setError(''); }}
              className={`py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${authMode === 'otp' ? 'bg-white dark:bg-dark-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-500 dark:text-dark-400'}`}
            >
              SMS OTP
            </button>
            <button
              onClick={() => { setAuthMode('google'); setError(''); }}
              className={`py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${authMode === 'google' ? 'bg-white dark:bg-dark-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-500 dark:text-dark-400'}`}
            >
              Social
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs md:text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-brand-50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-900/30 rounded-xl text-xs md:text-sm text-brand-700 dark:text-brand-400">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          {/* EMAIL MODE */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@farm.com"
                    className="custom-input pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="custom-input pl-11"
                  />
                </div>
              </div>

              <div className="text-right">
                <a href="#" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 mt-2"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* OTP MODE */}
          {authMode === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="custom-input pl-11"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 mt-2"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP Verification Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">Full Name (New User)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name (Optional)"
                      className="custom-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">6-Digit Verification Code</label>
                    <div className="relative">
                      <MessageSquareCode size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="custom-input pl-11 tracking-[0.3em] font-mono text-center font-bold text-lg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="btn-secondary w-1/3 py-3"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-2/3 py-3 animate-bounce"
                    >
                      {loading ? 'Verifying...' : 'Verify & Log In'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* SOCIAL MODE */}
          {authMode === 'google' && (
            <div className="space-y-4 text-center py-4">
              <p className="text-xs text-gray-400 font-bold uppercase mb-4 tracking-widest">Connect with Social Account</p>
              
              <button
                type="button"
                onClick={handleGoogleMockLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-gray-200 dark:border-dark-800 rounded-xl bg-white dark:bg-dark-900 text-gray-700 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800/50 font-bold transition-all duration-200 shadow-sm"
              >
                <Chrome size={18} className="text-red-500" />
                <span>Continue with Google</span>
              </button>

              <p className="text-xs text-gray-400 dark:text-dark-500 px-4 mt-6 leading-relaxed">By logging in, you agree to our terms of service and consent to receive soil health data and advisory weather alerts.</p>
            </div>
          )}

          {/* Bottom Link */}
          <div className="mt-8 text-center text-xs md:text-sm text-gray-500 dark:text-dark-400 border-t border-gray-100 dark:border-dark-800/50 pt-5">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
