import PDFDocument from 'pdfkit';
import { Response } from 'express';
import fs from 'fs';

// Complete dictionary for PDF layout labels across 12 languages
const pdfTranslations: Record<string, Record<string, string>> = {
  en: {
    subtitle: "Smart Agriculture Platform - Digital Soil & Yield Report",
    generated: "Generated",
    cropReport: "CROP STATEMENT REPORT",
    weatherReport: "WEATHER STATEMENT REPORT",
    diseaseReport: "DISEASE DIAGNOSIS REPORT",
    expenseReport: "EXPENSE STATEMENT REPORT",
    pathologyTitle: "AI Leaf Pathology Diagnosis",
    cropLabel: "Crop",
    diseaseLabel: "Disease Detected",
    confLabel: "Confidence",
    severityLabel: "Severity",
    scanDateLabel: "Date",
    symptomsTitle: "SYMPTOMS",
    causesTitle: "POSSIBLE CAUSE",
    whatToDoTitle: "WHAT TO DO NOW",
    organicTitle: "BIOLOGICAL / ORGANIC OPTIONS",
    chemicalTitle: "CHEMICAL CONTROL",
    safetyWarning: "Safety Warning: Use protective gear while spraying chemicals. Consult local agricultural extension officer.",
    importantDisclaimer: "IMPORTANT: This report is an AI-generated advisory. Verify symptoms in the field before applying chemical treatment.",
    farmerCompanion: "THE KHEDUT - Smart Agriculture Platform",
    farmDetails: "Farm Details",
    recCrops: "Recommended Crops",
    yield: "Expected Yield",
    profit: "Estimated Profit",
    duration: "Growing Duration",
    risk: "Risk Level",
    recommendation: "AI Recommendation",
    weatherConditions: "Current Meteorological Conditions",
    temp: "Current Temperature",
    humidity: "Atmospheric Humidity",
    wind: "Wind Speed velocity",
    aqi: "Air Quality Index (AQI)",
    sky: "General Weather Sky",
    alerts: "Weather System Alerts",
    advisory: "AI Agricultural Advisory",
    diagSummary: "Diagnosis Summary",
    diagDisease: "Diagnosed Disease",
    conf: "Confidence Rating",
    symptoms: "Observed Leaf Symptoms",
    organic: "Organic Treatments (Recommended)",
    chemical: "Chemical Emergency Treatments",
    ledger: "Financial Ledger",
    revenue: "Total Farm Revenue",
    expenses: "Total Farm Expenses",
    netProfit: "Net Ledger Profit",
    txLogs: "Transaction Logs List",
    date: "Date",
    type: "Type",
    category: "Category",
    amount: "Amount (Rs)",
    description: "Description",
    footer: "© 2026 THE KHEDUT. This is a computer-generated summary advisory report."
  },
  hi: {
    subtitle: "स्मार्ट कृषि मंच - डिजिटल मिट्टी और उपज रिपोर्ट",
    generated: "जारी किया गया",
    cropReport: "फसल विवरण रिपोर्ट",
    weatherReport: "मौसम विवरण रिपोर्ट",
    diseaseReport: "पत्ती रोग निदान रिपोर्ट",
    expenseReport: "वित्तीय बहीखाता रिपोर्ट",
    pathologyTitle: "एआई पत्ती रोग निदान",
    cropLabel: "फसल",
    diseaseLabel: "पहचाना गया रोग",
    confLabel: "विश्वास दर",
    severityLabel: "गंभीरता",
    scanDateLabel: "तारीख",
    symptomsTitle: "लक्षण",
    causesTitle: "संभावित कारण",
    whatToDoTitle: "अब क्या करें",
    organicTitle: "जैविक / ऑर्गेनिक विकल्प",
    chemicalTitle: "रासायनिक नियंत्रण",
    safetyWarning: "सुरक्षा चेतावनी: रसायनों का छिड़काव करते समय सुरक्षात्मक गियर का उपयोग करें। स्थानीय कृषि विस्तार अधिकारी से परामर्श लें।",
    importantDisclaimer: "महत्वपूर्ण: यह रिपोर्ट एक एआई-जनरेटेड सलाह है। कृपया रासायनिक उपचार से पहले खेत में लक्षणों की पुष्टि करें।",
    farmerCompanion: "THE KHEDUT - किसान साथी",
    farmDetails: "खेत का विवरण",
    recCrops: "अनुशंसित फसलें",
    yield: "अपेक्षित उपज",
    profit: "अनुमानित लाभ",
    duration: "बढ़ने की अवधि",
    risk: "जोखिम स्तर",
    recommendation: "एआई सिफारिश सलाह",
    weatherConditions: "वर्तमान मौसम की स्थिति",
    temp: "वर्तमान तापमान",
    humidity: "वायुमंडलीय आर्द्रता",
    wind: "हवा की गति",
    aqi: "वायु गुणवत्ता सूचकांक (AQI)",
    sky: "सामान्य मौसम आसमान",
    alerts: "मौसम चेतावनी प्रणाली",
    advisory: "एआई कृषि सलाहकार सलाह",
    diagSummary: "निदान सारांश विवरण",
    diagDisease: "पहचाना गया रोग",
    conf: "विश्वास दर",
    symptoms: "देखे गए पत्ती के लक्षण",
    organic: "जैविक उपचार (अनुशंसित)",
    chemical: "रासायनिक आपातकालीन उपचार",
    ledger: "वित्तीय बहीखाता विवरण",
    revenue: "कुल कृषि राजस्व",
    expenses: "कुल कृषि खर्च",
    netProfit: "शुद्ध लाभ संतुलन",
    txLogs: "लेनदेन रिकॉर्ड सूची",
    date: "तारीख",
    type: "प्रकार",
    category: "श्रेणी",
    amount: "राशि (रुपये)",
    description: "विवरण",
    footer: "© 2026 THE KHEDUT। यह एक कंप्यूटर जनित सलाह रिपोर्ट है।"
  },
  gu: {
    subtitle: "સ્માર્ટ કૃષિ મંચ - ડિજિટલ જમીન અને પાક અહેવાલ",
    generated: "અહેવાલ સમય",
    cropReport: "પાક ભલામણ અહેવાલ",
    weatherReport: "હવામાન પત્રક અહેવાલ",
    diseaseReport: "રોગ નિદાન પત્રક અહેવાલ",
    expenseReport: "નાણાકીય ખર્ચ પત્રક અહેવાલ",
    pathologyTitle: "એઆઈ પાંદડાં રોગ નિદાન",
    cropLabel: "પાક",
    diseaseLabel: "નિદાન કરેલ રોગ",
    confLabel: "વિશ્વાસ સ્તર",
    severityLabel: "ગંભીરતા",
    scanDateLabel: "તારીખ",
    symptomsTitle: "લક્ષણો",
    causesTitle: "શક્ય કારણો",
    whatToDoTitle: "હવે શું કરવું",
    organicTitle: "જૈવિક / ઓર્ગેનિક વિકલ્પો",
    chemicalTitle: "રાસાયણિક નિયંત્રણ",
    safetyWarning: "સુરક્ષા ચેતવણી: રસાયણોનો છંટકાવ કરતી વખતે રક્ષણાત્મક સાધનોનો ઉપયોગ કરો. સ્થાનિક કૃષિ અધિકારીની સલાહ લો.",
    importantDisclaimer: "મહત્વપૂર્ણ: આ રિપોર્ટ એઆઈ દ્વારા જનરેટ કરેલ માર્ગદર્શિકા છે. રાસાયણિક સારવાર કરતા પહેલા ખેતરમાં તપાસ કરો.",
    farmerCompanion: "ધ ખેડૂત (THE KHEDUT) - ખેડૂત સાથી",
    farmDetails: "ખેતરની વિગતો",
    recCrops: "ભલામણ કરેલ પાકો",
    yield: "અપેક્ષિત ઉત્પાદન",
    profit: "અંદાજિત નફો",
    duration: "પાકનો સમયગાળો",
    risk: "જોખમનું સ્તર",
    recommendation: "એઆઈ પાક ભલામણ",
    weatherConditions: "વર્તમાન હવામાન પરિસ્થિતિ",
    temp: "વર્તમાન તાપમાન",
    humidity: "હવામાન ભેજ",
    wind: "પવનની ઝડપ",
    aqi: "હવાની ગુણવત્તા (AQI)",
    sky: "સામાન્ય આકાશ",
    alerts: "હવામાન ચેતવણી સિસ્ટમ",
    advisory: "એઆઈ કૃષિ માર્ગદર્શિકા",
    diagSummary: "રોગ નિદાન સારાંશ",
    diagDisease: "નિદાન કરેલ રોગ",
    conf: "વિશ્વાસ સ્તર",
    symptoms: "પાન પર જોવા મળતા લક્ષણો",
    organic: "જૈવિક ઉપચાર (ભલામણ કરેલ)",
    chemical: "રાસાયણિક કટોકટી સારવાર",
    ledger: "નાણાકીય ખાતાવહી",
    revenue: "કુલ ખેતી આવક",
    expenses: "કુલ ખેતી ખર્ચ",
    netProfit: "ચોખ્ખો નફો",
    txLogs: "લેવડ-દેવડ પત્રક વિગત",
    date: "તારીખ",
    type: "प्रકાર",
    category: "શ્રેણી",
    amount: "રકમ (રૂ)",
    description: "વર્ણન",
    footer: "© ૨૦૨૬ THE KHEDUT. આ કમ્પ્યુટર દ્વારા બનાવેલ રિપોર્ટ છે."
  },
  mr: {
    subtitle: "स्मार्ट कृषी मंच - डिजिटल माती आणि पीक अहवाल",
    generated: "अहवाल वेळ",
    cropReport: "पीक शिफारस अहवाल",
    weatherReport: "हवामान अहवाल पत्रक",
    diseaseReport: "पान रोग निदान अहवाल",
    expenseReport: "खर्च आणि आर्थिक अहवाल",
    pathologyTitle: "एआय पान रोग निदान",
    cropLabel: "पीक",
    diseaseLabel: "निदान झालेला रोग",
    confLabel: "विश्वास पातळी",
    severityLabel: "तीव्रता",
    scanDateLabel: "दिनांक",
    symptomsTitle: "लक्षणे",
    causesTitle: "संभाव्य कारणे",
    whatToDoTitle: "आता काय करावे",
    organicTitle: "जैविक / सेंद्रिय पर्याय",
    chemicalTitle: "रासायनिक नियंत्रण",
    safetyWarning: "सुरक्षा इशारा: रसायनांची फवारणी करताना संरक्षक साधने वापरा. स्थानिक कृषी अधिकाऱ्याचा सल्ला घ्या.",
    importantDisclaimer: "महत्त्वाचे: हा अहवाल एक एआय-जनरेट केलेला सल्ला आहे. कृपया रासायनिक उपचारापूर्वी शेतात लक्षणे तपासा.",
    farmerCompanion: "THE KHEDUT - शेतकरी मित्र",
    farmDetails: "शेताचा तपशील",
    recCrops: "शिफारस केलेली पिके",
    yield: "अपेक्षित उत्पन्न",
    profit: "अंदाजित नफा",
    duration: "वाढीचा कालावधी",
    risk: "धोका पातळी",
    recommendation: "एआय शिफारस सल्ला",
    weatherConditions: "सध्याची हवामान स्थिती",
    temp: "सध्याचे तापमान",
    humidity: "हवेतील आर्द्रता",
    wind: "वाऱ्याचा वेग",
    aqi: "हवेची गुणवत्ता (AQI)",
    sky: "हवेचे वातावरण",
    alerts: "हवामान इशारा प्रणाली",
    advisory: "एआय कृषी सल्ला",
    diagSummary: "रोग निदान सारांश",
    diagDisease: "निदान झालेला रोग",
    conf: "विश्वास पातळी",
    symptoms: "पानावरील लक्षणे",
    organic: "सेंद्रिय उपचार (शिफारस केलेले)",
    chemical: "रासायनिक तातडीचे उपचार",
    ledger: "आर्थिक वहीखाते",
    revenue: "एकूण शेती उत्पन्न",
    expenses: "एकूण शेती खर्च",
    netProfit: "निव्वळ नफा",
    txLogs: "व्यवहार नोंदींची यादी",
    date: "दिनांक",
    type: "प्रकार",
    category: "वर्ग",
    amount: "रक्कम (रु)",
    description: "वर्णन",
    footer: "© २०२६ कृषिमित्र एआय. हा संगणक जन्य सल्ला अहवाल आहे."
  }
};

