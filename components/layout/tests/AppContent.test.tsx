import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppContent } from '../AppContent';
import { useStore } from '../../../store';
import '@testing-library/jest-dom';

// Mock dependencies
vi.mock('../../../store', () => ({
  useStore: vi.fn(),
}));

vi.mock('../../../pages/WelcomePage', () => ({
  WelcomePage: () => <div data-testid="welcome-page">Welcome Page</div>,
}));

vi.mock('../AppLayout', () => ({
  AppLayout: () => <div data-testid="app-layout">App Layout</div>,
}));

// Helper to check current location
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('AppContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('When userName is empty', () => {
    beforeEach(() => {
      vi.mocked(useStore).mockImplementation((selector: any) =>
        selector({ settings: { userName: '' } })
      );
    });

    it('renders WelcomePage directly on /welcome', () => {
      render(
        <MemoryRouter initialEntries={['/welcome']}>
          <AppContent />
        </MemoryRouter>
      );

      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
    });

    it('redirects to /welcome from root', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppContent />
          <LocationDisplay />
        </MemoryRouter>
      );

      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
      expect(screen.getByTestId('location-display')).toHaveTextContent('/welcome');
    });

    it('redirects to /welcome from any other route', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppContent />
          <LocationDisplay />
        </MemoryRouter>
      );

      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
      expect(screen.getByTestId('location-display')).toHaveTextContent('/welcome');
    });
  });

  describe('When userName is set', () => {
    beforeEach(() => {
      vi.mocked(useStore).mockImplementation((selector: any) =>
        selector({ settings: { userName: 'Alice' } })
      );
    });

    it('renders AppLayout directly', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppContent />
        </MemoryRouter>
      );

      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('welcome-page')).not.toBeInTheDocument();
    });
  });
});
