import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SwipeActions, createSwipeActions } from '../swipe-actions';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, onPanStart, onPan, onPanEnd, ...props }: any, ref: any) => {
        // Convert pan events to mouse events for testing
        const handleMouseDown = (e: any) => {
          if (onPanStart) onPanStart();
        };
        return <div ref={ref} {...props} onMouseDown={handleMouseDown}>{children}</div>;
      }),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>),
    },
    useMotionValue: () => ({ set: vi.fn() }),
    useTransform: () => ({}),
  };
});

const mockLeftActions = [
  {
    id: 'action1',
    label: 'Action 1',
    icon: <span>Icon1</span>,
    color: '#ffffff',
    backgroundColor: '#10b981',
    action: vi.fn(),
  },
];

const mockRightActions = [
  {
    id: 'action2',
    label: 'Action 2',
    icon: <span>Icon2</span>,
    color: '#ffffff',
    backgroundColor: '#ef4444',
    action: vi.fn(),
  },
];

const defaultProps = {
  children: <div>Swipeable Content</div>,
  leftActions: mockLeftActions,
  rightActions: mockRightActions,
};

describe('SwipeActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children content', () => {
    render(<SwipeActions {...defaultProps} />);
    
    expect(screen.getByText('Swipeable Content')).toBeInTheDocument();
  });

  it('renders left actions when provided', () => {
    render(<SwipeActions {...defaultProps} />);
    
    expect(screen.getByText('Action 1')).toBeInTheDocument();
  });

  it('renders right actions when provided', () => {
    render(<SwipeActions {...defaultProps} />);
    
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });

  it('does not render actions when none provided', () => {
    render(
      <SwipeActions leftActions={[]} rightActions={[]}>
        <div>Content</div>
      </SwipeActions>
    );
    
    expect(screen.queryByText('Action 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Action 2')).not.toBeInTheDocument();
  });

  it('executes action when action button is clicked', async () => {
    const user = userEvent.setup();
    render(<SwipeActions {...defaultProps} />);
    
    const actionButton = screen.getByText('Action 1');
    await user.click(actionButton);
    
    expect(mockLeftActions[0].action).toHaveBeenCalled();
  });

  it('calls onSwipeStart when pan starts', () => {
    const onSwipeStart = vi.fn();
    render(<SwipeActions {...defaultProps} onSwipeStart={onSwipeStart} />);
    
    const content = screen.getByText('Swipeable Content');
    fireEvent.mouseDown(content);
    
    expect(onSwipeStart).toHaveBeenCalled();
  });

  it('does not respond to swipe when disabled', () => {
    const onSwipeStart = vi.fn();
    render(<SwipeActions {...defaultProps} disabled onSwipeStart={onSwipeStart} />);
    
    const content = screen.getByText('Swipeable Content');
    fireEvent.mouseDown(content);
    
    expect(onSwipeStart).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SwipeActions {...defaultProps} className="custom-class">
        <div>Content</div>
      </SwipeActions>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('createSwipeActions', () => {
  it('creates markAsUsed action', () => {
    const mockAction = vi.fn();
    const action = createSwipeActions.markAsUsed(mockAction);
    
    expect(action.id).toBe('mark-used');
    expect(action.label).toBe('Mark Used');
    expect(action.backgroundColor).toBe('#10b981');
    
    action.action();
    expect(mockAction).toHaveBeenCalled();
  });

  it('creates markAsFinished action', () => {
    const mockAction = vi.fn();
    const action = createSwipeActions.markAsFinished(mockAction);
    
    expect(action.id).toBe('mark-finished');
    expect(action.label).toBe('Finished');
    expect(action.backgroundColor).toBe('#f59e0b');
  });

  it('creates addToShoppingList action', () => {
    const mockAction = vi.fn();
    const action = createSwipeActions.addToShoppingList(mockAction);
    
    expect(action.id).toBe('add-to-shopping');
    expect(action.label).toBe('Add to List');
    expect(action.backgroundColor).toBe('#3b82f6');
  });

  it('creates edit action', () => {
    const mockAction = vi.fn();
    const action = createSwipeActions.edit(mockAction);
    
    expect(action.id).toBe('edit');
    expect(action.label).toBe('Edit');
    expect(action.backgroundColor).toBe('#6b7280');
  });

  it('creates delete action', () => {
    const mockAction = vi.fn();
    const action = createSwipeActions.delete(mockAction);
    
    expect(action.id).toBe('delete');
    expect(action.label).toBe('Delete');
    expect(action.backgroundColor).toBe('#ef4444');
  });
});