import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Button } from '../../components/ui';
import { IconName } from '../../types';

export const MagneticButton: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string; rightIcon?: IconName }> = ({ children, onClick, className, rightIcon }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(() => {
      if (ref.current) {
        rectRef.current = ref.current.getBoundingClientRect();
      }
    });
    observer.observe(ref.current);

    // Initial rect
    rectRef.current = ref.current.getBoundingClientRect();

    const handleScroll = () => {
       if (ref.current) {
          rectRef.current = ref.current.getBoundingClientRect();
       }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
       observer.disconnect();
       window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!rectRef.current) return;
    const rect = rectRef.current;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const style = { x: springX, y: springY };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className="inline-block"
    >
      <Button
        onClick={onClick}
        className={className}
        rightIcon={rightIcon}
      >
        {children}
      </Button>
    </motion.div>
  );
};
