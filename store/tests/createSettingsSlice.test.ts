// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../../store';
import { Theme } from '../../types';
import { POINTS_ALLOCATION } from '../../constants';

describe('createSettingsSlice', () => {
  beforeEach(() => {
    // Reset store state and clear mocks
    useStore.setState({
      settings: {
        theme: Theme.Light,
        currencySymbol: '$',
        userName: '',
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

    });

    it('awards points and logs activity when profile setup is completed (userName changed from empty)', () => {
      const addPointsMock = useStore.getState().addPoints;
      const logActivityMock = useStore.getState().logActivity;

      useStore.getState().updateSettings({ userName: 'New Tutor Name' });

      expect(addPointsMock).toHaveBeenCalledWith(POINTS_ALLOCATION.COMPLETE_PROFILE, "Completed profile setup!");
      expect(logActivityMock).toHaveBeenCalledWith('Completed profile setup', 'check-circle');
      expect(useStore.getState().settings.userName).toBe('New Tutor Name');
    });

    it('does not award points if userName was already changed from empty', () => {
      // Set initial state to non-empty userName
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

      expect(useStore.getState().settings.phone?.number).toBe('1234567890');
      expect(useStore.getState().settings.country).toBe('United States');
    });

    it('rejects invalid image data URIs for logos', () => {
      // Set valid logos first
      useStore.getState().updateSettings({
        brandLogoBase64: 'data:image/png;base64,valid',
        invoiceLogoBase64: 'data:image/jpeg;base64,valid'
      });

      expect(useStore.getState().settings.brandLogoBase64).toBe('data:image/png;base64,valid');
      expect(useStore.getState().settings.invoiceLogoBase64).toBe('data:image/jpeg;base64,valid');

      // Try to update with invalid ones
      useStore.getState().updateSettings({
        brandLogoBase64: 'javascript:alert("brand")',
        invoiceLogoBase64: 'data:text/html,<script>alert("invoice")</script>'
      });

      // Should be cleared or at least not set to the malicious value
      expect(useStore.getState().settings.brandLogoBase64).not.toBe('javascript:alert("brand")');
      expect(useStore.getState().settings.invoiceLogoBase64).not.toBe('data:text/html,<script>alert("invoice")</script>');

      // Based on my proposed fix (setting to empty string), they should be empty
      expect(useStore.getState().settings.brandLogoBase64).toBe('');
      expect(useStore.getState().settings.invoiceLogoBase64).toBe('');
    });

});
