import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle2, Building2, Sparkles, Filter, ExternalLink, ShieldCheck } from 'lucide-react';

interface Partner {
  id: string;
  organizationName: string;
  legalName?: string;
  partnerType: string;
  description: string;
  logo?: string;
  website?: string;
  verificationStatus: string;
  isVerified: boolean;
  regions: string[];
  capabilities: string[];
  languages: string[];
  contactInformation?: any;
  matchReasons: string[];
}

export const PartnerDiscovery: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCapability, setSelectedCapability] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    fetchPartners();
  }, [selectedCapability, selectedRegion]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCapability) params.append('capability', selectedCapability);
      if (selectedRegion) params.append('region', selectedRegion);

      const res = await fetch(`/api/partners/discover?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPartners(data.data);
      }
    } catch (err) {
      console.error('Error discovering partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPartners();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-dark-50">
              Verified Partner & Advisory Network
            </h1>
            <p className="text-xs text-gray-500">
              Discover verified FPOs, agricultural advisory agencies, soil testing labs, and service partners in your region.
            </p>
          </div>
        </div>

        <a
          href="/partners/apply"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Join Ecosystem Network
        </a>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 p-4 rounded-3xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search partner organization by name or service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCapability}
              onChange={e => setSelectedCapability(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="">All Services</option>
              <option value="AGRICULTURAL_ADVISORY">Agricultural Advisory</option>
              <option value="SOIL_SERVICES">Soil Testing & Quality</option>
              <option value="STORAGE">Storage & Warehousing</option>
              <option value="EQUIPMENT_SERVICES">Farm Machinery</option>
              <option value="FARMER_DISTRIBUTION">Farmer Distribution</option>
            </select>

            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="">All Regions</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Punjab">Punjab</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
          </div>
        </form>
      </div>

      {/* Partner List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-gray-300 dark:text-dark-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-800 dark:text-dark-100">No Verified Partners Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            No verified agricultural partners match your current filters or region. Check back soon as new verified organizations join the KrishiMitra network.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.map(p => (
            <div
              key={p.id}
              className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                      {p.organizationName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-dark-50">{p.organizationName}</h3>
                      <p className="text-xs text-gray-400 font-semibold">{p.partnerType}</p>
                    </div>
                  </div>

                  {p.isVerified && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-200/50">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Partner
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed">
                  {p.description || 'Verified agricultural ecosystem partner.'}
                </p>

                {/* Match Reasons */}
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Matching Signals</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.matchReasons.map((reason, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-dark-800 text-[10px] font-medium text-gray-700 dark:text-dark-200 rounded-md">
                        ✓ {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-dark-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{p.regions.join(', ') || 'Pan-India'}</span>
                </div>

                {p.website && (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400 hover:underline text-xs"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
