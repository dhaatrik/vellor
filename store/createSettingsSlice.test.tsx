import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useStore } from '../store';
import { Theme } from '../types';

describe('Zustand Store - Settings (toggleTheme)', () => {
  beforeEach(() => {
    // Reset document classes
    window.document.documentElement.className = '';

    // Clear the store and activity log
    useStore.setState({
        settings: {
            theme: Theme.Dark,
            currencySymbol: '$',
            userName: 'Tutor',
            country: 'United States',
            phone: { countryCode: '+1', number: '' },
            email: '',
            monthlyGoal: 500,
        },
        activityLog: []
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
      vi.useRealTimers();
  });

  it('toggles theme from dark to light', () => {
    // Initial state is Dark
    useStore.setState({ settings: { ...useStore.getState().settings, theme: Theme.Dark } });
    window.document.documentElement.classList.add('dark');

    // Action
    useStore.getState().toggleTheme();

    // Assertions
    expect(useStore.getState().settings.theme).toBe(Theme.Light);
    expect(window.document.documentElement.classList.contains('dark')).toBe(false);

    // Verify activity logging via setTimeout
    vi.runAllTimers();
    expect(useStore.getState().activityLog).toHaveLength(1);
    expect(useStore.getState().activityLog[0].message).toContain('Switched to light mode');
  });

  it('toggles theme from light to dark', () => {
    // Initial state is Light
    useStore.setState({ settings: { ...useStore.getState().settings, theme: Theme.Light } });
    expect(window.document.documentElement.classList.contains('dark')).toBe(false);

    // Action
    useStore.getState().toggleTheme();

    // Assertions
    expect(useStore.getState().settings.theme).toBe(Theme.Dark);
    expect(window.document.documentElement.classList.contains('dark')).toBe(true);

    // Verify activity logging via setTimeout
    vi.runAllTimers();
    expect(useStore.getState().activityLog).toHaveLength(1);
    expect(useStore.getState().activityLog[0].message).toContain('Switched to dark mode');
  });
});
