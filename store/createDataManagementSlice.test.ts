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
  let promptSpy: any;

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

    // Mock window.prompt
    promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportData', () => {
    it('successfully creates an export Blob and interacts with DOM', async () => {
      const addToastMock = useStore.getState().addToast;

      await useStore.getState().exportData();

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

    it('catches errors and shows error toast', async () => {
      const addToastMock = useStore.getState().addToast;

      // Stub JSON.stringify to throw an error
      vi.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
        throw new Error('Mock JSON Stringify Error');
      });

      await useStore.getState().exportData();

      expect(addToastMock).toHaveBeenCalledWith('Failed to export data.', 'error');
    });

    it('aborts export if prompt is cancelled', async () => {
      promptSpy.mockReturnValue(null);
      await useStore.getState().exportData();

      expect(createObjectURLMock).not.toHaveBeenCalled();
    });

    it('exports encrypted data if password is provided', async () => {
      vi.useRealTimers();
      const addToastMock = useStore.getState().addToast;
      promptSpy.mockReturnValue('my-secret-password');

      const promise = useStore.getState().exportData();

      // Let promises related to crypto resolve natively
      await new Promise(resolve => setTimeout(resolve, 50));
      await promise;

      expect(createObjectURLMock).toHaveBeenCalled();
      const blobArg = createObjectURLMock.mock.calls[0][0];
      const text = await blobArg.text();
      const parsed = JSON.parse(text);

      expect(parsed.__vellor_encrypted).toBe(true);
      expect(parsed.salt).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(addToastMock).toHaveBeenCalledWith('Data exported successfully!', 'success');

      vi.useFakeTimers();
    });
  });

  describe('importData', () => {
    let reloadSpy: any;

    beforeEach(() => {
      vi.useFakeTimers();
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { reload: vi.fn() },
      });
      reloadSpy = vi.spyOn(window.location, 'reload');
    });

    afterEach(() => {
      try {
        vi.runOnlyPendingTimers();
      } catch {
        // ignore errors if timers were already real or cleared
      }
      vi.useRealTimers();
    });

    it('returns error toast if no file is provided', async () => {
      const addToastMock = useStore.getState().addToast;
      await useStore.getState().importData(null as unknown as File);
      expect(addToastMock).toHaveBeenCalledWith('No file selected for import.', 'error');
    });

    it('shows error if file reading fails', async () => {
      const addToastMock = useStore.getState().addToast;
      const file = new File([''], 'test.json', { type: 'application/json' });

      const mockFileReader = {
        readAsText: vi.fn(function(this: any) {
          if (this.onerror) this.onerror();
        }),
      };
      vi.spyOn(window, 'FileReader').mockImplementation(function() { return mockFileReader as unknown as FileReader; } as any);

      await useStore.getState().importData(file);

      expect(addToastMock).toHaveBeenCalledWith('Error reading file.', 'error');
    });

    it('successfully imports unencrypted data', async () => {
      const addToastMock = useStore.getState().addToast;
      const validData = {
        students: [],
        transactions: [],
        settings: {
          theme: Theme.Dark,
          currencySymbol: '$',
          userName: 'New Tutor',
          country: 'US',
          phone: { countryCode: '+1', number: '1234567890' },
          email: 'tutor@example.com',
          monthlyGoal: 1000,
        },
      };

      const file = new File([JSON.stringify(validData)], 'test.json', { type: 'application/json' });

      const mockFileReader = {
        readAsText: vi.fn(function(this: any) {
          if (this.onload) this.onload({ target: { result: JSON.stringify(validData) } });
        }),
      };
      vi.spyOn(window, 'FileReader').mockImplementation(function() { return mockFileReader as unknown as FileReader; } as any);

      await useStore.getState().importData(file);

      expect(addToastMock).toHaveBeenCalledWith('Data imported successfully! The app will reload.', 'success');
      expect(useStore.getState().settings.userName).toBe('New Tutor');

      vi.advanceTimersByTime(2000);
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('fails to import data with invalid schema', async () => {
      const addToastMock = useStore.getState().addToast;
      const invalidData = {
        students: 'not an array', // Invalid
      };

      const file = new File([JSON.stringify(invalidData)], 'test.json', { type: 'application/json' });

      const mockFileReader = {
        readAsText: vi.fn(function(this: any) {
          if (this.onload) this.onload({ target: { result: JSON.stringify(invalidData) } });
        }),
      };
      vi.spyOn(window, 'FileReader').mockImplementation(function() { return mockFileReader as unknown as FileReader; } as any);

      await useStore.getState().importData(file);

      expect(addToastMock).toHaveBeenCalledWith(expect.stringContaining('Import failed'), 'error');
    });

    it('aborts encrypted import if password prompt is cancelled', async () => {
      promptSpy.mockReturnValue(null);
      const addToastMock = useStore.getState().addToast;
      const encryptedData = {
        __vellor_encrypted: true,
        salt: [1, 2, 3],
        data: 'encrypted-string'
      };

      const file = new File([JSON.stringify(encryptedData)], 'test.json', { type: 'application/json' });

      const mockFileReader = {
        readAsText: vi.fn(function(this: any) {
          if (this.onload) this.onload({ target: { result: JSON.stringify(encryptedData) } });
        }),
      };
      vi.spyOn(window, 'FileReader').mockImplementation(function() { return mockFileReader as unknown as FileReader; } as any);

      await useStore.getState().importData(file);

      // Prompt returns null, execution aborts, no toast should be shown for success or error
      // Note: the component doesn't show a toast on cancellation, it just returns
      expect(addToastMock).not.toHaveBeenCalledWith('Data imported successfully! The app will reload.', 'success');
    });

    it('fails to import encrypted data with incorrect password', async () => {
      promptSpy.mockReturnValue('wrong-password');
      const addToastMock = useStore.getState().addToast;

      const badDataStr = JSON.stringify({
        __vellor_encrypted: true,
        salt: [1,2,3],
        data: "invalid-encrypted-data"
      });

      const file = new File([badDataStr], 'test.json', { type: 'application/json' });

      // Call onload synchronously to avoid uncatchable promise rejections in the test runner.
      // We will catch it internally and assert the toast.
      const mockFileReader = {
        readAsText: vi.fn(function(this: any) {
          if (this.onload) {
            const event = { target: { result: badDataStr } };
            // The method inside importData is marked async, so it returns a promise.
            // We can actually await it!
            const promise = this.onload(event as any);
            // Put it on the file reader mock so we can await it
            this._onloadPromise = promise;
          }
        }),
      };
      vi.spyOn(window, 'FileReader').mockImplementation(function() { return mockFileReader as unknown as FileReader; } as any);

      // Trigger the import
      useStore.getState().importData(file);

      // Wait for the synchronous readAsText mock to run
      const readerInstance = (window.FileReader as any).mock.results[0].value;

      // Now await the inner promise returned by the async onload handler
      if (readerInstance._onloadPromise) {
        await readerInstance._onloadPromise;
      }

      expect(addToastMock).toHaveBeenCalledWith(expect.stringContaining('Incorrect password or corrupted encrypted data'), 'error');
    });
  });

  describe('resetData', () => {
    let reloadSpy: any;

    beforeEach(() => {
      vi.useFakeTimers();
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { reload: vi.fn() },
      });
      reloadSpy = vi.spyOn(window.location, 'reload');
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it('resets all data to initial state', () => {
      const addToastMock = useStore.getState().addToast;

      useStore.getState().resetData();

      const state = useStore.getState();
      expect(state.students).toEqual([]);
      expect(state.transactions).toEqual([]);
      expect(state.gamification.points).toBe(0);
      expect(state.activityLog).toEqual([]);
      expect(state.settings.userName).toBe('Teacher');

      expect(addToastMock).toHaveBeenCalledWith('All application data has been reset.', 'info');

      vi.advanceTimersByTime(1500);
      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('resets user-specific settings', () => {
      const addToastMock = useStore.getState().addToast;

      // Ensure initial state has user info
      expect(useStore.getState().settings.userName).toBe('Tutor');
      expect(useStore.getState().settings.email).toBe('tutor@example.com');

      useStore.getState().logout();

      const state = useStore.getState();
      expect(state.settings.userName).toBe('Teacher');
      expect(state.settings.email).toBe('');
      // Theme and other non-identifying settings should remain
      expect(state.settings.theme).toBe(Theme.Dark);

      expect(addToastMock).toHaveBeenCalledWith('Logged out successfully.', 'info');
    });
  });
});
