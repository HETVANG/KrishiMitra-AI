import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Sprout, ArrowRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Organization {
  id: string;
  name: string;
  legalName?: string;
  type: string;
  role: string;
  description?: string;
  stats: {
    farmsCount: number;
    membersCount: number;
  };
  createdAt: string;
}

export const OrganizationList: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/organizations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrganizations(data.data);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-dark-50">
                Organizations & FPO Enterprise Hub
              </h1>
              <p className="text-xs text-gray-500 dark:text-dark-400">
                Manage multi-farm operations, cooperatives, agronomist advisory teams, and enterprise agricultural units.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/organizations/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Organization
        </button>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : organizations.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-gray-300 dark:text-dark-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-800 dark:text-dark-100">No Organizations Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            You are currently working in your personal workspace. Create or join an FPO, cooperative, or agri-enterprise organization to manage multi-farm operations.
          </p>
          <button
            onClick={() => navigate('/organizations/new')}
            className="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors"
          >
            Create Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map(org => (
            <div
              key={org.id}
              onClick={() => navigate(`/organizations/${org.id}`)}
              className="group bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 hover:border-brand-500/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg">
                    {org.name.charAt(0)}
                  </div>
                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-dark-300 font-bold text-[10px] rounded-lg uppercase">
                    {org.role}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50 group-hover:text-brand-500 transition-colors">
                    {org.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold">{org.type}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-400 line-clamp-2 mt-1">
                    {org.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-800 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 dark:text-dark-300">
                  <span className="flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                    {org.stats.farmsCount} Farms
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    {org.stats.membersCount} Members
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
