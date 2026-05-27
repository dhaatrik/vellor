import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Transaction, PaymentStatus } from '../types';
import { Button, Modal, Card, Icon, ConfirmationModal } from '../components/ui';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { TransactionListItem } from '../components/transactions/TransactionListItem';
import { QuickLogModal } from '../components/transactions/QuickLogModal';
import { generateBulkInvoicePDF } from '../pdf';
import { generateWhatsAppLink } from '../helpers';
import { motion } from 'framer-motion';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

/**
 * Manages the display and manipulation of financial transactions.
 */
export const TransactionsPage: React.FC = () => {
  const transactions = useStore(s => s.transactions);
  const students = useStore(s => s.students);
  const addTransaction = useStore(s => s.addTransaction);
  const updateTransaction = useStore(s => s.updateTransaction);
  const deleteTransaction = useStore(s => s.deleteTransaction);
  const addToast = useStore(s => s.addToast);
  const settings = useStore(s => s.settings);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState<Transaction | null>(null);
  
  const [makeupPrompt, setMakeupPrompt] = useState<{isOpen: boolean, studentId: string}>({isOpen: false, studentId: ''});
  const [showMakeupModal, setShowMakeupModal] = useState<{isOpen: boolean, studentId: string}>({isOpen: false, studentId: ''});
  
  const location = useLocation();
  
  type FilterType = 'all' | 'paid' | 'due' | 'partially-paid' | 'overpaid' | 'unpaid';
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchRafRef = useRef<number | null>(null);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchRafRef.current !== null) {
      cancelAnimationFrame(searchRafRef.current);
    }
    searchRafRef.current = requestAnimationFrame(() => {
      setDebouncedSearchQuery(val);
    });
  }, []);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  useEffect(() => {
      if (location.state?.openAddTransactionModal) {
          setEditingTransaction(undefined);
          setShowForm(true);
      }
      if (location.state?.filter) {
        setActiveFilter(location.state.filter);
      }
  }, [location.state]);

  const handleSaveTransaction = (transactionData: Transaction) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    setShowForm(false);
    setEditingTransaction(undefined);

    if (transactionData.attendance === 'Absent' || transactionData.attendance === 'Cancelled') {
        setMakeupPrompt({ isOpen: true, studentId: transactionData.studentId });
    }
  };

  const handleMakeupConfirm = () => {
      setShowMakeupModal({ isOpen: true, studentId: makeupPrompt.studentId });
      setMakeupPrompt({ isOpen: false, studentId: '' });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteRequest = (transaction: Transaction) => {
    setConfirmingDelete(transaction);
  };
  
  const studentsMap = useMemo(() => {
    // ⚡ Bolt Performance: Pre-compute searchName for faster filtering
    const map: Record<string, { student: typeof students[0], searchName: string }> = Object.create(null);
    for (let i = 0, len = students.length; i < len; i++) {
      const student = students[i];
      map[student.id] = {
        student,
        searchName: (student.firstName + ' ' + student.lastName).toLowerCase()
      };
    }
    return map;
  }, [students]);

  const handleShareWhatsApp = async (transaction: Transaction) => {
    const entry = studentsMap[transaction.studentId];
    if (!entry) return addToast('Student not found.', 'error');
    const student = entry.student;

    try {
      if (navigator.share) {
         await navigator.share({
           title: 'Tutoring Invoice',
           text: `Hello ${student.firstName}, your invoice for ${settings.currencySymbol}${transaction.lessonFee} is ready.`,
         });
         addToast('Shared via WhatsApp!', 'success');
      } else {
         // Fallback just text to parent's phone or student's phone
         const phoneToUse = student.contact.parentPhone1 || student.contact.studentPhone;
         const message = `Hello ${student.firstName}, your invoice for ${settings.currencySymbol}${transaction.lessonFee} is ready.`;
         window.open(generateWhatsAppLink(phoneToUse, message), '_blank');
      }
    } catch {
      // user likely cancelled sharing
    }
  };

  const handleBulkInvoice = () => {
    const success = generateBulkInvoicePDF(students, transactions, settings);
    if (success) {
       addToast('Monthly statements generated successfully!', 'success');
    } else {
       addToast('No unpaid transactions found to invoice.', 'info');
    }
  };
  
  const confirmDeletion = () => {
    if (confirmingDelete) {
      deleteTransaction(confirmingDelete.id);
      setConfirmingDelete(null);
    }
  };
  
  const transactionsLength = transactions.length;

  const filteredTransactions = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    const statusMap = {
      'paid': PaymentStatus.Paid,
      'due': PaymentStatus.Due,
      'partially-paid': PaymentStatus.PartiallyPaid,
      'overpaid': PaymentStatus.Overpaid,
    };
    const targetStatus = (activeFilter !== 'all' && activeFilter !== 'unpaid')
      ? statusMap[activeFilter as keyof typeof statusMap]
      : null;

    // ⚡ Bolt Performance: Replace Array.prototype.filter() with a pre-allocated/direct for loop
    // to eliminate the overhead of intermediate allocations and callback execution for large arrays.
    const results = [];
    for (let i = 0, len = transactions.length; i < len; i++) {
      const t = transactions[i];
      let matches = true;

      // Apply status filter
      if (activeFilter === 'unpaid') {
        if (t.status !== PaymentStatus.Due && t.status !== PaymentStatus.PartiallyPaid) matches = false;
      } else if (targetStatus && t.status !== targetStatus) {
        matches = false;
      }

      // Apply date filter
      if (matches && dateRange.start && t.date < dateRange.start) matches = false;
      if (matches && dateRange.end && t.date > dateRange.end) matches = false;

      // Apply search filter
      if (matches && query) {
        const entry = studentsMap[t.studentId];
        if (!entry || !entry.searchName.includes(query)) {
           matches = false;
        }
      }

      if (matches) {
        results.push(t);
      }
    }

    // Sort in place at the very end to avoid sorting un-matched items
    return results.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactionsLength, activeFilter, debouncedSearchQuery, dateRange, studentsMap]);

  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useWindowVirtualizer({
    count: filteredTransactions.length,
    estimateSize: () => 100, // Estimated height of TransactionListItem + padding
    scrollMargin: parentRef.current?.offsetTop ?? 0,
    overscan: 5,
  });

  const filterButtons: { label: string, filter: FilterType }[] = [
    { label: "All", filter: 'all' },
    { label: "Unpaid", filter: 'unpaid' },
    { label: "Paid", filter: 'paid' },
    { label: "Due", filter: 'due' },
    { label: "Partially Paid", filter: 'partially-paid' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      className="space-y-6 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track lessons, payments, and outstanding balances.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button onClick={handleBulkInvoice} variant="outline" leftIcon="document-text" className="w-full sm:w-auto rounded-full">Monthly Statements</Button>
          <Button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }} leftIcon="plus" className="w-full sm:w-auto rounded-full shadow-lg shadow-accent/20">Log Lesson</Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {filterButtons.map(({ label, filter }) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className="rounded-full"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
           <Icon iconName="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              aria-label="Search by student name"
              title="Search by student name"
              placeholder="Search by student name..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm bg-white dark:bg-primary-light transition-all duration-200"
              ref={searchInputRef}
           />
           {searchQuery && (
             <button
               onClick={() => {
                 setSearchQuery('');
                 setDebouncedSearchQuery('');
                 if (searchRafRef.current !== null) cancelAnimationFrame(searchRafRef.current);
                 searchInputRef.current?.focus();
               }}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary"
               aria-label="Clear search"
               title="Clear search"
             >
               <Icon iconName="x-mark" className="w-5 h-5" />
             </button>
           )}
        </div>
        <div className="flex items-center gap-2">
           <input 
              type="date"
              aria-label="Start date"
              title="Start date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm bg-white dark:bg-primary-light transition-all duration-200 appearance-none"
           />
           <span className="text-gray-500 font-medium">to</span>
           <input 
              type="date"
              aria-label="End date"
              title="End date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm bg-white dark:bg-primary-light transition-all duration-200 appearance-none"
           />
           {(dateRange.start || dateRange.end) && (
              <Button variant="ghost" size="sm" onClick={() => setDateRange({start: '', end: ''})} className="text-gray-400 hover:text-danger rounded-full !p-2" title="Clear dates" aria-label="Clear dates">
                 <Icon iconName="x-mark" className="w-4 h-4" />
              </Button>
           )}
        </div>
      </div>

      {transactions.length === 0 && !showForm ? (
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
           <Card className="text-center py-16 rounded-3xl border-0 shadow-sm bg-white dark:bg-primary-light">
            <div className="w-20 h-20 mx-auto bg-gray-50 dark:bg-primary rounded-full flex items-center justify-center mb-6">
              <Icon iconName="banknotes" className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-2 text-gray-900 dark:text-white">No Transactions Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Log your first lesson to start tracking your income and student payments.</p>
            <Button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }} leftIcon="plus" className="rounded-full">Log First Lesson</Button>
          </Card>
         </motion.div>
      ) : filteredTransactions.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="text-center py-12 rounded-3xl border-0 shadow-sm bg-white dark:bg-primary-light">
             <p className="text-gray-500 dark:text-gray-400">No transactions match the current filter.</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          className="relative w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          ref={parentRef}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const t = filteredTransactions[virtualRow.index];
              const entry = studentsMap[t.studentId];
              const student = entry?.student;
              return (
                <div
                  key={t.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: '1rem',
                  }}
                >
                  <motion.div variants={itemVariants} initial="hidden" animate="visible">
                    <TransactionListItem
                      transaction={t}
                      studentName={student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                      onEdit={handleEditTransaction}
                      onDelete={handleDeleteRequest}
                      onShareWhatsApp={handleShareWhatsApp}
                      currencySymbol={settings.currencySymbol}
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} title={editingTransaction ? 'Edit Transaction' : 'Log New Lesson'}>
        <TransactionForm
          transaction={editingTransaction}
          students={students}
          onSave={handleSaveTransaction}
          onClose={() => { setShowForm(false); setEditingTransaction(undefined); }}
          currencySymbol={settings.currencySymbol}
        />
      </Modal>
      
      <ConfirmationModal
        isOpen={!!confirmingDelete}
        onClose={() => setConfirmingDelete(null)}
        onConfirm={confirmDeletion}
        title="Confirm Transaction Deletion"
        message={<span className="text-danger">Are you sure you want to delete this transaction? This action cannot be undone.</span>}
        confirmButtonText="Delete Transaction"
      />

      <ConfirmationModal
        isOpen={makeupPrompt.isOpen}
        onClose={() => setMakeupPrompt({ isOpen: false, studentId: '' })}
        onConfirm={handleMakeupConfirm}
        title="Schedule Make-up Class?"
        message="Since this lesson was marked as Absent/Cancelled, would you like to schedule a make-up class now?"
        confirmButtonText="Yes, Schedule"
      />

      <QuickLogModal
         isOpen={showMakeupModal.isOpen}
         onClose={() => setShowMakeupModal({ isOpen: false, studentId: '' })}
         defaultStudentId={showMakeupModal.studentId}
         isMakeup={true}
      />
    </motion.div>
  );
};