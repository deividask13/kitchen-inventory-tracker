'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  autoFit?: boolean;
  minItemWidth?: string;
}

const gapClasses = {
  none: 'gap-0',
  xs: 'gap-1 sm:gap-2',
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4',
  lg: 'gap-4 sm:gap-6',
  xl: 'gap-6 sm:gap-8',
};

const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    className, 
    columns = { xs: 1, sm: 2, md: 3, lg: 4 },
    gap = 'md',
    autoFit = false,
    minItemWidth = '250px',
    children, 
    ...props 
  }, ref) => {
    // Generate column classes based on breakpoints
    const getColumnClasses = () => {
      const classes = [];
      
      if (autoFit) {
        return `grid-cols-[repeat(auto-fit,minmax(${minItemWidth},1fr))]`;
      }
      
      if (columns.xs) classes.push(`grid-cols-${columns.xs}`);
      if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
      if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
      if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
      if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
      if (columns['2xl']) classes.push(`2xl:grid-cols-${columns['2xl']}`);
      
      return classes.join(' ');
    };

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          getColumnClasses(),
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveGrid.displayName = 'ResponsiveGrid';

export { ResponsiveGrid };