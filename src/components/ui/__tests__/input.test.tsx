import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText(/enter text/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('h-12', 'min-h-[44px]');
  });

  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    const label = screen.getByText(/username/i);
    const input = screen.getByLabelText(/username/i);
    
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('shows error state', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText(/email/i);
    const errorMessage = screen.getByRole('alert');
    
    expect(input).toHaveClass('border-red-500');
    expect(errorMessage).toHaveTextContent('Invalid email');
    expect(errorMessage).toHaveAttribute('aria-live', 'polite');
  });

  it('shows helper text', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);
    const helperText = screen.getByRole('status');
    
    expect(helperText).toHaveTextContent('Must be at least 8 characters');
    expect(helperText).toHaveAttribute('aria-live', 'polite');
  });

  it('renders with left icon', () => {
    const icon = <span data-testid="left-icon">🔍</span>;
    render(<Input leftIcon={icon} placeholder="Search" />);
    
    const input = screen.getByPlaceholderText(/search/i);
    const leftIcon = screen.getByTestId('left-icon');
    
    expect(leftIcon).toBeInTheDocument();
    expect(input).toHaveClass('pl-10');
  });

  it('renders with right icon', () => {
    const icon = <span data-testid="right-icon">👁️</span>;
    render(<Input rightIcon={icon} placeholder="Password" />);
    
    const input = screen.getByPlaceholderText(/password/i);
    const rightIcon = screen.getByTestId('right-icon');
    
    expect(rightIcon).toBeInTheDocument();
    expect(input).toHaveClass('pr-10');
  });

  it('handles focus and blur events', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Test" />);
    const input = screen.getByPlaceholderText(/test/i);
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="Test" />);
    const input = screen.getByPlaceholderText(/test/i);
    
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText(/disabled input/i);
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('supports different input types', () => {
    render(<Input type="email" placeholder="Email" />);
    const input = screen.getByPlaceholderText(/email/i);
    expect(input).toHaveAttribute('type', 'email');
  });

  it('generates unique id when not provided', () => {
    render(<Input label="Test" />);
    const input = screen.getByLabelText(/test/i);
    expect(input).toHaveAttribute('id');
    expect(input.id).toMatch(/^input-/);
  });

  it('uses provided id', () => {
    render(<Input id="custom-id" label="Test" />);
    const input = screen.getByLabelText(/test/i);
    expect(input).toHaveAttribute('id', 'custom-id');
  });
});