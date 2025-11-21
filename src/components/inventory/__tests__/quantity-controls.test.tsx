import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { QuantityControls } from '../quantity-controls';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>),
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

const defaultProps = {
  value: 5,
  unit: 'pieces',
  onChange: vi.fn(),
};

describe('QuantityControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current quantity and unit', () => {
    render(<QuantityControls {...defaultProps} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('pieces')).toBeInTheDocument();
  });

  it('renders increment and decrement buttons', () => {
    render(<QuantityControls {...defaultProps} />);
    
    const incrementButtons = screen.getAllByLabelText('Increase by 1');
    const decrementButtons = screen.getAllByLabelText('Decrease by 1');
    
    expect(incrementButtons.length).toBeGreaterThan(0);
    expect(decrementButtons.length).toBeGreaterThan(0);
  });

  it('renders quick action buttons by default', () => {
    render(<QuantityControls {...defaultProps} />);
    
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByText('+5')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('hides quick action buttons when showQuickActions is false', () => {
    render(<QuantityControls {...defaultProps} showQuickActions={false} />);
    
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
    expect(screen.queryByText('+5')).not.toBeInTheDocument();
  });

  it('calls onChange when increment button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuantityControls {...defaultProps} />);
    
    // Get the main increment button (the one with icon, not the quick action)
    const incrementButtons = screen.getAllByLabelText('Increase by 1');
    const mainIncrementButton = incrementButtons[0]; // First one is the main button
    await user.click(mainIncrementButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(6);
  });

  it('calls onChange when decrement button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuantityControls {...defaultProps} />);
    
    // Get the main decrement button (the one with icon, not the quick action)
    const decrementButtons = screen.getAllByLabelText('Decrease by 1');
    const mainDecrementButton = decrementButtons[0]; // First one is the main button
    await user.click(mainDecrementButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(4);
  });

  it('calls onChange when quick action buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<QuantityControls {...defaultProps} />);
    
    const plusFiveButton = screen.getByText('+5');
    await user.click(plusFiveButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(10);
  });

  it('respects minimum value constraint', async () => {
    const user = userEvent.setup();
    render(<QuantityControls {...defaultProps} value={1} min={0} />);
    
    const minusOneButton = screen.getByText('-1');
    await user.click(minusOneButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(0);
    
    // Should not go below minimum
    const decrementButtons = screen.getAllByLabelText('Decrease by 1');
    const mainDecrementButton = decrementButtons[0]; // First one is the main button
    await user.click(mainDecrementButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(0);
  });

  it('respects maximum value constraint', async () => {
    const user = userEvent.setup();
    render(<QuantityControls {...defaultProps} value={9} max={10} />);
    
    const plusOneButton = screen.getByText('+1');
    await user.click(plusOneButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(10);
    
    // Should not go above maximum
    const incrementButtons = screen.getAllByLabelText('Increase by 1');
    const mainIncrementButton = incrementButtons[0]; // First one is the main button
    await user.click(mainIncrementButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(10);
  });

  it('disables buttons when disabled prop is true', () => {
    render(<QuantityControls {...defaultProps} disabled />);
    
    const incrementButtons = screen.getAllByLabelText('Increase by 1');
    const decrementButtons = screen.getAllByLabelText('Decrease by 1');
    
    expect(incrementButtons[0]).toBeDisabled(); // Main increment button
    expect(decrementButtons[0]).toBeDisabled(); // Main decrement button
    
    // Quick action buttons should also be disabled
    const plusOneButton = screen.getByText('+1').closest('button');
    const minusOneButton = screen.getByText('-1').closest('button');
    expect(plusOneButton).toBeDisabled();
    expect(minusOneButton).toBeDisabled();
  });

  it('disables quick action buttons when they would exceed limits', () => {
    render(<QuantityControls {...defaultProps} value={0} min={0} />);
    
    const minusFiveButton = screen.getByText('-5').closest('button');
    expect(minusFiveButton).toBeDisabled();
    
    const minusOneButton = screen.getByText('-1').closest('button');
    expect(minusOneButton).toBeDisabled();
  });

  it('uses custom step value', async () => {
    const user = userEvent.setup();
    render(<QuantityControls {...defaultProps} step={2} />);
    
    const incrementButtons = screen.getAllByLabelText('Increase by 2');
    const mainIncrementButton = incrementButtons[0]; // First one is the main button
    await user.click(mainIncrementButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(7);
  });

  it('calls onIncrement when provided instead of onChange', async () => {
    const user = userEvent.setup();
    const onIncrement = vi.fn();
    
    render(
      <QuantityControls 
        {...defaultProps} 
        onIncrement={onIncrement}
      />
    );
    
    const incrementButtons = screen.getAllByLabelText('Increase by 1');
    const mainIncrementButton = incrementButtons[0]; // First one is the main button
    await user.click(mainIncrementButton);
    
    expect(onIncrement).toHaveBeenCalledWith(1);
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('calls onDecrement when provided instead of onChange', async () => {
    const user = userEvent.setup();
    const onDecrement = vi.fn();
    
    render(
      <QuantityControls 
        {...defaultProps} 
        onDecrement={onDecrement}
      />
    );
    
    const decrementButtons = screen.getAllByLabelText('Decrease by 1');
    const mainDecrementButton = decrementButtons[0]; // First one is the main button
    await user.click(mainDecrementButton);
    
    expect(onDecrement).toHaveBeenCalledWith(1);
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('shows loading state during async operations', async () => {
    const user = userEvent.setup();
    const slowOnIncrement = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <QuantityControls 
        {...defaultProps} 
        onIncrement={slowOnIncrement}
      />
    );
    
    const incrementButtons = screen.getAllByLabelText('Increase by 1');
    const mainIncrementButton = incrementButtons[0]; // First one is the main button
    await user.click(mainIncrementButton);
    
    expect(mainIncrementButton).toBeDisabled();
  });

  it('applies different size classes', () => {
    const { rerender } = render(<QuantityControls {...defaultProps} size="sm" />);
    
    let incrementButtons = screen.getAllByLabelText('Increase by 1');
    let mainIncrementButton = incrementButtons[0]; // First one is the main button
    expect(mainIncrementButton).toHaveClass('h-8', 'w-8');
    
    rerender(<QuantityControls {...defaultProps} size="lg" />);
    
    incrementButtons = screen.getAllByLabelText('Increase by 1');
    mainIncrementButton = incrementButtons[0]; // First one is the main button
    expect(mainIncrementButton).toHaveClass('h-12', 'w-12');
  });
});