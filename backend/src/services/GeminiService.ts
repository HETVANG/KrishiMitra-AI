import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[Gemini Service] Live Gemini API Client initialized successfully.');
  } catch (err) {
    console.error('[Gemini Service Initialize Error]', err);
  }
} else {
  console.log('[Gemini Service] Running in MOCK mode (No GEMINI_API_KEY configured).');
}

// Helper to fetch localized mock data from disk
const getLocalizedMockData = (language: string): any => {
  try {
    const langCode = (language || 'en').toLowerCase().slice(0, 2);
    const mockFilePath = path.join(__dirname, '..', 'locales', 'mocks', `${langCode}.json`);
    
    if (fs.existsSync(mockFilePath)) {
      const dataStr = fs.readFileSync(mockFilePath, 'utf-8');
      return JSON.parse(dataStr);
    }
  } catch (err) {
    console.warn(`[Mock Loader Warning] Failed to load mock file for lang "${language}":`, err);
  }

  // Fallback to English mock file
  try {
    const fallbackPath = path.join(__dirname, '..', 'locales', 'mocks', 'en.json');
    if (fs.existsSync(fallbackPath)) {
      return JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
    }
  } catch (err) {
    console.error('[Mock Loader Error] Critical - Failed to load English fallback mock:', err);
  }

  // hardcoded fallback if file reads fail completely
  return {
    disease: {
      name: "Tomato Early Blight",
      localName: "Early Blight",
      scientificName: "Alternaria solani",
      confidenceScore: 0.9,
      symptoms: ["Spots on leaves"],
      causes: ["Humidity"],
      chemicalTreatment: ["Mancozeb"],
      organicTreatment: ["Neem oil"],
      pesticideDetails: {
        localName: "Mancozeb",
        englishName: "Mancozeb",
        brands: ["Dithane M-45"],
        dosage: "2g / L",
        mixingMethod: "Mix well",
        precautions: "Wear mask",
        waitingPeriod: "7 days"
      },
      preventiveTips: ["Rotation"]
    },
    cropRecommend: [],
    soilAnalysis: { suitability: [], fertilizerPlan: [], soilImprovementSuggestions: [] },
    weatherAdvice: "Clear skies"
  };
};

