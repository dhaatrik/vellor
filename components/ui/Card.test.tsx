import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Card } from './Card';

// Mock the Icon component since we are testing Card, not Icon
vi.mock('./Icon', () => ({
  Icon: ({ iconName, className }: { iconName: string; className?: string }) => (
    <span data-testid="mock-icon" data-icon-name={iconName} className={className}>
      MockIcon-{iconName}
    </span>
  ),
}));

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <p data-testid="child-element">Child content</p>
      </Card>
    );
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
    // Header should not be rendered if title and actions are missing
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders title correctly', () => {
    render(
      <Card title="Test Title">
        <p>Child content</p>
      </Card>
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test Title');
  });

  it('renders title with icon correctly', () => {
    render(
      <Card title="Test Title" titleIcon="star">
        <p>Child content</p>
      </Card>
    );
    const icon = screen.getByTestId('mock-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-icon-name', 'star');
  });

  it('renders actions correctly', () => {
    render(
      <Card actions={<button data-testid="action-btn">Action</button>}>
        <p>Child content</p>
      </Card>
    );
    const actionBtn = screen.getByTestId('action-btn');
    expect(actionBtn).toBeInTheDocument();
    expect(actionBtn).toHaveTextContent('Action');
  });

  it('renders title and actions together', () => {
    render(
      <Card title="Test Title" actions={<button>Action</button>}>
        <p>Child content</p>
      </Card>
    );
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    render(
      <Card className="custom-class-123" data-testid="card-container">
        <p>Child content</p>
      </Card>
    );
    const container = screen.getByTestId('card-container');
    expect(container).toHaveClass('custom-class-123');
    expect(container).toHaveClass('bg-white'); // One of the default classes
  });

  it('passes additional HTML attributes correctly', () => {
    render(
      <Card data-testid="card-container" id="custom-id" aria-label="custom-aria">
        <p>Child content</p>
      </Card>
    );
    const container = screen.getByTestId('card-container');
    expect(container).toHaveAttribute('id', 'custom-id');
    expect(container).toHaveAttribute('aria-label', 'custom-aria');
  });
});
