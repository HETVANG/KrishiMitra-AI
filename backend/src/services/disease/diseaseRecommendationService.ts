import { DiseaseAnalysisResult } from './diseaseAnalysisService';
import { EnvironmentalRiskResult } from './diseaseRiskEngine';

export interface ActionPlanItem {
  actionType: 'IMMEDIATE_CHECK' | 'MONITOR' | 'PREVENTION' | 'EXPERT_CONSULTATION' | 'FOLLOW_UP';
  title: string;
  details: string;
}

export class DiseaseRecommendationService {
  /**
   * Build structured action plan categorized for farmer decision-making
   */
  static generateActionPlan(
    analysis: DiseaseAnalysisResult,
    severity: 'low' | 'moderate' | 'high' | 'uncertain',
    envRisk: EnvironmentalRiskResult,
    language: string = 'en'
  ): ActionPlanItem[] {
    const plan: ActionPlanItem[] = [];
    const lang = (language || 'en').toLowerCase().slice(0, 2);

    if (analysis.condition === 'HEALTHY') {
      if (lang === 'gu') {
        plan.push({
          actionType: 'MONITOR',
          title: 'નિયમિત ખેતરનું અવલોકન',
          details: 'પાકના પાંદડા પર રોગના કોઈ લક્ષણો નથી. સામાન્ય સંભાળ ચાલુ રાખો અને સાપ્તાહિક અવલોકન કરો.'
        });
        plan.push({
          actionType: 'PREVENTION',
          title: 'સંતુલિત કૃષિ પદ્ધતિ',
          details: 'પાકની કુદરતી રોગપ્રતિકારક શક્તિ જાળવવા માટે યોગ્ય પિયત અને ખાતર વ્યવસ્થાપન જાળવો.'
        });
      } else if (lang === 'hi') {
        plan.push({
          actionType: 'MONITOR',
          title: 'नियमित खेत अवलोकन',
          details: 'फसल की पत्ती पर कोई सक्रिय बीमारी के लक्षण नहीं हैं। सामान्य देखभाल जारी रखें और साप्ताहिक अवलोकन करें।'
        });
        plan.push({
          actionType: 'PREVENTION',
          title: 'संतुलित कृषि पद्धति',
          details: 'फसल की प्राकृतिक रोग प्रतिरोधक क्षमता बनाए रखने के लिए संतुलित सिंचाई और उर्वरक प्रबंधन बनाए रखें।'
        });
      } else {
        plan.push({
          actionType: 'MONITOR',
          title: 'Routine Field Observation',
          details: 'Crop leaf shows no active disease symptoms. Continue standard cultural practices and monitor foliage weekly.'
        });
        plan.push({
          actionType: 'PREVENTION',
          title: 'Balanced Agronomy',
          details: 'Maintain balanced irrigation and fertilizer schedules to support natural crop immunity.'
        });
      }
      return plan;
    }

    if (analysis.condition === 'INSUFFICIENT_IMAGE_QUALITY' || analysis.condition === 'UNCERTAIN') {
      if (lang === 'gu') {
        plan.push({
          actionType: 'IMMEDIATE_CHECK',
          title: 'સ્પષ્ટ પાંદડાનો ફોટો લો',
          details: 'લક્ષણોનું ફરીથી યોગ્ય વિશ્લેષણ કરવા માટે દિવસના પ્રકાશમાં પાંદડાનો નજીકથી સ્પષ્ટ ફોટો પાડો.'
        });
        plan.push({
          actionType: 'EXPERT_CONSULTATION',
          title: 'સ્થાનિક કૃષિ નિષ્ણાતનો સંપર્ક કરો',
          details: 'જો પાંદડાનું નુકસાન ચાલુ રહે અથવા ફેલાય, તો કૃષિ અધિકારી સાથે તપાસનું આયોજન કરો.'
        });
      } else if (lang === 'hi') {
        plan.push({
          actionType: 'IMMEDIATE_CHECK',
          title: 'स्पष्ट पत्ती का फोटो लें',
          details: 'लक्षणों का पुनर्मूल्यांकन करने के लिए दिन के उजाले में प्रभावित पत्ती की स्पष्ट तस्वीर लें।'
        });
        plan.push({
          actionType: 'EXPERT_CONSULTATION',
          title: 'स्थानीय कृषि विशेषज्ञ से परामर्श करें',
          details: 'यदि पत्तियों का नुकसान जारी रहता है तो कृषि अधिकारी से व्यक्तिगत रूप से संपर्क करें।'
        });
      } else {
        plan.push({
          actionType: 'IMMEDIATE_CHECK',
          title: 'Re-Scan Clear Leaf Image',
          details: 'Capture a well-lit, close-up photograph of the affected leaf blade under daylight to re-evaluate symptoms.'
        });
        plan.push({
          actionType: 'EXPERT_CONSULTATION',
          title: 'Consult Local Agronomist',
          details: 'If leaf damage persists or spreads, schedule a physical inspection with an agricultural officer.'
        });
      }
      return plan;
    }

    // 1. IMMEDIATE CHECK
    if (lang === 'gu') {
      plan.push({
        actionType: 'IMMEDIATE_CHECK',
        title: 'આજુબાજુના છોડની તપાસ કરો',
        details: `આસપાસના ૫ મીટરમાં ${analysis.crop || 'પાક'}ના પાંદડા અને છોડ તપાસો કે રોગ ફેલાઈ રહ્યો છે કે કેમ.`
      });
    } else if (lang === 'hi') {
      plan.push({
        actionType: 'IMMEDIATE_CHECK',
        title: 'आस-पास के पौधों का निरीक्षण करें',
        details: `आस-पास के 5 मीटर क्षेत्र में ${analysis.crop || 'फसल'} की पत्तियों और तनों की जांच करें कि बीमारी फैल रही है या सीमित है।`
      });
    } else {
      plan.push({
        actionType: 'IMMEDIATE_CHECK',
        title: 'Inspect Neighboring Plants',
        details: `Examine surrounding ${analysis.crop || 'crop'} leaves and stalks within 5 meters to determine if symptoms (${analysis.symptoms.slice(0, 2).join(', ')}) are isolated or spreading.`
      });
    }

    // 2. MONITOR
    if (lang === 'gu') {
      plan.push({
        actionType: 'MONITOR',
        title: 'રોગના લક્ષણો પર નજર રાખો',
        details: 'આવતા ૪૮ થી ૭૨ કલાકમાં દરરોજ પાંદડા તપાસો. જો ડાઘ અથવા પીળાશ વધે તો કૃષિમિત્ર પર ફરીથી સ્કેન કરો.'
      });
    } else if (lang === 'hi') {
      plan.push({
        actionType: 'MONITOR',
        title: 'बीमारी के लक्षणों पर नज़र रखें',
        details: 'अगले 48 से 72 घंटों में रोजाना प्रभावित पत्तियों की जांच करें। यदि धब्बे बढ़ते हैं तो कृषिमित्र द्वारा दोबारा स्कैन करें।'
      });
    } else {
      plan.push({
        actionType: 'MONITOR',
        title: 'Track Symptom Progression',
        details: 'Check affected foliage daily over the next 48 to 72 hours. Re-scan using KrishiMitra if lesion size or yellowing increases.'
      });
    }

    // 3. PREVENTION
    if (analysis.preventiveTips && analysis.preventiveTips.length > 0) {
      if (lang === 'gu') {
        plan.push({
          actionType: 'PREVENTION',
          title: 'પાંદડાનું રક્ષણ અને હવાની અવરજવર',
          details: analysis.preventiveTips.slice(0, 2).join(' ')
        });
      } else if (lang === 'hi') {
        plan.push({
          actionType: 'PREVENTION',
          title: 'पत्तियों की सुरक्षा और हवा का आवागमन',
          details: analysis.preventiveTips.slice(0, 2).join(' ')
        });
      } else {
        plan.push({
          actionType: 'PREVENTION',
          title: 'Foliage Protection & Aeration',
          details: analysis.preventiveTips.slice(0, 2).join(' ')
        });
      }
    } else {
      if (lang === 'gu') {
        plan.push({
          actionType: 'PREVENTION',
          title: 'ભેજનું યોગ્ય વ્યવસ્થાપન',
          details: 'સાંજે મોડેથી પાણી આપવાનું ટાળો જેથી પાંદડા પર ભેજ ન રહે. છાંટણી કરતી વખતે સ્વચ્છ સાધનો વાપરો.'
        });
      } else if (lang === 'hi') {
        plan.push({
          actionType: 'PREVENTION',
          title: 'नमी का सही प्रबंधन',
          details: 'शाम को देर से पानी देने से बचें ताकि पत्तियों पर नमी न बनी रहे। कटाई-छंटाई के दौरान साफ उपकरणों का उपयोग करें।'
        });
      } else {
        plan.push({
          actionType: 'PREVENTION',
          title: 'Moisture Management',
          details: 'Avoid late evening overhead watering to reduce leaf wetness duration. Ensure clean field tools when pruning.'
        });
      }
    }

    // 4. EXPERT CONSULTATION
    if (severity === 'high' || severity === 'moderate') {
      if (lang === 'gu') {
        plan.push({
          actionType: 'EXPERT_CONSULTATION',
          title: 'પ્રમાણિત કૃષિ નિષ્ણાત સાથે સંપર્ક કરો',
          details: 'ચોક્કસ સારવાર માટે આ રિપોર્ટ અને ફોટો ચકાસાયેલ કૃષિ નિષ્ણાત સાથે શેર કરવા માટે "નિષ્ણાતને પૂછો" બટનનો ઉપયોગ કરો.'
        });
      } else if (lang === 'hi') {
        plan.push({
          actionType: 'EXPERT_CONSULTATION',
          title: 'प्रमाणित कृषि विशेषज्ञ से संपर्क करें',
          details: 'सटीक इलाज की सलाह के लिए इस रिपोर्ट और फोटो को विशेषज्ञ से साझा करने के लिए "विशेषज्ञ से पूछें" बटन का उपयोग करें।'
        });
      } else {
        plan.push({
          actionType: 'EXPERT_CONSULTATION',
          title: 'Connect with Certified Agronomist',
          details: 'Use the "Ask an Expert" button to share this pathology report and photo with a verified specialist for custom treatment advice.'
        });
      }
    }

    // 5. FOLLOW UP
    const recheckDays = severity === 'high' ? 2 : severity === 'moderate' ? 5 : 7;
    if (lang === 'gu') {
      plan.push({
        actionType: 'FOLLOW_UP',
        title: `${recheckDays} દિવસમાં ફરી તપાસનું આયોજન`,
        details: `સારવારથી ${analysis.diseaseName} રોગ નિયંત્રણમાં આવ્યો છે કે કેમ તે ચકાસવા માટે રી-ચેક રીમાઇન્ડર સેટ કરો.`
      });
    } else if (lang === 'hi') {
      plan.push({
        actionType: 'FOLLOW_UP',
        title: `${recheckDays} दिनों में पुन: जांच का समय`,
        details: `यह मूल्यांकन करने के लिए रिमाइंडर सेट करें कि क्या उपचार से ${analysis.diseaseName} नियंत्रित हुआ है।`
      });
    } else {
      plan.push({
        actionType: 'FOLLOW_UP',
        title: `Scheduled Re-check in ${recheckDays} Days`,
        details: `Set a follow-up reminder to evaluate whether cultural adjustments or treatments have contained the ${analysis.diseaseName}.`
      });
    }

    return plan;
  }
}
