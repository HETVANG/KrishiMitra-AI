import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { Capacitor } from '@capacitor/core';
import { getFullApiUrl } from './services/api';

// On native Android / Capacitor, route relative `/api/...` calls to the full production backend URL
if (Capacitor.isNativePlatform()) {
  const originalFetch = window.fetch;
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith('/api')) {
      return originalFetch(getFullApiUrl(input), init);
    }
    return originalFetch(input, init);
  };
}

console.log('[The Khedut Startup Log] main.tsx starting React mount');
try {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    console.error('[The Khedut Startup Log] Root element not found in DOM!');
  } else {
    console.log('[The Khedut Startup Log] Root element found, calling createRoot');
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('[The Khedut Startup Log] ReactDOM.render completed successfully');
  }
} catch (mountErr) {
  console.error('[The Khedut Startup Log] Failed during React mounting phase:', mountErr);
}
