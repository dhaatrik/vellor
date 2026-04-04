import { describe, it, expect } from 'vitest';
import {
  backupSchema,
  phoneNumberSchema,
  parentSchema,
  contactInfoSchema,
  tuitionDetailsSchema,
  studentSchema,
  transactionSchema,
  appSettingsSchema,
  gamificationStatsSchema,
  achievementSchema,
  activitySchema
} from './validation';
import { Theme, PaymentStatus, AchievementId } from '../types';

describe('Zod Validation - Data Management Import', () => {
    const validData = {
        students: [
            {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                country: 'United States',
                contact: { email: 'john@example.com' },
                tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
                createdAt: new Date().toISOString()
            }
        ],
        transactions: [
            {
                id: 't1',
                studentId: '1',
                date: new Date().toISOString(),
                lessonDuration: 60,
                lessonFee: 50,
                amountPaid: 50,
                status: PaymentStatus.Paid,
                createdAt: new Date().toISOString()
            }
        ],
        settings: {
            theme: Theme.Dark,
            currencySymbol: '$',
            userName: 'Tutor',
            monthlyGoal: 1000
        },
        gamification: {
            points: 100,
            level: 1,
            levelName: 'Novice',
            streak: 2,
            lastActiveDate: null
        },
        achievements: [
            {
                id: AchievementId.FirstStudentAdded,
                name: 'First Student Added',
                description: 'You added your first student',
                achieved: true,
                icon: 'user'
            }
        ]
    };

    it('should successfully parse valid data structure', () => {
        expect(() => backupSchema.parse(validData)).not.toThrow();
        const parsed = backupSchema.parse(validData);
        expect(parsed.students[0].firstName).toBe('John');
    });

    it('should throw an error for missing required fields in students', () => {
        const invalidData = {
            ...validData,
            students: [
                {
                    id: '1',
                    // firstName is missing
                    lastName: 'Doe',
                    contact: {},
                    tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
                    createdAt: new Date().toISOString()
                }
            ]
        };

        expect(() => backupSchema.parse(invalidData)).toThrowError(/firstName/);
    });

    it('should throw an error for malformed nested fields (tuition rateType)', () => {
        const invalidData = {
            ...validData,
            students: [
                {
                    id: '1',
                    firstName: 'John',
                    lastName: 'Doe',
                    contact: {},
                    tuition: {
                        subjects: ['Math'],
                        defaultRate: 50,
                        rateType: 'yearly', // Invalid enum value
                        typicalLessonDuration: 60
                    },
                    createdAt: new Date().toISOString()
                }
            ]
        };

        expect(() => backupSchema.parse(invalidData)).toThrowError(/Invalid option: expected one of/);
    });

    it('should throw an error for totally malformed payloads', () => {
        const malformedData = {
            maliciousField: true,
            alert: 'bwahaha'
        };

        // This should throw because it misses students, transactions, and settings completely
        expect(() => backupSchema.parse(malformedData)).toThrowError();
    });

    it('should throw an error if an array field is replaced by an object', () => {
        const invalidData = {
            ...validData,
            students: { malicious: 'data' }
        };

        expect(() => backupSchema.parse(invalidData)).toThrowError();
    });
});

