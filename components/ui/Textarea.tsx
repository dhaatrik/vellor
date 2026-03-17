/**
 * @file Textarea.tsx
 * Defines the styled Textarea component for multi-line text input.
 */

import React, { forwardRef } from 'react';

/**
 * Props for the Textarea component.
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text for the textarea. */
  label?: string;
  /** Error message to display below the textarea. */
  error?: string;
  /** CSS class for the wrapper div around the label and textarea. */
  wrapperClassName?: string;
}
/**
 * A styled textarea component for multi-line text input.
 * It includes support for a label and an error message, similar to the `Input` component.
 *
 * @param {TextareaProps} props - The properties for the Textarea component.
 * @returns {React.ReactElement} A JSX element representing the textarea field and its label.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, name, error, wrapperClassName = "", className, ...props }, ref) => {
  const baseStyle = "block w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm bg-white dark:bg-primary-light disabled:opacity-50 transition-all duration-200 resize-y";
  const errorStyle = "border-danger focus:ring-danger/50 focus:border-danger";
  return (
    <div className={wrapperClassName}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">{label}</label>}
      <textarea ref={ref} name={name} id={name} rows={4} className={`${baseStyle} ${error ? errorStyle : ""} ${className || ""}`} {...props} />
      {error && <p className="mt-1.5 ml-1 text-xs text-danger font-medium">{error}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';