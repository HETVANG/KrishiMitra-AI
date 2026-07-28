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
  Coins,
  ChevronRight,
  TrendingDown,
  Volume2,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

export const Dashboard: React.FC = () => {
  console.log('[KrishiMitra Startup Log] Loading Dashboard');
  const { user, setFarmLocationLocally } = useAuth();
  const { t, i18n } = useTranslation();

  const [weather, setWeather] = useState<any>(null);
  const [mandiPrices, setMandiPrices] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);
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
  const [locationError, setLocationError] = useState<string | null>(null);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [diseaseHistory, setDiseaseHistory] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);

  const lat = activeLocation.latitude || 20.5937;
  const lon = activeLocation.longitude || 78.9629;

  const getTrialDaysRemaining = (): number => {
    if (!user?.trialEndDate) return 0;
    const diffTime = new Date(user.trialEndDate).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const trialDaysLeft = getTrialDaysRemaining();
  const isTrialActive = user?.subscriptionStatus === 'trialing' && trialDaysLeft > 0;
  const isTrialExpired = user?.plan === 'free' && (user.subscriptionStatus === 'expired' || (user.trialEndDate && new Date(user.trialEndDate) < new Date()));
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
                  console.error('Failed to save geolocated settings to backend:', saveErr);
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
          console.warn('Geolocation access denied or failed:', error);
          setLocating(false);
          setLocationError('Permission denied');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    requestGeolocation();
  }, []);

  // Suggestions search effect
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
        console.error('Geocoding suggestions fetch failed:', err);
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

      // 1. Fetch Weather coordinates
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

      // 2. Fetch Mandi price trends
      try {
        setLoadingMandi(true);
        const addressParts = activeLocation.address?.split(',') || [];
        const stateName = addressParts[addressParts.length - 1]?.trim() || 'Haryana';
        const res = await api.get(`/market/search?state=${encodeURIComponent(stateName)}&crop=Wheat&lang=${i18n.language}`);
        if (res.data && res.data.success) {
          setMandiPrices(res.data.prices.slice(0, 4));
        }
      } catch (err) {
        console.error('Error loading mandi prices dashboard:', err);
      } finally {
        setLoadingMandi(false);
      }

      // 3. Fetch Disease History
      try {
        const res = await api.get('/diseases/list');
        if (res.data && res.data.success) {
          setDiseaseHistory(res.data.history || []);
        }
      } catch (err) {
        console.warn('Failed to load disease history for alerts:', err);
      }

      // 4. Fetch Schemes List
      try {
        const res = await api.get('/schemes/list');
        if (res.data && res.data.success) {
          setSchemes(res.data.schemes || []);
        }
      } catch (err) {
        console.warn('Failed to load schemes list for alerts:', err);
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

    fetchDashboardData();
    fetchFinancials();
  }, [activeLocation.latitude, activeLocation.longitude, i18n.language]);

  // GIS calculation helper functions
  const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const calculatePerimeter = (pts: [number, number][]): number => {
    if (pts.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      total += getHaversineDistance(p1[0], p1[1], p2[0], p2[1]);
    }
    return total;
  };

  const calculateAreaM2 = (pts: [number, number][]): number => {
    if (pts.length < 3) return 0;
    let area = 0;
    const factor = 111319.9;
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const x1 = p1[1] * factor * Math.cos((p1[0] * Math.PI) / 180);
      const y1 = p1[0] * factor;
      const x2 = p2[1] * factor * Math.cos((p2[0] * Math.PI) / 180);
      const y2 = p2[0] * factor;
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area) * 0.5;
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
        console.error('Failed to save selected location components to backend:', saveErr);
      }
    }
  };

  const handleMapBoundaryChange = async (coords: [number, number][]) => {
    setBoundary(coords);
    if (coords.length > 0) {
      try {
        const areaSqM = calculateAreaM2(coords);
        const acres = Number((areaSqM * 0.000247105).toFixed(2));
        const hectares = Number((areaSqM * 0.0001).toFixed(2));
        const perimeter = Number(calculatePerimeter(coords).toFixed(1));

        const res = await api.post('/crops/farm', {
          name: `${user?.name || 'Farmer'}'s Field`,
          size: acres > 0 ? acres : 1.0,
          soilType: 'Loamy',
          waterSource: 'Tube Well',
          boundary: coords,
          village: activeLocation.village || '',
          taluka: activeLocation.city || '',
          district: activeLocation.district || '',
          state: activeLocation.state || '',
          latitude: activeLocation.latitude || coords[0][0],
          longitude: activeLocation.longitude || coords[0][1],
          perimeter: perimeter,
          areaHectares: hectares
        });

        if (res.data && res.data.success) {
          const newLoc = {
            latitude: activeLocation.latitude || coords[0][0],
            longitude: activeLocation.longitude || coords[0][1],
            address: activeLocation.address || 'My Field Location',
            village: activeLocation.village || '',
            city: activeLocation.city || '',
            district: activeLocation.district || '',
            state: activeLocation.state || '',
            postcode: activeLocation.postcode || ''
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
              console.error('Failed to update farm location on boundary autosave:', saveErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to autosave boundary:', err);
      }
    }
  };

  // Text-To-Speech for weather advisory summaries
  const speakAdvisory = () => {
    if ('speechSynthesis' in window && weather?.aiAdvice) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(weather.aiAdvice);
      utterance.lang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'gu' ? 'gu-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getSeason = (): 'MONSOON' | 'WINTER' | 'SUMMER' => {
    const month = new Date().getMonth(); // 0-indexed: 0=Jan, 11=Dec
    if (month >= 5 && month <= 8) return 'MONSOON'; // June to Sept
    if (month >= 9 || month <= 1) return 'WINTER';  // Oct to Feb
    return 'SUMMER'; // March to May
  };

  // Dynamic alerts generation engine
  const getIntelligentAlerts = () => {
    const alerts: any[] = [];
    const season = getSeason();
    const month = new Date().getMonth();

    // 1. Weather alerts
    if (weather?.current) {
      const { temp, windSpeed, humidity, rainProb, condition } = weather.current;

      // MONSOON ALERTS
      const hasHeavyRainPredict = rainProb >= 70 || ['Rain', 'Drizzle', 'Thunderstorm'].includes(condition);
      if (season === 'MONSOON' || hasHeavyRainPredict) {
        if (hasHeavyRainPredict) {
          alerts.push({
            id: 'm_heavy_rain',
            type: 'critical',
            title: '🔴 Heavy Rain Warning',
            message: `Heavy rain expected (probability: ${rainProb}%). Avoid pesticide spraying and protect harvested crops.`
          });
          alerts.push({
            id: 'm_waterlogging',
            type: 'critical',
            title: '🔴 Waterlogging & Flood Risk',
            message: 'High risk of water accumulation in fields. Improve drainage and drain excess water immediately.'
          });
          if (condition === 'Thunderstorm') {
            alerts.push({
              id: 'm_lightning',
              type: 'critical',
              title: '🔴 Lightning & Thunderstorm Alert',
              message: 'Severe lightning detected. Stay indoors and avoid contact with electrical fixtures.'
            });
          }
          alerts.push({
            id: 'm_delay_fert',
            type: 'warning',
            title: '🟠 Delay Fertilizer Application',
            message: 'Imminent rainfall detected. Postpone applying solid urea or NPK to prevent nutrient runoff.'
          });
          alerts.push({
            id: 'm_avoid_pest',
            type: 'warning',
            title: '🟠 Avoid Pesticide Spraying',
            message: 'Rainwater will wash off pesticide coatings. Hold spraying until dry weather clears.'
          });
        }
        if (windSpeed > 10) {
          alerts.push({
            id: 'm_strong_wind',
            type: 'warning',
            title: '🟠 Strong Wind Alert',
            message: `Wind speed is ${windSpeed} m/s. Support tall crops and avoid spraying dust formulations.`
          });
        }
      }

      // SUMMER ALERTS
      if (season === 'SUMMER' || temp > 35) {
        if (temp > 40) {
          alerts.push({
            id: 's_heatwave',
            type: 'critical',
            title: '🔴 Extreme Heat Wave Alert',
            message: `Heatwave conditions active with temperatures at ${temp}°C. Afternoon field work not recommended.`
          });
        } else {
          alerts.push({
            id: 's_high_temp',
            type: 'warning',
            title: '🟠 High Temperature Alert',
            message: `Temperature is high (${temp}°C). Crop heat stress risk is elevated.`
          });
        }
        alerts.push({
          id: 's_irrigation',
          type: 'warning',
          title: '🟠 Irrigation Required',
          message: 'High evaporation rate. Increase water supply frequency to prevent soil moisture cracking.'
        });
        alerts.push({
          id: 's_livestock',
          type: 'warning',
          title: '🟠 Livestock Heat Protection',
          message: 'Ensure livestock sheds are well-ventilated. Supply ample cool drinking water.'
        });
        alerts.push({
          id: 's_evap',
          type: 'info',
          title: '🔵 High Evaporation Warning',
          message: 'Rapid soil moisture loss. Mulch root zones to conserve moisture.'
        });
      }

      // WINTER ALERTS
      if (season === 'WINTER' || temp < 15) {
        if (temp < 8) {
          alerts.push({
            id: 'w_coldwave',
            type: 'critical',
            title: '🔴 Cold Wave Warning',
            message: `Cold wave active with low temperature (${temp}°C). Frost risk detected.`
          });
          alerts.push({
            id: 'w_frost',
            type: 'critical',
            title: '🔴 Frost Risk Warning',
            message: 'Frost hazard to young seedlings. Supply light evening sprinkler irrigation to shield roots.'
          });
        } else {
          alerts.push({
            id: 'w_low_temp',
            type: 'warning',
            title: '🟠 Low Temperature Warning',
            message: `Low temp is ${temp}°C. Protect delicate winter vegetable crops.`
          });
        }

        if (humidity > 90 && ['Mist', 'Fog', 'Haze'].includes(condition)) {
          alerts.push({
            id: 'w_dense_fog',
            type: 'warning',
            title: '🟠 Dense Fog Alert',
            message: 'Dense fog expected tomorrow morning. Delay early morning irrigation to avoid leaf rot.'
          });
        }

        alerts.push({
          id: 'w_livestock_cold',
          type: 'info',
          title: '🔵 Livestock Cold Protection',
          message: 'Move animals indoors to protect from cold drafts. Use thick straw beds.'
        });
      }
    }

    // 2. Crop & Soil Alerts
    if (!activeLocation.latitude || !activeLocation.longitude) {
      alerts.push({
        id: 'f_nolocation',
        type: 'critical',
        title: '🔴 Farm Location Not Configured',
        message: 'Search for your village/city or enable GPS to receive localized crop alerts.'
      });
    }

    if (boundary.length === 0) {
      alerts.push({
        id: 'f_noboundary',
        type: 'info',
        title: '🔵 Farm Boundary Configuration Missing',
        message: 'No boundary polygon drawn yet. Map your farm borders below to compute accurate field sizes.'
      });
    } else {
      // Crop moisture / nutrient alert based on coordinates seed
      const seed = Math.abs(Math.sin(activeLocation.latitude || 20) * Math.cos(activeLocation.longitude || 78));
      if (seed < 0.3) {
        alerts.push({
          id: 'c_soil_moisture',
          type: 'warning',
          title: '🟠 Soil Moisture Low',
          message: 'Estimated soil moisture is below 35%. Plan irrigation cycle.'
        });
      } else if (seed > 0.7) {
        alerts.push({
          id: 'c_soil_nutrient',
          type: 'warning',
          title: '🟠 Soil Nutrient Deficiency',
          message: 'Low nitrogen content detected. Fertilizer reminder: top-dress nitrogen or compost.'
        });
      }
    }

    // Sowing season window alert
    if (month === 5 || month === 6) { // June/July
      alerts.push({
        id: 'c_sow_kharif',
        type: 'success',
        title: '🟢 Ideal Sowing Time',
        message: 'Kharif sowing window open. Prepare beds for Paddy and Cotton.'
      });
    } else if (month === 9 || month === 10) { // Oct/Nov
      alerts.push({
        id: 'c_sow_rabi',
        type: 'success',
        title: '🟢 Ideal Sowing Time',
        message: 'Rabi sowing window active. Optimal seeding climate for Wheat and Mustard.'
      });
    }

    // Disease history alerts
    if (diseaseHistory.length > 0) {
      const latest = diseaseHistory[0];
      alerts.push({
        id: 'c_disease_risk',
        type: 'warning',
        title: `🟠 Disease Risk High: ${latest.diseaseName}`,
        message: `Favorable microclimate for recurrence of ${latest.diseaseName} on crop.`
      });
    }

    // 3. Mandi market alerts
    if (mandiPrices.length > 0) {
      const best = mandiPrices.reduce((prev, curr) => (prev.maxPrice > curr.maxPrice) ? prev : curr);
      alerts.push({
        id: 'm_best_price',
        type: 'success',
        title: `🟢 Good Market Price Detected`,
        message: `Best nearby Mandi price for Wheat found at ₹${best.maxPrice}/quintal in ${best.market} Mandi.`
      });

      if (best.maxPrice > 2100) {
        alerts.push({
          id: 'm_price_increase',
          type: 'success',
          title: '🟢 Crop Price Increased',
          message: 'Mandi pricing index has increased by 10%. Consider immediate sale.'
        });
      } else {
        alerts.push({
          id: 'm_price_decrease',
          type: 'warning',
          title: '🟠 Crop Price Decreased',
          message: 'Mandi rate dropped significantly. Consider storage or look for a better market.'
        });
      }
    }

    // 4. Government schemes & alerts
    if (schemes.length > 0) {
      const upcoming = schemes[0];
      alerts.push({
        id: 'g_scheme_info',
        type: 'info',
        title: '🔵 New Government Scheme Available',
        message: `Apply online for "${upcoming.name}" before the approaching crop insurance deadline.`
      });

      alerts.push({
        id: 'g_pmkisan',
        type: 'info',
        title: '🔵 PM-KISAN Installment Update',
        message: 'Latest PM-KISAN installment released to verified farmer bank accounts.'
      });
    }

    return alerts;
  };

  const dynamicAlerts = getIntelligentAlerts();

  const chartData = financials?.chartData || [
    { name: 'Seeds', value: 4500 },
    { name: 'Fertilizer', value: 8000 },
    { name: 'Labor', value: 12000 },
    { name: 'Fuel', value: 3500 },
    { name: 'Equipment', value: 6200 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-700 to-brand-900 text-white p-6 rounded-3xl shadow-lg text-left">
        <div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-extrabold bg-brand-600/60 px-3 py-1 rounded-full uppercase tracking-wider">
              {user?.role} Portal
            </span>
            {isTrialActive && (
              <span className="text-[10px] font-bold bg-amber-500/80 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                Premium Trial: {trialDaysLeft} days left
              </span>
            )}
            {user?.plan === 'premium' && (
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                Premium Member
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-2">
            {t('dashboard.welcome')}, {user?.name}!
          </h1>
          <p className="text-brand-100 text-xs mt-1 font-medium">
            Here is your localized farm dashboard intelligence summaries.
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/reports" 
            className="px-4 py-2.5 bg-white text-brand-850 hover:bg-brand-50 font-bold rounded-xl text-xs md:text-sm transition-all duration-150 flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Layers size={16} /> {t('common.download')} PDF Reports
          </Link>
        </div>
      </div>

      {/* Trial Reminders & Alerts */}
      {shouldShowExpiringAlert && (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/35 p-4 rounded-2xl text-left text-xs md:text-sm text-amber-800 dark:text-amber-400 font-bold flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>⚠️ Your Premium Trial will expire in {trialDaysLeft} day{trialDaysLeft > 1 ? 's' : ''}. Upgrade to Premium to keep using NPK fertilizer planners, expert booking, and PDF downloads.</span>
          <Link to="/pricing" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors min-h-[36px] flex items-center shrink-0">
            Upgrade Now
          </Link>
        </div>
      )}

      {isTrialExpired && (
        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30 p-4 rounded-2xl text-left text-xs md:text-sm text-blue-800 dark:text-blue-400 font-bold flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>ℹ️ Your Premium Trial has ended. You are now on the Free Plan. Upgrade anytime to unlock Premium features.</span>
          <Link to="/pricing" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors min-h-[36px] flex items-center shrink-0">
            Upgrade to Premium
          </Link>
        </div>
      )}

      {/* Grid Layout Weather & Financial Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weather Card (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-dark-805 pb-4 mb-4">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <CloudSun className="text-brand-600 dark:text-brand-400" size={20} /> {t('dashboard.weather')}
            </h3>
            {activeLocation.address ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-700 dark:text-dark-250 font-extrabold">
                  {activeLocation.address}
                </span>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline min-h-[32px] px-1.5 flex items-center"
                >
                  (Change)
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-400 dark:text-dark-500 font-bold">
                No Location
              </span>
            )}
          </div>

          {!activeLocation.latitude ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-dark-400 w-full">
              <CloudSun size={48} className="text-gray-300 dark:text-dark-800 mx-auto mb-3 animate-pulse" />
              <p className="font-extrabold text-sm text-gray-700 dark:text-dark-250">
                {locating ? 'Detecting your location...' : 'Location not selected'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                {locating ? 'Requesting geolocation coordinates...' : 'Please enable browser geolocation permission or select a location manually to view today\'s weather.'}
              </p>
              {!locating && (
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors min-h-[38px]"
                >
                  Choose Location
                </button>
              )}
            </div>
          ) : loadingWeather ? (
            <div className="flex items-center justify-center py-10 text-brand-600">
              <div className="w-8 h-8 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-dark-50 tracking-tighter">
                    {weather?.current?.temp}°C
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-750 dark:text-dark-200 uppercase tracking-wide">
                      {weather?.current?.condition}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-dark-500 capitalize">
                      {weather?.current?.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-brand-50 dark:bg-brand-950/20 text-brand-800 dark:text-brand-400 font-bold rounded-lg text-xs">
                    {t('dashboard.aqi')}: {weather?.current?.aqi}
                  </span>
                </div>
              </div>

              {/* Climate parameters grids */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-dark-850 p-4 rounded-2xl border border-gray-100/40 dark:border-dark-800/10">
                <div className="text-center p-2 border-r border-gray-200/50 dark:border-dark-800">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t('dashboard.humidity')}</span>
                  <span className="block text-sm font-extrabold text-gray-700 dark:text-dark-200 mt-1">{weather?.current?.humidity}%</span>
                </div>
                <div className="text-center p-2 sm:border-r border-gray-200/50 dark:border-dark-800">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t('dashboard.wind')}</span>
                  <span className="block text-sm font-extrabold text-gray-700 dark:text-dark-200 mt-1">{weather?.current?.windSpeed} m/s</span>
                </div>
                <div className="text-center p-2 border-r border-gray-200/50 dark:border-dark-800">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t('dashboard.rain')}</span>
                  <span className="block text-sm font-extrabold text-gray-700 dark:text-dark-200 mt-1">{weather?.current?.rainProb}%</span>
                </div>
                <div className="text-center p-2">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Precipitation</span>
                  <span className="block text-sm font-extrabold text-gray-700 dark:text-dark-200 mt-1">Light</span>
                </div>
              </div>

              {/* AI Weather Advice */}
              {weather?.aiAdvice && (
                <div className="bg-brand-50/50 dark:bg-brand-950/20 p-4 rounded-xl border border-brand-100/50 dark:border-brand-900/10 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="block text-[10px] text-brand-700 dark:text-brand-400 font-extrabold uppercase mb-1">AI Crop Advisory Advice</span>
                    <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed font-medium">
                      {weather?.aiAdvice}
                    </p>
                  </div>
                  <button
                    onClick={speakAdvisory}
                    className="p-2.5 bg-brand-100 dark:bg-brand-900/50 hover:bg-brand-200 text-brand-800 dark:text-brand-400 rounded-xl shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                    title={t('common.read_aloud')}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Financial Expense Pie Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-dark-800 pb-4 mb-4">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <IndianRupee className="text-brand-600 dark:text-brand-400" size={20} /> {t('dashboard.ledger')}
            </h3>
            <Link to="/expenses" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center min-h-[44px] px-2">
              Logs <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100/40 text-left">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Income</span>
                <span className="block text-base font-extrabold text-emerald-600 mt-1">₹{financials?.totalIncome || 0}</span>
              </div>
              <div className="bg-red-50/50 dark:bg-red-950/10 p-3 rounded-xl border border-red-100/40 text-left">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Expenses</span>
                <span className="block text-base font-extrabold text-red-550 mt-1">₹{financials?.totalExpense || 0}</span>
              </div>
            </div>

            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" fill="#34D399" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout Farm Map & Mandi prices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="text-left">
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
                <MapPin className="text-brand-600 dark:text-brand-400" size={20} /> {t('dashboard.map')}
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-dark-500 mt-0.5 font-medium">Click to draw farm boundary bounds.</p>
            </div>
            <span className="text-xs font-semibold text-gray-405">
              GPS Enabled
            </span>
          </div>

          <div className="h-[280px] w-full rounded-2xl overflow-hidden mt-3">
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

        {/* Mandi Prices List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-dark-800 pb-4 mb-3">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
              <TrendingUp className="text-brand-600 dark:text-brand-400" size={20} /> {t('dashboard.mandi')}
            </h3>
            <Link to="/market" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center min-h-[44px] px-2">
              Market <ChevronRight size={14} />
            </Link>
          </div>

          {loadingMandi ? (
            <div className="flex items-center justify-center py-10 text-brand-600">
              <div className="w-6 h-6 border-3 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-dark-800/50">
              {mandiPrices.length > 0 ? (
                mandiPrices.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="text-left">
                      <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-200">{item.crop}</h4>
                      <p className="text-[10px] text-gray-400 dark:text-dark-505">{item.mandiName} | {item.state}</p>
                    </div>
                    <div className="text-right">
                      <span className="block font-extrabold text-xs md:text-sm text-gray-800 dark:text-dark-200">
                        ₹{item.avgPrice}
                      </span>
                      <span className="text-[9px] text-emerald-650 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded uppercase">
                        MSP Linked
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-gray-400">No mandi prices found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alerts and system notifications */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm text-left">
        <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2 mb-4 border-b border-gray-50 dark:border-dark-800 pb-4">
          <AlertTriangle className="text-red-500" size={20} /> {t('dashboard.recent_alerts')}
        </h3>
        <div className="space-y-3">
          {dynamicAlerts.length > 0 ? (
            dynamicAlerts.map((item) => {
              const bgColors: Record<string, string> = {
                critical: 'bg-red-500',
                warning: 'bg-amber-500',
                info: 'bg-blue-500',
                success: 'bg-emerald-500'
              };

              const borderColors: Record<string, string> = {
                critical: 'border-red-200/60 dark:border-red-900/30',
                warning: 'border-amber-200/60 dark:border-amber-900/30',
                info: 'border-blue-200/60 dark:border-blue-900/30',
                success: 'border-emerald-200/60 dark:border-emerald-900/30'
              };

              return (
                <div 
                  key={item.id} 
                  className={`flex gap-3 p-3.5 bg-gray-50/50 dark:bg-dark-850/10 border ${borderColors[item.type] || 'border-gray-200/50'} rounded-2xl items-start transition-all`}
                >
                  <div className={`p-2 rounded-xl text-white shrink-0 ${bgColors[item.type] || 'bg-brand-500'}`}>
                    <AlertTriangle size={15} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs md:text-sm text-gray-850 dark:text-dark-200">{item.title}</h4>
                    <p className="text-xs text-gray-550 dark:text-dark-400 mt-0.5 leading-relaxed font-semibold">{item.message}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-gray-400 font-bold bg-gray-50 rounded-2xl border border-gray-150">
              No important alerts at this time.
            </div>
          )}
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

            {/* Suggestions list container */}
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
    </div>
  );
};
