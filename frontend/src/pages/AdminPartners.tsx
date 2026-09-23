import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Building2, ShieldCheck, Plus, RefreshCw, Globe, CheckCircle2, AlertCircle, FileText, User } from 'lucide-react';

export interface PartnerItem {
  _id: string;
  organizationName: string;
  partnerType: string;
  description: string;
  status: string;
  countries: string[];
  regions: string[];
  capabilities: string[];
  website?: string;
  contactInformation?: {
    email?: string;
    phone?: string;
    contactPerson?: string;
  };
  verificationStatus: string;
  createdAt: string;
}

export const AdminPartners: React.FC = () => {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    partnerType: 'AGRICULTURAL_ORGANIZATION',
    description: '',
    website: '',
    email: '',
    contactPerson: ''
  });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/partners?country=IN');
      if (res.data && res.data.partners) {
        setPartners(res.data.partners);
      }
    } catch (err) {
      console.warn('[AdminPartners] Fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/partners', {
        organizationName: formData.organizationName,
        partnerType: formData.partnerType,
        description: formData.description,
        website: formData.website,
        contactInformation: {
          email: formData.email,
          contactPerson: formData.contactPerson
        }
      });
      setShowModal(false);
      setFormData({
        organizationName: '',
        partnerType: 'AGRICULTURAL_ORGANIZATION',
        description: '',
        website: '',
        email: '',
        contactPerson: ''
      });
      fetchPartners();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record partner');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" /> Strategic Relationships
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-dark-100">
            Agricultural Partner Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
            Official partner organizations, research agreements, government data sources, and agricultural networks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPartners}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-700 dark:text-dark-200 font-bold text-xs rounded-2xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Partner Record
          </button>
        </div>
      </div>

      {/* Partner List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl p-12 text-center text-gray-500">
          <Building2 className="w-10 h-10 mx-auto text-gray-300 dark:text-dark-600 mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-dark-200">No partner records created yet</h3>
          <p className="text-xs text-gray-500 mt-1">
            Official strategic partners can be added using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map(p => (
            <div
              key={p._id}
              className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 p-5 rounded-3xl shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                  {p.partnerType.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400 text-[10px] font-extrabold rounded-full border border-brand-200">
                  {p.verificationStatus}
                </span>
              </div>

              <h3 className="text-base font-black text-gray-900 dark:text-dark-100 mb-1">
                {p.organizationName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-dark-400 mb-4 leading-relaxed">
                {p.description || 'No description provided.'}
              </p>

              <div className="pt-3 border-t border-gray-100 dark:border-dark-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-dark-400">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span>Coverage: <strong className="text-gray-800 dark:text-dark-100">{p.countries?.join(', ') || 'IN'}</strong></span>
                </div>
                {p.contactInformation?.contactPerson && (
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>{p.contactInformation.contactPerson}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-dark-100">Add Agricultural Partner</h3>

            <form onSubmit={handleCreatePartner} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-dark-300 block mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={formData.organizationName}
                  onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="e.g. ICAR Research Station"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-dark-300 block mb-1">Partner Type</label>
                <select
                  value={formData.partnerType}
                  onChange={e => setFormData({ ...formData, partnerType: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-medium"
                >
                  <option value="AGRICULTURAL_ORGANIZATION">Agricultural Organization</option>
                  <option value="RESEARCH_INSTITUTION">Research Institution</option>
                  <option value="DATA_PROVIDER">Data Provider</option>
                  <option value="GOVERNMENT_DATA_SOURCE">Government Data Source</option>
                  <option value="EXPERT_NETWORK">Expert Network</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-dark-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of partnership scope..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-dark-300 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-dark-300 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-800 border rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
