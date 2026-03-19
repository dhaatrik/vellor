import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store';
import { PaymentStatus } from '../types';

// Mock confetti to prevent errors in Node environment
vi.mock('canvas-confetti', () => {
    return { default: vi.fn() };
});

describe('createTransactionSlice', () => {
  beforeEach(() => {
    useStore.setState({
      students: [],
      transactions: [],
      activityLog: [],
      achievements: useStore.getState().achievements.map(a => ({ ...a, achieved: false })),
      gamification: { points: 0, level: 1, levelName: 'Novice Tutor', streak: 0, lastActiveDate: null }
    });
    useStore.getState().clearActivityLog();
  });

  describe('updateTransaction', () => {
    it('updates a transaction and calculates correct status', () => {
      // Setup initial data
      useStore.getState().addStudent({
        firstName: 'Test', lastName: 'Student', contact: {}, tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 }
      });
      const studentId = useStore.getState().students[0].id;

      const transaction = useStore.getState().addTransaction({
        studentId,
        date: new Date().toISOString(),
        lessonDuration: 60,
        lessonFee: 100,
        amountPaid: 0,
        paymentMethod: 'Cash',
      });

      expect(transaction.status).toBe(PaymentStatus.Due);

      // Update to PartiallyPaid
      const updatedToPartial = useStore.getState().updateTransaction(transaction.id, {
        amountPaid: 50
      });

      expect(updatedToPartial).toBeDefined();
      expect(updatedToPartial?.status).toBe(PaymentStatus.PartiallyPaid);

      const stateAfterPartial = useStore.getState();
      expect(stateAfterPartial.transactions[0].status).toBe(PaymentStatus.PartiallyPaid);

      // Update to Paid
      const updatedToPaid = useStore.getState().updateTransaction(transaction.id, {
        amountPaid: 100
      });

      expect(updatedToPaid).toBeDefined();
      expect(updatedToPaid?.status).toBe(PaymentStatus.Paid);

      const stateAfterPaid = useStore.getState();
      expect(stateAfterPaid.transactions[0].status).toBe(PaymentStatus.Paid);

      // Update to Overpaid
      const updatedToOverpaid = useStore.getState().updateTransaction(transaction.id, {
        amountPaid: 150
      });

      expect(updatedToOverpaid).toBeDefined();
      expect(updatedToOverpaid?.status).toBe(PaymentStatus.Overpaid);

      const stateAfterOverpaid = useStore.getState();
      expect(stateAfterOverpaid.transactions[0].status).toBe(PaymentStatus.Overpaid);

      // Update to Due
      const updatedToDue = useStore.getState().updateTransaction(transaction.id, {
        amountPaid: 0
      });

      expect(updatedToDue).toBeDefined();
      expect(updatedToDue?.status).toBe(PaymentStatus.Due);

      const stateAfterDue = useStore.getState();
      expect(stateAfterDue.transactions[0].status).toBe(PaymentStatus.Due);
    });

    it('updates transaction payment method and notes and sanitizes them', () => {
      // Setup initial data
      useStore.getState().addStudent({
        firstName: 'Test', lastName: 'Student', contact: {}, tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 }
      });
      const studentId = useStore.getState().students[0].id;

      const transaction = useStore.getState().addTransaction({
        studentId,
        date: new Date().toISOString(),
        lessonDuration: 60,
        lessonFee: 100,
        amountPaid: 100,
        paymentMethod: 'Cash',
        notes: 'Initial note'
      });

      // Update payment method and notes
      const updatedTransaction = useStore.getState().updateTransaction(transaction.id, {
        paymentMethod: '<script>alert("xss")</script>Card',
        notes: 'Updated note <script>alert("xss")</script>' // testing sanitization
      });

      expect(updatedTransaction).toBeDefined();
      expect(updatedTransaction?.paymentMethod).toBe('alert("xss")Card'); // Expect sanitized string
      expect(updatedTransaction?.notes).toBe('Updated note alert("xss")'); // Expect sanitized string
    });

    it('returns undefined and ignores invalid transaction id', () => {
      // Setup initial data
      useStore.getState().addStudent({
        firstName: 'Test', lastName: 'Student', contact: {}, tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 }
      });
      const studentId = useStore.getState().students[0].id;

      useStore.getState().addTransaction({
        studentId,
        date: new Date().toISOString(),
        lessonDuration: 60,
        lessonFee: 100,
        amountPaid: 100,
        paymentMethod: 'Cash',
        notes: 'Initial note'
      });

      // Update payment method and notes
      const updatedTransaction = useStore.getState().updateTransaction('invalid-id', {
        amountPaid: 50
      });

      expect(updatedTransaction).toBeUndefined();
    });
  });
});
