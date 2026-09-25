import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LeafletMap } from '../components/LeafletMap';
import { 
  CloudSun, 
  MapPin, 
  TrendingUp, 
  Sprout, 
  AlertTriangle, 
  IndianRupee,
  Layers,
  ChevronRight,
  Search,
  ShieldAlert,
  Brain,
  Droplets,
  Bot,
  Globe,
  ScanEye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RegionalSettingsModal } from '../components/RegionalSettingsModal';
import { OnboardingModal } from '../components/OnboardingModal';
import { OnboardingChecklist } from '../components/OnboardingChecklist';
import { FarmerTimelineModal } from '../components/FarmerTimelineModal';

export const Dashboard: React.FC = () => {
  console.log('[KrishiMitra Startup Log] Loading Dashboard');
  const { user, setFarmLocationLocally } = useAuth();
  const { t, i18n } = useTranslation();

  const [weather, setWeather] = useState<any>(null);
  const [mandiPrices, setMandiPrices] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [irrigationData, setIrrigationData] = useState<any>(null);
  const [activeCropCycle, setActiveCropCycle] = useState<any>(null);
  const [boundary, setBoundary] = useState<[number, number][]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingMandi, setLoadingMandi] = useState(true);

  // Load Farm profile on mount to restore saved boundary
  useEffect(() => {
    const fetchFarmProfile = async () => {
      try {
        const res = await api.get('/crops/farm');
        if (res.data && res.data.success && res.data.farm) {
          const farm = res.data.farm;
          if (farm.boundary && farm.boundary.length > 0) {
            setBoundary(farm.boundary);
          }
        }
      } catch (err) {
        console.error('Failed to load saved farm profile:', err);
      }
    };
    fetchFarmProfile();
  }, []);

  const [activeLocation, setActiveLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    village?: string;
    city?: string;
    district?: string;
    state?: string;
    postcode?: string;
  }>(() => {
    const saved = localStorage.getItem('selectedLocation');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    if (user?.farmLocation?.latitude && user?.farmLocation?.longitude) {
      return {
        latitude: user.farmLocation.latitude,
        longitude: user.farmLocation.longitude,
        address: user.farmLocation.address || 'Detected Location'
      };
    }
    return {
      latitude: null,
      longitude: null,
      address: null
    };
  });

  const [locating, setLocating] = useState(false);
  const [, setLocationError] = useState<string | null>(null);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showRegionalModal, setShowRegionalModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const res = await api.get('/onboarding/status');
        if (res.data?.success && res.data.status) {
          if (res.data.status.status === 'NOT_STARTED' || res.data.status.status === 'IN_PROGRESS') {
            setShowOnboardingModal(true);
          }
        }
      } catch (err) {
        console.error('Failed to check onboarding status:', err);
      }
    };
    if (user) {
      checkOnboarding();
    }
  }, [user]);

  const [showExpiryModal, setShowExpiryModal] = useState(() => {
    if (user?.subscriptionStatus === 'expired') {
      const dismissed = localStorage.getItem('premium-expiry-dismissed');
      return !dismissed;
    }
    return false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [diseaseHistory, setDiseaseHistory] = useState<any[]>([]);

  const getTrialDaysRemaining = (): number => {
    if (!user?.trialEndDate) return 0;
    const diffTime = new Date(user.trialEndDate).getTime() - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const trialDaysLeft = getTrialDaysRemaining();
  const isTrialActive = user?.subscriptionStatus === 'trialing' && trialDaysLeft > 0;
  const shouldShowExpiringAlert = isTrialActive && [30, 15, 7, 3, 1].includes(trialDaysLeft);

  // Geolocation effect on mount
  useEffect(() => {
    const requestGeolocation = () => {
      if (activeLocation.latitude && activeLocation.longitude) return;

      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser.');
        return;
      }

      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await api.get(`/weather/reverse-geocode?lat=${latitude}&lon=${longitude}`);
            if (res.data && res.data.success) {
              const address = res.data.state ? `${res.data.city}, ${res.data.state}` : res.data.city;
              const newLoc = { latitude, longitude, address };
              setActiveLocation(newLoc);
              localStorage.setItem('selectedLocation', JSON.stringify(newLoc));
              if (user) {
                setFarmLocationLocally(newLoc);
                try {
                  await api.put('/auth/settings', {
                    language: i18n.language,
                    theme: user.settings?.theme || 'light',
                    farmLocation: newLoc
                  });
                } catch (saveErr) {
                  console.error('Failed to save geolocated settings:', saveErr);
                }
              }
            }
          } catch (err) {
            console.error('Error reverse geocoding location:', err);
            const fallbackLoc = { latitude, longitude, address: 'Detected Location' };
            setActiveLocation(fallbackLoc);
            localStorage.setItem('selectedLocation', JSON.stringify(fallbackLoc));
          } finally {
            setLocating(false);
          }
        },
        (error) => {
          console.warn('Geolocation access denied:', error);
          setLocating(false);
          setLocationError('Permission denied');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    requestGeolocation();
  }, []);

  // Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError(null);
        const res = await api.get(`/weather/geocode?query=${encodeURIComponent(searchQuery)}`);
        if (res.data && res.data.success) {
          setSuggestions(res.data.suggestions || []);
        }
      } catch (err) {
        console.error('Geocoding search failed:', err);
        setSearchError('Failed to fetch suggestions');
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Main data fetching effect
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activeLocation.latitude || !activeLocation.longitude) {
        setLoadingWeather(false);
        setLoadingMandi(false);
        return;
      }

      // 1. Weather
      try {
        setLoadingWeather(true);
        const res = await api.get(`/weather?lat=${activeLocation.latitude}&lon=${activeLocation.longitude}&lang=${i18n.language}`);
        if (res.data && res.data.success) {
          setWeather(res.data.weather);
        }
      } catch (err) {
        console.error('Error loading weather dashboard:', err);
      } finally {
        setLoadingWeather(false);
      }

      // 2. Mandi price trends
      try {
        setLoadingMandi(true);
        const addressParts = activeLocation.address?.split(',') || [];
        const stateName = addressParts[addressParts.length - 1]?.trim() || 'Gujarat';
        const res = await api.get(`/market/search?state=${encodeURIComponent(stateName)}&crop=Wheat&lang=${i18n.language}`);
        if (res.data && res.data.success) {
          setMandiPrices(res.data.prices.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading mandi prices dashboard:', err);
      } finally {
        setLoadingMandi(false);
      }

      // 3. Disease History
      try {
        const res = await api.get('/diseases/history?limit=1');
        if (res.data && res.data.success) {
          setDiseaseHistory(res.data.history || []);
        }
      } catch (err) {
        console.warn('Failed to load disease history:', err);
      }
    };

    const fetchFinancials = async () => {
      try {
        const res = await api.get('/expenses/summary');
        if (res.data && res.data.success) {
          setFinancials(res.data.summary);
        }
      } catch (err) {
        console.error('Error loading financials dashboard:', err);
      }
    };

    const fetchPredictions = async () => {
      try {
        const res = await api.get('/predictions');
        if (res.data && res.data.success) {
          setPredictions(res.data);
        }
      } catch (err) {
        console.warn('Error loading predictive risk data:', err);
      }
    };

    const fetchIrrigation = async () => {
      try {
        const res = await api.get('/irrigation/status');
        if (res.data && res.data.success) {
          setIrrigationData(res.data);
        }
      } catch (err) {
        console.warn('Error loading irrigation status:', err);
      }
    };

    const fetchCropCycles = async () => {
      try {
        const res = await api.get('/crop-cycles');
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const activeList = res.data.data.filter((c: any) => c.status !== 'COMPLETED' && c.status !== 'CANCELLED');
          if (activeList.length > 0) {
            setActiveCropCycle(activeList[0]);
          }
        }
      } catch (err) {
        console.warn('Error loading active crop cycle:', err);
      }
    };

    fetchDashboardData();
    fetchFinancials();
    if (user) {
      fetchPredictions();
      fetchIrrigation();
      fetchCropCycles();
    }
  }, [activeLocation.latitude, activeLocation.longitude, i18n.language]);

  // Map boundary handler
  const handleMapBoundaryChange = async (coords: [number, number][]) => {
    setBoundary(coords);
    if (coords.length > 0) {
      try {
        await api.post('/crops/farm', {
          name: `${user?.name || 'Farmer'}'s Field`,
          boundary: coords,
          latitude: activeLocation.latitude || coords[0][0],
          longitude: activeLocation.longitude || coords[0][1]
        });
      } catch (err) {
        console.error('Failed to autosave boundary:', err);
      }
    }
  };

  const handleLocationSelect = async (loc: any) => {
    const newLoc = {
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.address,
      village: loc.village,
      city: loc.city,
      district: loc.district,
      state: loc.state,
      postcode: loc.postcode || ''
    };
    setActiveLocation(newLoc);
    localStorage.setItem('selectedLocation', JSON.stringify(newLoc));
    if (user) {
      setFarmLocationLocally(newLoc);
      try {
        await api.put('/auth/settings', {
          language: i18n.language,
          theme: user.settings?.theme || 'light',
          farmLocation: newLoc
        });
      } catch (saveErr) {
        console.error('Failed to save selected location:', saveErr);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Onboarding Activation Checklist */}
      <OnboardingChecklist onOpenModal={() => setShowOnboardingModal(true)} />

      {/* SINGLE WELCOME & FARM SUMMARY TOP BAR */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-extrabold bg-brand-600/60 px-3 py-1 rounded-full uppercase tracking-wider">
              {user?.name ? `${user.name}'s Field` : 'My Farm'}
            </span>
            {activeLocation.address && (
              <span className="text-[10px] font-bold bg-brand-800/80 text-brand-100 px-3 py-1 rounded-full flex items-center gap-1">
                <MapPin size={12} /> {activeLocation.address}
              </span>
            )}
            {isTrialActive && (
              <span className="text-[10px] font-bold bg-amber-500/80 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                Trial: {trialDaysLeft} days left
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-2">
            Good morning, {user?.name || 'Farmer'}
          </h1>
          <p className="text-brand-100 text-xs mt-1 font-medium">
            Here's what matters for your farm today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowRegionalModal(true)}
            className="px-3.5 py-2.5 bg-brand-800/60 hover:bg-brand-800 border border-brand-500/40 text-white font-bold rounded-xl text-xs md:text-sm transition-all duration-150 flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Globe size={16} /> Regional Config
          </button>
          <Link 
            to="/reports" 
            className="px-4 py-2.5 bg-white text-brand-800 hover:bg-brand-50 font-bold rounded-xl text-xs md:text-sm transition-all duration-150 flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Layers size={16} /> PDF Reports
          </Link>
        </div>
      </div>

      {/* Trial Reminders */}
      {shouldShowExpiringAlert && (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/35 p-4 rounded-2xl text-xs md:text-sm text-amber-800 dark:text-amber-400 font-bold flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>⚠️ Your Premium Trial will expire in {trialDaysLeft} day{trialDaysLeft > 1 ? 's' : ''}.</span>
          <Link to="/pricing" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors shrink-0">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* SECTION 1: TODAY (Weather, Crop Lifecycle, Smart Irrigation) */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-dark-500 mb-3 px-1">
          Today's Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weather Card */}
          <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudSun className="text-brand-600 dark:text-brand-400" size={20} />
                <h3 className="font-extrabold text-sm text-gray-800 dark:text-dark-100">Weather</h3>
              </div>
              <button
                onClick={() => setShowLocationModal(true)}
                className="text-[11px] text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                Change Location
              </button>
            </div>

            {loadingWeather ? (
              <div className="py-6 flex justify-center"><div className="w-6 h-6 border-2 border-t-transparent border-brand-500 rounded-full animate-spin"></div></div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-gray-800 dark:text-dark-50">
                    {weather?.current?.temp != null ? `${weather.current.temp}°C` : '--'}
                  </span>
                  <span className="text-xs font-bold text-gray-600 dark:text-dark-300 uppercase">
                    {weather?.current?.condition || 'Clear'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 dark:bg-dark-850 p-2.5 rounded-xl text-gray-600 dark:text-dark-300 font-medium">
                  <div>Humidity: <span className="font-bold text-gray-800 dark:text-dark-100">{weather?.current?.humidity || 60}%</span></div>
                  <div>Rain Chance: <span className="font-bold text-gray-800 dark:text-dark-100">{weather?.current?.rainProb || 10}%</span></div>
                </div>
              </div>
            )}

            <Link to="/weather" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-between pt-1 border-t border-gray-100 dark:border-dark-800">
              <span>View Full Forecast</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Crop Status Card */}
          <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2">
              <Sprout className="text-emerald-600 dark:text-emerald-400" size={20} />
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-dark-100">Crop Status</h3>
            </div>

            {activeCropCycle ? (
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Active Crop
                </span>
                <h4 className="font-extrabold text-base text-gray-800 dark:text-dark-100">
                  {activeCropCycle.cropName} {activeCropCycle.variety ? `(${activeCropCycle.variety})` : ''}
                </h4>
                <p className="text-xs text-gray-500 dark:text-dark-400">
                  Stage: <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeCropCycle.currentStage || 'Growing'}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-1 py-2">
                <p className="text-xs font-bold text-gray-700 dark:text-dark-200">No active crop cycle logged</p>
                <p className="text-[11px] text-gray-400">Add a crop cycle to track stages & advisory.</p>
              </div>
            )}

            <Link to="/crop-cycles" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-between pt-1 border-t border-gray-100 dark:border-dark-800">
              <span>{activeCropCycle ? 'Manage Lifecycle' : 'Add Crop Cycle'}</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Smart Irrigation Card */}
          <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2">
              <Droplets className="text-blue-600 dark:text-blue-400" size={20} />
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-dark-100">Smart Irrigation</h3>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                {irrigationData?.recommendation?.status ? irrigationData.recommendation.status.replace(/_/g, ' ') : 'Normal'}
              </span>
              <p className="text-xs text-gray-600 dark:text-dark-300 font-medium leading-relaxed line-clamp-2">
                {irrigationData?.recommendation?.summary || 'Irrigation levels are normal today based on soil moisture and weather.'}
              </p>
            </div>

            <Link to="/irrigation" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between pt-1 border-t border-gray-100 dark:border-dark-800">
              <span>View Irrigation Hub</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: ACTION NEEDED */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 p-5 rounded-3xl space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-amber-600 dark:text-amber-400" size={18} />
          <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">Action Needed Today</h3>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
          {weather?.current?.temp > 35 
            ? 'High afternoon temperature predicted (35°C+). Inspect soil moisture levels and ensure proper field irrigation.'
            : activeCropCycle 
              ? `Perform routine morning field check for ${activeCropCycle.cropName} to inspect canopy growth & moisture.`
              : 'Check nearby mandi market prices before scheduling your harvest sales.'}
        </p>
      </div>

      {/* SECTION 3: YOUR FARM (Crop Health & Today's Tasks) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crop Health Card */}
        <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
            <div className="flex items-center gap-2">
              <ScanEye className="text-red-500" size={20} />
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100">Crop Health</h3>
            </div>
            <Link to="/disease" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center">
              View Scan <ChevronRight size={14} />
            </Link>
          </div>
          <p className="text-xs text-gray-600 dark:text-dark-300 font-medium">
            {diseaseHistory.length > 0
              ? `Latest scan on ${diseaseHistory[0].crop || 'crop'}: ${diseaseHistory[0].diseaseName} (${diseaseHistory[0].severity || 'moderate'} severity).`
              : 'No recent crop scan logged. Perform a leaf scan to detect early signs of crop disease.'}
          </p>
          <Link
            to="/disease"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            {diseaseHistory.length > 0 ? 'Scan Another Leaf' : 'Perform Leaf Scan'}
          </Link>
        </div>

        {/* Today's Tasks Card */}
        <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100">Today's Tasks</h3>
            <Link to="/crop-cycles" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center">
              View All Tasks →
            </Link>
          </div>
          <div className="space-y-2 text-xs text-gray-700 dark:text-dark-200 font-medium">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500" defaultChecked />
              <span>Morning Soil & Canopy Check</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500" />
              <span>Weather & Irrigation Review</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500" />
              <span>Check Mandi Selling Price Trends</span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 4: FARM INTELLIGENCE (Market & Risk Outlook) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mandi Market Snapshot */}
        <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-brand-600 dark:text-brand-400" size={20} />
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100">Today's Market Snapshot</h3>
            </div>
            <Link to="/market" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center">
              View Market <ChevronRight size={14} />
            </Link>
          </div>
          {loadingMandi ? (
            <div className="py-4 text-center text-xs text-gray-400">Loading market prices...</div>
          ) : mandiPrices.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-dark-800">
              {mandiPrices.slice(0, 3).map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-800 dark:text-dark-100">{item.crop}</span>
                    <span className="text-[10px] text-gray-400 block">{item.mandiName} ({item.state})</span>
                  </div>
                  <span className="font-extrabold text-gray-800 dark:text-dark-100">
                    {(!item.avgPrice && item.avgPrice !== 0) || (item.avgPrice === 0 && !item.isTrulyZero) ? 'Price Not Available' : `₹${item.avgPrice} / Quintal`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No market prices found for nearby mandis.</p>
          )}
        </div>

        {/* Farm Risks Snapshot */}
        <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-brand-600 dark:text-brand-400" size={20} />
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100">Farm Risks</h3>
            </div>
            <Link to="/predictive-intelligence" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center">
              View all risks →
            </Link>
          </div>
          {predictions && predictions.signals && predictions.signals.length > 0 ? (
            <div className="space-y-2">
              {predictions.signals.slice(0, 3).map((sig: any) => (
                <div key={sig.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-dark-850 rounded-xl">
                  <span className="font-bold text-gray-800 dark:text-dark-100 capitalize">{sig.category} Risk</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    sig.level === 'high' ? 'bg-red-100 text-red-700' : sig.level === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    [{sig.level}] {sig.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold py-2">
              ✓ Your farm looks stable today. No high risks detected.
            </p>
          )}
        </div>
      </div>

      {/* SECTION 5: FARM LOCATION MAP & FINANCES */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Map Card */}
        <div className="md:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-5 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="text-brand-600 dark:text-brand-400" size={20} />
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100">Farm Location</h3>
            </div>
            <button onClick={() => setShowLocationModal(true)} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              View / Edit Farm
            </button>
          </div>
          <div className="h-[200px] w-full rounded-2xl overflow-hidden">
            <LeafletMap 
              initialCenter={activeLocation.latitude && activeLocation.longitude ? [activeLocation.latitude, activeLocation.longitude] : [20.5937, 78.9629]}
              boundary={boundary}
              onBoundaryChange={handleMapBoundaryChange}
              onLocationSelect={handleLocationSelect}
              markers={activeLocation.latitude && activeLocation.longitude ? [
                {
                  position: [activeLocation.latitude, activeLocation.longitude],
                  title: 'My Farm Location',
                  popupText: activeLocation.address || 'My Fields',
                  type: 'farm'
                }
              ] : []}
            />
          </div>
        </div>

        {/* Farm Finances */}
        <div className="md:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-5 border border-gray-100 dark:border-dark-800/30 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-800 pb-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="text-brand-600 dark:text-brand-400" size={20} />
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100">Farm Finances</h3>
            </div>
            <Link to="/expenses" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              View finances
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Income</span>
              <span className="block text-base font-extrabold text-emerald-600 mt-1">₹{financials?.totalIncome || 0}</span>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-2xl border border-red-100 dark:border-red-900/30">
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Expenses</span>
              <span className="block text-base font-extrabold text-red-600 mt-1">₹{financials?.totalExpense || 0}</span>
            </div>
          </div>

          <Link to="/expenses" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline block text-center pt-2 border-t border-gray-100 dark:border-dark-800">
            {financials?.totalIncome || financials?.totalExpense ? 'Manage Ledger Logbook' : 'No financial records yet — Add record'}
          </Link>
        </div>
      </div>

      {/* SECTION 6: COMPACT INTELLIGENCE ENTRY POINTS (Copilot & Agents) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ask Copilot Entry */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-7 h-7 text-brand-200" />
            <div>
              <h4 className="font-extrabold text-sm">Ask your farm anything</h4>
              <p className="text-xs text-brand-100 font-medium">"What should I do today?"</p>
            </div>
          </div>
          <Link to="/copilot" className="px-4 py-2 bg-white text-brand-800 rounded-xl font-bold text-xs shadow-sm hover:bg-brand-50 transition-colors shrink-0">
            Ask Copilot
          </Link>
        </div>

        {/* Farm Agents Entry */}
        <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-7 h-7 text-brand-400" />
            <div>
              <h4 className="font-extrabold text-sm">Farm Intelligence</h4>
              <p className="text-xs text-slate-400 font-medium">5 specialized agents active</p>
            </div>
          </div>
          <Link to="/agents" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs shadow-sm transition-colors shrink-0">
            Open Agent Center
          </Link>
        </div>
      </div>

      {/* LOCATION SEARCH MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-left flex flex-col max-h-[80vh]">
            <button
              onClick={() => { setShowLocationModal(false); setSearchQuery(''); setSuggestions([]); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-dark-100 font-extrabold text-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ✕
            </button>

            <h2 className="text-lg font-extrabold text-gray-800 dark:text-dark-50 tracking-tight mb-1">
              Select Location
            </h2>
            <p className="text-[11px] text-gray-400 mb-4 font-semibold">
              Search by City, District, or State in India to fetch today's weather.
            </p>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location (e.g. Nagpur, Rajkot...)"
                className="custom-input text-xs pl-8"
                autoFocus
              />
              <span className="absolute left-2.5 top-2.5 text-gray-400">
                <Search size={14} />
              </span>
            </div>

            {/* Suggestions list */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-1.5 pr-1 min-h-[180px]">
              {searching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
                </div>
              ) : searchError ? (
                <p className="text-center text-xs text-red-500 py-6 font-bold">{searchError}</p>
              ) : suggestions.length > 0 ? (
                suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      const newLoc = {
                        latitude: sug.lat,
                        longitude: sug.lon,
                        address: sug.state ? `${sug.city}, ${sug.state}` : sug.city
                      };
                      setActiveLocation(newLoc);
                      localStorage.setItem('selectedLocation', JSON.stringify(newLoc));
                      
                      if (user) {
                        setFarmLocationLocally(newLoc);
                        try {
                          await api.put('/auth/settings', {
                            language: i18n.language,
                            theme: user.settings?.theme || 'light',
                            farmLocation: newLoc
                          });
                        } catch (saveErr) {
                          console.error('Failed to save selected location to backend:', saveErr);
                        }
                      }
                      
                      setShowLocationModal(false);
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-dark-850 rounded-xl border border-gray-100/50 dark:border-dark-850 text-xs font-bold text-gray-700 dark:text-dark-250 transition-colors flex flex-col gap-0.5"
                  >
                    <span>{sug.city}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{sug.state ? `${sug.state}, ` : ''}{sug.country}</span>
                  </button>
                ))
              ) : searchQuery.trim() ? (
                <p className="text-center text-xs text-gray-450 py-8">No matching locations found.</p>
              ) : (
                <div className="text-center py-4 text-gray-400 space-y-2">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400/80">Popular Indian Farming Centers</p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {[
                      { city: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905 },
                      { city: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
                      { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
                      { city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 }
                    ].map((pop, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={async () => {
                          const newLoc = {
                            latitude: pop.lat,
                            longitude: pop.lon,
                            address: `${pop.city}, ${pop.state}`
                          };
                          setActiveLocation(newLoc);
                          localStorage.setItem('selectedLocation', JSON.stringify(newLoc));
                          if (user) {
                            setFarmLocationLocally(newLoc);
                            try {
                              await api.put('/auth/settings', {
                                language: i18n.language,
                                theme: user.settings?.theme || 'light',
                                farmLocation: newLoc
                              });
                            } catch (saveErr) {
                              console.error(saveErr);
                            }
                          }
                          setShowLocationModal(false);
                        }}
                        className="p-2.5 text-center bg-gray-50/50 dark:bg-dark-850 hover:bg-brand-50 dark:hover:bg-brand-950/20 text-gray-700 dark:text-dark-250 border rounded-xl text-[10px] font-bold transition-all duration-150"
                      >
                        {pop.city}, {pop.state}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM EXPIRY MODAL */}
      {showExpiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-red-650 dark:text-red-400 tracking-tight flex items-center gap-2">
              ⚠️ Your Premium Plan Has Expired
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-300 leading-relaxed font-medium">
              Your Premium plan expired on <span className="font-extrabold text-slate-805 dark:text-dark-100">{user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString('en-IN') : 'N/A'}</span>. Renew your plan to continue enjoying premium features.
            </p>
            <div className="bg-slate-50 dark:bg-dark-950 p-4 rounded-2xl border border-slate-100 dark:border-dark-850 text-xs text-slate-655 dark:text-dark-300 space-y-2">
              <div className="flex justify-between font-medium">
                <span>Previous Plan:</span>
                <span className="font-bold text-slate-805 dark:text-dark-100 uppercase">Premium</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Expiry Date:</span>
                <span className="font-bold text-slate-805 dark:text-dark-100">{user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString('en-IN') : 'N/A'}</span>
              </div>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  setShowExpiryModal(false);
                  localStorage.setItem('premium-expiry-dismissed', 'true');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-dark-200 text-xs font-bold rounded-xl transition-all min-h-[38px]"
              >
                Maybe Later
              </button>
              <a
                href="/pricing"
                onClick={() => {
                  setShowExpiryModal(false);
                }}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl text-center shadow-md shadow-brand-600/20 transition-all min-h-[38px] flex items-center justify-center"
              >
                Renew Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Regional Intelligence Settings Modal */}
      <RegionalSettingsModal
        isOpen={showRegionalModal}
        onClose={() => setShowRegionalModal(false)}
      />

      {/* Farmer Fast Start Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onCompleted={() => {
          setShowOnboardingModal(false);
          window.location.reload();
        }}
      />

      {/* Chronological Farm Activity Timeline Modal */}
      <FarmerTimelineModal
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
      />
    </div>
  );
};

export default Dashboard;
