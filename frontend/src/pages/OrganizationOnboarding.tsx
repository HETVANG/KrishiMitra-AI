import React, { useState } from 'react';
import { Building2, Check, ArrowRight, Shield, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OrganizationOnboarding: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    type: 'FPO',
    description: '',
    country: 'India',
    countryCode: 'IN',
    region: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    measurementSystem: 'metric'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Organization name is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        navigate(`/organizations/${data.data.id}`);
      } else {
        setError(data.error || 'Failed to create organization.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-2xl">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-dark-50">Create New Organization</h1>
            <p className="text-xs text-gray-500">
              Set up a multi-farm workspace for your FPO, cooperative, or agribusiness.
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
              placeholder="e.g. Green Valley Farmers Producer Co."
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-1">
                Legal Entity Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Registered Private Limited or Co-op Name"
                value={formData.legalName}
                onChange={e => setFormData({ ...formData, legalName: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-1">
                Organization Type
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="FPO">Farmer Producer Organization (FPO)</option>
                <option value="COOPERATIVE">Agricultural Cooperative</option>
                <option value="AGRIBUSINESS">Agribusiness Enterprise</option>
                <option value="ENTERPRISE_FARM">Enterprise Farm Group</option>
                <option value="ADVISORY">Agronomist & Advisory Agency</option>
                <option value="RESEARCH">Research Institution</option>
                <option value="NGO">Non-Governmental Organization (NGO)</option>
                <option value="SERVICE_PROVIDER">Agricultural Service Provider</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief overview of operations, member farmers, or regional coverage..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-1">
                State / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={formData.region}
                onChange={e => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-dark-200 mb-1">
                Currency & Units
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-1/2 px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-dark-50 focus:outline-none"
                />
                <select
                  value={formData.measurementSystem}
                  onChange={e => setFormData({ ...formData, measurementSystem: e.target.value })}
                  className="w-1/2 px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-dark-50 focus:outline-none"
                >
                  <option value="metric">Metric (Hectares, Kg)</option>
                  <option value="imperial">Imperial (Acres, Lbs)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/organizations')}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-dark-300 dark:hover:text-dark-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Initialize Organization'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
