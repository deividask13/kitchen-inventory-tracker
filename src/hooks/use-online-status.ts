import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline status
 * Provides real-time updates when network connectivity changes
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Track if we were previously offline for sync purposes
      if (!navigator.onLine) {
        setWasOffline(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reset wasOffline flag after it's been acknowledged
  const resetOfflineFlag = () => {
    setWasOffline(false);
  };

  return {
    isOnline,
    wasOffline,
    resetOfflineFlag,
  };
};