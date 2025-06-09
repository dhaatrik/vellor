
/**
 * @file UI.tsx
 * This file contains reusable UI components for the TutorFlow application.
 * These components are styled using Tailwind CSS and include common elements
 * like Icons, Buttons, Inputs, Modals, Cards, etc.
 */

import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
// Theme import might be relevant if specific theme-based logic were in UI components,
// but currently it's primarily handled by Tailwind's 'dark' class variant.
// import { Theme } from '../types'; 

/**
 * Props for the Icon component.
 */
interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Name of the icon to display. Must match a key in the `icons` record. */
  iconName: 'user' | 'users' | 'currency-dollar' | 'calendar' | 'cog' | 'plus' | 'pencil' | 'trash' | 'moon' | 'sun' | 'x-mark' | 'academic-cap' | 'chart-bar' | 'document-text' | 'arrow-left' | 'identification' | 'warning' | 'bars' | 'banknotes' | 'star' | 'bolt' | 'trophy' | 'sparkles';
  /** Optional CSS classes to apply to the SVG element. */
  className?: string;
}

/**
 * A generic Icon component that renders SVG icons based on `iconName`.
 * Icons are defined as SVG path data.
 * @param {IconProps} props The properties for the Icon component.
 * @returns {React.ReactElement} The SVG icon element.
 */
export const Icon: React.FC<IconProps> = ({ iconName, className = 'w-6 h-6', ...props }) => {
  // A record mapping icon names to their SVG path elements.
  const icons: Record<IconProps['iconName'], ReactNode> = {
    // User-related icons
    'user': <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
    'users': <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.247-3.345A6.375 6.375 0 0112 12.75a6.375 6.375 0 01-3.359-1.003m2.663-1.148a3 3 0 10-3.931 4.304A9.091 9.091 0 006 18.72m9.75-3.542A3 3 0 0013.5 12.75a3 3 0 00-3.75 2.44m11.25-2.44a9.094 9.094 0 00-3.741-.479m-.247 3.345a6.375 6.375 0 01-.806-.066m3.262-3.873A3.75 3.75 0 109.75 9.75a3.75 3.75 0 004.5 3.345m.75-3.345a3.75 3.75 0 10-6.592-2.036M6.75 9.75A.75.75 0 016 9m.75.75a.75.75 0 00-.75.75M12 3.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 3.75z" />,
    'academic-cap': <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />,
    'identification': <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm0-15V6.75m0 0H2.25m2.25 0h15M2.25 6.75v10.5M17.25 4.5l-4.5 4.5-4.5-4.5m0 15v-6.75" />,
    // Financial and transactional icons
    'currency-dollar': <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'banknotes': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 3.75h16.5M5.25 19.5h13.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25z" />,
    // UI and action icons
    'calendar': <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" />,
    'cog': ( // Settings/Gear icon
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V19a2 2 0 01-2 2h-2.14a2 2 0 01-2-2v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H5a2 2 0 01-2-2v-2.14a2 2 0 012-2h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V5a2 2 0 012-2h2.14a2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H19a2 2 0 012 2v2.14a2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </>
    ),
    'plus': <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
    'pencil': <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />,
    'trash': <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.223.224M9 5.25V3m3.259 2.25V3m-3.223 2.25l-1.34 6.61a2.253 2.253 0 001.193 2.792l3.58 1.583a2.253 2.253 0 002.792-1.193l6.61-1.34m0 0V5.25" />,
    'moon': <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />,
    'sun': <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2M12 22v-2M5.636 5.636l-1.414-1.414M19.778 19.778l-1.414-1.414M4 12H2M22 12h-2M5.636 18.364l-1.414 1.414M19.778 4.222l-1.414 1.414M12 16a4 4 0 100-8 4 4 0 000 8z"/>, // Sun with center body
    'x-mark': <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    'arrow-left': <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />,
    'bars': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />, // Hamburger menu icon
    // Data and document icons
    'chart-bar': <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
    'document-text': <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
    // Gamification and status icons
    'star': <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.324h5.383c.493 0 .704.656.343.992l-4.36 3.176a.563.563 0 00-.182.635l1.632 4.995c.155.476-.43.868-.837.536L12 15.43l-4.055 2.875c-.407.288-1.002-.04-1.002-.536l1.632-4.995a.563.563 0 00-.182.635L4.03 9.924c-.36-.263-.149-.992.343-.992h5.383a.563.563 0 00.475-.324L11.48 3.5z" />,
    'bolt': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />, // Lightning bolt
    'trophy': <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3V21m-12 0v-2.25a3 3 0 013-3h3.75Y18 15M12 9.75V3M12 3H9.75M12 3h2.25M9.75 3a3 3 0 00-3 3v.75m3-3.75A3 3 0 0115 6.75v.75m0 0a3 3 0 00-3-3M9.75 3.75A3 3 0 006.75 6v.75M6.75 15h9" />,
    'sparkles': <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 7.5l-2.846-.813a4.5 4.5 0 00-3.09-3.09L9 0l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 6l-2.846.813a4.5 4.5 0 00-3.09 3.09L9 12.75l.813-2.846a4.5 4.5 0 003.09-3.09L15.75 9l2.75-1.5z" />,
    // Alert icon
    'warning': <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      {icons[iconName]}
    </svg>
  );
};


