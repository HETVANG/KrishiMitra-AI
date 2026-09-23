import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  Sprout, 
  Droplets, 
  Layers, 
  Send, 
  Heart, 
  Sparkles,
  Info,
  CheckCircle2,
  Calendar,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

export const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [categories, setCategories] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [inquiryMessage, setInquiryMessage] = useState<string>('');
  const [inquirySent, setInquirySent] = useState<boolean>(false);
  const [submittingInquiry, setSubmittingInquiry] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
    fetchListings();
    fetchRecommendations();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/marketplace/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch {
      // Graceful fallback
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.query = searchQuery;

      const res = await api.get('/marketplace/listings', { params });
      if (res.data?.success) {
        setListings(res.data.data || []);
      }
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/marketplace/recommended');
      if (res.data?.success) {
        setRecommendations(res.data.data);
      }
    } catch {
      // Graceful fallback
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !inquiryMessage.trim()) return;

    setSubmittingInquiry(true);
    try {
      const res = await api.post('/marketplace/inquiries', {
        listingId: selectedListing._id,
        message: inquiryMessage
      });

      if (res.data?.success) {
        setInquirySent(true);
        setTimeout(() => {
          setSelectedListing(null);
          setInquirySent(false);
          setInquiryMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error('Inquiry error:', err);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 to-emerald-700 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-brand-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Store size={16} />
            <span>Agricultural Marketplace & Services Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Agricultural Marketplace</h1>
          <p className="text-sm text-brand-100 mt-1 max-w-2xl">
            Discover verified agricultural inputs, soil testing, drone spraying, machinery rental, and farm support services.
          </p>
        </div>
      </div>

      {/* Context-Aware Farm Recommendations */}
      {recommendations && (
        <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-brand-500" />
              <h3 className="font-bold text-gray-900 dark:text-dark-100 text-base">
                Recommended for your farm ({recommendations.cropName} • {recommendations.location})
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recommendations.recommendedCategories?.map((rec: any) => (
              <div 
                key={rec.code}
                onClick={() => setSelectedCategory(rec.code)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedCategory === rec.code
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                    : 'border-gray-200 dark:border-dark-700/50 hover:border-brand-300'
                }`}
              >
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-sm">
                  <Sprout size={16} />
                  <span>{rec.name}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-dark-400 mt-1.5 line-clamp-2">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, drone spraying, soil testing, equipment rental..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700/60 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500 text-gray-800 dark:text-dark-100"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === ''
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-dark-300 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCategory(c.code)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c.code
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-dark-300 hover:bg-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid or Clean Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-dark-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((item) => (
            <div key={item._id} className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-md mb-1">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-dark-100 text-base">{item.title}</h4>
                </div>
                {item.verificationStatus === 'VERIFIED' && (
                  <span title="Verified Provider">
                    <ShieldCheck size={18} className="text-emerald-500" />
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 dark:text-dark-300 line-clamp-2">{item.description}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-dark-400">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {item.location?.district || 'Regional Coverage'}
                </span>
                <span className="font-semibold text-gray-800 dark:text-dark-200">
                  {item.pricing?.amount ? `₹${item.pricing.amount}${item.pricing.unit || ''}` : 'Quote on Request'}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-dark-800">
                <span className="text-[11px] text-gray-400 dark:text-dark-500 font-medium">
                  {item.provider?.name || 'Verified Supplier'}
                </span>
                <button
                  onClick={() => setSelectedListing(item)}
                  className="px-3 py-1.5 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-semibold text-xs rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1"
                >
                  <Send size={12} />
                  Send Inquiry
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Real Factual Empty State */
        <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-2xl p-10 text-center space-y-3 max-w-xl mx-auto my-8">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto">
            <Info size={24} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-dark-100 text-lg">
            No agricultural listings match your criteria yet
          </h3>
          <p className="text-xs text-gray-500 dark:text-dark-400">
            Marketplace service provider verification is continuously expanding across regions. You can submit inquiries to general agronomist support or check back for new verified provider listings.
          </p>
        </div>
      )}

      {/* Inquiry Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-dark-100 text-lg">
              Send Inquiry to {selectedListing.provider?.name || 'Provider'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-dark-400">
              Listing: <span className="font-semibold text-gray-700 dark:text-dark-200">{selectedListing.title}</span>
            </p>

            {inquirySent ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                Inquiry submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-300 mb-1">
                    Your Requirements / Questions
                  </label>
                  <textarea
                    rows={4}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Describe your farm requirement, field location, or service date..."
                    required
                    className="w-full p-3 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700/60 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500 text-gray-800 dark:text-dark-100"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedListing(null)}
                    className="px-4 py-2 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 text-xs font-semibold rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50"
                  >
                    {submittingInquiry ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
