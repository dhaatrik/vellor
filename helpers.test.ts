import { describe, it, expect } from 'vitest';
import { sanitizeString, formatCurrency, formatDate, formatPhoneNumber, getPaymentStatusColor, formatRelativeTime, generatePortalLink, generateWhatsAppLink } from './helpers';
import { PaymentStatus, Student, Transaction, AppSettings, Theme } from './types';

describe('Helpers', () => {
    describe('sanitizeString', () => {
        it('handles undefined input', () => {
            expect(sanitizeString(undefined)).toBe('');
        });

        it('returns normal strings unmodified', () => {
            expect(sanitizeString('Hello World')).toBe('Hello World');
            expect(sanitizeString('12345')).toBe('12345');
        });

        it('removes HTML tags', () => {
            expect(sanitizeString('<p>Hello</p>')).toBe('Hello');
            expect(sanitizeString('<b>Bold</b> and <i>Italic</i>')).toBe('Bold and Italic');
            expect(sanitizeString('<script>alert("xss")</script>')).toBe('');
        });

        it('handles complex HTML and malicious scripts', () => {
            expect(sanitizeString('<img src="x" onerror="alert(1)">')).toBe('');
            expect(sanitizeString('<a href="javascript:alert(1)">Click</a>')).toBe('Click');
        });
    });

    it('formats currency correctly', () => {
        expect(formatCurrency(150, '$')).toBe('$150.00');
        expect(formatCurrency(0, '£')).toBe('£0.00');
        expect(formatCurrency(12.3, '€')).toBe('€12.30');
    });

    describe('formatDate', () => {
        it('formats ISO date strings correctly', () => {
            // Using a specific date where timezone differences might matter less, or setting tz
            // Let's use string containing 'en-US' expected format or test with regex
            const formatted = formatDate('2023-10-15T10:00:00Z');
            // Depending on timezone of runner, day could be 14 or 15.
            // Let's use toLocaleDateString manually to get the exact expected string in this env.
            const expected = new Date('2023-10-15T10:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            expect(formatted).toBe(expected);
        });

        it('formats date-only strings correctly', () => {
            const dateString = '2023-05-01';
            const formatted = formatDate(dateString);
            const expected = new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            expect(formatted).toBe(expected);
        });

        it('handles invalid date strings gracefully (returns "Invalid Date" based on JS Date implementation)', () => {
            expect(formatDate('not-a-date')).toBe('Invalid Date');
        });
    });

    it('formats phone numbers correctly', () => {
        expect(formatPhoneNumber(undefined)).toBe('N/A');
        expect(formatPhoneNumber({ countryCode: '+1', number: '1234567890' })).toBe('+1 1234567890');
        expect(formatPhoneNumber({ countryCode: '+44', number: '' })).toBe('N/A');
        expect(formatPhoneNumber({ countryCode: '', number: '1234567890' })).toBe('1234567890');
        expect(formatPhoneNumber({ countryCode: '', number: '' })).toBe('N/A');
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

    describe('generateWhatsAppLink', () => {
        it('returns # if phone or number is missing', () => {
            expect(generateWhatsAppLink(undefined)).toBe('#');
            expect(generateWhatsAppLink({ countryCode: '+1', number: '' })).toBe('#');
        });

        it('generates a basic wa.me link without message', () => {
            expect(generateWhatsAppLink({ countryCode: '+1', number: '1234567890' })).toBe('https://wa.me/11234567890');
        });

        it('generates a wa.me link with encoded message', () => {
            expect(generateWhatsAppLink({ countryCode: '+44', number: '7700900123' }, 'Hello World!')).toBe('https://wa.me/447700900123?text=Hello%20World!');
        });

        it('cleans non-numeric characters from phone and country code', () => {
            expect(generateWhatsAppLink({ countryCode: '+1', number: '(123) 456-7890' })).toBe('https://wa.me/11234567890');
            expect(generateWhatsAppLink({ countryCode: '+44 (0)', number: '7700 900 123' })).toBe('https://wa.me/4407700900123');
        });
    });
});

describe('generatePortalLink', () => {
    const mockStudent: Student = {
        id: 'student-1',
        firstName: 'John',
        lastName: 'Doe',
        contact: {
            email: 'john.doe@example.com'
        },
        tuition: {
            subjects: ['Math', 'Science'],
            defaultRate: 50,
            rateType: 'hourly',
            typicalLessonDuration: 60
        },
        createdAt: '2023-01-01T00:00:00Z'
    };

    const mockTransactions: Transaction[] = [
        {
            id: 'tx-1',
            studentId: 'student-1',
            date: '2023-10-01T10:00:00Z',
            lessonDuration: 60,
            lessonFee: 50,
            amountPaid: 50,
            status: PaymentStatus.Paid,
            createdAt: '2023-10-01T10:00:00Z'
        },
        {
            id: 'tx-2',
            studentId: 'student-1',
            date: '2023-10-15T10:00:00Z',
            lessonDuration: 60,
            lessonFee: 50,
            amountPaid: 0,
            status: PaymentStatus.Due,
            createdAt: '2023-10-15T10:00:00Z'
        }
    ];

    const mockSettings: AppSettings = {
        theme: Theme.Light,
        currencySymbol: '$',
        userName: 'Tutor Tom'
    };

    it('generates a valid portal link with encoded payload', () => {
        const link = generatePortalLink(mockStudent, mockTransactions, mockSettings);

        const baseUrl = window.location.href.split('#')[0];
        expect(link.startsWith(baseUrl)).toBe(true);
        expect(link).toContain('#/portal?data=');

        const base64Data = link.split('?data=')[1];
        const jsonPayload = decodeURIComponent(atob(base64Data));
        const payload = JSON.parse(jsonPayload);

        expect(payload).toMatchObject({
            tutorName: 'Tutor Tom',
            currencySymbol: '$',
            student: {
                firstName: 'John',
                lastName: 'Doe',
                subjects: ['Math', 'Science']
            }
        });

        // Transactions should be sorted by date descending (tx-2, then tx-1)
        expect(payload.transactions).toHaveLength(2);
        expect(payload.transactions[0].id).toBe('tx-2');
        expect(payload.transactions[1].id).toBe('tx-1');
    });

    it('sorts transactions by date descending', () => {
        // Unordered transactions
        const unorderedTransactions: Transaction[] = [
            { ...mockTransactions[0], id: 'old', date: '2023-01-01T00:00:00Z' },
            { ...mockTransactions[0], id: 'new', date: '2023-12-31T00:00:00Z' },
            { ...mockTransactions[0], id: 'middle', date: '2023-06-15T00:00:00Z' },
        ];

        const link = generatePortalLink(mockStudent, unorderedTransactions, mockSettings);
        const base64Data = link.split('?data=')[1];
        const payload = JSON.parse(decodeURIComponent(atob(base64Data)));

        expect(payload.transactions[0].id).toBe('new');
        expect(payload.transactions[1].id).toBe('middle');
        expect(payload.transactions[2].id).toBe('old');
    });

    it('handles empty transactions array', () => {
        const link = generatePortalLink(mockStudent, [], mockSettings);
        const base64Data = link.split('?data=')[1];
        const payload = JSON.parse(decodeURIComponent(atob(base64Data)));

        expect(payload.transactions).toHaveLength(0);
        expect(payload.transactions).toEqual([]);
    });
});
