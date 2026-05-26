import { StateCreator } from 'zustand';
import { AppState, SettingsSlice } from './types';
import { Theme } from '../types';
import { DEFAULT_CURRENCY_SYMBOL, POINTS_ALLOCATION } from '../constants';
import { sanitizeString } from '../helpers';

const getInitialTheme = (): Theme => {
  return Theme.Dark;
};

export const createSettingsSlice: StateCreator<AppState, [], [], SettingsSlice> = (set, get) => ({
  settings: {
    theme: getInitialTheme(),
    currencySymbol: DEFAULT_CURRENCY_SYMBOL,
    userName: '',
    country: 'United States',
    phone: { countryCode: '+1', number: '' },
    email: '',
    monthlyGoal: 500,
    hasCompletedOnboarding: false,
    enableReminders: false,
    invoiceTemplate: 'modern',
    gamificationEnabled: true,
    customRankTitles: [],
    brandColor: '#8b5cf6', // default violet-500
    brandLogoBase64: '',
  },

  updateSettings: (newSettings) => {
    const state = get();
    if (!state.settings.userName && newSettings.userName) {
        state.addPoints(POINTS_ALLOCATION.COMPLETE_PROFILE, "Completed profile setup!");
        state.logActivity('Completed profile setup', 'check-circle');
    }
    if (newSettings.userName) {
        newSettings.userName = sanitizeString(newSettings.userName);
    }
    if (newSettings.email !== undefined) {
        newSettings.email = sanitizeString(newSettings.email);
    }
    if (newSettings.phone) {
        newSettings.phone.number = sanitizeString(newSettings.phone.number);
    }
    if (newSettings.country) {
        newSettings.country = sanitizeString(newSettings.country);
    }
    if (newSettings.customRankTitles) {
        if (newSettings.customRankTitles !== state.settings.customRankTitles) {
            newSettings.customRankTitles = newSettings.customRankTitles.map((title, idx) => title === state.settings.customRankTitles?.[idx] ? title : sanitizeString(title));
        }
    }
    if (newSettings.customAchievement) {
        newSettings.customAchievement = sanitizeString(newSettings.customAchievement);
    }
    if (newSettings.brandColor) {
        newSettings.brandColor = sanitizeString(newSettings.brandColor);
    }
    if (newSettings.currencySymbol) {
        newSettings.currencySymbol = sanitizeString(newSettings.currencySymbol);
    }

    // Validate that image data URIs start with data:image/ to prevent XSS via javascript: or other schemes
    if (newSettings.brandLogoBase64 !== undefined && newSettings.brandLogoBase64 !== '' && !newSettings.brandLogoBase64.startsWith('data:image/')) {
        newSettings.brandLogoBase64 = '';
    }
    if (newSettings.invoiceLogoBase64 !== undefined && newSettings.invoiceLogoBase64 !== '' && !newSettings.invoiceLogoBase64.startsWith('data:image/')) {
        newSettings.invoiceLogoBase64 = '';
    }

    set(s => ({ settings: { ...s.settings, ...newSettings } }));
    get().addToast('Settings saved successfully.', 'success');
    get().checkAndAwardAchievements();
  },
});
