/**
 * @file ProgressBar.tsx
 * Defines the ProgressBar component to visualize progress.
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the ProgressBar component.
 */
interface ProgressBarProps {
  /** Current value of the progress bar (0 to 100). */
  progress: number;
  /** Optional Tailwind CSS class for the progress bar color (e.g., "bg-green-500"). Defaults to "bg-accent". */
  color?: string;
  /** Optional label to display above the progress bar. */
  label?: string;
}

/**
 * A progress bar component to visually represent the completion of a task or a goal.
 * It displays a filled bar corresponding to the `progress` prop (0-100), and can include an optional label.
 *
 * @param {ProgressBarProps} props - The properties for the ProgressBar component.
 * @returns {React.ReactElement} A JSX element representing the progress bar.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = 'bg-accent', label }) => {
  // Ensure value is within the 0-100 range
  const clampedValue = Math.max(0, Math.min(100, progress));
  return (
    <div>
      {/* Optional label and percentage display */}
      {label && (
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-primary-light px-2 py-0.5 rounded-full">{clampedValue.toFixed(0)}%</span>
        </div>
      )}
      {/* Progress bar track */}
      <div className="w-full bg-gray-100 dark:bg-primary/50 rounded-full h-3 overflow-hidden shadow-inner border border-gray-200 dark:border-white/5">
        {/* Progress bar fill */}
        <motion.div
          className={`${color} h-full rounded-full relative`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
        </motion.div>
      </div>
    </div>
  );
};
