import { CROP_TRANSLATIONS } from './cropTranslations';

export interface Commodity {
  id: string;
  displayName: string;
  apiCommodity: string;
  category: string;
  aliases: string[];
  icon?: string;
  translations: Record<string, string>;
}

export interface CategorizedCommodityGroup {
  category: string;
  items: Commodity[];
}

const CATEGORIZED_COMMODITIES_BASE: any[] = [
  {
    category: '🌾 Cereals',
    items: [
      { id: 'rice', displayName: 'Rice', apiCommodity: 'Rice', category: 'Cereals', aliases: ['Chawal', 'Basmati'] },
      { id: 'paddy', displayName: 'Paddy', apiCommodity: 'Paddy', category: 'Cereals', aliases: ['Dhan', 'Rice Paddy'] },
      { id: 'wheat', displayName: 'Wheat', apiCommodity: 'Wheat', category: 'Cereals', aliases: ['Gehun', 'Kanak'] },
      { id: 'maize', displayName: 'Maize', apiCommodity: 'Maize', category: 'Cereals', aliases: ['Corn', 'Makka'] },
      { id: 'barley', displayName: 'Barley', apiCommodity: 'Barley(Jau)', category: 'Cereals', aliases: ['Jau'] },
      { id: 'jowar', displayName: 'Jowar', apiCommodity: 'Jowar(Sorghum)', category: 'Cereals', aliases: ['Sorghum'] },
      { id: 'bajra', displayName: 'Bajra', apiCommodity: 'Bajra(Pearl Millet)', category: 'Cereals', aliases: ['Pearl Millet'] },
      { id: 'ragi', displayName: 'Ragi', apiCommodity: 'Ragi', category: 'Cereals', aliases: ['Finger Millet', 'Mandua'] },
      { id: 'small-millets', displayName: 'Small Millets', apiCommodity: 'Small Millets', category: 'Cereals', aliases: ['Kodra', 'Kutki', 'Kangni'] }
    ]
  },
  {
    category: '🌱 Pulses',
    items: [
      { id: 'gram', displayName: 'Gram', apiCommodity: 'Bengal Gram(Gram-Chana)', category: 'Pulses', aliases: ['Chana', 'Chickpea'] },
      { id: 'chickpea', displayName: 'Chickpea', apiCommodity: 'Chickpea', category: 'Pulses', aliases: ['Kabuli Chana'] },
      { id: 'green-gram', displayName: 'Green Gram', apiCommodity: 'Green Gram (Moong)', category: 'Pulses', aliases: ['Moong'] },
      { id: 'black-gram', displayName: 'Black Gram', apiCommodity: 'Black Gram (Urd Beans)', category: 'Pulses', aliases: ['Urad', 'Mash'] },
      { id: 'pigeon-pea', displayName: 'Pigeon Pea', apiCommodity: 'Arhar (Tur-Red Gram)', category: 'Pulses', aliases: ['Tur', 'Arhar'] },
      { id: 'lentil', displayName: 'Lentil', apiCommodity: 'Masur(Lentil)', category: 'Pulses', aliases: ['Masoor'] },
      { id: 'field-pea', displayName: 'Field Pea', apiCommodity: 'Field Pea', category: 'Pulses', aliases: ['Matar'] },
      { id: 'cowpea', displayName: 'Cowpea', apiCommodity: 'Cowpea(Lobia/Karamani)', category: 'Pulses', aliases: ['Lobia', 'Chawli'] },
      { id: 'horse-gram', displayName: 'Horse Gram', apiCommodity: 'Horse Gram', category: 'Pulses', aliases: ['Kulthi'] },
      { id: 'moth-bean', displayName: 'Moth Bean', apiCommodity: 'Moth Bean', category: 'Pulses', aliases: ['Moth', 'Matki'] },
      { id: 'rajma', displayName: 'Rajma', apiCommodity: 'Rajma', category: 'Pulses', aliases: ['Kidney Beans'] }
    ]
  },
  {
    category: '🥜 Oilseeds',
    items: [
      { id: 'groundnut', displayName: 'Groundnut', apiCommodity: 'Groundnut', category: 'Oilseeds', aliases: ['Peanut', 'Mungfali'] },
      { id: 'mustard', displayName: 'Mustard', apiCommodity: 'Mustard', category: 'Oilseeds', aliases: ['Sarson', 'Rai'] },
      { id: 'soybean', displayName: 'Soybean', apiCommodity: 'Soyabean', category: 'Oilseeds', aliases: ['Soya'] },
      { id: 'sunflower', displayName: 'Sunflower', apiCommodity: 'Sunflower', category: 'Oilseeds', aliases: ['Surajmukhi'] },
      { id: 'sesame', displayName: 'Sesame', apiCommodity: 'Sesamum(Sesame)', category: 'Oilseeds', aliases: ['Til'] },
      { id: 'castor', displayName: 'Castor', apiCommodity: 'Castor Seed', category: 'Oilseeds', aliases: ['Arandi'] },
      { id: 'linseed', displayName: 'Linseed', apiCommodity: 'Linseed', category: 'Oilseeds', aliases: ['Alsi'] },
      { id: 'safflower', displayName: 'Safflower', apiCommodity: 'Safflower', category: 'Oilseeds', aliases: ['Kardi'] },
      { id: 'niger-seed', displayName: 'Niger Seed', apiCommodity: 'Niger Seed', category: 'Oilseeds', aliases: ['Ramtil'] }
    ]
  },
  {
    category: '🥔 Vegetables',
    items: [
      { id: 'potato', displayName: 'Potato', apiCommodity: 'Potato', category: 'Vegetables', aliases: ['Aloo'] },
      { id: 'onion', displayName: 'Onion', apiCommodity: 'Onion', category: 'Vegetables', aliases: ['Pyaz'] },
      { id: 'tomato', displayName: 'Tomato', apiCommodity: 'Tomato', category: 'Vegetables', aliases: ['Tamatar'] },
      { id: 'cabbage', displayName: 'Cabbage', apiCommodity: 'Cabbage', category: 'Vegetables', aliases: ['Patta Gobhi'] },
      { id: 'cauliflower', displayName: 'Cauliflower', apiCommodity: 'Cauliflower', category: 'Vegetables', aliases: ['Phool Gobhi'] },
      { id: 'brinjal', displayName: 'Brinjal', apiCommodity: 'Brinjal', category: 'Vegetables', aliases: ['Baingan', 'Eggplant'] },
      { id: 'okra', displayName: 'Okra', apiCommodity: 'Bhindi(Ladies Finger)', category: 'Vegetables', aliases: ['Lady Finger', 'Bhindi'] },
      { id: 'carrot', displayName: 'Carrot', apiCommodity: 'Carrot', category: 'Vegetables', aliases: ['Gajar'] },
      { id: 'radish', displayName: 'Radish', apiCommodity: 'Radish', category: 'Vegetables', aliases: ['Mooli'] },
      { id: 'beetroot', displayName: 'Beetroot', apiCommodity: 'Beetroot', category: 'Vegetables', aliases: ['Chukandar'] },
      { id: 'spinach', displayName: 'Spinach', apiCommodity: 'Spinach', category: 'Vegetables', aliases: ['Palak'] },
      { id: 'cucumber', displayName: 'Cucumber', apiCommodity: 'Cucumber(Kheera)', category: 'Vegetables', aliases: ['Kheera', 'Kakdi'] },
      { id: 'pumpkin', displayName: 'Pumpkin', apiCommodity: 'Pumpkin', category: 'Vegetables', aliases: ['Kaddu'] },
      { id: 'bottle-gourd', displayName: 'Bottle Gourd', apiCommodity: 'Bottle Gourd', category: 'Vegetables', aliases: ['Lauki', 'Ghiya'] },
      { id: 'ridge-gourd', displayName: 'Ridge Gourd', apiCommodity: 'Ridge Gourd', category: 'Vegetables', aliases: ['Turai', 'Tori'] },
      { id: 'bitter-gourd', displayName: 'Bitter Gourd', apiCommodity: 'Bitter Gourd(Karela)', category: 'Vegetables', aliases: ['Karela'] },
      { id: 'snake-gourd', displayName: 'Snake Gourd', apiCommodity: 'Snake Gourd', category: 'Vegetables', aliases: ['Chichinda'] },
      { id: 'ash-gourd', displayName: 'Ash Gourd', apiCommodity: 'Ash Gourd', category: 'Vegetables', aliases: ['Petha'] },
      { id: 'capsicum', displayName: 'Capsicum', apiCommodity: 'Capsicum', category: 'Vegetables', aliases: ['Shimla Mirch'] },
      { id: 'green-chilli', displayName: 'Green Chilli', apiCommodity: 'Green Chilli', category: 'Vegetables', aliases: ['Hari Mirch'] },
      { id: 'garlic', displayName: 'Garlic', apiCommodity: 'Garlic', category: 'Vegetables', aliases: ['Lahsun'] },
      { id: 'ginger', displayName: 'Ginger', apiCommodity: 'Ginger(Green)', category: 'Vegetables', aliases: ['Adrak'] },
      { id: 'green-peas', displayName: 'Green Peas', apiCommodity: 'Green Peas', category: 'Vegetables', aliases: ['Hari Matar'] },
      { id: 'drumstick', displayName: 'Drumstick', apiCommodity: 'Drumstick', category: 'Vegetables', aliases: ['Sehjan', 'Moringa'] },
      { id: 'sweet-potato', displayName: 'Sweet Potato', apiCommodity: 'Sweet Potato', category: 'Vegetables', aliases: ['Shakarkand'] },
      { id: 'colocasia', displayName: 'Colocasia', apiCommodity: 'Colocasia', category: 'Vegetables', aliases: ['Arbi'] }
    ]
  },
  {
    category: '🍎 Fruits',
    items: [
      { id: 'mango', displayName: 'Mango', apiCommodity: 'Mango', category: 'Fruits', aliases: ['Aam'] },
      { id: 'banana', displayName: 'Banana', apiCommodity: 'Banana', category: 'Fruits', aliases: ['Kela'] },
      { id: 'apple', displayName: 'Apple', apiCommodity: 'Apple', category: 'Fruits', aliases: ['Seb'] },
      { id: 'orange', displayName: 'Orange', apiCommodity: 'Orange', category: 'Fruits', aliases: ['Santra'] },
      { id: 'mosambi', displayName: 'Mosambi', apiCommodity: 'Mosambi(Sweet Lime)', category: 'Fruits', aliases: ['Sweet Lime'] },
      { id: 'lemon', displayName: 'Lemon', apiCommodity: 'Lemon', category: 'Fruits', aliases: ['Nimbu'] },
      { id: 'guava', displayName: 'Guava', apiCommodity: 'Guava', category: 'Fruits', aliases: ['Amrood'] },
      { id: 'papaya', displayName: 'Papaya', apiCommodity: 'Papaya', category: 'Fruits', aliases: ['Papita'] },
      { id: 'pomegranate', displayName: 'Pomegranate', apiCommodity: 'Pomegranate', category: 'Fruits', aliases: ['Anar'] },
      { id: 'watermelon', displayName: 'Watermelon', apiCommodity: 'Watermelon', category: 'Fruits', aliases: ['Tarbooj'] },
      { id: 'muskmelon', displayName: 'Muskmelon', apiCommodity: 'Kharbuja(Muskmelon)', category: 'Fruits', aliases: ['Kharbuja'] },
      { id: 'pineapple', displayName: 'Pineapple', apiCommodity: 'Pineapple', category: 'Fruits', aliases: ['Ananas'] },
      { id: 'coconut', displayName: 'Coconut', apiCommodity: 'Coconut', category: 'Fruits', aliases: ['Nariyal'] },
      { id: 'sapota', displayName: 'Sapota', apiCommodity: 'Sapota(Chikoo)', category: 'Fruits', aliases: ['Chikoo'] },
      { id: 'jackfruit', displayName: 'Jackfruit', apiCommodity: 'Jackfruit', category: 'Fruits', aliases: ['Kathal'] },
      { id: 'litchi', displayName: 'Litchi', apiCommodity: 'Litchi', category: 'Fruits', aliases: ['Lychee'] },
      { id: 'custard-apple', displayName: 'Custard Apple', apiCommodity: 'Custard Apple', category: 'Fruits', aliases: ['Sitaphal', 'Shareefa'] },
      { id: 'amla', displayName: 'Amla', apiCommodity: 'Amla(Nelli)', category: 'Fruits', aliases: ['Gooseberry'] },
      { id: 'ber', displayName: 'Ber', apiCommodity: 'Ber(Zizyphus/Bore)', category: 'Fruits', aliases: ['Jujube'] }
    ]
  },
  {
    category: '🌿 Cash Crops',
    items: [
      { id: 'cotton', displayName: 'Cotton', apiCommodity: 'Cotton', category: 'Cash Crops', aliases: ['Kapas'] },
      { id: 'sugarcane', displayName: 'Sugarcane', apiCommodity: 'Sugarcane', category: 'Cash Crops', aliases: ['Ganna'] },
      { id: 'jute', displayName: 'Jute', apiCommodity: 'Jute', category: 'Cash Crops', aliases: ['Patson'] },
      { id: 'tea', displayName: 'Tea', apiCommodity: 'Tea', category: 'Cash Crops', aliases: ['Chai'] },
      { id: 'coffee', displayName: 'Coffee', apiCommodity: 'Coffee', category: 'Cash Crops', aliases: ['Kahwa'] },
      { id: 'rubber', displayName: 'Rubber', apiCommodity: 'Rubber', category: 'Cash Crops', aliases: ['Natural Rubber'] },
      { id: 'tobacco', displayName: 'Tobacco', apiCommodity: 'Tobacco', category: 'Cash Crops', aliases: ['Tambaku'] }
    ]
  },
  {
    category: '🌶 Spices',
    items: [
      { id: 'turmeric', displayName: 'Turmeric', apiCommodity: 'Turmeric', category: 'Spices', aliases: ['Haldi'] },
      { id: 'dry-chilli', displayName: 'Dry Chilli', apiCommodity: 'Chilli Red', category: 'Spices', aliases: ['Lal Mirch'] },
      { id: 'black-pepper', displayName: 'Black Pepper', apiCommodity: 'Black Pepper', category: 'Spices', aliases: ['Kali Mirch'] },
      { id: 'cardamom', displayName: 'Cardamom', apiCommodity: 'Cardamom', category: 'Spices', aliases: ['Elaichi'] },
      { id: 'coriander', displayName: 'Coriander', apiCommodity: 'Coriander(Leaves)', category: 'Spices', aliases: ['Dhaniya'] },
      { id: 'cumin', displayName: 'Cumin', apiCommodity: 'Cummin(Jeera)', category: 'Spices', aliases: ['Jeera'] },
      { id: 'fenugreek', displayName: 'Fenugreek', apiCommodity: 'Methi(Fenugreek)', category: 'Spices', aliases: ['Methi'] },
      { id: 'fennel', displayName: 'Fennel', apiCommodity: 'Fennel', category: 'Spices', aliases: ['Saunf'] },
      { id: 'clove', displayName: 'Clove', apiCommodity: 'Clove', category: 'Spices', aliases: ['Laung'] },
      { id: 'cinnamon', displayName: 'Cinnamon', apiCommodity: 'Cinnamon', category: 'Spices', aliases: ['Dalchini'] },
      { id: 'nutmeg', displayName: 'Nutmeg', apiCommodity: 'Nutmeg', category: 'Spices', aliases: ['Jaiphal'] },
      { id: 'ajwain', displayName: 'Ajwain', apiCommodity: 'Ajwan', category: 'Spices', aliases: ['Carom Seeds'] }
    ]
  },
  {
    category: '🌴 Plantation Crops',
    items: [
      { id: 'arecanut', displayName: 'Arecanut', apiCommodity: 'Arecanut(Betelnut)', category: 'Plantation Crops', aliases: ['Betelnut', 'Supari'] },
      { id: 'cashew-nut', displayName: 'Cashew Nut', apiCommodity: 'Cashewnuts', category: 'Plantation Crops', aliases: ['Kaju'] },
      { id: 'cocoa', displayName: 'Cocoa', apiCommodity: 'Cocoa', category: 'Plantation Crops', aliases: ['Cacao'] },
      { id: 'oil-palm', displayName: 'Oil Palm', apiCommodity: 'Oil Palm', category: 'Plantation Crops', aliases: ['Palm Oil'] }
    ]
  },
  {
    category: '🌼 Floriculture',
    items: [
      { id: 'rose', displayName: 'Rose', apiCommodity: 'Rose(Local)', category: 'Floriculture', aliases: ['Gulab'] },
      { id: 'marigold', displayName: 'Marigold', apiCommodity: 'Marigold(Loose)', category: 'Floriculture', aliases: ['Genda'] },
      { id: 'jasmine', displayName: 'Jasmine', apiCommodity: 'Jasmine', category: 'Floriculture', aliases: ['Chameli'] },
      { id: 'chrysanthemum', displayName: 'Chrysanthemum', apiCommodity: 'Chrysanthemum', category: 'Floriculture', aliases: ['Guldaudi'] },
      { id: 'lily', displayName: 'Lily', apiCommodity: 'Lily', category: 'Floriculture', aliases: ['Lilium'] },
      { id: 'gerbera', displayName: 'Gerbera', apiCommodity: 'Gerbera', category: 'Floriculture', aliases: ['Barberton Daisy'] },
      { id: 'gladiolus', displayName: 'Gladiolus', apiCommodity: 'Gladiolus', category: 'Floriculture', aliases: ['Sword Lily'] },
      { id: 'orchid', displayName: 'Orchid', apiCommodity: 'Orchid', category: 'Floriculture', aliases: ['Orchids'] },
      { id: 'tuberose', displayName: 'Tuberose', apiCommodity: 'Tuberose(Loose)', category: 'Floriculture', aliases: ['Rajnigandha'] }
    ]
  },
  {
    category: '🌿 Fodder Crops',
    items: [
      { id: 'napier-grass', displayName: 'Napier Grass', apiCommodity: 'Napier Grass', category: 'Fodder Crops', aliases: ['Elephant Grass'] },
      { id: 'berseem', displayName: 'Berseem', apiCommodity: 'Berseem', category: 'Fodder Crops', aliases: ['Egyptian Clover'] },
      { id: 'lucerne', displayName: 'Lucerne', apiCommodity: 'Lucerne(Alfalfa)', category: 'Fodder Crops', aliases: ['Alfalfa'] },
      { id: 'fodder-maize', displayName: 'Fodder Maize', apiCommodity: 'Fodder Maize', category: 'Fodder Crops', aliases: ['Chari'] },
      { id: 'fodder-sorghum', displayName: 'Fodder Sorghum', apiCommodity: 'Fodder Sorghum', category: 'Fodder Crops', aliases: ['Jowar Fodder'] }
    ]
  },
  {
    category: '🍇 Dry Fruits',
    items: [
      { id: 'almond', displayName: 'Almond', apiCommodity: 'Almonds', category: 'Dry Fruits', aliases: ['Badam'] },
      { id: 'walnut', displayName: 'Walnut', apiCommodity: 'Walnut', category: 'Dry Fruits', aliases: ['Akhrot'] },
      { id: 'raisin', displayName: 'Raisin', apiCommodity: 'Raisins', category: 'Dry Fruits', aliases: ['Kismis'] },
      { id: 'dates', displayName: 'Dates', apiCommodity: 'Dates', category: 'Dry Fruits', aliases: ['Khajur'] }
    ]
  }
];

