/**
 * Animation variants for consistent motion design across the application
 * Supports reduced motion preferences
 */

import type { Variants } from 'framer-motion';

// Page transition variants
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: 20,
    scale: 0.98
  },
  in: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  out: { 
    opacity: 0, 
    x: -20,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// List item stagger animations
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const listItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  exit: { 
    opacity: 0, 
    x: -100,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// Grid layout animations
export const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const gridItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }
  }
};

// Button interaction variants
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      type: 'spring',
      stiffness: 600,
      damping: 15
    }
  }
};

// Form field animations
export const formFieldVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 10 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  focus: {
    scale: 1.01,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  error: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut'
    }
  }
};

// Modal/overlay animations
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn'
    }
  }
};

// Loading state animations
export const loadingVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// Skeleton loading animation
export const skeletonVariants: Variants = {
  pulse: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Toast notification animations
export const toastVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -50,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    y: -50,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// Swipe action animations
export const swipeVariants: Variants = {
  initial: { x: 0 },
  swipeLeft: { 
    x: -100,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  swipeRight: { 
    x: 100,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  reset: { 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  }
};

// Utility function to get variants based on reduced motion preference
export const getVariants = (variants: Variants, prefersReducedMotion: boolean): Variants => {
  if (prefersReducedMotion) {
    // Return simplified variants for reduced motion
    const reducedVariants: Variants = {};
    Object.keys(variants).forEach(key => {
      const variant = variants[key];
      if (variant && typeof variant === 'object') {
        reducedVariants[key] = { opacity: variant.opacity ?? 1 };
      } else {
        reducedVariants[key] = { opacity: 1 };
      }
    });
    return reducedVariants;
  }
  return variants;
};

// Transition presets
export const transitions = {
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 24
  },
  springBouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 17
  },
  springGentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 30
  },
  easeOut: {
    duration: 0.3,
    ease: 'easeOut' as const
  },
  easeIn: {
    duration: 0.2,
    ease: 'easeIn' as const
  },
  easeInOut: {
    duration: 0.25,
    ease: 'easeInOut' as const
  }
};