export class GeminiService {
  /**
   * AI Chatbot support for 12 languages (returns both translated and original English)
   */
  static async getChatResponse(
    prompt: string,
    history: Array<{ role: 'user' | 'model'; parts: string }>,
    language: string
  ): Promise<{ translated: string; english: string }> {
    
    const langNames: Record<string, string> = {
      en: 'English', hi: 'Hindi', gu: 'Gujarati', mr: 'Marathi', pa: 'Punjabi',
      bn: 'Bengali', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
      or: 'Odia', as: 'Assamese'
    };

    const targetLang = langNames[language] || 'English';

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        
        const systemInstruction = `You are KrishiMitra AI, a friendly and expert agriculture assistant.
        Answer the farmer's questions clearly, concisely, and practically.
        Provide your response in two languages:
        1. Translated response in: ${targetLang} (You must respond ONLY in ${targetLang} for this part).
        2. Original equivalent response in: English

        Return your output in STRICT JSON format with two keys. Do NOT include markdown code fences (e.g. \`\`\`json). Return raw JSON:
        {
          "translated": "Advisory text in ${targetLang}...",
          "english": "Advisory text in English..."
        }

        If the query is unrelated to farming, agriculture, livestock, weather, or market pricing, politely guide them back to agriculture topics.`;

        // Gemini requires the first message in history to be from 'user'
        const firstUserIdx = history.findIndex(h => h.role === 'user');
        const cleanHistory = firstUserIdx !== -1 ? history.slice(firstUserIdx) : [];

        const chat = model.startChat({
          history: cleanHistory.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts }]
          })),
          generationConfig: {
            maxOutputTokens: 1200,
            responseMimeType: "application/json"
          }
        });

        const result = await chat.sendMessage(`${systemInstruction}\n\nUser Question: ${prompt}`);
        const responseText = result.response.text().trim();
        
        const parsed = JSON.parse(responseText);
        return {
          translated: parsed.translated || parsed.english,
          english: parsed.english
        };
      } catch (error) {
        console.error('[Gemini Live Chat Error]', error);
        throw error;
      }
    }

    // Mock Chat Response Engine reading from localized JSON on disk
    const mockData = getLocalizedMockData(language);
    const lowerPrompt = prompt.toLowerCase();
    
    let translated = '';
    let english = '';

    if (lowerPrompt.includes('soybean') && (lowerPrompt.includes('pesticide') || lowerPrompt.includes('recommend'))) {
      translated = language === 'hi'
        ? 'सोयाबीन के लिए अनुशंसित कीटनाशक क्लोरैंट्रानिलिप्रोल (कोराजेन) है, जो तना छेदक के लिए 150 मिलीलीटर प्रति हेक्टेयर है।'
        : language === 'gu'
        ? 'સોયાબીન માટે ભલામણ કરેલ જંતુનાશક ક્લોરેન્ટ્રાનિલિપ્રોલ (કોરાજેન) છે, જે સ્ટેમ બોરર માટે હેક્ટર દીઠ ૧૫૦ મિલી છે.'
        : 'The recommended pesticide for soybean is Chlorantraniliprole (Coragen) at 150ml/ha to control stem borers.';
      english = 'The recommended pesticide for soybean is Chlorantraniliprole (Coragen) at 150ml/ha to control stem borers.';
    } 
    
    else if (lowerPrompt.includes('soybean')) {
      translated = language === 'hi'
        ? 'सोयाबीन एक प्रमुख तिलहन फसल है जो प्रोटीन (लगभग 40%) और तेल (लगभग 20%) से भरपूर होती है।'
        : language === 'gu'
        ? 'સોયાબીન એ એક મુખ્ય તેલીબિયાં પાક છે જે પ્રોટીન (આશરે ૪૦%) અને તેલ (આશરે 20%) થી ભરપૂર છે.'
        : 'Soybean is a major oilseed crop rich in protein (about 40%) and oil (about 20%), widely grown in Kharif season.';
      english = 'Soybean is a major oilseed crop rich in protein (about 40%) and oil (about 20%), widely grown in Kharif season.';
    } 
    
    else if (lowerPrompt.includes('rose') || lowerPrompt.includes('rose plant')) {
      translated = language === 'hi'
        ? 'गुलाब उगाने के लिए, 6-8 घंटे की धूप वाली अच्छी जलनिकासी वाली मिट्टी चुनें और जैविक खाद नियमित रूप से डालें।'
        : language === 'gu'
        ? 'ગુલાબ ઉગાડવા માટે, ૬-૮ કલાકની સૂર્યપ્રકાશવાળી સારી નિકાસવાળી માટી પસંદ કરો અને નિયમિત સેન્દ્રિય ખાતર આપો.'
        : 'To grow a rose plant, choose well-drained loamy soil with 6-8 hours of direct sunlight, prune regularly, and apply organic compost.';
      english = 'To grow a rose plant, choose well-drained loamy soil with 6-8 hours of direct sunlight, prune regularly, and apply organic compost.';
    } 
    
    else if (lowerPrompt.includes('tomato') && (lowerPrompt.includes('fertilizer') || lowerPrompt.includes('npk'))) {
      translated = language === 'hi'
        ? 'टमाटर के लिए, रोपण के समय NPK 5-10-10 खाद का उपयोग करें, और फल आने पर कैल्शियम युक्त पूरक दें।'
        : language === 'gu'
        ? 'ટમેટા માટે, રોપણી સમયે NPK ૫-૧૦-૧૦ ખાતર વાપરો અને ફળ બેસવા સમયે કેલ્શિયમ પૂરક આપો.'
        : 'For tomatoes, use balanced NPK 5-10-10 fertilizer during planting and side-dress with calcium nitrate to prevent blossom end rot.';
      english = 'For tomatoes, use balanced NPK 5-10-10 fertilizer during planting and side-dress with calcium nitrate to prevent blossom end rot.';
    }
    
    else if (lowerPrompt.includes('fertilizer') || lowerPrompt.includes('npk')) {
      translated = mockData.soilAnalysis.fertilizerPlan?.join(' ') || 'Fertilizer advice';
      english = 'For healthy crop growth, apply N-P-K fertilizers based on soil tests. Urea provides nitrogen for leaves, DAP provides phosphorus for roots, and MOP provides potassium for strength.';
    } 
    
    else if (lowerPrompt.includes('pest') || lowerPrompt.includes('disease') || lowerPrompt.includes('leaf')) {
      translated = `রোগ নির্ণয়: ${mockData.disease.name}. চিকিৎসা: ${mockData.disease.pesticideDetails.localName}. ${mockData.disease.pesticideDetails.mixingMethod}`;
      if (language === 'hi') {
        translated = `पहचाना गया रोग: ${mockData.disease.name}। दवा: ${mockData.disease.pesticideDetails.localName}। विधि: ${mockData.disease.pesticideDetails.mixingMethod}`;
      } else if (language === 'gu') {
        translated = `રોગ નિદાન: ${mockData.disease.name}. દવા: ${mockData.disease.pesticideDetails.localName}. પદ્ધતિ: ${mockData.disease.pesticideDetails.mixingMethod}`;
      } else if (language === 'en') {
        translated = `Crop Disease: ${mockData.disease.name}. Pesticide: ${mockData.disease.pesticideDetails.localName}. Dosage: ${mockData.disease.pesticideDetails.dosage}`;
      }
      english = `Detected disease is ${mockData.disease.name} (${mockData.disease.scientificName}). Organic treatment is ${mockData.disease.organicTreatment?.join(', ')}. Chemical: apply ${mockData.disease.pesticideDetails.englishName}.`;
    } 
    
    else {
      if (language === 'hi') {
        translated = 'कृषिमित्र एआई में आपका स्वागत है। मैं मौसम सलाह, मिट्टी विश्लेषण, फसल चयन, रोग स्कैनिंग और मंडी कीमतों में आपकी मदद कर सकता हूं। मैं आज आपके लिए क्या कर सकता हूं?';
      } else if (language === 'gu') {
        translated = 'કૃષિમિત્ર એઆઈમાં તમારું સ્વાગત છે. હું હવામાન માહિતી, જમીન વિશ્લેષણ, પાક પસંદગી અને પાકના રોગ નિદાનમાં મદદ કરી શકું છું. હું આજે તમારા માટે શું કરી શકું?';
      } else {
        translated = `Welcome to KrishiMitra AI. I can assist you with weather advisories, soil parameters analysis, expert consults, crop choices, and disease detection leaf scanning in ${targetLang}. What can I do for you today?`;
      }
      english = 'Welcome to KrishiMitra AI. I can assist you with weather advisories, soil parameters analysis, expert consults, crop choices, and disease detection leaf scanning. What can I do for you today?';
    }

    return { translated, english };
  }

  /**
   * Multimodal Leaf Disease Detection supporting 12 languages & rich pesticide details
   */
  static async diagnoseCropDisease(imageBuffer: Buffer, mimeType: string, language: string = 'en'): Promise<any> {
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        
        const prompt = `You are a professional plant pathologist. Analyze the attached plant leaf image.
        Diagnose the crop disease, or state if it is healthy.
        Translate the ENTIRE JSON response text values into language: "${language}".
        Do NOT leave any text in English (except scientificName).
        Make sure the field scientificName remains in Latin/English characters.
        Return your response in STRICT JSON format with the following keys. Do NOT include markdown code blocks.
        
        {
          "name": "Disease Name (in ${language})",
          "localName": "Common local name of the disease (in ${language})",
          "scientificName": "Latin Scientific Name of the pathogen (e.g. Alternaria solani)",
          "confidenceScore": 0.92,
          "symptoms": ["Symptom 1 in ${language}", "Symptom 2 in ${language}"],
          "causes": ["Cause 1 in ${language}", "Cause 2 in ${language}"],
          "chemicalTreatment": ["Chemical solution in ${language}"],
          "organicTreatment": ["Organic solution in ${language}"],
          "pesticideDetails": {
            "localName": "Pesticide local name (in ${language})",
            "englishName": "Pesticide chemical english name (e.g. Mancozeb)",
            "brands": ["Brand examples in India (e.g. Dithane M-45)"],
            "dosage": "dosage quantity (in ${language})",
            "mixingMethod": "how to mix and apply (in ${language})",
            "precautions": "safety precautions (in ${language})",
            "waitingPeriod": "waiting period before harvesting (in ${language})"
          },
          "preventiveTips": ["Tip 1 in ${language}", "Tip 2 in ${language}"],
          "images": {
            "healthy": "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600",
            "diseased": "https://images.unsplash.com/photo-1598902108854-10e335adac99?w=600",
            "comparison": "https://images.unsplash.com/photo-1589110484198-d2ad9f4bc74d?w=600"
          }
        }`;

        const imagePart = {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType
          }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().trim();
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('[Gemini Live Diagnosis Error]', error);
        throw error;
      }
    }

    // Mock Pathology Database loaded dynamically from lang code JSON files
    const mockData = getLocalizedMockData(language);
    return mockData.disease;
  }

  /**
   * Crop Recommendations
   */
  static async recommendCrops(inputs: {
    state: string;
    district: string;
    soilType: string;
    season: string;
    waterAvailability: string;
    budget: number;
    farmSize: number;
    language?: string;
  }): Promise<Array<any>> {
    const lang = inputs.language || 'en';

    if (genAI) {
      try {
        const langNames: Record<string, string> = {
          en: 'English', hi: 'Hindi', gu: 'Gujarati', mr: 'Marathi', pa: 'Punjabi',
          bn: 'Bengali', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
          or: 'Odia', as: 'Assamese'
        };
        const targetLang = langNames[lang] || 'English';

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const prompt = `You are a senior agricultural advisor. Recommend 3 suitable crops based on these parameters:
        State: ${inputs.state}
        District: ${inputs.district}
        Soil Type: ${inputs.soilType}
        Season: ${inputs.season}
        Water Availability: ${inputs.waterAvailability}
        Available Budget: ₹${inputs.budget}
        Farm Size: ${inputs.farmSize} acres

        Respond ONLY in language: "${targetLang}". Translate all output fields into "${targetLang}" including crop names and descriptions.
        For each crop, estimate:
        - name (Crop name in ${targetLang})
        - profitEstimation (total expected profit in ₹ for this farm size)
        - expectedYield (total yield in kg for this farm size)
        - marketDemand (High/Medium/Low in ${targetLang})
        - growingDuration (in days)
        - riskLevel (Low/Medium/High in ${targetLang})
        - description (farming advice in ${targetLang})

        Return response in STRICT JSON format like this:
        [
          {
            "name": "Crop Name",
            "profitEstimation": 50000,
            "expectedYield": 2000,
            "marketDemand": "High",
            "growingDuration": 110,
            "riskLevel": "Medium",
            "description": "Farming tip..."
          }
        ]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('[Gemini Live Recommendation Error]', error);
        throw error;
      }
    }

    // Mock Recommendations loaded dynamically from disk
    const mockData = getLocalizedMockData(lang);
    const size = inputs.farmSize || 1;
    
    return mockData.cropRecommend.map((crop: any) => ({
      ...crop,
      profitEstimation: crop.profitEstimation * size,
      expectedYield: crop.expectedYield * size
    }));
  }

  /**
   * Soil analysis
   */
  static async analyzeSoil(inputs: {
    pH: number;
    N: number;
    P: number;
    K: number;
    organicCarbon: number;
    language?: string;
  }): Promise<any> {
    const lang = inputs.language || 'en';

    if (genAI) {
      try {
        const langNames: Record<string, string> = {
          en: 'English', hi: 'Hindi', gu: 'Gujarati', mr: 'Marathi', pa: 'Punjabi',
          bn: 'Bengali', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
          or: 'Odia', as: 'Assamese'
        };
        const targetLang = langNames[lang] || 'English';

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const prompt = `You are a soil chemist. Analyze these soil parameters:
        pH: ${inputs.pH}
        Nitrogen (N): ${inputs.N} kg/ha
        Phosphorus (P): ${inputs.P} kg/ha
        Potassium (K): ${inputs.K} kg/ha
        Organic Carbon: ${inputs.organicCarbon}%

        Determine in language: "${targetLang}" (Translate all strings into ${targetLang}):
        1. suitability: List of 3 crops highly suitable for this soil chemistry.
        2. fertilizerPlan: Concrete guidelines for balancing N, P, K deficiency in ${targetLang}.
        3. soilImprovementSuggestions: Organic and chemical treatments in ${targetLang}.

        Return in STRICT JSON format:
        {
          "suitability": ["Crop 1", "Crop 2"],
          "fertilizerPlan": ["Guideline 1", "Guideline 2"],
          "soilImprovementSuggestions": ["Suggestion 1", "Suggestion 2"]
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('[Gemini Live Soil Analysis Error]', error);
        throw error;
      }
    }

    // Mock Soil Analysis loaded dynamically from disk
    const mockData = getLocalizedMockData(lang);
    return mockData.soilAnalysis;
  }
}
