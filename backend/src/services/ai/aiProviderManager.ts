import { GeminiService } from '../GeminiService';

export interface AIResponsePayload {
  success: boolean;
  code?: 'SUCCESS' | 'AI_UNAVAILABLE' | 'INSUFFICIENT_DATA' | 'PROVIDER_UNAVAILABLE' | 'IMAGE_QUALITY_INSUFFICIENT' | 'UNCERTAIN_RESULT';
  answer?: string;
  structured?: any;
  sources?: string[];
  confidence?: 'LOW' | 'MODERATE' | 'HIGH';
  confidenceScore?: number;
  providerName: string;
  userMessage?: string;
}

export interface IAIProvider {
  id: string;
  name: string;
  isAvailable(): boolean;
  generateAdvisory(prompt: string, context?: any, language?: string): Promise<AIResponsePayload>;
  diagnoseLeaf(imageBuffer: Buffer, mimeType: string, context?: string, language?: string): Promise<AIResponsePayload>;
}

export class GeminiAIProvider implements IAIProvider {
  id = 'gemini_flash';
  name = 'Google Gemini 1.5 Flash / Flash Lite';

  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  async generateAdvisory(prompt: string, context: any = {}, language: string = 'en'): Promise<AIResponsePayload> {
    if (!this.isAvailable()) {
      return {
        success: false,
        code: 'AI_UNAVAILABLE',
        providerName: this.name,
        userMessage: 'Live AI advisory engine is currently operating in offline rule-based mode.',
        confidence: 'MODERATE'
      };
    }

    try {
      const res = await GeminiService.getChatResponse(prompt, [], language);
      return {
        success: true,
        code: 'SUCCESS',
        answer: res.translated || res.english,
        sources: ['KrishiMitra Agricultural Knowledge Engine', 'ICAR Agronomic Guidelines'],
        confidence: 'HIGH',
        confidenceScore: 0.92,
        providerName: this.name
      };
    } catch (err: any) {
      console.warn('[GeminiAIProvider] Error generating advisory:', err.message);
      return {
        success: false,
        code: err.status === 429 || err.message?.includes('429') ? 'PROVIDER_UNAVAILABLE' : 'AI_UNAVAILABLE',
        providerName: this.name,
        userMessage: 'AI provider is temporarily busy or unavailable. Please try again shortly.'
      };
    }
  }

  async diagnoseLeaf(imageBuffer: Buffer, mimeType: string, context: string = '', language: string = 'en'): Promise<AIResponsePayload> {
    if (!this.isAvailable()) {
      return {
        success: false,
        code: 'AI_UNAVAILABLE',
        providerName: this.name,
        userMessage: 'Live vision AI is unavailable. Please consult an agronomist or retry when online.'
      };
    }

    try {
      const res = await GeminiService.diagnoseCropDiseaseWithContext(imageBuffer, mimeType, context, language);
      
      if (res.condition === 'INSUFFICIENT_IMAGE_QUALITY') {
        return {
          success: false,
          code: 'IMAGE_QUALITY_INSUFFICIENT',
          providerName: this.name,
          userMessage: 'Image quality is too low or blurry. Please upload a clear photo of the leaf.'
        };
      }

      if (res.condition === 'UNCERTAIN') {
        return {
          success: true,
          code: 'UNCERTAIN_RESULT',
          structured: res,
          confidence: 'LOW',
          confidenceScore: res.confidenceScore || 0.4,
          providerName: this.name,
          userMessage: 'Diagnostic uncertainty high. Symptoms unclear. Please inspect crop in field.'
        };
      }

      return {
        success: true,
        code: 'SUCCESS',
        structured: res,
        confidence: res.confidenceScore > 0.8 ? 'HIGH' : 'MODERATE',
        confidenceScore: res.confidenceScore || 0.85,
        providerName: this.name
      };
    } catch (err: any) {
      console.warn('[GeminiAIProvider] Error diagnosing leaf:', err.message);
      return {
        success: false,
        code: 'PROVIDER_UNAVAILABLE',
        providerName: this.name,
        userMessage: 'Multimodal vision provider error. Please try again.'
      };
    }
  }
}

