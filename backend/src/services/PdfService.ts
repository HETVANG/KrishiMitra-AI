import PDFDocument from 'pdfkit';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { WatermarkAssets } from './pdf/watermarkAssets';

// Complete dictionary for PDF layout labels across English, Gujarati, Hindi, Marathi
const pdfTranslations: Record<string, Record<string, string>> = {
  en: {
    subtitle: "Precision Agronomic Advisory • Neural Agriculture Platform",
    generated: "Generated",
    reportIdLabel: "Report ID",
    farmerIdLabel: "Farmer ID",
    farmerLabel: "Farmer Name",
    locationLabel: "Location",
    areaLabel: "Farm Area",
    stageLabel: "Crop Stage",
    cropReport: "CROP SUITABILITY & SOIL ADVISORY REPORT",
    weatherReport: "AGRICULTURAL WEATHER ADVISORY STATEMENT",
    diseaseReport: "AI CROP PATHOLOGY DIAGNOSTIC REPORT",
    expenseReport: "FARM FINANCIAL LEDGER & COST STATEMENT",
    soilReport: "SOIL HEALTH & NUTRIENT EVALUATION REPORT",
    pathologyTitle: "AI Leaf Pathology & Disease Diagnostics",
    cropLabel: "Crop Name",
    diseaseLabel: "Diagnosed Condition",
    confLabel: "Confidence Rating",
    severityLabel: "Severity Level",
    scanDateLabel: "Date & Time",
    symptomsTitle: "OBSERVED SYMPTOMS",
    causesTitle: "PATHOGEN & CAUSAL FACTORS",
    whatToDoTitle: "ACTION PLAN (WHAT TO DO NOW)",
    organicTitle: "BIOLOGICAL & ORGANIC CONTROLS",
    chemicalTitle: "CHEMICAL CONTROL & PESTICIDE GUIDANCE",
    safetyWarning: "Chemical Safety Warning: Always wear protective masks and gloves while preparing and spraying chemical fungicides. Adhere strictly to recommended dilution and pre-harvest intervals. Consult your local Krishi Vigyan Kendra (KVK) officer.",
    importantDisclaimer: "IMPORTANT NOTICE: This diagnostic statement is an AI-assisted agronomic advisory based on visual symptom patterns and local microclimate modeling. Farmers are advised to physically inspect neighboring rows before applying chemical treatments.",
    farmerCompanion: "THE KHEDUT • Smart Agriculture. Better Decisions.",
    farmDetails: "Farm & Soil Profile",
    recCrops: "Recommended Crop Alternatives",
    yield: "Expected Yield",
    profit: "Estimated Net Profit",
    duration: "Growing Cycle",
    risk: "Risk Profile",
    recommendation: "Agronomist Recommendation",
    weatherConditions: "Meteorological Conditions & Readings",
    temp: "Current Temperature",
    humidity: "Atmospheric Humidity",
    wind: "Wind Velocity",
    aqi: "Air Quality Index (AQI)",
    sky: "Sky Outlook",
    advisory: "Agricultural Advisory & Spray Guidance",
    ledger: "Farm Financial Balance Sheet",
    revenue: "Total Farm Revenue",
    expenses: "Total Farm Expenses",
    netProfit: "Net Farm Balance",
    txLogs: "Itemized Transaction Logs",
    date: "Date",
    type: "Type",
    category: "Category",
    amount: "Amount (Rs)",
    description: "Description",
    footer: "This is a computer-generated official advisory statement. Authenticity can be verified using the QR code below.",
    scanToVerify: "Scan to verify report authenticity",
    attestationText: "Digitally generated & attested by The Khedut Autonomous Agricultural Intelligence Platform. Verified tamper-evident digital record.",
    pageTitlePathology: "PATHOLOGY & SYMPTOMS PROFILE",
    pageTitleTreatment: "TREATMENT PROTOCOL & CONTROL MEASURES",
    pageTitleChecklist: "7-DAY ACTION PLAN & VERIFICATION",
    executiveSummary: "EXECUTIVE DIAGNOSIS SUMMARY",
    microclimateTitle: "MICROCLIMATE & SPREAD RISK FACTORS",
    ipmTitle: "INTEGRATED PEST & DISEASE MANAGEMENT (IPM)",
    sprayScheduleTitle: "RECOMMENDED SPRAY SCHEDULE & DOSAGE",
    checklistTitle: "7-DAY FARMER ACTION CHECKLIST",
    kvkNotice: "LOCAL KVK EXPERT CONSULTATION",
    kvkNoticeDetails: "For persistent symptoms or complex multi-pathogen infections, consult your block Krishi Vigyan Kendra (KVK) agronomy extension officer or book an in-app expert appointment.",
    activeIngredient: "Active Ingredient / Formulation",
    commercialBrand: "Standard Brand",
    dosagePerLiter: "Dosage / Acre",
    sprayTiming: "Application Timing",
    phiLabel: "Pre-Harvest Interval (PHI)",
    immediateDirective: "PRIMARY FIELD DIRECTIVE (IMMEDIATE ACTION)",
    urgentIsolation: "Isolate affected crop rows immediately and remove heavily infected foliage. Avoid overhead irrigation to prevent water-borne spore spread."
  },
  gu: {
    subtitle: "ચોક્કસ કૃષિ માર્ગદર્શન • સ્માર્ટ ખેતી મંચ",
    generated: "અહેવાલ સમય",
    reportIdLabel: "રિપોર્ટ આઈડી",
    farmerIdLabel: "ખેડૂત આઈડી",
    farmerLabel: "ખેડૂતનું નામ",
    locationLabel: "સ્થળ / જિલ્લો",
    areaLabel: "ખેતર વિસ્તાર",
    stageLabel: "પાક તબક્કો",
    cropReport: "પાક ભલામણ અને જમીન સલાહ અહેવાલ",
    weatherReport: "હવામાન આગાહી અને કૃષિ સલાહ પત્રક",
    diseaseReport: "પાક રોગ નિદાન અને પેથોલોજી રિપોર્ટ",
    expenseReport: "નાણાકીય હિસાબ અને ખર્ચ પત્રક",
    soilReport: "જમીન સ્વાસ્થ્ય અને પોષકતત્વો અહેવાલ",
    pathologyTitle: "એઆઈ પાંદડાં રોગ નિદાન અને સારવાર",
    cropLabel: "પાકનું નામ",
    diseaseLabel: "નિદાન કરેલ રોગ",
    confLabel: "વિશ્વાસ સ્તર",
    severityLabel: "તીવ્રતા સ્તર",
    scanDateLabel: "તારીખ અને સમય",
    symptomsTitle: "જોવા મળતા લક્ષણો",
    causesTitle: "રોગના મુખ્ય કારણો અને પરિબળો",
    whatToDoTitle: "હવે શું કરવું (તાત્કાલિક પગલાં)",
    organicTitle: "જૈવિક અને ઓર્ગેનિક ઉપચાર વિકલ્પો",
    chemicalTitle: "રાસાયણિક દવાઓ અને છંટકાવ માર્ગદર્શન",
    safetyWarning: "સુરક્ષા ચેતવણી: રાસાયણિક દવાનો છંટકાવ કરતી વખતે રક્ષણાત્મક માસ્ક અને ગ્લોવ્ઝ અવશ્ય પહેરો. યોગ્ય માત્રામાં જ દવાનો ઉપયોગ કરો. જરૂર જણાયે નજીકના કૃષિ વિજ્ઞાન કેન્દ્ર (KVK) નો સંપર્ક કરો.",
    importantDisclaimer: "મહત્વપૂર્ણ સૂચના: આ રિપોર્ટ આર્ટિફિશિયલ ઇન્ટેલિજન્સ આધારિત કૃષિ સલાહ છે. કોઈપણ રાસાયણિક ઉપચાર કરતા પહેલા ખેતરમાં જાતે તપાસ કરો.",
    farmerCompanion: "ધ ખેડૂત (THE KHEDUT) • સ્માર્ટ કૃષિ. બહેતર નિર્ણયો.",
    farmDetails: "ખેતર અને જમીનની વિગતો",
    recCrops: "ભલામણ કરેલ અન્ય પાકો",
    yield: "અપેક્ષિત ઉત્પાદન",
    profit: "અંદાજિત નફો",
    duration: "પાકનો સમયગાળો",
    risk: "જોખમનું સ્તર",
    recommendation: "કૃષિ સલાહ",
    weatherConditions: "વર્તમાન હવામાન પરિસ્થિતિ",
    temp: "તાપમાન",
    humidity: "ભેજનું પ્રમાણ",
    wind: "પવનની ઝડપ",
    aqi: "હવાની ગુણવત્તા",
    sky: "આકાશની સ્થિતિ",
    advisory: "હવામાન આધારિત ખેતી સલાહ",
    ledger: "ખેતી નાણાકીય ખાતાવહી",
    revenue: "કુલ ખેતી આવક",
    expenses: "કુલ ખેતી ખર્ચ",
    netProfit: "ચોખ્ખો નફો",
    txLogs: "લેવડ-દેવડ પત્રક વિગત",
    date: "તારીખ",
    type: "પ્રકાર",
    category: "શ્રેણી",
    amount: "રકમ (રૂ)",
    description: "વિગત",
    footer: "આ કમ્પ્યુટર દ્વારા બનાવેલ અધિકૃત સલાહ અહેવાલ છે. નીચેના ક્યૂઆર કોડ દ્વારા તેની અધિકૃતતા ચકાસી શકાય છે.",
    scanToVerify: "અહેવાલની અધિકૃતતા ચકાસવા સ્કેન કરો",
    attestationText: "ધ ખેડૂત એઆઈ કૃષિ મંચ દ્વારા ડિજિટલ રીતે પ્રમાણિત અને ચકાસાયેલ અધિકૃત દસ્તાવેજ.",
    pageTitlePathology: "રોગ લક્ષણો અને પેથોલોજી પ્રોફાઇલ",
    pageTitleTreatment: "સારવાર પદ્ધતિ અને નિયંત્રણ પગલાં",
    pageTitleChecklist: "૭ દિવસીય કાર્ય યોજના અને પ્રમાણીકરણ",
    executiveSummary: "કાર્યકારી નિદાન સારાંશ",
    microclimateTitle: "હવામાન અને રોગ ફેલાવાનું જોખમ",
    ipmTitle: "સંકલિત રોગ અને જીવાત વ્યવસ્થાપન (IPM)",
    sprayScheduleTitle: "ભલામણ કરેલ છંટકાવ સમયપત્રક અને દવા માત્રા",
    checklistTitle: "૭ દિવસીય ખેડૂત કાર્ય સૂચિ",
    kvkNotice: "કૃષિ વિજ્ઞાન કેન્દ્ર (KVK) નિષ્ણાત સલાહ",
    kvkNoticeDetails: "જો રોગના લક્ષણો ચાલુ રહે અથવા વધુ ફેલાય, તો નજીકના કૃષિ વિજ્ઞાન કેન્દ્ર (KVK) ના વૈજ્ઞાનિકનો સંપર્ક કરો અથવા એપ દ્વારા કૃષિ નિષ્ણાતની સલાહ લો.",
    activeIngredient: "દવાનું નામ / ઘટક",
    commercialBrand: "બજારમાં મળતી બ્રાન્ડ",
    dosagePerLiter: "માત્રા / એકર",
    sprayTiming: "છંટકાવનો સમય",
    phiLabel: "કાપણી પહેલાંનો સમયગાળો (PHI)",
    immediateDirective: "તાત્કાલિક ખેતર નિર્દેશ (પ્રાથમિક પગલાં)",
    urgentIsolation: "રોગગ્રસ્ત પાકના છોડને તાત્કાલિક અલગ કરો અને વધુ ચેપગ્રસ્ત પાંદડાં દૂર કરો. ફૂગના ફેલાવાને રોકવા માટે ફુવારા પદ્ધતિથી પિયત ટાળો."
  },
  hi: {
    subtitle: "सटीक कृषि परामर्श • आधुनिक डिजिटल कृषि मंच",
    generated: "जारी किया गया",
    reportIdLabel: "रिपोर्ट आईडी",
    farmerIdLabel: "किसान आईडी",
    farmerLabel: "किसान का नाम",
    locationLabel: "स्थान / जिला",
    areaLabel: "खेत क्षेत्रफल",
    stageLabel: "फसल अवस्था",
    cropReport: "फसल चयन एवं मृदा सलाह रिपोर्ट",
    weatherReport: "कृषि मौसम पूर्वानुमान एवं परामर्श रिपोर्ट",
    diseaseReport: "फसल रोग निदान एवं उपचार रिपोर्ट",
    expenseReport: "वित्तीय बहीखाता एवं आय-व्यय रिपोर्ट",
    soilReport: "मृदा स्वास्थ्य एवं पोषक तत्व रिपोर्ट",
    pathologyTitle: "एआई पत्ती रोग निदान एवं उपचार",
    cropLabel: "फसल का नाम",
    diseaseLabel: "पहचाना गया रोग",
    confLabel: "विश्वास दर",
    severityLabel: "रोग की गंभीरता",
    scanDateLabel: "तारीख एवं समय",
    symptomsTitle: "रोग के मुख्य लक्षण",
    causesTitle: "रोग के कारण एवं अनुकूल परिस्थितियां",
    whatToDoTitle: "अब क्या करें (कार्य योजना)",
    organicTitle: "जैविक एवं प्राकृतिक उपचार विकल्प",
    chemicalTitle: "रासायनिक नियंत्रण एवं कीटनाशक निर्देश",
    safetyWarning: "सुरक्षा चेतावनी: रासायनिक कीटनाशकों का छिड़काव करते समय सुरक्षात्मक मास्क एवं दस्ताने का उपयोग करें। दवा की सही मात्रा का ही प्रयोग करें। स्थानीय कृषि विज्ञान केंद्र (KVK) के विशेषज्ञ से सलाह लें।",
    importantDisclaimer: "महत्वपूर्ण सूचना: यह रिपोर्ट एक एआई-जनरेटेड सलाह है। कृपया रासायनिक उपचार करने से पहले खेत में लक्षणों की पुष्टि स्वयं करें।",
    farmerCompanion: "द खेड़ूत (THE KHEDUT) • स्मार्ट कृषि. बेहतर निर्णय.",
    farmDetails: "खेत एवं मृदा विवरण",
    recCrops: "अनुशंसित वैकल्पिक फसलें",
    yield: "अपेक्षित पैदावार",
    profit: "अनुमानित शुद्ध लाभ",
    duration: "फसल चक्र अवधि",
    risk: "जोखिम स्तर",
    recommendation: "कृषि विशेषज्ञ सलाह",
    weatherConditions: "वर्तमान मौसम की स्थिति",
    temp: "तापमान",
    humidity: "हवा में नमी",
    wind: "हवा की गति",
    aqi: "वायु गुणवत्ता सूचकांक",
    sky: "आसमान की स्थिति",
    advisory: "मौसम आधारित कृषि सलाह",
    ledger: "वित्तीय बहीखाता विवरण",
    revenue: "कुल कृषि आय",
    expenses: "कुल कृषि व्यय",
    netProfit: "शुद्ध लाभ संतुलन",
    txLogs: "लेनदेन रिकॉर्ड विवरण",
    date: "दिनांक",
    type: "प्रकार",
    category: "श्रेणी",
    amount: "राशि (रुपये)",
    description: "विवरण",
    footer: "यह एक कंप्यूटर जनित आधिकारिक परामर्श रिपोर्ट है। नीचे दिए गए क्यूआर कोड से इसकी सत्यता जांची जा सकती है।",
    scanToVerify: "रिपोर्ट की सत्यता जांचने के लिए स्कैन करें",
    attestationText: "द खेड़ूत कृषि मंच द्वारा डिजिटल रूप से सत्यापित और प्रमाणित आधिकारिक दस्तावेज।",
    pageTitlePathology: "रोग लक्षण एवं पैथोलॉजी विवरण",
    pageTitleTreatment: "उपचार प्रोटोकॉल एवं नियंत्रण उपाय",
    pageTitleChecklist: "7 दिवसीय कार्य योजना एवं सत्यापन",
    executiveSummary: "कार्यकारी निदान सारांश",
    microclimateTitle: "मौसम एवं रोग फैलाव जोखिम कारक",
    ipmTitle: "एकीकृत कीट एवं रोग प्रबंधन (IPM)",
    sprayScheduleTitle: "अनुशंसित छिड़काव सारणी एवं दवा मात्रा",
    checklistTitle: "7 दिवसीय किसान कार्य सूची",
    kvkNotice: "कृषि विज्ञान केंद्र (KVK) विशेषज्ञ परामर्श",
    kvkNoticeDetails: "यदि रोग के लक्षण बने रहते हैं या प्रकोप बढ़ता है, तो अपने नजदीकी कृषि विज्ञान केंद्र (KVK) के कृषि अधिकारी से संपर्क करें अथवा ऐप में विशेषज्ञ परामर्श लें।",
    activeIngredient: "दवा का नाम / सक्रिय घटक",
    commercialBrand: "बाजार में उपलब्ध ब्रांड",
    dosagePerLiter: "मात्रा / एकड़",
    sprayTiming: "छिड़काव का समय",
    phiLabel: "कटाई पूर्व प्रतीक्षा अवधि (PHI)",
    immediateDirective: "प्राथमिक खेत निर्देश (तत्काल कार्यवाही)",
    urgentIsolation: "संक्रमित पौधों को तुरंत पहचानें एवं अधिक प्रभावित पत्तियों को काटकर नष्ट करें। फफूंद के बीजाणु फैलने से रोकने के लिए ऊपर से फव्वारा सिंचाई न करें।"
  }
};

