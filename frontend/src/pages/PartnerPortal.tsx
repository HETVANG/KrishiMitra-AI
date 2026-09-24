import React, { useState, useEffect } from 'react';
import { Building2, Users, TrendingUp, Link as LinkIcon, Copy, Plus, ShieldCheck, Check } from 'lucide-react';

export const PartnerPortal: React.FC = () => {
  const [partner, setPartner] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Program form
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [programData, setProgramData] = useState({ name: '', description: '', regions: 'Maharashtra' });

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const profileRes = await fetch('/api/partners/me', { headers }).then(r => r.json());
      if (profileRes.success && profileRes.data) {
        const p = profileRes.data;
        setPartner(p);

        const [analyticsRes, programsRes] = await Promise.all([
          fetch(`/api/partners/${p._id || p.id}/analytics`, { headers }).then(r => r.json()),
          fetch(`/api/partners/${p._id || p.id}/programs`, { headers }).then(r => r.json())
        ]);

        if (analyticsRes.success) setAnalytics(analyticsRes.data);
        if (programsRes.success) setPrograms(programsRes.data);
      }
    } catch (err) {
      console.error('Error loading partner workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/register?ref=${partner?.referralCode || 'PARTNER'}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/partners/${partner._id || partner.id}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: programData.name,
          description: programData.description,
          targetRegions: programData.regions.split(',').map(r => r.trim())
        })
      });
      const data = await res.json();
      if (data.success) {
        setProgramModalOpen(false);
        setProgramData({ name: '', description: '', regions: 'Maharashtra' });
        loadPartnerData();
      }
    } catch (err) {
      console.error('Error creating program:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="p-6 max-w-xl mx-auto my-12 text-center space-y-4 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-8 rounded-3xl shadow-sm">
        <Building2 className="w-12 h-12 text-gray-300 dark:text-dark-600 mx-auto" />
        <h2 className="text-base font-bold text-gray-800 dark:text-dark-100">No Partner Profile Linked</h2>
        <p className="text-xs text-gray-500">
          You currently have no partner account linked. Apply to join KrishiMitra AI's partner network.
        </p>
        <a href="/partners/apply" className="inline-block px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md">
          Submit Partner Application
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-extrabold text-xl">
            {partner.organizationName?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-dark-50">{partner.organizationName}</h1>
              <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-full uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {partner.verificationStatus}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-semibold">{partner.partnerType} • Code: {partner.referralCode}</p>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors self-start md:self-auto"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Link Copied!' : 'Copy Partner Referral Link'}
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-5 rounded-3xl">
          <p className="text-xs font-bold text-gray-400 uppercase">Referral Clicks</p>
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-dark-50 mt-1">{analytics?.totalReferrals || 0}</h3>
        </div>
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-5 rounded-3xl">
          <p className="text-xs font-bold text-gray-400 uppercase">Farmer Signups</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{analytics?.signupsCount || 0}</h3>
        </div>
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-5 rounded-3xl">
          <p className="text-xs font-bold text-gray-400 uppercase">Active Farmers</p>
          <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{analytics?.activatedCount || 0}</h3>
        </div>
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-5 rounded-3xl">
          <p className="text-xs font-bold text-gray-400 uppercase">Organizations Onboarded</p>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{analytics?.organizationsOnboardedCount || 0}</h3>
        </div>
      </div>

      {/* Distribution Programs */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50">Partner Distribution Programs</h3>
            <p className="text-xs text-gray-500">Configure regional farmer onboarding and advisory distribution campaigns.</p>
          </div>
          <button
            onClick={() => setProgramModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Program
          </button>
        </div>

        {programs.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">No active distribution programs configured.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((p: any) => (
              <div key={p.id || p._id} className="p-4 border border-gray-100 dark:border-dark-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-dark-100">{p.name}</h4>
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-[10px] font-bold rounded">
                    {p.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">{p.description || 'Regional onboarding campaign.'}</p>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 pt-1">
                  <span>Regions: {(p.targetRegions || []).join(', ') || 'All'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Program Modal */}
      {programModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-dark-50">Create Distribution Program</h3>
            <form onSubmit={handleCreateProgram} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Program Name (e.g. Cotton Advisory Program)"
                value={programData.name}
                onChange={e => setProgramData({ ...programData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-semibold"
              />
              <textarea
                placeholder="Description"
                value={programData.description}
                onChange={e => setProgramData({ ...programData, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-semibold"
              />
              <input
                type="text"
                placeholder="Target Regions (Comma Separated)"
                value={programData.regions}
                onChange={e => setProgramData({ ...programData, regions: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-semibold"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setProgramModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl">Create Program</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