describe('Zod Validation - Individual Schemas', () => {
    it('should validate phoneNumberSchema', () => {
        const valid = { countryCode: '+1', number: '1234567890' };
        expect(() => phoneNumberSchema.parse(valid)).not.toThrow();

        expect(() => phoneNumberSchema.parse({ countryCode: '+1' })).toThrow();
        expect(() => phoneNumberSchema.parse({ number: '1234567890' })).toThrow();
        expect(() => phoneNumberSchema.parse({ countryCode: 1, number: '1234567890' })).toThrow();
    });

    it('should handle phoneNumberSchema edge cases', () => {
        // Empty strings (valid per z.string())
        expect(phoneNumberSchema.safeParse({ countryCode: '', number: '' }).success).toBe(true);

        // Null and undefined values
        expect(phoneNumberSchema.safeParse({ countryCode: null, number: '123' }).success).toBe(false);

        // Completely empty object
        expect(phoneNumberSchema.safeParse({}).success).toBe(false);

        // Numeric values
        expect(phoneNumberSchema.safeParse({ countryCode: 1, number: 1234567890 }).success).toBe(false);
        expect(phoneNumberSchema.safeParse({ countryCode: '+1', number: 1234567890 }).success).toBe(false);

        // Arrays and objects
        expect(phoneNumberSchema.safeParse({ countryCode: '+1', number: [] }).success).toBe(false);
        expect(phoneNumberSchema.safeParse({ countryCode: '+1', number: {} }).success).toBe(false);

        // Missing fields
        expect(phoneNumberSchema.safeParse({ countryCode: '+1' }).success).toBe(false);

        // Missing payload
        expect(phoneNumberSchema.safeParse(null).success).toBe(false);
        expect(phoneNumberSchema.safeParse(undefined).success).toBe(false);
    });

    it('should validate parentSchema', () => {
        const valid = { name: 'Jane Doe', relationship: 'Mother' };
        expect(() => parentSchema.parse(valid)).not.toThrow();

        expect(() => parentSchema.parse({ name: 'Jane Doe' })).toThrow();
        expect(() => parentSchema.parse({ relationship: 'Mother' })).toThrow();
    });

    it('should validate contactInfoSchema', () => {
        const validFull = {
            studentPhone: { countryCode: '+1', number: '123' },
            parentPhone1: { countryCode: '+2', number: '456' },
            parentPhone2: { countryCode: '+3', number: '789' },
            email: 'test@example.com'
        };
        const validEmpty = {};

        expect(() => contactInfoSchema.parse(validFull)).not.toThrow();
        expect(() => contactInfoSchema.parse(validEmpty)).not.toThrow();

        expect(() => contactInfoSchema.parse({ studentPhone: { number: '123' } })).toThrow();
    });

    it('should validate tuitionDetailsSchema', () => {
        const valid = {
            subjects: ['Math', 'Science'],
            defaultRate: 50,
            rateType: 'hourly',
            typicalLessonDuration: 60,
            preferredPaymentMethod: 'Cash'
        };
        expect(() => tuitionDetailsSchema.parse(valid)).not.toThrow();

        const validMinimal = {
            subjects: [],
            defaultRate: 0,
            rateType: 'monthly',
            typicalLessonDuration: 0
        };
        expect(() => tuitionDetailsSchema.parse(validMinimal)).not.toThrow();

        expect(() => tuitionDetailsSchema.parse({ ...valid, rateType: 'yearly' })).toThrow();
        expect(() => tuitionDetailsSchema.parse({ ...valid, defaultRate: '50' })).toThrow();
    });

    it('should validate studentSchema', () => {
        const valid = {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            country: 'US',
            parent: { name: 'Jane', relationship: 'Mother' },
            contact: { email: 'john@example.com' },
            tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
            notes: 'Good student',
            createdAt: new Date().toISOString()
        };
        expect(() => studentSchema.parse(valid)).not.toThrow();

        // Missing required field 'firstName'
        const invalid = { ...valid };
        delete (invalid as any).firstName;
        expect(() => studentSchema.parse(invalid)).toThrow();

        // Empty string for 'firstName'
        const emptyFirstName = { ...valid, firstName: '' };
        expect(() => studentSchema.parse(emptyFirstName)).toThrowError(/First name is required/);
    });

    it('should validate transactionSchema', () => {
        const valid = {
            id: 't1',
            studentId: 's1',
            date: new Date().toISOString(),
            lessonDuration: 60,
            lessonFee: 50,
            amountPaid: 50,
            paymentMethod: 'Card',
            status: PaymentStatus.Paid,
            notes: 'Paid on time',
            createdAt: new Date().toISOString()
        };
        expect(() => transactionSchema.parse(valid)).not.toThrow();

        // Invalid status enum
        expect(() => transactionSchema.parse({ ...valid, status: 'UNKNOWN' })).toThrow();
    });

    it('should validate appSettingsSchema', () => {
        const valid = {
            theme: Theme.Light,
            currencySymbol: '$',
            userName: 'Tutor',
            country: 'US',
            phone: { countryCode: '+1', number: '1234567890' },
            email: 'tutor@example.com',
            monthlyGoal: 1000
        };
        expect(() => appSettingsSchema.parse(valid)).not.toThrow();

        // Missing currencySymbol
        const invalid = { ...valid };
        delete (invalid as any).currencySymbol;
        expect(() => appSettingsSchema.parse(invalid)).toThrow();
    });

    it('should validate gamificationStatsSchema', () => {
        const valid = {
            points: 100,
            level: 1,
            levelName: 'Novice',
            streak: 2,
            lastActiveDate: new Date().toISOString()
        };
        expect(() => gamificationStatsSchema.parse(valid)).not.toThrow();

        // Nullable lastActiveDate
        expect(() => gamificationStatsSchema.parse({ ...valid, lastActiveDate: null })).not.toThrow();

        // Missing streak
        const invalid = { ...valid };
        delete (invalid as any).streak;
        expect(() => gamificationStatsSchema.parse(invalid)).toThrow();
    });

    it('should validate achievementSchema', () => {
        const valid = {
            id: AchievementId.FirstStudentAdded,
            name: 'First Student Added',
            description: 'You added your first student',
            achieved: true,
            dateAchieved: new Date().toISOString(),
            icon: 'user'
        };
        expect(() => achievementSchema.parse(valid)).not.toThrow();

        // Invalid id
        expect(() => achievementSchema.parse({ ...valid, id: 'INVALID_ID' })).toThrow();
    });

    it('should validate activitySchema', () => {
        const valid = {
            id: 'a1',
            message: 'User logged in',
            icon: 'user', // IconName
            timestamp: new Date().toISOString()
        };
        expect(() => activitySchema.parse(valid)).not.toThrow();

        // Missing timestamp
        const invalid = { ...valid };
        delete (invalid as any).timestamp;
        expect(() => activitySchema.parse(invalid)).toThrow();
    });
});
