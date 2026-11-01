/**
 * The Khedut - Official Brand Identity Configuration
 * Single source of truth for branding, metadata, support channels, and taglines.
 */
export const BRAND = {
  name: 'THE KHEDUT',
  shortName: 'THE KHEDUT',
  legalName: 'The Khedut Agritech Platform',
  tagline: 'Smart Agriculture. Better Decisions.',
  subTagline: 'Professional Agricultural Intelligence Platform',
  descriptor: 'Farmer Companion & Agronomic Intelligence',
  domain: 'thekhedut.ai',
  supportEmail: 'support@thekhedut.ai',
  salesEmail: 'contact@thekhedut.ai',
  year: 2026,
  version: '2.0.0',
  copyright: '© 2026 THE KHEDUT. All rights reserved.',
  theme: {
    primary: '#245B38',
    secondary: '#4F8A4B',
    accent: '#A5C96A',
    background: '#F7F9F5',
    surface: '#FFFFFF',
    text: '#1D2922',
    mutedText: '#6B786F'
  },
  social: {
    twitter: '@thekhedut_ai',
    linkedin: 'company/the-khedut',
    youtube: '@thekhedut'
  }
} as const;

export default BRAND;
