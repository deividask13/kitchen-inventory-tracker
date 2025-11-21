import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { MobileNavigation } from '../mobile-navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

const mockUsePathname = vi.mocked(usePathname);

describe('MobileNavigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
  });

  it('renders all navigation items', () => {
    render(<MobileNavigation />);
    
    expect(screen.getByLabelText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/inventory/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/shopping/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/settings/i)).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    mockUsePathname.mockReturnValue('/inventory');
    render(<MobileNavigation />);
    
    const inventoryLink = screen.getByLabelText(/inventory/i);
    expect(inventoryLink).toHaveClass('text-blue-600');
  });

  it('has proper navigation structure', () => {
    render(<MobileNavigation />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0');
  });

  it('has touch-friendly navigation items', () => {
    render(<MobileNavigation />);
    
    const dashboardLink = screen.getByLabelText(/dashboard/i);
    expect(dashboardLink).toHaveClass('touch-target-large');
  });

  it('renders correct links', () => {
    render(<MobileNavigation />);
    
    expect(screen.getByLabelText(/dashboard/i)).toHaveAttribute('href', '/dashboard');
    expect(screen.getByLabelText(/inventory/i)).toHaveAttribute('href', '/inventory');
    expect(screen.getByLabelText(/shopping/i)).toHaveAttribute('href', '/shopping');
    expect(screen.getByLabelText(/settings/i)).toHaveAttribute('href', '/settings');
  });

  it('shows text labels for all items', () => {
    render(<MobileNavigation />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<MobileNavigation />);
    
    const tabs = screen.getAllByRole('tab');
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-label');
      expect(tab).toHaveAttribute('aria-selected');
    });
  });

  it('applies correct styling for different routes', () => {
    const routes = ['/dashboard', '/inventory', '/shopping', '/settings'];
    
    routes.forEach(route => {
      mockUsePathname.mockReturnValue(route);
      const { rerender } = render(<MobileNavigation />);
      
      const activeTab = screen.getAllByRole('tab').find(tab => 
        tab.classList.contains('text-blue-600')
      );
      
      expect(activeTab).toBeInTheDocument();
      expect(activeTab).toHaveClass('text-blue-600');
      
      rerender(<div />);
    });
  });
});