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

  it('should animate to final text', () => {
    const text = 'hello';
    const { result } = renderHook(() => useCybertext(text));

    expect(result.current.length).toBe(text.length);

    act(() => {
      vi.advanceTimersByTime(16 * 15);
    });

    expect(result.current).toBe(text);
  });

  it('should handle spaces properly', () => {
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
});
