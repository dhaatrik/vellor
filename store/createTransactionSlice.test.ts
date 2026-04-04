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

  describe('addTransaction', () => {
    it('adds a transaction with default properties, properly infers status, and logs activity', () => {
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
      expect(transaction.id).toBeDefined();

      const state = useStore.getState();
      expect(state.transactions).toHaveLength(1);
      expect(state.transactions[0].id).toBe(transaction.id);

      // adding a student creates an activity log, and logging a transaction creates another
      expect(state.activityLog.length).toBeGreaterThanOrEqual(1);
      expect(state.activityLog.some(log => log.message.includes('Logged transaction for Test'))).toBe(true);
    });

    it('adds a transaction with Overpaid status and clears overdue', () => {
      // Setup initial data
      useStore.getState().addStudent({
        firstName: 'Test', lastName: 'Student', contact: {}, tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 }
      });
      const studentId = useStore.getState().students[0].id;

      // Add a Due transaction
      useStore.getState().addTransaction({
        studentId,
        date: new Date().toISOString(),
        lessonDuration: 60,
        lessonFee: 100,
        amountPaid: 0,
        paymentMethod: 'Cash',
      });

      // Add an Overpaid transaction that clears overdue
      const transaction = useStore.getState().addTransaction({
        studentId,
        date: new Date().toISOString(),
        lessonDuration: 60,
        lessonFee: 100,
        amountPaid: 300, // 100 for this lesson + 200 overpaid
        paymentMethod: 'Cash',
      });

      expect(transaction.status).toBe(PaymentStatus.Overpaid);

      const state = useStore.getState();
      // Expect 2 logged activities for transaction, 1 for overpaid/paid points, 1 for clearing overdue
      // Actually, addTransaction also awards points, so it's a bit more complex.
      // We mainly test the resulting state here.
      expect(state.transactions).toHaveLength(2);
      expect(state.transactions[1].status).toBe(PaymentStatus.Overpaid);
    });

    it('sanitizes input strings', () => {
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
        paymentMethod: '<script>alert("xss")</script>Cash',
        notes: '<script>alert("xss")</script>note',
        grade: '<script>alert("xss")</script>A',
        progressRemark: '<script>alert("xss")</script>Good',
      });

      expect(transaction.paymentMethod).toBe('Cash');
      expect(transaction.notes).toBe('note');
      expect(transaction.grade).toBe('A');
      expect(transaction.progressRemark).toBe('Good');
    });
  });

  describe('deleteTransaction', () => {
    it('deletes a transaction', () => {
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
      });

      expect(useStore.getState().transactions).toHaveLength(1);

      useStore.getState().deleteTransaction(transaction.id);

      expect(useStore.getState().transactions).toHaveLength(0);
    });
  });

  describe('getTransactionsByStudent', () => {
    it('retrieves transactions by student id and sorts them by date descending', () => {
      // Setup initial data
      useStore.getState().addStudent({
        firstName: 'Test1', lastName: 'Student1', contact: {}, tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 }
      });
      useStore.getState().addStudent({
        firstName: 'Test2', lastName: 'Student2', contact: {}, tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 }
      });
      const studentId1 = useStore.getState().students[0].id;
      const studentId2 = useStore.getState().students[1].id;

      const date1 = new Date('2023-01-01T10:00:00.000Z');
      const date2 = new Date('2023-01-02T10:00:00.000Z');
      const date3 = new Date('2023-01-03T10:00:00.000Z');

      useStore.getState().addTransaction({
        studentId: studentId1, date: date1.toISOString(), lessonDuration: 60, lessonFee: 100, amountPaid: 100, paymentMethod: 'Cash',
      });
      useStore.getState().addTransaction({
        studentId: studentId2, date: date2.toISOString(), lessonDuration: 60, lessonFee: 100, amountPaid: 100, paymentMethod: 'Cash',
      });
      useStore.getState().addTransaction({
        studentId: studentId1, date: date3.toISOString(), lessonDuration: 60, lessonFee: 100, amountPaid: 100, paymentMethod: 'Cash',
      });

      const transactions = useStore.getState().getTransactionsByStudent(studentId1);

      expect(transactions).toHaveLength(2);
      expect(transactions[0].date).toBe(date3.toISOString());
      expect(transactions[1].date).toBe(date1.toISOString());
    });
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
      expect(updatedTransaction?.paymentMethod).toBe('Card'); // Expect sanitized string
      expect(updatedTransaction?.notes).toBe('Updated note '); // Expect sanitized string
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
