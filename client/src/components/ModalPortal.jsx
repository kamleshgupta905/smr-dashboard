import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Enterprise Modal Portal
 * Attaches modal directly to document.body, guaranteeing complete isolation
 * from any parent CSS transforms, overflow constraints, or z-index traps.
 */
export default function ModalPortal({ children, isOpen = true, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="modal-portal-wrapper" 
      style={{ position: 'relative', zIndex: 10000 }}
    >
      {children}
    </div>,
    document.body
  );
}
