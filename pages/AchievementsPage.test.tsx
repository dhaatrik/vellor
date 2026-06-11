import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementsPage } from './AchievementsPage';
import { AchievementId, PaymentStatus } from '../types';
import '@testing-library/jest-dom';

const mockUseStore = vi.fn();

vi.mock('../store', () => ({
  useStore: (selector?: any) => {
    if (!selector) return mockUseStore();
    return mockUseStore(selector);
  },
}));

vi.mock('framer-motion', () => {
  const ActualMotion = {
    div: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>,
  };
  return {
    motion: ActualMotion,
  };
});

describe('AchievementsPage', () => {
  const achievementsList = [
    {
      id: AchievementId.FirstStudentAdded,
      name: 'First Student!',
      description: 'Added your first student',
      achieved: true,
      dateAchieved: '2023-01-01T00:00:00Z',
      icon: 'academic-cap',
    },
    {
      id: AchievementId.SevenDayStreak,
      name: 'Week Streak',
      description: 'Logged in for 7 consecutive days',
      achieved: false,
      icon: 'fire',
    },
  ];

  const defaultState = {
    settings: {
      currencySymbol: '$',
      customAchievement: 'Teach 1000 hours',
      customAchievementEarned: false,
    },
    gamification: {
      points: 500,
      level: 5,
      levelName: 'Master Tutor',
      streak: 10,
      achievements: achievementsList,
      stats: {},
    },
    userProfile: {},
    students: [{ id: '1' }, { id: '2' }],
    transactions: [
      { amountPaid: 50, status: PaymentStatus.Paid },
      { amountPaid: 150, status: PaymentStatus.Paid },
    ],
    achievements: achievementsList,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStore.mockImplementation((selector?: any) => {
      if (selector) return selector(defaultState);
      return defaultState;
    });
  });

  it('renders gamification overview', () => {
    render(<AchievementsPage />);
    expect(screen.getByText('500')).toBeInTheDocument(); // Points
    expect(screen.getByText('Master Tutor')).toBeInTheDocument(); // Level Name
    expect(screen.getByText('Level 5')).toBeInTheDocument(); // Level
  });

  it('renders achieved and locked achievements', () => {
    render(<AchievementsPage />);

    // Achieved
    expect(screen.getByText('Unlocked Achievements')).toBeInTheDocument();
    expect(screen.getByText('First Student!')).toBeInTheDocument();
    expect(screen.getByText('Added your first student')).toBeInTheDocument();

    // Locked
    expect(screen.getByText('Locked Achievements')).toBeInTheDocument();
    expect(screen.getByText('Week Streak')).toBeInTheDocument();
    expect(screen.getByText('Logged in for 7 consecutive days')).toBeInTheDocument();
  });

  it('renders custom achievement when pending', () => {
    render(<AchievementsPage />);
    expect(screen.getByText('Personal Goal')).toBeInTheDocument();
    expect(screen.getByText('Teach 1000 hours')).toBeInTheDocument();
  });

  it('renders empty state when there are no achievements', () => {
    mockUseStore.mockImplementation((selector?: any) => {
      const state = {
        ...defaultState,
        achievements: [],
        gamification: {
          ...defaultState.gamification,
          achievements: [],
        },
        settings: {
          ...defaultState.settings,
          customAchievement: '', // no custom achievement either
        }
      };
      if (selector) return selector(state);
      return state;
    });

    render(<AchievementsPage />);
    expect(screen.getByText('No achievements defined yet.')).toBeInTheDocument();
  });
});
