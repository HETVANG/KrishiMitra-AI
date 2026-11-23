export interface CookieConsentPreferences {
  version: number;
  timestamp: string;
  essential: true;
  analytics: boolean;
  functional: boolean;
}

const STORAGE_KEY = 'km_cookie_consent';
const CURRENT_VERSION = 1;

export const getStoredCookieConsent = (): CookieConsentPreferences | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.analytics === 'boolean' && typeof parsed.functional === 'boolean') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const saveCookieConsent = (
  analytics: boolean,
  functional: boolean = true
): CookieConsentPreferences => {
  const preferences: CookieConsentPreferences = {
    version: CURRENT_VERSION,
    timestamp: new Date().toISOString(),
    essential: true,
    analytics,
    functional
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (err) {
    console.warn('[Cookie Consent] Failed to save to localStorage:', err);
  }

  // Notify listeners across the app
  window.dispatchEvent(
    new CustomEvent('km_cookie_consent_updated', { detail: preferences })
  );

  // Apply script gating
  applyAnalyticsGating(preferences);

  return preferences;
};

export const applyAnalyticsGating = (preferences: CookieConsentPreferences | null) => {
  const gaId = (import.meta as any).env.VITE_GA_MEASUREMENT_ID;
  const clarityId = (import.meta as any).env.VITE_CLARITY_PROJECT_ID;

  if (!preferences || !preferences.analytics) {
    // Disable Google Analytics tracking if previously loaded
    if (gaId) {
      (window as any)[`ga-disable-${gaId}`] = true;
    }
    return;
  }

  // Consent given for analytics: initialize if not already injected
  if (gaId && !document.getElementById('km-ga-script')) {
    try {
      (window as any)[`ga-disable-${gaId}`] = false;
      const script1 = document.createElement('script');
      script1.id = 'km-ga-script';
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.id = 'km-ga-config';
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(script2);
      console.log('[Analytics] Google Analytics initialized following user consent.');
    } catch (e) {
      console.warn('[Analytics] Failed to initialize Google Analytics:', e);
    }
  }

  if (clarityId && !document.getElementById('km-clarity-script')) {
    try {
      const script3 = document.createElement('script');
      script3.id = 'km-clarity-script';
      script3.type = 'text/javascript';
      script3.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script","${clarityId}");
      `;
      document.head.appendChild(script3);
      console.log('[Analytics] Microsoft Clarity initialized following user consent.');
    } catch (e) {
      console.warn('[Analytics] Failed to initialize Microsoft Clarity:', e);
    }
  }
};
