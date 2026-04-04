import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../store', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      settings: {
        userName: 'Test User',
        monthlyGoal: 1000,
        currencySymbol: '$',
        hasCompletedOnboarding: true,
        gamificationEnabled: true,
      },
      gamification: {
        streak: 5,
        points: 150,
      },
      students: [],
      activityLog: [],
      transactions: [],
      deleteActivity: vi.fn(),
      clearActivityLog: vi.fn(),
      addToast: vi.fn(),
      updateSettings: vi.fn(),
    };
    return selector(state);
  }),
  useData: {
    derived: vi.fn(() => ({
      totalUnpaid: 200,
      totalPaidThisMonth: 500,
      activeStudentsCount: 10,
      overduePayments: [],
    })),
  },
}));

vi.mock('../usePwaInstall', () => ({
  usePwaInstall: () => ({
    isInstallable: false,
    promptInstall: vi.fn(),
  }),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: () => <div data-testid="area-chart">AreaChart</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

vi.mock('framer-motion', () => {
  const ActualMotion = {
    div: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>,
    li: ({ children, className }: any) => <li className={className}>{children}</li>,
  };
  return {
    motion: ActualMotion,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getTotalSize: () => 100,
    getVirtualItems: () => [],
    measureElement: vi.fn(),
  }),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome message with user name', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Welcome back, Test User')).toBeInTheDocument();
  });

  it('renders derived data (Total Unpaid, Paid This Month, etc.)', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Total Unpaid')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();

    expect(screen.getByText('Paid This Month')).toBeInTheDocument();
    expect(screen.getAllByText('$500.00')[0]).toBeInTheDocument();

    expect(screen.getByText('Predicted Income')).toBeInTheDocument();
  });

  it('navigates to add student when "Add Student" is clicked', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    const addStudentButton = screen.getByText('Add Student');
    fireEvent.click(addStudentButton);
    expect(mockNavigate).toHaveBeenCalledWith('/students', { state: { openAddStudentModal: true } });
  });

  it('navigates to log lesson when "Log Lesson" is clicked', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    const logLessonButton = screen.getByText('Log Lesson');
    fireEvent.click(logLessonButton);
    expect(mockNavigate).toHaveBeenCalledWith('/transactions', { state: { openAddTransactionModal: true } });
  });
});
