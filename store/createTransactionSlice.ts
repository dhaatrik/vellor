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
      grade: sanitizeString(transactionData.grade),
      progressRemark: sanitizeString(transactionData.progressRemark),
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
        // ⚡ Bolt Performance: Consolidate multiple passes (.filter, .some, .reduce) over the transactions array
        // into a single O(N) for loop to reduce intermediate allocations and iteration overhead.
        const allTransactions = get().transactions;
        let wasOverdue = false;
        let totalDueForStudent = 0;

        for (let i = 0; i < allTransactions.length; i++) {
             const t = allTransactions[i];
             if (t.studentId === newTransaction.studentId && t.id !== newTransaction.id) {
                 if (t.status === PaymentStatus.Due) {
                     wasOverdue = true;
                     totalDueForStudent += t.lessonFee;
                 } else if (t.status === PaymentStatus.PartiallyPaid) {
                     wasOverdue = true;
                     totalDueForStudent += (t.lessonFee - t.amountPaid);
                 }
             }
        }

        if(wasOverdue){
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
     if (transactionData.grade !== undefined) {
        sanitizedTransactionData.grade = sanitizeString(transactionData.grade);
     }
     if (transactionData.progressRemark !== undefined) {
        sanitizedTransactionData.progressRemark = sanitizeString(transactionData.progressRemark);
     }

     set(state => {
       // ⚡ Bolt Performance: Use an early-breaking for loop instead of .map() to avoid full array iterations when updating a single item
       const newTransactions = [...state.transactions];
       for (let i = 0, len = newTransactions.length; i < len; i++) {
        const t = newTransactions[i];
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

            newTransactions[i] = updatedTransaction;
            break;
        }
       }
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
    // ⚡ Bolt Performance: Replace chained array methods with a single loop to eliminate intermediate allocations.
    // Use direct ISO string comparison for sorting to avoid Date.parse() overhead.
    const all = get().transactions;
    const result = [];
    for (let i = 0, len = all.length; i < len; i++) {
      const t = all[i];
      if (t.studentId === studentId) {
        result.push(t);
      }
    }
    return result.sort((a, b) => b.date < a.date ? -1 : (b.date > a.date ? 1 : 0));
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
        
        const studentMap: Record<string, typeof students[0]> = Object.create(null);
        for (let i = 0; i < students.length; i++) {
            studentMap[students[i].id] = students[i];
        }

        const rows = transactions.map(t => {
            const student = studentMap[t.studentId];
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
