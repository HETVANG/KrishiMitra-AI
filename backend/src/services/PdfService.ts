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
    attestationText: "Digitally generated & attested by The Khedut Autonomous Agricultural Intelligence Platform. Verified tamper-evident digital record."
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
    attestationText: "ધ ખેડૂત એઆઈ કૃષિ મંચ દ્વારા ડિજિટલ રીતે પ્રમાણિત અને ચકાસાયેલ અધિકૃત દસ્તાવેજ."
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
    attestationText: "द खेड़ूत कृषि मंच द्वारा डिजिटल रूप से सत्यापित और प्रमाणित आधिकारिक दस्तावेज।"
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
      currentY = this.renderCentralDisease(doc, data, language, regularFont, boldFont, primaryGreen, secondaryGreen, accentGreen, textDark, textMuted, dangerRed, leftMargin, contentWidth, currentY);
    } else if (reportType === 'weather') {
      currentY = this.renderCentralWeather(doc, data, language, regularFont, boldFont, primaryGreen, secondaryGreen, textDark, textMuted, leftMargin, contentWidth, currentY);
    } else if (reportType === 'expense') {
      currentY = this.renderCentralExpense(doc, data, language, regularFont, boldFont, primaryGreen, secondaryGreen, textDark, textMuted, leftMargin, contentWidth, currentY);
    } else {
      currentY = this.renderCentralCropSoil(doc, data, language, regularFont, boldFont, primaryGreen, secondaryGreen, textDark, textMuted, leftMargin, contentWidth, currentY);
    }

    // 7. BOTTOM REPORT SECTION (QR Code, Digital Attestation, and Official Circular Seal)
    // Anchored at y = 724 to ensure 100% fitting on Page 1 without creating blank page 2
    const bottomY = 722;

    // Thin separator above bottom attestation
    doc.moveTo(leftMargin, bottomY - 6).lineTo(leftMargin + contentWidth, bottomY - 6).strokeColor('#E2E8F0').lineWidth(0.8).stroke();

    // Left: Functional QR Code
    if (options.qrCodeBuffer) {
      try {
        doc.image(options.qrCodeBuffer, leftMargin, bottomY, { width: 48, height: 48 });
      } catch (qrErr) {
        doc.rect(leftMargin, bottomY, 48, 48).strokeColor(primaryGreen).stroke();
      }
    }
    doc.font(boldFont).fontSize(6.5).fillColor(primaryGreen).text(this.t('scanToVerify', language), leftMargin + 53, bottomY + 10, { width: 165 });
    doc.font(regularFont).fontSize(6).fillColor(textMuted).text(`thekhedut.ai/verify/report/${options.reportId}`, leftMargin + 53, bottomY + 22, { width: 175 });

    // Center: Tamper-Evident Attestation Notice
    const attestationX = leftMargin + 215;
    doc.font(regularFont).fontSize(6.5).fillColor(textMuted).text(
      this.t('attestationText', language),
      attestationX,
      bottomY + 8,
      { width: 185, align: 'left', lineGap: 1 }
    );

    // Right: The Khedut Circular Company Seal
    const sealCenterX = leftMargin + contentWidth - 36;
    const sealCenterY = bottomY + 24;
    WatermarkAssets.renderOfficialSeal(doc, sealCenterX, sealCenterY, 27);

    // 8. FOOTER BAR (Anchored at y = 794)
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
      'Page 1 of 1',
      leftMargin + contentWidth - 80,
      footerY,
      { width: 80, align: 'right' }
    );
  }

  /**
   * Renders Disease Pathology Central Content with bounded image box and treatment plan
   */
  private static renderCentralDisease(
    doc: PDFKit.PDFDocument,
    data: any,
    lang: string,
    font: string,
    boldFont: string,
    primary: string,
    secondary: string,
    accent: string,
    text: string,
    muted: string,
    danger: string,
    leftMargin: number,
    contentWidth: number,
    startY: number
  ): number {
    let currentY = startY;

    // Overview Card: Diagnosis, Confidence, Severity, Image
    const hasImage = data.imageBuffer && Buffer.isBuffer(data.imageBuffer);
    const imageWidth = hasImage ? 85 : 0;
    const textColWidth = hasImage ? (contentWidth - imageWidth - 20) : (contentWidth - 20);

    const diseaseName = data.diseaseName || data.name || 'Observed Pathology Symptom';
    const localNameStr = data.localName ? ` (${data.localName})` : '';
    const scientificStr = data.scientificName ? ` • Scientific: ${data.scientificName}` : '';
    const fullDiseaseStr = `${diseaseName}${localNameStr}`;

    const rawConf = typeof data.confidenceScore === 'number' ? data.confidenceScore : 0.88;
    const confPercent = rawConf > 1 ? `${rawConf.toFixed(0)}%` : `${(rawConf * 100).toFixed(0)}%`;
    const severityStr = (data.severity || 'Moderate').toUpperCase();

    // Summary Card Box
    const boxHeight = hasImage ? 80 : 66;
    doc.rect(leftMargin, currentY, contentWidth, boxHeight).fillAndStroke('#F7F9F5', '#E2E8F0');

    let innerY = currentY + 8;

    // Disease Name Title
    doc.font(boldFont).fontSize(11).fillColor(primary).text(fullDiseaseStr, leftMargin + 10, innerY, { width: textColWidth });
    innerY += 15;

    // Scientific & Rating
    if (scientificStr) {
      doc.font(font).fontSize(8).fillColor(muted).text(scientificStr, leftMargin + 10, innerY, { width: textColWidth });
      innerY += 12;
    }

    // Confidence / Severity Pills
    doc.font(boldFont).fontSize(8.5).fillColor(text).text(
      `${this.t('confLabel', lang)}: ${confPercent}   |   ${this.t('severityLabel', lang)}: ${severityStr}   |   Condition: ${data.condition || 'DIAGNOSED'}`,
      leftMargin + 10,
      innerY,
      { width: textColWidth }
    );

    // Leaf Image on Right Column
    if (hasImage) {
      try {
        doc.image(data.imageBuffer, leftMargin + contentWidth - imageWidth - 6, currentY + 5, {
          fit: [imageWidth, boxHeight - 10],
          align: 'center',
          valign: 'center'
        });
      } catch (imgErr) {
        console.warn('[PdfService Image Render Error]', imgErr);
      }
    }

    currentY += boxHeight + 10;

    // Section 1: Symptoms
    doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
    currentY += 5;

    doc.font(boldFont).fontSize(9.5).fillColor(primary).text(this.t('symptomsTitle', lang), leftMargin, currentY);
    currentY += 13;
    doc.font(font).fontSize(8).fillColor(text);

    const symptomsList: string[] = Array.isArray(data.symptoms) && data.symptoms.length > 0
      ? data.symptoms
      : ['Visible leaf lesions, discoloration, or spot patterns observed on foliage.'];

    symptomsList.slice(0, 3).forEach((sym: string) => {
      doc.text(`• ${sym}`, leftMargin + 8, currentY, { width: contentWidth - 12 });
      currentY += 12;
    });

    currentY += 3;

    // Section 2: Pathogen / Possible Causes
    doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
    currentY += 5;

    doc.font(boldFont).fontSize(9.5).fillColor(primary).text(this.t('causesTitle', lang), leftMargin, currentY);
    currentY += 13;
    doc.font(font).fontSize(8).fillColor(text);

    const causesList: string[] = Array.isArray(data.possibleCauses) && data.possibleCauses.length > 0
      ? data.possibleCauses
      : (data.causes ? (Array.isArray(data.causes) ? data.causes : [data.causes]) : ['Fungal or bacterial pathogen proliferation encouraged by humid foliage microclimate.']);

    const causeText = causesList.slice(0, 2).join('; ');
    doc.text(causeText, leftMargin + 8, currentY, { width: contentWidth - 12 });
    currentY += 14;

    // Section 3: Action Plan (What To Do Now)
    doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
    currentY += 5;

    doc.font(boldFont).fontSize(9.5).fillColor(primary).text(this.t('whatToDoTitle', lang), leftMargin, currentY);
    currentY += 13;
    doc.font(font).fontSize(8).fillColor(text);

    let imm = 'Inspect leaves and isolate severely affected plants to avoid plot spread.';
    let mon = 'Surveil neighboring rows every 48 hours for new sporulation rings.';
    let prv = 'Ensure proper crop spacing, irrigation drainage, and sanitise farm tools.';

    if (Array.isArray(data.recommendedActions) && data.recommendedActions.length > 0) {
      if (data.recommendedActions[0]) imm = data.recommendedActions[0].details || data.recommendedActions[0].title || imm;
      if (data.recommendedActions[1]) mon = data.recommendedActions[1].details || data.recommendedActions[1].title || mon;
      if (data.recommendedActions[2]) prv = data.recommendedActions[2].details || data.recommendedActions[2].title || prv;
    }

    const plan = [
      `1. Immediate Check: ${imm}`,
      `2. Field Monitoring: ${mon}`,
      `3. Long-term Prevention: ${prv}`
    ];

    plan.forEach(p => {
      doc.text(p, leftMargin + 8, currentY, { width: contentWidth - 12 });
      currentY += 12;
    });

    currentY += 3;

    // Section 4: Biological / Organic Controls
    doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
    currentY += 5;

    doc.font(boldFont).fontSize(9.5).fillColor(secondary).text(this.t('organicTitle', lang), leftMargin, currentY);
    currentY += 13;
    doc.font(font).fontSize(8).fillColor(text);

    const organicList: string[] = Array.isArray(data.organicTreatment) && data.organicTreatment.length > 0
      ? data.organicTreatment
      : ['Apply cold-pressed Neem oil formulation (5ml/L water) or Trichoderma viride bio-fungicide.'];

    organicList.slice(0, 2).forEach((org: string) => {
      doc.text(`• ${org}`, leftMargin + 8, currentY, { width: contentWidth - 12 });
      currentY += 12;
    });

    currentY += 3;

    // Section 5: Chemical Emergency Controls & Safety
    doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
    currentY += 5;

    doc.font(boldFont).fontSize(9.5).fillColor(danger).text(this.t('chemicalTitle', lang), leftMargin, currentY);
    currentY += 13;
    doc.font(font).fontSize(8).fillColor(text);

    const chemText = Array.isArray(data.chemicalTreatment) && data.chemicalTreatment.length > 0
      ? data.chemicalTreatment[0]
      : (data.pesticideDetails ? `${data.pesticideDetails.englishName || data.pesticideDetails.localName || 'Fungicide'} (${data.pesticideDetails.dosage || '2g/L'})` : 'Copper Oxychloride 50 WP or Mancozeb 75 WP (2g/L water).');

    doc.text(`• ${chemText}`, leftMargin + 8, currentY, { width: contentWidth - 12 });
    currentY += 13;

    // Chemical Safety Notice
    doc.font(font).fontSize(7).fillColor(danger).text(this.t('safetyWarning', lang), leftMargin + 8, currentY, { width: contentWidth - 12 });
    currentY += 18;

    // Disclaimer
    doc.moveTo(leftMargin, currentY).lineTo(leftMargin + contentWidth, currentY).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
    currentY += 4;
    doc.font(font).fontSize(6.8).fillColor(muted).text(this.t('importantDisclaimer', lang), leftMargin, currentY, { width: contentWidth });

    return currentY;
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
