import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  LineChart, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight,
  Heart,
  Sparkles,
  Building2,
  MapPin,
  Compass,
  RotateCcw,
  ChevronDown,
  X,
  Check,
  Calendar,
  AlertCircle,
  Globe,
  Info,
  CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VoiceInputButton } from '../components/voice/VoiceInputButton';
import { getDeviceLocation } from '../services/native';
import { 
  resolveMandiCoordinates, 
  getDistanceMetadata, 
  DISTRICT_TO_STATE_MAP,
  getCanonicalStateForDistrict,
  type DistanceResult,
  type CoordinateResolution
} from '../utils/mandiLocationUtils';

// Helper to resolve saved location from authenticated farm profile or stored preference
function resolveInitialLocation(user: any) {
  if (user?.farmLocation?.state || user?.farmLocation?.city || user?.farmLocation?.district) {
    const rawDistrict = user.farmLocation.district || user.farmLocation.city || '';
    let state = user.farmLocation.state || '';
    if (!state && rawDistrict) {
      state = getCanonicalStateForDistrict(rawDistrict) || '';
    }
    state = state || 'Gujarat';
    const district = rawDistrict;
    const address = user.farmLocation.address || (district ? `${district}, ${state}` : state);
    const coords = (user.farmLocation.latitude && user.farmLocation.longitude)
      ? { lat: user.farmLocation.latitude, lon: user.farmLocation.longitude }
      : null;
    return { state, district, address, coords };
  }
  try {
    const stored = localStorage.getItem('selectedLocation');
    if (stored) {
      const parsed = JSON.parse(stored);
      const rawDistrict = parsed.district || parsed.city || '';
      let state = parsed.state || '';
      if (!state && rawDistrict) {
        state = getCanonicalStateForDistrict(rawDistrict) || '';
      }
      state = state || 'Gujarat';
      const district = rawDistrict;
      const address = parsed.address || (district ? `${district}, ${state}` : state);
      const coords = (parsed.latitude && parsed.longitude)
        ? { lat: parsed.latitude, lon: parsed.longitude }
        : null;
      return { state, district, address, coords };
    }
  } catch {}
  return { state: 'Gujarat', district: '', address: 'Gujarat, India', coords: { lat: 21.1702, lon: 72.8311 } };
}

