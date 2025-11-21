'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useKeyboardShortcutsHelp, useResponsive } from '@/hooks';

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const { shortcuts, isEnabled } = useKeyboardShortcutsHelp();
  const { isDesktop } = useResponsive();

  // Only show on desktop devices
  if (!isDesktop || !isEnabled) {
    return null;
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-white shadow-lg hover:shadow-xl"
        title="Keyboard Shortcuts (Ctrl + ?)"
      >
        <Keyboard className="h-5 w-5" />
      </Button>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {isOpen && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Keyboard Shortcuts"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Use these keyboard shortcuts to navigate the app more efficiently.
              </p>
              
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded shadow-sm">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Tip: Press <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">Escape</kbd> to close modals or clear focus.
                </p>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}