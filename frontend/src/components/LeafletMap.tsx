import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, Trash2, MapPin } from 'lucide-react';

interface LeafletMapProps {
  initialCenter?: [number, number];
  boundary?: [number, number][];
  onBoundaryChange?: (boundary: [number, number][]) => void;
  markers?: Array<{
    position: [number, number];
    title: string;
    popupText: string;
    type: 'mandi' | 'station' | 'farm';
  }>;
  readOnly?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  initialCenter = [29.6857, 76.9905], // Default Karnal, India
  boundary = [],
  onBoundaryChange,
  markers = [],
  readOnly = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const clickMarkersRef = useRef<L.Marker[]>([]);
  const [points, setPoints] = useState<[number, number][]>(boundary);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create Leaflet Map instance
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
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
        const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
        
        setPoints((prev) => {
          const updated = [...prev, newPoint];
          if (onBoundaryChange) onBoundaryChange(updated);
          return updated;
        });
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCenter, readOnly]);

  // Sync external points updates (like parent clearing boundary)
  useEffect(() => {
    if (JSON.stringify(points) !== JSON.stringify(boundary)) {
      setPoints(boundary);
    }
  }, [boundary]);

  // Redraw Boundary Polygon and points markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old polygon
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }

    // Remove old click markers
    clickMarkersRef.current.forEach((marker) => marker.remove());
    clickMarkersRef.current = [];

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
        points.forEach((pt, index) => {
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
      const marker = L.marker(m.position, { icon }).addTo(map);
      marker.bindPopup(`<b>${m.title}</b><br/>${m.popupText}`);
      listMarkers.push(marker);
    });

    return () => {
      listMarkers.forEach((m) => m.remove());
    };
  }, [markers]);

  const clearBoundary = () => {
    setPoints([]);
    if (onBoundaryChange) onBoundaryChange([]);
  };

  const locateUser = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current?.setView([latitude, longitude], 15);
          // Place center marker
          L.marker([latitude, longitude])
            .addTo(mapRef.current!)
            .bindPopup('Your Current GPS Location')
            .openPopup();
        },
        (err) => {
          console.error('[Geolocation Error]', err);
          alert('Failed to fetch your GPS coordinates. Make sure location permissions are enabled.');
        }
      );
    }
  };

  // Estimate field size based on polygon bounds in acres (mock/simple estimation helper)
  const estimateAcres = () => {
    if (points.length < 3) return 0;
    // Standard surveyor estimation model (simplified coordinates bounding box)
    let area = 0;
    const j = points.length - 1;
    // Calculate polygon area in coordinate delta
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      area += (p1[1] + p2[1]) * (p1[0] - p2[0]);
    }
    // Convert coordinate area delta into estimated acres (approximate scaling)
    const rawArea = Math.abs(area) * 0.5;
    const acres = rawArea * 2471050; // scaling factor
    return Number(Math.min(100, Math.max(0.5, acres)).toFixed(2));
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-dark-800">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />

      {/* Buttons / Controls Overlay */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={locateUser}
          className="p-2 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800 shadow-sm"
          title="Zoom to My Geolocation"
        >
          <Locate size={18} />
        </button>

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

      {/* Legend / Acre calculator indicator */}
      {!readOnly && (
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-dark-900/95 backdrop-blur px-3 py-2 rounded-lg border border-gray-100 dark:border-dark-800 text-[10px] md:text-xs text-gray-600 dark:text-dark-300 font-semibold shadow-md max-w-[200px]">
          <p className="text-brand-700 dark:text-brand-400 font-bold mb-1 flex items-center gap-1">
            <MapPin size={12} /> Draw Farm Boundary
          </p>
          <p className="mb-0.5">1. Click on the map to add field corners.</p>
          <p className="mb-1">2. Draw at least 3 points to enclose your field.</p>
          {points.length >= 3 && (
            <p className="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-dark-800 text-brand-600 dark:text-brand-400 font-bold">
              Estimated Area: {estimateAcres()} Acres
            </p>
          )}
        </div>
      )}
    </div>
  );
};
