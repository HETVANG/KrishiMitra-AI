/**
 * Mandi & District Geographic Coordinates and Distance Calculations
 * Covers major Indian APMC Mandis and Agricultural Districts for realistic proximity sorting.
 */

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface DistanceResult {
  distanceKm: number;
  tier: 'local' | 'regional' | 'statewide';
  label: string;
}

// Major Agricultural Districts & Mandi Coordinates across India
export const DISTRICT_COORDINATES: Record<string, Coordinates> = {
  // Gujarat
  'rajkot': { lat: 22.3039, lon: 70.8022 },
  'gondal': { lat: 21.9619, lon: 70.7923 },
  'morbi': { lat: 22.8120, lon: 70.8378 },
  'junagadh': { lat: 21.5222, lon: 70.4579 },
  'amreli': { lat: 21.6032, lon: 71.2221 },
  'jamnagar': { lat: 22.4707, lon: 70.0577 },
  'bhavnagar': { lat: 21.7645, lon: 72.1519 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'sanand': { lat: 22.9912, lon: 72.3789 },
  'surat': { lat: 21.1702, lon: 72.8311 },
  'vadodara': { lat: 22.3072, lon: 73.1812 },
  'anand': { lat: 22.5645, lon: 72.9289 },
  'kheda': { lat: 22.6916, lon: 72.8634 },
  'nadiad': { lat: 22.6916, lon: 72.8634 },
  'mehsana': { lat: 23.5880, lon: 72.3693 },
  'patan': { lat: 23.8504, lon: 72.1266 },
  'banaskantha': { lat: 24.2589, lon: 72.1793 },
  'palanpur': { lat: 24.1725, lon: 72.4343 },
  'deesa': { lat: 24.2589, lon: 72.1793 },
  'sabarkantha': { lat: 23.5977, lon: 72.9667 },
  'himatnagar': { lat: 23.5977, lon: 72.9667 },
  'bharuch': { lat: 21.7051, lon: 72.9959 },
  'surendranagar': { lat: 22.7277, lon: 71.6370 },
  'botad': { lat: 22.1704, lon: 71.6669 },
  'porbandar': { lat: 21.6417, lon: 69.6293 },
  'gir somnath': { lat: 20.9042, lon: 70.3667 },
  'veraval': { lat: 20.9042, lon: 70.3667 },
  'dahod': { lat: 22.8378, lon: 74.2544 },
  'panchmahal': { lat: 22.7758, lon: 73.6149 },
  'godhra': { lat: 22.7758, lon: 73.6149 },
  'navsari': { lat: 20.9467, lon: 72.9520 },
  'valsad': { lat: 20.5992, lon: 72.9342 },
  'tapi': { lat: 21.2884, lon: 73.4390 },
  'narmada': { lat: 21.8700, lon: 73.5000 },
  'dang': { lat: 20.8500, lon: 73.7000 },

  // Maharashtra
  'pune': { lat: 18.5204, lon: 73.8567 },
  'nashik': { lat: 19.9975, lon: 73.7898 },
  'malegaon': { lat: 20.5539, lon: 74.5288 },
  'jalgaon': { lat: 21.0077, lon: 75.5626 },
  'nagpur': { lat: 21.1458, lon: 79.0882 },
  'kolhapur': { lat: 16.7050, lon: 74.2433 },
  'solapur': { lat: 17.6599, lon: 75.9064 },
  'ahmednagar': { lat: 19.0948, lon: 74.7480 },
  'satara': { lat: 17.6805, lon: 74.0183 },
  'sangli': { lat: 16.8524, lon: 74.5815 },
  'amravati': { lat: 20.9374, lon: 77.7796 },
  'nanded': { lat: 19.1383, lon: 77.3210 },
  'latur': { lat: 18.4088, lon: 76.5604 },
  'jalana': { lat: 19.8410, lon: 75.8864 },
  'jalna': { lat: 19.8410, lon: 75.8864 },
  'aurangabad': { lat: 19.8762, lon: 75.3433 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lon: 75.3433 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },

  // Madhya Pradesh
  'indore': { lat: 22.7196, lon: 75.8577 },
  'ujjain': { lat: 23.1765, lon: 75.7885 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'mandsaur': { lat: 24.0722, lon: 75.0682 },
  'neemuch': { lat: 24.4667, lon: 74.8833 },
  'dewas': { lat: 22.9676, lon: 76.0534 },
  'gwalior': { lat: 26.2183, lon: 78.1828 },
  'jabalpur': { lat: 23.1815, lon: 79.9864 },
  'sagar': { lat: 23.8388, lon: 78.7378 },
  'ratlam': { lat: 23.3315, lon: 75.0367 },
  'khargone': { lat: 21.8234, lon: 75.6111 },
  'sehore': { lat: 23.2031, lon: 77.0844 },

  // Punjab
  'ludhiana': { lat: 30.9010, lon: 75.8573 },
  'amritsar': { lat: 31.6340, lon: 74.8723 },
  'jalandhar': { lat: 31.3260, lon: 75.5762 },
  'patiala': { lat: 30.3398, lon: 76.3869 },
  'bathinda': { lat: 30.2110, lon: 74.9455 },
  'firozpur': { lat: 30.9237, lon: 74.6136 },
  'khanna': { lat: 30.7071, lon: 76.2163 },

  // Haryana
  'karnal': { lat: 29.6857, lon: 76.9905 },
  'kurukshetra': { lat: 29.9695, lon: 76.8783 },
  'ambala': { lat: 30.3782, lon: 76.7767 },
  'hisar': { lat: 29.1492, lon: 75.7217 },
  'rohtak': { lat: 28.8955, lon: 76.6066 },
  'sirsa': { lat: 29.5349, lon: 75.0289 },
  'panipat': { lat: 29.3909, lon: 76.9635 },

  // Uttar Pradesh
  'pillibhit': { lat: 28.6258, lon: 79.8054 },
  'pilibhit': { lat: 28.6258, lon: 79.8054 },
  'agra': { lat: 27.1767, lon: 78.0081 },
  'kanpur': { lat: 26.4499, lon: 80.3319 },
  'meerut': { lat: 28.9845, lon: 77.7064 },
  'bareilly': { lat: 28.3670, lon: 79.4304 },
  'aligarh': { lat: 27.8974, lon: 78.0880 },
  'mathura': { lat: 27.4924, lon: 77.6737 },
  'ghaziabad': { lat: 28.6692, lon: 77.4538 },
  'lucknow': { lat: 26.8467, lon: 80.9462 },
  'varanasi': { lat: 25.3176, lon: 82.9739 },
  'prayagraj': { lat: 25.4358, lon: 81.8463 },
  'muzaffarnagar': { lat: 29.4727, lon: 77.7085 },

  // Rajasthan
  'jaipur': { lat: 26.9124, lon: 75.7873 },
  'kota': { lat: 25.2138, lon: 75.8648 },
  'jodhpur': { lat: 26.2389, lon: 73.0243 },
  'bikaner': { lat: 28.0229, lon: 73.3119 },
  'sriganganagar': { lat: 29.9038, lon: 73.8772 },
  'alwar': { lat: 27.5530, lon: 76.6346 },
  'chittorgarh': { lat: 24.8887, lon: 74.6269 },

  // Karnataka
  'raichur': { lat: 16.2120, lon: 77.3439 },
  'bellary': { lat: 15.1394, lon: 76.9214 },
  'hubli': { lat: 15.3647, lon: 75.1240 },
  'dharwad': { lat: 15.4589, lon: 75.0078 },
  'belgaum': { lat: 15.8497, lon: 74.4977 },
  'shimoga': { lat: 13.9299, lon: 75.5681 },
  'mysore': { lat: 12.2958, lon: 76.6394 },
  'bangalore': { lat: 12.9716, lon: 77.5946 },

  // Tamil Nadu
  'salem': { lat: 11.6643, lon: 78.1460 },
  'madurai': { lat: 9.9252, lon: 78.1198 },
  'coimbatore': { lat: 11.0168, lon: 76.9558 },
  'vellore': { lat: 12.9165, lon: 79.1325 },
  'thiruvellore': { lat: 13.1432, lon: 79.9083 },
  'thiruvannamalai': { lat: 12.2253, lon: 79.0747 },
  'namakkal': { lat: 11.2189, lon: 78.1674 },
  'ranipet': { lat: 12.9224, lon: 79.3328 },
  'ramanathapuram': { lat: 9.3639, lon: 78.8395 },
  'nagercoil': { lat: 8.1833, lon: 77.4119 },

  // Telangana & Andhra Pradesh
  'hyderabad': { lat: 17.3850, lon: 78.4867 },
  'nalgonda': { lat: 17.0577, lon: 79.2684 },
  'warangal': { lat: 17.9689, lon: 79.5941 },
  'guntur': { lat: 16.3067, lon: 80.4365 },
  'vijayawada': { lat: 16.5062, lon: 80.6480 },

  // Kerala
  'palakad': { lat: 10.7867, lon: 76.6548 },
  'palakkad': { lat: 10.7867, lon: 76.6548 },
  'idukki': { lat: 9.8500, lon: 76.9400 },
  'thirssur': { lat: 10.5276, lon: 76.2144 },
  'thrissur': { lat: 10.5276, lon: 76.2144 },

  // West Bengal
  'medinipur': { lat: 22.4257, lon: 87.3199 },
  'burdwan': { lat: 23.2324, lon: 87.8615 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },

  // Delhi & J&K
  'delhi': { lat: 28.7041, lon: 77.1025 },
  'jammu': { lat: 32.7266, lon: 74.8570 },
  'kupwara': { lat: 34.5262, lon: 74.2546 },
};

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
 * Resolve coordinates for a given mandi or district name
 */
export function resolveMandiCoordinates(mandiName: string, district?: string): Coordinates | null {
  const cleanDistrict = (district || '').toLowerCase().trim();
  const cleanMandi = (mandiName || '').toLowerCase().trim();

  // 1. Direct district match
  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    if (cleanDistrict === key || cleanDistrict.includes(key)) {
      return coords;
    }
  }

  // 2. Direct mandi name match
  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    if (cleanMandi === key || cleanMandi.includes(key)) {
      return coords;
    }
  }

  return null;
}

/**
 * Calculate distance result with farmer-friendly tier classification
 */
export function getDistanceMetadata(
  userLat: number | null | undefined,
  userLon: number | null | undefined,
  mandiLat: number | null | undefined,
  mandiLon: number | null | undefined
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
      label: `${distanceKm} km away`
    };
  }

  if (distanceKm <= 150) {
    return {
      distanceKm,
      tier: 'regional',
      label: `${distanceKm} km away`
    };
  }

  return {
    distanceKm,
    tier: 'statewide',
    label: `${distanceKm} km away`
  };
}
