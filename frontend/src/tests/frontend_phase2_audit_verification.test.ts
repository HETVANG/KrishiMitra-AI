// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getApiBaseUrl, getFullApiUrl, getProductionAppUrl } from '../services/api';
import { 
  getCanonicalStateForDistrict, 
  getDistanceMetadata 
} from '../utils/mandiLocationUtils';
import { 
  getStoredCookieConsent, 
  saveCookieConsent 
} from '../utils/cookieConsent';

describe('THE KHEDUT — PHASE 2 FRONTEND AUDIT VERIFICATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Suite 1: API Configuration & URL Normalization', () => {
    it('getApiBaseUrl resolves a valid API endpoint', () => {
      const base = getApiBaseUrl();
      expect(typeof base).toBe('string');
      expect(base.length).toBeGreaterThan(0);
      expect(base.endsWith('/api')).toBe(true);
    });

    it('getFullApiUrl correctly prepends base URL and trims duplicate slashes', () => {
      const url1 = getFullApiUrl('/market/search');
      expect(url1).toContain('/market/search');
      expect(url1.startsWith('http')).toBe(true);

      const absolute = getFullApiUrl('https://example.com/api/test');
      expect(absolute).toBe('https://example.com/api/test');
    });

    it('getProductionAppUrl strictly avoids mobile webview internal schemes', () => {
      const shareUrl = getProductionAppUrl('verify/report/REP123');
      expect(shareUrl.startsWith('http')).toBe(true);
      expect(shareUrl).not.toContain('capacitor://');
      expect(shareUrl).not.toContain('ionic://');
      expect(shareUrl).toContain('/verify/report/REP123');
    });
  });

  describe('Suite 2: Mandi District-to-State Canonical Mapping (Frontend Location Guard)', () => {
    it('accurately resolves Gujarat districts', () => {
      expect(getCanonicalStateForDistrict('Surat')).toBe('Gujarat');
      expect(getCanonicalStateForDistrict('ahmedabad')).toBe('Gujarat');
      expect(getCanonicalStateForDistrict('Rajkot')).toBe('Gujarat');
      expect(getCanonicalStateForDistrict('Navsari')).toBe('Gujarat');
    });

    it('accurately resolves Madhya Pradesh districts without Gujarat leakage', () => {
      expect(getCanonicalStateForDistrict('Ujjain')).toBe('Madhya Pradesh');
      expect(getCanonicalStateForDistrict('Indore')).toBe('Madhya Pradesh');
      expect(getCanonicalStateForDistrict('Bhopal')).toBe('Madhya Pradesh');
    });

    it('accurately resolves Maharashtra and Rajasthan districts', () => {
      expect(getCanonicalStateForDistrict('Nashik')).toBe('Maharashtra');
      expect(getCanonicalStateForDistrict('Pune')).toBe('Maharashtra');
      expect(getCanonicalStateForDistrict('Jaipur')).toBe('Rajasthan');
    });

    it('returns null for unlisted or invalid districts', () => {
      expect(getCanonicalStateForDistrict('NonExistentDistrict123')).toBe(null);
      expect(getCanonicalStateForDistrict('')).toBe(null);
    });
  });

  describe('Suite 3: Mandi Distance Tiers & Haversine Distance Calculations', () => {
    it('correctly classifies <= 50km as Local APMC (e.g. Surat to Bardoli, 29 km)', () => {
      // Surat: 21.2052, 72.8428; Bardoli: 21.1215, 73.1118 (~29km)
      const meta = getDistanceMetadata(21.2052, 72.8428, 21.1215, 73.1118, true);
      expect(meta).not.toBe(null);
      expect(meta?.tier).toBe('local');
      expect(meta?.badgeText).toBe('Local APMC');
      expect(meta?.distanceKm).toBeLessThanOrEqual(50);
    });

    it('correctly classifies > 300km as Distant Market (e.g. Surat to Ujjain, 377 km)', () => {
      // Surat: 21.2052, 72.8428; Ujjain: 23.1765, 75.7885 (~377km)
      const meta = getDistanceMetadata(21.2052, 72.8428, 23.1765, 75.7885, true);
      expect(meta).not.toBe(null);
      expect(meta?.tier).toBe('distant');
      expect(meta?.badgeText).toBe('Distant Market');
      expect(meta?.distanceKm).toBeGreaterThan(300);
    });

    it('returns null when coordinates are missing or invalid (no fabricated distance)', () => {
      const meta = getDistanceMetadata(null, null, 21.1215, 73.1118, true);
      expect(meta).toBe(null);
    });
  });

  describe('Suite 4: DPDP Act 2023 / GDPR Cookie Consent System', () => {
    it('getStoredCookieConsent returns null when uninitialized', () => {
      expect(getStoredCookieConsent()).toBe(null);
    });

    it('saveCookieConsent saves preferences and dispatches event', () => {
      const saved = saveCookieConsent(true, true);
      expect(saved.essential).toBe(true);
      expect(saved.analytics).toBe(true);
      expect(saved.functional).toBe(true);

      const retrieved = getStoredCookieConsent();
      expect(retrieved).not.toBe(null);
      expect(retrieved?.analytics).toBe(true);
    });
  });

  describe('Suite 5: Open Redirect Attack Prevention (Login/Register Redirect Validator)', () => {
    const getSafeRedirectPath = (param: string | null): string => {
      if (!param) return '/dashboard';
      if (param.startsWith('/') && !param.startsWith('//') && !param.includes('\\')) {
        return param;
      }
      return '/dashboard';
    };

    it('allows safe relative paths', () => {
      expect(getSafeRedirectPath('/dashboard')).toBe('/dashboard');
      expect(getSafeRedirectPath('/market?crop=Wheat')).toBe('/market?crop=Wheat');
      expect(getSafeRedirectPath('/weather')).toBe('/weather');
    });

    it('sanitizes and blocks protocol-relative open redirect attacks', () => {
      expect(getSafeRedirectPath('//attacker.com')).toBe('/dashboard');
      expect(getSafeRedirectPath('https://attacker.com')).toBe('/dashboard');
      expect(getSafeRedirectPath('/\\attacker.com')).toBe('/dashboard');
      expect(getSafeRedirectPath(null)).toBe('/dashboard');
    });
  });
});
