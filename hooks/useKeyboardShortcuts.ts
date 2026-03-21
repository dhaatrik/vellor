import { useEffect } from 'react';
import { useStore } from '../store';
import { currentHoveredTransactionId, currentHoveredStudentId } from '../helpers/globalHover';
import { PaymentStatus } from '../types';

export const useKeyboardShortcuts = (
  onOpenSearch: () => void,
  onOpenQuickLog: () => void,
  onOpenHelp: () => void
) => {
  const store = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input, textarea, or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        onOpenQuickLog();
      } else if (cmdOrCtrl && e.key === '/') {
        e.preventDefault();
        onOpenHelp();
      } else if (e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        
        // Mark hovered transaction as paid
        if (currentHoveredTransactionId) {
          const t = store.transactions.find(tx => tx.id === currentHoveredTransactionId);
          if (t && t.status !== PaymentStatus.Paid && t.status !== PaymentStatus.Overpaid) {
            store.updateTransaction(t.id, {
              amountPaid: t.lessonFee, // Pay in full
              status: PaymentStatus.Paid
            });
            store.addToast('Transaction marked as paid!', 'success');
          }
        } 
        // Or mark all due transactions for hovered student as paid
        else if (currentHoveredStudentId) {
          const studentDueTransactions = store.transactions.filter(
            tx => tx.studentId === currentHoveredStudentId && 
            (tx.status === PaymentStatus.Due || tx.status === PaymentStatus.PartiallyPaid)
          );
          
          if (studentDueTransactions.length > 0) {
            studentDueTransactions.forEach(t => {
              store.updateTransaction(t.id, {
                amountPaid: t.lessonFee,
                status: PaymentStatus.Paid
              });
            });
            store.addToast(`Marked ${studentDueTransactions.length} lesson(s) as paid!`, 'success');
          } else {
            store.addToast('No due lessons found for this student.', 'info');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch, onOpenQuickLog, onOpenHelp, store]);
};
