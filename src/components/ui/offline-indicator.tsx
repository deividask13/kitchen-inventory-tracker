'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { useSyncService } from '@/lib/sync-service';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Offline indicator component that shows network status and sync information
 * Displays when offline and provides sync controls when back online
 */
export const OfflineIndicator = () => {
  const { isOnline, wasOffline, resetOfflineFlag } = useOnlineStatus();
  const { getPendingChangesCount, isSyncing, forceSync } = useSyncService();
  const [pendingCount, setPendingCount] = useState(0);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  // Update pending count periodically
  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getPendingChangesCount());
    };

    updateCount();
    const interval = setInterval(updateCount, 1000);
    return () => clearInterval(interval);
  }, [getPendingChangesCount]);

  // Handle sync success feedback
  useEffect(() => {
    if (isOnline && wasOffline && pendingCount === 0 && !isSyncing()) {
      setShowSyncSuccess(true);
      resetOfflineFlag();
      
      // Hide success message after 3 seconds
      const timeout = setTimeout(() => {
        setShowSyncSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [isOnline, wasOffline, pendingCount, isSyncing, resetOfflineFlag]);

  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  // Don't show anything if online and no pending changes
  if (isOnline && pendingCount === 0 && !showSyncSuccess) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-2">
          {/* Offline Status */}
          {!isOnline && (
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">
                You're offline
              </span>
              {pendingCount > 0 && (
                <span className="text-xs bg-orange-100 px-2 py-1 rounded-full">
                  {pendingCount} changes pending
                </span>
              )}
            </div>
          )}

          {/* Back Online with Pending Changes */}
          {isOnline && pendingCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Back online
                </span>
                <span className="text-xs bg-blue-100 px-2 py-1 rounded-full">
                  {pendingCount} changes to sync
                </span>
              </div>
              
              <button
                onClick={handleForceSync}
                disabled={isSyncing()}
                className="flex items-center space-x-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing() ? 'animate-spin' : ''}`} />
                <span>{isSyncing() ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          )}

          {/* Sync Success */}
          {showSyncSuccess && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">
                All changes synced successfully
              </span>
            </div>
          )}

          {/* Sync Error (if needed) */}
          {isOnline && pendingCount > 0 && !isSyncing() && (
            <div className="mt-1 flex items-center justify-center">
              <div className="flex items-center space-x-1 text-xs text-amber-600">
                <AlertCircle className="h-3 w-3" />
                <span>Some changes couldn't be synced. Tap "Sync Now" to retry.</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};