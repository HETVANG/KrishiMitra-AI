import { CopilotContextService, NormalizedFarmContext } from './CopilotContextService';
import { GeminiService } from './GeminiService';
import { FarmTask } from '../models/FarmTask';
import { CopilotConversation } from '../models/CopilotConversation';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL?.trim() || 'gemini-3.1-flash-lite';
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.error('[CopilotService] Failed to initialize Gemini API Client', err);
  }
}

export interface CopilotStructuredOutput {
  answer: string;
  summary: string;
  observations: string[];
  recommendations: string[];
  actions: Array<{
    title: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }>;
  warnings: string[];
  requiredInformation: string[];
  confidence: number;
  sources: string[];
  generatedAt: string;
}

export class CopilotService {
  /**
   * Main entry point for farmer questions to the AI Copilot.
   */
  static async processFarmerQuestion(
    userId: string,
    question: string,
    farmId?: string,
    conversationId?: string,
    language: string = 'en'
  ): Promise<{
    conversationId: string;
    structured: CopilotStructuredOutput;
    contextSummary: any;
  }> {
    // 1. Gather Normalized Farm Context
    const farmContext = await CopilotContextService.getFarmContext(userId, farmId);

    // 2. Fetch or create Conversation record
    let conversation: any = null;
    if (conversationId) {
      conversation = await CopilotConversation.findOne({ _id: conversationId, user: userId });
    }
    
    if (!conversation) {
      conversation = await CopilotConversation.create({
        user: userId,
        farm: farmContext.farm.id,
        title: question.slice(0, 40) || 'Farm Copilot Session',
        messages: []
      });
    }

    // 3. Prepare recent conversation history (last 4 turns to avoid context overflow)
    const recentHistory = conversation.messages.slice(-6).map((m: any) => ({
      role: m.role,
      parts: m.parts
    }));

    // 4. Generate Copilot Response via Gemini or fallback engine
    const structuredOutput = await this.generateStructuredCopilotResponse(
      question,
      farmContext,
      recentHistory,
      language
    );

    // 5. Append messages to Conversation history
    conversation.messages.push({
      role: 'user',
      parts: question,
      createdAt: new Date()
    });

    conversation.messages.push({
      role: 'model',
      parts: structuredOutput.answer,
      structured: structuredOutput,
      createdAt: new Date()
    });

    conversation.lastUpdated = new Date();
    await conversation.save();

    return {
      conversationId: conversation._id.toString(),
      structured: structuredOutput,
      contextSummary: {
        farmName: farmContext.farm.name,
        location: farmContext.farm.location.address,
        crop: farmContext.farm.crops[0]?.name || 'Crop',
        tempCelsius: farmContext.weather.tempCelsius,
        soilStatus: farmContext.soil.available ? 'Tested' : 'Not Tested',
        marketPrice: farmContext.market.avgPrice
      }
    };
  }

