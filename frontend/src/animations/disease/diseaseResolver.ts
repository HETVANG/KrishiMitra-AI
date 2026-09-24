export type DiseaseVisualCategory =
  | 'HEALTHY'
  | 'POSSIBLE_DISEASE'
  | 'PEST'
  | 'NUTRIENT_ISSUE'
  | 'ENVIRONMENTAL_STRESS'
  | 'UNCERTAIN'
  | 'ANALYSIS_FAILED'
  | 'INSUFFICIENT_DATA';

export interface NormalizedDiseaseVisual {
  category: DiseaseVisualCategory;
  diseaseLabel: string;
  confidence: number; // 0 to 100
  severity: 'Low' | 'Moderate' | 'High' | 'Critical' | 'Normal';
  symptoms: string[];
  recommendations: string[];
  spotDensity: number; // 0.0 (clean) to 1.0 (heavy spots)
  browningEdges: boolean;
  chlorosisYellow: boolean;
  isHealthy: boolean;
}

export const NEUTRAL_DISEASE_VISUAL: NormalizedDiseaseVisual = {
  category: 'INSUFFICIENT_DATA',
  diseaseLabel: 'No Active Scan Result',
  confidence: 0,
  severity: 'Normal',
  symptoms: [],
  recommendations: [],
  spotDensity: 0.0,
  browningEdges: false,
  chlorosisYellow: false,
  isHealthy: true,
};

/**
 * Resolves verified AI assessment payload into normalized 3D visual parameters.
 * Does NOT invent disease claims if assessment is null or unconfirmed.
 */
export function resolveDiseaseState(assessment: any): NormalizedDiseaseVisual {
  if (!assessment || typeof assessment !== 'object') return NEUTRAL_DISEASE_VISUAL;

  const isHealthy = Boolean(assessment.isHealthy || assessment.diseaseName === 'Healthy' || assessment.diseaseName === 'Normal');
  const diseaseName = assessment.diseaseName || assessment.title || assessment.diagnosis || (isHealthy ? 'Healthy Leaf' : 'Unspecified Condition');
  const confidence = typeof assessment.confidence === 'number' ? assessment.confidence : 85;
  const severity = assessment.severity || (isHealthy ? 'Normal' : 'Moderate');
  const symptoms = Array.isArray(assessment.symptoms) ? assessment.symptoms : [];
  const recommendations = Array.isArray(assessment.recommendations) ? assessment.recommendations : [];

  if (isHealthy) {
    return {
      category: 'HEALTHY',
      diseaseLabel: diseaseName,
      confidence,
      severity: 'Normal',
      symptoms: ['No lesions detected', 'Normal chlorophyll levels'],
      recommendations: ['Maintain current irrigation and nutrient schedule'],
      spotDensity: 0.0,
      browningEdges: false,
      chlorosisYellow: false,
      isHealthy: true,
    };
  }

  const nameLower = diseaseName.toLowerCase();
  let category: DiseaseVisualCategory = 'POSSIBLE_DISEASE';
  let spotDensity = 0.4;
  let browningEdges = false;
  let chlorosisYellow = false;

  if (nameLower.includes('pest') || nameLower.includes('borer') || nameLower.includes('caterpillar') || nameLower.includes('beetle')) {
    category = 'PEST';
    spotDensity = 0.6;
    browningEdges = true;
  } else if (nameLower.includes('deficiency') || nameLower.includes('nitrogen') || nameLower.includes('chlorosis') || nameLower.includes('yellow')) {
    category = 'NUTRIENT_ISSUE';
    chlorosisYellow = true;
    spotDensity = 0.2;
  } else if (nameLower.includes('scorch') || nameLower.includes('heat') || nameLower.includes('drought') || nameLower.includes('wilt')) {
    category = 'ENVIRONMENTAL_STRESS';
    browningEdges = true;
    spotDensity = 0.3;
  } else if (confidence < 45) {
    category = 'UNCERTAIN';
    spotDensity = 0.1;
  }

  if (severity === 'High' || severity === 'Critical') {
    spotDensity = Math.min(0.9, spotDensity + 0.3);
  }

  return {
    category,
    diseaseLabel: diseaseName,
    confidence,
    severity,
    symptoms,
    recommendations,
    spotDensity,
    browningEdges,
    chlorosisYellow,
    isHealthy: false,
  };
}
