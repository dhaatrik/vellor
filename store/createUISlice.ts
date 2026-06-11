import { StateCreator } from 'zustand';
import { AppState, UISlice } from './types';
import { Activity } from '../types';
import { generateId } from '../helpers';

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set) => ({
  toasts: [],
  activityLog: [],

  addToast: (message, type = 'info') => {
    const id = generateId();
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(state => {
        const nextToasts: AppState['toasts'] = [];
        for (let i = 0; i < state.toasts.length; i++) {
          const toast = state.toasts[i];
          if (toast.id !== id) {
            nextToasts.push(toast);
          }
        }
        return { toasts: nextToasts };
      });
    }, 4000);
  },

  logActivity: (message, icon) => {
    const newActivity: Activity = {
      id: generateId(),
      message,
      icon,
      timestamp: new Date().toISOString(),
    };
    set(state => ({ activityLog: [newActivity, ...state.activityLog.slice(0, 19)] }));
  },

  deleteActivity: (id) => {
    set((state) => {
      const nextActivityLog: Activity[] = [];
      for (let i = 0; i < state.activityLog.length; i++) {
        if (state.activityLog[i].id !== id) {
          nextActivityLog.push(state.activityLog[i]);
        }
      }
      return { activityLog: nextActivityLog };
    });
  },

  clearActivityLog: () => set({ activityLog: [] }),
});
