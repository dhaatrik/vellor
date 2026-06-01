import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from '../AppLayout';
import { useStore } from '../../../store';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../../../pages/DashboardPage', () => ({ DashboardPage: () => <div data-testid="dashboard-page">Dashboard Content</div> }));
vi.mock('../../../pages/StudentsPage', () => ({ StudentsPage: () => <div data-testid="students-page">Students Content</div> }));
vi.mock('../../../pages/TransactionsPage', () => ({ TransactionsPage: () => <div data-testid="transactions-page">Transactions Content</div> }));
vi.mock('../../../pages/CalendarPage', () => ({ CalendarPage: () => <div data-testid="calendar-page">Calendar Content</div> }));
vi.mock('../../../pages/SettingsPage', () => ({ SettingsPage: () => <div data-testid="settings-page">Settings Content</div> }));
vi.mock('../../../pages/AchievementsPage', () => ({ AchievementsPage: () => <div data-testid="achievements-page">Achievements Content</div> }));
vi.mock('../../../pages/ProfilePage', () => ({ ProfilePage: () => <div data-testid="profile-page">Profile Content</div> }));
vi.mock('../../../pages/TutorAdvicePage', () => ({ TutorAdvicePage: () => <div data-testid="tutor-advice-page">Tutor Advice Content</div> }));

vi.mock('../../BackupPromptModal', () => ({ BackupPromptModal: () => <div data-testid="backup-prompt"></div> }));
vi.mock('../../ui/TerminalBackground', () => ({ TerminalBackground: () => <div data-testid="terminal-background"></div> }));
vi.mock('../../ui/SearchModal', () => ({ SearchModal: ({ isOpen }: {isOpen: boolean}) => isOpen ? <div data-testid="search-modal"></div> : null }));
vi.mock('../../transactions/QuickLogModal', () => ({ QuickLogModal: ({ isOpen }: {isOpen: boolean}) => isOpen ? <div data-testid="quick-log-modal"></div> : null }));
vi.mock('../../ui/FAB', () => ({ FAB: () => <div data-testid="fab"></div> }));
vi.mock('../../ui/LegalModals', () => ({ LegalModals: () => <div data-testid="legal-modals"></div> }));
vi.mock('../../ui/Modal', () => ({ Modal: ({ isOpen, children }: {isOpen: boolean, children: React.ReactNode}) => isOpen ? <div data-testid="rank-modal">{children}</div> : null }));

const mockLogout = vi.fn();

beforeEach(() => {
  useStore.setState({
    settings: { userName: 'Test User', theme: 'light', brandColor: '#3b82f6', useSystemTheme: false, currencySymbol: '$', isOffline: false, hasCompletedOnboarding: true, autoBackup: false, developerMode: false },
    gamification: { level: 1, levelName: 'Novice Tutor', points: 50, streak: 5 },
    achievements: [],
    logout: mockLogout,
    addToast: vi.fn(),
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AppLayout Responsive Behavior', () => {
  it('should render the hamburger menu for mobile view', () => {
     render(
       <MemoryRouter initialEntries={['/dashboard']}>
         <AppLayout />
       </MemoryRouter>
     );

     const hamburgerMenu = screen.getByRole('button', { name: /open navigation/i });
     expect(hamburgerMenu).toBeInTheDocument();
  });

  it('should toggle mobile sidebar visibility when hamburger menu and overlay are clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppLayout />
      </MemoryRouter>
    );

    // Initial state: Sidebar overlay is NOT visible
    expect(document.querySelector('.bg-black\\/50')).not.toBeInTheDocument();

    const sidebar = screen.getByTestId('sidebar-navigation');
    expect(sidebar).toHaveClass('-translate-x-full');

    // Open sidebar
    const hamburgerMenu = screen.getByRole('button', { name: /open navigation/i });
    fireEvent.click(hamburgerMenu);

    // Overlay is shown
    expect(document.querySelector('.bg-black\\/50')).toBeInTheDocument();
    expect(sidebar).toHaveClass('translate-x-0');

    // Click the overlay to close the sidebar
    fireEvent.click(document.querySelector('.bg-black\\/50')!);

    // Overlay should disappear
    await waitFor(() => {
        expect(document.querySelector('.bg-black\\/50')).not.toBeInTheDocument();
    });
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('should handle navigation links click by closing the mobile sidebar', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppLayout />
      </MemoryRouter>
    );

    // Open sidebar
    const hamburgerMenu = screen.getByRole('button', { name: /open navigation/i });
    fireEvent.click(hamburgerMenu);

    expect(document.querySelector('.bg-black\\/50')).toBeInTheDocument();
    const sidebar = screen.getByTestId('sidebar-navigation');
    expect(sidebar).toHaveClass('translate-x-0');

    // Find and click a navigation link
    const dashboardLink = screen.getAllByRole('link', { name: /dashboard/i })[0];
    fireEvent.click(dashboardLink);

    // Overlay should disappear, implying sidebar closed
    await waitFor(() => {
        expect(document.querySelector('.bg-black\\/50')).not.toBeInTheDocument();
    });
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('should close sidebar when close button is clicked', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppLayout />
        </MemoryRouter>
      );

      // Open sidebar
      const hamburgerMenu = screen.getByRole('button', { name: /open navigation/i });
      fireEvent.click(hamburgerMenu);
      expect(document.querySelector('.bg-black\\/50')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close navigation/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
          expect(document.querySelector('.bg-black\\/50')).not.toBeInTheDocument();
      });
  })
});
