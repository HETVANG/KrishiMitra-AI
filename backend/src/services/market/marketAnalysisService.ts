import { TrendAnalysisResult } from './marketTrendService';
import { RegionalMarketComparison } from './marketComparisonService';

export class MarketAnalysisService {
  /**
   * Generate structured factual market explanation and advisory in user language
   */
  static async generateMarketAdvisory(
    commodity: string,
    trend: TrendAnalysisResult,
    comparison: RegionalMarketComparison,
    language: string = 'en',
    currentModalPrice?: number | null
  ): Promise<{
    summary: string;
    keyInsights: string[];
    sellingConsiderations: string[];
    disclaimer: string;
  }> {
    const lang = (language || 'en').toLowerCase();
    const effectivePrice = currentModalPrice ?? trend.currentPrice;
    const hasPrice = typeof effectivePrice === 'number' && effectivePrice > 0;
    
    const changeStr = trend.percentageChange !== null && Number.isFinite(trend.percentageChange)
      ? `${trend.percentageChange > 0 ? '+' : ''}${trend.percentageChange}%`
      : '';

    // Localized commodity translations for popular crops
    const cropTranslations: Record<string, { hi: string; gu: string }> = {
      'Wheat': { hi: 'गेहूं', gu: 'ઘઉં' },
      'Cotton': { hi: 'कपास', gu: 'કપાસ' },
      'Paddy(Dhan)(Common)': { hi: 'धान (चावल)', gu: 'ડાંગર (ચોખા)' },
      'Paddy': { hi: 'धान', gu: 'ડાંગર' },
      'Soyabean': { hi: 'सोयाबीन', gu: 'સોયાબીન' },
      'Mustard': { hi: 'सरसों', gu: 'રાઈ' },
      'Maize': { hi: 'मक्का', gu: 'મકાઈ' },
      'Bajra(Pearl Millet/Cumbu)': { hi: 'बाजरा', gu: 'બાજરી' },
      'Bajra': { hi: 'बाजरा', gu: 'બાજરી' },
      'Gram': { hi: 'चना', gu: 'ચણા' },
      'Groundnut': { hi: 'मूंगफली', gu: 'મગફળી' },
      'Onion': { hi: 'प्याज', gu: 'ડુંગળી' },
      'Potato': { hi: 'आलू', gu: 'બટાકા' },
      'Tomato': { hi: 'टमाटर', gu: 'ટામેટા' }
    };

    const localizedCrop = lang === 'hi' 
      ? (cropTranslations[commodity]?.hi || commodity)
      : lang === 'gu'
      ? (cropTranslations[commodity]?.gu || commodity)
      : commodity;

    const keyInsights: string[] = [];
    const sellingConsiderations: string[] = [];

    let summary = '';
    let disclaimer = '';

    if (lang === 'hi') {
      const priceText = hasPrice ? `₹${effectivePrice}/क्विंटल` : 'मूल्य संकलन जारी है';
      
      let trendText = 'स्थिर';
      if (trend.trend === 'RISING') trendText = `बढ़त की ओर (${changeStr})`;
      else if (trend.trend === 'FALLING') trendText = `गिरावट की ओर (${changeStr})`;
      else if (trend.trend === 'MIXED') trendText = 'मिश्रित';
      else if (trend.trend === 'INSUFFICIENT_DATA') trendText = 'संकलन जारी';

      summary = hasPrice
        ? `${localizedCrop} का वर्तमान औसत मॉडल भाव ${priceText} है। पिछले ${trend.period} में बाजार का रुझान ${trendText} रहा है।`
        : `${localizedCrop} के लिए नवीनतम मंडी दरों का संकलन जारी है। पिछले ${trend.period} का रुझान ${trendText} है।`;

      if (trend.trend === 'RISING') {
        keyInsights.push(`बाजार के आंकड़ों के अनुसार पिछले ${trend.period} में कीमतों में सकारात्मक बढ़त (${changeStr}) दर्ज की गई है।`);
      } else if (trend.trend === 'FALLING') {
        keyInsights.push(`बाजार के आंकड़ों के अनुसार पिछले ${trend.period} में कीमतों में गिरावट (${changeStr}) का दबाव देखा गया है।`);
      } else if (trend.trend === 'INSUFFICIENT_DATA') {
        keyInsights.push(`स्थानीय मंडी में हालिया व्यापारिक डेटा संकलित किया जा रहा है।`);
      } else {
        keyInsights.push(`पिछले दिनों में ${localizedCrop} के भाव अपेक्षाकृत स्थिर बने हुए हैं।`);
      }

      if (comparison.highestMarket && comparison.lowestMarket && comparison.highestPrice && comparison.lowestPrice) {
        const spread = comparison.highestPrice - comparison.lowestPrice;
        keyInsights.push(`आस-पास की मंडियों में भावों का अंतर ₹${spread}/क्विंटल है (सर्वोच्च: ${comparison.highestMarket} ₹${comparison.highestPrice}, न्यूनतम: ${comparison.lowestMarket} ₹${comparison.lowestPrice})।`);
      }

      sellingConsiderations.push('मंडी ले जाने से पहले परिवहन, लोडिंग और समय की लागत का आकलन करें।');
      sellingConsiderations.push('सर्वोत्तम मूल्य प्राप्त करने के लिए फसल की गुणवत्ता और नमी को FAQ मानकों के अनुसार रखें।');
      sellingConsiderations.push('ध्यान दें: वास्तविक बिक्री दरें मंडी में दैनिक आवक और स्थानीय मांग पर निर्भर करती हैं।');

      disclaimer = 'मंडी भाव अधिकृत APMC मंडी रिकॉर्ड पर आधारित हैं। फसल बेचने से पहले स्थानीय मंडी में भौतिक सत्यापन अवश्य करें।';
    } else if (lang === 'gu') {
      const priceText = hasPrice ? `₹${effectivePrice}/ક્વિન્ટલ` : 'ભાવ સંકલન ચાલુ છે';

      let trendText = 'સ્થિર';
      if (trend.trend === 'RISING') trendText = `વધારા તરફ (${changeStr})`;
      else if (trend.trend === 'FALLING') trendText = `ઘટાડા તરફ (${changeStr})`;
      else if (trend.trend === 'MIXED') trendText = 'મિશ્ર';
      else if (trend.trend === 'INSUFFICIENT_DATA') trendText = 'સંકલન ચાલુ';

      summary = hasPrice
        ? `${localizedCrop} નો વર્તમાન સરેરાશ મોડલ ભાવ ${priceText} છે. છેલ્લા ${trend.period} માં બજારનું વલણ ${trendText} રહ્યું છે.`
        : `${localizedCrop} માટે નવીનતમ માર્કેટ યાર્ડના દરોનું સંકલન ચાલુ છે. છેલ્લા ${trend.period} નું વલણ ${trendText} છે.`;

      if (trend.trend === 'RISING') {
        keyInsights.push(`બજારના ડેટા અનુસાર છેલ્લા ${trend.period} માં કિંમતોમાં સારો વધારો (${changeStr}) નોંધાયો છે.`);
      } else if (trend.trend === 'FALLING') {
        keyInsights.push(`બજારના ડેટા અનુસાર છેલ્લા ${trend.period} માં કિંમતોમાં ઘટાડો (${changeStr}) જોવા મળ્યો છે.`);
      } else if (trend.trend === 'INSUFFICIENT_DATA') {
        keyInsights.push(`સ્થાનિક માર્કેટ યાર્ડમાં હાલના વેપાર ડેટાનું સંકલન પ્રગતિમાં છે.`);
      } else {
        keyInsights.push(`છેલ્લા દિવસોમાં ${localizedCrop} ના ભાવો સામાન્ય રીતે સ્થિર રહ્યા છે.`);
      }

      if (comparison.highestMarket && comparison.lowestMarket && comparison.highestPrice && comparison.lowestPrice) {
        const spread = comparison.highestPrice - comparison.lowestPrice;
        keyInsights.push(`નજીકના માર્કેટ યાર્ડ્સમાં ભાવ તફાવત ₹${spread}/ક્વિન્ટલ છે (સૌથી ઊંચો: ${comparison.highestMarket} ₹${comparison.highestPrice}, સૌથી નીચો: ${comparison.lowestMarket} ₹${comparison.lowestPrice}).`);
      }

      sellingConsiderations.push('માર્કેટ યાર્ડ પસંદ કરતા પહેલા પરિવહન અને મજૂરી ખર્ચની ગણતરી કરો.');
      sellingConsiderations.push('શ્રેષ્ઠ ભાવ મેળવવા માટે પાકની ગુણવત્તા અને ભેજનું પ્રમાણ FAQ ધોરણો મુજબ જાળવો.');
      sellingConsiderations.push('નોંધ: ભાવની વધ-ઘટ દૈનિક આવક અને સ્થાનિક માંગ પર આધારિત રહે છે.');

      disclaimer = 'બજાર ભાવો સત્તાવાર APMC માર્કેટ યાર્ડના અહેવાલો પર આધારિત છે. માલ વેચતા પહેલા સ્થાનિક યાર્ડમાં રૂબરૂ ખરાઈ કરવી.';
    } else {
      // English default
      const priceText = hasPrice ? `₹${effectivePrice}/Quintal` : 'Rate compilation in progress';
      
      let trendText = 'STABLE';
      if (trend.trend === 'RISING') trendText = `RISING (${changeStr || 'positive'})`;
      else if (trend.trend === 'FALLING') trendText = `FALLING (${changeStr || 'downward'})`;
      else if (trend.trend === 'MIXED') trendText = 'MIXED';
      else if (trend.trend === 'INSUFFICIENT_DATA') trendText = 'Being Established';

      summary = hasPrice
        ? `${localizedCrop} is currently trading at an average modal price of ${priceText}. Market trend over the past ${trend.period} is classified as ${trendText}.`
        : `Market rates for ${localizedCrop} are currently being compiled. Trend over the past ${trend.period} is classified as ${trendText}.`;

      if (trend.trend === 'RISING') {
        keyInsights.push(`Current market data indicates an upward price movement (${changeStr || 'rising'}) over the last ${trend.period}.`);
      } else if (trend.trend === 'FALLING') {
        keyInsights.push(`Current market data indicates downward price pressure (${changeStr || 'falling'}) over the last ${trend.period}.`);
      } else if (trend.trend === 'INSUFFICIENT_DATA') {
        keyInsights.push(`Recent physical market records are currently being compiled for this trading center.`);
      } else {
        keyInsights.push(`Prices for ${localizedCrop} have remained relatively stable over the selected period.`);
      }

      if (comparison.highestMarket && comparison.lowestMarket && comparison.highestPrice && comparison.lowestPrice) {
        const spread = comparison.highestPrice - comparison.lowestPrice;
        keyInsights.push(`Price spread across nearby markets is ₹${spread}/Qtl (Highest: ${comparison.highestMarket} at ₹${comparison.highestPrice}, Lowest: ${comparison.lowestMarket} at ₹${comparison.lowestPrice}).`);
      }

      sellingConsiderations.push('Evaluate transportation and loading costs relative to mandi price differences before selecting a destination market.');
      sellingConsiderations.push('Ensure crop moisture content meets standard Mandi FAQ grades for maximum price realization.');
      sellingConsiderations.push('Note: Future price direction remains subject to daily market arrivals and local demand shifts.');

      disclaimer = 'Market prices are based on reported APMC government mandi records. Farmers should verify live rates at the physical market before dispatching produce.';
    }

    return {
      summary,
      keyInsights,
      sellingConsiderations,
      disclaimer
    };
  }
}
