import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Locate, 
  Trash2, 
  MapPin, 
  Search, 
  Layers, 
  Navigation, 
  Wind, 
  Droplets, 
  CloudRain, 
  Compass, 
  Maximize, 
  Plus, 
  Ruler, 
  Save, 
  Activity 
} from 'lucide-react';
import { api } from '../services/api';

interface LeafletMapProps {
  initialCenter?: [number, number];
  boundary?: [number, number][];
  onBoundaryChange?: (boundary: [number, number][]) => void;
  onLocationSelect?: (location: any) => void;
  markers?: Array<{
    position: [number, number];
    title: string;
    popupText: string;
    type: 'mandi' | 'station' | 'farm';
  }>;
  readOnly?: boolean;
}

// Distance helper (Haversine formula in meters)
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

// Perimeter helper (in meters)
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

// Area helper (in square meters)
const calculateAreaM2 = (pts: [number, number][]): number => {
  if (pts.length < 3) return 0;
  let area = 0;
  const factor = 111319.9; // meters per degree approx at equator
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

const LeafletMapInner: React.FC<LeafletMapProps> = ({
  initialCenter = [20.5937, 78.9629],
  boundary = [],
  onBoundaryChange,
  onLocationSelect,
  markers = [],
  readOnly = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const clickMarkersRef = useRef<L.Marker[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  
  // Custom marker items placed on map
  const customMarkersRef = useRef<L.Marker[]>([]);
  const servicesMarkersRef = useRef<L.Marker[]>([]);
  
  // Map tile layers
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);

  const [points, setPoints] = useState<[number, number][]>(boundary);
  const [selectedLoc, setSelectedLoc] = useState<{
    village: string;
    city: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    address: string;
    postcode?: string;
  } | null>(() => {
    if (initialCenter && (initialCenter[0] !== 20.5937 || initialCenter[1] !== 78.9629)) {
      return {
        village: '',
        city: 'My Farm Location',
        district: '',
        state: '',
        latitude: initialCenter[0],
        longitude: initialCenter[1],
        address: 'My Field Location'
      };
    }
    return null;
  });

  // SAVED FARMS STATE (Persisted locally)
  const [savedFarms, setSavedFarms] = useState<any[]>(() => {
    const saved = localStorage.getItem('km-saved-farms');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'farm_default',
        name: 'Main Field',
        boundary: boundary,
        customMarkers: [],
        soilType: 'Clay Loamy',
        waterSource: 'Tube Well',
        location: null
      }
    ];
  });

  const [activeFarmIdx, setActiveFarmIdx] = useState<number>(0);
  const [showFarmManager, setShowFarmManager] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');

  // MAP VIEW CONTROLS
  const [activeLayer, setActiveLayer] = useState<'road' | 'satellite' | 'hybrid' | 'terrain'>('road');
  const [mapMode, setMapMode] = useState<'draw' | 'marker' | 'measure'>('draw');
  const [customMarkerType, setCustomMarkerType] = useState<'home' | 'water' | 'borewell' | 'storage' | 'crop'>('borewell');

  // SEARCH STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [gpsLocating, setGpsLocating] = useState(false);

  // WEATHER & SOIL INTELLIGENCE
  const [weatherData, setWeatherData] = useState<any>(null);
  const [nearbyServices, setNearbyServices] = useState<any[]>([]);

  // MEASURE STATE
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const measureLineRef = useRef<L.Polyline | null>(null);
  const measureMarkersRef = useRef<L.Marker[]>([]);

  const selectedLocRef = useRef<any>(null);
  const mapModeRef = useRef<any>(null);
  const customMarkerTypeRef = useRef<any>(null);

  useEffect(() => {
    selectedLocRef.current = selectedLoc;
  }, [selectedLoc]);

  useEffect(() => {
    mapModeRef.current = mapMode;
  }, [mapMode]);

  useEffect(() => {
    customMarkerTypeRef.current = customMarkerType;
  }, [customMarkerType]);

  // Sync active farm with parent state boundaries
  useEffect(() => {
    const activeFarm = savedFarms[activeFarmIdx];
    if (activeFarm) {
      setPoints(activeFarm.boundary);
      if (activeFarm.location) {
        setSelectedLoc(activeFarm.location);
      }
    }
  }, [activeFarmIdx, savedFarms]);

  // Geocoding Suggestions effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError(null);
        // Include saved farms in autocomplete suggestions
        const matchingFarms = savedFarms
          .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(f => ({
            display_name: `[Farm] ${f.name} (${f.location?.address || 'No Location Set'})`,
            isSavedFarm: true,
            farmIndex: savedFarms.indexOf(f),
            lat: f.location?.latitude || (f.boundary[0] ? f.boundary[0][0] : 20.5937),
            lon: f.location?.longitude || (f.boundary[0] ? f.boundary[0][1] : 78.9629)
          }));

        const res = await api.get(`/weather/geocode?query=${encodeURIComponent(searchQuery)}`);
        let list = res.data?.suggestions || [];
        setSuggestions([...matchingFarms, ...list]);
      } catch (err) {
        console.error(err);
        setSearchError('Search failed');
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, savedFarms]);

  // Main Map Builder on Mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialCenter[0] !== 20.5937 ? 14 : 5,
      zoomControl: false, // Customized position zoom
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ position: 'bottomright', imperial: false }).addTo(map);

    mapRef.current = map;

    // Load initial Standard road map layer
    tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Click handler for drawing, placing markers, and measuring
    map.on('click', (e: L.LeafletMouseEvent) => {
      const activeMode = mapModeRef.current;

      if (activeMode === 'measure') {
        const p: [number, number] = [e.latlng.lat, e.latlng.lng];
        setMeasurePoints(prev => [...prev, p]);
        return;
      }

      if (activeMode === 'marker') {
        if (!selectedLocRef.current) {
          alert('Select a location region before placing farm objects.');
          return;
        }
        const label = prompt(`Enter label/desc for ${customMarkerTypeRef.current}:`, `${customMarkerTypeRef.current.toUpperCase()} 1`);
        if (label === null) return;

        const newMarker = {
          id: `mark_${Date.now()}`,
          type: customMarkerTypeRef.current,
          position: [e.latlng.lat, e.latlng.lng] as [number, number],
          label: label || customMarkerTypeRef.current.toUpperCase()
        };

        // Append custom marker to active farm
        setSavedFarms(prev => {
          const updated = [...prev];
          if (updated[activeFarmIdx]) {
            updated[activeFarmIdx].customMarkers = [...(updated[activeFarmIdx].customMarkers || []), newMarker];
            localStorage.setItem('km-saved-farms', JSON.stringify(updated));
          }
          return updated;
        });
        return;
      }

      // Default Mode: Click drawing boundary points
      if (activeMode === 'draw') {
        if (!selectedLocRef.current) {
          alert('Please search and select a location or use GPS before drawing your boundary.');
          return;
        }
        const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPoints(prev => {
          const updated = [...prev, newPoint];
          if (onBoundaryChange) onBoundaryChange(updated);
          // Sync to active farm boundary array
          setSavedFarms(farms => {
            const list = [...farms];
            if (list[activeFarmIdx]) {
              list[activeFarmIdx].boundary = updated;
              localStorage.setItem('km-saved-farms', JSON.stringify(list));
            }
            return list;
          });
          return updated;
        });
      }
    });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.off('click');
          mapRef.current.remove();
        } catch (err) {}
        mapRef.current = null;
      }
    };
  }, []);

  // Sync tile layers reactively
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) tileLayerRef.current.remove();
    if (labelsLayerRef.current) labelsLayerRef.current.remove();

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let options: L.TileLayerOptions = { attribution: '&copy; OpenStreetMap contributors' };

    if (activeLayer === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      options = { attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA community' };
    } else if (activeLayer === 'hybrid') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      options = { attribution: 'Esri Satellite' };
      labelsLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        pane: 'shadowPane'
      }).addTo(map);
    } else if (activeLayer === 'terrain') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      options = { attribution: 'Tiles &copy; OpenTopoMap contributors' };
    }

    tileLayerRef.current = L.tileLayer(url, options).addTo(map);
  }, [activeLayer]);

  // Sync map center view on external updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      map.setView(initialCenter, map.getZoom() || 13);
    } catch (err) {}
  }, [initialCenter[0], initialCenter[1]]);

  // Sync and redraw Farm Custom Markers (borewells, home, storage)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    customMarkersRef.current.forEach(m => m.remove());
    customMarkersRef.current = [];

    const activeFarm = savedFarms[activeFarmIdx];
    if (activeFarm && activeFarm.customMarkers) {
      activeFarm.customMarkers.forEach((m: any) => {
        const color = m.type === 'home' ? '#EF4444' : m.type === 'water' ? '#3B82F6' : m.type === 'borewell' ? '#2563EB' : m.type === 'storage' ? '#F59E0B' : '#10B981';
        const marker = L.marker(m.position, {
          icon: L.divIcon({
            className: 'custom-farm-pin',
            html: `<div style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; background-color: ${color}; border: 2px solid white; border-radius: 50%; color: white; font-size: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3)">📍</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        }).addTo(map);
        marker.bindPopup(`<b>${m.label}</b><br/>Type: ${m.type.toUpperCase()}`);
        customMarkersRef.current.push(marker);
      });
    }
  }, [activeFarmIdx, savedFarms]);

  // Redraw Boundary Polygon
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const cleanupLayers = () => {
      if (polygonRef.current) {
        try {
          if (map.hasLayer(polygonRef.current)) map.removeLayer(polygonRef.current);
        } catch (e) {}
        polygonRef.current = null;
      }
      clickMarkersRef.current.forEach(m => {
        try {
          if (map.hasLayer(m)) map.removeLayer(m);
        } catch (e) {}
      });
      clickMarkersRef.current = [];
    };

    cleanupLayers();

    if (points.length > 0) {
      const leafletCoords = points.map(p => L.latLng(p[0], p[1]));
      if (points.length >= 3) {
        polygonRef.current = L.polygon(leafletCoords, {
          color: '#10B981',
          fillColor: '#34D399',
          fillOpacity: 0.35,
          weight: 3,
        }).addTo(map);
      } else {
        polygonRef.current = L.polygon(leafletCoords, {
          color: '#3B82F6',
          weight: 3,
        }).addTo(map);
      }

      if (!readOnly) {
        points.forEach(pt => {
          const marker = L.marker([pt[0], pt[1]], {
            icon: L.divIcon({
              className: 'vertex-dot',
              html: `<div style="width: 10px; height: 10px; background-color: #10B981; border: 2px solid white; border-radius: 50%;"></div>`,
              iconSize: [10, 10],
              iconAnchor: [5, 5]
            })
          }).addTo(map);
          clickMarkersRef.current.push(marker);
        });
      }
    }

    return cleanupLayers;
  }, [points, readOnly]);

  // Redraw Measurement Lines
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (measureLineRef.current) {
      measureLineRef.current.remove();
      measureLineRef.current = null;
    }
    measureMarkersRef.current.forEach(m => m.remove());
    measureMarkersRef.current = [];

    if (measurePoints.length > 0) {
      measureLineRef.current = L.polyline(measurePoints, { color: '#8B5CF6', weight: 4, dashArray: '5, 5' }).addTo(map);
      measurePoints.forEach((p, idx) => {
        const marker = L.marker(p, {
          icon: L.divIcon({
            className: 'measure-vertex',
            html: `<div style="display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; background-color: #8B5CF6; border: 2.5px solid white; border-radius: 50%; color: white; font-size: 8px; font-weight: bold;">${idx + 1}</div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(map);
        measureMarkersRef.current.push(marker);
      });
    }
  }, [measurePoints]);

  // Fetch Weather & Soil & Nearby Services on Location Change
  useEffect(() => {
    if (!selectedLoc?.latitude) return;
    const lat = selectedLoc.latitude;
    const lon = selectedLoc.longitude;

    const loadData = async () => {
      try {
        const res = await api.get(`/weather?lat=${lat}&lon=${lon}`);
        if (res.data && res.data.success) {
          setWeatherData(res.data.weather?.current || null);
        }
      } catch (err) {}
    };

    loadData();

    // Generate nearby services
    const types = [
      { name: 'APMC Mandi Hub', category: 'mandi', icon: '🌾' },
      { name: 'NABARD Rural Bank', category: 'bank', icon: '🏦' },
      { name: 'Agri-Input Fertilizer Center', category: 'fertilizer', icon: '🧪' },
      { name: 'Gov Agriculture Office', category: 'gov', icon: '🏛️' }
    ];
    const generated = types.map((t, idx) => ({
      id: `serv_${idx}`,
      name: `${selectedLoc.city || 'Local'} ${t.name}`,
      category: t.category,
      icon: t.icon,
      position: [lat + (Math.random() - 0.5) * 0.025, lon + (Math.random() - 0.5) * 0.025] as [number, number]
    }));
    setNearbyServices(generated);
  }, [selectedLoc?.latitude, selectedLoc?.longitude]);

  // Render Nearby Services Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    servicesMarkersRef.current.forEach(m => m.remove());
    servicesMarkersRef.current = [];

    nearbyServices.forEach(s => {
      const pin = L.marker(s.position, {
        icon: L.divIcon({
          className: 'service-pin',
          html: `<div style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; background-color: #047857; border: 2px solid white; border-radius: 50%; font-size: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${s.icon}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        })
      }).addTo(map);
      pin.bindPopup(`<b>${s.name}</b>`);
      servicesMarkersRef.current.push(pin);
    });
  }, [nearbyServices]);

  const handleSuggestionSelect = (sug: any) => {
    if (sug.isSavedFarm) {
      setActiveFarmIdx(sug.farmIndex);
      setSearchQuery('');
      setSuggestions([]);
      const activeFarm = savedFarms[sug.farmIndex];
      const targetCenter = activeFarm?.location?.latitude 
        ? [activeFarm.location.latitude, activeFarm.location.longitude] 
        : activeFarm?.boundary[0] || [20.5937, 78.9629];
      mapRef.current?.flyTo(targetCenter as [number, number], 14, { animate: true, duration: 1.5 });
      return;
    }

    const lat = sug.lat;
    const lon = sug.lon;
    const locObj = {
      village: sug.village || '',
      city: sug.city || '',
      district: sug.district || '',
      state: sug.state || '',
      postcode: sug.postcode || '',
      latitude: lat,
      longitude: lon,
      address: sug.display_name
    };

    setSelectedLoc(locObj);
    setSearchQuery('');
    setSuggestions([]);

    if (onLocationSelect) onLocationSelect(locObj);

    // Sync to active farm profile
    setSavedFarms(prev => {
      const list = [...prev];
      if (list[activeFarmIdx]) {
        list[activeFarmIdx].location = locObj;
        localStorage.setItem('km-saved-farms', JSON.stringify(list));
      }
      return list;
    });

    const map = mapRef.current;
    if (map) {
      if (searchMarkerRef.current) searchMarkerRef.current.remove();
      const marker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: 'search-pin',
          html: `<div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background-color: #3B82F6; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 3px 6px rgba(0,0,0,0.3)">📍</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        })
      }).addTo(map);
      marker.bindPopup(`<b>${sug.city || sug.village || 'Target Area'}</b>`).openPopup();
      searchMarkerRef.current = marker;
      map.flyTo([lat, lon], 14, { animate: true, duration: 1.5 });
    }
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await api.get(`/weather/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          if (res.data && res.data.success) {
            const data = res.data;
            const address = data.state ? `${data.city || data.village}, ${data.state}` : (data.city || data.village || 'Detected Location');
            const locObj = {
              village: data.village || '',
              city: data.city || '',
              district: data.district || '',
              state: data.state || '',
              postcode: data.postcode || '',
              latitude,
              longitude,
              address
            };
            setSelectedLoc(locObj);
            if (onLocationSelect) onLocationSelect(locObj);

            setSavedFarms(prev => {
              const list = [...prev];
              if (list[activeFarmIdx]) {
                list[activeFarmIdx].location = locObj;
                localStorage.setItem('km-saved-farms', JSON.stringify(list));
              }
              return list;
            });

            if (mapRef.current) {
              if (searchMarkerRef.current) searchMarkerRef.current.remove();
              const marker = L.marker([latitude, longitude]).addTo(mapRef.current);
              searchMarkerRef.current = marker;
              mapRef.current.flyTo([latitude, longitude], 15, { animate: true, duration: 1.5 });
            }
          }
        } catch (e) {
          console.warn(e);
        } finally {
          setGpsLocating(false);
        }
      },
      () => setGpsLocating(false),
      { timeout: 8000 }
    );
  };

  const resetNorth = () => {
    mapRef.current?.setBearing?.(0); // If Leaflet bearing is enabled
    mapRef.current?.setView(mapRef.current.getCenter(), mapRef.current.getZoom());
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // MEASURE CALCULATION VALUES
  const getMeasurementResults = () => {
    if (measurePoints.length < 2) return { distance: 0, area: 0, perimeter: 0 };
    const dist = measurePoints.reduce((acc, curr, idx) => {
      if (idx === 0) return 0;
      const prev = measurePoints[idx - 1];
      return acc + getHaversineDistance(prev[0], prev[1], curr[0], curr[1]);
    }, 0);

    const perimeter = calculatePerimeter(measurePoints);
    const areaSqM = calculateAreaM2(measurePoints);
    const acres = areaSqM * 0.000247105;

    return {
      distance: Number(dist.toFixed(1)),
      perimeter: Number(perimeter.toFixed(1)),
      area: Number(acres.toFixed(2))
    };
  };

  // Farm boundary estimation
  const estimateAcres = () => {
    const areaSqM = calculateAreaM2(points);
    return Number((areaSqM * 0.000247105).toFixed(2));
  };

  const handleCreateFarm = () => {
    if (!newFarmName.trim()) return;
    const newFarm = {
      id: `farm_${Date.now()}`,
      name: newFarmName,
      boundary: [],
      customMarkers: [],
      soilType: 'Clay Loamy',
      waterSource: 'Tube Well',
      location: null
    };
    const list = [...savedFarms, newFarm];
    setSavedFarms(list);
    localStorage.setItem('km-saved-farms', JSON.stringify(list));
    setActiveFarmIdx(list.length - 1);
    setNewFarmName('');
    setShowFarmManager(false);
  };

  const handleDeleteFarm = (index: number) => {
    if (savedFarms.length <= 1) {
      alert('You must keep at least one farm field in your dashboard.');
      return;
    }
    if (confirm(`Are you sure you want to delete ${savedFarms[index].name}?`)) {
      const list = savedFarms.filter((_, idx) => idx !== index);
      setSavedFarms(list);
      localStorage.setItem('km-saved-farms', JSON.stringify(list));
      setActiveFarmIdx(0);
    }
  };

  const getGoogleMapsDirLink = () => {
    if (!selectedLoc) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${selectedLoc.latitude},${selectedLoc.longitude}`;
  };

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-dark-800 flex flex-col md:flex-row text-left font-sans">
      
      {/* LEFT GIS DASHBOARD PANEL */}
      <div className="w-full md:w-80 bg-white dark:bg-dark-900 border-r border-gray-100 dark:border-dark-800 p-4 overflow-y-auto flex flex-col gap-4 z-20 shrink-0">
        <div className="flex items-center justify-between border-b border-gray-50 dark:border-dark-850 pb-2">
          <h3 className="font-extrabold text-sm text-gray-800 dark:text-dark-100 flex items-center gap-1.5">
            <Activity className="text-brand-600 dark:text-brand-400" size={16} /> GIS Farm Manager
          </h3>
          <button
            onClick={() => setShowFarmManager(!showFarmManager)}
            className="text-[10px] text-brand-600 dark:text-brand-400 font-extrabold flex items-center gap-0.5 hover:underline"
          >
            Switch/Add Farm
          </button>
        </div>

        {/* Saved Farms Switcher Dropdown dialog */}
        {showFarmManager && (
          <div className="bg-gray-50 dark:bg-dark-850 p-3 rounded-xl border border-gray-200/50 dark:border-dark-800 flex flex-col gap-2">
            <span className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold">Active Farms</span>
            <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
              {savedFarms.map((f, idx) => (
                <div key={f.id} className="flex items-center justify-between p-1.5 bg-white dark:bg-dark-900 rounded-lg border">
                  <button
                    onClick={() => { setActiveFarmIdx(idx); setShowFarmManager(false); }}
                    className={`text-xs font-bold text-left flex-grow ${idx === activeFarmIdx ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700'}`}
                  >
                    {f.name}
                  </button>
                  <button onClick={() => handleDeleteFarm(idx)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 mt-1">
              <input
                type="text"
                value={newFarmName}
                onChange={e => setNewFarmName(e.target.value)}
                placeholder="New Farm Name..."
                className="flex-grow text-[10px] px-2 py-1 bg-white dark:bg-dark-900 border rounded-lg focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={handleCreateFarm}
                className="px-2 py-1 bg-brand-600 text-white rounded-lg text-[9px] font-extrabold flex items-center"
              >
                <Plus size={10} /> Add
              </button>
            </div>
          </div>
        )}

        {/* Selected Farm Information */}
        <div className="bg-gray-50/50 dark:bg-dark-850/20 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-800 text-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-gray-800 dark:text-dark-100">{savedFarms[activeFarmIdx]?.name}</span>
            <span className="text-[9px] text-gray-400 font-bold bg-gray-150 dark:bg-dark-800 px-2 py-0.5 rounded-full">Active</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-550 dark:text-dark-300 font-medium">
            <div>
              <span className="block text-[8px] uppercase text-gray-400 font-bold">Estimated Area</span>
              <span className="block font-bold text-gray-705 dark:text-dark-100 mt-0.5">{points.length >= 3 ? `${estimateAcres()} Acres` : 'Draw Boundary'}</span>
            </div>
            <div>
              <span className="block text-[8px] uppercase text-gray-400 font-bold">Perimeter</span>
              <span className="block font-bold text-gray-705 dark:text-dark-100 mt-0.5">{points.length >= 2 ? `${calculatePerimeter(points).toFixed(1)} m` : 'Draw Boundary'}</span>
            </div>
          </div>

          {selectedLoc && (
            <div className="border-t border-gray-100 dark:border-dark-800/60 pt-2 flex flex-col gap-1.5 text-[10px]">
              <div>
                <span className="block text-[8px] uppercase text-gray-400 font-bold">Location</span>
                <span className="block font-bold text-gray-705 mt-0.5 line-clamp-1">{selectedLoc.address}</span>
              </div>
              <a
                href={getGoogleMapsDirLink()}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-extrabold text-[9px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 mt-1 transition-colors"
              >
                <Navigation size={10} /> Route Navigation (Google Maps)
              </a>
            </div>
          )}
        </div>

        {/* WEATHER PANEL */}
        {selectedLoc && weatherData && (
          <div className="bg-sky-50/50 dark:bg-sky-950/10 p-3.5 rounded-2xl border border-sky-100/40 text-xs text-left space-y-2">
            <span className="block text-[9px] uppercase tracking-wider text-sky-800 dark:text-sky-400 font-extrabold">Live Farm Climate</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-extrabold text-sky-900 dark:text-sky-200">{weatherData.temp}°C</span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 rounded-lg">{weatherData.condition}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[9px] text-sky-700 dark:text-sky-350">
              <div className="flex items-center gap-0.5"><Wind size={10} /> {weatherData.windSpeed}m/s</div>
              <div className="flex items-center gap-0.5"><Droplets size={10} /> {weatherData.humidity}%</div>
              <div className="flex items-center gap-0.5"><CloudRain size={10} /> {weatherData.rainProb}%</div>
            </div>
          </div>
        )}

        {/* SOIL HEALTH PANEL */}
        {selectedLoc && (
          <div className="bg-amber-50/30 dark:bg-amber-950/10 p-3.5 rounded-2xl border border-amber-100/20 text-xs text-left space-y-2">
            <span className="block text-[9px] uppercase tracking-wider text-amber-800 dark:text-amber-400 font-extrabold">Soil Intelligence</span>
            <div className="flex flex-col gap-1 text-[10px] text-gray-600 dark:text-dark-250 font-semibold">
              <div className="flex justify-between"><span>Soil Type:</span><span className="font-extrabold text-gray-800 dark:text-dark-100">{savedFarms[activeFarmIdx]?.soilType || 'Clay Loamy'}</span></div>
              <div className="flex justify-between"><span>Soil Health:</span><span className="font-extrabold text-gray-800 dark:text-dark-100">Optimal (pH 6.8)</span></div>
              <div className="flex justify-between"><span>Soil Moisture:</span><span className="font-extrabold text-gray-800 dark:text-dark-100">34% (Healthy)</span></div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT VIEWPORT MAP AREA */}
      <div className="flex-1 h-full relative flex flex-col z-10">
        
        {/* TOP SEARCH & TOOLS OVERLAY BAR */}
        {!readOnly && (
          <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap gap-2 pointer-events-auto">
            {/* Search Input Container */}
            <div className="relative bg-white dark:bg-dark-900 border border-gray-200/80 dark:border-dark-800 shadow-md rounded-xl p-1 w-64 md:w-80 flex flex-col gap-1">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search village, city, saved farms..."
                  className="w-full text-xs pl-8 pr-16 py-2 bg-gray-50 dark:bg-dark-850 border border-transparent focus:border-brand-500 rounded-lg text-gray-700 dark:text-dark-200 focus:outline-none"
                />
                <span className="absolute left-2.5 text-gray-400"><Search size={13} /></span>
                <div className="absolute right-1.5 flex items-center gap-1.5">
                  {searchQuery.trim() && <button onClick={() => { setSearchQuery(''); setSuggestions([]); }} className="text-gray-400">✕</button>}
                  <button onClick={locateUser} className={`text-brand-600 ${gpsLocating ? 'animate-pulse' : ''}`} disabled={gpsLocating}><Locate size={13} /></button>
                </div>
              </div>
              {/* Autocomplete Dropdown list */}
              {suggestions.length > 0 && (
                <div className="max-h-40 overflow-y-auto bg-white dark:bg-dark-900 border-t rounded-b-lg divide-y text-left">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionSelect(sug)}
                      className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-dark-850 text-[10px] font-bold text-gray-700 dark:text-dark-250 transition-colors"
                    >
                      {sug.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Layer Switcher */}
            <div className="bg-white dark:bg-dark-900 border border-gray-200/80 dark:border-dark-800 shadow-md rounded-xl p-1 flex items-center gap-1">
              <span className="p-1.5 text-gray-450"><Layers size={13} /></span>
              <select
                value={activeLayer}
                onChange={e => setActiveLayer(e.target.value as any)}
                className="bg-transparent text-[10px] font-bold text-gray-700 dark:text-dark-200 pr-4 border-none focus:outline-none focus:ring-0"
              >
                <option value="road">Road Map</option>
                <option value="satellite">Satellite View</option>
                <option value="hybrid">Hybrid View</option>
                <option value="terrain">Terrain View</option>
              </select>
            </div>

            {/* Map Mode Switcher (Draw Boundary vs Custom Object Marker vs Measure Tools) */}
            <div className="bg-white dark:bg-dark-900 border border-gray-200/80 dark:border-dark-800 shadow-md rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => { setMapMode('draw'); setMeasurePoints([]); }}
                className={`px-2 py-1.5 text-[10px] font-extrabold rounded-lg transition-colors flex items-center gap-1 ${mapMode === 'draw' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/20' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <MapPin size={11} /> Boundary
              </button>
              <button
                onClick={() => { setMapMode('marker'); setMeasurePoints([]); }}
                className={`px-2 py-1.5 text-[10px] font-extrabold rounded-lg transition-colors flex items-center gap-1 ${mapMode === 'marker' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/20' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Plus size={11} /> Objects
              </button>
              <button
                onClick={() => setMapMode('measure')}
                className={`px-2 py-1.5 text-[10px] font-extrabold rounded-lg transition-colors flex items-center gap-1 ${mapMode === 'measure' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/20' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Ruler size={11} /> Measure
              </button>
            </div>

            {/* Custom Object Marker Type Selection (Visible only in marker mode) */}
            {mapMode === 'marker' && (
              <div className="bg-white dark:bg-dark-900 border border-gray-200 shadow-md rounded-xl p-1 flex items-center gap-1 animate-fade-in">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold px-1">Marker:</span>
                <select
                  value={customMarkerType}
                  onChange={e => setCustomMarkerType(e.target.value as any)}
                  className="bg-transparent text-[10px] font-bold text-gray-700 dark:text-dark-200 pr-3 border-none focus:outline-none focus:ring-0"
                >
                  <option value="borewell">Borewell 🔵</option>
                  <option value="water">Water Source 💧</option>
                  <option value="home">Home 🏠</option>
                  <option value="storage">Storage 📦</option>
                  <option value="crop">Crop Area 🌾</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* MAP CONTAINER ELEMENT */}
        <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-10" />

        {/* FLOATING ACTION RIGHT PANEL BUTTONS */}
        <div className="absolute right-3 top-20 z-[1000] flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={resetNorth}
            className="p-2.5 bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-xl text-gray-650 dark:text-dark-200 shadow-md hover:bg-gray-55"
            title="Reset North View"
          >
            <Compass size={14} />
          </button>
          <button
            onClick={toggleFullScreen}
            className="p-2.5 bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-xl text-gray-655 dark:text-dark-200 shadow-md hover:bg-gray-55"
            title="Toggle Fullscreen"
          >
            <Maximize size={14} />
          </button>
        </div>

        {/* BOTTOM MEASUREMENT RESULTS OVERLAY PANEL (Visible only in measure mode) */}
        {mapMode === 'measure' && measurePoints.length >= 2 && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-dark-900/95 p-3 rounded-2xl border border-gray-150 shadow-lg text-left text-[11px] font-bold text-gray-700 dark:text-dark-250 flex items-center gap-4 pointer-events-auto animate-fade-in">
            <div>
              <span className="block text-[8px] uppercase text-gray-400 font-extrabold">Line Distance</span>
              <span className="block font-extrabold text-brand-600 mt-0.5">{getMeasurementResults().distance} meters</span>
            </div>
            {measurePoints.length >= 3 && (
              <>
                <div className="w-px h-6 bg-gray-150"></div>
                <div>
                  <span className="block text-[8px] uppercase text-gray-400 font-extrabold">Enclosed Area</span>
                  <span className="block font-extrabold text-emerald-600 mt-0.5">{getMeasurementResults().area} Acres</span>
                </div>
              </>
            )}
            <button
              onClick={() => setMeasurePoints([])}
              className="text-[10px] text-red-500 hover:text-red-700 font-extrabold uppercase shrink-0"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

class MapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('[Leaflet Map Error Boundary] Intercepted a Leaflet runtime crash:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[350px] bg-gray-50 dark:bg-dark-850 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-gray-150/40 dark:border-dark-800/10">
          <span className="text-2xl mb-2">🗺️</span>
          <p className="text-xs font-bold text-gray-700 dark:text-dark-200">Map loading error</p>
          <p className="text-[10px] text-gray-450 mt-1 max-w-[200px]">Failed to render interactive map. Please check your browser's WebGL / Canvas settings or reload the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const LeafletMap: React.FC<LeafletMapProps> = (props) => (
  <MapErrorBoundary>
    <LeafletMapInner {...props} />
  </MapErrorBoundary>
);
