import { renderHook, act } from '@testing-library/react';
import { useSpringVelocity } from './useSpringVelocity';
import { vi } from 'vitest';

describe('useSpringVelocity', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize correctly', () => {
    const { result } = renderHook(() => useSpringVelocity(0));
    const [setTarget, setMutator, currentRef] = result.current;


    expect(currentRef.current).toBe(0);
    expect(typeof setTarget).toBe('function');
    expect(typeof setMutator).toBe('function');
  });

  it('should settle to target', () => {
    let mutatorCalled = false;
    const { result } = renderHook(() => useSpringVelocity(0));

    act(() => {
      result.current[1](() => {
        mutatorCalled = true;
      });
      result.current[0](100);
    });

    act(() => {
      vi.advanceTimersByTime(16);
    });

    act(() => {
      vi.runAllTimers();
    });


    expect(result.current[2].current).toBe(100);
    expect(mutatorCalled).toBe(true);
  });
});
