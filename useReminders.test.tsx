import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReminders } from './useReminders';
import { useStore } from './store';
import { PaymentStatus } from './types';

// Mock the store
vi.mock('./store', () => ({
  useStore: vi.fn(),
}));

describe('useReminders', () => {
  let mockNotification: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

    mockNotification = vi.fn();
    mockNotification.permission = 'default';
    mockNotification.requestPermission = vi.fn().mockResolvedValue('granted');

    vi.stubGlobal('Notification', mockNotification);

    // Clear sessionStorage
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does nothing if enableReminders is false', () => {
    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        settings: { enableReminders: false },
        transactions: [],
        students: [],
      };
      return selector(state);
    });

    renderHook(() => useReminders());

    expect(mockNotification.requestPermission).not.toHaveBeenCalled();
  });

  it('requests permission if enableReminders is true and permission is default', () => {
    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        settings: { enableReminders: true },
        transactions: [],
        students: [],
      };
      return selector(state);
    });

    renderHook(() => useReminders());

    expect(mockNotification.requestPermission).toHaveBeenCalled();
  });

  it('does not request permission if already granted or denied', () => {
    mockNotification.permission = 'granted';

    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        settings: { enableReminders: true },
        transactions: [],
        students: [],
      };
      return selector(state);
    });

    renderHook(() => useReminders());

    expect(mockNotification.requestPermission).not.toHaveBeenCalled();
  });

  it('triggers notification for a lesson within 2 hours', () => {
    mockNotification.permission = 'granted';

    const scheduledTransaction = {
      id: 'tx-1',
      studentId: 'st-1',
      status: PaymentStatus.Scheduled,
      date: '2024-01-01T13:30:00.000Z', // 1.5 hours from now (12:00)
    };

    const student = {
      id: 'st-1',
      firstName: 'Alice',
      lastName: 'Smith'
    };

    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        settings: { enableReminders: true },
        transactions: [scheduledTransaction],
        students: [student],
      };
      return selector(state);
    });

    renderHook(() => useReminders());

    expect(mockNotification).toHaveBeenCalledWith('Upcoming Lesson!', {
      body: 'You have a lesson with Alice Smith in less than 2 hours.',
      icon: '/pwa-192x192.svg'
    });
  });

  it('triggers notification for a payment due tomorrow', () => {
    mockNotification.permission = 'granted';

    const dueTransaction = {
      id: 'tx-2',
      studentId: 'st-2',
      status: PaymentStatus.Due,
      date: '2024-01-02T10:00:00.000Z', // Tomorrow
    };

    const student = {
      id: 'st-2',
      firstName: 'Bob',
      lastName: 'Jones'
    };

    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        settings: { enableReminders: true },
        transactions: [dueTransaction],
        students: [student],
      };
      return selector(state);
    });

    renderHook(() => useReminders());

    expect(mockNotification).toHaveBeenCalledWith('Payment Reminder', {
      body: 'Payment is due tomorrow for a lesson with Bob Jones.',
      icon: '/pwa-192x192.svg'
    });
  });

  it('prevents duplicate notifications using sessionStorage', () => {
    mockNotification.permission = 'granted';

    const scheduledTransaction = {
      id: 'tx-3',
      studentId: 'st-3',
      status: PaymentStatus.Scheduled,
      date: '2024-01-01T13:30:00.000Z', // 1.5 hours from now (12:00)
    };

    const student = {
      id: 'st-3',
      firstName: 'Charlie',
      lastName: 'Brown'
    };

    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        settings: { enableReminders: true },
        transactions: [scheduledTransaction],
        students: [student],
      };
      return selector(state);
    });

    // Run hook once, should notify
    const { unmount } = renderHook(() => useReminders());
    expect(mockNotification).toHaveBeenCalledTimes(1);

    unmount();

    // Run hook again, should NOT notify because of sessionStorage cache
    renderHook(() => useReminders());
    expect(mockNotification).toHaveBeenCalledTimes(1);
  });

  it('checks for reminders periodically via setInterval', () => {
    mockNotification.permission = 'granted';

    const scheduledTransaction = {
      id: 'tx-4',
      studentId: 'st-4',
      status: PaymentStatus.Scheduled,
      // Scheduled for exactly 2 hours and 5 minutes from now
      date: '2024-01-01T14:05:00.000Z',
    };

    const student = {
      id: 'st-4',
      firstName: 'Diana',
      lastName: 'Prince'
    };

    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        settings: { enableReminders: true },
        transactions: [scheduledTransaction],
        students: [student],
      };
      return selector(state);
    });

    renderHook(() => useReminders());

    // Initially, lesson is > 2 hours away, so no notification
    expect(mockNotification).not.toHaveBeenCalled();

    // Advance time by 10 minutes, so it is now 1.5 hours away, well within the 2 hour mark
    vi.advanceTimersByTime(10 * 60 * 1000);

    expect(mockNotification).toHaveBeenCalledTimes(1);
    expect(mockNotification).toHaveBeenCalledWith('Upcoming Lesson!', expect.any(Object));
  });
});
