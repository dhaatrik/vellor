/**
 * @file Card.tsx
 * Defines the flexible Card component for content grouping.
 */

import React, { ReactNode } from 'react';
import { Icon, IconProps } from './Icon';

/**
 * Props for the Card component.
 */
interface CardProps {
  /** Content to be displayed within the card. */
  children: ReactNode;
  /** Optional CSS classes to apply to the card container. */
  className?: string;
  /** Optional title for the card header. */
  title?: string;
  /** Optional icon name to display next to the card title. */
  titleIcon?: IconProps['iconName'];
  /** Optional React node for actions (e.g., buttons) in the card header. */
  actions?: ReactNode;
}
/**
 * A flexible card component for grouping and displaying content in a visually distinct block.
 * It supports an optional header with a title, icon, and action elements.
 *
 * @param {CardProps & React.HTMLAttributes<HTMLDivElement>} props - The properties for the Card component, including standard div attributes.
 * @returns {React.ReactElement} A JSX element representing the card.
 */
export const Card: React.FC<CardProps & React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", title, titleIcon, actions, ...props }) => {
  return (
    <div className={`bg-transparent border border-white/5 p-6 ${className}`} {...props}>
      {/* Card Header (if title or actions are provided) */}
      {(title || actions) && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
          {title && (
            <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-white flex items-center">
              {titleIcon && <Icon iconName={titleIcon} className="w-5 h-5 mr-3 text-accent" />}
              {title}
            </h2>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {/* Card Body */}
      {children}
    </div>
  );
};