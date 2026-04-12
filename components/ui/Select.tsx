/**
 * @file Select.tsx
 * Defines the styled Select component for dropdowns.
 */

import React, { forwardRef } from 'react';

/**
 * Props for the Select component.
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Label text for the select dropdown. */
  label?: string;
  /** Error message to display below the select dropdown. */
  error?: string;
  /** CSS class for the wrapper div around the label and select. */
  wrapperClassName?: string;
  /** Array of options for the select dropdown. Each option has a `value` and `label`. */
  options: { value: string | number; label: string }[];
  /** Placeholder text for the default option (e.g., "Select an option"). */
  placeholder?: string;
}
/**
 * A styled select (dropdown) component.
 * It populates its options from an array of objects and supports a label and error messages.
 *
 * @param {SelectProps} props - The properties for the Select component.
 * @returns {React.ReactElement} A JSX element representing the select dropdown field.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, name, error, options, placeholder, wrapperClassName = "", className, ...props }, ref) => {
  const baseStyle = "block w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm bg-white dark:bg-primary-light disabled:opacity-50 transition-all duration-200 appearance-none";
  const errorStyle = "border-danger focus:ring-danger/50 focus:border-danger";
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className={wrapperClassName}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          name={name}
          id={name}
          className={`${baseStyle} ${error ? errorStyle : ""} ${className || ""}`}
          aria-invalid={!!error}
          aria-describedby={errorId}
          {...props}
        >
          {placeholder && <option value="" disabled hidden>{placeholder}</option>}
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <p id={errorId} className="mt-1.5 ml-1 text-xs text-danger font-medium">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';