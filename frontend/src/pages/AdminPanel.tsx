import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  ShieldAlert, 
  Plus, 
  Coins, 
  Users, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  ClipboardList,
  TrendingUp,
  Activity,
  Award,
  DollarSign
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'schemes' | 'mandi' | 'users' | 'forum'>('analytics');
  
  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Scheme form state
  const [schemeTitle, setSchemeTitle] = useState('');
  const [schemeDesc, setSchemeDesc] = useState('');
  const [schemeBenefits, setSchemeBenefits] = useState('');
  const [schemeCategory, setSchemeCategory] = useState('Income Support');
  const [schemeDeadline, setSchemeDeadline] = useState('');
  const [schemeLink, setSchemeLink] = useState('');
  const [schemeElig, setSchemeElig] = useState('');
  const [schemeDocs, setSchemeDocs] = useState('');

  // Mandi form state
  const [mandiCrop, setMandiCrop] = useState('Wheat');
  const [mandiState, setMandiState] = useState('Haryana');
  const [mandiDistrict, setMandiDistrict] = useState('');
  const [mandiName, setMandiName] = useState('');
  const [mandiMin, setMandiMin] = useState('');
  const [mandiMax, setMandiMax] = useState('');
  const [mandiAvg, setMandiAvg] = useState('');

  // Lists
  const [usersList, setUsersList] = useState<any[]>([]);
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAdminData = async () => {
    setError('');
    
    if (activeTab === 'analytics') {
      setLoadingStats(true);
      try {
        const res = await api.get('/auth/admin/stats');
        if (res.data && res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err: any) {
        console.error('Failed to load stats:', err);
        setError('Failed to load real-time analytics telemetry.');
      } finally {
        setLoadingStats(false);
      }
      return;
    }

    setLoadingList(true);
    try {
      if (activeTab === 'users') {
        const res = await api.get('/appointments/experts');
        if (res.data && res.data.success) {
          setUsersList([
            { id: 1, name: 'Rajesh Kumar', email: 'rajesh@gmail.com', role: 'farmer', phone: '9876543210', plan: 'free' },
            { id: 2, name: 'Dr. Anita Desai', email: 'anita.desai@krishi.com', role: 'expert', phone: '9123456780', plan: 'premium', specialization: 'Plant Pathology' },
            ...res.data.experts.map((e: any) => ({
              id: e._id,
              name: e.name,
              email: e.email,
              role: 'expert',
              phone: e.phone,
              plan: e.plan || 'free',
              specialization: e.expertProfile?.specialization
            }))
          ]);
        }
      } else if (activeTab === 'forum') {
        const res = await api.get('/forum/list');
        if (res.data && res.data.success) {
          setPostsList(res.data.posts);
        }
      }
    } catch (err) {
      console.error('Failed to load admin logs:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeTitle || !schemeDesc || !schemeDeadline) {
      setError('Title, description and deadline are required.');
      return;
    }

    setError('');
    setInfo('');
    setSubmitting(true);

    const eligArray = schemeElig.split(',').map(s => s.trim()).filter(s => s !== '');
    const docsArray = schemeDocs.split(',').map(s => s.trim()).filter(s => s !== '');

    try {
      const res = await api.post('/schemes/create', {
        title: schemeTitle,
        description: schemeDesc,
        eligibility: eligArray,
        benefits: schemeBenefits,
        documentsRequired: docsArray,
        applyLink: schemeLink,
        deadline: schemeDeadline,
        category: schemeCategory,
      });

      if (res.data && res.data.success) {
        setInfo('Government scheme published successfully!');
        setSchemeTitle('');
        setSchemeDesc('');
        setSchemeBenefits('');
        setSchemeDeadline('');
        setSchemeLink('');
        setSchemeElig('');
        setSchemeDocs('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish scheme.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMandi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandiDistrict || !mandiName || !mandiMin || !mandiMax || !mandiAvg) {
      setError('All fields are required.');
      return;
    }

    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const res = await api.post('/market/update', {
        state: mandiState,
        district: mandiDistrict,
        mandiName,
        crop: mandiCrop,
        minPrice: Number(mandiMin),
        maxPrice: Number(mandiMax),
        avgPrice: Number(mandiAvg)
      });

      if (res.data && res.data.success) {
        setInfo('Mandi crop rate updated successfully!');
        setMandiDistrict('');
        setMandiName('');
        setMandiMin('');
        setMandiMax('');
        setMandiAvg('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update mandi price.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await api.delete(`/forum/delete/${postId}`);
      if (res.data && res.data.success) {
        loadAdminData();
      }
    } catch (err) {
      console.error('Failed to moderate post:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldAlert size={28} /> Control Center Admin Panel
          </h1>
          <p className="text-red-100 text-xs md:text-sm mt-1 font-medium">Publish national subsidies schemes, audit mandi prices logs, moderate forum posts, and manage platform users.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white dark:bg-dark-900 p-2 border border-gray-100 dark:border-dark-800/40 rounded-3xl shadow-sm">
        <button
          onClick={() => { setActiveTab('analytics'); setError(''); setInfo(''); }}
          className={`py-3 text-xs md:text-sm font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'analytics' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300'}`}
        >
          <TrendingUp size={16} /> Analytics Hub
        </button>
        <button
          onClick={() => { setActiveTab('schemes'); setError(''); setInfo(''); }}
          className={`py-3 text-xs md:text-sm font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'schemes' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300'}`}
        >
          <Layers size={16} /> Schemes Publisher
        </button>
        <button
          onClick={() => { setActiveTab('mandi'); setError(''); setInfo(''); }}
          className={`py-3 text-xs md:text-sm font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'mandi' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300'}`}
        >
          <Coins size={16} /> Mandi price feeds
        </button>
        <button
          onClick={() => { setActiveTab('users'); setError(''); setInfo(''); }}
          className={`py-3 text-xs md:text-sm font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300'}`}
        >
          <Users size={16} /> Users index
        </button>
        <button
          onClick={() => { setActiveTab('forum'); setError(''); setInfo(''); }}
          className={`py-3 text-xs md:text-sm font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'forum' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 dark:text-dark-300'}`}
        >
          <ClipboardList size={16} /> Moderation Board
        </button>
      </div>

      {/* Feedback alerts */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-655 text-left">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {info && (
        <div className="flex items-start gap-2.5 p-3.5 bg-brand-50 border border-brand-200 rounded-2xl text-xs text-brand-700 text-left">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>{info}</span>
        </div>
      )}

      {/* ACTIVE TABS VIEW */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm">
        
        {/* ANALYTICS HUB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <Activity size={18} className="text-red-500" /> Platform Billing & Subscription Analytics
            </h3>

            {loadingStats ? (
              <div className="flex items-center justify-center py-20 text-red-600">
                <div className="w-10 h-10 border-4 border-t-transparent border-red-500 rounded-full animate-spin"></div>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Metrics grids */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-red-50/20 border border-red-100 p-4 rounded-2xl text-left">
                    <span className="block text-[10px] text-gray-400 font-extrabold uppercase">Total Revenue</span>
                    <span className="block text-2xl font-extrabold text-red-600 mt-1 flex items-center">
                      <DollarSign size={20} />{stats.totalRevenue}
                    </span>
                  </div>
                  <div className="bg-amber-50/20 border border-amber-100 p-4 rounded-2xl text-left">
                    <span className="block text-[10px] text-gray-400 font-extrabold uppercase">Premium Users</span>
                    <span className="block text-2xl font-extrabold text-amber-600 mt-1">{stats.premiumUsers}</span>
                  </div>
                  <div className="bg-blue-50/20 border border-blue-105 p-4 rounded-2xl text-left">
                    <span className="block text-[10px] text-gray-400 font-extrabold uppercase">Trial Users</span>
                    <span className="block text-2xl font-extrabold text-blue-600 mt-1">{stats.trialUsers}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-950 p-4 border rounded-2xl text-left">
                    <span className="block text-[10px] text-gray-400 font-extrabold uppercase">Free Users</span>
                    <span className="block text-2xl font-extrabold text-gray-600 dark:text-dark-300 mt-1">{stats.freeUsers}</span>
                  </div>
                </div>

                {/* Second grids breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Features */}
                  <div className="bg-gray-50/40 dark:bg-dark-950/20 p-5 border border-gray-150 dark:border-dark-850 rounded-3xl space-y-3">
                    <h4 className="font-extrabold text-xs md:text-sm text-gray-800 dark:text-dark-150 flex items-center gap-1">
                      🎯 Most Used Features
                    </h4>
                    <div className="space-y-2">
                      {stats.mostUsedFeatures?.map((feat: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-medium text-gray-600 dark:text-dark-300">{feat.name}</span>
                          <span className="font-bold text-gray-800 dark:text-dark-100 bg-white dark:bg-dark-900 border px-2 py-0.5 rounded">{feat.count} hits</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diseases */}
                  <div className="bg-gray-50/40 dark:bg-dark-950/20 p-5 border border-gray-150 dark:border-dark-850 rounded-3xl space-y-3">
                    <h4 className="font-extrabold text-xs md:text-sm text-gray-800 dark:text-dark-150 flex items-center gap-1">
                      🍁 Most Common Diseases
                    </h4>
                    <div className="space-y-2">
                      {stats.mostCommonDiseases?.map((dis: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-medium text-gray-600 dark:text-dark-300">{dis.name}</span>
                          <span className="font-bold text-red-500 bg-red-50 dark:bg-red-955/20 border border-red-100 px-2 py-0.5 rounded">{dis.count} cases</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Crops */}
                  <div className="bg-gray-50/40 dark:bg-dark-950/20 p-5 border border-gray-150 dark:border-dark-850 rounded-3xl space-y-3">
                    <h4 className="font-extrabold text-xs md:text-sm text-gray-800 dark:text-dark-150 flex items-center gap-1">
                      🌾 Popular Sown Crops
                    </h4>
                    <div className="space-y-2">
                      {stats.mostPopularCrops?.map((crop: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-medium text-gray-600 dark:text-dark-300">{crop.name}</span>
                          <span className="font-bold text-brand-700 bg-brand-50/50 border border-brand-100 px-2 py-0.5 rounded">{crop.count} fields</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-10 text-xs text-gray-400">Failed to render telemetry logs.</p>
            )}
          </div>
        )}

        {/* SCHEMES PUBLISHER */}
        {activeTab === 'schemes' && (
          <form onSubmit={handleCreateScheme} className="space-y-4 text-left">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <Plus size={18} className="text-red-500" /> Publish Subsidy / Scheme
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Scheme Title</label>
                <input
                  type="text"
                  required
                  value={schemeTitle}
                  onChange={(e) => setSchemeTitle(e.target.value)}
                  placeholder="e.g. Subsidized Solar Water Pump Scheme 2026"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Category</label>
                <select
                  value={schemeCategory}
                  onChange={(e) => setSchemeCategory(e.target.value)}
                  className="custom-input text-sm"
                >
                  <option value="Income Support">Income Support</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Subsidies">Subsidies</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Benefits Description</label>
              <input
                type="text"
                required
                value={schemeBenefits}
                onChange={(e) => setSchemeBenefits(e.target.value)}
                placeholder="e.g. 75% financial subsidy on solar pumping systems up to 5HP"
                className="custom-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Detailed Description</label>
              <textarea
                required
                value={schemeDesc}
                onChange={(e) => setSchemeDesc(e.target.value)}
                placeholder="Describe details, features, eligibility definitions..."
                className="custom-input h-24 resize-none py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Eligibility Criteria (comma separated)</label>
                <input
                  type="text"
                  value={schemeElig}
                  onChange={(e) => setSchemeElig(e.target.value)}
                  placeholder="e.g. Must be resident, Max land 5 acres"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Required Documents (comma separated)</label>
                <input
                  type="text"
                  value={schemeDocs}
                  onChange={(e) => setSchemeDocs(e.target.value)}
                  placeholder="e.g. Aadhaar Card, Land records, Bank Book"
                  className="custom-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Official Portal Apply URL</label>
                <input
                  type="url"
                  value={schemeLink}
                  onChange={(e) => setSchemeLink(e.target.value)}
                  placeholder="https://subsidy.gov.in"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Application Deadline Date</label>
                <input
                  type="date"
                  required
                  value={schemeDeadline}
                  onChange={(e) => setSchemeDeadline(e.target.value)}
                  className="custom-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 text-white font-bold rounded-xl text-xs md:text-sm shadow-md flex items-center justify-center shrink-0 w-full transition-colors duration-150"
            >
              {submitting ? 'Publishing...' : 'Publish Government Scheme'}
            </button>
          </form>
        )}

        {/* MANDI FEEDS */}
        {activeTab === 'mandi' && (
          <form onSubmit={handleUpdateMandi} className="space-y-4 text-left">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <Plus size={18} className="text-red-500" /> Update Mandi Crop Price
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Crop Commodity</label>
                <select
                  value={mandiCrop}
                  onChange={(e) => setMandiCrop(e.target.value)}
                  className="custom-input text-sm"
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Paddy">Paddy</option>
                  <option value="Rice (Basmati)">Rice (Basmati)</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Potato">Potato</option>
                  <option value="Onion">Onion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">State</label>
                <select
                  value={mandiState}
                  onChange={(e) => setMandiState(e.target.value)}
                  className="custom-input text-sm"
                >
                  <option value="Haryana">Haryana</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">District</label>
                <input
                  type="text"
                  required
                  value={mandiDistrict}
                  onChange={(e) => setMandiDistrict(e.target.value)}
                  placeholder="e.g. Karnal, Rajkot"
                  className="custom-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Mandi Name</label>
                <input
                  type="text"
                  required
                  value={mandiName}
                  onChange={(e) => setMandiName(e.target.value)}
                  placeholder="e.g. Karnal Mandi"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Min Rate (₹/Qtl)</label>
                <input
                  type="number"
                  required
                  value={mandiMin}
                  onChange={(e) => setMandiMin(e.target.value)}
                  placeholder="2100"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Max Rate (₹/Qtl)</label>
                <input
                  type="number"
                  required
                  value={mandiMax}
                  onChange={(e) => setMandiMax(e.target.value)}
                  placeholder="2300"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Avg Rate (₹/Qtl)</label>
                <input
                  type="number"
                  required
                  value={mandiAvg}
                  onChange={(e) => setMandiAvg(e.target.value)}
                  placeholder="2200"
                  className="custom-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 text-white font-bold rounded-xl text-xs md:text-sm shadow-md flex items-center justify-center shrink-0 w-full transition-colors duration-150"
            >
              {submitting ? 'Updating...' : 'Publish Mandi Rate Log'}
            </button>
          </form>
        )}

        {/* USERS INDEX */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <Users size={18} className="text-red-500" /> Platform Registered Users Index
            </h3>

            {loadingList ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-3 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="border border-gray-150 dark:border-dark-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-dark-800 text-gray-500 font-bold border-b border-gray-150">
                    <tr>
                      <th className="p-3">User Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Mobile No</th>
                      <th className="p-3">Active Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-dark-800/40">
                    {usersList.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-850/10">
                        <td className="p-3 font-bold text-gray-800 dark:text-dark-200">{item.name}</td>
                        <td className="p-3 text-gray-500 font-medium">{item.email}</td>
                        <td className="p-3 capitalize font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${item.role === 'expert' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' : 'bg-brand-50 text-brand-700 dark:bg-brand-950/20'}`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">{item.phone || '-'}</td>
                        <td className="p-3 text-gray-400 font-extrabold capitalize">{item.plan || 'free'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODERATION BOARD */}
        {activeTab === 'forum' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-dark-850">
              <ClipboardList size={18} className="text-red-500" /> Community Forum Moderation Queue
            </h3>

            {loadingList ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-3 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
              </div>
            ) : postsList.length > 0 ? (
              <div className="space-y-3">
                {postsList.map((post) => (
                  <div 
                    key={post._id}
                    className="p-4 bg-gray-50/50 dark:bg-dark-850/20 border border-gray-150 dark:border-dark-800/40 rounded-2xl flex items-center justify-between gap-4 text-left"
                  >
                    <div>
                      <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-200">{post.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Author: {post.author?.name} | Sown: {new Date(post.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-xl transition-colors shrink-0"
                      title="Moderate & Delete Thread"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-xs text-gray-405 italic">No forum threads logged in the moderation queue.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
