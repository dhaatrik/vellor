// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store';
import { Theme } from '../types';
import { DEFAULT_USER_NAME, POINTS_ALLOCATION } from '../constants';

describe('createSettingsSlice', () => {
  beforeEach(() => {
    // Reset store state and clear mocks
    useStore.setState({
      settings: {
        theme: Theme.Light,
        currencySymbol: '$',
        userName: DEFAULT_USER_NAME,
        country: 'United States',
        phone: { countryCode: '+1', number: '' },
        email: '',
        monthlyGoal: 500,
      },
      addPoints: vi.fn(),
      logActivity: vi.fn(),
      addToast: vi.fn(),
      checkAndAwardAchievements: vi.fn(),
    });
    document.documentElement.className = ''; // Reset DOM classes
  });

  describe('updateSettings', () => {
    it('updates simple settings and triggers side effects', () => {
      const addToastMock = useStore.getState().addToast;
      const checkAchievementsMock = useStore.getState().checkAndAwardAchievements;

      useStore.getState().updateSettings({ email: 'test@example.com' });

      expect(useStore.getState().settings.email).toBe('test@example.com');
      expect(addToastMock).toHaveBeenCalledWith('Settings saved successfully.', 'success');
      expect(checkAchievementsMock).toHaveBeenCalled();
    });

    it('adds "dark" class to document.documentElement when theme is set to Dark', () => {
      useStore.getState().updateSettings({ theme: Theme.Dark });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(useStore.getState().settings.theme).toBe(Theme.Dark);
    });

    it('removes "dark" class from document.documentElement when theme is set to Light', () => {
      // Setup initial state as dark
      document.documentElement.classList.add('dark');
      useStore.setState({
        settings: { ...useStore.getState().settings, theme: Theme.Dark }
      });

      useStore.getState().updateSettings({ theme: Theme.Light });
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(useStore.getState().settings.theme).toBe(Theme.Light);
    });

    it('awards points and logs activity when profile setup is completed (userName changed from default)', () => {
      const addPointsMock = useStore.getState().addPoints;
      const logActivityMock = useStore.getState().logActivity;

      useStore.getState().updateSettings({ userName: 'New Tutor Name' });

      expect(addPointsMock).toHaveBeenCalledWith(POINTS_ALLOCATION.COMPLETE_PROFILE, "Completed profile setup!");
      expect(logActivityMock).toHaveBeenCalledWith('Completed profile setup', 'check-circle');
      expect(useStore.getState().settings.userName).toBe('New Tutor Name');
    });

    it('does not award points if userName was already changed from default', () => {
      // Set initial state to non-default userName
      useStore.setState({
        settings: { ...useStore.getState().settings, userName: 'Existing Tutor Name' }
      });
      const addPointsMock = useStore.getState().addPoints;

      useStore.getState().updateSettings({ userName: 'Another Tutor Name' });

      expect(addPointsMock).not.toHaveBeenCalled();
      expect(useStore.getState().settings.userName).toBe('Another Tutor Name');
    });

    it('sanitizes phone number and country inputs', () => {
      useStore.getState().updateSettings({
        phone: { countryCode: '+1', number: '<script>alert("xss")</script>1234567890' },
        country: '<b>United States</b>'
      });

      expect(useStore.getState().settings.phone?.number).toBe('alert("xss")1234567890');
      expect(useStore.getState().settings.country).toBe('United States');
    });
  });

  describe('toggleTheme', () => {
    it('toggles from Light to Dark mode', () => {
        vi.useFakeTimers();
        const logActivityMock = useStore.getState().logActivity;

        useStore.getState().toggleTheme();

        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(useStore.getState().settings.theme).toBe(Theme.Dark);

        vi.runAllTimers();
        expect(logActivityMock).toHaveBeenCalledWith('Switched to dark mode', 'moon');
        vi.useRealTimers();
    });

    it('toggles from Dark to Light mode', () => {
        vi.useFakeTimers();
        document.documentElement.classList.add('dark');
        useStore.setState({
          settings: { ...useStore.getState().settings, theme: Theme.Dark }
        });
        const logActivityMock = useStore.getState().logActivity;

        useStore.getState().toggleTheme();

        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(useStore.getState().settings.theme).toBe(Theme.Light);

        vi.runAllTimers();
        expect(logActivityMock).toHaveBeenCalledWith('Switched to light mode', 'sun');
        vi.useRealTimers();
    });
  });
});
