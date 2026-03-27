/**
 * @file Input.tsx
 * Defines the styled Input component for form fields.
 */

import React, { forwardRef } from 'react';

/**
 * Props for the Input component.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text for the input field. */
  label?: string;
  /** Error message to display below the input. */
  error?: string;
  /** Helper text to display below the input. */
  helperText?: string;
  /** CSS class for the wrapper div around the label and input. */
  wrapperClassName?: string;
}
/**
 * A styled input component for text, email, number, and other standard input fields.
 * It provides built-in support for a label, error messages, and helper text.
 *
 * @param {InputProps} props - The properties for the Input component.
 * @returns {React.ReactElement} A JSX element representing the input field, label, and associated text.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, name, error, helperText, type = "text", wrapperClassName = "", className, ...props }, ref) => {
  const baseStyle = "block w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm bg-white dark:bg-primary-light disabled:opacity-50 transition-all duration-200";
  const errorStyle = "border-danger focus:ring-danger/50 focus:border-danger"; // Style for error state
  const errorId = error ? `${name}-error` : undefined;
  const helperId = helperText ? `${name}-helper` : undefined;
  const describedBy = errorId ? errorId : helperId;

  return (
    <div className={wrapperClassName}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">{label}</label>}
      <input
        ref={ref}
        type={type}
        name={name}
        id={name}
        className={`${baseStyle} ${error ? errorStyle : ""} ${className || ""}`}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...props}
      />
      {error && <p id={errorId} className="mt-1.5 ml-1 text-xs text-danger font-medium">{error}</p>}
      {!error && helperText && <p id={helperId} className="mt-1.5 ml-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
});
Input.displayName = 'Input';