import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../../store';

describe('Gamification Slice - addPoints', () => {
  beforeEach(() => {
    // Reset store to a clean state for gamification
    useStore.setState({
      gamification: {
        points: 0,
        level: 1,
        levelName: 'Novice Tutor',
        streak: 0,
        lastActiveDate: null,
      },
      toasts: [],
    });
  });

  it('adds points without leveling up', () => {
    useStore.getState().addPoints(50);
    const state = useStore.getState();
    expect(state.gamification.points).toBe(50);
    expect(state.gamification.level).toBe(1);
    expect(state.gamification.levelName).toBe('Novice Tutor');
  });

  it('adds points and levels up to Level 2 (Skilled Educator)', () => {
    useStore.getState().addPoints(100);
    const state = useStore.getState();
    expect(state.gamification.points).toBe(100);
    expect(state.gamification.level).toBe(2);
    expect(state.gamification.levelName).toBe('Skilled Educator');
  });

  it('adds points and levels up to Level 3 (Master Mentor)', () => {
    useStore.getState().addPoints(500);
    const state = useStore.getState();
    expect(state.gamification.points).toBe(500);
    expect(state.gamification.level).toBe(3);
    expect(state.gamification.levelName).toBe('Master Mentor');
  });

  it('adds points and levels up to Level 4 (Tuition Titan)', () => {
    useStore.getState().addPoints(1000);
    const state = useStore.getState();
    expect(state.gamification.points).toBe(1000);
    expect(state.gamification.level).toBe(4);
    expect(state.gamification.levelName).toBe('Tuition Titan');
  });

  it('adds points and levels up to Level 5 (Academic Ace)', () => {
    useStore.getState().addPoints(2000);
    const state = useStore.getState();
    expect(state.gamification.points).toBe(2000);
    expect(state.gamification.level).toBe(5);
    expect(state.gamification.levelName).toBe('Academic Ace');
  });

  it('adds points and levels up to Level 6 (Scholarly Sensei)', () => {
    useStore.getState().addPoints(5000);
    const state = useStore.getState();
    expect(state.gamification.points).toBe(5000);
    expect(state.gamification.level).toBe(6);
    expect(state.gamification.levelName).toBe('Scholarly Sensei');
  });

  it('adds points past the maximum level (Level 6)', () => {
    useStore.getState().addPoints(5500);
    const state = useStore.getState();
    expect(state.gamification.points).toBe(5500);
    expect(state.gamification.level).toBe(6);
    expect(state.gamification.levelName).toBe('Scholarly Sensei');
  });

  it('adds a toast when a reason is provided', () => {
    useStore.getState().addPoints(50, 'Completed profile');
    const state = useStore.getState();
    expect(state.toasts.length).toBe(1);
    expect(state.toasts[0].message).toBe('+50 points: Completed profile');
    expect(state.toasts[0].type).toBe('success');
  });

  it('does not add a toast when no reason is provided', () => {
    useStore.getState().addPoints(50);
    const state = useStore.getState();
    expect(state.toasts.length).toBe(0);
  });
});
