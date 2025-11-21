'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, Settings } from 'lucide-react';
import { useHapticFeedback, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-6 h-6" aria-hidden="true" />,
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: <Package className="w-6 h-6" aria-hidden="true" />,
  },
  {
    name: 'Shopping',
    href: '/shopping',
    icon: <ShoppingCart className="w-6 h-6" aria-hidden="true" />,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: <Settings className="w-6 h-6" aria-hidden="true" />,
  },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { triggerHaptic } = useHapticFeedback();
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleNavClick = () => {
    triggerHaptic('light');
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-bottom"
      initial={prefersReducedMotion ? false : { y: 100 }}
      animate={prefersReducedMotion ? {} : { y: 0 }}
      transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors relative',
                'touch-target-large', // 56px minimum for better touch
                'tap-highlight-none no-select',
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 active:text-gray-900'
              )}
              aria-label={item.name}
              role="tab"
              aria-selected={isActive}
            >
              {/* Active indicator */}
              {isActive && !prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-blue-50 rounded-lg"
                  layoutId="mobileActiveTab"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Static active indicator for reduced motion */}
              {isActive && prefersReducedMotion && (
                <div className="absolute inset-0 bg-blue-50 rounded-lg" />
              )}
              
              <motion.div
                className="relative z-10 flex flex-col items-center"
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                transition={prefersReducedMotion ? {} : { duration: 0.1 }}
              >
                <div className="mb-1">
                  {item.icon}
                </div>
                <span className="text-xs font-medium leading-tight">
                  {item.name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}