export const MarketDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, token, setFarmLocationLocally } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Track if user has explicitly interacted with filters to prevent auto-overriding
  const isUserManualSelection = useRef(false);

  // Initial location resolution (Profile farmLocation -> Saved localStorage -> Default Zone)
  const initialLoc = useMemo(() => resolveInitialLocation(user), [user]);

  // Filter States
  const [searchCrop, setSearchCrop] = useState('Wheat');
  const [searchState, setSearchState] = useState<string>(initialLoc.state);
  const [searchDistrict, setSearchDistrict] = useState<string>(initialLoc.district);
  const [searchDate, setSearchDate] = useState('');
  const [periodDays, setPeriodDays] = useState<number>(7);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [allowNationalSearch, setAllowNationalSearch] = useState<boolean>(false);

  // Crop Selector Search & Dropdown State
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);
  const [cropSearchQuery, setCropSearchQuery] = useState('');
  const cropDropdownRef = useRef<HTMLDivElement>(null);

  // Location States
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(initialLoc.coords);
  const [locationName, setLocationName] = useState<string>(initialLoc.address);
  const [locating, setLocating] = useState(false);

  // Synchronize authenticated farm location if loaded after mount (without overwriting manual choice)
  useEffect(() => {
    if (!isUserManualSelection.current && (user?.farmLocation?.state || user?.farmLocation?.district || user?.farmLocation?.city)) {
      const userDistrict = user.farmLocation.district || user.farmLocation.city || '';
      let userState = user.farmLocation.state || '';
      if (!userState && userDistrict) {
        userState = getCanonicalStateForDistrict(userDistrict) || '';
      }
      if (userState) {
        const userAddr = user.farmLocation.address || (userDistrict ? `${userDistrict}, ${userState}` : userState);
        setSearchState(userState);
        setSearchDistrict(userDistrict);
        setLocationName(userAddr);
        if (user.farmLocation.latitude && user.farmLocation.longitude) {
          setUserCoords({ lat: user.farmLocation.latitude, lon: user.farmLocation.longitude });
        }
      }
    }
  }, [user?.farmLocation]);

  // Query handoff from Global Search or external links
  useEffect(() => {
    const passedCrop = (location.state as any)?.searchCrop || searchParams.get('crop');
    if (passedCrop && typeof passedCrop === 'string' && passedCrop.trim()) {
      setSearchCrop(passedCrop.trim());
      isUserManualSelection.current = true;
    }

    const passedState = (location.state as any)?.searchState || searchParams.get('state');
    const passedDistrict = (location.state as any)?.searchLocation || searchParams.get('location');

    let effectiveState = passedState && typeof passedState === 'string' ? passedState.trim() : '';
    let effectiveDistrict = '';

    if (passedDistrict && typeof passedDistrict === 'string' && passedDistrict.trim()) {
      const rawLoc = passedDistrict.trim();
      if (rawLoc.includes(',')) {
        const parts = rawLoc.split(',').map(s => s.trim());
        effectiveDistrict = parts[0];
        if (!effectiveState && parts[1]) {
          effectiveState = parts[1];
        }
      } else {
        effectiveDistrict = rawLoc;
      }
      
      // If state not explicitly passed, attempt to infer from district
      if (!effectiveState) {
        const inferred = getCanonicalStateForDistrict(effectiveDistrict);
        if (inferred) effectiveState = inferred;
      }

      setSearchDistrict(effectiveDistrict);
      if (effectiveState) {
        setSearchState(effectiveState);
        setLocationName(`${effectiveDistrict}, ${effectiveState}`);
      } else {
        setLocationName(effectiveDistrict);
      }
      isUserManualSelection.current = true;
    } else if (effectiveState) {
      setSearchState(effectiveState);
      setLocationName(effectiveState);
      isUserManualSelection.current = true;
    }
  }, [location.state, searchParams]);

  // Core Market Data
  const [intelligence, setIntelligence] = useState<any>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Status & Loading States
  const [loading, setLoading] = useState(false);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [watchlistUpdating, setWatchlistUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Popular quick-pick commodities
  const POPULAR_CROPS = [
    { id: 'wheat', name: 'Wheat', icon: '🌾' },
    { id: 'cotton', name: 'Cotton', icon: '🌿' },
    { id: 'paddy', name: 'Paddy', icon: '🌾' },
    { id: 'soyabean', name: 'Soyabean', icon: '🌱' },
    { id: 'groundnut', name: 'Groundnut', icon: '🥜' },
    { id: 'gram', name: 'Gram', icon: '🌰' },
    { id: 'mustard', name: 'Mustard', icon: '🟡' },
    { id: 'onion', name: 'Onion', icon: '🧅' },
    { id: 'potato', name: 'Potato', icon: '🥔' },
    { id: 'maize', name: 'Maize', icon: '🌽' },
  ];

  // Helper to format currency in Indian numbering (₹X,XXX)
  const formatRupee = (val?: number | null): string => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Helper for localized crop name
  const getTranslatedCropName = (englishName: string): string => {
    if (!englishName) return '';
    const clean = englishName.trim().toLowerCase();
    for (const cat of categories) {
      for (const item of cat.items) {
        if (
          item.displayName.toLowerCase() === clean || 
          item.apiCommodity.toLowerCase() === clean || 
          item.id.toLowerCase() === clean
        ) {
          return item.translations?.[i18n.language] || item.displayName;
        }
      }
    }
    return englishName;
  };

  // Close crop dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cropDropdownRef.current && !cropDropdownRef.current.contains(e.target as Node)) {
        setCropDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Load Commodity Categories
  useEffect(() => {
    const loadCommodities = async () => {
      try {
        const res = await api.get('/market/commodities');
        if (res.data?.success) {
          setCategories(res.data.commodities || []);
        }
      } catch (err) {
        console.error('Failed to load crop catalog:', err);
      }
    };
    void loadCommodities();
  }, []);

  // 2. Fetch User Watchlist if Authenticated
  useEffect(() => {
    if (token) {
      api.get('/market/watchlist')
        .then(res => {
          if (res.data?.success) {
            setWatchlist(res.data.watchlist || []);
          }
        })
        .catch(err => console.warn('Failed to load watchlist:', err));
    }
  }, [token]);

  // Request Device Location for Nearby Mandis
  const handleDetectLocation = async (isManualClick = false) => {
    setLocating(true);
    try {
      const locResult = await getDeviceLocation({ enableHighAccuracy: true, timeout: 10000 });
      if (locResult.coords) {
        const { latitude, longitude } = locResult.coords;
        setUserCoords({ lat: latitude, lon: longitude });

        // Reverse geocode via weather or address fallback
        try {
          const wRes = await api.get(`/weather?lat=${latitude}&lon=${longitude}&lang=${i18n.language}`);
          if (wRes.data?.location?.city || wRes.data?.location?.district) {
            const resolvedCity = wRes.data.location.city || wRes.data.location.district;
            const resolvedState = wRes.data.location.state || '';
            const fullAddr = `${resolvedCity}${resolvedState ? ', ' + resolvedState : ''}`;
            setLocationName(fullAddr);

            if (isManualClick || !isUserManualSelection.current) {
              if (resolvedState) setSearchState(resolvedState);
              if (resolvedCity) setSearchDistrict(resolvedCity);
            }

            const newLoc = {
              latitude,
              longitude,
              address: fullAddr,
              city: resolvedCity,
              district: resolvedCity,
              state: resolvedState
            };
            setFarmLocationLocally(newLoc);
            localStorage.setItem('selectedLocation', JSON.stringify(newLoc));
          } else {
            setLocationName(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
          }
        } catch {
          setLocationName(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
        }
      }
    } catch (err) {
      console.warn('Geolocation detection skipped:', err);
    } finally {
      setLocating(false);
    }
  };

  // Synchronize state and district changes with manual selection tracking
  const handleStateChange = (newState: string) => {
    isUserManualSelection.current = true;
    setSearchState(newState);
    if (searchDistrict && newState) {
      const canonicalStateForDistrict = getCanonicalStateForDistrict(searchDistrict);
      if (canonicalStateForDistrict && canonicalStateForDistrict.toLowerCase() !== newState.toLowerCase()) {
        setSearchDistrict('');
      }
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    isUserManualSelection.current = true;
    setSearchDistrict(newDistrict);
    if (newDistrict.trim()) {
      const canonicalState = getCanonicalStateForDistrict(newDistrict.trim());
      if (canonicalState && canonicalState.toLowerCase() !== searchState.toLowerCase()) {
        setSearchState(canonicalState);
      }
    }
  };

  // Try passive location setup on mount
  useEffect(() => {
    if (!userCoords) {
      void handleDetectLocation(false);
    } else if (locationName === 'Detecting Location...') {
      setLocationName(user?.farmLocation?.address || 'Current Location');
    }
  }, []);

  // 3. Fetch Unified Market Intelligence
  const fetchMarketIntelligence = async (
    cropName = searchCrop,
    targetState = searchState,
    targetDistrict = searchDistrict
  ) => {
    setLoadingIntel(true);
    try {
      const query = new URLSearchParams({
        state: targetState,
        district: targetDistrict,
        lang: i18n.language
      });
      const res = await api.get(`/market/intelligence/${encodeURIComponent(cropName)}?${query.toString()}`);
      if (res.data?.success) {
        setIntelligence(res.data.intelligence);
      }
    } catch (err) {
      console.warn('Failed to fetch market intelligence:', err);
    } finally {
      setLoadingIntel(false);
    }
  };

  // 4. Fetch Prices List & Pagination
  const fetchPrices = async (
    targetPage = page, 
    cropName = searchCrop,
    targetState = searchState,
    targetDistrict = searchDistrict,
    allowNational = allowNationalSearch
  ) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: String(targetPage),
        limit: '8',
        crop: cropName,
        state: targetState,
        district: targetDistrict,
        allowNationalFallback: allowNational ? 'true' : 'false'
      });
      if (searchDate) query.set('date', searchDate);

      const res = await api.get(`/market/prices?${query.toString()}`);
      if (res.data?.success) {
        setPrices(res.data.prices || []);
        setPagination(res.data.pagination || null);
      } else {
        setError(t('market.price_load_error') || 'Unable to load mandi prices right now.');
      }
    } catch (err: any) {
      console.error('Failed to load mandi prices:', err);
      const userMsg = err.response?.data?.userMessage || err.response?.data?.message;
      setError(userMsg || t('market.price_load_error') || 'Failed to load mandi prices.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Fetch Historical Trend Data
  const fetchHistory = async (
    cropName = searchCrop, 
    period = periodDays,
    targetState = searchState,
    targetDistrict = searchDistrict
  ) => {
    setLoadingHistory(true);
    try {
      const query = new URLSearchParams({
        crop: cropName,
        state: targetState,
        district: targetDistrict,
        limit: String(period === 90 ? 90 : period === 30 ? 30 : 14),
      });
      const res = await api.get(`/market/history?${query.toString()}`);
      if (res.data?.success) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load mandi history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 6. Fetch Nearby Market Comparisons
  const fetchComparison = async (
    cropName = searchCrop, 
    allowNational = allowNationalSearch,
    targetState = searchState,
    targetDistrict = searchDistrict
  ) => {
    try {
      const query = new URLSearchParams({
        crop: cropName,
        state: targetState,
        district: targetDistrict,
        limit: '12',
        allowNationalFallback: allowNational ? 'true' : 'false'
      });
      if (userCoords) {
        query.set('lat', userCoords.lat.toString());
        query.set('lon', userCoords.lon.toString());
      }
      const res = await api.get(`/market/compare?${query.toString()}`);
      if (res.data?.success) {
        setComparison(res.data.comparison);
      }
    } catch (err) {
      console.warn('Failed to fetch market comparisons:', err);
    }
  };

  // Master fetch trigger
  const runMasterFetch = (
    cropName = searchCrop, 
    pDays = periodDays, 
    targetPage = 1,
    targetState = searchState,
    targetDistrict = searchDistrict,
    allowNational = allowNationalSearch
  ) => {
    void fetchMarketIntelligence(cropName, targetState, targetDistrict);
    void fetchPrices(targetPage, cropName, targetState, targetDistrict, allowNational);
    void fetchHistory(cropName, pDays, targetState, targetDistrict);
    void fetchComparison(cropName, allowNational, targetState, targetDistrict);
  };

  useEffect(() => {
    runMasterFetch(searchCrop, periodDays, 1);
  }, [searchCrop, periodDays, searchState, searchDistrict, allowNationalSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    runMasterFetch(searchCrop, periodDays, 1);
  };

  const handleResetFilters = () => {
    isUserManualSelection.current = false;
    const loc = resolveInitialLocation(user);
    setSearchCrop('Wheat');
    setSearchState(loc.state);
    setSearchDistrict(loc.district);
    setLocationName(loc.address);
    setUserCoords(loc.coords);
    setSearchDate('');
    setPeriodDays(7);
    setPage(1);
    setAllowNationalSearch(false);
    runMasterFetch('Wheat', 7, 1, loc.state, loc.district, false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      if (user?.role === 'admin') {
        try {
          await api.post('/market/sync');
        } catch (syncErr) {
          console.warn('Admin background sync notice:', syncErr);
        }
      }
      runMasterFetch(searchCrop, periodDays, page);
    } catch (err) {
      console.error('Failed to refresh mandi prices:', err);
      setError(t('market.refresh_error') || 'Refresh failed. Using latest cached prices.');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!token) {
      alert('Please sign in to save commodities to your watchlist.');
      return;
    }

    setWatchlistUpdating(true);
    try {
      if (intelligence?.isWatchlisted) {
        await api.delete(`/market/watchlist/${encodeURIComponent(searchCrop)}`);
        setIntelligence((prev: any) => prev ? { ...prev, isWatchlisted: false } : null);
        setWatchlist((prev) => prev.filter((w) => w.crop.toLowerCase() !== searchCrop.toLowerCase()));
      } else {
        await api.post('/market/watchlist', { crop: searchCrop, state: searchState, district: searchDistrict });
        setIntelligence((prev: any) => prev ? { ...prev, isWatchlisted: true } : null);
        const updatedList = await api.get('/market/watchlist');
        if (updatedList.data?.success) {
          setWatchlist(updatedList.data.watchlist || []);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update watchlist.');
    } finally {
      setWatchlistUpdating(false);
    }
  };

  // Filtered commodities for the searchable combobox
  const filteredCommoditiesList = useMemo(() => {
    if (!cropSearchQuery.trim()) {
      return categories.flatMap(cat => cat.items || []);
    }
    const q = cropSearchQuery.toLowerCase().trim();
    const matches: any[] = [];
    for (const cat of categories) {
      for (const item of cat.items || []) {
        const dName = (item.displayName || '').toLowerCase();
        const aName = (item.apiCommodity || '').toLowerCase();
        const aliases = (item.aliases || []).map((a: string) => a.toLowerCase());
        const trans = Object.values(item.translations || {}).map((t: any) => String(t).toLowerCase());

        if (
          dName.includes(q) || 
          aName.includes(q) || 
          aliases.some(a => a.includes(q)) ||
          trans.some(t => t.includes(q))
        ) {
          matches.push(item);
        }
      }
    }
    return matches;
  }, [categories, cropSearchQuery]);

  // Nearby Mandis computed with verified coordinates and realistic distance sorting
  const nearbyMandisWithDistances = useMemo(() => {
    if (!comparison || !comparison.comparisons || comparison.comparisons.length === 0) {
      return [];
    }

    const items = comparison.comparisons.map((c: any) => {
      const coordRes: CoordinateResolution | null = resolveMandiCoordinates(c.market, c.district);
      const distanceMeta: DistanceResult | null = coordRes && userCoords
        ? getDistanceMetadata(userCoords.lat, userCoords.lon, coordRes.lat, coordRes.lon, coordRes.isVerifiedMandi)
        : null;

      return {
        ...c,
        coordRes,
        distanceMeta,
        distanceKm: distanceMeta ? distanceMeta.distanceKm : 99999
      };
    });

    // Tier-first sorting:
    // 1) Scope (district=1, state=2, neighboring=3, national=4)
    // 2) Distance in km ascending
    return items.sort((a: any, b: any) => {
      const scopeRank: Record<string, number> = { district: 1, state: 2, neighboring: 3, national: 4 };
      const rankA = scopeRank[a.scope] || 2;
      const rankB = scopeRank[b.scope] || 2;
      if (rankA !== rankB) return rankA - rankB;
      return a.distanceKm - b.distanceKm;
    });
  }, [comparison, userCoords]);

  // Check if any local mandis exist within 50 km
  const hasLocalMandisWithin50Km = useMemo(() => {
    return nearbyMandisWithDistances.some((m: any) => m.distanceMeta && m.distanceMeta.tier === 'local');
  }, [nearbyMandisWithDistances]);

  return (
    <div className="space-y-6 pb-32 md:pb-24 text-left max-w-full overflow-hidden">
      {/* ============================================================== */}
      {/* 1. Header Banner & Location Bar                                 */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 text-white p-5 sm:p-6 rounded-3xl shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-600/60 rounded-xl">
                <LineChart size={22} className="text-emerald-100" />
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                {t('market.mandi_rates_title') || 'Mandi Prices & Market Intelligence'}
              </h1>
            </div>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1.5 font-medium max-w-2xl leading-relaxed">
              {t('market.mandi_rates_sub') || 'Compare live APMC rates, find nearest mandis, and track price trends to make better selling decisions.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 min-h-[42px] active:scale-95"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? (t('market.refreshing') || 'Updating...') : (t('market.refresh_feed') || 'Refresh Rates')}</span>
            </button>
          </div>
        </div>

        {/* Location Detection & Status Bar */}
        <div className="pt-3 border-t border-emerald-600/60 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-emerald-100">
            <MapPin size={15} className="text-emerald-300 shrink-0" />
            <span className="font-semibold text-white">
              {locationName}
            </span>
            {userCoords && (
              <span className="text-[10px] font-bold bg-emerald-600/70 text-emerald-100 px-2 py-0.5 rounded-full">
                {t('market.location_detected') || 'GPS Active'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleDetectLocation(true)}
              disabled={locating}
              className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 min-h-[32px]"
            >
              <Compass size={13} className={locating ? 'animate-spin' : ''} />
              <span>{locating ? (t('market.locating') || 'Locating...') : (t('market.use_my_location') || 'Use My Location')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. User Watchlist Bar                                           */}
      {/* ============================================================== */}
      {token && watchlist.length > 0 && (
        <div className="bg-white dark:bg-dark-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-dark-800 shadow-xs flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-1">
            <Heart size={14} className="text-red-500 fill-red-500" /> {t('market.watchlist') || 'Watchlist'}:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {watchlist.map((w) => (
              <button
                key={w.crop}
                onClick={() => {
                  setSearchCrop(w.crop);
                  if (w.state) setSearchState(w.state);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 active:scale-95 ${
                  searchCrop.toLowerCase() === w.crop.toLowerCase()
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-dark-850 border-slate-200 dark:border-dark-800 text-slate-700 dark:text-dark-200 hover:border-emerald-300'
                }`}
              >
                <span>{getTranslatedCropName(w.crop)}</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  {w.currentPrice ? `₹${w.currentPrice}` : 'N/A'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. Crop Selection & Filtering Toolbar                           */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-dark-800 shadow-xs space-y-4">
        {/* Quick-Pick Popular Crops Carousel */}
        <div>
          <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            {t('market.popular_crops') || 'Popular Crops'}
          </label>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            {POPULAR_CROPS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSearchCrop(c.name);
                  setPage(1);
                  runMasterFetch(c.name, periodDays, 1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 active:scale-95 ${
                  searchCrop.toLowerCase() === c.name.toLowerCase()
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-dark-800 text-slate-700 dark:text-dark-200 border-slate-200 dark:border-dark-700 hover:border-emerald-300'
                }`}
              >
                <span>{c.icon}</span>
                <span>{getTranslatedCropName(c.name)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Search & Filters Grid */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end pt-2 border-t border-slate-100 dark:border-dark-800">
          {/* Searchable Crop Combobox (4 cols) */}
          <div className="lg:col-span-4 relative" ref={cropDropdownRef}>
            <label className="block text-[11px] font-extrabold text-slate-500 dark:text-dark-400 uppercase mb-1">
              {t('market.target_commodity') || 'Commodity / Crop'}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCropDropdownOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-dark-100 focus:outline-none min-h-[42px]"
              >
                <span className="truncate">{getTranslatedCropName(searchCrop) || searchCrop}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${cropDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {cropDropdownOpen && (
                <div className="absolute left-0 right-0 top-12 z-50 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-2xl shadow-xl max-h-72 overflow-hidden flex flex-col animate-slide-up">
                  <div className="p-2 border-b border-slate-100 dark:border-dark-800 flex items-center gap-2">
                    <Search size={14} className="text-slate-400 shrink-0 ml-1" />
                    <input
                      type="text"
                      value={cropSearchQuery}
                      onChange={(e) => setCropSearchQuery(e.target.value)}
                      placeholder={t('market.select_crop_placeholder') || 'Search crop...'}
                      className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-dark-100 placeholder-slate-400 font-medium"
                      autoFocus
                    />
                    {cropSearchQuery && (
                      <button type="button" onClick={() => setCropSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto p-1.5 divide-y divide-slate-100 dark:divide-dark-800/60 max-h-60">
                    {filteredCommoditiesList.length > 0 ? (
                      filteredCommoditiesList.map((item: any) => {
                        const isSelected = searchCrop.toLowerCase() === (item.displayName || '').toLowerCase() ||
                          searchCrop.toLowerCase() === (item.apiCommodity || '').toLowerCase();
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSearchCrop(item.displayName || item.apiCommodity);
                              setCropDropdownOpen(false);
                              setCropSearchQuery('');
                              setPage(1);
                              runMasterFetch(item.displayName || item.apiCommodity, periodDays, 1);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                                : 'hover:bg-slate-50 dark:hover:bg-dark-800 text-slate-700 dark:text-dark-200'
                            }`}
                          >
                            <span>{item.translations?.[i18n.language] || item.displayName}</span>
                            {isSelected && <Check size={14} className="text-emerald-600 dark:text-emerald-400" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No commodity matched "{cropSearchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* State Dropdown (3 cols) */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-extrabold text-slate-500 dark:text-dark-400 uppercase mb-1">
              {t('market.state_label') || 'State'}
            </label>
            <select
              value={searchState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-dark-200 focus:outline-none min-h-[42px]"
            >
              <option value="">{t('market.all_states') || 'All States'}</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>

          {/* District Input (3 cols) */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-extrabold text-slate-500 dark:text-dark-400 uppercase mb-1">
              {t('market.district_label') || 'District / Mandi'}
            </label>
            <input
              type="text"
              value={searchDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              placeholder="e.g. Rajkot, Nashik"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-dark-200 focus:outline-none min-h-[42px]"
            />
          </div>

          {/* Search & Reset Buttons (2 cols) */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 min-h-[42px] active:scale-95"
            >
              <Search size={15} />
              <span>{t('common.search') || 'Search'}</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title={t('market.reset_filters') || 'Reset Filters'}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-600 dark:text-dark-300 rounded-xl transition-colors min-h-[42px] flex items-center justify-center"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. Market Intelligence Summary (Simplified & Farmer-Friendly)  */}
      {/* ============================================================== */}
      {intelligence && (
        <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-dark-800 shadow-xs space-y-4">
          {/* Header Row: Commodity Name + Watchlist Button */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-dark-800">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {t('market.market_insights') || 'Market Overview'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-dark-50 tracking-tight mt-0.5">
                {getTranslatedCropName(intelligence.commodity || searchCrop)}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {t('market.source_ename') || 'Official APMC Mandi Rates (eNAM / Agmarknet)'}
              </p>
            </div>

            {token && (
              <button
                onClick={toggleWatchlist}
                disabled={watchlistUpdating}
                className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${
                  intelligence.isWatchlisted
                    ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/30'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-red-500 dark:bg-dark-850 dark:border-dark-800'
                }`}
                title={intelligence.isWatchlisted ? (t('market.remove_from_watchlist') || 'Remove from Watchlist') : (t('market.add_to_watchlist') || 'Add to Watchlist')}
              >
                <Heart size={18} className={intelligence.isWatchlisted ? 'fill-red-500' : ''} />
              </button>
            )}
          </div>

          {/* 4-Card Clean Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            {/* 1. Selected Crop Modal Price */}
            <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold uppercase block">
                {t('market.modal_price') || 'Modal Market Rate'}
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-800 dark:text-emerald-300 mt-1 block">
                {formatRupee(intelligence.currentPrice?.modalPrice)}
              </span>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-semibold block mt-0.5">
                {t('market.per_quintal') || 'per Quintal'}
              </span>
            </div>

            {/* 2. Regional Average */}
            <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-150 dark:border-dark-800">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">
                {t('market.regional_average') || 'Regional Average'}
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-800 dark:text-dark-100 mt-1 block">
                {formatRupee(intelligence.trend7d?.averagePrice || comparison?.regionalAverage)}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                Across nearby mandis
              </span>
            </div>

            {/* 3. Recorded Range (Lowest to Highest) */}
            <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-150 dark:border-dark-800">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">
                {t('market.recorded_range') || 'Price Range (Min - Max)'}
              </span>
              <span className="text-sm sm:text-base font-black text-slate-800 dark:text-dark-100 mt-1 block truncate">
                {intelligence.trend7d?.lowestPrice && intelligence.trend7d?.highestPrice
                  ? `₹${intelligence.trend7d.lowestPrice} - ₹${intelligence.trend7d.highestPrice}`
                  : comparison?.lowestPrice && comparison?.highestPrice
                  ? `₹${comparison.lowestPrice} - ₹${comparison.highestPrice}`
                  : 'N/A'
                }
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                Current trading range
              </span>
            </div>

            {/* 4. 7-Day Trend */}
            <div className="p-3.5 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-150 dark:border-dark-800">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">
                {t('market.price_trend') || '7-Day Trend'}
              </span>
              {intelligence.trend7d?.trend && intelligence.trend7d.trend !== 'INSUFFICIENT_DATA' && intelligence.trend7d.percentageChange !== null ? (
                <div className="mt-1">
                  <span className={`text-base font-extrabold flex items-center gap-1 ${
                    intelligence.trend7d.percentageChange >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {intelligence.trend7d.percentageChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {intelligence.trend7d.percentageChange >= 0 ? '+' : ''}{intelligence.trend7d.percentageChange}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {intelligence.trend7d.trend === 'RISING' ? 'Prices Rising' : intelligence.trend7d.trend === 'FALLING' ? 'Prices Falling' : 'Prices Stable'}
                  </span>
                </div>
              ) : (
                <div className="mt-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-dark-300 block">
                    {t('market.insufficient_trend') || 'Not enough historical data to show the trend.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actionable Smart Selling Advisory */}
          {intelligence.advisory && (
            <div className="p-3.5 sm:p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-start gap-3">
              <span className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                <Sparkles size={14} />
              </span>
              <div className="text-left text-xs leading-relaxed space-y-1">
                <span className="font-extrabold text-emerald-900 dark:text-emerald-300 block">
                  {t('market.smart_advisory') || 'Smart Selling Advisory'}
                </span>
                <p className="text-slate-600 dark:text-dark-300">
                  {intelligence.advisory.summary}
                </p>
                {intelligence.advisory.keyInsights?.length > 0 && (
                  <p className="text-[11px] text-slate-500 dark:text-dark-400 pt-0.5 font-medium">
                    💡 {intelligence.advisory.keyInsights[0]}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. Historical Chart + Nearby Mandi Recommendations              */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Historical Price Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-dark-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-800 pb-3">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-dark-100 flex items-center gap-2">
              <LineChart className="text-emerald-600" size={17} /> 
              <span>{getTranslatedCropName(searchCrop)} {t('market.historical_chart') || 'Price History'}</span>
            </h3>

            {/* Timeline Period Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-800 p-1 rounded-xl">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setPeriodDays(d);
                    void fetchHistory(searchCrop, d);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    periodDays === d 
                      ? 'bg-white dark:bg-dark-900 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          <div className="h-[260px] sm:h-[280px] w-full">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full text-emerald-600">
                <div className="w-8 h-8 border-4 border-t-transparent border-emerald-500 rounded-full animate-spin"></div>
              </div>
            ) : history.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mandiPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    formatter={(value: any) => [`₹${value}`, 'Modal Rate']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #E2E8F0' }} 
                  />
                  <Area type="monotone" dataKey="avgPrice" stroke="#15803d" fillOpacity={1} fill="url(#mandiPriceGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
                <LineChart size={36} className="text-slate-300 mb-2 stroke-[1.5]" />
                <p className="font-bold text-xs text-slate-600 dark:text-dark-300">
                  {t('market.insufficient_trend') || 'Not enough historical data to show the trend.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Historical daily records for {getTranslatedCropName(searchCrop)} are being compiled. Live rates are updated in the directory below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nearby Mandi Recommendations (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-dark-800 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-dark-800 flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-dark-100 flex items-center gap-2">
              <Building2 className="text-emerald-600" size={17} />
              <span>
                {t('market.markets_near', { location: locationName || searchDistrict || searchState || 'Selected Location' }) || `Markets near ${locationName || searchDistrict || searchState || 'Selected Location'}`}
              </span>
            </h3>
            {hasLocalMandisWithin50Km && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {t('market.local_mandi_badge') || 'Within 50 km'}
              </span>
            )}
          </div>

          {comparison?.isNationalFallback && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-1.5 font-medium leading-relaxed">
                  <Globe size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{t('market.national_comparison_notice') || 'Showing National Benchmark Markets across India (Broader comparison, not local mandis)'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAllowNationalSearch(false);
                    fetchComparison(searchCrop, false);
                  }}
                  className="underline hover:text-amber-950 font-extrabold text-[10px] shrink-0"
                >
                  {t('market.reset_to_local') || 'Return to Local'}
                </button>
              </div>
            </div>
          )}

          {nearbyMandisWithDistances.length > 0 ? (
            <div className="space-y-2.5">
              {!userCoords && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <MapPin size={13} className="shrink-0" />
                  <span>{t('market.enable_location_tip') || 'Enable GPS for exact distance in km.'}</span>
                </div>
              )}

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {nearbyMandisWithDistances.map((c: any, idx: number) => {
                  const freshness = c.freshness;
                  return (
                    <div key={idx} className="p-3 bg-slate-50/80 dark:bg-dark-850 rounded-2xl border border-slate-150 dark:border-dark-800 flex items-center justify-between text-xs hover:border-emerald-300 transition-colors">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-slate-800 dark:text-dark-100 truncate">
                            {c.market}
                          </h4>
                          {c.scope === 'district' ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded">
                              District APMC
                            </span>
                          ) : c.scope === 'national' ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-700 dark:bg-dark-700 dark:text-dark-300 rounded">
                              National Benchmark
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-dark-400 mt-0.5 truncate">
                          {c.district}, {c.state}
                        </p>
                        
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {c.distanceMeta ? (
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              c.distanceMeta.tier === 'local'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : c.distanceMeta.tier === 'regional'
                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-dark-800 dark:text-dark-300'
                            }`}>
                              📍 {c.distanceMeta.label}
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-medium text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-dark-800 rounded">
                              {t('market.distance_unavailable') || 'Distance unavailable'}
                            </span>
                          )}

                          {freshness && (
                            <span className={`inline-block text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                              freshness.status === 'live'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : freshness.status === 'recent'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : freshness.status === 'moderate'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-dark-700 dark:text-dark-300'
                            }`}>
                              {freshness.label}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-sm sm:text-base text-emerald-700 dark:text-emerald-400 block">
                          {formatRupee(c.modalPrice)}
                        </span>
                        {c.priceDifference !== null && c.priceDifference !== 0 && (
                          <span className={`text-[10px] font-bold block ${
                            c.priceDifference > 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {c.priceDifference > 0 ? `+₹${c.priceDifference}` : `-₹${Math.abs(c.priceDifference)}`} vs Avg
                          </span>
                        )}
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Arrival: {c.arrivalDate || 'N/A'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-semibold space-y-3">
              <Building2 size={36} className="mx-auto text-slate-300 stroke-[1.5]" />
              <div>
                <p className="font-bold text-slate-700 dark:text-dark-200">
                  {t('market.no_nearby_found', { crop: getTranslatedCropName(searchCrop), location: locationName || searchState || 'this location' }) || `No nearby mandi prices found for ${getTranslatedCropName(searchCrop)} in ${locationName || searchState || 'this location'}.`}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Local APMC mandis have not reported arrivals for this commodity today.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAllowNationalSearch(true);
                  fetchComparison(searchCrop, true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95"
              >
                <Globe size={14} />
                <span>{t('market.search_across_india') || 'Search Across India (National Comparison)'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. Mandi Prices Directory (Responsive Cards & Desktop Table)   */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-dark-800 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-dark-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-dark-100">
              {getTranslatedCropName(searchCrop)} {t('market.mandi_rates_title') || 'Directory'}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Displaying reported APMC daily arrivals and modal rates
            </p>
          </div>

          {pagination && (
            <span className="text-xs font-bold text-slate-400">
              Total: {pagination.total || prices.length} mandis
            </span>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-12 text-center text-emerald-600">
            <div className="w-8 h-8 border-4 border-t-transparent border-emerald-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500 mt-3">Loading mandi rates...</p>
          </div>
        ) : prices.length > 0 ? (
          <>
            {/* MOBILE LAYOUT: Attractive Mandi Cards (No Horizontal Scrolling) */}
            <div className="block md:hidden space-y-3">
              {prices.map((p: any, idx: number) => (
                <div 
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-slate-200 dark:border-dark-800 space-y-2.5 text-left shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-dark-50">
                        {p.market || p.mandiName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-dark-400 font-medium">
                        {p.district}, {p.state}
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full shrink-0">
                      {getTranslatedCropName(p.crop)}
                    </span>
                  </div>

                  {/* Highlighted Modal Rate */}
                  <div className="p-3 bg-white dark:bg-dark-900 rounded-xl border border-slate-150 dark:border-dark-750 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block">
                        {t('market.modal_price') || 'Modal Rate'}
                      </span>
                      <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                        {formatRupee(p.modalPrice || p.avgPrice)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block">
                        Range (Min - Max)
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-dark-200">
                        {formatRupee(p.minPrice)} - {formatRupee(p.maxPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Footer Date & Freshness */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-medium">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>Arrival: {p.arrivalDate || (p.date ? new Date(p.date).toLocaleDateString('en-IN') : 'N/A')}</span>
                      {p.freshness && (
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          p.freshness.status === 'live'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : p.freshness.status === 'recent'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : p.freshness.status === 'moderate'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-dark-700 dark:text-dark-300'
                        }`}>
                          {p.freshness.label}
                        </span>
                      )}
                    </div>
                    <span>per {p.unit || 'Qtl'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP LAYOUT: Clean Aligned Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
                    <th className="py-3 px-3">{t('market.mandi_col') || 'Mandi / Market'}</th>
                    <th className="py-3 px-3">{t('market.district_state_col') || 'District & State'}</th>
                    <th className="py-3 px-3">{t('market.target_commodity') || 'Commodity'}</th>
                    <th className="py-3 px-3 text-right">{t('market.min_price') || 'Min Price'}</th>
                    <th className="py-3 px-3 text-right">{t('market.modal_price') || 'Modal Rate'}</th>
                    <th className="py-3 px-3 text-right">{t('market.max_price') || 'Max Price'}</th>
                    <th className="py-3 px-3 text-right">{t('market.date_col') || 'Arrival Date'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-850">
                  {prices.map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-dark-850/50 transition-colors">
                      <td className="py-3.5 px-3 font-extrabold text-slate-800 dark:text-dark-100">
                        {p.market || p.mandiName}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-dark-400">
                        {p.district}, {p.state}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-emerald-800 dark:text-emerald-400">
                        {getTranslatedCropName(p.crop)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-600 dark:text-dark-300">
                        {formatRupee(p.minPrice)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-sm text-emerald-700 dark:text-emerald-400">
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                          {formatRupee(p.modalPrice || p.avgPrice)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-600 dark:text-dark-300">
                        {formatRupee(p.maxPrice)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-400">
                        <div>
                          <span>{p.arrivalDate || (p.date ? new Date(p.date).toLocaleDateString('en-IN') : 'N/A')}</span>
                          {p.freshness && (
                            <span className={`block text-[9.5px] font-bold mt-0.5 ${
                              p.freshness.status === 'live'
                                ? 'text-emerald-600'
                                : p.freshness.status === 'recent'
                                ? 'text-emerald-700'
                                : p.freshness.status === 'moderate'
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}>
                              {p.freshness.label}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-dark-800 text-xs">
                <p className="text-slate-400 font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    disabled={page <= 1}
                    onClick={() => { const next = Math.max(1, page - 1); setPage(next); void fetchPrices(next); }} 
                    className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-dark-700 px-3 py-1.5 text-slate-700 dark:text-dark-200 hover:bg-slate-50 disabled:opacity-40 font-bold"
                  >
                    <ArrowLeft size={14} /> {t('common.prev') || 'Prev'}
                  </button>
                  <button 
                    type="button" 
                    disabled={page >= pagination.totalPages}
                    onClick={() => { const next = Math.min(pagination.totalPages, page + 1); setPage(next); void fetchPrices(next); }} 
                    className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-dark-700 px-3 py-1.5 text-slate-700 dark:text-dark-200 hover:bg-slate-50 disabled:opacity-40 font-bold"
                  >
                    {t('common.next') || 'Next'} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <p className="font-extrabold text-sm text-slate-600 dark:text-dark-200">
              {t('market.no_rates_found') || 'No mandi rates matched your active filters.'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No reported arrivals for {getTranslatedCropName(searchCrop)} in this state/district. Try searching another crop or resetting filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              {t('market.reset_filters') || 'Reset Filters'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketDashboard;
