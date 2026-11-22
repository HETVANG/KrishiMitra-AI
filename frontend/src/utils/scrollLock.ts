/**
 * Scroll Lock Utility & Multi-Modal Manager for KrishiMitra AI (The Khedut)
 * 
 * Accurately prevents background page scrolling on desktop and mobile (including Android Capacitor)
 * while preserving exact scroll position and preventing layout shifts.
 * Supports multiple nested or sequential modals without premature unlocking.
 */

import { useEffect } from 'react';

let lockCount = 0;
let preservedScrollY = 0;
let previousBodyStyles: {
  position: string;
  top: string;
  left: string;
  width: string;
  overflow: string;
  paddingRight: string;
} | null = null;

/**
 * Locks background scrolling, preserving current scroll position.
 */
export function lockBodyScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  lockCount++;

  if (lockCount === 1) {
    preservedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Calculate scrollbar width to prevent desktop layout jump
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight
    };

    document.body.style.position = 'fixed';
    document.body.style.top = `-${preservedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    document.body.classList.add('modal-scroll-locked');
    document.documentElement.classList.add('modal-scroll-locked');
  }
}

/**
 * Unlocks background scrolling and restores previous scroll position
 * once all active overlays have closed.
 */
export function unlockBodyScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0 && previousBodyStyles) {
    document.body.style.position = previousBodyStyles.position;
    document.body.style.top = previousBodyStyles.top;
    document.body.style.left = previousBodyStyles.left;
    document.body.style.width = previousBodyStyles.width;
    document.body.style.overflow = previousBodyStyles.overflow;
    document.body.style.paddingRight = previousBodyStyles.paddingRight;

    previousBodyStyles = null;

    document.body.classList.remove('modal-scroll-locked');
    document.documentElement.classList.remove('modal-scroll-locked');

    // Restore scroll position cleanly
    window.scrollTo({
      top: preservedScrollY,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
  }
}

/**
 * React hook to automatically lock/unlock scroll based on overlay state.
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (isLocked) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isLocked]);
}