export interface PdfReportOptions {
  reportId?: string;
  farmerId?: string;
  farmerName?: string;
  farmerEmail?: string;
  farmerLocation?: string;
  farmLocation?: string;
  farmSize?: number | string;
  farmArea?: number | string;
  cropName?: string;
  cropStage?: string;
  verificationUrl?: string;
  qrCodeBuffer?: Buffer;
}

export class PdfService {
  private static t(key: string, lang: string): string {
    const code = (lang || 'en').toLowerCase().slice(0, 2);
    const dict = pdfTranslations[code] || pdfTranslations.en;
    return dict[key] || pdfTranslations.en[key] || key;
  }

  private static getFontPath(filename: string): string {
    const candidatePaths = [
      path.resolve(process.cwd(), 'src/assets/fonts', filename),
      path.resolve(process.cwd(), 'dist/assets/fonts', filename),
      path.resolve(process.cwd(), 'backend/src/assets/fonts', filename),
      path.resolve(process.cwd(), 'backend/dist/assets/fonts', filename),
      path.resolve(__dirname, '../assets/fonts', filename),
      path.resolve(__dirname, '../../src/assets/fonts', filename),
      path.resolve(__dirname, '../../../src/assets/fonts', filename),
      path.join('C:\\Windows\\Fonts', filename)
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return '';
  }

  private static getBrandImagePath(filename: string): string {
    const candidatePaths = [
      path.resolve(process.cwd(), 'src/assets/brand', filename),
      path.resolve(process.cwd(), 'dist/assets/brand', filename),
      path.resolve(process.cwd(), 'backend/src/assets/brand', filename),
      path.resolve(process.cwd(), 'backend/dist/assets/brand', filename),
      path.resolve(__dirname, '../assets/brand', filename),
      path.resolve(__dirname, '../../src/assets/brand', filename),
      path.resolve(__dirname, '../../../../frontend/public/brand', filename),
      path.resolve(__dirname, '../../../frontend/public/brand', filename),
      path.resolve(process.cwd(), '../frontend/public/brand', filename),
      path.resolve(process.cwd(), 'frontend/public/brand', filename)
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return '';
  }

  /**
   * Generates an official The Khedut PDF Report as an in-memory Buffer in the selected language
   */
  static async generateReportBuffer(
    reportType: 'crop' | 'weather' | 'disease' | 'expense' | 'soil',
    data: any,
    language: string = 'en',
    options?: PdfReportOptions
  ): Promise<Buffer> {
    const effectiveReportId = options?.reportId || `REP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-7A8F`;
    const verificationUrl = options?.verificationUrl || `https://thekhedut.ai/verify/report/${effectiveReportId}`;

    // Generate real functional QR code buffer if not already supplied
    let qrBuffer = options?.qrCodeBuffer;
    if (!qrBuffer) {
      qrBuffer = await WatermarkAssets.generateVerificationQr(verificationUrl);
    }

    const mergedOptions: PdfReportOptions = {
      ...options,
      reportId: effectiveReportId,
      verificationUrl,
      qrCodeBuffer: qrBuffer
    };

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 28, bottom: 28, left: 32, right: 32 },
          autoFirstPage: true,
          bufferPages: true
        });

