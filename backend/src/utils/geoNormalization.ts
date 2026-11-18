/**
 * Geographic Normalization and Proximity Intelligence Utility
 * Normalizes Indian States, Districts, Neighboring Regions, and Date Freshness.
 */

// Normalized canonical states in India
export const STATE_CANONICAL_MAP: Record<string, string> = {
  // Western & Central
  'gujarat': 'Gujarat',
  'gujrat': 'Gujarat',
  'gj': 'Gujarat',
  'maharashtra': 'Maharashtra',
  'mh': 'Maharashtra',
  'madhya pradesh': 'Madhya Pradesh',
  'mp': 'Madhya Pradesh',
  'rajasthan': 'Rajasthan',
  'rj': 'Rajasthan',
  'goa': 'Goa',
  'chhattisgarh': 'Chhattisgarh',
  'cg': 'Chhattisgarh',

  // Northern
  'punjab': 'Punjab',
  'pb': 'Punjab',
  'haryana': 'Haryana',
  'hr': 'Haryana',
  'uttar pradesh': 'Uttar Pradesh',
  'up': 'Uttar Pradesh',
  'delhi': 'Delhi',
  'dl': 'Delhi',
  'himachal pradesh': 'Himachal Pradesh',
  'hp': 'Himachal Pradesh',
  'uttarakhand': 'Uttarakhand',
  'uk': 'Uttarakhand',
  'jammu and kashmir': 'Jammu and Kashmir',
  'jk': 'Jammu and Kashmir',

  // Southern
  'karnataka': 'Karnataka',
  'ka': 'Karnataka',
  'tamil nadu': 'Tamil Nadu',
  'tn': 'Tamil Nadu',
  'andhra pradesh': 'Andhra Pradesh',
  'ap': 'Andhra Pradesh',
  'telangana': 'Telangana',
  'ts': 'Telangana',
  'kerala': 'Kerala',
  'kl': 'Kerala',

  // Eastern & North-Eastern
  'bihar': 'Bihar',
  'br': 'Bihar',
  'west bengal': 'West Bengal',
  'wb': 'West Bengal',
  'odisha': 'Odisha',
  'orissa': 'Odisha',
  'or': 'Odisha',
  'jharkhand': 'Jharkhand',
  'jh': 'Jharkhand',
  'assam': 'Assam',
  'as': 'Assam'
};