import path from 'path';

export interface PdfReportOptions {
  reportId?: string;
  farmerName?: string;
  farmerEmail?: string;
  farmerLocation?: string;
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

  /**
   * Generates a PDF Report as an in-memory Buffer in the selected language
   */
  static generateReportBuffer(
    reportType: 'crop' | 'weather' | 'disease' | 'expense',
    data: any,
    language: string = 'en',
    options?: PdfReportOptions
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 35, bottom: 35, left: 35, right: 35 },
          autoFirstPage: true
        });

        const buffers: Buffer[] = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', err => reject(err));

        this.buildPdfDocument(doc, reportType, data, language, options);
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates a PDF Report directly to an Express HTTP Response in the selected language
   */
  static generateReport(
    res: Response,
    reportType: 'crop' | 'weather' | 'disease' | 'expense',
    data: any,
    language: string = 'en',
    options?: PdfReportOptions
  ): void {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 35, bottom: 35, left: 35, right: 35 },
      autoFirstPage: true
    });

    doc.pipe(res);
    this.buildPdfDocument(doc, reportType, data, language, options);
    doc.end();
  }

  private static buildPdfDocument(
    doc: PDFKit.PDFDocument,
    reportType: 'crop' | 'weather' | 'disease' | 'expense',
    data: any,
    language: string,
    options?: PdfReportOptions
  ): void {
    // Official Brand Palette
    const primaryColor = '#245B38';   // Deep Crop Emerald
    const secondaryColor = '#4F8A4B'; // Leaf Green
    const accentColor = '#A5C96A';    // Harvest Accent
    const textColor = '#1D2922';      // Deep Soil Text
    const mutedColor = '#475569';     // Slate 600

    // Register Canonical Unicode Fonts (Nirmala UI) for English, Gujarati, Hindi, Marathi
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

    // Render subtle background watermark
    try {
      doc.save();
      doc.opacity(0.035);
      doc.font(boldFont).fontSize(54).fillColor(primaryColor);
      doc.text('THE KHEDUT', 50, 380, { align: 'center', width: 495.28 });
      doc.restore();
    } catch (wmErr) {
      // Non-critical watermark
    }

    if (reportType === 'disease') {
      this.renderDiseaseSection(doc, data, language, regularFont, boldFont, primaryColor, secondaryColor, accentColor, textColor, mutedColor, options);
      return;
    }

    const pageWidth = 595.28;
    const leftMargin = 35;
    const contentWidth = pageWidth - (leftMargin * 2);

    // Header Banner
    doc.rect(0, 0, pageWidth, 90).fill(primaryColor);

    // Accent line at bottom of header
    doc.rect(0, 88, pageWidth, 2).fill(accentColor);

    // Brand Title & Tagline
    doc.font(boldFont).fillColor('#FFFFFF').fontSize(22).text('THE KHEDUT', leftMargin, 20);
    doc.font(regularFont).fontSize(9.5).fillColor('#E2E8F0').text('Smart Agriculture. Better Decisions.', leftMargin, 48);
    doc.font(regularFont).fontSize(8.5).fillColor('#CBD5E1').text(this.t('subtitle', language), leftMargin, 63);

    // Header Right Info: Report ID & Generation Date
    const reportDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const repIdStr = options?.reportId ? `ID: ${options.reportId}` : `ID: REP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

    doc.font(boldFont).fontSize(8.5).fillColor('#FFFFFF').text(repIdStr, pageWidth - leftMargin - 220, 24, { align: 'right', width: 220 });
    doc.font(regularFont).fontSize(8).fillColor('#E2E8F0').text(`${this.t('generated', language)}: ${reportDate}`, pageWidth - leftMargin - 220, 42, { align: 'right', width: 220 });

    if (options?.farmerName) {
      doc.font(regularFont).fontSize(8).fillColor('#CBD5E1').text(`Farmer: ${options.farmerName}`, pageWidth - leftMargin - 220, 58, { align: 'right', width: 220 });
    }

    // Document Body Header
    doc.y = 110;
    doc.fillColor(textColor);

    let reportTitleKey = 'cropReport';
    if (reportType === 'weather') reportTitleKey = 'weatherReport';
    else if (reportType === 'expense') reportTitleKey = 'expenseReport';

    doc.font(boldFont).fontSize(13).fillColor(primaryColor).text(this.t(reportTitleKey, language), leftMargin, 110);
    doc.moveTo(leftMargin, 128).lineTo(leftMargin + contentWidth, 128).strokeColor(accentColor).lineWidth(1.5).stroke();

    doc.y = 142;
    doc.font(regularFont).fontSize(9.5).fillColor(mutedColor);

    // Route section rendering
    switch (reportType) {
      case 'crop':
        this.renderCropSection(doc, data, language, regularFont, boldFont, primaryColor, textColor, mutedColor);
        break;
      case 'weather':
        this.renderWeatherSection(doc, data, language, regularFont, boldFont, primaryColor, textColor, mutedColor);
        break;
      case 'expense':
        this.renderExpenseSection(doc, data, language, regularFont, boldFont, primaryColor, textColor, mutedColor);
        break;
      default:
        doc.text('Invalid report selection.');
    }

    // Footer
    const footerY = 800;
    doc.moveTo(leftMargin, footerY - 10).lineTo(leftMargin + contentWidth, footerY - 10).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
    doc.font(regularFont).fontSize(7.5).fillColor(mutedColor).text(
      `THE KHEDUT • Smart Agriculture. Better Decisions. • ${this.t('footer', language)}`,
      leftMargin,
      footerY,
      { align: 'center', width: contentWidth }
    );
  }

  private static renderCropSection(doc: PDFKit.PDFDocument, data: any, lang: string, font: string, boldFont: string, primary: string, text: string, secondary: string) {
    doc.font(boldFont).fontSize(12).fillColor(primary).text(this.t('farmDetails', lang), 50, doc.y);
    doc.y += 10;
    doc.font(font).fontSize(10).fillColor(text);
    
    const details = [
      ['Farm Name', data.farmName || 'N/A'],
      ['Farm Size', `${data.farmSize || 'N/A'} Acres`],
      ['Soil Type', data.soilType || 'N/A'],
      ['Water Source', data.waterSource || 'N/A'],
    ];

    details.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 60, doc.y);
      doc.y += 15;
    });

    if (data.recommendations && data.recommendations.length > 0) {
      doc.y += 15;
      doc.font(boldFont).fontSize(12).fillColor(primary).text(this.t('recCrops', lang), 50, doc.y);
      doc.y += 10;

      data.recommendations.forEach((crop: any, index: number) => {
        doc.font(boldFont).fontSize(11).fillColor(text).text(`${index + 1}. ${crop.name}`, 50, doc.y);
        doc.y += 5;
        doc.font(font).fontSize(9).fillColor(secondary);
        doc.text(`${this.t('yield', lang)}: ${crop.expectedYield} kg | ${this.t('profit', lang)}: Rs. ${crop.profitEstimation}`, 65, doc.y);
        doc.y += 12;
        doc.text(`${this.t('duration', lang)}: ${crop.growingDuration} days | ${this.t('risk', lang)}: ${crop.riskLevel}`, 65, doc.y);
        doc.y += 12;
        doc.text(`${this.t('recommendation', lang)}: ${crop.description}`, 65, doc.y, { width: 450 });
        doc.y += 20;
      });
    }
  }

  private static renderWeatherSection(doc: PDFKit.PDFDocument, data: any, lang: string, font: string, boldFont: string, primary: string, text: string, secondary: string) {
    doc.font(boldFont).fontSize(12).fillColor(primary).text(this.t('weatherConditions', lang), 50, doc.y);
    doc.y += 10;
    doc.font(font).fontSize(10).fillColor(text);

    const weatherFields = [
      [this.t('temp', lang), `${data.current?.temp || 'N/A'}°C`],
      [this.t('humidity', lang), `${data.current?.humidity || 'N/A'}%`],
      [this.t('wind', lang), `${data.current?.windSpeed || 'N/A'} m/s`],
      [this.t('aqi', lang), `${data.current?.aqi || 'N/A'} (Good)`],
      [this.t('sky', lang), data.current?.description || 'N/A'],
    ];

    weatherFields.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 60, doc.y);
      doc.y += 15;
    });

    if (data.aiAdvice) {
      doc.y += 15;
      doc.font(boldFont).fontSize(12).fillColor(primary).text(this.t('advisory', lang), 50, doc.y);
      doc.y += 8;
      doc.font(font).fontSize(10).fillColor(text).text(data.aiAdvice, 50, doc.y, { width: 480 });
    }
  }

  private static renderDiseaseSection(
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
    options?: PdfReportOptions
  ) {
    try {
      // 1-PAGE FARMER-FRIENDLY DISEASE REPORT LAYOUT
      const pageWidth = 595.28;
      const leftMargin = 35;
      const contentWidth = pageWidth - (leftMargin * 2);

      // 1. TOP HEADER BANNER (Height: 70)
      doc.rect(0, 0, pageWidth, 70).fill(primary);
      doc.rect(0, 68, pageWidth, 2).fill(accent);

      // Title at Top Left
      doc.font(boldFont).fillColor('#FFFFFF').fontSize(18).text('THE KHEDUT', leftMargin, 12);
      doc.font(font).fontSize(8.5).fillColor('#E2E8F0').text('Smart Agriculture. Better Decisions.', leftMargin, 34);
      doc.font(font).fontSize(9.5).fillColor('#FFFFFF').text(this.t('pathologyTitle', lang), leftMargin, 48, {
        width: contentWidth - 220
      });

      // Right Column: Report ID & Generation Date
      const repIdStr = options?.reportId ? `ID: ${options.reportId}` : `ID: REP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
      const formattedDate = data.scanDate ? new Date(data.scanDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      doc.font(boldFont).fontSize(8.5).fillColor('#FFFFFF').text(repIdStr, pageWidth - leftMargin - 220, 14, {
        align: 'right',
        width: 220
      });
      doc.font(font).fontSize(8).fillColor('#E2E8F0').text(`${this.t('scanDateLabel', lang)}: ${formattedDate}`, pageWidth - leftMargin - 220, 29, {
        align: 'right',
        width: 220
      });

      if (options?.farmerName) {
        doc.font(font).fontSize(8).fillColor('#CBD5E1').text(`Farmer: ${options.farmerName}`, pageWidth - leftMargin - 220, 44, {
          align: 'right',
          width: 220
        });
      }

      let currentY = 82;

      // 2. ISOLATED SUMMARY OVERVIEW BOX (Text Column vs Image Column)
      const hasImage = data.imageBuffer && Buffer.isBuffer(data.imageBuffer);
      const imageWidth = hasImage ? 85 : 0;
      const textColWidth = hasImage ? (contentWidth - imageWidth - 20) : (contentWidth - 20);

      const cropName = data.crop || 'Crop Leaf';
      const diseaseName = data.diseaseName || data.name || 'Observed Pathology Symptom';
      const localNameStr = data.localName ? ` (${data.localName})` : '';
      const fullDiseaseStr = `${diseaseName}${localNameStr}`;
      
      const rawConf = typeof data.confidenceScore === 'number' ? data.confidenceScore : 0.85;
      const confPercent = rawConf > 1 ? `${rawConf.toFixed(0)}%` : `${(rawConf * 100).toFixed(0)}%`;
      const severityStr = (data.severity || 'Moderate').toUpperCase();

      // Calculate dynamic text height inside box
      doc.font(boldFont).fontSize(9.5);
      const diseaseLabelW = doc.widthOfString(`${this.t('diseaseLabel', lang)}: `);
      
      doc.font(font).fontSize(9.5);
      const diseaseValHeight = doc.heightOfString(fullDiseaseStr, { width: textColWidth - diseaseLabelW });

      const metricsStr = `${this.t('confLabel', lang)}: ${confPercent}   |   ${this.t('severityLabel', lang)}: ${severityStr}   |   ${this.t('scanDateLabel', lang)}: ${formattedDate}`;
      const metricsHeight = doc.heightOfString(metricsStr, { width: textColWidth });

      const summaryContentHeight = 10 + 14 + diseaseValHeight + 6 + metricsHeight + 10;
      const boxHeight = Math.max(summaryContentHeight, hasImage ? 85 : 65);

      // Render summary card background (#F7F9F5 canvas with subtle border)
      doc.rect(leftMargin, currentY, contentWidth, boxHeight).fillAndStroke('#F7F9F5', '#E2E8F0');

      // Render Text Column
      let innerY = currentY + 10;

      // Row 1: Crop
      doc.font(boldFont).fillColor(text).fontSize(9.5).text(`${this.t('cropLabel', lang)}: `, leftMargin + 10, innerY, { continued: true });
      doc.font(font).fontSize(9.5).text(cropName);
      innerY += 15;

      // Row 2: Disease Name
      doc.font(boldFont).fillColor(text).fontSize(9.5).text(`${this.t('diseaseLabel', lang)}: `, leftMargin + 10, innerY, { continued: true });
      doc.font(font).fontSize(9.5).text(fullDiseaseStr, { width: textColWidth });
      innerY += Math.max(diseaseValHeight, 14) + 6;

      // Row 3: Confidence / Severity / Date Metrics
      doc.font(font).fillColor(muted).fontSize(8.5).text(metricsStr, leftMargin + 10, innerY, { width: textColWidth });

      // Optional Leaf Image on RIGHT Column
      if (hasImage) {
        try {
          doc.image(data.imageBuffer, leftMargin + contentWidth - imageWidth - 5, currentY + 5, {
            fit: [imageWidth, boxHeight - 10],
            align: 'center',
            valign: 'center'
          });
        } catch (imgErr) {
          console.warn('[PdfService Image Warning] Could not render leaf image:', imgErr);
        }
      }

      currentY += boxHeight + 10;

      // Section Helpers
      const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > 770) {
          doc.addPage();
          currentY = 40;
        }
      };

      const renderSectionDivider = (yPos: number) => {
        doc.moveTo(leftMargin, yPos).lineTo(leftMargin + contentWidth, yPos).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
      };

      // 1. SYMPTOMS SECTION
      checkPageBreak(50);
      renderSectionDivider(currentY);
      currentY += 5;

      doc.font(boldFont).fontSize(10).fillColor(primary).text(this.t('symptomsTitle', lang), leftMargin, currentY);
      currentY += 13;
      doc.font(font).fontSize(8.5).fillColor(text);

      const symptomsList: string[] = Array.isArray(data.symptoms) && data.symptoms.length > 0
        ? data.symptoms
        : [data.symptoms || 'Visible leaf lesions, discoloration, or spot patterns observed on foliage.'];

      symptomsList.slice(0, 3).forEach((sym: string) => {
        const textH = doc.heightOfString(`• ${sym}`, { width: contentWidth - 15 });
        doc.text(`• ${sym}`, leftMargin + 10, currentY, { width: contentWidth - 15 });
        currentY += Math.max(textH, 11) + 2;
      });

      currentY += 3;

      // 2. POSSIBLE CAUSE SECTION
      checkPageBreak(40);
      renderSectionDivider(currentY);
      currentY += 5;

      doc.font(boldFont).fontSize(10).fillColor(primary).text(this.t('causesTitle', lang), leftMargin, currentY);
      currentY += 13;
      doc.font(font).fontSize(8.5).fillColor(text);

      const causesList: string[] = Array.isArray(data.possibleCauses) && data.possibleCauses.length > 0
        ? data.possibleCauses
        : (data.causes ? (Array.isArray(data.causes) ? data.causes : [data.causes]) : ['Fungal or bacterial pathogen proliferation encouraged by warm, humid foliage microclimate.']);

      const causeText = causesList.slice(0, 2).join('; ');
      const causeH = doc.heightOfString(causeText, { width: contentWidth - 15 });
      doc.text(causeText, leftMargin + 10, currentY, { width: contentWidth - 15 });
      currentY += Math.max(causeH, 11) + 5;

      // 3. WHAT TO DO NOW SECTION
      checkPageBreak(60);
      renderSectionDivider(currentY);
      currentY += 5;

      doc.font(boldFont).fontSize(10).fillColor(primary).text(this.t('whatToDoTitle', lang), leftMargin, currentY);
      currentY += 13;
      doc.font(font).fontSize(8.5).fillColor(text);

      let immediateAction = 'Inspect infected leaves immediately and isolate severely affected plants.';
      let monitoringAction = 'Monitor neighboring field rows daily for spreading leaf spots.';
      let preventionAction = 'Ensure proper row spacing, drainage, and clear plant debris after harvest.';

      if (Array.isArray(data.recommendedActions) && data.recommendedActions.length > 0) {
        if (data.recommendedActions[0]) immediateAction = data.recommendedActions[0].details || data.recommendedActions[0].title || immediateAction;
        if (data.recommendedActions[1]) monitoringAction = data.recommendedActions[1].details || data.recommendedActions[1].title || monitoringAction;
        if (data.recommendedActions[2]) preventionAction = data.recommendedActions[2].details || data.recommendedActions[2].title || preventionAction;
      }

      const actions = [
        `1. Immediate: ${immediateAction}`,
        `2. Monitor: ${monitoringAction}`,
        `3. Prevent: ${preventionAction}`
      ];

      actions.forEach((act: string) => {
        const actH = doc.heightOfString(act, { width: contentWidth - 15 });
        doc.text(act, leftMargin + 10, currentY, { width: contentWidth - 15 });
        currentY += Math.max(actH, 11) + 2;
      });

      currentY += 3;

      // 4. BIOLOGICAL / ORGANIC OPTIONS
      checkPageBreak(40);
      renderSectionDivider(currentY);
      currentY += 5;

      doc.font(boldFont).fontSize(10).fillColor(secondary).text(this.t('organicTitle', lang), leftMargin, currentY);
      currentY += 13;
      doc.font(font).fontSize(8.5).fillColor(text);

      const organicList: string[] = Array.isArray(data.organicTreatment) && data.organicTreatment.length > 0
        ? data.organicTreatment
        : ['Spray Neem oil formulation (5ml/L water) or Trichoderma viride bio-fungicide.'];

      organicList.slice(0, 2).forEach((org: string) => {
        const orgH = doc.heightOfString(`• ${org}`, { width: contentWidth - 15 });
        doc.text(`• ${org}`, leftMargin + 10, currentY, { width: contentWidth - 15 });
        currentY += Math.max(orgH, 11) + 2;
      });

      currentY += 3;

      // 5. CHEMICAL CONTROL
      checkPageBreak(50);
      renderSectionDivider(currentY);
      currentY += 5;

      doc.font(boldFont).fontSize(10).fillColor('#DC2626').text(this.t('chemicalTitle', lang), leftMargin, currentY);
      currentY += 13;
      doc.font(font).fontSize(8.5).fillColor(text);

      const chemicalList: string[] = Array.isArray(data.chemicalTreatment) && data.chemicalTreatment.length > 0
        ? data.chemicalTreatment
        : (data.pesticideDetails ? [`${data.pesticideDetails.englishName || data.pesticideDetails.localName || 'Fungicide spray'} (${data.pesticideDetails.dosage || '2g/L'})`] : ['Copper Oxychloride or Mancozeb spray if infection exceeds 15% threshold.']);

      const chemH = doc.heightOfString(`• ${chemicalList[0]}`, { width: contentWidth - 15 });
      doc.text(`• ${chemicalList[0]}`, leftMargin + 10, currentY, { width: contentWidth - 15 });
      currentY += Math.max(chemH, 11) + 3;

      doc.font(font).fontSize(7.5).fillColor('#DC2626');
      const warnH = doc.heightOfString(this.t('safetyWarning', lang), { width: contentWidth - 15 });
      doc.text(this.t('safetyWarning', lang), leftMargin + 10, currentY, { width: contentWidth - 15 });
      currentY += Math.max(warnH, 9) + 4;

      // 6. IMPORTANT ADVISORY DISCLAIMER
      checkPageBreak(25);
      renderSectionDivider(currentY);
      currentY += 5;
      doc.font(font).fontSize(7.5).fillColor(muted);
      const discH = doc.heightOfString(this.t('importantDisclaimer', lang), { width: contentWidth });
      doc.text(this.t('importantDisclaimer', lang), leftMargin, currentY, { width: contentWidth });

      // 7. FOOTER AT BOTTOM OF PAGE 1 (Fixed at y = 780)
      doc.moveTo(leftMargin, 775).lineTo(leftMargin + contentWidth, 775).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
      doc.font(boldFont).fontSize(8).fillColor(primary).text(
        `THE KHEDUT • Smart Agriculture. Better Decisions. • ${this.t('farmerCompanion', lang)}`,
        leftMargin,
        780,
        {
          align: 'center',
          width: contentWidth
        }
      );

    } catch (renderErr) {
      console.error('[PdfService renderDiseaseSection Error]', renderErr);
      doc.fontSize(10).fillColor('#DC2626').text('Disease advisory report generated.', 40, doc.y);
    }
  }

  private static renderExpenseSection(doc: PDFKit.PDFDocument, data: any, lang: string, font: string, boldFont: string, primary: string, text: string, secondary: string) {
    doc.font(boldFont).fontSize(12).fillColor(primary).text(this.t('ledger', lang), 50, doc.y);
    doc.y += 10;
    
    const summary = data.summary || { totalIncome: 0, totalExpense: 0, netProfit: 0 };

    doc.font(font).fontSize(10).fillColor(text);
    doc.text(`${this.t('revenue', lang)}: Rs. ${summary.totalIncome}`, 60, doc.y);
    doc.y += 15;
    doc.text(`${this.t('expenses', lang)}: Rs. ${summary.totalExpense}`, 60, doc.y);
    doc.y += 15;
    doc.text(`${this.t('netProfit', lang)}: Rs. ${summary.netProfit}`, 60, doc.y);
    doc.y += 20;

    if (data.expenses && data.expenses.length > 0) {
      doc.font(boldFont).fontSize(11).fillColor(primary).text(this.t('txLogs', lang), 50, doc.y);
      doc.y += 12;

      // Table Header
      doc.font(boldFont).fontSize(9).fillColor(text);
      doc.text(this.t('date', lang), 50, doc.y, { width: 70 });
      doc.text(this.t('type', lang), 120, doc.y, { width: 70 });
      doc.text(this.t('category', lang), 190, doc.y, { width: 90 });
      doc.text(this.t('amount', lang), 290, doc.y, { width: 80, align: 'right' });
      doc.text(this.t('description', lang), 380, doc.y, { width: 150 });
      doc.y += 15;

      doc.moveTo(50, doc.y - 5).lineTo(540, doc.y - 5).strokeColor('#E5E7EB').lineWidth(1).stroke();

      doc.font(font).fillColor(secondary);
      data.expenses.forEach((exp: any) => {
        const expDate = new Date(exp.date).toLocaleDateString('en-IN');
        doc.text(expDate, 50, doc.y, { width: 70 });
        doc.text(exp.type.toUpperCase(), 120, doc.y, { width: 70 });
        doc.text(exp.category, 190, doc.y, { width: 90 });
        doc.text(`${exp.amount}`, 290, doc.y, { width: 80, align: 'right' });
        doc.text(exp.description || '-', 380, doc.y, { width: 150 });
        doc.y += 16;

        if (doc.y > 700) {
          doc.addPage();
          doc.y = 50;
        }
      });
    }
  }
}
