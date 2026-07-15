import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Search, Layers, FileCheck, Calendar, ArrowUpRight, HelpCircle, ShieldAlert } from 'lucide-react';

export const GovSchemes: React.FC = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/schemes/list?search=${search}&category=${category}`);
      if (res.data && res.data.success) {
        setSchemes(res.data.schemes);
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return 'No Deadline';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Government Subsidies & Schemes</h1>
        <p className="text-teal-100 text-xs md:text-sm mt-1 font-medium">Verify eligibility thresholds, review required document checklists, and apply directly for state agricultural programs.</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes (e.g. Kisan, insurance)..."
            className="custom-input pl-10 text-sm"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
        </form>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['', 'Income Support', 'Insurance', 'Subsidies'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-200 border ${
                (category === cat) 
                  ? 'bg-brand-600 text-white border-transparent' 
                  : 'bg-white dark:bg-dark-900 text-gray-600 dark:text-dark-300 border-gray-200 dark:border-dark-800'
              }`}
            >
              {cat || 'All Categories'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-brand-600">
          <div className="w-8 h-8 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
        </div>
      ) : schemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((item) => (
            <div 
              key={item._id}
              onClick={() => setSelectedScheme(item)}
              className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 shadow-sm hover:shadow-md hover-lift cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 font-bold rounded-md text-[10px] uppercase mb-3">
                  {item.category}
                </span>
                <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 line-clamp-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-dark-400 mt-2.5 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-gray-50 dark:border-dark-850 mt-5 pt-3.5 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 dark:text-dark-500 font-bold flex items-center gap-1">
                  <Calendar size={12} /> Deadline: {formatDeadline(item.deadline)}
                </span>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Details <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-dark-800/30">
          <HelpCircle size={48} className="text-gray-300 dark:text-dark-800 mx-auto mb-3" />
          <p className="font-bold text-sm text-gray-700 dark:text-dark-200">No schemes found</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Try widening search criteria or reset filters.</p>
        </div>
      )}

      {/* Scheme Detail Dialog Slideout Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative animate-fade-in text-left">
            <button
              onClick={() => setSelectedScheme(null)}
              className="absolute top-4 right-4 text-gray-450 hover:text-gray-700 dark:hover:text-dark-100 font-extrabold text-lg p-2"
            >
              ✕
            </button>

            <div>
              <span className="inline-block px-2.5 py-0.5 bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 font-bold rounded-md text-[10px] uppercase mb-2">
                {selectedScheme.category}
              </span>
              <h2 className="text-xl font-extrabold text-gray-800 dark:text-dark-50 tracking-tight leading-tight pr-6">
                {selectedScheme.title}
              </h2>
              
              <div className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-2.5">
                <Calendar size={13} /> Application Deadline: {formatDeadline(selectedScheme.deadline)}
              </div>

              <div className="border-b border-gray-100 dark:border-dark-800 my-4" />

              {/* Description */}
              <div className="space-y-4 text-xs md:text-sm">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-dark-200 uppercase tracking-wide text-[10px] mb-1">About the Scheme</h4>
                  <p className="text-gray-600 dark:text-dark-300 leading-relaxed">{selectedScheme.description}</p>
                </div>

                {/* Benefits */}
                {selectedScheme.benefits && (
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-dark-200 uppercase tracking-wide text-[10px] mb-1">Benefits Offered</h4>
                    <p className="text-brand-750 dark:text-brand-400 font-semibold leading-relaxed bg-brand-50/50 dark:bg-brand-950/10 p-2.5 rounded-xl border border-brand-100/50 dark:border-brand-900/10">{selectedScheme.benefits}</p>
                  </div>
                )}

                {/* Eligibility Checkmarks */}
                {selectedScheme.eligibility && selectedScheme.eligibility.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-dark-200 uppercase tracking-wide text-[10px] mb-1.5">Who Can Apply (Eligibility)</h4>
                    <ul className="space-y-1">
                      {selectedScheme.eligibility.map((el: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5 text-gray-650 dark:text-dark-300 text-xs">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <span>{el}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Documents Checklist */}
                {selectedScheme.documentsRequired && selectedScheme.documentsRequired.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-dark-200 uppercase tracking-wide text-[10px] mb-1.5">Mandatory Document Checklist</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedScheme.documentsRequired.map((doc: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-850 border border-gray-150 dark:border-dark-800/40 rounded-xl text-xs text-gray-650 dark:text-dark-300">
                          <FileCheck size={14} className="text-brand-600 dark:text-brand-400 shrink-0" />
                          <span className="truncate">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Portal link button */}
              {selectedScheme.applyLink && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-800 flex gap-2">
                  <a
                    href={selectedScheme.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>Apply via Official Government Portal</span>
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
