import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, User, Mail, Lock, Phone, UserCheck, Stethoscope, Briefcase, IndianRupee, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'farmer' | 'expert'>('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Expert fields
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload: any = {
      name,
      email,
      password,
      phone,
      role,
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
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-950">
      {/* visual banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1470')` }}>
        <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-[2px]" />
        <div className="absolute bottom-16 left-16 right-16 z-20 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-lg">
              <Sprout size={28} />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tight">KrishiMitra AI</h1>
          </div>
          <h2 className="font-extrabold text-4xl mb-4 leading-tight">Start Cultivating with Smarter Insights.</h2>
          <p className="text-brand-100 font-medium max-w-md">Connect with top agriculture experts, track daily mandi crops pricing, analyze soil chemistry, and query our multi-lingual generative AI model.</p>
        </div>
      </div>

      {/* form container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-dark-800/30 my-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-dark-100 tracking-tight">Create Account</h2>
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1.5">Join the digital farming community today</p>
          </div>

          {/* Role selector tab */}
          <div className="grid grid-cols-2 bg-gray-50 dark:bg-dark-800/50 p-1 rounded-xl border border-gray-200/40 dark:border-dark-800 mb-6">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${role === 'farmer' ? 'bg-white dark:bg-dark-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-500 dark:text-dark-400'}`}
            >
              I am a Farmer
            </button>
            <button
              type="button"
              onClick={() => setRole('expert')}
              className={`py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${role === 'expert' ? 'bg-white dark:bg-dark-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-500 dark:text-dark-400'}`}
            >
              I am an Expert
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
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="custom-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@farm.com"
                  className="custom-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="custom-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">Create Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="custom-input pl-10"
                />
              </div>
            </div>

            {/* EXPERT SPECIFIC FIELDS */}
            {role === 'expert' && (
              <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-dark-800">
                <p className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">Expert Profile Details</p>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">Specialization</label>
                  <div className="relative">
                    <Stethoscope size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Agronomy, Plant Pathology"
                      className="custom-input pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">Years of Exp</label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="number"
                        required
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="5"
                        className="custom-input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">Fee (per session)</label>
                    <div className="relative">
                      <IndianRupee size={16} className="absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="number"
                        required
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        placeholder="200"
                        className="custom-input pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1">Professional Bio</label>
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-4"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Bottom redirection */}
          <div className="mt-6 text-center text-xs md:text-sm text-gray-500 dark:text-dark-400 border-t border-gray-100 dark:border-dark-800/50 pt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
