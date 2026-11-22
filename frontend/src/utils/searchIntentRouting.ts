/**
 * Search Intent Routing Engine for KrishiMitra AI (The Khedut)
 * 
 * Intelligently classifies user queries and voice inputs across:
 * - AI Farm Copilot (General farming advice, agronomy, fertilizers, explanations)
 * - Crop Health Diagnosis (Leaf pathology scanner, image-based diagnosis)
 * - Mandi Prices (APMC commodity rates, market price trends)
 * - Weather Forecast (Farm meteorology, rain radar, spray advisory)
 * - Smart Irrigation (Soil moisture, irrigation schedule checks)
 * 
 * Supports English, Gujarati, and Hindi queries.
 */

export type SearchIntentType = 
  | 'copilot' 
  | 'disease' 
  | 'market' 
  | 'weather' 
  | 'irrigation';

export interface SearchIntentResult {
  intent: SearchIntentType;
  route: string;
  originalQuery: string;
  extractedCrop?: string;
  extractedLocation?: string;
  navigationState?: Record<string, any>;
  searchParams?: Record<string, string>;
  confidence: number;
  reason: string;
}

// Canonical crop list for extraction
const KNOWN_CROPS: Array<{ name: string; aliases: string[] }> = [
  { name: 'Wheat', aliases: ['wheat', 'gehu', 'ghau', 'ઘઉં', 'गेहूं', 'गेहु'] },
  { name: 'Cotton', aliases: ['cotton', 'kapas', 'ru', 'કપાસ', 'રૂ', 'कपास'] },
  { name: 'Paddy', aliases: ['paddy', 'rice', 'dhan', 'chaval', 'ડાંગર', 'ચોખા', 'ધાન', 'चावल'] },
  { name: 'Soybean', aliases: ['soybean', 'soya', 'સોયાબીન', 'सोयाबीन'] },
  { name: 'Mustard', aliases: ['mustard', 'sarson', 'rai', 'રાયડો', 'રાઈ', 'સરસવ', 'सरसों', 'राई'] },
  { name: 'Onion', aliases: ['onion', 'pyaz', 'dungri', 'ડુંગળી', 'કાંદા', 'प्याज'] },
  { name: 'Potato', aliases: ['potato', 'alu', 'bataka', 'બટાકા', 'બટાટા', 'आलू'] },
  { name: 'Tomato', aliases: ['tomato', 'tameta', 'tamatar', 'ટામેટા', 'ટમેટા', 'टमाटर'] },
  { name: 'Groundnut', aliases: ['groundnut', 'peanut', 'mungfali', 'sing', 'મગફળી', 'સીંગ', 'मूंगफली'] },
  { name: 'Maize', aliases: ['maize', 'corn', 'makai', 'bhutta', 'મકાઈ', 'मक्का', 'भुट्टा'] },
  { name: 'Gram', aliases: ['gram', 'chana', 'chana dal', 'ચણા', 'ચણા દાળ', 'चना'] },
  { name: 'Bajra', aliases: ['bajra', 'millet', 'બાજરી', 'બાજરો', 'बाजरा'] },
  { name: 'Castor', aliases: ['castor', 'aranda', 'divela', 'દિવેલા', 'એરંડા', 'अरंडी'] },
  { name: 'Cumin', aliases: ['cumin', 'jeera', 'jira', 'જીરું', 'જીરૂ', 'जीरा'] },
];

