import React, { useState, useEffect } from 'react';
import { Building2, User, ChevronDown, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrganizationItem {
  id: string;
  name: string;
  type: string;
  role: string;
}

export const WorkspaceSwitcher: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [activeOrg, setActiveOrg] = useState<OrganizationItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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
    }
  };

  const handleSelectPersonal = () => {
    setActiveOrg(null);
    setIsOpen(false);
    navigate('/dashboard');
  };

  const handleSelectOrg = (org: OrganizationItem) => {
    setActiveOrg(org);
    setIsOpen(false);
    navigate(`/organizations/${org.id}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-800 bg-white dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-800 text-xs font-semibold text-gray-700 dark:text-dark-200 transition-colors shadow-sm"
      >
        {activeOrg ? (
          <>
            <Building2 className="w-4 h-4 text-brand-500" />
            <span className="max-w-[120px] truncate">{activeOrg.name}</span>
          </>
        ) : (
          <>
            <User className="w-4 h-4 text-emerald-500" />
            <span>Personal Workspace</span>
          </>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-xl z-50 py-2">
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-gray-400 dark:text-dark-400 uppercase">
            Workspaces
          </div>

          <button
            onClick={handleSelectPersonal}
            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-dark-100">Personal Workspace</p>
                <p className="text-[10px] text-gray-400">My Individual Farms</p>
              </div>
            </div>
            {!activeOrg && <Check className="w-4 h-4 text-brand-500" />}
          </button>

          <div className="my-1 border-t border-gray-100 dark:border-dark-800" />

          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-gray-400 dark:text-dark-400 uppercase">
            Organizations & FPOs ({organizations.length})
          </div>

          {organizations.map(org => (
            <button
              key={org.id}
              onClick={() => handleSelectOrg(org)}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-dark-100 truncate max-w-[140px]">{org.name}</p>
                  <p className="text-[10px] text-gray-400">{org.type} • {org.role}</p>
                </div>
              </div>
              {activeOrg?.id === org.id && <Check className="w-4 h-4 text-brand-500" />}
            </button>
          ))}

          <div className="my-1 border-t border-gray-100 dark:border-dark-800" />

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/organizations/new');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create or Join Organization
          </button>
        </div>
      )}
    </div>
  );
};
