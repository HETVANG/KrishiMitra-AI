import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

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
