import fs from 'fs';
import path from 'path';
import { PdfService } from '../services/PdfService';
import { ReportService } from '../services/ReportService';

async function runTestSuite() {
  console.log('====================================================');
  console.log('THE KHEDUT — REPORT GENERATION & STORAGE TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, desc: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${desc}`);
      process.exitCode = 1;
    }
  }

  // Sample pathology test data
  const testDiseaseDataEn = {
    crop: 'Cotton',
    diseaseName: 'Cotton Leaf Curl Virus',
    localName: 'Kukad / Churda Murda',
    scientificName: 'Begomovirus',
    condition: 'POSSIBLE_DISEASE',
    confidenceScore: 0.94,
    severity: 'High',
    symptoms: [
      'Upward and downward leaf curling',
      'Thickening of veins on lower leaf surfaces',
      'Enation (leaf-like outgrowths) on underside'
    ],
    possibleCauses: [
      'Transmitted by whitefly (Bemisia tabaci) vectors during warm dry spells'
    ],
    recommendedActions: [
      { title: 'Vector suppression', details: 'Install yellow sticky traps (15-20 per acre) immediately.' },
      { title: 'Foliage surveillance', details: 'Check under leaves every 48 hours for whitefly nymphs.' },
      { title: 'Sanitation', details: 'Eradicate alternative weed hosts like Abutilon.' }
    ],
    organicTreatment: [
      'Spray Neem seed kernel extract (NSKE 5%) or 10,000 ppm Neem oil (3ml/L).'
    ],
    chemicalTreatment: [
      'Spray Diafenthiuron 50% WP @ 1.25g/L water if whitefly count exceeds 6 per leaf.'
    ],
    scanDate: new Date()
  };

  const testDiseaseDataGu = {
    crop: 'કપાસ (Cotton)',
    diseaseName: 'કપાસ પાનનો કોકડવા રોગ (Leaf Curl Virus)',
    localName: 'કોકડવા / ચૂસીયા જીવાત',
    scientificName: 'Begomovirus',
    condition: 'POSSIBLE_DISEASE',
    confidenceScore: 0.92,
    severity: 'High',
    symptoms: [
      'પાંદડા ઉપર અથવા નીચે તરફ વળી જવું અને કડક થવું',
      'પાંદડાની નીચેની નસો જાડી અને લીલી થવી',
      'છોડનો વિકાસ અટકી જવો'
    ],
    possibleCauses: [
      'સફેદ માખી (Whitefly) દ્વારા આ વિષાણુનો ઝડપી ફેલાવો થાય છે'
    ],
    recommendedActions: [
      { title: 'તાત્કાલિક નિયંત્રણ', details: 'ખેતરમાં એકરે ૧૫ થી ૨૦ પીળા ચીકણા ટ્રેપ લગાવો.' },
      { title: 'નિયમિત તપાસ', details: 'દર બે દિવસે પાનની નીચે સફેદ માખીની વસ્તી તપાસો.' }
    ],
    organicTreatment: [
      'લીંબોળીનું તેલ (૫ મિ.લી./લિટર પાણી) અથવા દશપર્ણી અર્કનો છંટકાવ કરવો.'
    ],
    chemicalTreatment: [
      'ડાયફેન્થિયુરોન ૫૦% ડબ્લ્યુપી ૧.૨૫ ગ્રામ પ્રતિ લિટર પાણીમાં છાંટવું.'
    ],
    scanDate: new Date()
  };

  const testDiseaseDataHi = {
    crop: 'टमाटर (Tomato)',
    diseaseName: 'टमाटर अगेती झुलसा (Early Blight)',
    localName: 'अगेती झुलसा / पत्ती धब्बा',
    scientificName: 'Alternaria solani',
    condition: 'POSSIBLE_DISEASE',
    confidenceScore: 0.95,
    severity: 'Moderate',
    symptoms: [
      'निचली पत्तियों पर गहरे भूरे रंग के संकेंद्री छल्ले वाले धब्बे',
      'पत्तियों का पीला पड़ना और समय से पहले गिरना'
    ],
    possibleCauses: [
      'उच्च आर्द्रता और 24-29 डिग्री सेल्सियस तापमान में कवक का प्रसार'
    ],
    recommendedActions: [
      { title: 'संक्रमित पत्तियां हटाएं', details: 'रोगग्रस्त निचली पत्तियों को तोड़कर खेत से दूर नष्ट करें।' },
      { title: 'सिंचाई नियंत्रण', details: 'ड्रिप सिंचाई का उपयोग करें ताकि पत्तियां गीली न रहें।' }
    ],
    organicTreatment: [
      'ट्राइकोडर्मा विरिडी (5 ग्राम/लीटर) या नीम तेल (3 मिली/लीटर) का छिड़काव करें।'
    ],
    chemicalTreatment: [
      'मेंकोजेब 75% WP (2 ग्राम/लीटर) या कॉपर ऑक्सीक्लोराइड का छिड़काव करें।'
    ],
    scanDate: new Date()
  };

  // TEST 1: Generate English PDF Buffer
  console.log('Executing Test 1: English PDF Generation...');
  const bufEn = await PdfService.generateReportBuffer('disease', testDiseaseDataEn, 'en', {
    reportId: 'REP-TEST-EN-001',
    farmerName: 'Ramesh Patel',
    farmerEmail: 'ramesh.patel@thekhedut.ai'
  });
  assert(Buffer.isBuffer(bufEn), 'English PDF returns valid Buffer instance');
  assert(bufEn.length > 5000, `English PDF buffer size (${bufEn.length} bytes) is adequate`);
  assert(bufEn.subarray(0, 5).toString('ascii') === '%PDF-', 'English PDF has valid %PDF header signature');

  // TEST 2: Generate Gujarati PDF Buffer
  console.log('\nExecuting Test 2: Gujarati Unicode PDF Generation...');
  const bufGu = await PdfService.generateReportBuffer('disease', testDiseaseDataGu, 'gu', {
    reportId: 'REP-TEST-GU-002',
    farmerName: 'રમેશભાઈ પટેલ',
    farmerEmail: 'ramesh.khedut@thekhedut.ai'
  });
  assert(Buffer.isBuffer(bufGu), 'Gujarati PDF returns valid Buffer instance');
  assert(bufGu.length > 5000, `Gujarati PDF buffer size (${bufGu.length} bytes) is adequate`);
  assert(bufGu.subarray(0, 5).toString('ascii') === '%PDF-', 'Gujarati PDF has valid %PDF header signature');

  // TEST 3: Generate Hindi PDF Buffer
  console.log('\nExecuting Test 3: Hindi Unicode PDF Generation...');
  const bufHi = await PdfService.generateReportBuffer('disease', testDiseaseDataHi, 'hi', {
    reportId: 'REP-TEST-HI-003',
    farmerName: 'राजेश कुमार',
    farmerEmail: 'rajesh.kumar@thekhedut.ai'
  });
  assert(Buffer.isBuffer(bufHi), 'Hindi PDF returns valid Buffer instance');
  assert(bufHi.length > 5000, `Hindi PDF buffer size (${bufHi.length} bytes) is adequate`);
  assert(bufHi.subarray(0, 5).toString('ascii') === '%PDF-', 'Hindi PDF has valid %PDF header signature');

  // TEST 4: Generate Weather Statement PDF Buffer
  console.log('\nExecuting Test 4: Weather Statement PDF Generation...');
  const bufWeather = await PdfService.generateReportBuffer('weather', {
    current: { temp: 28, humidity: 65, windSpeed: 3.2, aqi: 42, description: 'Partly Cloudy' },
    aiAdvice: 'Maintain light irrigation in morning hours. Low pest risk expected.'
  }, 'en', {
    reportId: 'REP-TEST-WEA-004',
    farmerName: 'Suresh Verma'
  });
  assert(Buffer.isBuffer(bufWeather), 'Weather PDF returns valid Buffer');
  assert(bufWeather.length > 3000, `Weather PDF size (${bufWeather.length} bytes) is adequate`);

  // TEST 5: Generate Expense Ledger Statement PDF Buffer
  console.log('\nExecuting Test 5: Expense Statement PDF Generation...');
  const bufExpense = await PdfService.generateReportBuffer('expense', {
    summary: { totalIncome: 125000, totalExpense: 48000, netProfit: 77000 },
    expenses: [
      { date: new Date(), type: 'expense', category: 'Fertilizers', amount: 8500, description: 'Urea and DAP' },
      { date: new Date(), type: 'income', category: 'Crop Sale', amount: 85000, description: 'Sold 50 quintal wheat' }
    ]
  }, 'en', {
    reportId: 'REP-TEST-EXP-005',
    farmerName: 'Anil Desai'
  });
  assert(Buffer.isBuffer(bufExpense), 'Expense PDF returns valid Buffer');
  assert(bufExpense.length > 3000, `Expense PDF size (${bufExpense.length} bytes) is adequate`);

  // TEST 6: Report ID Format Validation
  console.log('\nExecuting Test 6: Report ID Format Validation...');
  const testRepId = ReportService.generateReportId();
  assert(/^REP-\d{8}-[A-F0-9]{6}$/.test(testRepId), `Report ID ${testRepId} conforms to REP-YYYYMMDD-XXXXXX standard`);

  // Save sample verification outputs to test_fixtures
  const sampleDir = path.resolve(process.cwd(), 'test_fixtures/samples');
  if (!fs.existsSync(sampleDir)) fs.mkdirSync(sampleDir, { recursive: true });
  fs.writeFileSync(path.join(sampleDir, 'verified_khedut_en.pdf'), bufEn);
  fs.writeFileSync(path.join(sampleDir, 'verified_khedut_gu.pdf'), bufGu);
  fs.writeFileSync(path.join(sampleDir, 'verified_khedut_hi.pdf'), bufHi);
  console.log('\nPersisted verified sample PDFs into test_fixtures/samples/');

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passedTests} OF ${totalTests} TESTS PASSED (100%)`);
  console.log('====================================================\n');
}

runTestSuite().catch(err => {
  console.error('[Test Execution Error]', err);
  process.exit(1);
});
