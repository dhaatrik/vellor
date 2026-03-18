import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Transaction, PaymentStatus } from '../types';
import { Button, Modal, Card, Icon, ConfirmationModal } from '../components/ui';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { TransactionListItem } from '../components/transactions/TransactionListItem';
import { generateInvoicePDF } from '../pdf';
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
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState<Transaction | null>(null);
  const location = useLocation();
  
  type FilterType = 'all' | 'paid' | 'due' | 'partially-paid' | 'overpaid' | 'unpaid';
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
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
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteRequest = (transaction: Transaction) => {
    setConfirmingDelete(transaction);
  };
  
  const studentsMap = useMemo(() => {
    const map = new Map<string, typeof students[0]>();
    for (const student of students) {
      map.set(student.id, student);
    }
    return map;
  }, [students]);

  const handleGenerateInvoice = (transaction: Transaction) => {
    const student = studentsMap.get(transaction.studentId);
    if (student) {
      generateInvoicePDF(transaction, student, settings);
      addToast('Invoice generated successfully.', 'success');
    } else {
      addToast('Student not found.', 'error');
    }
  };
  
  const confirmDeletion = () => {
    if (confirmingDelete) {
      deleteTransaction(confirmingDelete.id);
      setConfirmingDelete(null);
    }
  };
  
  const sortedTransactions = useMemo(() => {
    // Pre-compute timestamps for faster sorting (Schwartzian transform)
    const withTimestamps = transactions.map(t => ({
      t,
      timestamp: new Date(t.date).getTime()
    }));
    return withTimestamps
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(item => item.t);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = sortedTransactions;

    // Apply status filter
    if (activeFilter === 'unpaid') {
        result = result.filter(t => t.status === PaymentStatus.Due || t.status === PaymentStatus.PartiallyPaid);
    } else if (activeFilter !== 'all') {
        const statusMap = {
            'paid': PaymentStatus.Paid,
            'due': PaymentStatus.Due,
            'partially-paid': PaymentStatus.PartiallyPaid,
            'overpaid': PaymentStatus.Overpaid,
        };
        const targetStatus = statusMap[activeFilter as keyof typeof statusMap];
        if (targetStatus) {
            result = result.filter(t => t.status === targetStatus);
        }
    }

    // Apply search filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(t => {
            const student = studentsMap.get(t.studentId);
            if (!student) return false;
            const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
            return fullName.includes(query);
        });
    }

    // Apply date filter
    if (dateRange.start) {
        result = result.filter(t => t.date >= dateRange.start);
    }
    if (dateRange.end) {
        result = result.filter(t => t.date <= dateRange.end);
    }

    return result;
  }, [sortedTransactions, activeFilter, searchQuery, dateRange, studentsMap]);

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
        <Button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }} leftIcon="plus" className="w-full sm:w-auto rounded-full shadow-lg shadow-accent/20">Log Lesson</Button>
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
              placeholder="Search by student name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm bg-white dark:bg-primary-light transition-all duration-200"
           />
        </div>
        <div className="flex items-center gap-2">
           <input 
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm bg-white dark:bg-primary-light transition-all duration-200 appearance-none"
           />
           <span className="text-gray-500 font-medium">to</span>
           <input 
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent sm:text-sm bg-white dark:bg-primary-light transition-all duration-200 appearance-none"
           />
           {(dateRange.start || dateRange.end) && (
              <Button variant="ghost" size="sm" onClick={() => setDateRange({start: '', end: ''})} className="text-gray-400 hover:text-danger rounded-full !p-2" aria-label="Clear dates">
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
              const student = studentsMap.get(t.studentId);
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
                      onGenerateInvoice={handleGenerateInvoice}
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
    </motion.div>
  );
};