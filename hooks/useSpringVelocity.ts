import { useRef, useEffect, useCallback, useState } from 'react';

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export type SpringMutator = (currentValue: number) => void;

export const useSpringVelocity = (
  initialValue: number,
  config: SpringConfig = {}
): [
  number,
  (target: number) => void,
  (mutator: SpringMutator) => void,
  React.MutableRefObject<number>
] => {
  const { stiffness = 180, damping = 26, mass = 1 } = config;

  const [settledValue, setSettledValue] = useState<number>(initialValue);

  const currentRef = useRef<number>(initialValue);
  const targetRef = useRef<number>(initialValue);
  const velocityRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const mutatorRef = useRef<SpringMutator | null>(null);

  const tick = useCallback((time: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
      frameRef.current = requestAnimationFrame(tick);
      return;
    }

    const dtSeconds = Math.min((time - lastTimeRef.current) / 1000, 0.064);
    lastTimeRef.current = time;

    const current = currentRef.current;
    const target = targetRef.current;
    const velocity = velocityRef.current;

    const distance = current - target;
    const absDistance = distance < 0 ? -distance : distance;
    const absVelocity = velocity < 0 ? -velocity : velocity;

    if (absDistance < 0.001 && absVelocity < 0.001) {
      currentRef.current = target;
      velocityRef.current = 0;
      frameRef.current = 0;
      lastTimeRef.current = 0;

      const m = mutatorRef.current;
      if (m) {
        m(target);
      }
      setSettledValue(target);
      return;
    }

    // Explicit Euler numerical integration (second order system)
    const forceSpring = -stiffness * distance;
    const forceDamper = -damping * velocity;
    const acceleration = (forceSpring + forceDamper) / mass;

    const newVelocity = velocity + acceleration * dtSeconds;
    const newCurrent = current + newVelocity * dtSeconds;

    velocityRef.current = newVelocity;
    currentRef.current = newCurrent;

    const m = mutatorRef.current;
    if (m) {
      m(newCurrent);
    }

    frameRef.current = requestAnimationFrame(tick);
  }, [stiffness, damping, mass]);

  const setTarget = useCallback((newTarget: number) => {
    targetRef.current = newTarget;
    if (frameRef.current === 0) {
      lastTimeRef.current = 0;
      frameRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const setMutator = useCallback((mutator: SpringMutator) => {
    mutatorRef.current = mutator;
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current !== 0) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return [settledValue, setTarget, setMutator, currentRef];
};