export class FallbackRuleAIProvider implements IAIProvider {
  id = 'fallback_rule_engine';
  name = 'KrishiMitra Deterministic Agronomic Rule Engine';

  isAvailable(): boolean {
    return true;
  }

  async generateAdvisory(prompt: string, _context?: any, language: string = 'en'): Promise<AIResponsePayload> {
    const lower = prompt.toLowerCase();
    let answer = 'For optimal crop growth, inspect soil moisture regularly, maintain proper plant spacing, and follow ICAR nutrient guidelines.';

    if (lower.includes('water') || lower.includes('irrigation')) {
      answer = 'Irrigate early morning or late evening to minimize evaporation losses. Ensure adequate root zone moisture.';
    } else if (lower.includes('disease') || lower.includes('pest')) {
      answer = 'Isolate affected plants immediately. Take clear photos of upper and lower leaf surfaces for expert pathology review.';
    } else if (lower.includes('price') || lower.includes('market')) {
      answer = 'Check live mandi prices for your nearest APMC market before harvesting or transporting produce.';
    }

    return {
      success: true,
      code: 'SUCCESS',
      answer,
      sources: ['KrishiMitra Deterministic Agronomic Knowledge Base'],
      confidence: 'MODERATE',
      confidenceScore: 0.75,
      providerName: this.name
    };
  }

  async diagnoseLeaf(_imageBuffer: Buffer, _mimeType: string, _context?: string, _language?: string): Promise<AIResponsePayload> {
    return {
      success: false,
      code: 'INSUFFICIENT_DATA',
      providerName: this.name,
      userMessage: 'Deterministic engine cannot process image data. Please connect Gemini API or submit for expert review.'
    };
  }
}

export class AIProviderManager {
  private static providers: IAIProvider[] = [
    new GeminiAIProvider(),
    new FallbackRuleAIProvider()
  ];

  /**
   * Get active primary AI provider or fallback
   */
  static getPrimaryProvider(): IAIProvider {
    const available = this.providers.find(p => p.isAvailable());
    return available || this.providers[this.providers.length - 1];
  }

  /**
   * Execute chat advisory with automatic provider fallback
   */
  static async generateAdvisory(prompt: string, context?: any, language?: string): Promise<AIResponsePayload> {
    for (const provider of this.providers) {
      if (!provider.isAvailable()) continue;
      try {
        const res = await provider.generateAdvisory(prompt, context, language);
        if (res.success) return res;
      } catch (err: any) {
        console.warn(`[AIProviderManager] ${provider.name} failed:`, err.message);
      }
    }

    // Fallback to deterministic engine
    const fallback = new FallbackRuleAIProvider();
    return await fallback.generateAdvisory(prompt, context, language);
  }

  /**
   * Execute multimodal vision diagnosis with automatic fallback
   */
  static async diagnoseLeaf(imageBuffer: Buffer, mimeType: string, context?: string, language?: string): Promise<AIResponsePayload> {
    for (const provider of this.providers) {
      if (!provider.isAvailable()) continue;
      try {
        const res = await provider.diagnoseLeaf(imageBuffer, mimeType, context, language);
        if (res.success || res.code === 'IMAGE_QUALITY_INSUFFICIENT') return res;
      } catch (err: any) {
        console.warn(`[AIProviderManager] ${provider.name} diagnosis failed:`, err.message);
      }
    }

    return {
      success: false,
      code: 'PROVIDER_UNAVAILABLE',
      providerName: 'AI Multi-Provider Network',
      userMessage: 'AI vision diagnosis is temporarily unavailable. Please retry or contact an agronomist.'
    };
  }
}
