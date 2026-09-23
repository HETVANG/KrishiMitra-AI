import { KnowledgeSource } from './knowledgeTypes';

export class KnowledgeSourceService {
  private static verifiedSources: Record<string, KnowledgeSource> = {
    icar_official: {
      source: 'Indian Council of Agricultural Research (ICAR) Agronomic Handbook',
      sourceType: 'official_gov',
      sourceUrl: 'https://icar.org.in',
      publisher: 'Ministry of Agriculture and Farmers Welfare, Govt of India',
      publishedAt: '2024-01-15',
      verifiedAt: '2026-01-10',
      version: 'v2.4',
      region: 'IN',
      confidence: 'verified'
    },
    tnau_agritech: {
      source: 'Tamil Nadu Agricultural University (TNAU) Agritech Portal',
      sourceUrl: 'https://agritech.tnau.ac.in',
      sourceType: 'university_research',
      publisher: 'TNAU Agritech Directorate',
      publishedAt: '2023-11-01',
      verifiedAt: '2026-02-01',
      version: 'v3.1',
      region: 'IN',
      confidence: 'verified'
    },
    kvk_extension: {
      source: 'Krishi Vigyan Kendra (KVK) Field Extension Guidelines',
      sourceType: 'extension_service',
      publisher: 'ICAR Extension Division',
      publishedAt: '2024-03-10',
      verifiedAt: '2026-02-15',
      version: 'v1.8',
      region: 'IN',
      confidence: 'verified'
    },
    fao_knowledge: {
      source: 'FAO Crop & Water Requirement Manual',
      sourceType: 'verified_agronomic_db',
      sourceUrl: 'https://www.fao.org/land-water',
      publisher: 'Food and Agriculture Organization (FAO)',
      publishedAt: '2022-09-01',
      verifiedAt: '2025-12-01',
      version: 'v5.0',
      region: 'GLOBAL',
      confidence: 'high'
    }
  };

  /**
   * Retrieve source metadata by source key
   */
  static getSource(key: string): KnowledgeSource {
    return this.verifiedSources[key] || this.verifiedSources.icar_official;
  }

  /**
   * Get all registered verified sources
   */
  static getAllSources(): KnowledgeSource[] {
    return Object.values(this.verifiedSources);
  }
}
