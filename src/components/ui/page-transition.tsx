'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { usePrefersReducedMotion } from '@/hooks';
import { pageVariants, getVariants } from '@/lib/utils/animation-variants';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const variants = getVariants(pageVariants, prefersReducedMotion);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="in"
        exit="out"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface FadeTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
  duration?: number;
}

export function FadeTransition({ 
  children, 
  isVisible, 
  className,
  duration = 0.3 
}: FadeTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? {} : { opacity: 1 }}
          exit={prefersReducedMotion ? {} : { opacity: 0 }}
          transition={prefersReducedMotion ? {} : { duration }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SlideTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  distance?: number;
}

export function SlideTransition({ 
  children, 
  isVisible, 
  direction = 'up',
  className,
  distance = 20
}: SlideTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: distance };
      case 'down': return { y: -distance };
      case 'left': return { x: distance };
      case 'right': return { x: -distance };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? false : { 
            opacity: 0, 
            ...getInitialPosition() 
          }}
          animate={prefersReducedMotion ? {} : { 
            opacity: 1, 
            x: 0, 
            y: 0 
          }}
          exit={prefersReducedMotion ? {} : { 
            opacity: 0, 
            ...getInitialPosition() 
          }}
          transition={prefersReducedMotion ? {} : {
            type: 'spring',
            stiffness: 300,
            damping: 24
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ScaleTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
  scale?: number;
}

export function ScaleTransition({ 
  children, 
  isVisible, 
  className,
  scale = 0.95
}: ScaleTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? false : { 
            opacity: 0, 
            scale 
          }}
          animate={prefersReducedMotion ? {} : { 
            opacity: 1, 
            scale: 1 
          }}
          exit={prefersReducedMotion ? {} : { 
            opacity: 0, 
            scale 
          }}
          transition={prefersReducedMotion ? {} : {
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}