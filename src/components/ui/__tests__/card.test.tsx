import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText(/card content/i);
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white', 'border', 'border-gray-200', 'p-4');
  });

  it('applies variant classes correctly', () => {
    render(<Card variant="elevated">Elevated card</Card>);
    const card = screen.getByText(/elevated card/i);
    expect(card).toHaveClass('shadow-lg', 'border-gray-100');
  });

  it('applies padding classes correctly', () => {
    render(<Card padding="lg">Large padding</Card>);
    const card = screen.getByText(/large padding/i);
    expect(card).toHaveClass('p-6');
  });

  it('supports custom className', () => {
    render(<Card className="custom-class">Custom card</Card>);
    const card = screen.getByText(/custom card/i);
    expect(card).toHaveClass('custom-class');
  });

  it('renders with no padding', () => {
    render(<Card padding="none">No padding</Card>);
    const card = screen.getByText(/no padding/i);
    expect(card).toHaveClass('p-0');
  });
});

describe('CardHeader', () => {
  it('renders correctly', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    );
    const header = screen.getByText(/header content/i);
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'pb-4');
  });
});

describe('CardTitle', () => {
  it('renders as h3 element', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    );
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Card Title');
    expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');
  });
});

describe('CardDescription', () => {
  it('renders correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
      </Card>
    );
    const description = screen.getByText(/card description/i);
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm', 'text-gray-600');
  });
});

describe('CardContent', () => {
  it('renders correctly', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    );
    const content = screen.getByText(/card content/i);
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('pt-0');
  });
});

describe('CardFooter', () => {
  it('renders correctly', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );
    const footer = screen.getByText(/footer content/i);
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex', 'items-center', 'pt-4');
  });
});

describe('Card composition', () => {
  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>This is a test card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Card');
    expect(screen.getByText(/this is a test card/i)).toBeInTheDocument();
    expect(screen.getByText(/main content goes here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });
});