// Known agricultural locations in Gujarat and key Indian markets
const KNOWN_LOCATIONS: Array<{ name: string; aliases: string[] }> = [
  { name: 'Surat', aliases: ['surat', 'સુરત', 'सूरत'] },
  { name: 'Rajkot', aliases: ['rajkot', 'રાજકોટ', 'राजकोट'] },
  { name: 'Ahmedabad', aliases: ['ahmedabad', 'ahmadabad', 'અમદાવાદ', 'अहमदाबाद'] },
  { name: 'Vadodara', aliases: ['vadodara', 'baroda', 'વડોદરા', 'वडोदरा'] },
  { name: 'Gondal', aliases: ['gondal', 'ગોંડલ', 'गोंडल'] },
  { name: 'Amreli', aliases: ['amreli', 'અમરેલી', 'अमरेली'] },
  { name: 'Bhavnagar', aliases: ['bhavnagar', 'ભાવનગર', 'भावनगर'] },
  { name: 'Junagadh', aliases: ['junagadh', 'જૂનાગઢ', 'जूनागढ़'] },
  { name: 'Jamnagar', aliases: ['jamnagar', 'જામનગર', 'जामनगर'] },
  { name: 'Navsari', aliases: ['navsari', 'નવસારી', 'नवसारी'] },
  { name: 'Bardoli', aliases: ['bardoli', 'બારડોલી', 'बारडोली'] },
  { name: 'Bharuch', aliases: ['bharuch', 'ભરૂચ', 'भरूच'] },
  { name: 'Mehsana', aliases: ['mehsana', 'મહેસાણા', 'मेहसाना'] },
  { name: 'Unjha', aliases: ['unjha', 'ઊંઝા', 'ऊंझा'] },
  { name: 'Deesa', aliases: ['deesa', 'ડીસા', 'डीसा'] },
  { name: 'Patan', aliases: ['patan', 'પાટણ', 'पाटन'] },
  { name: 'Indore', aliases: ['indore', 'ઇન્દોર', 'इंदौर'] },
  { name: 'Ujjain', aliases: ['ujjain', 'ઉજ્જૈન', 'उज्जैन'] },
];

/**
 * Extract crop name from natural language query
 */
export function extractCrop(query: string): string | undefined {
  const q = query.toLowerCase();
  for (const crop of KNOWN_CROPS) {
    for (const alias of crop.aliases) {
      // Word boundary check or substring check for Indic characters
      if (q.includes(alias)) {
        return crop.name;
      }
    }
  }
  return undefined;
}

/**
 * Extract location name from natural language query
 */
export function extractLocation(query: string): string | undefined {
  const q = query.toLowerCase();
  for (const loc of KNOWN_LOCATIONS) {
    for (const alias of loc.aliases) {
      if (q.includes(alias)) {
        return loc.name;
      }
    }
  }
  return undefined;
}

/**
 * Resolves user query into an actionable application destination
 */
