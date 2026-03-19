import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useStore } from '../store';
import { DEFAULT_CURRENCY_SYMBOL, DEFAULT_USER_NAME, INITIAL_GAMIFICATION_STATS, ACHIEVEMENTS_DEFINITIONS } from '../constants';
import { Theme } from '../types';

// Mock localforage to prevent "No available storage method found" in jsdom
vi.mock('localforage', () => {
  return {
    default: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
  };
});

describe('DataManagementSlice', () => {
  beforeEach(() => {
    // Reset store
    useStore.setState({
      students: [],
      transactions: [],
      achievements: ACHIEVEMENTS_DEFINITIONS.map(a => ({ ...a, achieved: false })),
      gamification: INITIAL_GAMIFICATION_STATS,
      settings: {
        theme: Theme.Dark,
        currencySymbol: DEFAULT_CURRENCY_SYMBOL,
        userName: DEFAULT_USER_NAME,
        country: 'United States',
        phone: { countryCode: '+1', number: '' },
        email: '',
        monthlyGoal: 500,
      },
      activityLog: [],
      toasts: [],
    });

    vi.useFakeTimers();

    // Mock global objects
    global.URL.createObjectURL = vi.fn();
    global.URL.revokeObjectURL = vi.fn();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initializes correctly', () => {
    const state = useStore.getState();
    expect(state.exportData).toBeDefined();
    expect(state.importData).toBeDefined();
    expect(state.resetData).toBeDefined();
    expect(state.logout).toBeDefined();
  });

  describe('exportData', () => {
    it('successfully exports data', () => {
      // Mock document methods for the anchor tag
      const anchorMock = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchorMock as unknown as HTMLAnchorElement);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
      global.URL.revokeObjectURL = vi.fn();

      // Trigger export
      useStore.getState().exportData();

      // Verify Blob and URL creation
      expect(global.URL.createObjectURL).toHaveBeenCalled();

      // Verify anchor interaction
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(anchorMock.href).toBe('blob:test-url');
      expect(anchorMock.download).toMatch(/^vellor_backup_\d{4}-\d{2}-\d{2}\.json$/);
      expect(appendChildSpy).toHaveBeenCalledWith(anchorMock);
      expect(anchorMock.click).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(anchorMock);

      // Verify URL cleanup
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');

      // Verify localStorage is updated
      expect(window.localStorage.setItem).toHaveBeenCalledWith('lastBackupDate', expect.any(String));

      // Verify toast
      const toasts = useStore.getState().toasts;
      expect(toasts.length).toBeGreaterThan(0);
      expect(toasts[toasts.length - 1].message).toBe('Data exported successfully!');
      expect(toasts[toasts.length - 1].type).toBe('success');
    });

    it('handles export errors gracefully', () => {
      // Force an error by making createObjectURL fail
      const originalCreateObjectURL = global.URL.createObjectURL;
      global.URL.createObjectURL = vi.fn().mockImplementation(() => {
        throw new Error('Mock createObjectURL error');
      });

      // Override console.error to keep test output clean
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      useStore.getState().exportData();

      // Verify error toast
      const toasts = useStore.getState().toasts;
      expect(toasts.length).toBeGreaterThan(0);
      expect(toasts[toasts.length - 1].message).toBe('Failed to export data.');
      expect(toasts[toasts.length - 1].type).toBe('error');

      // Restore
      global.URL.createObjectURL = originalCreateObjectURL;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('importData', () => {
    it('shows error if no file provided', async () => {
      await useStore.getState().importData(null as any);
      const toasts = useStore.getState().toasts;
      expect(toasts[toasts.length - 1].message).toBe('No file selected for import.');
      expect(toasts[toasts.length - 1].type).toBe('error');
    });

    it('successfully imports valid data', async () => {
      const validData = {
        students: [{ id: 's1', firstName: 'John' }],
        transactions: [{ id: 't1', amount: 100 }],
        settings: { theme: Theme.Light },
        gamification: { points: 100 },
        achievements: [{ id: 'a1', achieved: true }],
        activityLog: [{ id: 'al1', message: 'test' }]
      };

      const file = new File([JSON.stringify(validData)], 'test.json', { type: 'application/json' });

      // Mock FileReader properly
      let readAsTextCalled = false;
      const mockFileReader = {
        readAsText: vi.fn().mockImplementation(function() {
          readAsTextCalled = true;
          if (mockFileReader.onload) {
            mockFileReader.onload({ target: { result: JSON.stringify(validData) } });
          }
        }),
        onload: null as any,
        onerror: null as any,
      };
      global.FileReader = function() { return mockFileReader; } as any;

      const importPromise = useStore.getState().importData(file);

      await importPromise;

      // Check state updates
      const state = useStore.getState();
      expect(state.students).toEqual(validData.students);
      expect(state.transactions).toEqual(validData.transactions);
      expect(state.settings.theme).toBe(Theme.Light);
      expect(state.gamification.points).toBe(100);

      // Check toast
      const toasts = state.toasts;
      expect(toasts[toasts.length - 1].message).toBe('Data imported successfully! The app will reload.');
      expect(toasts[toasts.length - 1].type).toBe('success');

      // Fast-forward timers to check reload
      vi.advanceTimersByTime(2000);
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('handles invalid JSON structure', async () => {
      const invalidData = {
        // Missing required arrays/objects
        wrong: 'data'
      };

      const file = new File([JSON.stringify(invalidData)], 'test.json', { type: 'application/json' });

      const mockFileReader = {
        readAsText: vi.fn().mockImplementation(function() {
          if (mockFileReader.onload) {
            mockFileReader.onload({ target: { result: JSON.stringify(invalidData) } });
          }
        }),
        onload: null as any,
        onerror: null as any,
      };
      global.FileReader = function() { return mockFileReader; } as any;

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const importPromise = useStore.getState().importData(file);

      await importPromise;

      const toasts = useStore.getState().toasts;
      expect(toasts[toasts.length - 1].message).toContain('Invalid data structure in JSON file.');
      expect(toasts[toasts.length - 1].type).toBe('error');

      consoleErrorSpy.mockRestore();
    });

    it('handles JSON parse error', async () => {
      const file = new File(['invalid-json-string'], 'test.json', { type: 'application/json' });

      const mockFileReader = {
        readAsText: vi.fn().mockImplementation(function() {
          if (mockFileReader.onload) {
            mockFileReader.onload({ target: { result: 'invalid-json-string' } });
          }
        }),
        onload: null as any,
        onerror: null as any,
      };
      global.FileReader = function() { return mockFileReader; } as any;

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const importPromise = useStore.getState().importData(file);

      await importPromise;

      const toasts = useStore.getState().toasts;
      expect(toasts[toasts.length - 1].message).toContain('Import failed');
      expect(toasts[toasts.length - 1].type).toBe('error');

      consoleErrorSpy.mockRestore();
    });

    it('handles file read error', async () => {
      const file = new File([''], 'test.json', { type: 'application/json' });

      const mockFileReader = {
        readAsText: vi.fn().mockImplementation(function() {
          if (mockFileReader.onerror) {
            mockFileReader.onerror(new Event('error'));
          }
        }),
        onload: null as any,
        onerror: null as any,
      };
      global.FileReader = function() { return mockFileReader; } as any;

      const importPromise = useStore.getState().importData(file);

      await importPromise;

      const toasts = useStore.getState().toasts;
      expect(toasts[toasts.length - 1].message).toBe('Error reading file.');
      expect(toasts[toasts.length - 1].type).toBe('error');
    });
  });

  describe('resetData', () => {
    it('resets all data to initial state', () => {
      // Modify store to non-initial state
      useStore.setState({
        students: [{ id: 's1', firstName: 'John' }] as any,
        transactions: [{ id: 't1', amount: 100 }] as any,
        settings: {
          theme: Theme.Light,
          currencySymbol: '€',
          userName: 'Tester',
          country: 'Germany',
          phone: { countryCode: '+49', number: '123' },
          email: 'test@example.com',
          monthlyGoal: 1000,
        },
        gamification: { points: 500, level: 2, levelName: 'Pro', streak: 5, lastActiveDate: null },
      });

      useStore.getState().resetData();

      const state = useStore.getState();

      // Check reset values
      expect(state.students).toEqual([]);
      expect(state.transactions).toEqual([]);
      expect(state.gamification).toEqual(INITIAL_GAMIFICATION_STATS);
      expect(state.settings.theme).toBe(Theme.Dark);
      expect(state.settings.currencySymbol).toBe(DEFAULT_CURRENCY_SYMBOL);
      expect(state.settings.userName).toBe(DEFAULT_USER_NAME);
      expect(state.activityLog).toEqual([]);

      // Check toast
      expect(state.toasts[state.toasts.length - 1].message).toBe('All application data has been reset.');
      expect(state.toasts[state.toasts.length - 1].type).toBe('info');

      // Check reload
      vi.advanceTimersByTime(1500);
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears user specific settings', () => {
      // Modify user settings
      useStore.setState({
        settings: {
          theme: Theme.Light,
          currencySymbol: '€',
          userName: 'Tester',
          country: 'Germany',
          phone: { countryCode: '+49', number: '123' },
          email: 'test@example.com',
          monthlyGoal: 1000,
        }
      });

      useStore.getState().logout();

      const state = useStore.getState();

      // Check cleared user info but retained other settings
      expect(state.settings.userName).toBe(DEFAULT_USER_NAME);
      expect(state.settings.email).toBe('');
      expect(state.settings.theme).toBe(Theme.Light);
      expect(state.settings.currencySymbol).toBe('€');

      // Check toast
      expect(state.toasts[state.toasts.length - 1].message).toBe('Logged out successfully.');
      expect(state.toasts[state.toasts.length - 1].type).toBe('info');
    });
  });
});
