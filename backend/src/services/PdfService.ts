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
    farmerCompanion: "KrishiMitra AI - Farmer Companion",
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
    footer: "© 2026 KrishiMitra AI. This is a computer-generated summary advisory report."
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
    farmerCompanion: "कृषिमित्र एआई - किसान साथी",
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
    footer: "© 2026 कृषिमित्र एआई। यह एक कंप्यूटर जनित सलाह रिपोर्ट है।"
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
    farmerCompanion: "કૃષિમિત્ર એઆઈ - ખેડૂત સાથી",
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
    footer: "© ૨૦૨૬ કૃષિમિત્ર એઆઈ. આ કમ્પ્યુટર દ્વારા બનાવેલ રિપોર્ટ છે."
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
    farmerCompanion: "कृषिमित्र एआय - शेतकरी मित्र",
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
   * Generates a PDF Report directly to an Express HTTP Response in the selected language
   */
  static generateReport(
    res: Response,
    reportType: 'crop' | 'weather' | 'disease' | 'expense',
    data: any,
    language: string = 'en'
  ): void {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    doc.pipe(res);

    // Color Palette
    const primaryColor = '#10B981';
    const textColor = '#1F2937';
    const secondaryColor = '#4B5563';

    // Register Canonical Unicode Fonts (Nirmala UI) for English, Gujarati, Hindi, Marathi
    let regularFont = 'Helvetica';
    let boldFont = 'Helvetica-Bold';

    const regularPath = this.getFontPath('Nirmala.ttf');
    const boldPath = this.getFontPath('NirmalaB.ttf');

    if (regularPath) {
      try {
        doc.registerFont('KrishiUnicode', regularPath);
        regularFont = 'KrishiUnicode';
      } catch (e) {
        console.warn('[PDF Font Warning] Failed to register regular font:', e);
      }
    }

    if (boldPath) {
      try {
        doc.registerFont('KrishiUnicode-Bold', boldPath);
        boldFont = 'KrishiUnicode-Bold';
      } catch (e) {
        console.warn('[PDF Font Warning] Failed to register bold font:', e);
      }
    } else if (regularFont === 'KrishiUnicode') {
      boldFont = 'KrishiUnicode';
    }

    // Always set document font first BEFORE rendering ANY section
    doc.font(regularFont);

    if (reportType === 'disease') {
      this.renderDiseaseSection(doc, data, language, regularFont, boldFont, primaryColor, textColor, secondaryColor);
      doc.end();
      return;
    }

    // Header Banner background
    doc.rect(0, 0, 595.28, 120).fill(primaryColor);

    // Title
    doc.font(boldFont).fillColor('#FFFFFF').fontSize(24).text('KRISHIMITRA AI', 50, 30);

    // Subtitle
    doc.font(regularFont).fontSize(10).text(this.t('subtitle', language), 50, 65);

    // Date
    const reportDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    doc.text(`${this.t('generated', language)}: ${reportDate}`, 400, 65, { align: 'right' });

    // Document Body Header
    doc.y = 140;
    doc.fillColor(textColor);
    
    let reportTitleKey = 'cropReport';
    if (reportType === 'weather') reportTitleKey = 'weatherReport';
    else if (reportType === 'expense') reportTitleKey = 'expenseReport';

    doc.font(boldFont).fontSize(14).text(this.t(reportTitleKey, language), 50, 140);
    
    // Decorative underline divider
    doc.moveTo(50, 160).lineTo(545.28, 160).strokeColor(primaryColor).lineWidth(2).stroke();

    doc.y = 180;
    doc.font(regularFont).fontSize(10).fillColor(secondaryColor);

    // Route section rendering
    switch (reportType) {
      case 'crop':
        this.renderCropSection(doc, data, language, regularFont, boldFont, primaryColor, textColor, secondaryColor);
        break;
      case 'weather':
        this.renderWeatherSection(doc, data, language, regularFont, boldFont, primaryColor, textColor, secondaryColor);
        break;
      case 'expense':
        this.renderExpenseSection(doc, data, language, regularFont, boldFont, primaryColor, textColor, secondaryColor);
        break;
      default:
        doc.text('Invalid report selection.');
    }

    // Footer
    doc.font(regularFont).fontSize(8).fillColor(secondaryColor).text(this.t('footer', language), 50, 770, {
      align: 'center',
      width: 495.28
    });

    doc.end();
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

  private static renderDiseaseSection(doc: PDFKit.PDFDocument, data: any, lang: string, font: string, boldFont: string, primary: string, text: string, secondary: string) {
    try {
      // 1-PAGE FARMER-FRIENDLY DISEASE REPORT LAYOUT
      const pageWidth = 595.28;
      const leftMargin = 40;
      const contentWidth = 515.28;

      // Header Banner (Height: 85)
      doc.rect(0, 0, pageWidth, 85).fill(primary);

      // Header Text
      doc.font(boldFont).fillColor('#FFFFFF').fontSize(22).text('KrishiMitra AI', leftMargin, 20);
      doc.font(font).fontSize(12).text(this.t('pathologyTitle', lang), leftMargin, 48);

      // Date on Top Right
      const formattedDate = data.scanDate || new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      doc.font(font).fontSize(9).text(`${this.t('scanDateLabel', lang)}: ${formattedDate}`, pageWidth - leftMargin - 180, 48, {
        align: 'right',
        width: 180
      });

      let currentY = 100;

      // SUMMARY OVERVIEW BOX (Height: ~105)
      doc.rect(leftMargin, currentY, contentWidth, 105).fillAndStroke('#F3F4F6', '#E5E7EB');
      
      const cropName = data.crop || 'Crop Leaf';
      const diseaseName = data.diseaseName || data.name || 'Observed Pathology Symptom';
      const localNameStr = data.localName ? ` (${data.localName})` : '';
      const fullDiseaseStr = `${diseaseName}${localNameStr}`;
      
      const rawConf = typeof data.confidenceScore === 'number' ? data.confidenceScore : 0.85;
      const confPercent = rawConf > 1 ? `${rawConf.toFixed(0)}%` : `${(rawConf * 100).toFixed(0)}%`;
      const severityStr = (data.severity || 'Moderate').toUpperCase();

      const textColWidth = data.imageBuffer ? 360 : contentWidth - 30;

      doc.font(boldFont).fillColor(text).fontSize(10);
      doc.text(`${this.t('cropLabel', lang)}: `, leftMargin + 15, currentY + 12, { continued: true });
      doc.font(font).fontSize(10).text(cropName);

      doc.font(boldFont).fontSize(10).text(`${this.t('diseaseLabel', lang)}: `, leftMargin + 15, currentY + 30, { continued: true });
      doc.font(font).fontSize(10).text(fullDiseaseStr, { width: textColWidth });

      doc.font(font).fontSize(10).text(`${this.t('confLabel', lang)}: ${confPercent}   |   ${this.t('severityLabel', lang)}: ${severityStr}   |   ${this.t('scanDateLabel', lang)}: ${formattedDate}`, leftMargin + 15, currentY + 70);

      // Optional Image on Right Side of Box
      if (data.imageBuffer && Buffer.isBuffer(data.imageBuffer)) {
        try {
          doc.image(data.imageBuffer, leftMargin + contentWidth - 95, currentY + 10, {
            fit: [85, 85],
            align: 'center',
            valign: 'center'
          });
        } catch (imgErr) {
          console.warn('[PdfService Image Warning] Could not render image buffer:', imgErr);
        }
      }

      currentY += 120;

      // Section Helper
      const renderSectionDivider = (yPos: number) => {
        doc.moveTo(leftMargin, yPos).lineTo(leftMargin + contentWidth, yPos).strokeColor('#E5E7EB').lineWidth(1).stroke();
      };

      // 1. SYMPTOMS SECTION
      renderSectionDivider(currentY);
      currentY += 8;

      doc.font(boldFont).fontSize(11).fillColor(primary).text(this.t('symptomsTitle', lang), leftMargin, currentY);
      currentY += 16;
      doc.font(font).fontSize(9.5).fillColor(text);

      const symptomsList: string[] = Array.isArray(data.symptoms) && data.symptoms.length > 0
        ? data.symptoms
        : [data.symptoms || 'Visible leaf lesions, discoloration, or spot patterns observed on foliage.'];

      symptomsList.slice(0, 3).forEach((sym: string) => {
        doc.text(`• ${sym}`, leftMargin + 10, currentY, { width: contentWidth - 15 });
        currentY += 14;
      });

      currentY += 6;

      // 2. POSSIBLE CAUSE SECTION
      renderSectionDivider(currentY);
      currentY += 8;

      doc.font(boldFont).fontSize(11).fillColor(primary).text(this.t('causesTitle', lang), leftMargin, currentY);
      currentY += 16;
      doc.font(font).fontSize(9.5).fillColor(text);

      const causesList: string[] = Array.isArray(data.possibleCauses) && data.possibleCauses.length > 0
        ? data.possibleCauses
        : (data.causes ? (Array.isArray(data.causes) ? data.causes : [data.causes]) : ['Fungal or bacterial pathogen proliferation encouraged by warm, humid foliage microclimate.']);

      const causeText = causesList.slice(0, 2).join('; ');
      doc.text(causeText, leftMargin + 10, currentY, { width: contentWidth - 15 });
      currentY += 22;

      // 3. WHAT TO DO NOW SECTION
      renderSectionDivider(currentY);
      currentY += 8;

      doc.font(boldFont).fontSize(11).fillColor(primary).text(this.t('whatToDoTitle', lang), leftMargin, currentY);
      currentY += 16;
      doc.font(font).fontSize(9.5).fillColor(text);

      let immediateAction = 'Inspect infected leaves immediately and isolate severely affected plants.';
      let monitoringAction = 'Monitor neighboring field rows daily for spreading leaf spots.';
      let preventionAction = 'Ensure proper row spacing, drainage, and clear plant debris after harvest.';

      if (Array.isArray(data.recommendedActions) && data.recommendedActions.length > 0) {
        if (data.recommendedActions[0]) immediateAction = data.recommendedActions[0].details || data.recommendedActions[0].title || immediateAction;
        if (data.recommendedActions[1]) monitoringAction = data.recommendedActions[1].details || data.recommendedActions[1].title || monitoringAction;
        if (data.recommendedActions[2]) preventionAction = data.recommendedActions[2].details || data.recommendedActions[2].title || preventionAction;
      }

      doc.text(`1. Immediate: ${immediateAction}`, leftMargin + 10, currentY, { width: contentWidth - 15 });
      currentY += 16;
      doc.text(`2. Monitor: ${monitoringAction}`, leftMargin + 10, currentY, { width: contentWidth - 15 });
      currentY += 16;
      doc.text(`3. Prevent: ${preventionAction}`, leftMargin + 10, currentY, { width: contentWidth - 15 });
      currentY += 22;

      // 4. BIOLOGICAL / ORGANIC OPTIONS
      renderSectionDivider(currentY);
      currentY += 8;

      doc.font(boldFont).fontSize(11).fillColor(primary).text(this.t('organicTitle', lang), leftMargin, currentY);
      currentY += 16;
      doc.font(font).fontSize(9.5).fillColor(text);

      const organicList: string[] = Array.isArray(data.organicTreatment) && data.organicTreatment.length > 0
        ? data.organicTreatment
        : ['Spray Neem oil formulation (5ml/L water) or Trichoderma viride bio-fungicide.'];

      organicList.slice(0, 2).forEach((org: string) => {
        doc.text(`• ${org}`, leftMargin + 10, currentY, { width: contentWidth - 15 });
        currentY += 14;
      });

      currentY += 6;

      // 5. CHEMICAL CONTROL
      renderSectionDivider(currentY);
      currentY += 8;

      doc.font(boldFont).fontSize(11).fillColor('#DC2626').text(this.t('chemicalTitle', lang), leftMargin, currentY);
      currentY += 16;
      doc.font(font).fontSize(9.5).fillColor(text);

      const chemicalList: string[] = Array.isArray(data.chemicalTreatment) && data.chemicalTreatment.length > 0
        ? data.chemicalTreatment
        : (data.pesticideDetails ? [`${data.pesticideDetails.englishName || data.pesticideDetails.localName || 'Fungicide spray'} (${data.pesticideDetails.dosage || '2g/L'})`] : ['Copper Oxychloride or Mancozeb spray if infection exceeds 15% threshold.']);

      doc.text(`• ${chemicalList[0]}`, leftMargin + 10, currentY, { width: contentWidth - 15 });
      currentY += 16;

      doc.font(font).fontSize(8.5).fillColor('#DC2626').text(this.t('safetyWarning', lang), leftMargin + 10, currentY, { width: contentWidth - 15 });
      currentY += 24;

      // 6. IMPORTANT ADVISORY DISCLAIMER
      renderSectionDivider(currentY);
      currentY += 8;
      doc.font(font).fontSize(8.5).fillColor(secondary).text(this.t('importantDisclaimer', lang), leftMargin, currentY, { width: contentWidth });

      // FOOTER AT BOTTOM OF PAGE 1
      doc.font(boldFont).fontSize(9).fillColor(primary).text(this.t('farmerCompanion', lang), leftMargin, 790, {
        align: 'center',
        width: contentWidth
      });

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
