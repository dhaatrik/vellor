import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPhoneNumber, getPaymentStatusColor, formatRelativeTime, generateWhatsAppLink } from './helpers';
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

    it('generates WhatsApp link correctly', () => {
        expect(generateWhatsAppLink(undefined)).toBe('#');
        expect(generateWhatsAppLink({ countryCode: '+1', number: '' })).toBe('#');
        expect(generateWhatsAppLink({ countryCode: '+1', number: '1234567890' })).toBe('https://wa.me/11234567890');
        expect(generateWhatsAppLink({ countryCode: '+44', number: '07123456789' }, 'Hello world')).toBe('https://wa.me/4407123456789?text=Hello%20world');
        expect(generateWhatsAppLink({ countryCode: '+1-800', number: '(123) 456-7890' })).toBe('https://wa.me/18001234567890');
    });
});
