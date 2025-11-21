import { describe, it, expect } from 'vitest';
import {
  pageVariants,
  listContainerVariants,
  listItemVariants,
  gridContainerVariants,
  gridItemVariants,
  buttonVariants,
  formFieldVariants,
  modalVariants,
  overlayVariants,
  loadingVariants,
  skeletonVariants,
  toastVariants,
  swipeVariants,
  getVariants,
  transitions
} from '../animation-variants';

describe('Animation Variants', () => {
  describe('pageVariants', () => {
    it('has correct initial state', () => {
      expect(pageVariants.initial).toEqual({
        opacity: 0,
        x: 20,
        scale: 0.98
      });
    });

    it('has correct animate state', () => {
      expect(pageVariants.in).toEqual({
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
          duration: 0.3,
          ease: 'easeOut'
        }
      });
    });

    it('has correct exit state', () => {
      expect(pageVariants.out).toEqual({
        opacity: 0,
        x: -20,
        scale: 0.98,
        transition: {
          duration: 0.2,
          ease: 'easeIn'
        }
      });
    });
  });

  describe('listContainerVariants', () => {
    it('has stagger configuration', () => {
      expect(listContainerVariants.visible).toHaveProperty('transition');
      expect(listContainerVariants.visible.transition).toHaveProperty('staggerChildren');
      expect(listContainerVariants.visible.transition.staggerChildren).toBe(0.1);
    });

    it('has delay for children', () => {
      expect(listContainerVariants.visible.transition).toHaveProperty('delayChildren');
      expect(listContainerVariants.visible.transition.delayChildren).toBe(0.1);
    });
  });

  describe('listItemVariants', () => {
    it('has spring animation for visible state', () => {
      expect(listItemVariants.visible).toHaveProperty('transition');
      expect(listItemVariants.visible.transition.type).toBe('spring');
      expect(listItemVariants.visible.transition.stiffness).toBe(300);
      expect(listItemVariants.visible.transition.damping).toBe(24);
    });

    it('has correct hidden state', () => {
      expect(listItemVariants.hidden).toEqual({
        opacity: 0,
        y: 20,
        scale: 0.95
      });
    });

    it('has correct exit animation', () => {
      expect(listItemVariants.exit).toEqual({
        opacity: 0,
        x: -100,
        scale: 0.95,
        transition: {
          duration: 0.2,
          ease: 'easeIn'
        }
      });
    });
  });

  describe('gridContainerVariants', () => {
    it('has faster stagger for grid layout', () => {
      expect(gridContainerVariants.visible.transition.staggerChildren).toBe(0.08);
    });
  });

  describe('gridItemVariants', () => {
    it('has hover state for interactive elements', () => {
      expect(gridItemVariants.hover).toEqual({
        y: -4,
        scale: 1.02,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 17
        }
      });
    });

    it('has different initial position than list items', () => {
      expect(gridItemVariants.hidden.y).toBe(30);
      expect(listItemVariants.hidden.y).toBe(20);
    });
  });

  describe('buttonVariants', () => {
    it('has idle, hover, and tap states', () => {
      expect(buttonVariants).toHaveProperty('idle');
      expect(buttonVariants).toHaveProperty('hover');
      expect(buttonVariants).toHaveProperty('tap');
    });

    it('has correct hover scale', () => {
      expect(buttonVariants.hover.scale).toBe(1.02);
    });

    it('has correct tap scale', () => {
      expect(buttonVariants.tap.scale).toBe(0.98);
    });
  });

  describe('formFieldVariants', () => {
    it('has error shake animation', () => {
      expect(formFieldVariants.error).toHaveProperty('x');
      expect(formFieldVariants.error.x).toEqual([-2, 2, -2, 2, 0]);
    });

    it('has focus scale animation', () => {
      expect(formFieldVariants.focus.scale).toBe(1.01);
    });
  });

  describe('modalVariants', () => {
    it('has spring animation for modal appearance', () => {
      expect(modalVariants.visible.transition.type).toBe('spring');
      expect(modalVariants.visible.transition.stiffness).toBe(300);
      expect(modalVariants.visible.transition.damping).toBe(30);
    });
  });

  describe('toastVariants', () => {
    it('has upward slide animation', () => {
      expect(toastVariants.hidden.y).toBe(-50);
      expect(toastVariants.visible.y).toBe(0);
      expect(toastVariants.exit.y).toBe(-50);
    });

    it('has spring animation', () => {
      expect(toastVariants.visible.transition.type).toBe('spring');
      expect(toastVariants.visible.transition.stiffness).toBe(500);
    });
  });

  describe('swipeVariants', () => {
    it('has left and right swipe states', () => {
      expect(swipeVariants.swipeLeft.x).toBe(-100);
      expect(swipeVariants.swipeRight.x).toBe(100);
    });

    it('has reset state', () => {
      expect(swipeVariants.reset.x).toBe(0);
    });
  });

  describe('getVariants utility', () => {
    it('returns original variants when reduced motion is false', () => {
      const result = getVariants(pageVariants, false);
      expect(result).toBe(pageVariants);
    });

    it('returns simplified variants when reduced motion is true', () => {
      const result = getVariants(pageVariants, true);
      
      // Should only have opacity properties, preserving original opacity values
      expect(result.initial).toEqual({ opacity: 0 });
      expect(result.in).toEqual({ opacity: 1 });
      expect(result.out).toEqual({ opacity: 0 });
    });

    it('preserves opacity from original variants', () => {
      const customVariants = {
        hidden: { opacity: 0.5, x: 100 },
        visible: { opacity: 0.8, x: 0 }
      };
      
      const result = getVariants(customVariants, true);
      expect(result.hidden).toEqual({ opacity: 0.5 });
      expect(result.visible).toEqual({ opacity: 0.8 });
    });

    it('handles variants without opacity', () => {
      const customVariants = {
        start: { x: 100, y: 50 },
        end: { x: 0, y: 0 }
      };
      
      const result = getVariants(customVariants, true);
      expect(result.start).toEqual({ opacity: 1 });
      expect(result.end).toEqual({ opacity: 1 });
    });
  });

  describe('transitions presets', () => {
    it('has spring transition preset', () => {
      expect(transitions.spring).toEqual({
        type: 'spring',
        stiffness: 300,
        damping: 24
      });
    });

    it('has bouncy spring preset', () => {
      expect(transitions.springBouncy).toEqual({
        type: 'spring',
        stiffness: 400,
        damping: 17
      });
    });

    it('has gentle spring preset', () => {
      expect(transitions.springGentle).toEqual({
        type: 'spring',
        stiffness: 200,
        damping: 30
      });
    });

    it('has easing presets', () => {
      expect(transitions.easeOut).toEqual({
        duration: 0.3,
        ease: 'easeOut'
      });

      expect(transitions.easeIn).toEqual({
        duration: 0.2,
        ease: 'easeIn'
      });

      expect(transitions.easeInOut).toEqual({
        duration: 0.25,
        ease: 'easeInOut'
      });
    });
  });
});

