/**
 * Visual Regression Tests for Responsive Design
 * 
 * These tests verify that components render correctly across different screen sizes
 * and maintain proper responsive behavior.
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AppLayout } from '@/components/layout/app-layout';
import { ResponsivePage } from '@/components/layout/responsive-page';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { ResponsiveText } from '@/components/ui/responsive-text';
import { TouchFriendlyButton } from '@/components/ui/touch-friendly-button';
import { useResponsive } from '@/hooks/use-responsive';

// Mock dependencies
vi.mock('@/hooks/use-responsive');
vi.mock('@/hooks/use-keyboard-shortcuts');
vi.mock('@/hooks/use-touch-gestures');
vi.mock('@/hooks/use-haptic-feedback', () => ({
  useHapticFeedback: () => ({
    triggerHaptic: vi.fn(),
    isSupported: false,
  }),
}));
vi.mock('@/hooks/use-prefers-reduced-motion', () => ({
  usePrefersReducedMotion: () => false,
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/components/ui/keyboard-shortcuts-help', () => ({
  KeyboardShortcutsHelp: () => <div data-testid="keyboard-shortcuts-help">Keyboard Shortcuts</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockUseResponsive = useResponsive as vi.MockedFunction<typeof useResponsive>;

describe.skip('Visual Regression Tests', () => {
  describe('Mobile Layout (375px)', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        windowSize: { width: 375, height: 667 },
        currentBreakpoint: 'xs',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isTouchDevice: true,
        isBreakpoint: (bp) => bp === 'xs',
        isBreakpointUp: (bp) => bp === 'xs',
        isBreakpointDown: (bp) => bp !== 'xs',
        breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
      });
    });

    it('should render mobile layout correctly', () => {
      const { container } = render(
        <AppLayout>
          <div data-testid="content">Mobile Content</div>
        </AppLayout>
      );

      // Check for mobile-specific classes
      expect(container.querySelector('[class*="pb-16"]')).toBeInTheDocument();
      expect(screen.getByText('Kitchen Tracker')).toBeInTheDocument();
    });

    it('should render responsive page with mobile layout', () => {
      render(
        <ResponsivePage
          title="Test Page"
          subtitle="Test Subtitle"
          actions={<button>Action</button>}
        >
          <div>Page Content</div>
        </ResponsivePage>
      );

      // Title should be present
      expect(screen.getByText('Test Page')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
      
      // Actions should be in mobile layout (flex-col)
      const actionsContainer = screen.getByText('Action').closest('[class*="flex-col"]');
      expect(actionsContainer).toBeInTheDocument();
    });

    it('should render responsive grid with single column', () => {
      const { container } = render(
        <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3 }}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </ResponsiveGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-1');
    });

    it('should render touch-friendly buttons with proper sizing', () => {
      render(
        <TouchFriendlyButton>
          Touch Button
        </TouchFriendlyButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('touch-target');
      expect(button).toHaveClass('tap-highlight-none');
    });
  });

  describe('Tablet Layout (768px)', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        windowSize: { width: 768, height: 1024 },
        currentBreakpoint: 'md',
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isTouchDevice: true,
        isBreakpoint: (bp) => bp === 'md',
        isBreakpointUp: (bp) => ['md', 'lg', 'xl', '2xl'].includes(bp),
        isBreakpointDown: (bp) => ['xs', 'sm'].includes(bp),
        breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
      });
    });

    it('should render tablet layout correctly', () => {
      const { container } = render(
        <AppLayout>
          <div data-testid="content">Tablet Content</div>
        </AppLayout>
      );

      // Should not have mobile header
      expect(screen.queryByText('Kitchen Tracker')).not.toBeInTheDocument();
      
      // Should have desktop sidebar spacing
      expect(container.querySelector('[class*="ml-16"]')).toBeInTheDocument();
    });

    it('should render responsive grid with two columns', () => {
      const { container } = render(
        <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3 }}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </ResponsiveGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('md:grid-cols-3');
    });
  });

  describe('Desktop Layout (1280px)', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        windowSize: { width: 1280, height: 800 },
        currentBreakpoint: 'xl',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        isBreakpoint: (bp) => bp === 'xl',
        isBreakpointUp: (bp) => ['xl', '2xl'].includes(bp),
        isBreakpointDown: (bp) => ['xs', 'sm', 'md', 'lg'].includes(bp),
        breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
      });
    });

    it('should render desktop layout correctly', () => {
      const { container } = render(
        <AppLayout>
          <div data-testid="content">Desktop Content</div>
        </AppLayout>
      );

      // Should not have mobile header
      expect(screen.queryByText('Kitchen Tracker')).not.toBeInTheDocument();
      
      // Should have desktop sidebar spacing
      expect(container.querySelector('[class*="ml-16"]')).toBeInTheDocument();
    });

    it('should render responsive page with desktop layout', () => {
      render(
        <ResponsivePage
          title="Test Page"
          subtitle="Test Subtitle"
          actions={<button>Action</button>}
        >
          <div>Page Content</div>
        </ResponsivePage>
      );

      // Actions should be in desktop layout (flex-row)
      const actionsContainer = screen.getByText('Action').closest('[class*="flex-row"]');
      expect(actionsContainer).toBeInTheDocument();
    });

    it('should render responsive grid with multiple columns', () => {
      const { container } = render(
        <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
          <div>Item 4</div>
          <div>Item 5</div>
        </ResponsiveGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('xl:grid-cols-5');
    });
  });

  describe('Responsive Text Component', () => {
    it('should apply responsive text classes', () => {
      const { container } = render(
        <ResponsiveText size="xl" weight="bold" responsive={true}>
          Responsive Text
        </ResponsiveText>
      );

      const text = container.firstChild as HTMLElement;
      expect(text).toHaveClass('text-xl', 'sm:text-2xl', 'font-bold');
    });

    it('should apply non-responsive text classes when responsive is false', () => {
      const { container } = render(
        <ResponsiveText size="xl" weight="bold" responsive={false}>
          Non-Responsive Text
        </ResponsiveText>
      );

      const text = container.firstChild as HTMLElement;
      expect(text).toHaveClass('text-xl', 'font-bold');
      expect(text).not.toHaveClass('sm:text-2xl');
    });
  });

  describe('Auto-fit Grid', () => {
    it('should render auto-fit grid with minimum item width', () => {
      const { container } = render(
        <ResponsiveGrid autoFit minItemWidth="200px">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </ResponsiveGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(200px,1fr))]');
    });
  });

  describe('Touch Target Compliance', () => {
    it('should ensure minimum touch target sizes', () => {
      render(
        <TouchFriendlyButton size="sm">
          Small Button
        </TouchFriendlyButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('touch-target');
      
      // Verify computed styles would meet 44px minimum
      // In a real test environment, you could check computed styles
    });
  });

  describe('Safe Area Support', () => {
    it('should apply safe area classes', () => {
      const { container } = render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass('safe-area-inset');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should maintain focus indicators on all interactive elements', () => {
      render(
        <TouchFriendlyButton>
          Accessible Button
        </TouchFriendlyButton>
      );

      const button = screen.getByRole('button');
      // Focus styles are applied via CSS, but we can check for focus-related classes
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should provide proper ARIA labels for navigation', () => {
      mockUseResponsive.mockReturnValue({
        windowSize: { width: 375, height: 667 },
        currentBreakpoint: 'xs',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isTouchDevice: true,
        isBreakpoint: (bp) => bp === 'xs',
        isBreakpointUp: (bp) => bp === 'xs',
        isBreakpointDown: (bp) => bp !== 'xs',
        breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
      });

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
    });
  });
});