import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from './store';

// Mock confetti to prevent errors in Node environment
vi.mock('canvas-confetti', () => {
   return { default: vi.fn() };
});
import { PaymentStatus } from './types';

vi.mock('canvas-confetti', () => {
   return { default: vi.fn() };
});

describe('Zustand Store - Students and Transactions', () => {
    beforeEach(() => {
        useStore.setState({ 
            students: [], 
            transactions: [], 
            activityLog: [],
            gamification: { points: 0, level: 1, levelName: 'Novice', streak: 0, lastActiveDate: null }
        });
    });

    it('adds a student correctly', () => {
        const student = useStore.getState().addStudent({
            firstName: 'John',
            lastName: 'Doe',
            country: 'United States',
            parent: { name: 'Jane Parent', relationship: 'Mother' },
            contact: { email: 'john@example.com' },
            tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
            notes: ''
        });

        const state = useStore.getState();
        expect(state.students).toHaveLength(1);
        expect(state.students[0].firstName).toBe('John');
        expect(student).toBeDefined();
        if (student) {
            expect(student.lastName).toBe('Doe');
        }
    });

    it('calculates correct status for fully paid transactions', () => {
        useStore.getState().addStudent({
            firstName: 'A', lastName: 'B', contact: {}, tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 }
        });
        const studentId = useStore.getState().students[0].id;

        const transaction = useStore.getState().addTransaction({
            studentId,
            date: new Date().toISOString(),
            lessonDuration: 60,
            lessonFee: 50,
            amountPaid: 50,
            paymentMethod: 'Cash',
        });

        expect(useStore.getState().transactions).toHaveLength(1);
        expect(transaction.status).toBe(PaymentStatus.Paid);
    });
});

import { setGlobalMasterKey, globalMasterKey } from './store';

describe('setGlobalMasterKey', () => {
  it('updates globalMasterKey correctly when a valid CryptoKey is provided', async () => {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    setGlobalMasterKey(key);
    expect(globalMasterKey).toBe(key);
  });

  it('updates globalMasterKey correctly when null is provided', () => {
    setGlobalMasterKey(null);
    expect(globalMasterKey).toBeNull();
  });
});
