import { StateCreator } from 'zustand';
import { AppState, TransactionSlice } from './types';
import { Transaction, TransactionFormData, PaymentStatus } from '../types';
import { POINTS_ALLOCATION } from '../constants';
import { sanitizeString } from '../helpers';

export const createTransactionSlice: StateCreator<AppState, [], [], TransactionSlice> = (set, get) => ({
  transactions: [],

  addTransaction: (transactionData) => {
    const sanitizedTransactionData: TransactionFormData = {
      ...transactionData,
      paymentMethod: sanitizeString(transactionData.paymentMethod),
      notes: sanitizeString(transactionData.notes),
    };

    let status: PaymentStatus;
    if (sanitizedTransactionData.status) {
      status = sanitizedTransactionData.status;
    } else if (sanitizedTransactionData.amountPaid >= sanitizedTransactionData.lessonFee) {
      status = sanitizedTransactionData.amountPaid > sanitizedTransactionData.lessonFee ? PaymentStatus.Overpaid : PaymentStatus.Paid;
    } else if (sanitizedTransactionData.amountPaid > 0 && sanitizedTransactionData.amountPaid < sanitizedTransactionData.lessonFee) {
      status = PaymentStatus.PartiallyPaid;
    } else {
      status = PaymentStatus.Due;
    }

    const newTransaction: Transaction = {
      ...sanitizedTransactionData,
      id: crypto.randomUUID(),
      status,
      createdAt: new Date().toISOString(),
    };

    set(state => ({ transactions: [...state.transactions, newTransaction] }));
    
    get().addToast('Transaction logged successfully.', 'success');
    const studentName = get().getStudentById(newTransaction.studentId)?.firstName || 'a student';
    get().logActivity(`Logged transaction for ${studentName}`, 'banknotes');

    if (status === PaymentStatus.Paid || status === PaymentStatus.Overpaid) {
        get().addPoints(POINTS_ALLOCATION.LOG_PAYMENT_ON_TIME, `Logged payment for ${studentName}`);
    }

    const student = get().getStudentById(newTransaction.studentId);
    if(student && (status === PaymentStatus.Paid || status === PaymentStatus.Overpaid)){
        const studentTransactions = get().transactions.filter(t => t.studentId === newTransaction.studentId && t.id !== newTransaction.id);
        const wasOverdue = studentTransactions.some(t => t.status === PaymentStatus.Due || t.status === PaymentStatus.PartiallyPaid);
        if(wasOverdue){
            const totalDueForStudent = studentTransactions.reduce((acc, t) => {
                 if (t.status === PaymentStatus.Due) return acc + t.lessonFee;
                 if (t.status === PaymentStatus.PartiallyPaid) return acc + (t.lessonFee - t.amountPaid);
                 return acc;
            }, 0);
            if (totalDueForStudent - newTransaction.amountPaid <= 0) {
                get().addPoints(POINTS_ALLOCATION.CLEAR_OVERDUE, `Cleared overdue payment for ${student.firstName}`);
            }
        }
    }
    
    get().checkAndAwardAchievements();
    return newTransaction;
  },

  updateTransaction: (transactionId, transactionData) => {
     let updatedTransaction: Transaction | undefined;

     const sanitizedTransactionData: Partial<TransactionFormData> = { ...transactionData };
     if (transactionData.paymentMethod !== undefined) {
        sanitizedTransactionData.paymentMethod = sanitizeString(transactionData.paymentMethod);
     }
     if (transactionData.notes !== undefined) {
        sanitizedTransactionData.notes = sanitizeString(transactionData.notes);
     }

     set(state => {
       const newTransactions = state.transactions.map(t => {
        if (t.id === transactionId) {
            const originalStatus = t.status;
            const potentiallyUpdated = { ...t, ...sanitizedTransactionData };
            let newStatus = t.status;

            if (sanitizedTransactionData.amountPaid !== undefined || sanitizedTransactionData.lessonFee !== undefined) {
                const fee = sanitizedTransactionData.lessonFee !== undefined ? sanitizedTransactionData.lessonFee : t.lessonFee;
                const paid = sanitizedTransactionData.amountPaid !== undefined ? sanitizedTransactionData.amountPaid : t.amountPaid;
                if (paid >= fee) {
                    newStatus = paid > fee ? PaymentStatus.Overpaid : PaymentStatus.Paid;
                } else if (paid > 0 && paid < fee) {
                    newStatus = PaymentStatus.PartiallyPaid;
                } else {
                    newStatus = PaymentStatus.Due;
                }
            }
            updatedTransaction = { ...potentiallyUpdated, status: newStatus };
            
            if (originalStatus !== PaymentStatus.Paid && originalStatus !== PaymentStatus.Overpaid && (newStatus === PaymentStatus.Paid || newStatus === PaymentStatus.Overpaid)) {
                 setTimeout(() => get().addPoints(POINTS_ALLOCATION.LOG_PAYMENT_ON_TIME, `Updated transaction to Paid: ${updatedTransaction?.id}`), 0);
            }
            const student = get().getStudentById(updatedTransaction.studentId);
            if(student && (originalStatus === PaymentStatus.Due || originalStatus === PaymentStatus.PartiallyPaid) && (newStatus === PaymentStatus.Paid || newStatus === PaymentStatus.Overpaid)){
                 setTimeout(() => get().addPoints(POINTS_ALLOCATION.CLEAR_OVERDUE, `Cleared overdue status for transaction ${updatedTransaction?.id}`), 0);
            }

            return updatedTransaction;
        }
        return t;
       });
       return { transactions: newTransactions };
     });

     if (updatedTransaction) {
        get().addToast(`Transaction updated successfully.`, 'success');
        get().checkAndAwardAchievements();
     }
     return updatedTransaction;
  },

  deleteTransaction: (transactionId) => {
    set(state => ({ transactions: state.transactions.filter(t => t.id !== transactionId) }));
    get().addToast('Transaction deleted.', 'info');
  },

  getTransactionsByStudent: (studentId) => {
    return get().transactions.filter(t => t.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  exportTransactionsCSV: () => {
    try {
        const state = get();
        const { transactions, students } = state;
        
        if (transactions.length === 0) {
            get().addToast('No transactions to export.', 'info');
            return;
        }

        const header = ['Date', 'Student', 'Duration', 'Fee', 'Amount Paid', 'Status', 'Payment Method', 'Notes'];
        
        const studentMap = new Map(students.map(s => [s.id, s]));

        const rows = transactions.map(t => {
            const student = studentMap.get(t.studentId);
            const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
            
            const escapeCSV = (str?: string) => {
                if (!str) return '';
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            return [
                t.date.split('T')[0],
                escapeCSV(studentName),
                t.lessonDuration.toString(),
                t.lessonFee.toString(),
                t.amountPaid.toString(),
                t.status,
                escapeCSV(t.paymentMethod),
                escapeCSV(t.notes)
            ];
        });

        const csvContent = [
            header.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vellor_transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        get().addToast('CSV exported successfully!', 'success');
    } catch (error) {
        console.error("Failed to export CSV:", error);
        get().addToast('Failed to export CSV.', 'error');
    }
  },
});
