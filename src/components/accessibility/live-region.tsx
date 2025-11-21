'use client';

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  clearAfter?: number;
}

/**
 * Live Region Component
 * Announces dynamic content changes to screen readers
 * Requirement 7.2: Screen reader support with appropriate ARIA labels
 */
export function LiveRegion({ message, politeness = 'polite', clearAfter = 5000 }: LiveRegionProps) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (clearAfter && message) {
      timeoutRef.current = setTimeout(() => {
        // Message will be cleared by parent component
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Hook for managing live region announcements
 */
export function useLiveRegion() {
  const [message, setMessage] = React.useState('');

  const announce = (text: string, politeness: 'polite' | 'assertive' = 'polite') => {
    setMessage(''); // Clear first to ensure re-announcement
    setTimeout(() => setMessage(text), 100);
  };

  return { message, announce };
}

// Import React for the hook
import React from 'react';
