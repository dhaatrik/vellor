/**
 * @file helpers.ts
 * This file contains helper functions for formatting data and determining display logic.
 */
import { PaymentStatus, PhoneNumber } from './types';

/**
 * Sanitizes a string by stripping all HTML tags using the DOMParser.
 * This is more robust than regex-based approaches and helps prevent XSS.
 * @param {string | undefined} str The string to sanitize.
 * @returns {string} The sanitized text-only content.
 */
export const sanitizeString = (str: string | undefined): string => {
  if (str === undefined || str === null) return '';

  // Use DOMParser if available (Browser environment)
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(str, 'text/html');
      return doc.body.textContent || '';
    } catch (e) {
      // Fallback to manual stripping if parsing fails
    }
  }

  // Fallback for non-browser environments or when DOMParser fails.
  // This approach is more robust than simple regex for nested tags.
  let result = '';
  let inTag = false;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '<') {
      inTag = true;
    } else if (str[i] === '>') {
      inTag = false;
    } else if (!inTag) {
      result += str[i];
    }
  }
  return result;
};

/**
 * Formats a numeric amount into a currency string with a given symbol.
 */
export const formatCurrency = (amount: number, currencySymbol: string): string => {
  return `${currencySymbol}${amount.toFixed(2)}`;
};

/**
 * Formats an ISO date string into a human-readable local date format.
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Formats a PhoneNumber object into a display string.
 */
export const formatPhoneNumber = (phone: PhoneNumber | undefined): string => {
  if (!phone || !phone.number) {
    return 'N/A';
  }
  return `${phone.countryCode} ${phone.number}`;
};


/**
 * Maps a `PaymentStatus` enum value to a corresponding color name for the `Badge` component.
 */
export const getPaymentStatusColor = (status: PaymentStatus): 'green' | 'yellow' | 'red' | 'amber' | 'gray' => {
    switch (status) {
      case PaymentStatus.Paid: return 'green';
      case PaymentStatus.PartiallyPaid: return 'yellow';
      case PaymentStatus.Due: return 'red';
      case PaymentStatus.Overpaid: return 'amber';
      default: return 'gray';
    }
};

/**
 * Formats an ISO date string into a relative time string (e.g., "5m ago").
 * @param {string} dateString The ISO date string to format.
 * @returns {string} The formatted relative time string.
 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};
