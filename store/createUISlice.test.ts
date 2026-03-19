import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createUISlice } from './createUISlice';

describe('createUISlice', () => {
  let state: any;
  let set: any;
  let get: any;

  beforeEach(() => {
    state = {};
    set = vi.fn((update) => {
      if (typeof update === 'function') {
        state = { ...state, ...update(state) };
      } else {
        state = { ...state, ...update };
      }
    });
    get = vi.fn(() => state);

    const slice = createUISlice(set, get, null as any);
    state = { ...slice };

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with empty toasts and activityLog', () => {
    expect(state.toasts).toEqual([]);
    expect(state.activityLog).toEqual([]);
  });

  describe('addToast', () => {
    it('adds a toast to the toasts array with default type "info"', () => {
      state.addToast('Test message');

      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]).toMatchObject({
        message: 'Test message',
        type: 'info',
      });
      expect(state.toasts[0].id).toBeDefined();
      expect(typeof state.toasts[0].id).toBe('string');
    });

    it('adds a toast with specified type', () => {
      state.addToast('Error message', 'error');

      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]).toMatchObject({
        message: 'Error message',
        type: 'error',
      });
    });

    it('removes the toast after 4000ms', () => {
      state.addToast('Test message');
      expect(state.toasts).toHaveLength(1);

      vi.advanceTimersByTime(3999);
      expect(state.toasts).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(state.toasts).toHaveLength(0);
    });

    it('handles multiple toasts being added and removed independently', () => {
      state.addToast('Toast 1');
      vi.advanceTimersByTime(1000);
      state.addToast('Toast 2');

      expect(state.toasts).toHaveLength(2);

      vi.advanceTimersByTime(3000);
      // Toast 1 should be gone, Toast 2 should still be there
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe('Toast 2');

      vi.advanceTimersByTime(1000);
      // Both should be gone
      expect(state.toasts).toHaveLength(0);
    });
  });

  describe('logActivity', () => {
    it('adds an activity to the top of the activityLog', () => {
      const mockDate = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);

      state.logActivity('New student added', 'user-plus');

      expect(state.activityLog).toHaveLength(1);
      expect(state.activityLog[0]).toMatchObject({
        message: 'New student added',
        icon: 'user-plus',
        timestamp: mockDate.toISOString(),
      });
      expect(state.activityLog[0].id).toBeDefined();
    });

    it('maintains a maximum of 20 activities by removing oldest ones', () => {
      // Add 20 activities
      for (let i = 0; i < 20; i++) {
        state.logActivity(`Activity ${i}`, 'info');
      }

      expect(state.activityLog).toHaveLength(20);
      expect(state.activityLog[0].message).toBe('Activity 19');
      expect(state.activityLog[19].message).toBe('Activity 0');

      // Add one more
      state.logActivity('Activity 20', 'info');

      // Should still be 20, newest at top, oldest removed
      expect(state.activityLog).toHaveLength(20);
      expect(state.activityLog[0].message).toBe('Activity 20');
      expect(state.activityLog[19].message).toBe('Activity 1');
    });
  });

  describe('deleteActivity', () => {
    it('removes a specific activity by id', () => {
      state.logActivity('Activity 1', 'info');
      state.logActivity('Activity 2', 'info');

      const idToDelete = state.activityLog[0].id;
      const idToKeep = state.activityLog[1].id;

      state.deleteActivity(idToDelete);

      expect(state.activityLog).toHaveLength(1);
      expect(state.activityLog[0].id).toBe(idToKeep);
    });

    it('does nothing if id is not found', () => {
      state.logActivity('Activity 1', 'info');
      const initialLength = state.activityLog.length;

      state.deleteActivity('non-existent-id');

      expect(state.activityLog).toHaveLength(initialLength);
    });
  });

  describe('clearActivityLog', () => {
    it('empties the activityLog', () => {
      state.logActivity('Activity 1', 'info');
      state.logActivity('Activity 2', 'info');
      expect(state.activityLog).toHaveLength(2);

      state.clearActivityLog();

      expect(state.activityLog).toHaveLength(0);
    });
  });
});
