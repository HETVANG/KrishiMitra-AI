import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, Trash2, MapPin, Search } from 'lucide-react';
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

const LeafletMapInner: React.FC<LeafletMapProps> = ({
  initialCenter = [20.5937, 78.9629], // Default center on India
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
  const [points, setPoints] = useState<[number, number][]>(boundary);

  const [selectedLoc, setSelectedLoc] = useState<{
    village: string;
    city: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    address: string;
  } | null>(() => {
    // If custom coordinates are provided, pre-populate selected location
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

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [gpsLocating, setGpsLocating] = useState(false);

  const selectedLocRef = useRef<any>(null);

  useEffect(() => {
    selectedLocRef.current = selectedLoc;
  }, [selectedLoc]);

  // Search Suggestion Fetch effect
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
        console.error('[LeafletMap Search Error]', err);
        setSearchError('Search failed');
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Initialize Map once on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create Leaflet Map instance
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialCenter[0] !== 20.5937 ? 14 : 5,
      zoomControl: true,
    });

    // Load OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    // Fix default marker icon assets mapping in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Register click event for editing boundary
    if (!readOnly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (!selectedLocRef.current) {
          alert('Please search and select a location or use GPS before drawing your boundary.');
          return;
        }
        const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
        
        setPoints((prev) => {
          const updated = [...prev, newPoint];
          if (onBoundaryChange) onBoundaryChange(updated);
          return updated;
        });
      });
    }

    return () => {
      const activeMap = mapRef.current;
      if (activeMap) {
        try {
          activeMap.off('click');
          activeMap.remove();
        } catch (e) {
          console.warn('[LeafletMap] Error during map destruction:', e);
        }
        mapRef.current = null;
      }
    };
  }, [readOnly]);

  // Sync Map view when initialCenter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      map.setView(initialCenter, map.getZoom() || 13);
    } catch (err) {
      console.warn('[LeafletMap] Failed to set view on center update:', err);
    }
  }, [initialCenter[0], initialCenter[1]]);

  // Sync external points updates (like parent clearing boundary)
  useEffect(() => {
    if (JSON.stringify(points) !== JSON.stringify(boundary)) {
      setPoints(boundary);
    }
  }, [boundary]);

  // Redraw Boundary Polygon and points markers reactively
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const cleanupLayers = () => {
      // Remove old polygon safely using hasLayer check
      if (polygonRef.current) {
        try {
          if (map.hasLayer(polygonRef.current)) {
            map.removeLayer(polygonRef.current);
          }
        } catch (err) {
          console.warn('[LeafletMap] Failed to remove polygon:', err);
        }
        polygonRef.current = null;
      }

      // Remove old click markers safely using hasLayer check
      clickMarkersRef.current.forEach((marker) => {
        try {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        } catch (err) {
          console.warn('[LeafletMap] Failed to remove vertex marker:', err);
        }
      });
      clickMarkersRef.current = [];
    };

    cleanupLayers();

    // Draw new polygon if points exist
    if (points.length > 0) {
      const leafletCoords = points.map((p) => L.latLng(p[0], p[1]));
      
      // Draw connecting lines / polygon
      if (points.length >= 3) {
        polygonRef.current = L.polygon(leafletCoords, {
          color: '#10B981', // Emerald green border
          fillColor: '#34D399', // Emerald fill
          fillOpacity: 0.35,
          weight: 3,
        }).addTo(map);
      } else {
        polygonRef.current = L.polygon(leafletCoords, {
          color: '#3B82F6',
          weight: 3,
        }).addTo(map);
      }

      // Draw dot marker pins for each click vertex
      if (!readOnly) {
        points.forEach((pt) => {
          const vertexMarker = L.marker([pt[0], pt[1]], {
            icon: L.divIcon({
              className: 'vertex-dot',
              html: `<div style="width: 10px; height: 10px; background-color: #10B981; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.4)"></div>`,
              iconSize: [10, 10],
              iconAnchor: [5, 5],
            })
          }).addTo(map);
          clickMarkersRef.current.push(vertexMarker);
        });
      }
    }

    return cleanupLayers;
  }, [points, readOnly]);

  // Render static markers (Mandi positions, weather stations, etc.)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || markers.length === 0) return;

    // Setup specialized icons
    const mandiIcon = L.divIcon({
      className: 'mandi-pin',
      html: `<div style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background-color: #F59E0B; border: 2px solid white; border-radius: 50%; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.3)"><span style="font-size: 14px; font-weight: bold;">₹</span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const stationIcon = L.divIcon({
      className: 'station-pin',
      html: `<div style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background-color: #3B82F6; border: 2px solid white; border-radius: 50%; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.3)"><span style="font-size: 11px; font-weight: bold;">⛅</span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const listMarkers: L.Marker[] = [];

    markers.forEach((m) => {
      const icon = m.type === 'mandi' ? mandiIcon : m.type === 'station' ? stationIcon : undefined;
      try {
        const marker = L.marker(m.position, { icon }).addTo(map);
        marker.bindPopup(`<b>${m.title}</b><br/>${m.popupText}`);
        listMarkers.push(marker);
      } catch (err) {
        console.warn('[LeafletMap] Failed to render static marker:', err);
      }
    });

    return () => {
      const activeMap = mapRef.current;
      if (activeMap) {
        listMarkers.forEach((m) => {
          try {
            if (activeMap.hasLayer(m)) {
              activeMap.removeLayer(m);
            }
          } catch (err) {
            console.warn('[LeafletMap] Failed to remove static marker:', err);
          }
        });
      }
    };
  }, [markers]);

  const handleSuggestionSelect = (sug: any) => {
    const lat = sug.lat;
    const lon = sug.lon;
    const addressStr = sug.display_name;

    const locationDetails = {
      village: sug.village || '',
      city: sug.city || '',
      district: sug.district || '',
      state: sug.state || '',
      postcode: sug.postcode || '',
      latitude: lat,
      longitude: lon,
      address: addressStr
    };

    setSelectedLoc(locationDetails);
    setSearchQuery('');
    setSuggestions([]);

    if (onLocationSelect) {
      onLocationSelect(locationDetails);
    }

    const map = mapRef.current;
    if (map) {
      if (searchMarkerRef.current) {
        try {
          if (map.hasLayer(searchMarkerRef.current)) {
            map.removeLayer(searchMarkerRef.current);
          }
        } catch (e) {}
      }

      const tempMarker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: 'search-pin-temp',
          html: `<div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background-color: #3B82F6; border: 2.5px solid white; border-radius: 50%; color: white; box-shadow: 0 3px 6px rgba(0,0,0,0.3)"><span style="font-size: 14px; font-weight: bold;">📍</span></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        })
      }).addTo(map);

      tempMarker.bindPopup(`<b>${sug.city || sug.village || 'Selected Location'}</b><br/>${addressStr}`).openPopup();
      searchMarkerRef.current = tempMarker;

      map.flyTo([lat, lon], 14, { animate: true, duration: 1.5 });
    }
  };

  const handleSearchAgain = () => {
    setSelectedLoc(null);
    setSearchQuery('');
    setSuggestions([]);
    
    const map = mapRef.current;
    if (map && searchMarkerRef.current) {
      try {
        if (map.hasLayer(searchMarkerRef.current)) {
          map.removeLayer(searchMarkerRef.current);
        }
      } catch (e) {}
      searchMarkerRef.current = null;
    }
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLocating(true);
    setSearchError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await api.get(`/weather/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          if (res.data && res.data.success) {
            const data = res.data;
            const addressStr = data.state ? `${data.city || data.village}, ${data.state}` : (data.city || data.village || 'Detected Location');
            
            const locationDetails = {
              village: data.village || '',
              city: data.city || '',
              district: data.district || '',
              state: data.state || '',
              postcode: data.postcode || '',
              latitude,
              longitude,
              address: addressStr
            };

            setSelectedLoc(locationDetails);
            if (onLocationSelect) {
              onLocationSelect(locationDetails);
            }

            const map = mapRef.current;
            if (map) {
              if (searchMarkerRef.current) {
                try {
                  if (map.hasLayer(searchMarkerRef.current)) {
                    map.removeLayer(searchMarkerRef.current);
                  }
                } catch (e) {}
              }

              const tempMarker = L.marker([latitude, longitude], {
                icon: L.divIcon({
                  className: 'search-pin-temp',
                  html: `<div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background-color: #3B82F6; border: 2.5px solid white; border-radius: 50%; color: white; box-shadow: 0 3px 6px rgba(0,0,0,0.3)"><span style="font-size: 14px; font-weight: bold;">📍</span></div>`,
                  iconSize: [34, 34],
                  iconAnchor: [17, 17],
                })
              }).addTo(map);

              tempMarker.bindPopup('<b>Detected GPS Location</b>').openPopup();
              searchMarkerRef.current = tempMarker;

              map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.5 });
            }
          }
        } catch (err) {
          console.error('Failed reverse geocoding current coordinates:', err);
          const fallbackDetails = {
            village: '',
            city: 'Detected Location',
            district: '',
            state: '',
            postcode: '',
            latitude,
            longitude,
            address: `Coords: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          };
          setSelectedLoc(fallbackDetails);
          if (onLocationSelect) onLocationSelect(fallbackDetails);

          const map = mapRef.current;
          if (map) {
            map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.5 });
          }
        } finally {
          setGpsLocating(false);
        }
      },
      (err) => {
        console.warn('[GPS Geolocation access denied]', err);
        setGpsLocating(false);
        alert('GPS location request denied or timed out. Please select location manually using the search bar.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const clearBoundary = () => {
    setPoints([]);
    if (onBoundaryChange) onBoundaryChange([]);
  };

  // Estimate field size based on polygon bounds in acres
  const estimateAcres = () => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      area += (p1[1] + p2[1]) * (p1[0] - p2[0]);
    }
    const rawArea = Math.abs(area) * 0.5;
    const acres = rawArea * 2471050; // scaling factor
    return Number(Math.min(100, Math.max(0.5, acres)).toFixed(2));
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-dark-800">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />

      {/* SEARCH BOX OVERLAY */}
      {!readOnly && (
        <div className="absolute top-3 left-3 z-[1000] w-72 md:w-80 pointer-events-auto">
          <div className="relative bg-white dark:bg-dark-900 rounded-xl border border-gray-150 dark:border-dark-800 shadow-lg flex flex-col p-1.5 gap-1.5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search village, city, pin..."
                className="w-full text-xs pl-8 pr-12 py-2 bg-gray-50 dark:bg-dark-850 border border-transparent focus:border-brand-500 rounded-lg text-gray-700 dark:text-dark-200 focus:outline-none"
              />
              <span className="absolute left-2.5 text-gray-400">
                <Search size={14} />
              </span>
              
              <div className="absolute right-1.5 flex items-center gap-1">
                {searchQuery.trim() && (
                  <button
                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-dark-800 rounded text-gray-400 hover:text-gray-650"
                    title="Clear Search"
                  >
                    ✕
                  </button>
                )}
                <button
                  onClick={locateUser}
                  className={`p-1 rounded text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/20 ${gpsLocating ? 'animate-pulse' : ''}`}
                  title="Use My GPS Location"
                  disabled={gpsLocating}
                >
                  <Locate size={14} />
                </button>
              </div>
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="max-h-48 overflow-y-auto bg-white dark:bg-dark-900 border-t border-gray-100 dark:border-dark-800 rounded-b-lg divide-y divide-gray-50 dark:divide-dark-850">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionSelect(sug)}
                    className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-dark-850 text-[11px] font-bold text-gray-700 dark:text-dark-250 transition-colors flex flex-col gap-0.5"
                  >
                    <span>{sug.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            
            {searching && (
              <div className="p-2 text-center text-[10px] text-gray-400">Searching...</div>
            )}
            {searchError && (
              <div className="p-2 text-center text-[10px] text-red-500 font-semibold">{searchError}</div>
            )}
          </div>
        </div>
      )}

      {/* SELECTED LOCATION DISPLAY CARD */}
      {!readOnly && selectedLoc && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-dark-900/95 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 dark:border-dark-800 text-left shadow-lg max-w-[280px] w-full flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-start justify-between gap-2 border-b border-gray-50 dark:border-dark-800 pb-2">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-brand-700 dark:text-brand-400 font-extrabold">Selected Farm Region</span>
              <h4 className="font-extrabold text-xs text-gray-800 dark:text-dark-100 mt-0.5 line-clamp-2">{selectedLoc.address}</h4>
            </div>
            <button
              onClick={handleSearchAgain}
              className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-705 dark:bg-brand-950/20 dark:text-brand-400 rounded-lg text-[9px] font-extrabold uppercase shrink-0 transition-colors min-h-[24px]"
            >
              Search Again
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9px] text-gray-550 dark:text-dark-300 font-semibold">
            {selectedLoc.village && (
              <div>
                <span className="block text-[8px] uppercase text-gray-450 font-bold">Village</span>
                <span className="block font-bold text-gray-700 dark:text-dark-200 mt-0.5">{selectedLoc.village}</span>
              </div>
            )}
            {selectedLoc.city && (
              <div>
                <span className="block text-[8px] uppercase text-gray-450 font-bold">City/Town</span>
                <span className="block font-bold text-gray-700 dark:text-dark-200 mt-0.5">{selectedLoc.city}</span>
              </div>
            )}
            {selectedLoc.district && (
              <div>
                <span className="block text-[8px] uppercase text-gray-455 font-bold">District</span>
                <span className="block font-bold text-gray-700 dark:text-dark-200 mt-0.5">{selectedLoc.district}</span>
              </div>
            )}
            {selectedLoc.state && (
              <div>
                <span className="block text-[8px] uppercase text-gray-455 font-bold">State</span>
                <span className="block font-bold text-gray-700 dark:text-dark-200 mt-0.5">{selectedLoc.state}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-50 dark:border-dark-800 pt-2 flex flex-col gap-1 text-[9px] text-gray-500">
            <p className="font-semibold text-brand-650 dark:text-brand-400">📍 Click map corners to outline your boundary.</p>
            {points.length >= 3 && (
              <p className="mt-1 font-bold text-emerald-600">Enclosed Area: {estimateAcres()} Acres</p>
            )}
          </div>
        </div>
      )}

      {/* NO LOCATION CHOSEN WARNING PANEL */}
      {!readOnly && !selectedLoc && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-dark-900/95 backdrop-blur-sm p-4 rounded-2xl border border-yellow-100 dark:border-yellow-950/20 text-left shadow-lg max-w-[280px] w-full flex items-center gap-3 pointer-events-auto">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl text-yellow-600 shrink-0">
            <MapPin size={18} />
          </div>
          <div>
            <h4 className="font-extrabold text-[11px] text-gray-805 dark:text-dark-100">Set Farm Location First</h4>
            <p className="text-[9px] text-gray-400 leading-normal mt-0.5 font-semibold">Search for your village, city, or use your current GPS location before drawing.</p>
          </div>
        </div>
      )}

      {/* Buttons / Controls Overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
        {!readOnly && points.length > 0 && (
          <button
            onClick={clearBoundary}
            className="p-2 bg-red-500 border border-red-600 rounded-lg text-white hover:bg-red-600 shadow-sm"
            title="Clear Boundary Points"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

// Leaflet Map Error Boundary to isolate crashes
class MapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[Leaflet Map Error Boundary] Intercepted a Leaflet runtime crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[280px] bg-gray-50 dark:bg-dark-850 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-gray-150/40 dark:border-dark-800/10">
          <span className="text-2xl mb-2">🗺️</span>
          <p className="text-xs font-bold text-gray-700 dark:text-dark-200">Map loading error</p>
          <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">Failed to render interactive map. Please check your browser's WebGL / Canvas settings or reload the page.</p>
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
