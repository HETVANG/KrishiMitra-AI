import React, { useState } from 'react';
import { Building2, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PartnerApplication: React.FC = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    legalName: '',
    partnerType: 'FPO',
    description: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    contactPerson: '',
    regions: 'Maharashtra, Karnataka',
    capabilities: ['FARMER_DISTRIBUTION', 'AGRICULTURAL_ADVISORY']
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName.trim()) {
      setError('Organization name is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          legalName: formData.legalName,
          partnerType: formData.partnerType,
          description: formData.description,
          website: formData.website,
          regions: formData.regions.split(',').map(r => r.trim()).filter(Boolean),
          capabilities: formData.capabilities,
          contactInformation: {
            email: formData.contactEmail,
            phone: formData.contactPhone,
            contactPerson: formData.contactPerson
          }
        })
      });
      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Application submission failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCapabilityToggle = (cap: string) => {
    setFormData(prev => {
      const exists = prev.capabilities.includes(cap);
      const updated = exists ? prev.capabilities.filter(c => c !== cap) : [...prev.capabilities, cap];
      return { ...prev, capabilities: updated };
    });
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-xl mx-auto my-12 text-center space-y-4 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-8 rounded-3xl shadow-sm">
        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-dark-50">Partner Application Submitted</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Your application to join KrishiMitra AI's verified ecosystem network has been received. Our administrative team will review your organization details.
        </p>
        <button
          onClick={() => navigate('/partners/portal')}
          className="px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Go to Partner Portal
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-2xl">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-dark-50">Partner Application</h1>
            <p className="text-xs text-gray-500">
              Apply to join KrishiMitra AI's verified agricultural distribution & advisory network.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sahyadri Farmers Producer Co-operative"
              value={formData.organizationName}
              onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-1">
                Partner Type
              </label>
              <select
                value={formData.partnerType}
                onChange={e => setFormData({ ...formData, partnerType: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="FPO">Farmer Producer Organization (FPO)</option>
                <option value="COOPERATIVE">Cooperative</option>
                <option value="AGRICULTURAL_ADVISORY">Agricultural Advisory Agency</option>
                <option value="AGRIBUSINESS">Agribusiness</option>
                <option value="SERVICE_PROVIDER">Agricultural Service Provider</option>
                <option value="EQUIPMENT">Equipment & Machinery Provider</option>
                <option value="STORAGE">Storage & Warehousing Provider</option>
                <option value="LOGISTICS">Logistics Provider</option>
                <option value="RESEARCH">Research / University</option>
                <option value="NGO">NGO / Non-Profit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-1">
                Website
              </label>
              <input
                type="url"
                placeholder="https://example.org"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-1">
              Operating Regions (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Maharashtra, Karnataka, Gujarat"
              value={formData.regions}
              onChange={e => setFormData({ ...formData, regions: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-2">
              Select Organization Capabilities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { id: 'FARMER_DISTRIBUTION', label: 'Farmer Distribution' },
                { id: 'ORGANIZATION_DISTRIBUTION', label: 'Organization Distribution' },
                { id: 'AGRICULTURAL_ADVISORY', label: 'Agricultural Advisory' },
                { id: 'SOIL_SERVICES', label: 'Soil Testing Services' },
                { id: 'STORAGE', label: 'Storage & Warehousing' },
                { id: 'EQUIPMENT_SERVICES', label: 'Equipment & Machinery' }
              ].map(c => {
                const isSelected = formData.capabilities.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCapabilityToggle(c.id)}
                    className={`p-2.5 border rounded-xl text-left text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                        : 'border-gray-200 dark:border-dark-700 text-gray-600 dark:text-dark-300'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-1">
              Organization Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe your organization's mission, member coverage, and agricultural services..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/partners/discover')}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