describe('Animation Variants Integration', () => {
  it('all variants have consistent structure', () => {
    const allVariants = [
      pageVariants,
      listContainerVariants,
      listItemVariants,
      gridContainerVariants,
      gridItemVariants,
      buttonVariants,
      formFieldVariants,
      modalVariants,
      overlayVariants,
      loadingVariants,
      skeletonVariants,
      toastVariants,
      swipeVariants
    ];

    allVariants.forEach(variants => {
      expect(typeof variants).toBe('object');
      expect(variants).not.toBeNull();
      
      // Each variant should have at least one state
      expect(Object.keys(variants).length).toBeGreaterThan(0);
    });
  });

  it('spring transitions have consistent parameters', () => {
    const springVariants = [
      listItemVariants.visible.transition,
      gridItemVariants.visible.transition,
      buttonVariants.hover.transition,
      modalVariants.visible.transition
    ];

    springVariants.forEach(transition => {
      if (transition.type === 'spring') {
        expect(transition).toHaveProperty('stiffness');
        expect(transition).toHaveProperty('damping');
        expect(typeof transition.stiffness).toBe('number');
        expect(typeof transition.damping).toBe('number');
      }
    });
  });

  it('opacity values are within valid range', () => {
    const checkOpacity = (obj: any) => {
      if (typeof obj === 'object' && obj !== null) {
        if ('opacity' in obj) {
          expect(obj.opacity).toBeGreaterThanOrEqual(0);
          expect(obj.opacity).toBeLessThanOrEqual(1);
        }
        Object.values(obj).forEach(value => {
          if (typeof value === 'object') {
            checkOpacity(value);
          }
        });
      }
    };

    const allVariants = [
      pageVariants,
      listItemVariants,
      gridItemVariants,
      modalVariants,
      toastVariants
    ];

    allVariants.forEach(variants => {
      checkOpacity(variants);
    });
  });
});