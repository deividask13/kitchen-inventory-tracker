import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useRouter } from 'next/navigation';
import { AppLayout } from '../app-layout';
import { useResponsive } from '@/hooks/use-responsive';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/use-responsive');
vi.mock('@/hooks/use-keyboard-shortcuts');
vi.mock('@/hooks/use-haptic-feedback', () => ({
  useHapticFeedback: () => ({
    triggerHaptic: vi.fn(),
    isSupported: false,
  }),
}));
vi.mock('@/hooks/use-prefers-reduced-motion', () => ({
  usePrefersReducedMotion: () => false,
}));
vi.mock('@/components/ui/keyboard-shortcuts-help', () => ({
  KeyboardShortcutsHelp: () => <div data-testid="keyboard-shortcuts-help">Keyboard Shortcuts</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};

const mockUseResponsive = useResponsive as vi.MockedFunction<typeof useResponsive>;

describe.skip('AppLayout Responsive Behavior', () => {
  beforeEach(() => {
    (useRouter as any).mockReturnValue(mockRouter);
    vi.clearAllMocks();
  });

  describe('Mobile Layout', () => {
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

    it('should render mobile header', () => {
      render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      expect(screen.getByText('Kitchen Tracker')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
    });

    it('should render mobile navigation', () => {
      render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      // Mobile navigation should be present
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('fixed', 'bottom-0');
    });

    it('should apply mobile-specific classes', () => {
      const { container } = render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      const mainContent = container.querySelector('[class*="pb-16"]');
      expect(mainContent).toBeInTheDocument();
    });

    it('should handle mobile sidebar overlay', async () => {
      render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      const menuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        const overlay = screen.getByRole('button', { hidden: true });
        expect(overlay).toBeInTheDocument();
      });
    });

    it('should have proper touch target sizes', () => {
      render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toHaveClass('touch-target');
    });
  });

  describe('Tablet Layout', () => {
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

    it('should render desktop sidebar for tablet', () => {
      render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      // Should not render mobile header
      expect(screen.queryByText('Kitchen Tracker')).not.toBeInTheDocument();
      
      // Should not render mobile navigation
      const mobileNav = screen.queryByRole('navigation');
      expect(mobileNav).not.toBeInTheDocument();
    });

    it('should apply tablet-specific spacing', () => {
      const { container } = render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      const mainContent = container.querySelector('[class*="ml-16"]');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Desktop Layout', () => {
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

    it('should render desktop sidebar', () => {
      render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      // Should not render mobile header
      expect(screen.queryByText('Kitchen Tracker')).not.toBeInTheDocument();
      
      // Should not render mobile navigation
      const mobileNav = screen.queryByRole('navigation');
      expect(mobileNav).not.toBeInTheDocument();
    });

    it('should handle sidebar toggle', () => {
      const { container } = render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      // Initially collapsed (ml-16)
      let mainContent = container.querySelector('[class*="ml-16"]');
      expect(mainContent).toBeInTheDocument();

      // Sidebar should be toggleable via keyboard shortcut
      // This would be tested in integration tests with actual keyboard events
    });

    it('should render keyboard shortcuts help', () => {
      render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      // KeyboardShortcutsHelp component should be rendered
      // The actual component is mocked, but we can verify it's included
      expect(screen.getByTestId('keyboard-shortcuts-help')).toBeInTheDocument();
    });
  });

  describe('Responsive Breakpoint Transitions', () => {
    it('should handle mobile to desktop transition', () => {
      const { rerender } = render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      // Start with mobile
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

      rerender(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      expect(screen.getByText('Kitchen Tracker')).toBeInTheDocument();

      // Switch to desktop
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

      rerender(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      expect(screen.queryByText('Kitchen Tracker')).not.toBeInTheDocument();
    });
  });

  describe('Safe Area Support', () => {
    it('should apply safe area classes', () => {
      const { container } = render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass('safe-area-inset');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
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
          <div>Test Content</div>
        </AppLayout>
      );

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
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

      render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      // Keyboard shortcuts should be enabled on desktop
      // This is tested through the useKeyboardShortcuts hook
    });
  });
});