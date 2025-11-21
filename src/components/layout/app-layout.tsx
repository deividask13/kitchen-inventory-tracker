'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { MobileNavigation } from './mobile-navigation';
import { DesktopSidebar } from './desktop-sidebar';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { PWAInstallPrompt } from '@/components/ui/pwa-install-prompt';
import { KeyboardShortcutsHelp, PageTransition } from '@/components/ui';
import { useResponsive, useKeyboardShortcuts, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isMobile, isDesktop } = useResponsive();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const prevIsMobileRef = useRef(isMobile);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'b',
      ctrlKey: true,
      action: () => setSidebarOpen(!sidebarOpen),
      description: 'Toggle sidebar',
      disabled: isMobile,
    },
  ]);

  // Auto-close mobile overlay sidebar when switching from mobile to desktop
  useEffect(() => {
    const wasMobile = prevIsMobileRef.current;
    
    // Only close sidebar if we just transitioned from mobile to desktop
    if (wasMobile && !isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
    
    // Update the ref for next render
    prevIsMobileRef.current = isMobile;
  }, [isMobile, sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 safe-area-inset">
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <DesktopSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
      )}

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out min-h-screen-safe',
          !isMobile && sidebarOpen ? 'ml-64' : !isMobile ? 'ml-16' : 'ml-0',
          isMobile && 'pb-16' // Account for mobile navigation
        )}
      >
        {/* Mobile Header */}
        {isMobile && (
          <motion.header
            className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between safe-area-top sticky top-0 z-30"
            initial={prefersReducedMotion ? false : { y: -50, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}
            transition={prefersReducedMotion ? {} : { duration: 0.3 }}
          >
            <h1 className="text-lg font-semibold text-gray-900">
              Kitchen Tracker
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="touch-target p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 tap-highlight-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </motion.header>
        )}

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-hidden" role="main">
          <PageTransition className="h-full">
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation />}

      {/* Keyboard Shortcuts Help (Desktop only) */}
      <KeyboardShortcutsHelp />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? {} : { opacity: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 safe-area-inset"
              initial={prefersReducedMotion ? false : { x: -256 }}
              animate={prefersReducedMotion ? {} : { x: 0 }}
              exit={prefersReducedMotion ? {} : { x: -256 }}
              transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 300, damping: 30 }}
            >
              <DesktopSidebar 
                isOpen={true} 
                onToggle={() => setSidebarOpen(false)}
                isMobileOverlay={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}