export const CATEGORIZED_COMMODITIES: CategorizedCommodityGroup[] = CATEGORIZED_COMMODITIES_BASE.map((group: any) => ({
  category: group.category,
  items: group.items.map((item: any) => ({
    ...item,
    translations: CROP_TRANSLATIONS[item.id] || { en: item.displayName }
  }))
}));

export const ALL_COMMODITIES: Commodity[] = CATEGORIZED_COMMODITIES.reduce((acc, cat) => {
  return acc.concat(cat.items);
}, [] as Commodity[]);

/**
 * Resolves a crop search query (display name or alias or API name or translation in any language) to the canonical apiCommodity name.
 */
export const resolveCropToApiName = (query: string): string => {
  if (!query) return '';
  const clean = query.trim().toLowerCase();
  
  // 1. Try match translations in any language
  let matched = ALL_COMMODITIES.find(c => 
    Object.values(c.translations || {}).some(v => v.toLowerCase() === clean)
  );
  if (matched) return matched.apiCommodity;

  // 2. Try match displayName
  matched = ALL_COMMODITIES.find(c => c.displayName.toLowerCase() === clean);
  if (matched) return matched.apiCommodity;

  // 3. Try match apiCommodity
  matched = ALL_COMMODITIES.find(c => c.apiCommodity.toLowerCase() === clean);
  if (matched) return matched.apiCommodity;

  // 4. Try match aliases
  matched = ALL_COMMODITIES.find(c => c.aliases.some(a => a.toLowerCase() === clean));
  if (matched) return matched.apiCommodity;

  console.warn(`[Commodity Mapping Warning] Failed to resolve crop search query "${query}" to any registered apiCommodity name.`);
  return query; // fallback to original input if not in catalog
};

