import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store';
import { PaymentStatus } from './types';

describe('Zustand Store - Students and Transactions', () => {
    beforeEach(() => {
        useStore.setState({ 
            students: [], 
            transactions: [], 
            activityLog: [],
            gamification: { points: 0, level: 1, levelName: 'Novice', streak: 0, lastActiveDate: null }
        });
    });

    // Mock the HTMLCanvasElement.getContext to prevent errors from canvas-confetti
    beforeEach(() => {
        HTMLCanvasElement.prototype.getContext = () => null;
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

    it('deletes a student and their associated transactions', () => {
        // Setup: add a student
        useStore.getState().addStudent({
            firstName: 'To Be',
            lastName: 'Deleted',
            contact: {},
            tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
        });
        const studentId = useStore.getState().students[0].id;

        // Setup: add a transaction for this student
        useStore.getState().addTransaction({
            studentId,
            date: new Date().toISOString(),
            lessonDuration: 60,
            lessonFee: 50,
            amountPaid: 0,
            paymentMethod: 'Cash',
        });

        // Setup: add another student and transaction to verify we don't delete them
        useStore.getState().addStudent({
            firstName: 'To',
            lastName: 'Keep',
            contact: {},
            tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
        });
        const keepStudentId = useStore.getState().students[1].id;

        useStore.getState().addTransaction({
            studentId: keepStudentId,
            date: new Date().toISOString(),
            lessonDuration: 60,
            lessonFee: 50,
            amountPaid: 0,
            paymentMethod: 'Cash',
        });

        expect(useStore.getState().students).toHaveLength(2);
        expect(useStore.getState().transactions).toHaveLength(2);

        // Action: delete the first student
        useStore.getState().deleteStudent(studentId);

        // Assert: first student and transaction are gone, second student and transaction remain
        const state = useStore.getState();
        expect(state.students).toHaveLength(1);
        expect(state.students[0].id).toBe(keepStudentId);

        expect(state.transactions).toHaveLength(1);
        expect(state.transactions[0].studentId).toBe(keepStudentId);
    });
});
