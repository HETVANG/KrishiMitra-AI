import mongoose from 'mongoose';

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// In-memory collections to act as our fallback datastore
export const mockDatabase = {
  users: [] as any[],
  farms: [] as any[],
  expenses: [] as any[],
  forum: [] as any[],
  appointments: [] as any[],
  schemes: [] as any[],
  marketPrices: [] as any[],
};

// Seeding initial market prices and government schemes in memory
mockDatabase.schemes = [
  {
    _id: 'scheme_mock_1',
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    description: 'An initiative by the Government of India in which all farmers get up to ₹6,000 per year in three installments as minimum income support.',
    eligibility: ['Small and marginal farmers', 'Must own agricultural land holding', 'Must have Aadhaar card linked bank account'],
    benefits: '₹6,000 per year directly transferred to bank account in 3 equal installments.',
    documentsRequired: ['Aadhaar Card', 'Land holding papers (Khasra/Khatauni)', 'Bank Passbook copy', 'Mobile Number'],
    applyLink: 'https://pmkisan.gov.in/',
    deadline: new Date('2026-12-31'),
    category: 'Income Support',
    createdAt: new Date(),
  },
  {
    _id: 'scheme_mock_2',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'A crop insurance scheme that protects farmers against yield losses due to natural calamities, pests, and diseases.',
    eligibility: ['All farmers including sharecroppers and tenant farmers growing notified crops'],
    benefits: 'Low premium (1.5% for Rabi, 2% for Kharif) with complete insurance coverage for crop losses.',
    documentsRequired: ['Land records or tenancy agreement', 'Sowing certificate', 'Bank Passbook copy', 'Aadhaar Card'],
    applyLink: 'https://pmfby.gov.in/',
    deadline: new Date('2026-08-31'),
    category: 'Insurance',
    createdAt: new Date(),
  },
  {
    _id: 'scheme_mock_3',
    title: 'Soil Health Card Scheme',
    description: 'Provides farmers with Soil Health Cards that detail soil nutrients and recommend crop-specific fertilizer dosages to restore productivity.',
    eligibility: ['All farmers holding agricultural land holding inside India'],
    benefits: 'Free soil testing and customized NPK fertilizer plan for improving soil chemical balance.',
    documentsRequired: ['Aadhaar Card', 'Land ownership details', 'Soil sample collection card'],
    applyLink: 'https://soilhealth.dac.gov.in/',
    deadline: new Date('2026-10-15'),
    category: 'Subsidies',
    createdAt: new Date(),
  }
];

mockDatabase.marketPrices = [
  { _id: 'mandi_mock_1', state: 'Haryana', district: 'Karnal', mandiName: 'Karnal Mandi', crop: 'Wheat', minPrice: 2150, maxPrice: 2275, avgPrice: 2225, date: new Date() },
  { _id: 'mandi_mock_2', state: 'Haryana', district: 'Karnal', mandiName: 'Karnal Mandi', crop: 'Rice (Basmati)', minPrice: 3800, maxPrice: 4200, avgPrice: 4000, date: new Date() },
  { _id: 'mandi_mock_3', state: 'Punjab', district: 'Amritsar', mandiName: 'Amritsar Mandi', crop: 'Wheat', minPrice: 2125, maxPrice: 2300, avgPrice: 2215, date: new Date() },
  { _id: 'mandi_mock_4', state: 'Punjab', district: 'Amritsar', mandiName: 'Amritsar Mandi', crop: 'Paddy', minPrice: 1980, maxPrice: 2060, avgPrice: 2020, date: new Date() },
  { _id: 'mandi_mock_5', state: 'Uttar Pradesh', district: 'Hapur', mandiName: 'Hapur Mandi', crop: 'Mustard', minPrice: 5350, maxPrice: 5650, avgPrice: 5500, date: new Date() },
  { _id: 'mandi_mock_6', state: 'Gujarat', district: 'Rajkot', mandiName: 'Rajkot Mandi', crop: 'Cotton', minPrice: 6200, maxPrice: 6800, avgPrice: 6500, date: new Date() },
];
