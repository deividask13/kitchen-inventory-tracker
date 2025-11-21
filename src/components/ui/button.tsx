'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
}

const buttonVariants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500',
};

const buttonSizes = {
  default: 'h-10 min-h-[44px] px-4 py-2',
  sm: 'h-8 min-h-[44px] px-3',
  lg: 'h-12 min-h-[44px] px-8',
  icon: 'h-10 w-10 min-h-[44px] min-w-[44px] p-0',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none touch-target tap-highlight-none';
    
    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          buttonSizes[size],
          buttonVariants[variant],
          className
        )}
        disabled={disabled || loading}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {loading && (
          <motion.div
            className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ 
              opacity: 1, 
              rotate: 360,
            }}
            transition={{ 
              opacity: { duration: 0.2 },
              rotate: { duration: 1, repeat: Infinity, ease: 'linear' }
            }}
          />
        )}
        <motion.span
          initial={{ opacity: loading ? 0 : 1 }}
          animate={{ opacity: loading ? 0.7 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };