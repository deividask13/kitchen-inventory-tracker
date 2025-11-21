import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { DesktopSidebar } from '../desktop-sidebar';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

const mockUsePathname = vi.mocked(usePathname);

describe('DesktopSidebar', () => {
  const defaultProps = {
    isOpen: true,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
    vi.clearAllMocks();
  });

  it('renders all navigation items', () => {
    render(<DesktopSidebar {...defaultProps} />);
    
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /inventory/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shopping/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('shows app title when expanded', () => {
    render(<DesktopSidebar {...defaultProps} isOpen={true} />);
    expect(screen.getByText(/kitchen tracker/i)).toBeInTheDocument();
  });

  it('hides app title when collapsed', () => {
    render(<DesktopSidebar {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/kitchen tracker/i)).not.toBeInTheDocument();
  });

  it('calls onToggle when toggle button is clicked', () => {
    const onToggle = vi.fn();
    render(<DesktopSidebar {...defaultProps} onToggle={onToggle} />);
    
    const toggleButton = screen.getByLabelText(/collapse sidebar/i);
    fireEvent.click(toggleButton);
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('highlights active navigation item', () => {
    mockUsePathname.mockReturnValue('/inventory');
    render(<DesktopSidebar {...defaultProps} />);
    
    const inventoryLink = screen.getByRole('link', { name: /inventory/i });
    expect(inventoryLink).toHaveClass('bg-blue-50', 'text-blue-600');
  });

  it('shows correct toggle button label based on state', () => {
    const { rerender } = render(<DesktopSidebar {...defaultProps} isOpen={true} />);
    expect(screen.getByLabelText(/collapse sidebar/i)).toBeInTheDocument();
    
    rerender(<DesktopSidebar {...defaultProps} isOpen={false} />);
    expect(screen.getByLabelText(/expand sidebar/i)).toBeInTheDocument();
  });

  it('renders mobile overlay variant correctly', () => {
    render(<DesktopSidebar {...defaultProps} isMobileOverlay={true} />);
    
    expect(screen.getByLabelText(/close sidebar/i)).toBeInTheDocument();
    expect(screen.getByText(/kitchen tracker/i)).toBeInTheDocument();
  });

  it('has proper navigation structure', () => {
    render(<DesktopSidebar {...defaultProps} />);
    
    const aside = screen.getByRole('complementary');
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveClass('fixed', 'left-0', 'top-0', 'h-full');
  });

  it('has touch-friendly navigation items', () => {
    render(<DesktopSidebar {...defaultProps} />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveClass('touch-target');
  });

  it('renders correct links', () => {
    render(<DesktopSidebar {...defaultProps} />);
    
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /inventory/i })).toHaveAttribute('href', '/inventory');
    expect(screen.getByRole('link', { name: /shopping/i })).toHaveAttribute('href', '/shopping');
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
  });

  it('shows tooltips for collapsed state', () => {
    render(<DesktopSidebar {...defaultProps} isOpen={false} />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('title', 'Dashboard');
  });

  it('does not show tooltips for expanded state', () => {
    render(<DesktopSidebar {...defaultProps} isOpen={true} />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).not.toHaveAttribute('title');
  });

  it('shows version info when expanded', () => {
    render(<DesktopSidebar {...defaultProps} isOpen={true} />);
    expect(screen.getByText(/kitchen inventory tracker v1.0/i)).toBeInTheDocument();
  });

  it('hides version info when collapsed', () => {
    render(<DesktopSidebar {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/kitchen inventory tracker v1.0/i)).not.toBeInTheDocument();
  });

  it('applies correct width classes', () => {
    const { rerender } = render(<DesktopSidebar {...defaultProps} isOpen={true} />);
    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('w-64');
    
    rerender(<DesktopSidebar {...defaultProps} isOpen={false} />);
    expect(aside).toHaveClass('w-16');
  });

  it('handles mobile overlay close button', () => {
    const onToggle = vi.fn();
    render(<DesktopSidebar {...defaultProps} onToggle={onToggle} isMobileOverlay={true} />);
    
    const closeButton = screen.getByLabelText(/close sidebar/i);
    fireEvent.click(closeButton);
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});