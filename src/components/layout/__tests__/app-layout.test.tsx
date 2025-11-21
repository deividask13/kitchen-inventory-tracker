import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppLayout } from '../app-layout';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the child components
vi.mock('../mobile-navigation', () => ({
  MobileNavigation: () => <div data-testid="mobile-navigation">Mobile Navigation</div>,
}));

vi.mock('../desktop-sidebar', () => ({
  DesktopSidebar: ({ isOpen, onToggle, isMobileOverlay }: any) => {
    return (
      <div data-testid="desktop-sidebar" data-open={String(isOpen)} data-mobile-overlay={String(isMobileOverlay)}>
        <button onClick={() => onToggle && onToggle()}>Toggle Sidebar</button>
        Desktop Sidebar
      </div>
    );
  },
}));

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('AppLayout', () => {
  beforeEach(() => {
    // Reset window width to desktop
    window.innerWidth = 1024;
    vi.clearAllMocks();
  });

  it('renders children content', () => {
    render(
      <AppLayout>
        <div>Test content</div>
      </AppLayout>
    );
    
    expect(screen.getByText(/test content/i)).toBeInTheDocument();
  });

  it('renders desktop sidebar on desktop', () => {
    window.innerWidth = 1024;
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );
    
    expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-navigation')).not.toBeInTheDocument();
  });

  it('renders mobile navigation on mobile', () => {
    window.innerWidth = 600;
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );
    
    expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
  });

  it('shows mobile header on mobile', () => {
    window.innerWidth = 600;
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText(/kitchen tracker/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/toggle menu/i)).toBeInTheDocument();
  });

  it('does not show mobile header on desktop', () => {
    window.innerWidth = 1024;
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );
    
    expect(screen.queryByLabelText(/toggle menu/i)).not.toBeInTheDocument();
  });

  it('sidebar starts in collapsed state', () => {
    const { container } = render(
      <AppLayout>
        <div data-testid="test-content">Content</div>
      </AppLayout>
    );
    
    const mainContentWrapper = container.querySelector('.transition-all');
    
    // Initially should be collapsed (ml-16)
    expect(mainContentWrapper).toHaveClass('ml-16');
  });

  it('applies correct initial margin classes', () => {
    render(
      <AppLayout>
        <div data-testid="main-content">Content</div>
      </AppLayout>
    );
    
    const mainContent = screen.getByTestId('main-content').closest('div[class*="ml-"]');
    
    // Initially collapsed (ml-16)
    expect(mainContent).toHaveClass('ml-16');
    expect(mainContent).toHaveClass('transition-all');
  });

  it('shows mobile overlay when sidebar is toggled on mobile', () => {
    window.innerWidth = 600;
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );
    
    const mobileToggle = screen.getByLabelText(/toggle menu/i);
    fireEvent.click(mobileToggle);
    
    // Should show mobile overlay sidebar
    const overlaysidebar = screen.getAllByTestId('desktop-sidebar')
      .find(sidebar => sidebar.getAttribute('data-mobile-overlay') === 'true');
    
    expect(overlaysidebar).toBeInTheDocument();
  });

  it('has proper main content structure', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1', 'overflow-hidden');
  });

  it('applies background color to root container', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );
    
    const container = screen.getByText(/content/i).closest('.min-h-screen');
    expect(container).toHaveClass('min-h-screen', 'bg-gray-50');
  });

  it('handles window resize events', () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );
    
    // Start with desktop
    expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-navigation')).not.toBeInTheDocument();
    
    // Simulate resize to mobile
    window.innerWidth = 600;
    fireEvent(window, new Event('resize'));
    
    // Should now show mobile navigation
    expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});