/**
 * Resolves a crop search query to the display name.
 */
export const resolveCropToDisplayName = (query: string): string => {
  if (!query) return '';
  const clean = query.trim().toLowerCase();

  // 1. Try match apiCommodity
  let matched = ALL_COMMODITIES.find(c => c.apiCommodity.toLowerCase() === clean);
  if (matched) return matched.displayName;

  // 2. Try match translations in any language
  matched = ALL_COMMODITIES.find(c => 
    Object.values(c.translations || {}).some(v => v.toLowerCase() === clean)
  );
  if (matched) return matched.displayName;

  // 3. Try match displayName
  matched = ALL_COMMODITIES.find(c => c.displayName.toLowerCase() === clean);
  if (matched) return matched.displayName;

  // 4. Try match aliases
  matched = ALL_COMMODITIES.find(c => c.aliases.some(a => a.toLowerCase() === clean));
  if (matched) return matched.displayName;

  console.warn(`[Commodity Mapping Warning] Failed to resolve crop search query "${query}" to any registered displayName.`);
  return query;
};

const COMMON_MISMATCH_MAP: Record<string, string> = {
  'ground nut': 'Groundnut',
  'groundnut': 'Groundnut',
  'groundnut (split)': 'Groundnut',
  'groundnut (whole)': 'Groundnut',
  'groundnut pod': 'Groundnut',
  'groundnut seeds': 'Groundnut',
  'bengal gram': 'Bengal Gram(Gram-Chana)',
  'chana': 'Bengal Gram(Gram-Chana)',
  'bengal gram(gram-chana)': 'Bengal Gram(Gram-Chana)',
  'green gram': 'Green Gram (Moong)',
  'moong': 'Green Gram (Moong)',
  'green gram (moong)': 'Green Gram (Moong)',
  'black gram': 'Black Gram (Urd Beans)',
  'urad': 'Black Gram (Urd Beans)',
  'black gram (urd beans)': 'Black Gram (Urd Beans)',
  'red gram': 'Arhar (Tur-Red Gram)',
  'pigeon pea': 'Arhar (Tur-Red Gram)',
  'tur': 'Arhar (Tur-Red Gram)',
  'arhar': 'Arhar (Tur-Red Gram)',
  'arhar (tur-red gram)': 'Arhar (Tur-Red Gram)',
  'lentil': 'Masur(Lentil)',
  'masoor': 'Masur(Lentil)',
  'masur(lentil)': 'Masur(Lentil)',
  'peas': 'Green Peas',
  'green peas': 'Green Peas',
  'ladies finger': 'Bhindi(Ladies Finger)',
  'Ladies Finger': 'Bhindi(Ladies Finger)',
  'okra': 'Bhindi(Ladies Finger)',
  'bhindi(ladies finger)': 'Bhindi(Ladies Finger)',
  'cucumber': 'Cucumber(Kheera)',
  'karela': 'Bitter Gourd(Karela)',
  'bitter gourd': 'Bitter Gourd(Karela)',
  'bitter gourd(karela)': 'Bitter Gourd(Karela)',
  'ginger': 'Ginger(Green)',
  'ginger(green)': 'Ginger(Green)',
  'sweet lime': 'Mosambi(Sweet Lime)',
  'mosambi(sweet lime)': 'Mosambi(Sweet Lime)',
  'muskmelon': 'Kharbuja(Muskmelon)',
  'kharbuja(muskmelon)': 'Kharbuja(Muskmelon)',
  'sapota': 'Sapota(Chikoo)',
  'sapota(chikoo)': 'Sapota(Chikoo)',
  'amla': 'Amla(Nelli)',
  'amla(nelli)': 'Amla(Nelli)',
  'ber': 'Ber(Zizyphus/Bore)',
  'ber(zizyphus/bore)': 'Ber(Zizyphus/Bore)',
  'red chilli': 'Chilli Red',
  'dry chilli': 'Chilli Red',
  'chilli red': 'Chilli Red',
  'coriander leaves': 'Coriander(Leaves)',
  'coriander(leaves)': 'Coriander(Leaves)',
  'cumin': 'Cummin(Jeera)',
  'cummin(jeera)': 'Cummin(Jeera)',
  'fenugreek': 'Methi(Fenugreek)',
  'methi(fenugreek)': 'Methi(Fenugreek)',
  'arecanut': 'Arecanut(Betelnut)',
  'arecanut(betelnut)': 'Arecanut(Betelnut)',
  'cashew nut': 'Cashewnuts',
  'cashewnuts': 'Cashewnuts',
  'rose': 'Rose(Local)',
  'rose(local)': 'Rose(Local)',
  'marigold': 'Marigold(Loose)',
  'marigold(loose)': 'Marigold(Loose)',
  'tuberose': 'Tuberose(Loose)',
  'tuberose(loose)': 'Tuberose(Loose)',
  'lucerne': 'Lucerne(Alfalfa)',
  'lucerne(alfalfa)': 'Lucerne(Alfalfa)',
  'almond': 'Almonds',
  'almonds': 'Almonds',
  'raisin': 'Raisins',
  'raisins': 'Raisins',
  'onion': 'Onion',
  'potato': 'Potato',
  'tomato': 'Tomato',
  'wheat': 'Wheat',
  'rice': 'Rice',
  'paddy': 'Paddy',
  'maize': 'Maize',
  'barley': 'Barley(Jau)',
  'jowar': 'Jowar(Sorghum)',
  'bajra': 'Bajra(Pearl Millet)',
  'ragi': 'Ragi',
  'cotton': 'Cotton'
};

