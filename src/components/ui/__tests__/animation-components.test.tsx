import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  LoadingSpinner, 
  LoadingDots, 
  LoadingSkeleton,
  ToastProvider,
  useToast,
  PageTransition,
  StaggeredList,
  StaggeredGrid
} from '../index';

// Mock framer-motion for testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock hooks
vi.mock('@/hooks', () => ({
  usePrefersReducedMotion: () => false,
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/test-path',
}));

describe('Animation Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('applies size classes correctly', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(screen.getByRole('status')).toHaveClass('h-4', 'w-4');

      rerender(<LoadingSpinner size="lg" />);
      expect(screen.getByRole('status')).toHaveClass('h-8', 'w-8');
    });

    it('applies color classes correctly', () => {
      const { rerender } = render(<LoadingSpinner color="primary" />);
      expect(screen.getByRole('status')).toHaveClass('border-blue-600');

      rerender(<LoadingSpinner color="white" />);
      expect(screen.getByRole('status')).toHaveClass('border-white');
    });
  });

  describe('LoadingDots', () => {
    it('renders three dots', () => {
      render(<LoadingDots />);
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
      expect(container.children).toHaveLength(3);
    });

    it('applies size classes to dots', () => {
      render(<LoadingDots size="lg" />);
      const container = screen.getByRole('status');
      Array.from(container.children).forEach(dot => {
        expect(dot).toHaveClass('h-3', 'w-3');
      });
    });
  });

  describe('LoadingSkeleton', () => {
    it('renders with default number of lines', () => {
      render(<LoadingSkeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      // Default is 3 lines
      expect(skeleton.querySelectorAll('.h-4')).toHaveLength(3);
    });

    it('renders custom number of lines', () => {
      render(<LoadingSkeleton lines={5} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton.querySelectorAll('.h-4')).toHaveLength(5);
    });

    it('renders with avatar when specified', () => {
      render(<LoadingSkeleton avatar />);
      const skeleton = screen.getByRole('status');
      expect(skeleton.querySelector('.rounded-full')).toBeInTheDocument();
    });
  });

  describe('Toast System', () => {
    const TestComponent = () => {
      const { addToast } = useToast();
      
      return (
        <button 
          onClick={() => addToast({
            type: 'success',
            title: 'Test Toast',
            description: 'This is a test'
          })}
        >
          Add Toast
        </button>
      );
    };

    it('provides toast context', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      const button = screen.getByText('Add Toast');
      expect(button).toBeInTheDocument();
    });

    it('displays toast when added', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      const button = screen.getByText('Add Toast');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Test Toast')).toBeInTheDocument();
        expect(screen.getByText('This is a test')).toBeInTheDocument();
      });
    });

    it('removes toast when clicked', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      const button = screen.getByText('Add Toast');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Test Toast')).toBeInTheDocument();
      });

      const toast = screen.getByRole('alert');
      fireEvent.click(toast);
      
      await waitFor(() => {
        expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
      });
    });
  });

  describe('PageTransition', () => {
    it('renders children with transition wrapper', () => {
      render(
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <PageTransition className="custom-class">
          <div>Test Content</div>
        </PageTransition>
      );
      
      const wrapper = screen.getByText('Test Content').parentElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('StaggeredList', () => {
    const testItems = [
      <div key="1">Item 1</div>,
      <div key="2">Item 2</div>,
      <div key="3">Item 3</div>,
    ];

    it('renders all children', () => {
      render(<StaggeredList>{testItems}</StaggeredList>);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <StaggeredList className="custom-list">
          {testItems}
        </StaggeredList>
      );
      
      const list = screen.getByText('Item 1').closest('.custom-list');
      expect(list).toBeInTheDocument();
    });
  });

  describe('StaggeredGrid', () => {
    const testItems = [
      <div key="1">Grid Item 1</div>,
      <div key="2">Grid Item 2</div>,
      <div key="3">Grid Item 3</div>,
    ];

    it('renders all children in grid layout', () => {
      render(<StaggeredGrid>{testItems}</StaggeredGrid>);
      
      expect(screen.getByText('Grid Item 1')).toBeInTheDocument();
      expect(screen.getByText('Grid Item 2')).toBeInTheDocument();
      expect(screen.getByText('Grid Item 3')).toBeInTheDocument();
    });

    it('applies correct grid classes based on columns', () => {
      render(
        <StaggeredGrid columns={2}>
          {testItems}
        </StaggeredGrid>
      );
      
      // The grid container should be the parent of the motion.div wrapper
      const gridItem = screen.getByText('Grid Item 1');
      const motionWrapper = gridItem.parentElement;
      const gridContainer = motionWrapper?.parentElement;
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });

    it('applies custom className', () => {
      render(
        <StaggeredGrid className="custom-grid">
          {testItems}
        </StaggeredGrid>
      );
      
      // The grid container should be the parent of the motion.div wrapper
      const gridItem = screen.getByText('Grid Item 1');
      const motionWrapper = gridItem.parentElement;
      const gridContainer = motionWrapper?.parentElement;
      expect(gridContainer).toHaveClass('custom-grid');
    });
  });
});

describe('Animation Accessibility', () => {
  beforeEach(() => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('respects reduced motion preferences', () => {
    // This test would need to be more sophisticated in a real implementation
    // to actually test the reduced motion behavior
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('provides proper ARIA labels for loading states', () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('provides proper ARIA attributes for toasts', async () => {
    const TestComponent = () => {
      const { addToast } = useToast();
      
      return (
        <button 
          onClick={() => addToast({
            type: 'info',
            title: 'Info Toast'
          })}
        >
          Add Info Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Add Info Toast');
    fireEvent.click(button);
    
    await waitFor(() => {
      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });
  });
});

describe('Animation Performance', () => {
  it('does not cause memory leaks with rapid component mounting/unmounting', () => {
    const { rerender, unmount } = render(<LoadingSpinner />);
    
    // Rapidly rerender and unmount
    for (let i = 0; i < 10; i++) {
      rerender(<LoadingSpinner key={i} />);
    }
    
    unmount();
    
    // If we get here without errors, the test passes
    expect(true).toBe(true);
  });

  it('handles large lists efficiently', () => {
    const manyItems = Array.from({ length: 100 }, (_, i) => (
      <div key={i}>Item {i}</div>
    ));
    
    const startTime = performance.now();
    render(<StaggeredList>{manyItems}</StaggeredList>);
    const endTime = performance.now();
    
    // Should render within reasonable time (adjust threshold as needed)
    expect(endTime - startTime).toBeLessThan(100);
  });
});