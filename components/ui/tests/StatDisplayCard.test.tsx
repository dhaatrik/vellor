import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { StatDisplayCard } from '../StatDisplayCard';
import '@testing-library/jest-dom';

// Mock the Icon component since we only care about the StatDisplayCard in this test
vi.mock('../Icon', () => ({
  Icon: ({ iconName, className }: { iconName: string, className: string }) => (
    <svg data-testid={`icon-${iconName}`} className={className} />
  )
}));

// Mock the Card component to check props passed to it
vi.mock('../Card', () => ({
  Card: ({ children, className, onClick, role, tabIndex, onKeyDown }: any) => (
    <div
      data-testid="mock-card"
      className={className}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  )
}));

describe('StatDisplayCard Component', () => {
  it('renders correctly with default props', () => {
    render(<StatDisplayCard title="Total Students" value={42} iconName="users" />);

    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    const icon = screen.getByTestId('icon-users');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-accent'); // default color

    // Check if the default bg class is applied to the parent of the icon
    const iconContainer = icon.parentElement;
    expect(iconContainer).toHaveClass('bg-accent/10');
  });

  it('renders correctly with string value', () => {
    render(<StatDisplayCard title="Total Revenue" value="$1,000" iconName="currency-dollar" />);
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('applies custom icon color and background classes', () => {
    render(
      <StatDisplayCard
        title="Custom Colors"
        value={10}
        iconName="star"
        iconColorClass="text-red-500"
        iconBgClass="bg-red-100"
      />
    );

    const icon = screen.getByTestId('icon-star');
    expect(icon).toHaveClass('text-red-500');
    expect(icon).not.toHaveClass('text-accent');

    const iconContainer = icon.parentElement;
    expect(iconContainer).toHaveClass('bg-red-100');
    expect(iconContainer).not.toHaveClass('bg-accent/10');
  });

  it('applies custom className to the card', () => {
    render(
      <StatDisplayCard
        title="Custom Class"
        value={5}
        iconName="user"
        className="my-custom-class"
      />
    );

    const card = screen.getByTestId('mock-card');
    expect(card).toHaveClass('my-custom-class');
  });

  it('handles click events when onClick is provided', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <StatDisplayCard
        title="Clickable"
        value={10}
        iconName="arrow-right"
        onClick={handleClick}
      />
    );

    const card = screen.getByTestId('mock-card');

    // It should have role and tabIndex
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveClass('cursor-pointer');

    await user.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles Enter key press when onClick is provided', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <StatDisplayCard
        title="Key Press"
        value={10}
        iconName="arrow-right"
        onClick={handleClick}
      />
    );

    const card = screen.getByTestId('mock-card');
    card.focus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles Space key press when onClick is provided', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <StatDisplayCard
        title="Key Press Space"
        value={10}
        iconName="arrow-right"
        onClick={handleClick}
      />
    );

    const card = screen.getByTestId('mock-card');
    card.focus();

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick for other keys', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <StatDisplayCard
        title="Other Keys"
        value={10}
        iconName="arrow-right"
        onClick={handleClick}
      />
    );

    const card = screen.getByTestId('mock-card');
    card.focus();

    await user.keyboard('{A}');
    await user.keyboard('{Tab}');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not set interactive attributes if onClick is not provided', () => {
    render(
      <StatDisplayCard
        title="Not Clickable"
        value={10}
        iconName="arrow-right"
      />
    );

    const card = screen.getByTestId('mock-card');

    expect(card).not.toHaveAttribute('role', 'button');
    expect(card).not.toHaveAttribute('tabIndex');
    expect(card).not.toHaveClass('cursor-pointer');
  });
});
