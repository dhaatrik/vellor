import { StateCreator } from 'zustand';
import { AppState, UISlice } from './types';
import { Activity } from '../types';

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set) => ({
  toasts: [],
  activityLog: [],

  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
    }, 4000);
  },

  logActivity: (message, icon) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      message,
      icon,
      timestamp: new Date().toISOString(),
    };
    set(state => ({ activityLog: [newActivity, ...state.activityLog.slice(0, 19)] }));
  },

  deleteActivity: (id) => {
    set(state => ({ activityLog: state.activityLog.filter(a => a.id !== id) }));
  },

  clearActivityLog: () => set({ activityLog: [] }),
});
