import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '../../utils/scrollLock';

export interface ModalPortalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  zIndex?: number;
  backdropClassName?: string;
  containerClassName?: string;
  closeOnEsc?: boolean;
  closeOnBackdropClick?: boolean;
}

/**
 * Universal Modal Portal & Overlay Isolation Component
 * 
 * - Portals modal content directly to document.body, escaping all parent stacking contexts.
 * - Activates global scroll lock to prevent background page jumping and scrolling.
 * - Restores exact scroll position upon closing.
 * - Enforces clean z-index hierarchy (defaults to z-[100]).
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({
  isOpen,
  onClose,
  children,
  zIndex = 100,
  backdropClassName = 'bg-slate-950/65 backdrop-blur-md',
  containerClassName = 'flex items-start justify-center pt-14 sm:pt-16 md:pt-20 px-3 sm:px-4 pb-6',
  closeOnEsc = true,
  closeOnBackdropClick = true
}) => {
  const [mounted, setMounted] = useState(false);
  useScrollLock(isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key globally with capture phase
  useEffect(() => {
    if (!isOpen || !closeOnEsc || !onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen || !mounted || typeof document === 'undefined') {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick && onClose) {
      e.stopPropagation();
      onClose();
    }
  };

  return createPortal(
    <div
      data-modal-portal="true"
      style={{ zIndex }}
      className={`fixed inset-0 overflow-y-auto ${containerClassName} ${backdropClassName} animate-fade-in text-left`}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      {children}
    </div>,
    document.body
  );
};