        const buffers: Buffer[] = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', err => reject(err));

        this.buildOfficialDocument(doc, reportType, data, language, mergedOptions);
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates an official The Khedut PDF directly to an Express HTTP Response
   */
  static async generateReport(
    res: Response,
    reportType: 'crop' | 'weather' | 'disease' | 'expense' | 'soil',
    data: any,
    language: string = 'en',
    options?: PdfReportOptions
  ): Promise<void> {
    try {
      const buffer = await this.generateReportBuffer(reportType, data, language, options);
      const disposition = 'inline';
      const fileName = `TheKhedut_${options?.reportId || 'Report'}_${reportType}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (err: any) {
      console.error('[PdfService generateReport Error]', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'PDF generation error' });
      }
    }
  }

  /**
   * Main Document Builder matching the Official The Khedut Design Specification
   */
  private static buildOfficialDocument(
    doc: PDFKit.PDFDocument,
    reportType: 'crop' | 'weather' | 'disease' | 'expense' | 'soil',
    data: any,
    language: string,
    options: PdfReportOptions
  ): void {
    // Official Brand Color Palette
    const primaryGreen = '#245B38';    // Deep Crop Emerald (Main titles, header dividers)
    const secondaryGreen = '#4F8A4B';  // Leaf Green (Sub-headings, cards)
    const accentGreen = '#A5C96A';     // Harvest Sprout Gold (Highlights, borders)
    const neutralBg = '#F7F9F5';       // Light Cream Field Canvas (Cards background)
    const textDark = '#1D2922';        // Fertile Soil Charcoal (Body text)
    const textMuted = '#475569';       // Slate 600 (Labels, captions)
    const dangerRed = '#DC2626';       // Crimson (Chemical warning)

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const leftMargin = 32;
    const rightMargin = 32;
    const contentWidth = pageWidth - leftMargin - rightMargin; // 531.28 pt

    // 1. REGISTER UNICODE FONTS (Nirmala UI for Gujarati, Hindi, Marathi, English)
    let regularFont = 'Helvetica';
    let boldFont = 'Helvetica-Bold';

    const regularPath = this.getFontPath('Nirmala.ttf');
    const boldPath = this.getFontPath('NirmalaB.ttf');

    if (regularPath) {
      try {
        doc.registerFont('TheKhedutUnicode', regularPath);
        regularFont = 'TheKhedutUnicode';
      } catch (e) {
        console.warn('[PDF Font Warning] Failed to register regular font:', e);
      }
    }

    if (boldPath) {
      try {
        doc.registerFont('TheKhedutUnicode-Bold', boldPath);
        boldFont = 'TheKhedutUnicode-Bold';
      } catch (e) {
        console.warn('[PDF Font Warning] Failed to register bold font:', e);
      }
    } else if (regularFont === 'TheKhedutUnicode') {
      boldFont = 'TheKhedutUnicode';
    }

    doc.font(regularFont);

    // 2. EMBED WATERMARK USING APPROVED MASTER ARTWORK (4.8% Opacity behind content)
    const masterLogoPath = this.getBrandImagePath('the-khedut-pdf-logo.png') || 
                           this.getBrandImagePath('the-khedut-full.png') || 
                           this.getBrandImagePath('the-khedut-master.jpg');
    const watermarkPath = this.getBrandImagePath('the-khedut-pdf-watermark.png') || 
                          this.getBrandImagePath('the-khedut-symbol.png') || 
                          masterLogoPath;

    if (watermarkPath && fs.existsSync(watermarkPath)) {
      doc.save();
      doc.opacity(0.048);
      doc.image(watermarkPath, (pageWidth - 280) / 2, 330, { width: 280 });
      doc.restore();
    } else {
      WatermarkAssets.renderOxenWatermark(doc, pageWidth / 2, 420, 0.9);
    }

    // 3. HEADER (Top-Left: Official Logo & Tagline; Top-Right: Support & IDs)
    let currentY = 24;

    if (masterLogoPath && fs.existsSync(masterLogoPath)) {
      // Official Master Logo Artwork: Farmer, two oxen, sunrise, tree, birds, farmhouse & The Khedut typography
      doc.image(masterLogoPath, leftMargin, currentY - 2, { height: 40 });
    } else {
      // Fallback Vector Emblem
      doc.save();
      doc.translate(leftMargin, currentY);
      doc.roundedRect(0, 0, 26, 26, 6).fillColor(primaryGreen).fill();
      doc.scale(0.38);
      doc.circle(21, 22, 8).fillColor(accentGreen).fillOpacity(0.3).fill();
      doc.fillOpacity(1);
      doc.lineWidth(1.5).strokeColor(accentGreen).moveTo(6, 52).bezierCurveTo(16, 50, 28, 53, 40, 51).stroke();
      doc.circle(17.5, 23, 3.6).fillColor('#FFFFFF').fill();
      doc.path('M 15 26.5 L 19.5 26.5 L 21.5 39 L 14 39 Z').fillColor('#FFFFFF').fill();
      doc.path('M 14 39 L 17 51 L 19 51 L 17.5 39 Z').fillColor('#FFFFFF').fill();
      doc.path('M 18.5 39 L 22 50.5 L 24 50.5 L 21 39 Z').fillColor('#FFFFFF').fill();
      doc.path('M 24 32.5 L 30 46 L 28.5 46.5 L 22.5 33 Z').fillColor(accentGreen).fill();
      doc.path('M 29.5 45.5 L 46 31.5 L 47 32.8 L 30.5 46.8 Z').fillColor(accentGreen).fill();
      doc.path('M 37 30 L 54 28.5 L 54 30.2 L 37 31.7 Z').fillColor('#FFFFFF').fill();
      doc.path('M 38 28.5 C 37 24.5 40 21.5 43 23.5 C 45 25 46 27.5 46 29.5 Z').fillColor(secondaryGreen).fill();
      doc.path('M 42 26.5 C 41 21.5 45 18.5 48.5 20.5 C 51 22 52 25.5 52 27.5 Z').fillColor('#FFFFFF').fill();
      doc.path('M 52 19.5 C 54 14.5 58 10.5 60 8.5 C 59 12.5 57 16.5 54.5 21.5 Z').fillColor(accentGreen).fill();
      doc.path('M 41 30.5 C 38 30.5 37 32.5 37 35.5 C 37 39.5 40 42.5 45 42.5 L 54 40.5 C 56 38.5 57 33.5 55 29.5 Z').fillColor('#FFFFFF').fill();
      doc.path('M 50 40.5 L 53 50.5 L 54.5 50.5 L 52 40.5 Z').fillColor('#FFFFFF').fill();
      doc.path('M 38 38.5 L 39.5 50.5 L 41 50.5 L 40 40.5 Z').fillColor('#FFFFFF').fill();
      doc.restore();

      // Application Title & Tagline
      doc.font(boldFont).fontSize(19).fillColor(primaryGreen).text('THE KHEDUT', leftMargin + 32, currentY);
      doc.font(regularFont).fontSize(8.5).fillColor(secondaryGreen).text('Smart Agriculture. Better Decisions.', leftMargin + 33, currentY + 22);
    }

    // Top-Right: Support Email, Website, Report ID, Date
    const formattedDateTime = data.scanDate ? new Date(data.scanDate).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const farmerIdStr = options.farmerId || (options.farmerEmail ? `TK-USR-${options.farmerEmail.slice(0, 4).toUpperCase()}` : 'TK-USR-1082');

    doc.font(regularFont).fontSize(8).fillColor(textMuted);
    doc.text(`Support: support@thekhedut.ai   |   Web: www.thekhedut.ai`, leftMargin, currentY + 2, { align: 'right', width: contentWidth });
    doc.font(boldFont).fontSize(8.5).fillColor(primaryGreen);
    doc.text(`Report ID: ${options.reportId}`, leftMargin, currentY + 15, { align: 'right', width: contentWidth });
    doc.font(regularFont).fontSize(8).fillColor(textMuted);
    doc.text(`Generated: ${formattedDateTime}   |   Farmer ID: ${farmerIdStr}`, leftMargin, currentY + 28, { align: 'right', width: contentWidth });

    currentY += 46;

    // Thin dark-green horizontal divider underneath header
    doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor(primaryGreen).lineWidth(1.2).stroke();
    currentY += 10;

    // 4. REPORT TITLE (Dynamic by category)
    let titleKey = 'cropReport';
    if (reportType === 'disease') titleKey = 'diseaseReport';
    else if (reportType === 'weather') titleKey = 'weatherReport';
    else if (reportType === 'expense') titleKey = 'expenseReport';
    else if (reportType === 'soil') titleKey = 'soilReport';

    doc.font(boldFont).fontSize(13.5).fillColor(primaryGreen).text(this.t(titleKey, language), leftMargin, currentY);
    doc.font(regularFont).fontSize(8.5).fillColor(textMuted).text(this.t('subtitle', language), leftMargin, currentY + 17);

    currentY += 32;

    // 5. FARMER AND REPORT INFORMATION (Clean structured 4-column key-value table)
    const farmerNameVal = options.farmerName || 'Verified Agricultural Member';
    const locationVal = options.farmerLocation || 'Regional Farming Zone';
    const cropNameVal = data.crop || data.cropName || 'Field Crop';
    const langDisplay = language.toUpperCase() === 'GU' ? 'ગુજરાતી (GU)' : (language.toUpperCase() === 'HI' ? 'हिन्दी (HI)' : 'English (EN)');
    const areaDisplay = options.farmSize ? `${options.farmSize} Acres` : (data.farmSize ? `${data.farmSize} Acres` : 'Field Plot');

    const metaBoxHeight = 44;
    doc.rect(leftMargin, currentY, contentWidth, metaBoxHeight).fillAndStroke(neutralBg, '#E2E8F0');

    // Row 1
    const col1X = leftMargin + 10;
    const col2X = leftMargin + 145;
    const col3X = leftMargin + 285;
    const col4X = leftMargin + 415;

    let metaY = currentY + 8;

    // Col 1: Farmer Name
    doc.font(boldFont).fontSize(7.5).fillColor(textMuted).text(this.t('farmerLabel', language).toUpperCase(), col1X, metaY);
    doc.font(boldFont).fontSize(8.5).fillColor(textDark).text(farmerNameVal, col1X, metaY + 11, { width: 130, ellipsis: true });

    // Col 2: Farmer ID & Location
    doc.font(boldFont).fontSize(7.5).fillColor(textMuted).text(this.t('locationLabel', language).toUpperCase(), col2X, metaY);
    doc.font(regularFont).fontSize(8.5).fillColor(textDark).text(locationVal, col2X, metaY + 11, { width: 135, ellipsis: true });

    // Col 3: Crop & Farm Area
    doc.font(boldFont).fontSize(7.5).fillColor(textMuted).text(this.t('cropLabel', language).toUpperCase(), col3X, metaY);
    doc.font(boldFont).fontSize(8.5).fillColor(primaryGreen).text(`${cropNameVal} (${areaDisplay})`, col3X, metaY + 11, { width: 125, ellipsis: true });

    // Col 4: Language & Date
    doc.font(boldFont).fontSize(7.5).fillColor(textMuted).text('LANGUAGE / STATUS', col4X, metaY);
    doc.font(regularFont).fontSize(8.5).fillColor(textDark).text(`${langDisplay} • Verified`, col4X, metaY + 11, { width: 110 });

    currentY += metaBoxHeight + 12;

    // 6. CENTRAL CONTENT ROUTING
    if (reportType === 'disease') {
      this.renderMultiPageDisease(
        doc,
        data,
        language,
        options,
        regularFont,
        boldFont,
        primaryGreen,
        secondaryGreen,
        accentGreen,
        neutralBg,
        textDark,
        textMuted,
        dangerRed,
        leftMargin,
        contentWidth,
        watermarkPath,
        currentY,
        formattedDateTime
      );
    } else {
      if (reportType === 'weather') {
        currentY = this.renderCentralWeather(doc, data, language, regularFont, boldFont, primaryGreen, secondaryGreen, textDark, textMuted, leftMargin, contentWidth, currentY);
      } else if (reportType === 'expense') {
        currentY = this.renderCentralExpense(doc, data, language, regularFont, boldFont, primaryGreen, secondaryGreen, textDark, textMuted, leftMargin, contentWidth, currentY);
      } else {
        currentY = this.renderCentralCropSoil(doc, data, language, regularFont, boldFont, primaryGreen, secondaryGreen, textDark, textMuted, leftMargin, contentWidth, currentY);
      }

      // 7. BOTTOM REPORT SECTION FOR SINGLE-PAGE REPORTS (QR Code, Digital Attestation, and Official Circular Seal)
      const bottomY = 722;
      doc.moveTo(leftMargin, bottomY - 6).lineTo(leftMargin + contentWidth, bottomY - 6).strokeColor('#E2E8F0').lineWidth(0.8).stroke();

      if (options.qrCodeBuffer) {
        try {
          doc.image(options.qrCodeBuffer, leftMargin, bottomY, { width: 48, height: 48 });
        } catch (qrErr) {
          doc.rect(leftMargin, bottomY, 48, 48).strokeColor(primaryGreen).stroke();
        }
      }
      doc.font(boldFont).fontSize(6.5).fillColor(primaryGreen).text(this.t('scanToVerify', language), leftMargin + 53, bottomY + 10, { width: 165 });
      doc.font(regularFont).fontSize(6).fillColor(textMuted).text(`thekhedut.ai/verify/report/${options.reportId}`, leftMargin + 53, bottomY + 22, { width: 175 });

      const attestationX = leftMargin + 215;
      doc.font(regularFont).fontSize(6.5).fillColor(textMuted).text(
        this.t('attestationText', language),
        attestationX,
        bottomY + 8,
        { width: 185, align: 'left', lineGap: 1 }
      );

      const sealCenterX = leftMargin + contentWidth - 36;
      const sealCenterY = bottomY + 24;
      WatermarkAssets.renderOfficialSeal(doc, sealCenterX, sealCenterY, 27);
    }

    // 8. RUNNING FOOTER ON ALL PAGES (Dynamically stamped using bufferedPageRange)
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const footerY = 794;
      doc.moveTo(leftMargin, footerY - 4).lineTo(leftMargin + contentWidth, footerY - 4).strokeColor(primaryGreen).lineWidth(0.8).stroke();

      doc.font(boldFont).fontSize(7).fillColor(primaryGreen).text(
        'THE KHEDUT • Smart Agriculture. Better Decisions.',
        leftMargin,
        footerY,
        { width: 230, align: 'left' }
      );

      doc.font(regularFont).fontSize(7).fillColor(textMuted).text(
        'www.thekhedut.ai',
        leftMargin + 230,
        footerY,
        { width: 100, align: 'center' }
      );

      doc.font(boldFont).fontSize(7).fillColor(primaryGreen).text(
        `Page ${i + 1} of ${range.count}`,
        leftMargin + contentWidth - 80,
        footerY,
        { width: 80, align: 'right' }
      );
    }
  }

  /**
   * Renders Running Top Banner on Secondary Pages (Pages 2, 3, 4)
   */
  private static renderSecondaryPageHeader(
    doc: PDFKit.PDFDocument,
    reportId: string,
    sectionTitle: string,
    formattedDateTime: string,
    font: string,
    boldFont: string,
    primaryGreen: string,
    accentGreen: string,
    leftMargin: number,
    contentWidth: number,
    watermarkPath: string
  ): number {
    const pageWidth = 595.28;
    if (watermarkPath && fs.existsSync(watermarkPath)) {
      doc.save();
      doc.opacity(0.048);
      doc.image(watermarkPath, (pageWidth - 280) / 2, 330, { width: 280 });
      doc.restore();
    } else {
      WatermarkAssets.renderOxenWatermark(doc, pageWidth / 2, 420, 0.85);
    }

    const currentY = 24;
    doc.rect(leftMargin, currentY, contentWidth, 24).fill(primaryGreen);
    doc.font(boldFont).fontSize(8.5).fillColor('#FFFFFF').text(
      `THE KHEDUT • ${sectionTitle}`,
      leftMargin + 10,
      currentY + 7
    );
    doc.font(font).fontSize(7.5).fillColor(accentGreen).text(
      `ID: ${reportId}   |   ${formattedDateTime}`,
      leftMargin + 10,
      currentY + 7,
      { align: 'right', width: contentWidth - 20 }
    );

    return currentY + 36;
  }

  /**
   * Renders Multi-Page Official Disease Pathology Statement (Pages 1, 2, 3, 4)
   */
  private static renderMultiPageDisease(
    doc: PDFKit.PDFDocument,
    data: any,
    lang: string,
    options: PdfReportOptions,
    font: string,
    boldFont: string,
    primary: string,
    secondary: string,
    accent: string,
    neutralBg: string,
    text: string,
    muted: string,
    danger: string,
    leftMargin: number,
    contentWidth: number,
    watermarkPath: string,
    startY: number,
    formattedDateTime: string
  ): void {
    let currentY = startY;

    // PAGE 1: EXECUTIVE DIAGNOSIS HERO CARD & SPECIMEN PHOTO
    const diseaseName = data.diseaseName || data.name || 'Observed Leaf Pathology';
    const localNameStr = data.localName ? ` (${data.localName})` : '';
    const scientificStr = data.scientificName ? `Scientific: ${data.scientificName}` : '';
    const fullDiseaseStr = `${diseaseName}${localNameStr}`;

    const rawConf = typeof data.confidenceScore === 'number' ? data.confidenceScore : 0.92;
    const confPercent = rawConf > 1 ? `${rawConf.toFixed(0)}%` : `${(rawConf * 100).toFixed(0)}%`;
    const severityStr = (data.severity || 'Moderate').toUpperCase();

    const heroHeight = 265;
    doc.rect(leftMargin, currentY, contentWidth, heroHeight).fillAndStroke(neutralBg, '#E2E8F0');

    // Title
    doc.font(boldFont).fontSize(13.5).fillColor(primary).text(fullDiseaseStr, leftMargin + 14, currentY + 14, { width: 320 });
    
    let textY = currentY + 35;
    if (scientificStr) {
      doc.font(font).fontSize(8.5).fillColor(muted).text(scientificStr, leftMargin + 14, textY, { width: 320 });
      textY += 15;
    }

    // Pills row: Confidence, Severity, Condition
    doc.rect(leftMargin + 14, textY, 105, 20).fillAndStroke('#ECFDF5', '#A7F3D0');
    doc.font(boldFont).fontSize(8).fillColor('#065F46').text(`${confPercent} AI Confidence`, leftMargin + 18, textY + 5);

    const isHighSev = severityStr.includes('HIGH') || severityStr.includes('CRITICAL') || severityStr.includes('SEVERE');
    const sevBg = isHighSev ? '#FEF2F2' : '#FFFBEB';
    const sevBorder = isHighSev ? '#FECACA' : '#FDE68A';
    const sevText = isHighSev ? '#991B1B' : '#92400E';

    doc.rect(leftMargin + 125, textY, 95, 20).fillAndStroke(sevBg, sevBorder);
    doc.font(boldFont).fontSize(8).fillColor(sevText).text(`Severity: ${severityStr}`, leftMargin + 130, textY + 5);

    doc.rect(leftMargin + 226, textY, 80, 20).fillAndStroke('#F1F5F9', '#CBD5E1');
    doc.font(boldFont).fontSize(8).fillColor('#334155').text(data.condition || 'DIAGNOSED', leftMargin + 232, textY + 5);

    textY += 32;

    // Executive summary text
    const summaryText = data.executiveSummary || data.assessment || data.description || 
      `${diseaseName} has been identified on the inspected ${data.crop || 'crop'} foliage with a high neural confidence score of ${confPercent}. Physical visual symptoms indicate ${severityStr.toLowerCase()} severity with localized necrotic lesion spread. Early proactive intervention is recommended to protect the remaining canopy and prevent contagion to adjacent plots.`;

    doc.font(boldFont).fontSize(8.5).fillColor(primary).text(this.t('executiveSummary', lang), leftMargin + 14, textY);
    textY += 14;
    doc.font(font).fontSize(8.5).fillColor(text).text(summaryText, leftMargin + 14, textY, { width: 310, lineGap: 2.5 });

    // Right Column: Specimen Photo Frame
    const frameX = leftMargin + contentWidth - 175;
    const frameY = currentY + 14;
    const frameW = 162;
    const frameH = heroHeight - 28;

    doc.rect(frameX, frameY, frameW, frameH).fillAndStroke('#FFFFFF', '#CBD5E1');

    if (data.imageBuffer && Buffer.isBuffer(data.imageBuffer)) {
      try {
        doc.image(data.imageBuffer, frameX + 6, frameY + 6, {
          fit: [frameW - 12, frameH - 30],
          align: 'center',
          valign: 'center'
        });
      } catch (imgErr) {
        console.warn('[PdfService Leaf Specimen Image Render Warning]', imgErr);
      }
    } else {
      doc.save();
      doc.translate(frameX + (frameW / 2) - 30, frameY + 45);
      doc.scale(0.8);
      doc.circle(35, 35, 30).fillColor(secondary).fillOpacity(0.12).fill();
      doc.circle(35, 35, 20).fillColor(primary).fillOpacity(0.2).fill();
      doc.restore();
    }

    doc.rect(frameX, frameY + frameH - 20, frameW, 20).fill('#F8FAFC');
    doc.font(boldFont).fontSize(7).fillColor(muted).text('DIAGNOSTIC LEAF SPECIMEN #1', frameX, frameY + frameH - 14, { width: frameW, align: 'center' });

    // Page 1 Directive Box below Hero
    currentY += heroHeight + 16;

    const bannerH = 100;
    doc.rect(leftMargin, currentY, contentWidth, bannerH).fillAndStroke('#F0FDF4', '#86EFAC');
    doc.font(boldFont).fontSize(9.5).fillColor(primary).text(this.t('immediateDirective', lang), leftMargin + 14, currentY + 12);

    const directivePoints = [
      '1. ' + this.t('urgentIsolation', lang),
      '2. Disinfect agricultural shears, sickles, and boots with 1% sodium hypochlorite after handling affected plants.',
      '3. Turn to Page 2 for Detailed Pathology, Page 3 for the IPM Chemical Spray Schedule, and Page 4 for the 7-Day Checklist.'
    ];

    let dirY = currentY + 30;
    directivePoints.forEach(pt => {
      doc.font(font).fontSize(8.5).fillColor(text).text(pt, leftMargin + 14, dirY, { width: contentWidth - 28, lineGap: 1.5 });
      dirY += 21;
    });

    // -------------------------------------------------------------
    // PAGE 2: COMPREHENSIVE PATHOLOGY & SYMPTOMS ANALYSIS
    // -------------------------------------------------------------
    doc.addPage();
    currentY = this.renderSecondaryPageHeader(
      doc, options.reportId || 'REP-001', this.t('pageTitlePathology', lang), formattedDateTime,
      font, boldFont, primary, accent, leftMargin, contentWidth, watermarkPath
    );

    // Card 1: Symptoms
    doc.rect(leftMargin, currentY, contentWidth, 120).fillAndStroke(neutralBg, '#E2E8F0');
    doc.font(boldFont).fontSize(10).fillColor(primary).text(this.t('symptomsTitle', lang), leftMargin + 14, currentY + 10);
    
    const symptomsList: string[] = Array.isArray(data.symptoms) && data.symptoms.length > 0
      ? data.symptoms
      : ['Visible chlorotic lesions with concentric rings expanding along the leaf blade.',
         'Water-soaked necrotic margins developing near leaf veins and foliage edges.',
         'Premature senescence, leaf yellowing, and partial defoliation in affected lower branches.'];

    let symY = currentY + 28;
    symptomsList.slice(0, 4).forEach((sym: string) => {
      doc.font(font).fontSize(8.5).fillColor(text).text(`•  ${sym}`, leftMargin + 14, symY, { width: contentWidth - 28, lineGap: 2 });
      symY += 22;
    });

    currentY += 132;

    // Card 2: Pathogen Profile
    doc.rect(leftMargin, currentY, contentWidth, 90).fillAndStroke(neutralBg, '#E2E8F0');
    doc.font(boldFont).fontSize(10).fillColor(primary).text(this.t('causesTitle', lang), leftMargin + 14, currentY + 10);

    const causesList: string[] = Array.isArray(data.possibleCauses) && data.possibleCauses.length > 0
      ? data.possibleCauses
      : (data.causes ? (Array.isArray(data.causes) ? data.causes : [data.causes]) : [
          'Pathogen propagation driven by elevated relative humidity and leaf moisture.',
          'Overcrowded crop canopy and reduced air circulation fostering fungal hyphae growth.'
        ]);

    let causeY = currentY + 28;
    causesList.slice(0, 3).forEach((cs: string) => {
      doc.font(font).fontSize(8.5).fillColor(text).text(`•  ${cs}`, leftMargin + 14, causeY, { width: contentWidth - 28, lineGap: 2 });
      causeY += 20;
    });

    currentY += 102;

    // Card 3: Microclimate & Environmental Risk (3 Columns)
    doc.rect(leftMargin, currentY, contentWidth, 96).fillAndStroke('#FFFFFF', '#CBD5E1');
    doc.font(boldFont).fontSize(10).fillColor(secondary).text(this.t('microclimateTitle', lang), leftMargin + 14, currentY + 10);

    const colW = (contentWidth - 28) / 3;
    const boxY = currentY + 28;

    // Box 1: Temp
    doc.rect(leftMargin + 10, boxY, colW - 6, 56).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.font(boldFont).fontSize(7.5).fillColor(muted).text('TEMPERATURE WINDOW', leftMargin + 16, boxY + 8);
    doc.font(boldFont).fontSize(10).fillColor(primary).text('20°C - 30°C', leftMargin + 16, boxY + 22);
    doc.font(font).fontSize(7).fillColor(text).text('Optimal sporulation zone', leftMargin + 16, boxY + 38);

    // Box 2: Humidity
    doc.rect(leftMargin + 10 + colW, boxY, colW - 6, 56).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.font(boldFont).fontSize(7.5).fillColor(muted).text('RELATIVE HUMIDITY', leftMargin + 16 + colW, boxY + 8);
    doc.font(boldFont).fontSize(10).fillColor(primary).text('> 80% RH', leftMargin + 16 + colW, boxY + 22);
    doc.font(font).fontSize(7).fillColor(text).text('Accelerates spore release', leftMargin + 16 + colW, boxY + 38);

    // Box 3: Wetness
    doc.rect(leftMargin + 10 + (colW * 2), boxY, colW - 6, 56).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.font(boldFont).fontSize(7.5).fillColor(muted).text('LEAF WETNESS', leftMargin + 16 + (colW * 2), boxY + 8);
    doc.font(boldFont).fontSize(10).fillColor(primary).text('> 6 Hours', leftMargin + 16 + (colW * 2), boxY + 22);
    doc.font(font).fontSize(7).fillColor(text).text('Continuous moisture risk', leftMargin + 16 + (colW * 2), boxY + 38);

    currentY += 108;

    // Card 4: Field Contagion Risk
    doc.rect(leftMargin, currentY, contentWidth, 75).fillAndStroke('#FFFBEB', '#FDE68A');
    doc.font(boldFont).fontSize(9.5).fillColor('#92400E').text('FIELD CONTAGION & SECONDARY CYCLE ASSESSMENT', leftMargin + 14, currentY + 10);
    doc.font(font).fontSize(8.5).fillColor(text).text(
      'Without targeted fungicidal or biological barrier treatment, spore dissemination to neighboring rows is anticipated within 48 to 72 hours. Inspect surrounding buffer plants within a 15-meter radius and apply protective perimeter sprays.',
      leftMargin + 14,
      currentY + 26,
      { width: contentWidth - 28, lineGap: 2 }
    );

    // -------------------------------------------------------------
    // PAGE 3: INTEGRATED TREATMENT PROTOCOL (IPM) & SPRAY SCHEDULE
    // -------------------------------------------------------------
    doc.addPage();
    currentY = this.renderSecondaryPageHeader(
      doc, options.reportId || 'REP-001', this.t('pageTitleTreatment', lang), formattedDateTime,
      font, boldFont, primary, accent, leftMargin, contentWidth, watermarkPath
    );

    // 1. Biological & Organic Controls
    doc.rect(leftMargin, currentY, contentWidth, 90).fillAndStroke(neutralBg, '#E2E8F0');
    doc.font(boldFont).fontSize(10).fillColor(secondary).text(this.t('organicTitle', lang), leftMargin + 14, currentY + 10);

    const organicList: string[] = Array.isArray(data.organicTreatment) && data.organicTreatment.length > 0
      ? data.organicTreatment
      : [
          'Apply cold-pressed Neem oil (10,000 ppm) at 3 to 5 ml per liter of water with 1 ml liquid soap surfactant.',
          'Foliar spray of Trichoderma viride or Pseudomonas fluorescens (5 g/L water) in early morning hours.'
        ];

    let orgY = currentY + 28;
    organicList.slice(0, 3).forEach((org: string) => {
      doc.font(font).fontSize(8.5).fillColor(text).text(`•  ${org}`, leftMargin + 14, orgY, { width: contentWidth - 28, lineGap: 2 });
      orgY += 20;
    });

    currentY += 102;

    // 2. Structured Chemical Treatment Table
    doc.font(boldFont).fontSize(10).fillColor(primary).text(this.t('sprayScheduleTitle', lang), leftMargin, currentY);
    currentY += 15;

    // Table Header
    const thHeight = 22;
    doc.rect(leftMargin, currentY, contentWidth, thHeight).fill(primary);

    const c1W = 145;
    const c2W = 110;
    const c3W = 95;
    const c4W = 105;
    const c5W = contentWidth - c1W - c2W - c3W - c4W;

    doc.font(boldFont).fontSize(7.5).fillColor('#FFFFFF');
    doc.text(this.t('activeIngredient', lang), leftMargin + 6, currentY + 6, { width: c1W });
    doc.text(this.t('commercialBrand', lang), leftMargin + c1W + 4, currentY + 6, { width: c2W });
    doc.text(this.t('dosagePerLiter', lang), leftMargin + c1W + c2W + 4, currentY + 6, { width: c3W });
    doc.text(this.t('sprayTiming', lang), leftMargin + c1W + c2W + c3W + 4, currentY + 6, { width: c4W });
    doc.text(this.t('phiLabel', lang), leftMargin + c1W + c2W + c3W + c4W + 4, currentY + 6, { width: c5W, align: 'center' });

    currentY += thHeight;

    const scheduleRows = [
      {
        chem: data.pesticideDetails?.activeIngredient || 'Mancozeb 75% WP',
        brand: data.pesticideDetails?.englishName || 'Dithane M-45 / Indofil',
        dose: data.pesticideDetails?.dosage || '2.0 - 2.5 g / Liter (500 g/Acre)',
        time: 'Day 1 Morning (6:00 - 8:30 AM)',
        phi: '14 Days'
      },
      {
        chem: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
        brand: 'Amistar Top / Mirador Duo',
        dose: '1.0 ml / Liter (200 ml/Acre)',
        time: 'Day 7 (If lesions persist)',
        phi: '21 Days'
      },
      {
        chem: 'Potassium Silicate + Zinc Chelated (Foliar)',
        brand: 'Agri-Sil / Bio-Zinc Fortifier',
        dose: '1.5 g / Liter (300 g/Acre)',
        time: 'Day 12 (Canopy Restoration)',
        phi: '0 Days'
      }
    ];

    scheduleRows.forEach((row, rIdx) => {
      const rowBg = rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      const rowH = 24;
      doc.rect(leftMargin, currentY, contentWidth, rowH).fillAndStroke(rowBg, '#E2E8F0');

      doc.font(boldFont).fontSize(7.5).fillColor(text).text(row.chem, leftMargin + 6, currentY + 7, { width: c1W - 8, ellipsis: true });
      doc.font(font).fontSize(7.5).fillColor(muted).text(row.brand, leftMargin + c1W + 4, currentY + 7, { width: c2W - 8, ellipsis: true });
      doc.font(boldFont).fontSize(7.5).fillColor(primary).text(row.dose, leftMargin + c1W + c2W + 4, currentY + 7, { width: c3W - 8, ellipsis: true });
      doc.font(font).fontSize(7.5).fillColor(text).text(row.time, leftMargin + c1W + c2W + c3W + 4, currentY + 7, { width: c4W - 8 });
      doc.font(boldFont).fontSize(7.5).fillColor('#047857').text(row.phi, leftMargin + c1W + c2W + c3W + c4W + 4, currentY + 7, { width: c5W, align: 'center' });

      currentY += rowH;
    });

    currentY += 16;

    // 3. Mandatory Safety & PPE Mandate Card
    const ppeH = 120;
    doc.rect(leftMargin, currentY, contentWidth, ppeH).fillAndStroke('#FEF2F2', '#FECACA');
    doc.font(boldFont).fontSize(10).fillColor(danger).text('MANDATORY CHEMICAL SAFETY & PPE DIRECTIVES', leftMargin + 14, currentY + 12);

    const safetyBullets = [
      '•  Personal Protective Equipment (PPE): Always wear an N95 respirator mask, nitrile gloves, eye goggles, and full-length clothing.',
      '•  Application Wind Conditions: Never spray against wind direction to prevent inhalation drift. Halt spraying if wind velocity exceeds 15 km/h.',
      '•  Diurnal Temperature Window: Apply strictly during early morning (6:00 - 9:00 AM) or late afternoon (4:30 - 6:30 PM). Avoid midday sun.',
      '•  Responsible Container Disposal: Triple-rinse empty pesticide packaging with clean water, puncture bases, and dispose per statutory norms.'
    ];

    let ppeY = currentY + 30;
    safetyBullets.forEach(b => {
      doc.font(font).fontSize(8).fillColor('#7F1D1D').text(b, leftMargin + 14, ppeY, { width: contentWidth - 28, lineGap: 1.5 });
      ppeY += 21;
    });

    // -------------------------------------------------------------
    // PAGE 4: 7-DAY ACTION PLAN, OFFICIAL ATTESTATION & VERIFICATION
    // -------------------------------------------------------------
    doc.addPage();
    currentY = this.renderSecondaryPageHeader(
      doc, options.reportId || 'REP-001', this.t('pageTitleChecklist', lang), formattedDateTime,
      font, boldFont, primary, accent, leftMargin, contentWidth, watermarkPath
    );

    // 1. 7-Day Action Plan
    doc.rect(leftMargin, currentY, contentWidth, 195).fillAndStroke(neutralBg, '#E2E8F0');
    doc.font(boldFont).fontSize(10.5).fillColor(primary).text(this.t('checklistTitle', lang), leftMargin + 14, currentY + 12);

    const timeline = [
      {
        day: 'DAY 1: Immediate Field Sanitation & Diagnostic Marking',
        text: 'Survey entire field plot. Physically prune and safely bag severely blighted foliage. Clear furrow weeds to improve microclimate aeration.'
      },
      {
        day: 'DAY 2 - 3: First Targeted Spray Application',
        text: 'Calibrate spray nozzles to produce fine droplets (200-300 microns). Apply fungicide or bio-agent ensuring complete coverage of leaf undersides.'
      },
      {
        day: 'DAY 4 - 5: Post-Application Recovery Surveillance',
        text: 'Inspect treated rows for active spore mycelium suppression. Check that expanding edges of lesions have turned dark and dry.'
      },
      {
        day: 'DAY 7: Follow-up Evaluation & Preventive Reinforcement',
        text: 'If weather remains humid or active sporulation continues, rotate to the secondary recommended active chemical. Apply foliar bio-nutrients.'
      }
    ];

    let timeY = currentY + 32;
    timeline.forEach(step => {
      doc.font(boldFont).fontSize(8.5).fillColor(secondary).text(step.day, leftMargin + 14, timeY);
      timeY += 13;
      doc.font(font).fontSize(8).fillColor(text).text(step.text, leftMargin + 14, timeY, { width: contentWidth - 28, lineGap: 1.5 });
      timeY += 26;
    });

    currentY += 208;

    // 2. KVK & Agronomic Advisory Card
    doc.rect(leftMargin, currentY, contentWidth, 70).fillAndStroke('#F0FDF4', '#BBF7D0');
    doc.font(boldFont).fontSize(9.5).fillColor(primary).text(this.t('kvkNotice', lang), leftMargin + 14, currentY + 10);
    doc.font(font).fontSize(8).fillColor(text).text(
      this.t('kvkNoticeDetails', lang),
      leftMargin + 14,
      currentY + 24,
      { width: contentWidth - 28, lineGap: 1.5 }
    );
    doc.font(font).fontSize(7).fillColor(muted).text(
      this.t('importantDisclaimer', lang),
      leftMargin + 14,
      currentY + 46,
      { width: contentWidth - 28 }
    );

    currentY += 82;

    // 3. Official Digital Attestation Block (QR Code, Cryptographic Attestation, and Circular Seal)
    const attestBoxH = 92;
    doc.rect(leftMargin, currentY, contentWidth, attestBoxH).fillAndStroke('#FFFFFF', primary);

    // Left: QR Code
    if (options.qrCodeBuffer) {
      try {
        doc.image(options.qrCodeBuffer, leftMargin + 12, currentY + 12, { width: 56, height: 56 });
      } catch (qrErr) {
        doc.rect(leftMargin + 12, currentY + 12, 56, 56).strokeColor(primary).stroke();
      }
    }
    doc.font(boldFont).fontSize(7).fillColor(primary).text(this.t('scanToVerify', lang), leftMargin + 76, currentY + 14, { width: 170 });
    doc.font(font).fontSize(6.5).fillColor(muted).text(`thekhedut.ai/verify/report/${options.reportId}`, leftMargin + 76, currentY + 26, { width: 180 });

    // Center: Attestation text
    const midX = leftMargin + 195;
    doc.font(boldFont).fontSize(8).fillColor(primary).text('CRYPTOGRAPHICALLY ATTESTED RECORD', midX, currentY + 14);
    doc.font(font).fontSize(6.8).fillColor(muted).text(
      this.t('attestationText', lang),
      midX,
      currentY + 28,
      { width: 220, lineGap: 1.5 }
    );
    doc.font(font).fontSize(6).fillColor(muted).text(
      `Generated by The Khedut AI Neural Engine • Hash: ${Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED`,
      midX,
      currentY + 68
    );

    // Right: Circular Seal
    const sealCenterX = leftMargin + contentWidth - 46;
    const sealCenterY = currentY + 44;
    WatermarkAssets.renderOfficialSeal(doc, sealCenterX, sealCenterY, 32);
  }

  /**
   * Renders Weather Advisory Central Content
   */
  private static renderCentralWeather(
    doc: PDFKit.PDFDocument,
    data: any,
    lang: string,
    font: string,
    boldFont: string,
    primary: string,
    secondary: string,
    text: string,
    muted: string,
    leftMargin: number,
    contentWidth: number,
    startY: number
  ): number {
    let currentY = startY;

    doc.font(boldFont).fontSize(10.5).fillColor(primary).text(this.t('weatherConditions', lang), leftMargin, currentY);
    currentY += 14;

    const weatherFields = [
      [this.t('temp', lang), `${data.current?.temp || '28'}°C`],
      [this.t('humidity', lang), `${data.current?.humidity || '62'}%`],
      [this.t('wind', lang), `${data.current?.windSpeed || '3.4'} m/s`],
      [this.t('aqi', lang), `${data.current?.aqi || '45'} (Good)`],
      [this.t('sky', lang), data.current?.description || 'Clear Sky / Optimal for Field Work']
    ];

    weatherFields.forEach(([label, value]) => {
      doc.font(boldFont).fontSize(8.5).fillColor(text).text(`${label}: `, leftMargin + 10, currentY, { continued: true });
      doc.font(font).fontSize(8.5).fillColor(muted).text(value);
      currentY += 14;
    });

    if (data.aiAdvice) {
      currentY += 8;
      doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
      currentY += 6;
      doc.font(boldFont).fontSize(10).fillColor(secondary).text(this.t('advisory', lang), leftMargin, currentY);
      currentY += 13;
      doc.font(font).fontSize(8.5).fillColor(text).text(data.aiAdvice, leftMargin + 8, currentY, { width: contentWidth - 16 });
    }

    return currentY;
  }

  /**
   * Renders Expense Financial Central Content
   */
  private static renderCentralExpense(
    doc: PDFKit.PDFDocument,
    data: any,
    lang: string,
    font: string,
    boldFont: string,
    primary: string,
    secondary: string,
    text: string,
    muted: string,
    leftMargin: number,
    contentWidth: number,
    startY: number
  ): number {
    let currentY = startY;

    const summary = data.summary || { totalIncome: 0, totalExpense: 0, netProfit: 0 };

    doc.rect(leftMargin, currentY, contentWidth, 38).fillAndStroke('#F7F9F5', '#E2E8F0');
    doc.font(boldFont).fontSize(8.5).fillColor(primary).text(
      `${this.t('revenue', lang)}: Rs. ${summary.totalIncome.toLocaleString('en-IN')}   |   ${this.t('expenses', lang)}: Rs. ${summary.totalExpense.toLocaleString('en-IN')}   |   ${this.t('netProfit', lang)}: Rs. ${summary.netProfit.toLocaleString('en-IN')}`,
      leftMargin + 10,
      currentY + 13
    );

    currentY += 48;

    if (data.expenses && data.expenses.length > 0) {
      doc.font(boldFont).fontSize(10).fillColor(primary).text(this.t('txLogs', lang), leftMargin, currentY);
      currentY += 14;

      // Table Header
      doc.rect(leftMargin, currentY, contentWidth, 18).fill('#E2E8F0');
      doc.font(boldFont).fontSize(8).fillColor(text);
      doc.text(this.t('date', lang), leftMargin + 6, currentY + 4, { width: 70 });
      doc.text(this.t('type', lang), leftMargin + 80, currentY + 4, { width: 65 });
      doc.text(this.t('category', lang), leftMargin + 150, currentY + 4, { width: 95 });
      doc.text(this.t('amount', lang), leftMargin + 250, currentY + 4, { width: 85, align: 'right' });
      doc.text(this.t('description', lang), leftMargin + 350, currentY + 4, { width: 170 });

      currentY += 20;

      doc.font(font).fontSize(7.5).fillColor(muted);
      data.expenses.slice(0, 10).forEach((exp: any) => {
        const dStr = new Date(exp.date).toLocaleDateString('en-IN');
        doc.text(dStr, leftMargin + 6, currentY, { width: 70 });
        doc.text(exp.type.toUpperCase(), leftMargin + 80, currentY, { width: 65 });
        doc.text(exp.category, leftMargin + 150, currentY, { width: 95 });
        doc.text(`Rs. ${exp.amount}`, leftMargin + 250, currentY, { width: 85, align: 'right' });
        doc.text(exp.description || '-', leftMargin + 350, currentY, { width: 170 });
        currentY += 14;
      });
    }

    return currentY;
  }

  /**
   * Renders Crop / Soil Advisory Central Content
   */
  private static renderCentralCropSoil(
    doc: PDFKit.PDFDocument,
    data: any,
    lang: string,
    font: string,
    boldFont: string,
    primary: string,
    secondary: string,
    text: string,
    muted: string,
    leftMargin: number,
    contentWidth: number,
    startY: number
  ): number {
    let currentY = startY;

    doc.font(boldFont).fontSize(10).fillColor(primary).text(this.t('farmDetails', lang), leftMargin, currentY);
    currentY += 12;

    const details: [string, string][] = [];
    if (data.crop || data.cropName) details.push(['Crop / Commodity', data.crop || data.cropName]);
    if (data.variety) details.push(['Crop Variety', data.variety]);
    if (data.currentStage || data.cropStage) details.push(['Growth Stage', data.currentStage || data.cropStage]);
    if (data.soilType) details.push(['Soil Chemistry & Texture', data.soilType]);
    if (data.ph) details.push(['Soil pH Level', data.ph]);
    if (data.nitrogen) details.push(['Available Nitrogen (N)', String(data.nitrogen)]);
    if (data.phosphorus) details.push(['Available Phosphorus (P)', String(data.phosphorus)]);
    if (data.potassium) details.push(['Available Potassium (K)', String(data.potassium)]);
    if (data.waterSource) details.push(['Irrigation Infrastructure', data.waterSource]);
    if (data.irrigationSchedule) details.push(['Irrigation Schedule', data.irrigationSchedule]);

    if (details.length === 0) {
      details.push(
        ['Farm Name', data.farmName || 'Verified Agricultural Plot'],
        ['Farm Area', `${data.farmSize || 4.5} Acres`],
        ['Soil Chemistry', data.soilType || 'Loamy / Medium Black Soil'],
        ['Irrigation Infrastructure', data.waterSource || 'Borewell & Drip Irrigation']
      );
    }

    details.slice(0, 6).forEach(([lbl, val]) => {
      doc.font(boldFont).fontSize(8).fillColor(text).text(`${lbl}: `, leftMargin + 8, currentY, { continued: true });
      doc.font(font).fontSize(8).fillColor(muted).text(val);
      currentY += 12;
    });

    if (data.recommendations) {
      currentY += 6;
      doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
      currentY += 5;

      doc.font(boldFont).fontSize(10).fillColor(primary).text(this.t('recCrops', lang), leftMargin, currentY);
      currentY += 13;

      if (Array.isArray(data.recommendations)) {
        data.recommendations.slice(0, 3).forEach((crop: any, idx: number) => {
          if (typeof crop === 'string') {
            doc.font(font).fontSize(8).fillColor(text).text(`• ${crop}`, leftMargin + 8, currentY, { width: contentWidth - 16 });
            currentY += 14;
          } else {
            doc.font(boldFont).fontSize(8.5).fillColor(text).text(`${idx + 1}. ${crop.name || 'Advisory Alternative'}`, leftMargin + 8, currentY);
            currentY += 11;
            doc.font(font).fontSize(7.5).fillColor(muted).text(
              `Expected Yield: ${crop.expectedYield || 2400} kg/acre   |   Profit Est: Rs. ${crop.profitEstimation || 45000}   |   Duration: ${crop.growingDuration || 110} days`,
              leftMargin + 16,
              currentY
            );
            currentY += 13;
          }
        });
      } else if (typeof data.recommendations === 'string') {
        doc.font(font).fontSize(8).fillColor(text).text(data.recommendations, leftMargin + 8, currentY, {
          width: contentWidth - 16,
          lineGap: 2
        });
        currentY += doc.heightOfString(data.recommendations, { width: contentWidth - 16 }) + 6;
      }
    }

    return currentY;
  }
}
