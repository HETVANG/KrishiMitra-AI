import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

console.log('[KrishiMitra Startup Log] main.tsx starting React mount');
try {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    console.error('[KrishiMitra Startup Log] Root element not found in DOM!');
  } else {
    console.log('[KrishiMitra Startup Log] Root element found, calling createRoot');
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('[KrishiMitra Startup Log] ReactDOM.render completed successfully');
  }
} catch (mountErr) {
  console.error('[KrishiMitra Startup Log] Failed during React mounting phase:', mountErr);
}
