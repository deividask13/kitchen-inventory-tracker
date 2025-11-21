'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsive } from './use-responsive';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  disabled?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[] = []) {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  // Default global shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: '1',
      altKey: true,
      action: () => router.push('/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      key: '2',
      altKey: true,
      action: () => router.push('/inventory'),
      description: 'Go to Inventory',
    },
    {
      key: '3',
      altKey: true,
      action: () => router.push('/shopping'),
      description: 'Go to Shopping List',
    },
    {
      key: '4',
      altKey: true,
      action: () => router.push('/settings'),
      description: 'Go to Settings',
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => {
        // Focus search input if available
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: 'Focus search',
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        // Focus search input if available
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: 'Focus search (alternative)',
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        // Trigger add new item action if available
        const addButton = document.querySelector('[data-shortcut="add-item"]') as HTMLButtonElement;
        if (addButton) {
          addButton.click();
        }
      },
      description: 'Add new item',
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals or clear focus
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          const closeButton = modal.querySelector('[data-close]') as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          }
        } else {
          // Clear focus from active element
          (document.activeElement as HTMLElement)?.blur();
        }
      },
      description: 'Close modal or clear focus',
    },
  ];

  const allShortcuts = [...defaultShortcuts, ...shortcuts];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only enable shortcuts on desktop
    if (!isDesktop) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      // Allow Escape to work in inputs
      if (event.key !== 'Escape') return;
    }

    for (const shortcut of allShortcuts) {
      if (shortcut.disabled) continue;

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, [allShortcuts, isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, isDesktop]);

  return {
    shortcuts: allShortcuts,
    isEnabled: isDesktop,
  };
}

// Hook for displaying keyboard shortcuts help
export function useKeyboardShortcutsHelp() {
  const { shortcuts, isEnabled } = useKeyboardShortcuts();

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.metaKey) keys.push('Cmd');
    keys.push(shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  const shortcutsList = shortcuts.map(shortcut => ({
    keys: formatShortcut(shortcut),
    description: shortcut.description,
  }));

  return {
    shortcuts: shortcutsList,
    isEnabled,
  };
}