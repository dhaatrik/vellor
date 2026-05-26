import { StateCreator } from 'zustand';
import { AppState, TransactionSlice } from './types';
import { Transaction, TransactionFormData, PaymentStatus } from '../types';
import { generateId } from '../helpers';
import { POINTS_ALLOCATION } from '../constants';
import { sanitizeString, determinePaymentStatus } from '../helpers';

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

    const status = determinePaymentStatus(sanitizedTransactionData.amountPaid, sanitizedTransactionData.lessonFee, sanitizedTransactionData.status);

    const newTransaction: Transaction = {
      ...sanitizedTransactionData,
      id: generateId(),
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

  addTransactions: (transactionsData) => {
    const newTransactions: Transaction[] = [];
    let pointsToAdd = 0;
    let studentsOverdueCleared = 0;
    const now = new Date().toISOString();

    // ⚡ Bolt Performance: Process bulk additions inside a single loop to avoid N+1 state updates
    for (let j = 0; j < transactionsData.length; j++) {
      const transactionData = transactionsData[j];
      const sanitizedTransactionData: TransactionFormData = {
        ...transactionData,
        paymentMethod: sanitizeString(transactionData.paymentMethod),
        notes: sanitizeString(transactionData.notes),
        grade: sanitizeString(transactionData.grade),
        progressRemark: sanitizeString(transactionData.progressRemark),
      };

      const status = determinePaymentStatus(sanitizedTransactionData.amountPaid, sanitizedTransactionData.lessonFee, sanitizedTransactionData.status);

      const newTransaction: Transaction = {
        ...sanitizedTransactionData,
        id: crypto.randomUUID(),
        status,
        createdAt: now,
      };

      newTransactions.push(newTransaction);

      if (status === PaymentStatus.Paid || status === PaymentStatus.Overpaid) {
        pointsToAdd += POINTS_ALLOCATION.LOG_PAYMENT_ON_TIME;
      }
    }

    set(state => ({ transactions: [...state.transactions, ...newTransactions] }));

    if (newTransactions.length > 0) {
        get().addToast(`Logged ${newTransactions.length} transaction${newTransactions.length > 1 ? 's' : ''} successfully.`, 'success');
        get().logActivity(`Logged bulk transactions for ${newTransactions.length} students`, 'banknotes');

        if (pointsToAdd > 0) {
          get().addPoints(pointsToAdd, `Logged bulk payments on time`);
        }

        const allTransactions = get().transactions;
        // Batch process overdue checks for performance instead of per student
        for (let j = 0; j < newTransactions.length; j++) {
          const newTransaction = newTransactions[j];
          if (newTransaction.status === PaymentStatus.Paid || newTransaction.status === PaymentStatus.Overpaid) {
            const student = get().getStudentById(newTransaction.studentId);
            if (student) {
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

              if (wasOverdue) {
                if (totalDueForStudent - newTransaction.amountPaid <= 0) {
                  studentsOverdueCleared++;
                }
              }
            }
          }
        }

        if (studentsOverdueCleared > 0) {
          get().addPoints(POINTS_ALLOCATION.CLEAR_OVERDUE * studentsOverdueCleared, `Cleared overdue payments for ${studentsOverdueCleared} students`);
        }

        get().checkAndAwardAchievements();
    }

    return newTransactions;
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
       // Only copy the array if a match is actually found to save allocation overhead
       for (let i = 0, len = state.transactions.length; i < len; i++) {
        const t = state.transactions[i];
        if (t.id === transactionId) {
            const newTransactions = [...state.transactions];
            const originalStatus = t.status;
            const potentiallyUpdated = { ...t, ...sanitizedTransactionData };
            let newStatus = t.status;
            if (sanitizedTransactionData.amountPaid !== undefined || sanitizedTransactionData.lessonFee !== undefined) {
                const fee = sanitizedTransactionData.lessonFee !== undefined ? sanitizedTransactionData.lessonFee : t.lessonFee;
                const paid = sanitizedTransactionData.amountPaid !== undefined ? sanitizedTransactionData.amountPaid : t.amountPaid;
                newStatus = determinePaymentStatus(paid, fee);
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
            return { transactions: newTransactions };
        }
       }
       return state;
     });

     if (updatedTransaction) {
        get().addToast(`Transaction updated successfully.`, 'success');
        get().checkAndAwardAchievements();
     }
     return updatedTransaction;
  },

  deleteTransaction: (transactionId) => {
    set(state => {
      // ⚡ Bolt Performance: Use native .filter() which is internally optimized in modern JS engines
      // and significantly more readable than manual slice+push loops for array removal
      const newTransactions = state.transactions.filter(t => t.id !== transactionId);
      return { transactions: newTransactions };
    });
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
    return result.sort((a, b) => b.date.localeCompare(a.date));
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

        const escapeCSV = (str?: string) => {
            if (!str) return '';
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = [header.join(',')];
        for (let i = 0, len = transactions.length; i < len; i++) {
            const t = transactions[i];
            const student = studentMap[t.studentId];
            const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
            
            rows.push(
                t.date.split('T')[0] + ',' +
                escapeCSV(studentName) + ',' +
                t.lessonDuration.toString() + ',' +
                t.lessonFee.toString() + ',' +
                t.amountPaid.toString() + ',' +
                t.status + ',' +
                escapeCSV(t.paymentMethod) + ',' +
                escapeCSV(t.notes)
            );
        }

        const csvContent = rows.join('\n');

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
        get().addToast('Failed to export CSV.', 'error');
    }
  },
});
