import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { toast } from 'react-toastify';

let lastBackPressTime = 0;

/**
 * Configure native Android lifecycle listeners, hardware back-button navigation,
 * background/foreground transitions, and deep linking.
 */
export function initNativeLifecycle(navigateFn?: (path: string) => void): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const cleanups: Array<() => void> = [];

  try {
    // 1. Android Hardware Back Button Handler
    const backListenerPromise = CapApp.addListener('backButton', ({ canGoBack }) => {
      // Check if sidebar drawer is open
      if (document.body.classList.contains('sidebar-open')) {
        const backdrop = document.querySelector('[data-sidebar-backdrop="true"]') as HTMLElement;
        if (backdrop) {
          backdrop.click();
          return;
        }
      }

      // Check if any modal close button exists
      const activeModalClose = document.querySelector('[data-modal-close="true"]') as HTMLElement;
      if (activeModalClose) {
        activeModalClose.click();
        return;
      }

      const currentPath = window.location.pathname;
      const isRootPath = currentPath === '/' || currentPath === '/dashboard' || currentPath === '/login';

      if (!isRootPath && (canGoBack || window.history.length > 1)) {
        window.history.back();
      } else {
        // Double-tap back button within 2 seconds to exit app
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
          CapApp.exitApp();
        } else {
          lastBackPressTime = now;
          toast.info('Press back again to exit The Khedut', {
            autoClose: 2000,
            toastId: 'exit-toast',
            position: 'bottom-center',
          });
        }
      }
    });

    cleanups.push(() => {
      backListenerPromise.then(l => l.remove()).catch(() => {});
    });

    // 2. Application State Changes (Foreground / Background)
    const stateListenerPromise = CapApp.addListener('appStateChange', (state) => {
      if (!state.isActive) {
        // App went to background - halt active speech synthesis to save battery & avoid audio leakage
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      }
    });

    cleanups.push(() => {
      stateListenerPromise.then(l => l.remove()).catch(() => {});
    });

    // 3. Deep Linking (Custom Scheme & App Links)
    const urlListenerPromise = CapApp.addListener('appUrlOpen', (event) => {
      try {
        const url = new URL(event.url);
        const path = url.pathname + url.search + url.hash;
        if (path && navigateFn) {
          navigateFn(path);
        } else if (path) {
          window.location.href = path;
        }
      } catch (e) {
        console.warn('[NativeLifecycle] Failed to parse deep link URL:', event.url, e);
      }
    });

    cleanups.push(() => {
      urlListenerPromise.then(l => l.remove()).catch(() => {});
    });

    // 4. Keyboard Auto-Scroll on Input Focus in Android WebView
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target && 
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    cleanups.push(() => {
      window.removeEventListener('focusin', handleFocusIn);
    });

  } catch (err) {
    console.warn('[NativeLifecycle] Error setting up Capacitor lifecycle listeners:', err);
  }

  return () => {
    cleanups.forEach(c => c());
  };
}
