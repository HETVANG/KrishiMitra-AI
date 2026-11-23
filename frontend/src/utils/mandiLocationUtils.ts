/**
 * Mandi & District Geographic Coordinates and Distance Calculations
 * Covers verified APMC Mandis, Agricultural District Centroids, and Haversine Distance Calculations.
 */

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface CoordinateResolution {
  lat: number;
  lon: number;
  isVerifiedMandi: boolean; // true if exact verified APMC coordinates; false if district centroid
  resolvedName: string;
}

export interface DistanceResult {
  distanceKm: number;
  tier: 'local' | 'regional' | 'statewide' | 'distant';
  isVerifiedMandi: boolean;
  label: string;
  badgeText: string;
  tierColor: string;
}

// 1. EXACT VERIFIED APMC MANDI GROUND COORDINATES
export const VERIFIED_MANDI_COORDINATES: Record<string, Coordinates> = {
  // Gujarat APMCs
  'surat': { lat: 21.2052, lon: 72.8428 }, // Sardar Market Yard, Surat
  'surat apmc': { lat: 21.2052, lon: 72.8428 },
  'bardoli': { lat: 21.1215, lon: 73.1118 }, // Bardoli APMC
  'bardoli apmc': { lat: 21.1215, lon: 73.1118 },
  'bardoli(kadod)': { lat: 21.1215, lon: 73.1118 },
  'bardoli(kadod) apmc': { lat: 21.1215, lon: 73.1118 },
  'navsari': { lat: 20.9506, lon: 72.9288 }, // Navsari APMC Yard
  'navsari apmc': { lat: 20.9506, lon: 72.9288 },
  'bilimora': { lat: 20.7634, lon: 72.9669 },
  'bilimora apmc': { lat: 20.7634, lon: 72.9669 },
  'chikli': { lat: 20.7588, lon: 73.0577 },
  'chikli(khorgam) apmc': { lat: 20.7588, lon: 73.0577 },
  'vyra': { lat: 21.1114, lon: 73.3942 },
  'vyra apmc': { lat: 21.1114, lon: 73.3942 },
  'vyara apmc': { lat: 21.1114, lon: 73.3942 },
  'bharuch': { lat: 21.7051, lon: 72.9959 },
  'bharuch apmc': { lat: 21.7051, lon: 72.9959 },
  'ankleshwar': { lat: 21.6264, lon: 73.0034 },
  'ankleshwar apmc': { lat: 21.6264, lon: 73.0034 },
  'jhagadiya': { lat: 21.7100, lon: 73.1500 },
  'valsad': { lat: 20.5992, lon: 72.9342 },
  'valsad apmc': { lat: 20.5992, lon: 72.9342 },
  'rajkot': { lat: 22.2858, lon: 70.8142 }, // Bedi Market Yard, Rajkot
  'rajkot apmc': { lat: 22.2858, lon: 70.8142 },
  'gondal': { lat: 21.9619, lon: 70.7923 }, // Gondal APMC Yard
  'gondal apmc': { lat: 21.9619, lon: 70.7923 },
  'gondal(veg.market gondal) apmc': { lat: 21.9619, lon: 70.7923 },
  'jetpur': { lat: 21.7589, lon: 70.6231 },
  'jetpur(dist.rajkot) apmc': { lat: 21.7589, lon: 70.6231 },
  'upleta': { lat: 21.7356, lon: 70.2825 },
  'morbi': { lat: 22.8120, lon: 70.8378 },
  'morbi apmc': { lat: 22.8120, lon: 70.8378 },
  'vankaner': { lat: 22.6186, lon: 70.9634 },
  'vankaner apmc': { lat: 22.6186, lon: 70.9634 },
  'unjha': { lat: 23.8042, lon: 72.3925 }, // Unjha APMC - National Cumin/Spice Hub
  'unjha apmc': { lat: 23.8042, lon: 72.3925 },
  'mehsana': { lat: 23.5880, lon: 72.3693 },
  'mehsana apmc': { lat: 23.5880, lon: 72.3693 },
  'mehsana(mehsana veg) apmc': { lat: 23.5880, lon: 72.3693 },
  'deesa': { lat: 24.2589, lon: 72.1793 }, // Deesa APMC - Potato Hub
  'deesa(deesa veg yard)': { lat: 24.2589, lon: 72.1793 },
  'diyodar': { lat: 24.1167, lon: 71.7667 },
  'diyodar apmc': { lat: 24.1167, lon: 71.7667 },
  'palanpur': { lat: 24.1725, lon: 72.4343 },
  'palanpur apmc': { lat: 24.1725, lon: 72.4343 },
  'dhanera': { lat: 24.5167, lon: 72.0167 },
  'dhanera apmc': { lat: 24.5167, lon: 72.0167 },
  'vadgam': { lat: 24.0833, lon: 72.4833 },
  'vadgam apmc': { lat: 24.0833, lon: 72.4833 },
  'himatnagar': { lat: 23.5977, lon: 72.9667 },
  'himatnagar apmc': { lat: 23.5977, lon: 72.9667 },
  'dhansura': { lat: 23.3667, lon: 73.2167 },
  'bayad': { lat: 23.2333, lon: 73.2167 },
  'ahmedabad': { lat: 23.0033, lon: 72.5855 }, // Jamalpur / APMC Vasna Yard
  'ahmedabad apmc': { lat: 23.0033, lon: 72.5855 },
  'ahmedabad(manekchowk)': { lat: 23.0245, lon: 72.5898 },
  'sanand': { lat: 22.9912, lon: 72.3789 },
  'vadodara': { lat: 22.3072, lon: 73.1812 }, // Sayajipura APMC
  'vadodara apmc': { lat: 22.3072, lon: 73.1812 },
  'vadodara(navapura)': { lat: 22.3072, lon: 73.1812 },
  'savli': { lat: 22.5606, lon: 73.2206 },
  'anand': { lat: 22.5645, lon: 72.9289 },
  'anand(veg,yard,anand)': { lat: 22.5645, lon: 72.9289 },
  'khambhat': { lat: 22.3131, lon: 72.6194 },
  'petlad': { lat: 22.4744, lon: 72.8028 },
  'nadiad': { lat: 22.6916, lon: 72.8634 },
  'nadiyad(piplag)': { lat: 22.6916, lon: 72.8634 },
  'dahod': { lat: 22.8378, lon: 74.2544 },
  'dahod apmc': { lat: 22.8378, lon: 74.2544 },
  'dahod(veg. market) apmc': { lat: 22.8378, lon: 74.2544 },
  'godhra': { lat: 22.7758, lon: 73.6149 },
  'godhra kakanpur apmc': { lat: 22.7758, lon: 73.6149 },
  'morva hafad apmc': { lat: 22.9800, lon: 73.8300 },
  'jamnagar': { lat: 22.4707, lon: 70.0577 },
  'jamnagar apmc': { lat: 22.4707, lon: 70.0577 },
  'jam jodhpur': { lat: 21.9028, lon: 70.0333 },
  'jam jodhpur apmc': { lat: 21.9028, lon: 70.0333 },
  'dhrol': { lat: 22.5658, lon: 70.4144 },
  'dhrol apmc': { lat: 22.5658, lon: 70.4144 },
  'kalawad': { lat: 22.2136, lon: 70.3800 },
  'kalawad apmc': { lat: 22.2136, lon: 70.3800 },
  'junagadh': { lat: 21.5222, lon: 70.4579 },
  'junagadh apmc': { lat: 21.5222, lon: 70.4579 },
  'visavadar': { lat: 21.3361, lon: 70.7028 },
  'visavadar apmc': { lat: 21.3361, lon: 70.7028 },
  'amreli': { lat: 21.6032, lon: 71.2221 },
  'amreli apmc': { lat: 21.6032, lon: 71.2221 },
  'savarkundla': { lat: 21.3333, lon: 71.3000 },
  'rajula': { lat: 20.9997, lon: 71.4328 },
  'dhari': { lat: 21.3300, lon: 71.0200 },
  'dhari apmc': { lat: 21.3300, lon: 71.0200 },
  'dhari(chalala)': { lat: 21.4100, lon: 71.1700 },
  'bhavnagar': { lat: 21.7645, lon: 72.1519 },
  'mahuva': { lat: 21.0914, lon: 71.7628 }, // Mahuva Onion Mandi
  'porbandar': { lat: 21.6417, lon: 69.6293 },
  'porbandar apmc': { lat: 21.6417, lon: 69.6293 },
  'vadhvan': { lat: 22.7000, lon: 71.6800 },
  'surendranagar': { lat: 22.7277, lon: 71.6370 },
  'botad': { lat: 22.1704, lon: 71.6669 },
  'veraval': { lat: 20.9042, lon: 70.3667 },

  // Maharashtra APMCs
  'pune': { lat: 18.4967, lon: 73.8677 }, // Gultekdi Market Yard, Pune
  'pune apmc': { lat: 18.4967, lon: 73.8677 },
  'nashik': { lat: 19.9975, lon: 73.7898 },
  'nashik apmc': { lat: 19.9975, lon: 73.7898 },
  'lasalgaon': { lat: 20.1472, lon: 74.2278 }, // Largest Onion Mandi in Asia
  'lasalgaon apmc': { lat: 20.1472, lon: 74.2278 },
  'malegaon': { lat: 20.5539, lon: 74.5288 },
  'jalgaon': { lat: 21.0077, lon: 75.5626 },
  'nagpur': { lat: 21.1458, lon: 79.0882 }, // Kalamna APMC
  'nagpur apmc': { lat: 21.1458, lon: 79.0882 },
  'solapur': { lat: 17.6599, lon: 75.9064 },
  'solapur apmc': { lat: 17.6599, lon: 75.9064 },
  'karmala': { lat: 18.4167, lon: 75.2000 },
  'karmala apmc': { lat: 18.4167, lon: 75.2000 },
  'rahata': { lat: 19.7000, lon: 74.4833 },
  'rahata apmc': { lat: 19.7000, lon: 74.4833 },
  'vashi': { lat: 19.0754, lon: 73.0068 }, // Mumbai Vashi APMC
  'mumbai apmc': { lat: 19.0754, lon: 73.0068 },

  // Madhya Pradesh APMCs
  'indore': { lat: 22.6869, lon: 75.8339 }, // Choithram Mandi, Indore
  'indore apmc': { lat: 22.6869, lon: 75.8339 },
  'ujjain': { lat: 23.1765, lon: 75.7885 }, // Chimanganj Mandi, Ujjain
  'ujjain apmc': { lat: 23.1765, lon: 75.7885 },
  'tarana': { lat: 23.3333, lon: 76.0333 },
  'tarana apmc': { lat: 23.3333, lon: 76.0333 },
  'ashoknagar': { lat: 24.5800, lon: 77.7300 },
  'ashoknagar apmc': { lat: 24.5800, lon: 77.7300 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'mandsaur': { lat: 24.0722, lon: 75.0682 },
  'neemuch': { lat: 24.4667, lon: 74.8833 },
  'ratlam': { lat: 23.3315, lon: 75.0367 }
};

// 2. DISTRICT CENTROID COORDINATES (Used strictly as estimated fallback when exact APMC yard is unspecified)
export const DISTRICT_CENTROID_COORDINATES: Record<string, Coordinates> = {
  // Gujarat Districts
  'surat': { lat: 21.1702, lon: 72.8311 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'vadodara': { lat: 22.3072, lon: 73.1812 },
  'rajkot': { lat: 22.3039, lon: 70.8022 },
  'morbi': { lat: 22.8120, lon: 70.8378 },
  'jamnagar': { lat: 22.4707, lon: 70.0577 },
  'junagadh': { lat: 21.5222, lon: 70.4579 },
  'amreli': { lat: 21.6032, lon: 71.2221 },
  'bhavnagar': { lat: 21.7645, lon: 72.1519 },
  'anand': { lat: 22.5645, lon: 72.9289 },
  'kheda': { lat: 22.6916, lon: 72.8634 },
  'mehsana': { lat: 23.5880, lon: 72.3693 },
  'patan': { lat: 23.8504, lon: 72.1266 },
  'banaskantha': { lat: 24.2589, lon: 72.1793 },
  'banaskanth': { lat: 24.2589, lon: 72.1793 },
  'sabarkantha': { lat: 23.5977, lon: 72.9667 },
  'sabarkanth': { lat: 23.5977, lon: 72.9667 },
  'bharuch': { lat: 21.7051, lon: 72.9959 },
  'navsari': { lat: 20.9467, lon: 72.9520 },
  'valsad': { lat: 20.5992, lon: 72.9342 },
  'panchmahal': { lat: 22.7758, lon: 73.6149 },
  'panchmahals': { lat: 22.7758, lon: 73.6149 },
  'dahod': { lat: 22.8378, lon: 74.2544 },
  'surendranagar': { lat: 22.7277, lon: 71.6370 },
  'botad': { lat: 22.1704, lon: 71.6669 },
  'porbandar': { lat: 21.6417, lon: 69.6293 },
  'gir somnath': { lat: 20.9042, lon: 70.3667 },
  'tapi': { lat: 21.2884, lon: 73.4390 },
  'narmada': { lat: 21.8700, lon: 73.5000 },
  'dang': { lat: 20.8500, lon: 73.7000 },

  // Maharashtra Districts
  'pune': { lat: 18.5204, lon: 73.8567 },
  'nashik': { lat: 19.9975, lon: 73.7898 },
  'jalgaon': { lat: 21.0077, lon: 75.5626 },
  'nagpur': { lat: 21.1458, lon: 79.0882 },
  'kolhapur': { lat: 16.7050, lon: 74.2433 },
  'solapur': { lat: 17.6599, lon: 75.9064 },
  'ahmednagar': { lat: 19.0948, lon: 74.7480 },
  'ahilyanagar': { lat: 19.0948, lon: 74.7480 },
  'satara': { lat: 17.6805, lon: 74.0183 },
  'sangli': { lat: 16.8524, lon: 74.5815 },
  'amravati': { lat: 20.9374, lon: 77.7796 },
  'aurangabad': { lat: 19.8762, lon: 75.3433 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lon: 75.3433 },
  'palghar': { lat: 19.6967, lon: 72.7699 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },

  // Madhya Pradesh Districts
  'indore': { lat: 22.7196, lon: 75.8577 },
  'ujjain': { lat: 23.1765, lon: 75.7885 },
  'ashoknagar': { lat: 24.5800, lon: 77.7300 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'mandsaur': { lat: 24.0722, lon: 75.0682 },
  'neemuch': { lat: 24.4667, lon: 74.8833 },
  'dewas': { lat: 22.9676, lon: 76.0534 },
  'gwalior': { lat: 26.2183, lon: 78.1828 },
  'jabalpur': { lat: 23.1815, lon: 79.9864 },
  'sagar': { lat: 23.8388, lon: 78.7378 },
  'ratlam': { lat: 23.3315, lon: 75.0367 },

  // Rajasthan Districts
  'jaipur': { lat: 26.9124, lon: 75.7873 },
  'kota': { lat: 25.1825, lon: 75.8398 },
  'jodhpur': { lat: 26.2389, lon: 73.0243 },
  'bikaner': { lat: 28.0229, lon: 73.3119 },
  'ganganagar': { lat: 29.9038, lon: 73.8772 },

  // Punjab & Haryana
  'ludhiana': { lat: 30.9010, lon: 75.8573 },
  'amritsar': { lat: 31.6340, lon: 74.8723 },
  'karnal': { lat: 29.6857, lon: 76.9905 },
  'panipat': { lat: 29.3909, lon: 76.9635 }
};

// District to Canonical State Mapping for client-side state/district validation
export const DISTRICT_TO_STATE_MAP: Record<string, string> = {
  // Gujarat
  'surat': 'Gujarat',
  'bardoli': 'Gujarat',
  'navsari': 'Gujarat',
  'bilimora': 'Gujarat',
  'chikli': 'Gujarat',
  'chikhli': 'Gujarat',
  'vyara': 'Gujarat',
  'vyra': 'Gujarat',
  'tapi': 'Gujarat',
  'bharuch': 'Gujarat',
  'ankleshwar': 'Gujarat',
  'jhagadiya': 'Gujarat',
  'valsad': 'Gujarat',
  'rajkot': 'Gujarat',
  'gondal': 'Gujarat',
  'jetpur': 'Gujarat',
  'upleta': 'Gujarat',
  'morbi': 'Gujarat',
  'vankaner': 'Gujarat',
  'unjha': 'Gujarat',
  'mehsana': 'Gujarat',
  'deesa': 'Gujarat',
  'diyodar': 'Gujarat',
  'palanpur': 'Gujarat',
  'dhanera': 'Gujarat',
  'vadgam': 'Gujarat',
  'himatnagar': 'Gujarat',
  'dhansura': 'Gujarat',
  'bayad': 'Gujarat',
  'ahmedabad': 'Gujarat',
  'ahmadabad': 'Gujarat',
  'sanand': 'Gujarat',
  'dholka': 'Gujarat',
  'vadodara': 'Gujarat',
  'baroda': 'Gujarat',
  'savli': 'Gujarat',
  'anand': 'Gujarat',
  'khambhat': 'Gujarat',
  'petlad': 'Gujarat',
  'nadiad': 'Gujarat',
  'dahod': 'Gujarat',
  'godhra': 'Gujarat',
  'jamnagar': 'Gujarat',
  'jam jodhpur': 'Gujarat',
  'dhrol': 'Gujarat',
  'kalawad': 'Gujarat',
  'junagadh': 'Gujarat',
  'visavadar': 'Gujarat',
  'amreli': 'Gujarat',
  'savarkundla': 'Gujarat',
  'rajula': 'Gujarat',
  'dhari': 'Gujarat',
  'chalala': 'Gujarat',
  'bhavnagar': 'Gujarat',
  'mahuva': 'Gujarat',
  'palitana': 'Gujarat',
  'porbandar': 'Gujarat',
  'vadhvan': 'Gujarat',
  'surendranagar': 'Gujarat',
  'botad': 'Gujarat',
  'veraval': 'Gujarat',
  'gir somnath': 'Gujarat',
  'patan': 'Gujarat',
  'banaskantha': 'Gujarat',
  'sabarkantha': 'Gujarat',
  'kheda': 'Gujarat',
  'narmada': 'Gujarat',
  'dang': 'Gujarat',

  // Madhya Pradesh
  'indore': 'Madhya Pradesh',
  'ujjain': 'Madhya Pradesh',
  'tarana': 'Madhya Pradesh',
  'ashoknagar': 'Madhya Pradesh',
  'bhopal': 'Madhya Pradesh',
  'mandsaur': 'Madhya Pradesh',
  'neemuch': 'Madhya Pradesh',
  'dewas': 'Madhya Pradesh',
  'gwalior': 'Madhya Pradesh',
  'jabalpur': 'Madhya Pradesh',
  'sagar': 'Madhya Pradesh',
  'ratlam': 'Madhya Pradesh',
  'khargone': 'Madhya Pradesh',
  'khandwa': 'Madhya Pradesh',
  'vidisha': 'Madhya Pradesh',
  'sehore': 'Madhya Pradesh',

  // Maharashtra
  'pune': 'Maharashtra',
  'nashik': 'Maharashtra',
  'lasalgaon': 'Maharashtra',
  'malegaon': 'Maharashtra',
  'jalgaon': 'Maharashtra',
  'nagpur': 'Maharashtra',
  'solapur': 'Maharashtra',
  'karmala': 'Maharashtra',
  'rahata': 'Maharashtra',
  'vashi': 'Maharashtra',
  'mumbai': 'Maharashtra',
  'kolhapur': 'Maharashtra',
  'ahmednagar': 'Maharashtra',
  'ahilyanagar': 'Maharashtra',
  'satara': 'Maharashtra',
  'sangli': 'Maharashtra',
  'amravati': 'Maharashtra',
  'aurangabad': 'Maharashtra',
  'chhatrapati sambhajinagar': 'Maharashtra',
  'palghar': 'Maharashtra',

  // Rajasthan
  'jaipur': 'Rajasthan',
  'kota': 'Rajasthan',
  'jodhpur': 'Rajasthan',
  'bikaner': 'Rajasthan',
  'ganganagar': 'Rajasthan',

  // Punjab & Haryana
  'ludhiana': 'Punjab',
  'amritsar': 'Punjab',
  'karnal': 'Haryana',
  'panipat': 'Haryana'
};

export function getCanonicalStateForDistrict(districtName?: string | null): string | null {
  if (!districtName) return null;
  const clean = districtName.toLowerCase().replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (DISTRICT_TO_STATE_MAP[clean]) {
    return DISTRICT_TO_STATE_MAP[clean];
  }

  for (const [key, state] of Object.entries(DISTRICT_TO_STATE_MAP)) {
    if (clean.includes(key)) {
      return state;
    }
  }

  return null;
}

/**
 * Calculate Great-Circle Distance using the Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Clean strings for coordinate lookups
 */
function normalizeName(input?: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolve coordinates for a given mandi or district name.
 * Strictly checks verified mandi ground coordinates first, then falls back to district centroid.
 * Never invents coordinates if no geographic match exists.
 */
export function resolveMandiCoordinates(mandiName: string, district?: string): CoordinateResolution | null {
  const normMandi = normalizeName(mandiName);
  const normDistrict = normalizeName(district);

  // 1. Check exact or prefix matches in VERIFIED APMC ground locations
  for (const [key, coords] of Object.entries(VERIFIED_MANDI_COORDINATES)) {
    if (normMandi === key || normMandi.includes(key) || key.includes(normMandi)) {
      return {
        lat: coords.lat,
        lon: coords.lon,
        isVerifiedMandi: true,
        resolvedName: mandiName
      };
    }
  }

  // 2. Check DISTRICT CENTROID ESTIMATES
  if (normDistrict) {
    for (const [key, coords] of Object.entries(DISTRICT_CENTROID_COORDINATES)) {
      if (normDistrict === key || normDistrict.includes(key) || key.includes(normDistrict)) {
        return {
          lat: coords.lat,
          lon: coords.lon,
          isVerifiedMandi: false,
          resolvedName: `${district} (District Centroid)`
        };
      }
    }
  }

  // 3. Fallback check of mandi name against district centroids
  for (const [key, coords] of Object.entries(DISTRICT_CENTROID_COORDINATES)) {
    if (normMandi.includes(key)) {
      return {
        lat: coords.lat,
        lon: coords.lon,
        isVerifiedMandi: false,
        resolvedName: `${mandiName} (Estimated)`
      };
    }
  }

  // Missing coordinates: Return null (no fabricated coordinates)
  return null;
}

/**
 * Calculate distance result with farmer-friendly tier classification and verified distinction.
 */
export function getDistanceMetadata(
  userLat: number | null | undefined,
  userLon: number | null | undefined,
  mandiLat: number | null | undefined,
  mandiLon: number | null | undefined,
  isVerifiedMandi: boolean = false
): DistanceResult | null {
  if (
    typeof userLat !== 'number' ||
    typeof userLon !== 'number' ||
    typeof mandiLat !== 'number' ||
    typeof mandiLon !== 'number'
  ) {
    return null;
  }

  const distanceKm = calculateDistanceKm(userLat, userLon, mandiLat, mandiLon);

  if (distanceKm <= 50) {
    return {
      distanceKm,
      tier: 'local',
      isVerifiedMandi,
      label: isVerifiedMandi ? `${distanceKm} km away` : `~${distanceKm} km away (District Estimate)`,
      badgeText: 'Local APMC',
      tierColor: 'emerald'
    };
  }

  if (distanceKm <= 150) {
    return {
      distanceKm,
      tier: 'regional',
      isVerifiedMandi,
      label: isVerifiedMandi ? `${distanceKm} km away` : `~${distanceKm} km away (District Estimate)`,
      badgeText: 'Regional Mandi',
      tierColor: 'teal'
    };
  }

  if (distanceKm <= 300) {
    return {
      distanceKm,
      tier: 'statewide',
      isVerifiedMandi,
      label: isVerifiedMandi ? `${distanceKm} km away` : `~${distanceKm} km away (District Estimate)`,
      badgeText: 'Statewide Hub',
      tierColor: 'indigo'
    };
  }

  return {
    distanceKm,
    tier: 'distant',
    isVerifiedMandi,
    label: isVerifiedMandi ? `${distanceKm} km away` : `~${distanceKm} km away (Distant)`,
    badgeText: 'Distant Market',
    tierColor: 'slate'
  };
}
