'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ResponsiveContainer, ResponsiveText } from '@/components/ui';
import { useResponsive, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils';

export interface ResponsivePageProps extends Omit<HTMLMotionProps<'div'>, 'ref' | 'children'> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  showBackButton?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
}

const ResponsivePage = forwardRef<HTMLDivElement, ResponsivePageProps>(
  ({ 
    className,
    title,
    subtitle,
    actions,
    containerSize = 'xl',
    padding = 'md',
    showBackButton = false,
    onBack,
    children,
    ...props 
  }, ref) => {
    const { isMobile } = useResponsive();
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
      <motion.div
        ref={ref}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.3, ease: 'easeOut' }}
        className={cn('min-h-full', className)}
        {...props}
      >
        <ResponsiveContainer size={containerSize} padding={padding}>
          {/* Page Header */}
          {(title || subtitle || actions || showBackButton) && (
            <div className="mb-6 sm:mb-8">
              {/* Back Button */}
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors touch-target"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Back</span>
                </button>
              )}

              {/* Title and Actions Row */}
              <div className={cn(
                'flex items-start gap-4',
                isMobile ? 'flex-col' : 'flex-row justify-between'
              )}>
                {/* Title Section */}
                {(title || subtitle) && (
                  <div className="flex-1 min-w-0">
                    {title && (
                      <ResponsiveText
                        as="h1"
                        size="3xl"
                        weight="bold"
                        className="text-gray-900 mb-2"
                      >
                        {title}
                      </ResponsiveText>
                    )}
                    {subtitle && (
                      <ResponsiveText
                        as="p"
                        size="lg"
                        className="text-gray-600"
                      >
                        {subtitle}
                      </ResponsiveText>
                    )}
                  </div>
                )}

                {/* Actions Section */}
                {actions && (
                  <div className={cn(
                    'flex-shrink-0',
                    isMobile ? 'w-full' : 'ml-4'
                  )}>
                    <div className={cn(
                      'flex gap-2',
                      isMobile ? 'flex-col sm:flex-row' : 'flex-row'
                    )}>
                      {actions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="space-y-6">
            {children}
          </div>
        </ResponsiveContainer>
      </motion.div>
    );
  }
);

ResponsivePage.displayName = 'ResponsivePage';

export { ResponsivePage };