/**
 * Props for the Button component.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. Defaults to 'primary'. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  /** Size of the button. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Optional icon name to display to the left of the button text. */
  leftIcon?: IconProps['iconName'];
  /** Optional icon name to display to the right of the button text. */
  rightIcon?: IconProps['iconName'];
}
/**
 * A versatile Button component with different variants, sizes, and optional icons.
 * @param {ButtonProps} props The properties for the Button component.
 * @returns {React.ReactElement} The button element.
 */
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', leftIcon, rightIcon, className, ...props }) => {
  // Base styling for all buttons
  const baseStyle = "font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Style variations based on the 'variant' prop
  const variantStyles = {
    primary: "bg-primary hover:bg-primary-dark text-white focus:ring-primary-dark",
    secondary: "bg-secondary hover:bg-secondary-dark text-primary focus:ring-secondary-dark dark:focus:ring-neutral-400",
    danger: "bg-danger hover:bg-red-600 text-white focus:ring-red-600",
    ghost: "bg-transparent hover:bg-slate-200 text-primary focus:ring-primary-light dark:text-secondary dark:hover:bg-neutral-700 dark:focus:ring-neutral-600",
    outline: "border-primary text-primary hover:bg-primary hover:text-secondary-light focus:ring-primary-light dark:border-neutral-600 dark:text-secondary-light dark:hover:bg-neutral-700 dark:hover:text-white dark:hover:border-neutral-700 dark:focus:ring-neutral-500",
  };

  // Style variations based on the 'size' prop
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Adjust focus ring offset for dark mode based on new background
  const darkFocusOffset = (variant === 'ghost' || variant === 'outline') ? 'dark:focus:ring-offset-primary' : 'dark:focus:ring-offset-neutral-800';


  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${darkFocusOffset}`} {...props}>
      {leftIcon && <Icon iconName={leftIcon} className={`w-5 h-5 ${children ? "mr-2" : ""}`} />}
      {children}
      {rightIcon && <Icon iconName={rightIcon} className={`w-5 h-5 ${children ? "ml-2" : ""}`} />}
    </button>
  );
};

/**
 * Props for the Input component.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
 * A styled Input component for text, email, number, etc. fields.
 * Includes support for labels, error messages, and helper text.
 * @param {InputProps} props The properties for the Input component.
 * @returns {React.ReactElement} The input field with optional label and messages.
 */
export const Input: React.FC<InputProps> = ({ label, name, error, helperText, type = "text", wrapperClassName = "", className, ...props }) => {
  const baseStyle = "block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-primary-light disabled:opacity-50"; // dark:bg-slate-800 -> dark:bg-primary-light
  const errorStyle = "border-danger focus:ring-danger focus:border-danger"; // Style for error state
  return (
    <div className={wrapperClassName}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <input type={type} name={name} id={name} className={`${baseStyle} ${error ? errorStyle : ""} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
};

/**
 * Props for the Textarea component.
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text for the textarea. */
  label?: string;
  /** Error message to display below the textarea. */
  error?: string;
  /** CSS class for the wrapper div around the label and textarea. */
  wrapperClassName?: string;
}
/**
 * A styled Textarea component for multi-line text input.
 * Includes support for labels and error messages.
 * @param {TextareaProps} props The properties for the Textarea component.
 * @returns {React.ReactElement} The textarea field with optional label and error message.
 */
