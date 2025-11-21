'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

const colorClasses = {
  primary: 'border-blue-600 border-t-transparent',
  secondary: 'border-gray-600 border-t-transparent',
  white: 'border-white border-t-transparent'
};

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className 
}: LoadingSpinnerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className={cn(
        'rounded-full border-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      animate={prefersReducedMotion ? {} : { rotate: 360 }}
      transition={prefersReducedMotion ? {} : {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
      role="status"
      aria-label="Loading"
    />
  );
}

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function LoadingDots({ 
  size = 'md', 
  color = 'primary', 
  className 
}: LoadingDotsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const dotSizes = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  };

  const dotColors = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    white: 'bg-white'
  };

  return (
    <div className={cn('flex items-center gap-1', className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            'rounded-full',
            dotSizes[size],
            dotColors[color]
          )}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export function LoadingSkeleton({ 
  className, 
  lines = 3, 
  avatar = false 
}: LoadingSkeletonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className={cn('animate-pulse', className)} role="status" aria-label="Loading content">
      <div className="flex items-start space-x-4">
        {avatar && (
          <motion.div
            className="rounded-full bg-gray-200 h-12 w-12"
            animate={prefersReducedMotion ? {} : {
              opacity: [0.6, 1, 0.6]
            }}
            transition={prefersReducedMotion ? {} : {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                'h-4 bg-gray-200 rounded',
                index === lines - 1 ? 'w-3/4' : 'w-full'
              )}
              animate={prefersReducedMotion ? {} : {
                opacity: [0.6, 1, 0.6]
              }}
              transition={prefersReducedMotion ? {} : {
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...', 
  className 
}: LoadingOverlayProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!isVisible) return null;

  return (
    <motion.div
      className={cn(
        'fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center',
        className
      )}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
      exit={prefersReducedMotion ? {} : { opacity: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.2 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center gap-4"
        initial={prefersReducedMotion ? false : { scale: 0.9, opacity: 0 }}
        animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
        transition={prefersReducedMotion ? {} : {
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
      >
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 font-medium">{message}</p>
      </motion.div>
    </motion.div>
  );
}