export const resolveApiNameToCommodity = (apiName: string): Commodity | null => {
  if (!apiName) return null;
  const clean = apiName.trim().toLowerCase();

  // 1. Direct check in mismatch map
  if (COMMON_MISMATCH_MAP[clean]) {
    const canonicalApiName = COMMON_MISMATCH_MAP[clean];
    const match = ALL_COMMODITIES.find(c => c.apiCommodity.toLowerCase() === canonicalApiName.toLowerCase());
    if (match) return match;
  }

  const cleanString = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  const getBaseName = (s: string) => {
    const idx = s.indexOf('(');
    return idx !== -1 ? s.substring(0, idx).trim() : s;
  };

  const cleanApiName = cleanString(apiName);
  const cleanBaseApiName = cleanString(getBaseName(apiName));

  // 2. Direct match on apiCommodity or displayName or id after cleaning
  let matched = ALL_COMMODITIES.find(c => 
    cleanString(c.apiCommodity) === cleanApiName ||
    cleanString(c.displayName) === cleanApiName ||
    c.id.toLowerCase() === clean
  );
  if (matched) return matched;

  // 3. Match on base name before parenthesis
  matched = ALL_COMMODITIES.find(c => 
    cleanString(getBaseName(c.apiCommodity)) === cleanBaseApiName ||
    cleanString(getBaseName(c.displayName)) === cleanBaseApiName
  );
  if (matched) return matched;

  // 4. Match on aliases
  matched = ALL_COMMODITIES.find(c => 
    c.aliases.some(a => cleanString(a) === cleanApiName || cleanString(getBaseName(a)) === cleanBaseApiName)
  );
  if (matched) return matched;

  // 5. Word-by-word token matching (e.g. "Ground Nut" matching "Groundnut")
  matched = ALL_COMMODITIES.find(c => {
    const cClean = cleanString(c.displayName);
    const cApiClean = cleanString(c.apiCommodity);
    return cleanApiName.includes(cClean) || cClean.includes(cleanApiName) ||
           cleanApiName.includes(cApiClean) || cApiClean.includes(cleanApiName) ||
           cleanBaseApiName.includes(cleanString(getBaseName(c.apiCommodity)));
  });
  if (matched) return matched;

  return null;
};