  /**
   * Internal structured AI response generator
   */
  private static async generateStructuredCopilotResponse(
    question: string,
    context: NormalizedFarmContext,
    history: Array<{ role: 'user' | 'model'; parts: string }>,
    language: string
  ): Promise<CopilotStructuredOutput> {
    const langNames: Record<string, string> = {
      en: 'English', hi: 'Hindi', gu: 'Gujarati', mr: 'Marathi', pa: 'Punjabi',
      bn: 'Bengali', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
      or: 'Odia', as: 'Assamese', es: 'Spanish', fr: 'French', de: 'German'
    };
    const targetLang = langNames[language] || 'English';

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: geminiModel });

        const systemPrompt = `You are KrishiMitra AI Farm Copilot, a world-class agronomic intelligence engine.
Your task is to provide precise, multi-factor agricultural guidance based on the farmer's real context.

FARM CONTEXT PROVIDED (Verified Data):
- Farm Name: ${context.farm.name} (${context.farm.sizeAcres} Acres, Soil: ${context.farm.soilType}, Water: ${context.farm.waterSource})
- Location: ${context.farm.location.address} (Lat: ${context.farm.location.latitude}, Lng: ${context.farm.location.longitude})
- Primary Crops: ${context.farm.crops.map(c => c.name).join(', ')}
- Live Weather: ${context.weather.available ? `${context.weather.tempCelsius}°C, ${context.weather.condition}, Humidity: ${context.weather.humidity}%, Rain Prob: ${context.weather.rainProbability}%` : 'Weather Data Unavailable'}
- Soil Analysis: ${context.soil.available ? `pH: ${context.soil.ph}, N: ${context.soil.nitrogen}, P: ${context.soil.phosphorus}, K: ${context.soil.potassium}` : 'Soil Analysis Not Performed'}
- Disease History: ${context.disease.available ? `Latest Scan: ${context.disease.latestDiagnosis?.disease} on ${context.disease.latestDiagnosis?.crop} (Condition: ${context.disease.latestDiagnosis?.condition}, Severity: ${context.disease.latestDiagnosis?.severity}, Follow-up Due: ${context.disease.latestDiagnosis?.followUpDate ? new Date(context.disease.latestDiagnosis.followUpDate).toLocaleDateString() : 'None'})` : 'No Recent Leaf Scans'}
- Market Intelligence: ${context.market.available ? `Commodity: ${context.market.commodity}, Market: ${context.market.marketName}, Avg Price: ₹${context.market.avgPrice}` : 'Market Price Unavailable'}

SAFETY & HONESTY RULES:
1. Do NOT invent missing data. If data is marked unavailable, state clearly what info is missing in "requiredInformation".
2. Distinguish observed data from AI interpretation.
3. Recommend expert agronomic consultation if symptoms involve severe chemical/pathological uncertainty.
4. Translate ALL text fields into target language: "${targetLang}".

OUTPUT REQUIREMENT: Return STRICT RAW JSON (no markdown code blocks, no backticks).
Required JSON Schema:
{
  "answer": "Complete, friendly advisory response in ${targetLang}...",
  "summary": "1-sentence executive summary in ${targetLang}...",
  "observations": ["Observation 1 in ${targetLang}", "Observation 2 in ${targetLang}"],
  "recommendations": ["Recommendation 1 in ${targetLang}", "Recommendation 2 in ${targetLang}"],
  "actions": [
    {
      "title": "Action title in ${targetLang}",
      "priority": "high",
      "reason": "Why this action is needed in ${targetLang}"
    }
  ],
  "warnings": ["Warning or precaution in ${targetLang}"],
  "requiredInformation": ["Missing data field if any"],
  "confidence": 0.92,
  "sources": ["KrishiMitra Context Engine", "Open-Meteo Weather", "Agmarknet Market", "Gemini Pathology"]
}`;

        const promptWithContext = `${systemPrompt}\n\nFarmer Question: "${question}"`;

        const chat = model.startChat({
          history: history.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts }]
          })),
          generationConfig: {
            maxOutputTokens: 1800,
            responseMimeType: "application/json"
          }
        });

        const result = await chat.sendMessage(promptWithContext);
        const rawText = result.response.text().trim();

        // Clean & parse JSON
        const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          answer: parsed.answer || rawText,
          summary: parsed.summary || 'Agricultural advice generated based on farm context.',
          observations: parsed.observations || [],
          recommendations: parsed.recommendations || [],
          actions: parsed.actions || [],
          warnings: parsed.warnings || ['Consult a certified agronomist for critical crop decisions.'],
          requiredInformation: parsed.requiredInformation || context.meta.missingFields,
          confidence: parsed.confidence || 0.88,
          sources: parsed.sources || ['KrishiMitra Farm Context Engine'],
          generatedAt: new Date().toISOString()
        };
      } catch (err) {
        console.warn('[CopilotService] Gemini live call failed or returned unparseable output. Using fallback agronomic engine:', err);
      }
    }

    // Dynamic Rule-Based Agronomic Fallback Engine
    return this.generateFallbackAgronomicOutput(question, context, language);
  }

  /**
   * Fallback Agronomic Rule Engine
   */
  private static generateFallbackAgronomicOutput(
    question: string,
    context: NormalizedFarmContext,
    language: string
  ): CopilotStructuredOutput {
    const cropName = context.farm.crops[0]?.name || 'Crop';
    const lowerQ = question.toLowerCase();

    let answer = `Based on your farm "${context.farm.name}" in ${context.farm.location.address}, `;
    let summary = `Agronomic guidance for ${cropName} on your farm.`;
    let observations: string[] = [];
    let recommendations: string[] = [];
    let actions: Array<{ title: string; priority: 'high' | 'medium' | 'low'; reason: string }> = [];
    let warnings: string[] = ['AI recommendations are for advisory guidance. Verify critical chemical applications with local agricultural officers.'];
    let requiredInfo: string[] = [];

    if (context.weather.available) {
      observations.push(`Current temperature is ${context.weather.tempCelsius}°C with ${context.weather.condition}.`);
    } else {
      requiredInfo.push('Live weather coordinates');
    }

    if (context.soil.available) {
      observations.push(`Soil test recorded pH ${context.soil.ph}, N: ${context.soil.nitrogen} kg/ha, P: ${context.soil.phosphorus} kg/ha, K: ${context.soil.potassium} kg/ha.`);
    } else {
      requiredInfo.push('Soil test NPK analysis');
    }

    if (lowerQ.includes('yellow') || lowerQ.includes('leaf') || lowerQ.includes('disease') || lowerQ.includes('color')) {
      summary = `Leaf discoloration detection for ${cropName}.`;
      answer += `yellowing in ${cropName} leaves often points to nitrogen deficiency or early fungal infection under humid conditions.`;
      recommendations.push('Inspect the lower leaves for concentric rings or yellow chlorosis.');
      recommendations.push('Maintain proper field drainage and avoid overhead sprinkler watering in late evening.');
      actions.push({
        title: 'Run Leaf Disease Scan',
        priority: 'high',
        reason: 'Upload a clear photograph to KrishiMitra Disease Detection to verify pathogen.'
      });
      actions.push({
        title: 'Apply Foliar Urea Spray',
        priority: 'medium',
        reason: '1% Urea spray helps recover nitrogen chlorosis.'
      });
    } else if (lowerQ.includes('irrigate') || lowerQ.includes('water')) {
      summary = `Irrigation assessment for ${cropName}.`;
      if (context.weather.rainProbability && context.weather.rainProbability > 50) {
        answer += `rain probability is high (${context.weather.rainProbability}%). Postpone planned irrigation to prevent waterlogging.`;
        actions.push({
          title: 'Postpone Irrigation',
          priority: 'high',
          reason: 'Impending precipitation will fulfill moisture requirements.'
        });
      } else {
        answer += `current moisture levels suggest light irrigation during early morning hours to minimize evaporation.`;
        actions.push({
          title: 'Schedule Early Morning Irrigation',
          priority: 'medium',
          reason: 'Maximizes root uptake and reduces water loss.'
        });
      }
    } else {
      answer += `here is your general farm status update for ${cropName}. Follow recommended nutrient and pest monitoring routines.`;
      recommendations.push('Monitor crop growth stage weekly.');
      recommendations.push('Keep track of market prices before scheduling harvest.');
      actions.push({
        title: 'Perform Weekly Crop Inspection',
        priority: 'medium',
        reason: 'Early detection of pests or nutrient issues prevents yield loss.'
      });
    }

    // Multilingual translation overlay for key fallbacks if Hindi or Gujarati
    if (language === 'hi') {
      answer = `आपकी खेत "${context.farm.name}" के लिए सलाह: ${answer}`;
      summary = `${cropName} की फसल के लिए कृषि मार्गदर्शन।`;
    } else if (language === 'gu') {
      answer = `તમારા ખેતર "${context.farm.name}" માટે ભલામણ: ${answer}`;
      summary = `${cropName} પાક માટે કૃષિ માર્ગદર્શન.`;
    }

    return {
      answer,
      summary,
      observations,
      recommendations,
      actions,
      warnings,
      requiredInformation: requiredInfo,
      confidence: 0.85,
      sources: ['KrishiMitra Context Engine', 'Local Agronomic Knowledge Base'],
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Get Proactive Farm Insights
   */
  static async getProactiveInsights(userId: string, farmId?: string): Promise<Array<{
    id: string;
    type: 'weather' | 'soil' | 'disease' | 'market' | 'harvest';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    actionableStep: string;
  }>> {
    const context = await CopilotContextService.getFarmContext(userId, farmId);
    const insights: Array<any> = [];

    // Weather Insight
    if (context.weather.available && context.weather.rainProbability && context.weather.rainProbability >= 60) {
      insights.push({
        id: 'ins-weather-rain',
        type: 'weather',
        severity: 'warning',
        title: 'High Rainfall Risk Warning',
        description: `Heavy rainfall expected (${context.weather.rainProbability}% probability). Check field drainage.`,
        actionableStep: 'Clear drainage channels to prevent waterlogging around root zones.'
      });
    }

    // Soil Insight
    if (context.soil.available && context.soil.nitrogen !== null && context.soil.nitrogen < 250) {
      insights.push({
        id: 'ins-soil-n',
        type: 'soil',
        severity: 'warning',
        title: 'Low Nitrogen Deficiency Detected',
        description: `Soil test indicates Nitrogen at ${context.soil.nitrogen} kg/ha (Below optimal 280 kg/ha).`,
        actionableStep: 'Apply top-dressing of Neem-coated Urea or organic compost.'
      });
    }

    // Disease Insight
    if (context.disease.available && context.disease.latestDiagnosis) {
      insights.push({
        id: 'ins-disease-recent',
        type: 'disease',
        severity: 'critical',
        title: `Follow-up: ${context.disease.latestDiagnosis.disease}`,
        description: `Recent scan on ${context.disease.latestDiagnosis.crop} detected potential disease symptoms.`,
        actionableStep: 'Inspect lower leaf canopies for spread and follow recommended treatment.'
      });
    }

    // Market Insight
    if (context.market.available && context.market.avgPrice) {
      insights.push({
        id: 'ins-market-price',
        type: 'market',
        severity: 'info',
        title: `Market Rate: ${context.market.commodity}`,
        description: `Latest recorded price in ${context.market.marketName} is ₹${context.market.avgPrice}/Qtl.`,
        actionableStep: 'Review pricing trends before locking in crop buyers.'
      });
    }

    // Fallback default insight if no telemetry triggers
    if (insights.length === 0) {
      insights.push({
        id: 'ins-general-healthy',
        type: 'harvest',
        severity: 'info',
        title: 'Farm Environment Optimal',
        description: `Conditions on ${context.farm.name} are currently stable.`,
        actionableStep: 'Continue routine irrigation and weekly crop monitoring.'
      });
    }

    return insights;
  }

  /**
   * Get Today's Farm Plan
   */
  static async getDailyFarmPlan(userId: string, farmId?: string): Promise<any[]> {
    const context = await CopilotContextService.getFarmContext(userId, farmId);
    const todayStr = new Date().toISOString().split('T')[0];

    // Check existing tasks in DB
    if (context.farm.id) {
      const existing = await FarmTask.find({
        user: userId,
        farm: context.farm.id,
        dueDate: todayStr,
        planType: 'daily'
      }).lean();

      if (existing.length > 0) {
        return existing;
      }
    }

    // Generate fresh tasks based on live farm context
    const generatedTasks = [
      {
        user: userId,
        farm: context.farm.id,
        title: 'Morning Soil Moisture & Canopy Check',
        reason: `Inspect ${context.farm.crops[0]?.name || 'crop'} foliage for morning dew wetness or chlorosis.`,
        priority: 'high',
        durationMinutes: 20,
        dueDate: todayStr,
        planType: 'daily',
        completed: false,
        category: 'disease_check'
      },
      {
        user: userId,
        farm: context.farm.id,
        title: 'Weather & Irrigation Schedule Review',
        reason: context.weather.available ? `Temp: ${context.weather.tempCelsius}°C. Adjust water delivery.` : 'Verify water source availability.',
        priority: 'medium',
        durationMinutes: 15,
        dueDate: todayStr,
        planType: 'daily',
        completed: false,
        category: 'irrigation'
      },
      {
        user: userId,
        farm: context.farm.id,
        title: 'Field Drainage & Boundary Inspection',
        reason: `Ensure ${context.farm.name} boundary channels are clear of debris.`,
        priority: 'low',
        durationMinutes: 30,
        dueDate: todayStr,
        planType: 'daily',
        completed: false,
        category: 'general'
      }
    ];

    if (context.farm.id) {
      await FarmTask.insertMany(generatedTasks);
    }

    return generatedTasks;
  }

  /**
   * Get Weekly Farm Schedule Plan
   */
  static async getWeeklyFarmPlan(userId: string, farmId?: string): Promise<any[]> {
    const context = await CopilotContextService.getFarmContext(userId, farmId);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const cropName = context.farm.crops[0]?.name || 'Crop';

    return days.map((day, idx) => ({
      day,
      tasks: [
        {
          id: `w-task-${idx}-1`,
          title: idx === 0 ? `Fertilizer & NPK Application` : idx === 2 ? `Leaf Disease & Pest Monitoring` : idx === 4 ? `Irrigation System Flush` : `Routine Field Maintenance`,
          reason: `Recommended agronomic schedule for ${cropName} in week ${idx + 1}.`,
          priority: idx === 0 || idx === 2 ? 'high' : 'medium',
          completed: false
        }
      ]
    }));
  }
}
