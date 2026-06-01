import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { PhysicsSlider } from '../PhysicsSlider';

// Mock useSpringVelocity hook
vi.mock('../../hooks/useSpringVelocity', () => ({
  useSpringVelocity: vi.fn(() => [vi.fn(), vi.fn(), { current: 0 }]),
}));

describe('PhysicsSlider component', () => {
  let originalGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;

  beforeEach(() => {
    // Mock getBoundingClientRect for track calculations
    originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 100,
      height: 10,
      top: 0,
      left: 10, // Track starts at x=10
      bottom: 10,
      right: 110,
      x: 10,
      y: 0,
      toJSON: () => {}
    }));
  });

  afterEach(() => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<PhysicsSlider value={50} onChange={vi.fn()} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuemin', '1');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders with custom min and max props', () => {
    render(<PhysicsSlider value={5} onChange={vi.fn()} min={0} max={10} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '10');
  });

  it('handles keyboard navigation correctly', () => {
    const onChangeMock = vi.fn();
    render(<PhysicsSlider value={50} onChange={onChangeMock} />);

    const slider = screen.getByRole('slider');

    // Arrow Right increases value
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChangeMock).toHaveBeenCalledWith(51);

    // Arrow Up increases value
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    expect(onChangeMock).toHaveBeenCalledWith(51);

    // Arrow Left decreases value
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onChangeMock).toHaveBeenCalledWith(49);

    // Arrow Down decreases value
    fireEvent.keyDown(slider, { key: 'ArrowDown' });
    expect(onChangeMock).toHaveBeenCalledWith(49);
  });

  it('respects min and max bounds during keyboard navigation', () => {
    const onChangeMock = vi.fn();

    // Test Max bound
    const { rerender } = render(<PhysicsSlider value={100} onChange={onChangeMock} />);
    const sliderMax = screen.getByRole('slider');
    fireEvent.keyDown(sliderMax, { key: 'ArrowRight' });
    expect(onChangeMock).not.toHaveBeenCalled(); // Shouldn't change past max

    // Test Min bound
    rerender(<PhysicsSlider value={1} onChange={onChangeMock} />);
    const sliderMin = screen.getByRole('slider');
    fireEvent.keyDown(sliderMin, { key: 'ArrowLeft' });
    expect(onChangeMock).not.toHaveBeenCalled(); // Shouldn't change past min
  });

  it('handles pointer drag interaction', () => {
    const onChangeMock = vi.fn();
    render(<PhysicsSlider value={10} onChange={onChangeMock} min={0} max={100} />);

    // The track is the parent of the slider role element
    const track = screen.getByRole('slider').parentElement!;

    // Simulate setting pointer capture
    track.setPointerCapture = vi.fn();
    track.releasePointerCapture = vi.fn();

    // 1. Pointer Down
    // ClientX: 60, Rect Left: 10 -> localX: 50. Width: 100. Percentage: 50%.
    fireEvent.pointerDown(track, { clientX: 60, pointerId: 1 });
    expect(track.setPointerCapture).toHaveBeenCalledWith(1);

    // 2. Pointer Move
    // ClientX: 85, Rect Left: 10 -> localX: 75. Width: 100. Percentage: 75%.
    fireEvent.pointerMove(track, { clientX: 85, pointerId: 1 });

    // 3. Pointer Up
    fireEvent.pointerUp(track, { clientX: 85, pointerId: 1 });
    expect(track.releasePointerCapture).toHaveBeenCalledWith(1);

    // Final value should be calculated based on the pointer up position:
    // percentage: 75% -> 0.75 * 100 = 75
    expect(onChangeMock).toHaveBeenCalledWith(75);
  });

  it('bounds pointer interaction within track limits', () => {
    const onChangeMock = vi.fn();
    render(<PhysicsSlider value={50} onChange={onChangeMock} min={0} max={100} />);

    const track = screen.getByRole('slider').parentElement!;
    track.setPointerCapture = vi.fn();
    track.releasePointerCapture = vi.fn();

    // Pointer down and drag way past the right edge
    fireEvent.pointerDown(track, { clientX: 50, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 200, pointerId: 1 }); // localX will be capped at 100
    fireEvent.pointerUp(track, { clientX: 200, pointerId: 1 });

    // Expected to cap at max value (100)
    expect(onChangeMock).toHaveBeenCalledWith(100);

    onChangeMock.mockClear();

    // Pointer down and drag way past the left edge
    fireEvent.pointerDown(track, { clientX: 50, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: -50, pointerId: 1 }); // localX will be capped at 0
    fireEvent.pointerUp(track, { clientX: -50, pointerId: 1 });

    // Expected to cap at min value (0)
    expect(onChangeMock).toHaveBeenCalledWith(0);
  });

  it('does not trigger drag logic if not dragging on pointer move/up', () => {
    const onChangeMock = vi.fn();
    render(<PhysicsSlider value={50} onChange={onChangeMock} />);

    const track = screen.getByRole('slider').parentElement!;

    // Just move and up without down
    fireEvent.pointerMove(track, { clientX: 50 });
    fireEvent.pointerUp(track, { clientX: 50 });

    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('handles window resize events properly', () => {
    const onChangeMock = vi.fn();
    render(<PhysicsSlider value={50} onChange={onChangeMock} />);

    // Simulate resize
    fireEvent.resize(window);

    // As we mock setTarget, we could inspect it if we expose the mock
    // Just verifying it doesn't crash on resize is good, and it maintains state
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });
});
