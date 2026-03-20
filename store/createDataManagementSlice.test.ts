// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useStore } from '../store';
import { Theme } from '../types';

describe('createDataManagementSlice', () => {
  let createObjectURLMock: any;
  let revokeObjectURLMock: any;
  let appendChildSpy: any;
  let removeChildSpy: any;
  let createElementSpy: any;

  beforeEach(() => {
    // Reset store state
    useStore.setState({
      students: [{ id: '1', firstName: 'John', lastName: 'Doe', contact: {}, tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 } } as any],
      transactions: [{ id: '1', studentId: '1', amountPaid: 100, lessonFee: 100, date: '2023-01-01' } as any],
      gamification: { points: 100, level: 2, levelName: 'Apprentice', streak: 5, lastActiveDate: null },
      achievements: [],
      settings: {
        theme: Theme.Dark,
        currencySymbol: '$',
        userName: 'Tutor',
        country: 'US',
        phone: { countryCode: '+1', number: '1234567890' },
        email: 'tutor@example.com',
        monthlyGoal: 1000,
      },
      activityLog: [{ id: '1', message: 'Test activity', icon: 'check-circle', timestamp: '2023-01-01' } as any],
      addToast: vi.fn(),
    });

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'setItem');

    // Mock URL methods
    createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    // Mock DOM methods
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') return mockAnchor as any;
      return document.createElement(tagName);
    });
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => { return null as any; });
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => { return null as any; });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportData', () => {
    it('successfully creates an export Blob and interacts with DOM', () => {
      const addToastMock = useStore.getState().addToast;

      useStore.getState().exportData();

      // Verify Blob and URL creation
      expect(createObjectURLMock).toHaveBeenCalled();
      const blobArg = createObjectURLMock.mock.calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('application/json');

      // Verify DOM interactions
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      const mockAnchor = createElementSpy.mock.results[0].value;
      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.download).toMatch(/vellor_backup_\d{4}-\d{2}-\d{2}\.json/);
      expect(mockAnchor.click).toHaveBeenCalled();

      // Verify URL revocation
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');

      // Verify localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('lastBackupDate', expect.any(String));

      // Verify toast
      expect(addToastMock).toHaveBeenCalledWith('Data exported successfully!', 'success');
    });

    it('catches errors and shows error toast', () => {
      const addToastMock = useStore.getState().addToast;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Stub JSON.stringify to throw an error
      vi.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
        throw new Error('Mock JSON Stringify Error');
      });

      useStore.getState().exportData();

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to export data:", expect.any(Error));
      expect(addToastMock).toHaveBeenCalledWith('Failed to export data.', 'error');
    });
  });
});
