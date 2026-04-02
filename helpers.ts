/**
 * @file helpers.ts
 * This file contains helper functions for formatting data and determining display logic.
 */
import DOMPurify from 'dompurify';
import { PaymentStatus, PhoneNumber, Student, Transaction, AppSettings } from './types';

/**
 * Sanitizes a string by stripping all HTML tags using DOMPurify.
 * @param {string | undefined} str The string to sanitize.
 * @returns {string} The sanitized string.
 */
export const sanitizeString = (str: string | undefined): string => {
  if (str === undefined) return '';
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] }); // Strip all HTML tags
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
  if (!phone.countryCode) {
    return phone.number;
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

/**
 * Generates a WhatsApp wa.me link with an optional pre-filled message.
 */
export const generateWhatsAppLink = (phone: PhoneNumber | undefined, message: string = ''): string => {
  if (!phone || !phone.number) {
    return '#';
  }
  // Remove all non-numeric characters from the country code and number
  const cleanCountryCode = phone.countryCode.replace(/\D/g, '');
  const cleanNumber = phone.number.replace(/\D/g, '');
  const waNumber = `${cleanCountryCode}${cleanNumber}`;
  
  if (!message) {
    return `https://wa.me/${waNumber}`;
  }
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
};

/**
 * Generates a Base64 encoded URL for the read-only student/parent portal.
 */
export const generatePortalLink = (student: Student, transactions: Transaction[], settings: AppSettings): string => {
  const payload = {
    tutorName: settings.userName,
    currencySymbol: settings.currencySymbol,
    student: {
      firstName: student.firstName,
      lastName: student.lastName,
      subjects: student.tuition.subjects,
    },
    transactions: transactions.map(t => ({
      id: t.id,
      date: t.date,
      lessonFee: t.lessonFee,
      amountPaid: t.amountPaid,
      status: t.status,
      grade: t.grade,
      progressRemark: t.progressRemark,
    }))
    // ⚡ Bolt Performance: Avoid Date.parse() overhead during O(N log N) sorting
    .map(t => ({ t, time: Date.parse(t.date) }))
    .sort((a,b) => b.time - a.time)
    .map(obj => obj.t)
  };
  
  const base64 = btoa(encodeURIComponent(JSON.stringify(payload)));
  const baseUrl = window.location.href.split('#')[0];
  return `${baseUrl}#/portal?data=${base64}`;
};
