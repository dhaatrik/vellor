import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

import userEvent from '@testing-library/user-event';
import localforage from 'localforage';

// Mock localforage
vi.mock('localforage', () => ({
  default: {
    clear: vi.fn().mockResolvedValue(undefined),
  },
}));

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
  return null;
};

test('renders children when there is no error', () => {
  render(
    <ErrorBoundary>
      <div data-testid="child">Safe child</div>
    </ErrorBoundary>
  );

  expect(screen.getByTestId('child')).toBeInTheDocument();
  expect(screen.queryByText('Something went wrong reading your local data.')).not.toBeInTheDocument();
});

test('renders error fallback UI when a child throws an error', () => {
  // Suppress console.error expected from ErrorBoundary
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong reading your local data.')).toBeInTheDocument();
  expect(screen.getByText('Your data might be corrupted or the app encountered an unexpected error.')).toBeInTheDocument();

  consoleSpy.mockRestore();
});

test('Reload App button triggers window.location.reload', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  // Mock window.location.reload
  const originalLocation = window.location;
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { reload: vi.fn() },
  });

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  const user = userEvent.setup();
  const reloadButton = screen.getByText('Reload App');
  await user.click(reloadButton);

  expect(window.location.reload).toHaveBeenCalledTimes(1);

  // Restore
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
  consoleSpy.mockRestore();
});

test('Hard Reset button clears data and reloads', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  // Mock window.location.reload
  const originalLocation = window.location;
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { reload: vi.fn() },
  });



  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  const user = userEvent.setup();
  const resetButton = screen.getByText('Hard Reset (Wipe Data)');
  await user.click(resetButton);

  expect(localforage.clear).toHaveBeenCalledTimes(1);

  expect(window.location.reload).toHaveBeenCalledTimes(1);

  // Restore
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });

  consoleSpy.mockRestore();
});