// Neighboring states mapping for progressive geographic expansion
export const NEIGHBORING_STATES_MAP: Record<string, string[]> = {
  'Gujarat': ['Maharashtra', 'Rajasthan', 'Madhya Pradesh'],
  'Maharashtra': ['Gujarat', 'Madhya Pradesh', 'Karnataka', 'Telangana', 'Goa', 'Chhattisgarh'],
  'Madhya Pradesh': ['Rajasthan', 'Uttar Pradesh', 'Chhattisgarh', 'Maharashtra', 'Gujarat'],
  'Rajasthan': ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat'],
  'Punjab': ['Haryana', 'Rajasthan', 'Himachal Pradesh', 'Jammu and Kashmir'],
  'Haryana': ['Punjab', 'Rajasthan', 'Uttar Pradesh', 'Delhi', 'Himachal Pradesh'],
  'Uttar Pradesh': ['Haryana', 'Rajasthan', 'Madhya Pradesh', 'Bihar', 'Uttarakhand', 'Delhi', 'Chhattisgarh', 'Jharkhand'],
  'Bihar': ['Uttar Pradesh', 'Jharkhand', 'West Bengal'],
  'Karnataka': ['Maharashtra', 'Goa', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana'],
  'Tamil Nadu': ['Kerala', 'Karnataka', 'Andhra Pradesh'],
  'Andhra Pradesh': ['Tamil Nadu', 'Karnataka', 'Telangana', 'Odisha'],
  'Telangana': ['Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Chhattisgarh'],
  'West Bengal': ['Bihar', 'Jharkhand', 'Odisha', 'Assam', 'Sikkim'],
  'Odisha': ['West Bengal', 'Jharkhand', 'Chhattisgarh', 'Andhra Pradesh'],
  'Chhattisgarh': ['Madhya Pradesh', 'Maharashtra', 'Telangana', 'Odisha', 'Jharkhand', 'Uttar Pradesh'],
  'Jharkhand': ['Bihar', 'Uttar Pradesh', 'Chhattisgarh', 'Odisha', 'West Bengal']
};

// Common district alternate names and aliases in major agricultural zones
export const DISTRICT_ALIAS_MAP: Record<string, string[]> = {
  'surat': ['surat', 'surat apmc'],
  'ahmedabad': ['ahmedabad', 'ahmadabad', 'dholka', 'sanand'],
  'vadodara': ['vadodara', 'baroda', 'vadodara(baroda)', 'savli'],
  'rajkot': ['rajkot', 'gondal', 'jetpur', 'upleta', 'dhoraji'],
  'morbi': ['morbi', 'morvi', 'vankaner', 'halvad'],
  'jamnagar': ['jamnagar', 'jam jodhpur', 'dhrol', 'kalawad'],
  'junagadh': ['junagadh', 'junagarh', 'visavadar', 'keshod', 'manavadar'],
  'amreli': ['amreli', 'savarkundla', 'rajula', 'bagasara', 'dhari', 'chalala'],
  'bhavnagar': ['bhavnagar', 'mahuva', 'palitana', 'talaja', 'gadhada'],
  'banaskantha': ['banaskantha', 'banaskanth', 'palanpur', 'deesa', 'dhanera', 'diyodar', 'vadgam', 'thara'],
  'sabarkantha': ['sabarkantha', 'sabarkanth', 'himatnagar', 'idhar', 'khedbrahma', 'dhansura', 'bayad'],
  'kheda': ['kheda', 'nadiad', 'matar', 'kapadvanj', 'mehmedabad'],
  'anand': ['anand', 'khambhat', 'petlad', 'borsad', 'umreth'],
  'bharuch': ['bharuch', 'broach', 'ankleshwar', 'jhagadiya', 'jambusar', 'valia'],
  'navsari': ['navsari', 'bilimora', 'chikhli', 'jalalpore', 'bansda'],
  'valsad': ['valsad', 'bulsar', 'vapi', 'pardi', 'dharampur', 'umargam'],
  'panchmahal': ['panchmahal', 'panchmahals', 'godhra', 'morva hafad', 'kalol', 'halol'],
  'dahod': ['dahod', 'dohad', 'zalod', 'limkheda', 'garbada'],
  'surendranagar': ['surendranagar', 'vadhvan', 'dhrangadhra', 'chotila', 'limbdi'],
  'botad': ['botad', 'barwala', 'gadhada'],
  'gir somnath': ['gir somnath', 'veraval', 'kodinar', 'una', 'talala'],
  'porbandar': ['porbandar', 'ranavav', 'kutiyana'],
  'tapi': ['tapi', 'vyara', 'vyra', 'songadh'],
  'narmada': ['narmada', 'rajpipla', 'dediapada', 'tilakwada']
};

/**
 * Normalizes user or API state name into canonical format
 */
export function normalizeState(rawState?: string | null): string {
  if (!rawState) return '';
  const clean = rawState.trim().toLowerCase();
  return STATE_CANONICAL_MAP[clean] || (clean.charAt(0).toUpperCase() + clean.slice(1));
}

/**
 * Returns list of neighboring states for a given state
 */
export function getNeighboringStates(stateName: string): string[] {
  const canonical = normalizeState(stateName);
  return NEIGHBORING_STATES_MAP[canonical] || [];
}

/**
 * Builds an intelligent regex for matching district variations and aliases
 */
export function buildDistrictRegex(rawDistrict?: string | null): RegExp | null {
  if (!rawDistrict) return null;
  const clean = rawDistrict.trim().toLowerCase();

  // Check alias map
  for (const [canonical, aliases] of Object.entries(DISTRICT_ALIAS_MAP)) {
    if (clean === canonical || aliases.includes(clean) || aliases.some(a => clean.includes(a))) {
      const pattern = aliases.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      return new RegExp(`(${pattern})`, 'i');
    }
  }

  // Fallback to escaped substring match
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}

/**
 * Calculate Great-Circle Distance using Haversine formula (km)
 */
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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
 * Evaluates record price freshness based on arrival date
 */
export function calculateFreshness(dateValue?: Date | string | null): {
  daysOld: number;
  status: 'live' | 'recent' | 'moderate' | 'stale';
  label: string;
  formattedDate: string;
} {
  if (!dateValue) {
    return {
      daysOld: 999,
      status: 'stale',
      label: 'Date Unavailable',
      formattedDate: 'Date Unavailable'
    };
  }

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    return {
      daysOld: 999,
      status: 'stale',
      label: 'Invalid Date',
      formattedDate: 'Date Unavailable'
    };
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const formattedDate = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  if (diffDays <= 1) {
    return {
      daysOld: diffDays,
      status: 'live',
      label: 'Live Today',
      formattedDate
    };
  } else if (diffDays <= 3) {
    return {
      daysOld: diffDays,
      status: 'recent',
      label: `${diffDays} days ago`,
      formattedDate
    };
  } else if (diffDays <= 7) {
    return {
      daysOld: diffDays,
      status: 'moderate',
      label: 'This Week',
      formattedDate
    };
  } else {
    return {
      daysOld: diffDays,
      status: 'stale',
      label: `Historical (${formattedDate})`,
      formattedDate
    };
  }
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface CoordinateResolution {
  lat: number;
  lon: number;
  isVerifiedMandi: boolean;
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

export const VERIFIED_MANDI_COORDINATES: Record<string, Coordinates> = {
  'surat': { lat: 21.2052, lon: 72.8428 },
  'surat apmc': { lat: 21.2052, lon: 72.8428 },
  'bardoli': { lat: 21.1215, lon: 73.1118 },
  'bardoli apmc': { lat: 21.1215, lon: 73.1118 },
  'bardoli(kadod)': { lat: 21.1215, lon: 73.1118 },
  'bardoli(kadod) apmc': { lat: 21.1215, lon: 73.1118 },
  'navsari': { lat: 20.9506, lon: 72.9288 },
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
  'valsad': { lat: 20.5992, lon: 72.9342 },
  'valsad apmc': { lat: 20.5992, lon: 72.9342 },
  'rajkot': { lat: 22.2858, lon: 70.8142 },
  'rajkot apmc': { lat: 22.2858, lon: 70.8142 },
  'gondal': { lat: 21.9619, lon: 70.7923 },
  'gondal apmc': { lat: 21.9619, lon: 70.7923 },
  'jetpur': { lat: 21.7589, lon: 70.6231 },
  'jetpur(dist.rajkot) apmc': { lat: 21.7589, lon: 70.6231 },
  'morbi': { lat: 22.8120, lon: 70.8378 },
  'morbi apmc': { lat: 22.8120, lon: 70.8378 },
  'vankaner': { lat: 22.6186, lon: 70.9634 },
  'vankaner apmc': { lat: 22.6186, lon: 70.9634 },
  'unjha': { lat: 23.8042, lon: 72.3925 },
  'unjha apmc': { lat: 23.8042, lon: 72.3925 },
  'mehsana': { lat: 23.5880, lon: 72.3693 },
  'deesa': { lat: 24.2589, lon: 72.1793 },
  'diyodar': { lat: 24.1167, lon: 71.7667 },
  'diyodar apmc': { lat: 24.1167, lon: 71.7667 },
  'palanpur': { lat: 24.1725, lon: 72.4343 },
  'ahmedabad': { lat: 23.0033, lon: 72.5855 },
  'ahmedabad apmc': { lat: 23.0033, lon: 72.5855 },
  'sanand': { lat: 22.9912, lon: 72.3789 },
  'vadodara': { lat: 22.3072, lon: 73.1812 },
  'vadodara apmc': { lat: 22.3072, lon: 73.1812 },
  'anand': { lat: 22.5645, lon: 72.9289 },
  'dahod': { lat: 22.8378, lon: 74.2544 },
  'jamnagar': { lat: 22.4707, lon: 70.0577 },
  'jam jodhpur': { lat: 21.9028, lon: 70.0333 },
  'junagadh': { lat: 21.5222, lon: 70.4579 },
  'amreli': { lat: 21.6032, lon: 71.2221 },
  'bhavnagar': { lat: 21.7645, lon: 72.1519 },
  'pune': { lat: 18.4967, lon: 73.8677 },
  'pune apmc': { lat: 18.4967, lon: 73.8677 },
  'nashik': { lat: 19.9975, lon: 73.7898 },
  'indore': { lat: 22.6869, lon: 75.8339 },
  'ujjain': { lat: 23.1765, lon: 75.7885 },
  'tarana': { lat: 23.3333, lon: 76.0333 },
  'ashoknagar': { lat: 24.5800, lon: 77.7300 }
};

export const DISTRICT_CENTROID_COORDINATES: Record<string, Coordinates> = {
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
  'bharuch': { lat: 21.7051, lon: 72.9959 },
  'navsari': { lat: 20.9467, lon: 72.9520 },
  'valsad': { lat: 20.5992, lon: 72.9342 },
  'panchmahal': { lat: 22.7758, lon: 73.6149 },
  'dahod': { lat: 22.8378, lon: 74.2544 },
  'surendranagar': { lat: 22.7277, lon: 71.6370 },
  'pune': { lat: 18.5204, lon: 73.8567 },
  'nashik': { lat: 19.9975, lon: 73.7898 },
  'indore': { lat: 22.7196, lon: 75.8577 },
  'ujjain': { lat: 23.1765, lon: 75.7885 },
  'ashoknagar': { lat: 24.5800, lon: 77.7300 }
};

export function resolveMandiCoordinates(mandiName: string, district?: string): CoordinateResolution | null {
  const normMandi = (mandiName || '').toLowerCase().replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
  const normDistrict = (district || '').toLowerCase().replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();

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

  return null;
}

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

  const distanceKm = calculateHaversineDistanceKm(userLat, userLon, mandiLat, mandiLon);

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
