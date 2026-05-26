import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NavbarLink } from '../NavbarLink';
import '@testing-library/jest-dom';

// Mock the Icon component
vi.mock('../Icon', () => ({
  Icon: ({ iconName, className }: { iconName: string; className: string }) => (
    <svg data-testid={`icon-${iconName}`} className={className} />
  ),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ className, 'data-testid': testId }: any) => (
      <div className={className} data-testid={testId || 'motion-div'} />
    ),
  },
}));

describe('NavbarLink Component', () => {
  const renderWithRouter = (ui: React.ReactElement, initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    );
  };

  it('renders correctly with basic props', () => {
    renderWithRouter(<NavbarLink to="/test">Test Link</NavbarLink>);
    const link = screen.getByRole('link', { name: /Test Link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders with an icon when iconName prop is provided', () => {
    renderWithRouter(
      <NavbarLink to="/test" iconName="book-open">
        Home
      </NavbarLink>
    );
    expect(screen.getByTestId('icon-book-open')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    renderWithRouter(
      <NavbarLink to="/test" onClick={handleClick}>
        Click Me
      </NavbarLink>
    );
    const link = screen.getByRole('link', { name: /Click Me/i });
    await userEvent.click(link);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies active styles when the current route matches', () => {
    renderWithRouter(
      <NavbarLink to="/active">Active Link</NavbarLink>,
      ['/active']
    );
    const link = screen.getByRole('link', { name: /Active Link/i });
    expect(link).toHaveClass('text-primary-dark');
    expect(link).toHaveClass('bg-accent/10');
    // Active background indicator from framer-motion should be rendered
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });

  it('applies inactive styles when the current route does not match', () => {
    renderWithRouter(
      <NavbarLink to="/inactive">Inactive Link</NavbarLink>,
      ['/other']
    );
    const link = screen.getByRole('link', { name: /Inactive Link/i });
    expect(link).toHaveClass('text-gray-500');
    expect(link).toHaveClass('hover:bg-gray-100');
    // Active background indicator should NOT be rendered
    expect(screen.queryByTestId('motion-div')).not.toBeInTheDocument();
  });
});
