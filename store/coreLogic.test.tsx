import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStore, useDerivedData } from '../store';
import { PaymentStatus, AchievementId } from '../types';

vi.mock('canvas-confetti', () => {
    return { default: vi.fn() };
});

beforeEach(() => {
  // Reset store
  useStore.setState({
    students: [],
    transactions: [],
    achievements: useStore.getState().achievements.map(a => ({ ...a, achieved: false })),
    gamification: { points: 0, level: 1, levelName: 'Novice Tutor', streak: 0, lastActiveDate: null }
  });
  useStore.getState().clearActivityLog();
});

describe('useDerivedData Hook', () => {
  it('calculates total unpaid correctly', () => {
    useStore.setState({
      transactions: [
        { id: '1', studentId: 's1', date: '2023-10-01', lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' },
        { id: '2', studentId: 's1', date: '2023-10-02', lessonDuration: 60, lessonFee: 40, amountPaid: 20, status: PaymentStatus.PartiallyPaid, paymentMethod: '', createdAt: '' },
        { id: '3', studentId: 's2', date: '2023-10-03', lessonDuration: 60, lessonFee: 100, amountPaid: 100, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' }
      ]
    });
    
    const { result } = renderHook(() => useDerivedData());
    expect(result.current.totalUnpaid).toBe(70); // 50 (Due) + 20 (Remaining of PartiallyPaid)
  });

  it('calculates total paid this month correctly', () => {
    const today = new Date();
    const lastMonth = new Date(today);
    // Use setDate to safely subtract a month without overflowing to the same month (e.g. Mar 31 -> Feb 28 -> Mar 3)
    lastMonth.setDate(0);

    useStore.setState({
      transactions: [
        // Paid this month
        { id: '1', studentId: 's1', date: today.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' },
        // Partially paid this month
        { id: '2', studentId: 's1', date: today.toISOString(), lessonDuration: 60, lessonFee: 40, amountPaid: 20, status: PaymentStatus.PartiallyPaid, paymentMethod: '', createdAt: '' },
        // Paid last month (should NOT be included)
        { id: '3', studentId: 's2', date: lastMonth.toISOString(), lessonDuration: 60, lessonFee: 100, amountPaid: 100, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' },
        // Due this month (should NOT be included)
        { id: '4', studentId: 's1', date: today.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' },
      ]
    });
    
    const { result } = renderHook(() => useDerivedData());
    expect(result.current.totalPaidThisMonth).toBe(70); // 50 + 20
  });

  it('identifies overdue payments correctly (due date strictly before today)', () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    useStore.setState({
      transactions: [
        // Overdue
        { id: 'ol1', studentId: 's1', date: yesterday.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' },
        { id: 'ol2', studentId: 's1', date: yesterday.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 20, status: PaymentStatus.PartiallyPaid, paymentMethod: '', createdAt: '' },
        // Not Overdue (Paid)
        { id: 'no1', studentId: 's1', date: yesterday.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' },
        // Not Overdue (Due today or tomorrow)
        { id: 'no2', studentId: 's1', date: today.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' },
        { id: 'no3', studentId: 's1', date: tomorrow.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' },
      ]
    });
    
    const { result } = renderHook(() => useDerivedData());
    expect(result.current.overduePayments).toHaveLength(2);
    expect(result.current.overduePayments.map(t => t.id)).toContain('ol1');
    expect(result.current.overduePayments.map(t => t.id)).toContain('ol2');
  });
});

// Mock confetti to prevent errors in Node environment
vi.mock('canvas-confetti', () => {
   return { default: vi.fn() };
});

describe('Gamification Logic (checkAndAwardAchievements)', () => {
    it('awards First Student Added achievement', () => {
        useStore.setState({
            students: [{ id: '1', firstName: 'John', lastName: 'Doe', country: 'US', createdAt: '' } as any]
        });
        
        // Initial state should be false
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.FirstStudentAdded)?.achieved).toBe(false);

        // Run logic
        useStore.getState().checkAndAwardAchievements();

        // Should now be true
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.FirstStudentAdded)?.achieved).toBe(true);
    });

    it('awards Century Club achievement when exactly 100 transactions exist', () => {
        const hundredTxs = Array.from({ length: 100 }, (_, i) => ({
             id: String(i), studentId: 's1', date: new Date().toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' 
        }));
        
        useStore.setState({ transactions: hundredTxs });
        
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.CenturyClub)?.achieved).toBe(false);
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.CenturyClub)?.achieved).toBe(true);
    });

    it('handles multiple achievements awarded at once', () => {
        // Condition: 10 students, 10 payments, first $100 earned
        const students = Array.from({ length: 10 }, (_, i) => ({ id: String(i), firstName: 'John', lastName: 'Doe', country: 'US', createdAt: '' } as any));
        const txs = Array.from({ length: 10 }, (_, i) => ({
             id: String(i), studentId: String(i), date: new Date().toISOString(), lessonDuration: 60, lessonFee: 10, amountPaid: 10, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' 
        }));

        useStore.setState({ students, transactions: txs });
        useStore.getState().checkAndAwardAchievements();

        const state = useStore.getState();
        expect(state.achievements.find(a => a.id === AchievementId.FirstStudentAdded)?.achieved).toBe(true);
        expect(state.achievements.find(a => a.id === AchievementId.StudentRosterStarter)?.achieved).toBe(true);
        expect(state.achievements.find(a => a.id === AchievementId.TenStudentsEnrolled)?.achieved).toBe(true);
        expect(state.achievements.find(a => a.id === AchievementId.FirstPaymentLogged)?.achieved).toBe(true);
        expect(state.achievements.find(a => a.id === AchievementId.TenPaymentsLogged)?.achieved).toBe(true);
        expect(state.achievements.find(a => a.id === AchievementId.First100Earned)?.achieved).toBe(true);
    });
});
