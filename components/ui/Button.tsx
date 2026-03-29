/**
 * @file Button.tsx
 * Defines the versatile Button component.
 */

import React from 'react';
import { Icon, IconProps } from './Icon';

/**
 * Props for the Button component.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. Defaults to 'primary'. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  /** Size of the button. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Optional icon name to display to the left of the button text. */
  leftIcon?: IconProps['iconName'];
  /** Optional icon name to display to the right of the button text. */
  rightIcon?: IconProps['iconName'];
  /** Optional loading state for the button. */
  isLoading?: boolean;
}
/**
 * A versatile button component that supports different visual styles, sizes, and optional icons.
 * It is built on top of the standard HTML `<button>` element and accepts all its native attributes.
 *
 * @param {ButtonProps} props - The properties for the Button component.
 * @returns {React.ReactElement} A JSX element representing the styled button.
 */
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', leftIcon, rightIcon, isLoading, className, disabled, ...props }) => {
  // Base styling for all buttons
  const baseStyle = "font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-out inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  // Style variations based on the 'variant' prop
  const variantStyles = {
    primary: "bg-accent hover:bg-accent-dark text-primary-dark focus:ring-accent-dark shadow-sm hover:shadow-md",
    secondary: "bg-secondary hover:bg-secondary-dark text-primary focus:ring-secondary-dark dark:bg-primary-light dark:text-white dark:hover:bg-primary-light/80 dark:focus:ring-gray-400 border border-transparent dark:border-white/5",
    danger: "bg-danger hover:bg-red-600 text-white focus:ring-red-600 shadow-sm hover:shadow-md",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-200 dark:text-gray-300 dark:hover:bg-primary-light dark:focus:ring-gray-600",
    outline: "border-2 border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-200 dark:border-primary-light dark:text-gray-300 dark:hover:bg-primary-light dark:hover:text-white dark:focus:ring-gray-600",
  };

  // Style variations based on the 'size' prop
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  // Adjust focus ring offset for dark mode based on new background
  const darkFocusOffset = (variant === 'ghost' || variant === 'outline') ? 'dark:focus:ring-offset-primary' : 'dark:focus:ring-offset-primary-dark';


  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''} ${darkFocusOffset}`} disabled={isLoading || disabled} {...props}>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <Icon iconName={leftIcon} className={`w-4 h-4 ${children ? "mr-2" : ""}`} />}
      {children}
      {!isLoading && rightIcon && <Icon iconName={rightIcon} className={`w-4 h-4 ${children ? "ml-2" : ""}`} />}
    </button>
  );
};