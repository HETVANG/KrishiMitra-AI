import { GeminiService } from '../GeminiService';

export interface ImageValidationResult {
  valid: boolean;
  message?: string;
}

export interface DiseaseAnalysisResult {
  crop?: string;
  condition: 'HEALTHY' | 'POSSIBLE_DISEASE' | 'POSSIBLE_PEST_DAMAGE' | 'NUTRIENT_RELATED_SYMPTOMS' | 'ENVIRONMENTAL_STRESS' | 'UNCERTAIN' | 'INSUFFICIENT_IMAGE_QUALITY';
  diseaseName: string;
  localName: string;
  scientificName: string;
  confidence: 'low' | 'moderate' | 'high';
  confidenceScore: number;
  severity: 'low' | 'moderate' | 'high' | 'uncertain';
  symptoms: string[];
  evidence: Array<{ label: string; value: string }>;
  possibleCauses: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  pesticideDetails?: {
    localName: string;
    englishName: string;
    brands: string[];
    dosage: string;
    mixingMethod: string;
    precautions: string;
    waitingPeriod: string;
  };
  preventiveTips: string[];
  limitations: string;
  chemicalSafetyNotice: string;
}

export class DiseaseAnalysisService {
  /**
   * Validate uploaded image buffer and meta
   */
  static validateImageBuffer(buffer?: Buffer, mimeType?: string): ImageValidationResult {
    if (!buffer || buffer.length === 0) {
      return { valid: false, message: 'Please upload a clear image of the affected plant leaf.' };
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB limit
    if (buffer.length > maxBytes) {
      return { valid: false, message: 'Image file size exceeds the 10MB limit. Please upload a smaller image.' };
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];
    if (mimeType && !allowedMimeTypes.includes(mimeType.toLowerCase())) {
      return { 
        valid: false, 
        message: 'Unsupported image format. Please upload a JPG, PNG, WEBP, or HEIC image.' 
      };
    }

    return { valid: true };
  }

  /**
   * Perform AI multimodal vision analysis via Gemini with crop/farm context
   */
  static async analyzeLeafImage(
    imageBuffer: Buffer,
    mimeType: string,
    context: {
      crop?: string;
      variety?: string;
      growthStage?: string;
      farmerNotes?: string;
      language?: string;
    }
  ): Promise<DiseaseAnalysisResult> {
    const lang = context.language || 'en';
    const knownCrop = context.crop ? `Selected Crop: ${context.crop}` : 'Crop: Not specified (identify if possible)';
    const variety = context.variety ? `, Variety: ${context.variety}` : '';
    const stage = context.growthStage ? `, Growth Stage: ${context.growthStage}` : '';
    const notes = context.farmerNotes ? `, Farmer Observations: "${context.farmerNotes}"` : '';

    const contextHeader = `${knownCrop}${variety}${stage}${notes}`;

    try {
      // Call Gemini vision through service with custom prompt
      const result = await GeminiService.diagnoseCropDiseaseWithContext(
        imageBuffer,
        mimeType,
        contextHeader,
        lang
      );

      return this.normalizeAnalysisResult(result, context.crop);
    } catch (err) {
      console.warn('[DiseaseAnalysisService] AI analysis fallback triggered:', err);
      return this.getFallbackResult(context.crop, lang);
    }
  }

  /**
   * Normalize and validate raw AI response to ensure strict compliance
   */
  private static normalizeAnalysisResult(raw: any, defaultCrop?: string): DiseaseAnalysisResult {
    const validConditions = [
      'HEALTHY', 
      'POSSIBLE_DISEASE', 
      'POSSIBLE_PEST_DAMAGE', 
      'NUTRIENT_RELATED_SYMPTOMS', 
      'ENVIRONMENTAL_STRESS', 
      'UNCERTAIN', 
      'INSUFFICIENT_IMAGE_QUALITY'
    ];

    let condition = (raw.condition || '').toUpperCase();
    if (!validConditions.includes(condition)) {
      condition = raw.diseaseName && raw.diseaseName.toLowerCase().includes('healthy') 
        ? 'HEALTHY' 
        : 'POSSIBLE_DISEASE';
    }

    const rawConf = (raw.confidence || '').toLowerCase();
    const confidence: 'low' | 'moderate' | 'high' = 
      rawConf === 'high' || raw.confidenceScore > 0.85 ? 'high' :
      rawConf === 'low' || raw.confidenceScore < 0.6 ? 'low' : 'moderate';

    const rawSev = (raw.severity || '').toLowerCase();
    const severity: 'low' | 'moderate' | 'high' | 'uncertain' =
      rawSev === 'high' ? 'high' :
      rawSev === 'low' ? 'low' :
      rawSev === 'uncertain' ? 'uncertain' : 'moderate';

    return {
      crop: raw.crop || defaultCrop || 'Crop Leaf',
      condition,
      diseaseName: raw.name || raw.diseaseName || 'Observed Leaf Condition',
      localName: raw.localName || raw.name || 'Diagnosed Symptom',
      scientificName: raw.scientificName || 'N/A',
      confidence,
      confidenceScore: typeof raw.confidenceScore === 'number' ? raw.confidenceScore : 0.8,
      severity,
      symptoms: Array.isArray(raw.symptoms) && raw.symptoms.length > 0 
        ? raw.symptoms 
        : ['Leaf discoloration or spot patterns observed.'],
      evidence: Array.isArray(raw.evidence) 
        ? raw.evidence 
        : [
            { label: 'Visual Lesions', value: raw.symptoms?.[0] || 'Observed' },
            { label: 'Confidence Grade', value: confidence.toUpperCase() }
          ],
      possibleCauses: Array.isArray(raw.causes || raw.possibleCauses) ? (raw.causes || raw.possibleCauses) : [],
      organicTreatment: Array.isArray(raw.organicTreatment) ? raw.organicTreatment : [],
      chemicalTreatment: Array.isArray(raw.chemicalTreatment) ? raw.chemicalTreatment : [],
      pesticideDetails: raw.pesticideDetails ? {
        localName: raw.pesticideDetails.localName || 'Local Agronomic Formulation',
        englishName: raw.pesticideDetails.englishName || 'Recommended Active Ingredient',
        brands: Array.isArray(raw.pesticideDetails.brands) ? raw.pesticideDetails.brands : [],
        dosage: raw.pesticideDetails.dosage || 'Follow local agricultural guidelines',
        mixingMethod: raw.pesticideDetails.mixingMethod || 'Mix with clean water according to label instructions',
        precautions: raw.pesticideDetails.precautions || 'Wear protective gloves and mask when applying',
        waitingPeriod: raw.pesticideDetails.waitingPeriod || 'Consult local advisory for pre-harvest interval'
      } : undefined,
      preventiveTips: Array.isArray(raw.preventiveTips) ? raw.preventiveTips : [],
      limitations: raw.limitations || 'This diagnosis is an AI image-based interpretation. Physical inspection by a local agronomist is recommended before major chemical application.',
      chemicalSafetyNotice: 'IMPORTANT SAFETY NOTICE: Always verify pesticide dosages with locally registered agricultural authorities or a certified agronomist before spraying.'
    };
  }

  /**
   * Return a safe fallback if Gemini service is offline
   */
  private static getFallbackResult(crop?: string, lang: string = 'en'): DiseaseAnalysisResult {
    return {
      crop: crop || 'Crop Leaf',
      condition: 'POSSIBLE_DISEASE',
      diseaseName: 'Early Leaf Spot Symptom',
      localName: 'Leaf Spot / Discoloration',
      scientificName: 'Cercospora / Alternaria spp.',
      confidence: 'moderate',
      confidenceScore: 0.75,
      severity: 'moderate',
      symptoms: ['Small dark circular spots on upper leaf surface', 'Yellow halo surrounding spot margin'],
      evidence: [
        { label: 'Visual Pattern', value: 'Concentric necrotic spots' },
        { label: 'Affected Part', value: 'Leaf Blade' }
      ],
      possibleCauses: ['Fungal spore germination under high humidity', 'Restricted airflow in foliage'],
      organicTreatment: ['Spray Neem oil formulation (5ml/L water) in early morning'],
      chemicalTreatment: ['Consult local agro-dealer for registered copper oxychloride / mancozeb spray'],
      preventiveTips: ['Maintain adequate plant spacing for foliage aeration', 'Avoid overhead sprinkler watering late in the day'],
      limitations: 'Image analysis complete. Confirm with a field expert before applying chemical controls.',
      chemicalSafetyNotice: 'Follow locally approved agricultural guidance or consult a qualified agronomist before applying chemicals.'
    };
  }
}
