import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPhoneNumber, getPaymentStatusColor, formatRelativeTime, sanitizeString } from './helpers';
import { PaymentStatus } from './types';

describe('Helpers', () => {
    it('formats currency correctly', () => {
        expect(formatCurrency(150, '$')).toBe('$150.00');
        expect(formatCurrency(0, '£')).toBe('£0.00');
        expect(formatCurrency(12.3, '€')).toBe('€12.30');
    });

    it('formats phone numbers correctly', () => {
        expect(formatPhoneNumber(undefined)).toBe('N/A');
        expect(formatPhoneNumber({ countryCode: '+1', number: '1234567890' })).toBe('+1 1234567890');
        expect(formatPhoneNumber({ countryCode: '+44', number: '' })).toBe('N/A');
    });

    it('gets correct payment status colors', () => {
        expect(getPaymentStatusColor(PaymentStatus.Paid)).toBe('green');
        expect(getPaymentStatusColor(PaymentStatus.Due)).toBe('red');
        expect(getPaymentStatusColor(PaymentStatus.PartiallyPaid)).toBe('yellow');
        expect(getPaymentStatusColor(PaymentStatus.Overpaid)).toBe('amber');
    });

    it('formats relative time correctly for recent dates', () => {
        const now = new Date();
        const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
        expect(formatRelativeTime(thirtySecondsAgo.toISOString())).toBe('30s ago');
    });
});

describe('sanitizeString', () => {
    it('returns an empty string when input is undefined', () => {
        expect(sanitizeString(undefined)).toBe('');
    });

    it('returns the original string when there are no HTML tags', () => {
        expect(sanitizeString('Hello, World!')).toBe('Hello, World!');
        expect(sanitizeString('12345')).toBe('12345');
        expect(sanitizeString('!@#$%^&*()')).toBe('!@#$%^&*()');
    });

    it('strips basic HTML tags correctly', () => {
        expect(sanitizeString('<b>Bold</b>')).toBe('Bold');
        expect(sanitizeString('<i>Italic</i>')).toBe('Italic');
        expect(sanitizeString('<span>Span content</span>')).toBe('Span content');
        expect(sanitizeString('<a href="https://example.com">Link</a>')).toBe('Link');
    });

    it('strips complex/malicious HTML tags correctly', () => {
        expect(sanitizeString('<script>alert("XSS")</script>')).toBe('');
        expect(sanitizeString('<img src="x" onerror="alert(1)">')).toBe('');
        expect(sanitizeString('<iframe src="javascript:alert(1)"></iframe>')).toBe('');
        expect(sanitizeString('<div onmouseover="alert(1)">Hover me</div>')).toBe('Hover me');
    });

    it('handles strings with multiple HTML tags correctly', () => {
        expect(sanitizeString('<h1>Title</h1><p>Paragraph with <b>bold</b> text.</p>')).toBe('TitleParagraph with bold text.');
        expect(sanitizeString('<ul><li>Item 1</li><li>Item 2</li></ul>')).toBe('Item 1Item 2');
    });
});
