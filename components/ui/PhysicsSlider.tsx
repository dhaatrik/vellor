import React, { useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { useSpringVelocity } from '../../hooks/useSpringVelocity';

interface PhysicsSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export const PhysicsSlider: React.FC<PhysicsSliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Calculate the percentage from the value (0 to 1)
  const getPercentageFromValue = (val: number) => {
    return Math.max(0, Math.min(1, (val - min) / (max - min)));
  };

  // The spring will track percentage (0 to 1) directly, but mapped to px width dynamically during render,
  // or it tracks the px position directly. Tracking px directly is easier for the handle transform.
  const targetPositionRef = useRef(0);
  const lastWidthRef = useRef<number>(0);

  const [setTarget, setMutator] = useSpringVelocity({
    target: targetPositionRef.current,
    stiffness: 180,
    damping: 26,
    onUpdate: (pos) => {
      if (handleRef.current) {
        const boundedX = Math.max(0, Math.min(pos, lastWidthRef.current));
        handleRef.current.style.transform = `translate3d(${boundedX}px, -50%, 0)`;
      }
    }
  });

  // Helper to convert an event's clientX to a local X coordinate within the track
  const getLocalX = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(x, rect.width));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    if (trackRef.current) {
        lastWidthRef.current = trackRef.current.getBoundingClientRect().width;
    }
    const localX = getLocalX(e.clientX);
    targetPositionRef.current = localX;
    setTarget(localX);
    if (handleRef.current) {
        handleRef.current.focus();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const localX = getLocalX(e.clientX);
    targetPositionRef.current = localX;
    setTarget(localX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Commit the final value
    if (trackRef.current) {
        const width = trackRef.current.getBoundingClientRect().width;
        const localX = getLocalX(e.clientX);
        const percentage = localX / width;
        const finalValue = Math.round(min + percentage * (max - min));
        onChange(finalValue);
    }
  };

  // When component mounts or value prop changes externally, update target
  useEffect(() => {
    if (!isDraggingRef.current && trackRef.current) {
        const width = trackRef.current.getBoundingClientRect().width;
        lastWidthRef.current = width;
        const targetX = getPercentageFromValue(value) * width;
        targetPositionRef.current = targetX;
        setTarget(targetX);
    }
  }, [value, min, max, setTarget]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (trackRef.current) {
        const width = trackRef.current.getBoundingClientRect().width;
        lastWidthRef.current = width;
        // Adjust the target based on the current value so it stays in the right spot
        const targetX = getPercentageFromValue(value) * width;
        targetPositionRef.current = targetX;
        setTarget(targetX);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [value, min, max, setTarget]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let newValue = value;
    const step = 1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      newValue = Math.min(max, value + step);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      newValue = Math.max(min, value - step);
      e.preventDefault();
    }

    if (newValue !== value) {
        onChange(newValue);
    }
  };

  return (
    <div className="py-4">
      <div
        ref={trackRef}
        className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          ref={handleRef}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="absolute top-1/2 left-0 w-6 h-6 -ml-3 bg-accent rounded-full shadow-md cursor-grab focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:focus-visible:ring-offset-primary z-10 will-change-transform"
        />
      </div>
    </div>
  );
};
