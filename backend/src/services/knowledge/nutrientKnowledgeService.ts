import { NutrientKnowledgeItem } from './knowledgeTypes';
import { KnowledgeSourceService } from './knowledgeSourceService';

export class NutrientKnowledgeService {
  private static nutrients: Map<string, NutrientKnowledgeItem> = new Map();

  static init() {
    if (this.nutrients.size > 0) return;

    const icarSource = KnowledgeSourceService.getSource('icar_official');

    // 1. Nitrogen (N)
    this.nutrients.set('nitrogen', {
      id: 'nutrient_n',
      nutrientName: 'Nitrogen (N)',
      category: 'macro',
      role: 'Essential primary macro-nutrient for vegetative shoot growth, chlorophyll synthesis, and protein formation.',
      deficiencySymptoms: [
        'Pale yellowing (chlorosis) starting from older lower leaves progressing upward',
        'Stunted plant growth and thin stems',
        'V-shaped yellowing along midrib from tip inward'
      ],
      excessSymptoms: [
        'Excessive dark green vegetative growth with weak hollow stems',
        'Delayed maturity and flowering',
        'Increased vulnerability to lodging, pest attack, and fungal blast'
      ],
      cropRelationships: ['Cereals (Wheat, Rice, Maize) have high Nitrogen demand during early tillering/vegetative stages'],
      soilRelationships: ['Leaches rapidly in sandy soils under heavy rainfall; split applications recommended'],
      managementGuidance: [
        'Apply Nitrogen in split applications (e.g. basal + tillering + booting) based on soil test or Leaf Color Chart (LCC)',
        'Incorporate bio-fertilizers like Azotobacter or Rhizobium (for leguminous crops)'
      ],
      sources: [icarSource]
    });

    // 2. Phosphorus (P)
    this.nutrients.set('phosphorus', {
      id: 'nutrient_p',
      nutrientName: 'Phosphorus (P)',
      category: 'macro',
      role: 'Crucial for root development, seed germination, early crop establishment, ATP energy transfer, and early maturity.',
      deficiencySymptoms: [
        'Dark green or purplish/reddish discoloration on older leaves and stems',
        'Poor root growth and delayed flowering',
        'Stunted plant height with thin stalks'
      ],
      excessSymptoms: [
        'Interferes with Micronutrient uptake, inducing Zinc or Iron deficiency'
      ],
      cropRelationships: ['Pulses and root/tuber crops require high basal Phosphorus for root nodulation and tuberization'],
      soilRelationships: ['Fixes easily in acidic soils (< 5.5 pH) with Iron/Aluminum and alkaline soils (> 7.5 pH) with Calcium'],
      managementGuidance: [
        'Apply entire Phosphorus quota as basal dose placed near root zone during sowing',
        'Use Phosphate Solubilizing Bacteria (PSB) bio-fertilizer'
      ],
      sources: [icarSource]
    });

    // 3. Potassium (K)
    this.nutrients.set('potassium', {
      id: 'nutrient_k',
      nutrientName: 'Potassium (K)',
      category: 'macro',
      role: 'Regulates stomatal opening, water balance, enzyme activation, drought tolerance, disease resistance, and grain quality.',
      deficiencySymptoms: [
        'Marginal leaf scorching or "burning" starting from leaf tips of older leaves',
        'Weak stems prone to lodging',
        'Increased disease susceptibility and shriveled grains'
      ],
      excessSymptoms: [
        'Can inhibit Magnesium and Calcium absorption'
      ],
      cropRelationships: ['Cotton, Potato, Sugarcane, and Paddy require Potassium for quality fiber, tuber sizing, and stress resilience'],
      soilRelationships: ['K-fixation in illitic clay soils; well supplied in most alluvial soils but deficient in leached red soils'],
      managementGuidance: [
        'Apply Muriate of Potash (MOP) or Sulfate of Potash as basal or split application during flowering/grain filling'
      ],
      sources: [icarSource]
    });

    // 4. Zinc (Zn)
    this.nutrients.set('zinc', {
      id: 'nutrient_zn',
      nutrientName: 'Zinc (Zn)',
      category: 'micro',
      role: 'Essential micronutrient for indole acetic acid (auxin) hormone synthesis and enzyme activation.',
      deficiencySymptoms: [
        'Interveinal chlorosis on young leaves',
        '"Khaira" disease in Rice (bronze/rusty leaf spots)',
        '"White bud" in Maize (white or yellow stripes on young leaves)',
        'Stunted internodes ("rosetting")'
      ],
      excessSymptoms: [
        'Iron chlorosis induced by excess Zinc'
      ],
      cropRelationships: ['Rice, Maize, Wheat, and Citrus are highly sensitive to Zinc deficiency'],
      soilRelationships: ['Deficiency widespread in high pH calcareous soils and continuously flooded paddy fields'],
      managementGuidance: [
        'Apply Zinc Sulfate to soil at sowing or foliar spray of 0.5% Zinc Sulfate + 0.25% lime under extension guidance'
      ],
      sources: [icarSource]
    });
  }

  static getNutrient(nutrientKey: string): NutrientKnowledgeItem | undefined {
    this.init();
    const key = nutrientKey.trim().toLowerCase();
    return this.nutrients.get(key) || Array.from(this.nutrients.values()).find(n => 
      n.nutrientName.toLowerCase().includes(key)
    );
  }

  static getAllNutrients(): NutrientKnowledgeItem[] {
    this.init();
    return Array.from(this.nutrients.values());
  }

  static searchNutrients(query: string): NutrientKnowledgeItem[] {
    this.init();
    const q = query.trim().toLowerCase();
    return Array.from(this.nutrients.values()).filter(n => 
      n.nutrientName.toLowerCase().includes(q) ||
      n.role.toLowerCase().includes(q) ||
      n.deficiencySymptoms.some(s => s.toLowerCase().includes(q))
    );
  }
}
