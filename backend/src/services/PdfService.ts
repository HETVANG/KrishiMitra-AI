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
    diseaseReport: "DISEASE STATEMENT REPORT",
    expenseReport: "EXPENSE STATEMENT REPORT",
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
    footer: "© ૨૦૨૬ કૃષિમિત્ર એઆઈ. આ কમ્પ્યુટર દ્વારા બનાવેલ રિપોર્ટ છે."
  },
  mr: {
    subtitle: "स्मार्ट कृषी मंच - डिजिटल माती आणि पीक अहवाल",
    generated: "अहवाल वेळ",
    cropReport: "पीक शिफारस अहवाल",
    weatherReport: "हवामान अहवाल पत्रक",
    diseaseReport: "पान रोग निदान अहवाल",
    expenseReport: "खर्च आणि आर्थिक अहवाल",
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

export class PdfService {
  private static t(key: string, lang: string): string {
    const code = (lang || 'en').toLowerCase().slice(0, 2);
    const dict = pdfTranslations[code] || pdfTranslations.en;
    return dict[key] || pdfTranslations.en[key] || key;
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
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    doc.pipe(res);

    // Color Palette
    const primaryColor = '#10B981';
    const textColor = '#1F2937';
    const secondaryColor = '#4B5563';

    // Register Unicode Font on Windows (Arial supports Indian glyph characters)
    let fontName = 'Helvetica';
    const winFontPath = 'C:\\Windows\\Fonts\\arial.ttf';
    if (fs.existsSync(winFontPath)) {
      try {
        doc.registerFont('ArialUnicode', winFontPath);
        fontName = 'ArialUnicode';
      } catch (e) {
        console.warn('[PDF Font Warning] Failed to register Arial Unicode font:', e);
      }
    }

    doc.font(fontName);

    // Header Banner background
    doc.rect(0, 0, 595.28, 120).fill(primaryColor);

    // Title
    doc.fillColor('#FFFFFF').fontSize(24).text('KRISHIMITRA AI', 50, 30);

    // Subtitle
    doc.fontSize(10).text(this.t('subtitle', language), 50, 65);

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
    else if (reportType === 'disease') reportTitleKey = 'diseaseReport';
    else if (reportType === 'expense') reportTitleKey = 'expenseReport';

    doc.fontSize(14).text(this.t(reportTitleKey, language), 50, 140);
    
    // Decorative underline divider
    doc.moveTo(50, 160).lineTo(545.28, 160).strokeColor(primaryColor).lineWidth(2).stroke();

    doc.y = 180;
    doc.fontSize(10).fillColor(secondaryColor);

    // Route section rendering
    switch (reportType) {
      case 'crop':
        this.renderCropSection(doc, data, language, fontName, primaryColor, textColor, secondaryColor);
        break;
      case 'weather':
        this.renderWeatherSection(doc, data, language, fontName, primaryColor, textColor, secondaryColor);
        break;
      case 'disease':
        this.renderDiseaseSection(doc, data, language, fontName, primaryColor, textColor, secondaryColor);
        break;
      case 'expense':
        this.renderExpenseSection(doc, data, language, fontName, primaryColor, textColor, secondaryColor);
        break;
      default:
        doc.text('Invalid report selection.');
    }

    // Footer
    doc.fontSize(8).fillColor(secondaryColor).text(this.t('footer', language), 50, 770, {
      align: 'center',
      width: 495.28
    });

    doc.end();
  }

  private static renderCropSection(doc: PDFKit.PDFDocument, data: any, lang: string, font: string, primary: string, text: string, secondary: string) {
    doc.font(font).fontSize(12).fillColor(primary).text(this.t('farmDetails', lang), 50, doc.y);
    doc.y += 10;
    doc.fontSize(10).fillColor(text);
    
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
      doc.fontSize(12).fillColor(primary).text(this.t('recCrops', lang), 50, doc.y);
      doc.y += 10;

      data.recommendations.forEach((crop: any, index: number) => {
        doc.fontSize(11).fillColor(text).text(`${index + 1}. ${crop.name}`, 50, doc.y);
        doc.y += 5;
        doc.fontSize(9).fillColor(secondary);
        doc.text(`${this.t('yield', lang)}: ${crop.expectedYield} kg | ${this.t('profit', lang)}: Rs. ${crop.profitEstimation}`, 65, doc.y);
        doc.y += 12;
        doc.text(`${this.t('duration', lang)}: ${crop.growingDuration} days | ${this.t('risk', lang)}: ${crop.riskLevel}`, 65, doc.y);
        doc.y += 12;
        doc.text(`${this.t('recommendation', lang)}: ${crop.description}`, 65, doc.y, { width: 450 });
        doc.y += 20;
      });
    }
  }

  private static renderWeatherSection(doc: PDFKit.PDFDocument, data: any, lang: string, font: string, primary: string, text: string, secondary: string) {
    doc.font(font).fontSize(12).fillColor(primary).text(this.t('weatherConditions', lang), 50, doc.y);
    doc.y += 10;
    doc.fontSize(10).fillColor(text);

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
      doc.fontSize(12).fillColor(primary).text(this.t('advisory', lang), 50, doc.y);
      doc.y += 8;
      doc.fontSize(10).fillColor(text).text(data.aiAdvice, 50, doc.y, { width: 480 });
    }
  }

  private static renderDiseaseSection(doc: PDFKit.PDFDocument, data: any, lang: string, font: string, primary: string, text: string, secondary: string) {
    doc.font(font).fontSize(12).fillColor(primary).text(this.t('diagSummary', lang), 50, doc.y);
    doc.y += 10;
    doc.fontSize(10).fillColor(text);

    doc.text(`${this.t('diagDisease', lang)}: ${data.name || 'N/A'} (${data.scientificName || 'N/A'})`, 60, doc.y);
    doc.y += 15;
    doc.text(`${this.t('conf', lang)}: ${(data.confidenceScore * 100 || 0).toFixed(0)}%`, 60, doc.y);
    doc.y += 20;

    // Symptoms
    doc.fontSize(11).fillColor(primary).text(this.t('symptoms', lang), 50, doc.y);
    doc.y += 8;
    doc.fontSize(9).fillColor(text);
    (data.symptoms || []).forEach((sym: string) => {
      doc.text(`• ${sym}`, 60, doc.y);
      doc.y += 14;
    });

    // Organic
    doc.y += 10;
    doc.fontSize(11).fillColor(primary).text(this.t('organic', lang), 50, doc.y);
    doc.y += 8;
    doc.fontSize(9).fillColor(text);
    (data.organicTreatment || []).forEach((org: string) => {
      doc.text(`• ${org}`, 60, doc.y);
      doc.y += 14;
    });

    // Chemical
    doc.y += 10;
    doc.fontSize(11).fillColor('#DC2626').text(this.t('chemical', lang), 50, doc.y);
    doc.y += 8;
    doc.fontSize(9).fillColor(text);
    (data.chemicalTreatment || []).forEach((chem: string) => {
      doc.text(`• ${chem}`, 60, doc.y);
      doc.y += 14;
    });
  }

  private static renderExpenseSection(doc: PDFKit.PDFDocument, data: any, lang: string, font: string, primary: string, text: string, secondary: string) {
    doc.font(font).fontSize(12).fillColor(primary).text(this.t('ledger', lang), 50, doc.y);
    doc.y += 10;
    
    const summary = data.summary || { totalIncome: 0, totalExpense: 0, netProfit: 0 };

    doc.fontSize(10).fillColor(text);
    doc.text(`${this.t('revenue', lang)}: Rs. ${summary.totalIncome}`, 60, doc.y);
    doc.y += 15;
    doc.text(`${this.t('expenses', lang)}: Rs. ${summary.totalExpense}`, 60, doc.y);
    doc.y += 15;
    doc.text(`${this.t('netProfit', lang)}: Rs. ${summary.netProfit}`, 60, doc.y);
    doc.y += 20;

    if (data.expenses && data.expenses.length > 0) {
      doc.fontSize(11).fillColor(primary).text(this.t('txLogs', lang), 50, doc.y);
      doc.y += 12;

      // Table Header
      doc.fontSize(9).fillColor(text);
      doc.text(this.t('date', lang), 50, doc.y, { width: 70 });
      doc.text(this.t('type', lang), 120, doc.y, { width: 70 });
      doc.text(this.t('category', lang), 190, doc.y, { width: 90 });
      doc.text(this.t('amount', lang), 290, doc.y, { width: 80, align: 'right' });
      doc.text(this.t('description', lang), 380, doc.y, { width: 150 });
      doc.y += 15;

      doc.moveTo(50, doc.y - 5).lineTo(540, doc.y - 5).strokeColor('#E5E7EB').lineWidth(1).stroke();

      doc.fillColor(secondary);
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
