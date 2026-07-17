import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Mail, Lock, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1.5 font-medium">Please enter your credentials to access your account</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs md:text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

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