export const Textarea: React.FC<TextareaProps> = ({ label, name, error, wrapperClassName = "", className, ...props }) => {
  const baseStyle = "block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-primary-light disabled:opacity-50"; // dark:bg-slate-800 -> dark:bg-primary-light
  const errorStyle = "border-danger focus:ring-danger focus:border-danger";
  return (
    <div className={wrapperClassName}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <textarea name={name} id={name} rows={3} className={`${baseStyle} ${error ? errorStyle : ""} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};


/**
 * Props for the Select component.
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
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
 * A styled Select (dropdown) component.
 * Supports labels, error messages, and a list of options.
 * @param {SelectProps} props The properties for the Select component.
 * @returns {React.ReactElement} The select dropdown field.
 */
export const Select: React.FC<SelectProps> = ({ label, name, error, options, placeholder, wrapperClassName = "", className, ...props }) => {
  const baseStyle = "block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-primary-light disabled:opacity-50"; // dark:bg-slate-800 -> dark:bg-primary-light
  const errorStyle = "border-danger focus:ring-danger focus:border-danger";
  return (
    <div className={wrapperClassName}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <select name={name} id={name} className={`${baseStyle} ${error ? errorStyle : ""} ${className}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};


/**
 * Props for the Modal component.
 */
interface ModalProps {
  /** Controls whether the modal is open or closed. */
  isOpen: boolean;
  /** Function to call when the modal should be closed (e.g., by clicking overlay or close button). */
  onClose: () => void;
  /** Optional title for the modal header. */
  title?: string;
  /** Content to be displayed within the modal body. */
  children: ReactNode;
  /** Optional footer content, typically for action buttons. */
  footer?: ReactNode;
}
/**
 * A Modal component for displaying content in a layer above the main page.
 * Includes a header with an optional title and close button, a scrollable body, and an optional footer.
 * @param {ModalProps} props The properties for the Modal component.
 * @returns {React.ReactElement | null} The modal element if `isOpen` is true, otherwise null.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null; // Don't render if not open

  return (
    // Overlay covering the entire screen
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in p-4" role="dialog" aria-modal="true" aria-labelledby={title ? "modal-title" : undefined}>
      {/* Modal Panel */}
      <div className="bg-white dark:bg-primary rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh] animate-slide-in-up"> {/* dark:bg-slate-800 -> dark:bg-primary */}
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          {title && <h3 id="modal-title" className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 mr-2 leading-tight">{title}</h3>}
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal" className="-mt-1 -mr-1 sm:mt-0 sm:-mr-0">
            <Icon iconName="x-mark" className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Body - Scrollable area for content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {children}
        </div>

        {/* Modal Footer (optional) */}
        {footer && (
          <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};


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
 * A Card component for grouping and displaying content in a visually distinct block.
 * Supports an optional title, title icon, and action elements in its header.
 * @param {CardProps} props The properties for the Card component.
 * @returns {React.ReactElement} The card element.
 */
export const Card: React.FC<CardProps> = ({ children, className = "", title, titleIcon, actions }) => {
  return (
    <div className={`bg-white dark:bg-primary shadow-lg rounded-xl p-6 ${className}`}> {/* dark:bg-slate-800 -> dark:bg-primary */}
      {/* Card Header (if title or actions are provided) */}
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          {title && (
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
              {titleIcon && <Icon iconName={titleIcon} className="w-6 h-6 mr-2 text-primary dark:text-secondary" />} {/* Adjusted icon color for dark mode */}
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

/**
 * Props for the NavbarLink component.
 */
interface NavbarLinkProps {
  /** The path to navigate to when the link is clicked. */
  to: string;
  /** The content of the link, typically text. */
  children: ReactNode;
  /** Optional icon name to display to the left of the link text. */
  iconName?: IconProps['iconName'];
  /** Optional click handler. */
  onClick?: () => void;
}
/**
 * A navigation link component, typically used in sidebars or navigation menus.
 * It uses `NavLink` from `react-router-dom` to provide active state styling.
 * @param {NavbarLinkProps} props The properties for the NavbarLink component.
 * @returns {React.ReactElement} The navigation link element.
 */
export const NavbarLink: React.FC<NavbarLinkProps> = ({ to, children, iconName, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      // Dynamically set classes based on whether the link is active
      className={({ isActive }) =>
        `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
        ${isActive
          ? 'bg-primary text-white' // Active state: black bg, white text. Looks good.
          : 'text-slate-600 dark:text-slate-300 hover:bg-neutral-700 dark:hover:text-white' // Inactive state styles, dark:hover:bg-slate-700 -> dark:hover:bg-neutral-700
        }`
      }
    >
      {iconName && <Icon iconName={iconName} className="w-5 h-5 mr-3" />}
      {children}
    </NavLink>
  );
};

/**
 * Props for the StatDisplayCard component.
 */
interface StatDisplayCardProps {
    /** Title of the statistic (e.g., "Total Unpaid"). */
    title: string;
    /** Value of the statistic (e.g., "$500.00" or 10). */
    value: string | number;
    /** Name of the icon to display in the card. */
    iconName: IconProps['iconName'];
    /** Optional Tailwind CSS class for the icon color (e.g., "text-green-500"). */
    iconColorClass?: string;
    /** Optional Tailwind CSS class for the icon's background circle (e.g., "bg-green-500 bg-opacity-20"). */
    iconBgClass?: string; 
    /** Optional CSS classes to apply to the card container. */
    className?: string;
}
/**
 * A specialized Card component for displaying a single statistic with a title, value, and icon.
 * @param {StatDisplayCardProps} props The properties for the StatDisplayCard.
 * @returns {React.ReactElement} The statistic display card element.
 */
export const StatDisplayCard: React.FC<StatDisplayCardProps> = ({ 
    title, 
    value, 
    iconName, 
    iconColorClass: customIconColorClass, 
    iconBgClass: customIconBgClass, 
    className = "" 
}) => {
    const defaultIconColorClass = 'text-primary dark:text-secondary';
    const defaultIconBgClass = 'bg-primary bg-opacity-20 dark:bg-secondary dark:bg-opacity-20';

    const finalIconColorClass = customIconColorClass || defaultIconColorClass;
    const finalIconBgClass = customIconBgClass || defaultIconBgClass;

    return (
        <Card className={`text-center ${className}`}>
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${finalIconBgClass} mb-4`}>
                <Icon iconName={iconName} className={`w-6 h-6 ${finalIconColorClass}`} />
            </div>
            <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </Card>
    );
};

/**
 * Props for the Badge component.
 */
interface BadgeProps {
  /** Text content of the badge. */
  text: string;
  /** Color theme of the badge. Defaults to 'gray'. */
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'amber';
  /** Size of the badge. Defaults to 'md'. */
  size?: 'sm' | 'md';
  /** Optional icon name to display inside the badge, to the left of the text. */
  iconName?: IconProps['iconName'];
}

/**
 * A Badge component for displaying status indicators, tags, or short pieces of information.
 * Supports different colors, sizes, and an optional icon.
 * @param {BadgeProps} props The properties for the Badge component.
 * @returns {React.ReactElement} The badge element.
 */
export const Badge: React.FC<BadgeProps> = ({ text, color = 'gray', size = 'md', iconName }) => {
  // Style mappings for different badge colors
  const colorStyles = {
    green: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
    red: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
    gray: 'bg-slate-100 text-slate-800 dark:bg-neutral-700 dark:text-neutral-100', // dark:bg-slate-700 -> dark:bg-neutral-700
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-100', // For gamification or special emphasis
  };
  // Style mappings for different badge sizes
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center ${sizeStyles[size]} font-medium rounded-full ${colorStyles[color]}`}>
      {iconName && <Icon iconName={iconName} className={`w-3 h-3 mr-1.5`} />}
      {text}
    </span>
  );
};

/**
 * Props for the ProgressBar component.
 */
interface ProgressBarProps {
  /** Current value of the progress bar (0 to 100). */
  value: number;
  /** Optional label to display above the progress bar. */
  label?: string;
  /** Optional Tailwind CSS class for the progress bar color (e.g., "bg-green-500"). Defaults to "bg-primary". */
  colorClass?: string;
}
/**
 * A ProgressBar component to visually represent progress towards a goal.
 * Displays a filled bar based on the `value` prop (percentage).
 * @param {ProgressBarProps} props The properties for the ProgressBar component.
 * @returns {React.ReactElement} The progress bar element.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, colorClass = 'bg-primary' }) => {
  // Ensure value is within the 0-100 range
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <div>
      {/* Optional label and percentage display */}
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{clampedValue.toFixed(0)}%</span>
        </div>
      )}
      {/* Progress bar track */}
      <div className="w-full bg-slate-200 dark:bg-neutral-700 rounded-full h-2.5"> {/* dark:bg-slate-700 -> dark:bg-neutral-700 */}
        {/* Progress bar fill */}
        <div
          className={`${colorClass} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
  );
};