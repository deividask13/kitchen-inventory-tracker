'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  ChevronLeft,
  Menu,
  X 
} from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks';
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

interface DesktopSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobileOverlay?: boolean;
}

export function DesktopSidebar({ isOpen, onToggle, isMobileOverlay = false }: DesktopSidebarProps) {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40',
        isMobileOverlay ? 'w-64' : 'transition-all duration-300 ease-in-out',
        !isMobileOverlay && (isOpen ? 'w-64' : 'w-16')
      )}
      initial={isMobileOverlay ? { x: -256 } : false}
      animate={isMobileOverlay ? { x: 0 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center p-4 border-b border-gray-200",
        isOpen || isMobileOverlay ? "justify-between" : "justify-center"
      )}>
        {(isOpen || isMobileOverlay) && (
          <motion.div
            className="flex items-center space-x-3"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Kitchen Tracker
            </h1>
          </motion.div>
        )}
        
        {!isMobileOverlay && (
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </motion.div>
          </button>
        )}

        {isMobileOverlay && (
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center py-3 rounded-lg transition-all duration-200 relative group',
                'touch-target', // 44px minimum height
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                isOpen || isMobileOverlay ? 'space-x-3 px-3' : 'justify-center',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover-hover:hover:bg-gray-100 hover-hover:hover:text-gray-900 hover-hover:hover:shadow-sm'
              )}
              title={!isOpen && !isMobileOverlay ? item.name : undefined}
              tabIndex={0}
            >
              {/* Active indicator */}
              {isActive && !prefersReducedMotion && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"
                  layoutId="desktopActiveTab"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Static active indicator for reduced motion */}
              {isActive && prefersReducedMotion && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />
              )}
              
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                transition={prefersReducedMotion ? {} : { duration: 0.1 }}
                className="flex-shrink-0"
              >
                {item.icon}
              </motion.div>
              
              {(isOpen || isMobileOverlay) && (
                <motion.span
                  className="font-medium truncate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={prefersReducedMotion ? {} : { duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
              )}

              {/* Tooltip for collapsed state - only on hover-capable devices */}
              {!isOpen && !isMobileOverlay && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 hover-hover:group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 hidden hover-hover:block">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <motion.div
          className="text-xs text-gray-500 text-center"
          initial={false}
          animate={{ opacity: isOpen || isMobileOverlay ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {(isOpen || isMobileOverlay) && 'Kitchen Inventory Tracker v1.0'}
        </motion.div>
      </div>
    </motion.aside>
  );
}