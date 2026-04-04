import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';

// Mock the Icon component since it renders SVGs which are not necessary for the Button unit tests.
vi.mock('./Icon', () => ({
  Icon: ({ iconName, className }: { iconName: string; className?: string }) => (
    <span data-testid={`icon-${iconName}`} className={className}></span>
  ),
}));

describe('Button component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-accent'); // Primary variant class
    expect(button).toHaveClass('px-6 py-2.5'); // md size class
    expect(button).not.toBeDisabled();
  });

  it('applies the correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-danger');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-2 border-gray-200');
  });

  it('applies the correct size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4 py-2 text-sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6 py-2.5 text-sm');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-8 py-3.5 text-base');
  });

  it('renders left and right icons correctly', () => {
    render(
      <Button leftIcon="arrow-left" rightIcon="arrow-right">
        With Icons
      </Button>
    );
    expect(screen.getByTestId('icon-arrow-left')).toBeInTheDocument();
    expect(screen.getByTestId('icon-arrow-right')).toBeInTheDocument();
    expect(screen.getByTestId('icon-arrow-left')).toHaveClass('mr-2');
    expect(screen.getByTestId('icon-arrow-right')).toHaveClass('ml-2');
  });

  it('does not add margin to icons if there are no children', () => {
    render(<Button leftIcon="star" rightIcon="heart" />);
    expect(screen.getByTestId('icon-star')).not.toHaveClass('mr-2');
    expect(screen.getByTestId('icon-heart')).not.toHaveClass('ml-2');
  });

  it('handles the isLoading state correctly', () => {
    render(
      <Button isLoading leftIcon="star">
        Loading...
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    // Check if the loading spinner SVG is present (via class)
    const spinner = button.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();

    // Icons and children should not be shown when loading? Wait, let's look at the component.
    // children are still rendered. Left/right icons are not rendered.
    expect(screen.queryByTestId('icon-star')).not.toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles custom className', () => {
    render(<Button className="custom-class-123">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class-123');
  });

  it('handles standard HTML attributes like disabled and onClick', () => {
    const onClickMock = vi.fn();
    const { rerender } = render(
      <Button onClick={onClickMock}>Clickable</Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalledTimes(1);

    rerender(<Button disabled onClick={onClickMock}>Disabled</Button>);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    // Note: React might not fire click on disabled buttons depending on environment,
    // but the button element should have the disabled property.
    expect(onClickMock).toHaveBeenCalledTimes(1); // Didn't increase because it's disabled.
  });
});