export function resolveSearchIntent(rawQuery: string): SearchIntentResult {
  const query = (rawQuery || '').trim();
  const q = query.toLowerCase();

  if (!query) {
    return {
      intent: 'copilot',
      route: '/copilot',
      originalQuery: '',
      confidence: 0,
      reason: 'Empty query defaults to AI Copilot'
    };
  }

  const extractedCrop = extractCrop(q);
  const extractedLocation = extractLocation(q);

  // -------------------------------------------------------------
  // 1. CROP DISEASE PATHOLOGY DIAGNOSIS (Image Scanner / Diagnosis)
  // Specific scanner actions or explicit disease diagnosis requests
  // e.g., "Scan my tomato leaves", "Diagnose my crop disease", "What disease does my crop have?"
  // -------------------------------------------------------------
  const isExplicitScanOrDiagnosis = (
    q.includes('scan my') ||
    q.includes('scan tomato') ||
    q.includes('scan crop') ||
    q.includes('scan leaf') ||
    q.includes('scan leaves') ||
    q.includes('leaf scan') ||
    q.includes('scanner') ||
    q.includes('diagnose my crop disease') ||
    q.includes('diagnose disease') ||
    q.includes('crop disease diagnosis') ||
    q.includes('leaf pathology') ||
    q.includes('identify this leaf infection') ||
    q.includes('identify leaf infection') ||
    q.includes('what disease does my crop have') ||
    q.includes('what disease is this') ||
    // Gujarati explicit scan / diagnosis
    q.includes('પાંદડા સ્કેન') ||
    q.includes('પાંદડું સ્કેન') ||
    q.includes('રોગ નિદાન') ||
    q.includes('પાક રોગ નિદાન') ||
    q.includes('રોગ ઓળખો') ||
    q.includes('મારા પાકમાં કયો રોગ છે') ||
    q.includes('પાંદડાનો ફોટો') ||
    // Hindi explicit scan / diagnosis
    q.includes('पत्ती स्कैन') ||
    q.includes('पत्ता स्कैन') ||
    q.includes('रोग निदान') ||
    q.includes('फसल रोग निदान') ||
    q.includes('रोग पहचानें') ||
    q.includes('रोग पहचान') ||
    q.includes('मेरी फसल में कौन सा रोग है') ||
    q.includes('पत्ती का फोटो')
  );

  // Advisory phrases that should go to AI Copilot instead of Leaf Image Scan
  // e.g., "Why are my crop leaves turning yellow?", "How to cure leaf blight?", "Which medicine for fungus?"
  const isAdvisoryQuestion = (
    q.startsWith('why') ||
    q.startsWith('how') ||
    q.startsWith('which') ||
    q.startsWith('what is the best') ||
    q.startsWith('explain') ||
    q.includes('turning yellow') ||
    q.includes('leaves turning yellow') ||
    q.includes('yellowing') ||
    q.includes('curling') ||
    q.includes('fertilizer') ||
    q.includes('fertiliser') ||
    q.includes('pesticide') ||
    q.includes('production') ||
    q.includes('fertility') ||
    q.includes('advice') ||
    q.includes('tips') ||
    // Gujarati advisory
    q.includes('પીળા કેમ') ||
    q.includes('પીળા પડે') ||
    q.includes('કેવી રીતે') ||
    q.includes('શા માટે') ||
    q.includes('કઈ દવા') ||
    q.includes('ખાતર') ||
    q.includes('ફળદ્રુપતા') ||
    q.includes('સલાહ') ||
    // Hindi advisory
    q.includes('पीले क्यों') ||
    q.includes('पीले पड़') ||
    q.includes('कैसे') ||
    q.includes('क्यों') ||
    q.includes('कौन सी दवा') ||
    q.includes('उर्वरक') ||
    q.includes('खाद') ||
    q.includes('उर्वरता') ||
    q.includes('सलाह')
  );

  if (isExplicitScanOrDiagnosis && !isAdvisoryQuestion) {
    return {
      intent: 'disease',
      route: '/disease',
      originalQuery: query,
      extractedCrop,
      navigationState: {
        initialCrop: extractedCrop,
        initialQuery: query
      },
      confidence: 0.95,
      reason: 'Explicit crop leaf diagnosis or scan request'
    };
  }

  // -------------------------------------------------------------
  // 2. MANDI COMMODITY PRICES & MARKET INTELLIGENCE
  // e.g., "Show today's mandi prices", "Wheat price in Surat", "Find cotton market rates"
  // -------------------------------------------------------------
  const isMarketQuery = (
    q.includes('mandi') ||
    q.includes('price') ||
    q.includes('prices') ||
    q.includes('rate') ||
    q.includes('rates') ||
    q.includes('bhav') ||
    q.includes('market') ||
    q.includes('apmc') ||
    // Gujarati market terms
    q.includes('મંડી') ||
    q.includes('ભાવ') ||
    q.includes('બજાર ભાવ') ||
    q.includes('દર') ||
    q.includes('એપીએમસી') ||
    // Hindi market terms
    q.includes('मंडी') ||
    q.includes('भाव') ||
    q.includes('दाम') ||
    q.includes('रेट') ||
    q.includes('बाजार भाव') ||
    q.includes('एपीएमसी')
  );

  if (isMarketQuery) {
    const searchParams: Record<string, string> = {};
    if (extractedCrop) searchParams.crop = extractedCrop;
    if (extractedLocation) searchParams.location = extractedLocation;

    return {
      intent: 'market',
      route: '/market',
      originalQuery: query,
      extractedCrop,
      extractedLocation,
      navigationState: {
        searchCrop: extractedCrop || 'Wheat',
        searchLocation: extractedLocation,
        initialQuery: query
      },
      searchParams,
      confidence: 0.95,
      reason: 'Market commodity prices or APMC rate query'
    };
  }

  // -------------------------------------------------------------
  // 3. WEATHER FORECAST & METEOROLOGY
  // e.g., "Show my farm weather", "Will it rain tomorrow?", "Weather forecast for my farm"
  // -------------------------------------------------------------
  const isWeatherQuery = (
    q.includes('weather') ||
    q.includes('rain') ||
    q.includes('raining') ||
    q.includes('rainfall') ||
    q.includes('forecast') ||
    q.includes('temperature') ||
    q.includes('temp') ||
    q.includes('humidity') ||
    q.includes('precipitation') ||
    q.includes('climate') ||
    q.includes('spray radar') ||
    // Gujarati weather terms
    q.includes('હવામાન') ||
    q.includes('વરસાદ') ||
    q.includes('તાપમાન') ||
    q.includes('આગાહી') ||
    q.includes('વાદળ') ||
    // Hindi weather terms
    q.includes('मौसम') ||
    q.includes('बारिश') ||
    q.includes('तापमान') ||
    q.includes('पूर्वानुमान') ||
    q.includes('वर्षा')
  );

  if (isWeatherQuery) {
    return {
      intent: 'weather',
      route: '/weather',
      originalQuery: query,
      navigationState: {
        initialQuery: query
      },
      confidence: 0.95,
      reason: 'Weather forecast or rainfall inquiry'
    };
  }

  // -------------------------------------------------------------
  // 4. SMART IRRIGATION (Operational checks vs General advisory)
  // e.g., "Should I irrigate today?", "Do I need to irrigate my crop today?", "Check soil moisture"
  // -------------------------------------------------------------
  const isOperationalIrrigation = (
    q.includes('should i irrigate today') ||
    q.includes('do i need to irrigate') ||
    q.includes('irrigate my crop today') ||
    q.includes('irrigate today') ||
    q.includes('irrigate my farm today') ||
    q.includes('check soil moisture') ||
    q.includes('soil moisture level') ||
    q.includes('moisture level') ||
    q.includes('water pump') ||
    // Gujarati operational irrigation
    q.includes('આજે સિંચાઈ કરવી જોઈએ') ||
    q.includes('સિંચાઈ કરવી જોઈએ?') ||
    q.includes('ભેજ તપાસો') ||
    q.includes('જમીનનો ભેજ') ||
    // Hindi operational irrigation
    q.includes('आज सिंचाई करनी चाहिए') ||
    q.includes('सिंचाई करनी चाहिए?') ||
    q.includes('नमी जांचें') ||
    q.includes('मिट्टी की नमी')
  );

  if (isOperationalIrrigation) {
    return {
      intent: 'irrigation',
      route: '/irrigation',
      originalQuery: query,
      navigationState: {
        initialQuery: query
      },
      confidence: 0.90,
      reason: 'Operational farm irrigation or soil moisture status check'
    };
  }

  // -------------------------------------------------------------
  // 5. AI COPILOT (General farming questions, advisory & fallback)
  // e.g., "How can I increase my wheat production?", "Which fertilizer should I use?",
  //       "Why are my crop leaves turning yellow?", "How can I improve soil fertility?",
  //       "Explain soil fertility", "Give me advice for my farm"
  //
  // RULE: Any unclassified or general question opens AI Copilot by default.
  // Never route ordinary text questions to the disease photo upload workflow.
  // -------------------------------------------------------------
  return {
    intent: 'copilot',
    route: '/copilot',
    originalQuery: query,
    extractedCrop,
    navigationState: {
      initialQuery: query,
      source: 'global_search'
    },
    searchParams: {
      q: query
    },
    confidence: isAdvisoryQuestion ? 0.95 : 0.85,
    reason: isAdvisoryQuestion ? 'General agricultural advisory query' : 'Default AI Copilot query classification'
  };
}
