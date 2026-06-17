import { renderHook, act } from '@testing-library/react';
import { useCybertext } from './useCybertext';
import { vi } from 'vitest';

describe('useCybertext', () => {
  let frameId = 0;
  let timeouts: any[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      frameId++;
      const id = frameId;
      timeouts[id] = setTimeout(() => cb(Date.now()), 16);
      return id;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id: number) => {
      clearTimeout(timeouts[id]);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should immediately return empty string if input is empty', () => {
    const { result } = renderHook(() => useCybertext(''));
    expect(result.current).toBe('');
  });

  it('should animate text by resolving characters across frames', () => {
    const text = 'hello';
    const { result } = renderHook(() => useCybertext(text));

    // Initially, it might have random tokens
    expect(result.current.length).toBe(text.length);

    // Frame 1-2: 0 chars resolved -> random string of same length
    act(() => {
      vi.advanceTimersByTime(16 * 1);
    });
    expect(result.current).not.toBe(text);

    // Frame 3-4: 1 char resolved -> 'h' + random
    act(() => {
      vi.advanceTimersByTime(16 * 2);
    });
    expect(result.current.startsWith('h')).toBe(true);
    expect(result.current).not.toBe(text);

    // Skip to end (needs text.length * 2 frames)
    act(() => {
      vi.advanceTimersByTime(16 * 15);
    });

    expect(result.current).toBe(text);
  });

  it('should preserve spaces during animation', () => {
    const { result } = renderHook(() => useCybertext('a b'));

    act(() => {
      vi.advanceTimersByTime(16 * 1);
    });

    expect(result.current[1]).toBe(' ');
  });

  it('should not throw error if text is undefined', () => {
    // @ts-ignore
    const { result } = renderHook(() => useCybertext(undefined));
    expect(result.current).toBe(undefined);
  });

  it('should update and re-animate if text changes', () => {
    const { result, rerender } = renderHook(({ text }) => useCybertext(text), {
      initialProps: { text: 'one' }
    });

    act(() => {
      vi.advanceTimersByTime(16 * 10);
    });
    expect(result.current).toBe('one');

    rerender({ text: 'two' });

    act(() => {
      vi.advanceTimersByTime(16 * 1);
    });
    expect(result.current).not.toBe('two');

    act(() => {
      vi.advanceTimersByTime(16 * 10);
    });
    expect(result.current).toBe('two');
  });

  it('should cancel animation frame on unmount', () => {
    const { unmount } = renderHook(() => useCybertext('hello'));
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
