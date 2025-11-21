'use client';

import { useCallback, useRef } from 'react';

interface HapticFeedback {
  vibrate?: (pattern: number | number[]) => boolean;
}

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface UseHapticFeedbackReturn {
  triggerHaptic: (type?: HapticType) => void;
  isSupported: boolean;
}

/**
 * Custom hook for haptic feedback on mobile devices
 * Provides different vibration patterns for various interaction types
 */
export function useHapticFeedback(): UseHapticFeedbackReturn {
  const lastHapticRef = useRef<number>(0);
  const minInterval = 50; // Minimum time between haptic events (ms)

  const isSupported = typeof window !== 'undefined' && 
    'navigator' in window && 
    'vibrate' in window.navigator;

  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    if (!isSupported) return;

    const now = Date.now();
    if (now - lastHapticRef.current < minInterval) return;

    const navigator = window.navigator as Navigator & HapticFeedback;
    
    if (navigator.vibrate) {
      const patterns: Record<HapticType, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 50,
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [50, 100, 50, 100, 50]
      };

      try {
        navigator.vibrate(patterns[type]);
        lastHapticRef.current = now;
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  }, [isSupported]);

  return {
    triggerHaptic,
    isSupported
  };
}