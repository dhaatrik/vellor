import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Student, Transaction, PaymentStatus } from '../types';
import { Button, Input, Modal, Card, Icon, ConfirmationModal } from '../components/ui';
import { StudentDetailView } from '../components/students/StudentDetailView';
import { StudentForm } from '../components/students/StudentForm';
import { StudentListItem } from '../components/students/StudentListItem';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { QuickLogModal } from '../components/transactions/QuickLogModal';
import { generateInvoicePDF } from '../pdf';
import { CSVImportWizard } from '../components/students/CSVImportWizard';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Manages the display and manipulation of student data.
 */
export const StudentsPage: React.FC = () => {
  const students = useStore(s => s.students);
  const addStudent = useStore(s => s.addStudent);
  const updateStudent = useStore(s => s.updateStudent);
  const deleteStudent = useStore(s => s.deleteStudent);
  const getStudentById = useStore(s => s.getStudentById);
  const settings = useStore(s => s.settings);
  const transactions = useStore(s => s.transactions);
  const addTransaction = useStore(s => s.addTransaction);
  const addToast = useStore(s => s.addToast);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(undefined);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [showTransactionFormForStudent, setShowTransactionFormForStudent] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<Student | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showBulkLogModal, setShowBulkLogModal] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [bulkLogData, setBulkLogData] = useState({ date: new Date().toISOString().split('T')[0], duration: 60, fee: 50, notes: 'Bulk logged lesson' });

  const [makeupPrompt, setMakeupPrompt] = useState<{isOpen: boolean, studentId: string}>({isOpen: false, studentId: ''});
  const [showMakeupModal, setShowMakeupModal] = useState<{isOpen: boolean, studentId: string}>({isOpen: false, studentId: ''});

  const { studentId } = useParams<{studentId?: string}>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openAddStudentModal) {
      setEditingStudent(undefined);
      setShowStudentForm(true);
      setSelectedStudent(undefined);
      if (studentId) navigate('/students', { replace: true, state: {} });
    }
  }, [location.state, navigate, studentId]);
  
  useEffect(() => {
    if(studentId) {
        const student = getStudentById(studentId);
        setSelectedStudent(student);
        if (!student && students.length > 0 && !showStudentForm && !showTransactionFormForStudent) {
            navigate('/students', { replace: true });
        } else if (!student && students.length === 0 && !showStudentForm && !showTransactionFormForStudent) {
            navigate('/students', { replace: true });
        }
    } else {
        setSelectedStudent(undefined); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, getStudentById, navigate, students.length, showStudentForm, showTransactionFormForStudent]);

  const handleSaveStudent = (studentData: Student) => {
    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
    } else {
      addStudent(studentData);
    }
    setShowStudentForm(false);
    setEditingStudent(undefined);
    if (selectedStudent?.id === studentData.id) setSelectedStudent(getStudentById(studentData.id)); 
  };
  
  const handleSelectStudent = (student: Student) => {
    navigate(`/students/${student.id}`);
  };
  
  const handleCloseDetailView = () => {
      navigate('/students');
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
    setSelectedStudent(undefined);
    navigate('/students');
  };

  const handleDeleteRequest = (student: Student) => {
    setConfirmingDelete(student);
  };
  
  const confirmDeletion = () => {
    if(confirmingDelete) {
        deleteStudent(confirmingDelete.id);
        if (selectedStudent?.id === confirmingDelete.id) {
            setSelectedStudent(undefined);
            navigate('/students');
        }
        setConfirmingDelete(null);
    }
  };
  
  const handleSaveTransaction = (transactionData: Transaction) => {
    addTransaction(transactionData); 
    setShowTransactionFormForStudent(undefined);
    if(selectedStudent) {
        const refreshedStudent = getStudentById(selectedStudent.id);
        setSelectedStudent(refreshedStudent); 
        navigate(`/students/${selectedStudent.id}`);
    }

    if (transactionData.attendance === 'Absent' || transactionData.attendance === 'Cancelled') {
        setMakeupPrompt({ isOpen: true, studentId: transactionData.studentId });
    }
  };

  const handleMakeupConfirm = () => {
      setShowMakeupModal({ isOpen: true, studentId: makeupPrompt.studentId });
      setMakeupPrompt({ isOpen: false, studentId: '' });
  };

  const openTransactionFormForStudent = (studId: string) => {
    setShowTransactionFormForStudent(studId);
    if (selectedStudent) {
        setSelectedStudent(undefined);
        navigate('/students');
    }
  }

  const toggleStudentSelection = (student: Student) => {
    setSelectedStudentIds(prev => 
      prev.includes(student.id) ? prev.filter(id => id !== student.id) : [...prev, student.id]
    );
  };

  const updateTransaction = useStore(s => s.updateTransaction);
  const handleBulkMarkPaid = () => {
     let count = 0;
     // Optimization: use a Set for O(1) lookup and a single loop through transactions
     const selectedSet = new Set(selectedStudentIds);
     for (let i = 0; i < transactions.length; i++) {
         const t = transactions[i];
         if (
             selectedSet.has(t.studentId) &&
             t.status !== PaymentStatus.Paid &&
             t.status !== PaymentStatus.Overpaid &&
             t.status !== PaymentStatus.Scheduled
         ) {
             updateTransaction(t.id, { amountPaid: t.lessonFee });
             count++;
         }
     }
     addToast(`Marked ${count} lessons as paid!`, 'success');
     setSelectedStudentIds([]);
  }

  const handleBulkExport = () => {
      let count = 0;
      // Optimization: use maps for O(1) lookups and single loop through transactions
      const selectedStudentMap = new Map();
      for (let i = 0; i < students.length; i++) {
          const student = students[i];
          selectedStudentMap.set(student.id, student);
      }

      const selectedSet = new Set(selectedStudentIds);
      const firstUnpaidMap = new Map();

      for (let i = 0; i < transactions.length; i++) {
          const t = transactions[i];
          if (
              selectedSet.has(t.studentId) &&
              !firstUnpaidMap.has(t.studentId) &&
              t.status !== PaymentStatus.Paid &&
              t.status !== PaymentStatus.Overpaid &&
              t.status !== PaymentStatus.Scheduled
          ) {
              firstUnpaidMap.set(t.studentId, t);
              if (firstUnpaidMap.size === selectedSet.size) {
                  break; // found one unpaid transaction for each selected student
              }
          }
      }

      firstUnpaidMap.forEach((t, studentId) => {
          const student = selectedStudentMap.get(studentId);
          if (student) {
              generateInvoicePDF(t, student, settings);
              count++;
          }
      });

      addToast(count > 0 ? `Exported ${count} invoices!` : 'No unpaid lessons to export for selected students.', count > 0 ? 'success' : 'info');
      setSelectedStudentIds([]);
  }

  const submitBulkLog = () => {
      let count = 0;
      selectedStudentIds.forEach(id => {
          addTransaction({
              studentId: id,
              date: bulkLogData.date,
              lessonDuration: bulkLogData.duration,
              lessonFee: bulkLogData.fee,
              amountPaid: 0,
              notes: bulkLogData.notes
          } as Omit<Transaction, 'status'>);
          count++;
      });
      addToast(`Logged same lesson for ${count} students!`, 'success');
      setShowBulkLogModal(false);
      setSelectedStudentIds([]);
  };

  const filteredStudents = useMemo(() => {
    // ⚡ Bolt Performance: Hoist searchTerm.toLowerCase() outside the filter loop
    // to avoid redundant O(N) recalculations on every render where search occurs.
    const lowerSearchTerm = searchTerm.toLowerCase();
    return students.filter(student =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(lowerSearchTerm)
    );
  }, [students, searchTerm]);

  const outstandingBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      if (t.status === PaymentStatus.Due) {
        balances[t.studentId] = (balances[t.studentId] || 0) + t.lessonFee;
      } else if (t.status === PaymentStatus.PartiallyPaid) {
        balances[t.studentId] = (balances[t.studentId] || 0) + (t.lessonFee - t.amountPaid);
      }
    }
    return balances;
  }, [transactions]);

  if (selectedStudent && !showStudentForm && !showTransactionFormForStudent) {
    return (
        <>
            <StudentDetailView 
                student={selectedStudent} 
                onClose={handleCloseDetailView} 
                onEdit={handleEditStudent}
                onLogPayment={openTransactionFormForStudent}
                transactions={transactions}
                currencySymbol={settings.currencySymbol}
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
        </>
    );
  }

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
          <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50">Students</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your roster and track progress.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
           <Button onClick={() => setShowImportWizard(true)} variant="outline" leftIcon="document-text" className="w-full sm:w-auto rounded-full">Import CSV</Button>
           <Button onClick={() => { setEditingStudent(undefined); setShowStudentForm(true); setSelectedStudent(undefined); if(studentId) navigate('/students'); }} leftIcon="plus" variant="primary" className="w-full sm:w-auto rounded-full shadow-lg shadow-accent/20">Add Student</Button>
        </div>
      </div>

       <div className="relative max-w-md mb-8">
          <Input 
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-11 py-3 rounded-full bg-white dark:bg-primary-light border-gray-200 dark:border-white/10 focus:ring-accent"
            ref={searchInputRef}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon iconName="search" className="w-5 h-5 text-gray-400" />
          </div>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                searchInputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Clear search"
            >
              <Icon iconName="x-mark" className="w-5 h-5" />
            </button>
          )}
       </div>

      {students.length === 0 && !showStudentForm ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="text-center py-16 rounded-3xl border-0 shadow-sm bg-white dark:bg-primary-light">
            <div className="w-20 h-20 mx-auto bg-gray-50 dark:bg-primary rounded-full flex items-center justify-center mb-6">
              <Icon iconName="users" className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-2 text-gray-900 dark:text-white">No Students Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Your roster is empty. Add your first student to start tracking lessons and payments.</p>
            <Button onClick={() => { setEditingStudent(undefined); setShowStudentForm(true); setSelectedStudent(undefined); if(studentId) navigate('/students'); }} leftIcon="plus" className="rounded-full">Add First Student</Button>
          </Card>
        </motion.div>
      ) : filteredStudents.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="text-center py-12 rounded-3xl border-0 shadow-sm bg-white dark:bg-primary-light">
             <p className="text-gray-500 dark:text-gray-400">No students found matching "{searchTerm}".</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredStudents.map(s => (
              <motion.div key={s.id} variants={itemVariants} layout initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.9 }}>
                <StudentListItem 
                  student={s} 
                  onSelect={handleSelectStudent} 
                  onDelete={handleDeleteRequest} 
                  currencySymbol={settings.currencySymbol}
                  outstandingBalance={outstandingBalances[s.id] || 0}
                  isSelected={selectedStudentIds.includes(s.id)}
                  onToggleSelect={toggleStudentSelection}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal isOpen={showStudentForm} onClose={() => { setShowStudentForm(false); setEditingStudent(undefined); }} title={editingStudent ? 'Edit Student' : 'Add New Student'}>
        <StudentForm student={editingStudent} onSave={handleSaveStudent} onClose={() => { setShowStudentForm(false); setEditingStudent(undefined); }} />
      </Modal>
      
      <Modal isOpen={!!showTransactionFormForStudent} onClose={() => setShowTransactionFormForStudent(undefined)} title="Log Lesson">
        {showTransactionFormForStudent && (
          <TransactionForm
            students={students}
            defaultStudentId={showTransactionFormForStudent}
            onSave={handleSaveTransaction}
            onClose={() => setShowTransactionFormForStudent(undefined)}
            currencySymbol={settings.currencySymbol}
          />
        )}
      </Modal>
      
      <ConfirmationModal
        isOpen={!!confirmingDelete}
        onClose={() => setConfirmingDelete(null)}
        onConfirm={confirmDeletion}
        title="Confirm Student Deletion"
        message={
          <>
            Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{confirmingDelete?.firstName} {confirmingDelete?.lastName}</strong>? 
            <br /><br />
            <span className="text-danger">All associated transactions will also be permanently deleted. This action cannot be undone.</span>
          </>
        }
        confirmButtonText="Delete Student"
      />

      {/* Floating Action Bar for Bulk Actions */}
      <AnimatePresence>
        {selectedStudentIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }} 
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-4 rounded-full shadow-2xl z-50 flex items-center justify-center gap-4 transition-colors"
          >
            <span className="font-bold text-sm whitespace-nowrap">{selectedStudentIds.length} Selected</span>
            <div className="h-6 w-px bg-white/20 dark:bg-black/20 hidden sm:block"></div>
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
                <Button size="sm" variant="ghost" className="!text-white dark:!text-gray-900 hover:bg-white/10 dark:hover:bg-black/10 whitespace-nowrap" onClick={() => setShowBulkLogModal(true)}>Log Same</Button>
                <Button size="sm" variant="ghost" className="!text-white dark:!text-gray-900 hover:bg-white/10 dark:hover:bg-black/10 whitespace-nowrap" onClick={handleBulkMarkPaid}>Mark Paid</Button>
                <Button size="sm" variant="primary" className="shadow-none rounded-full whitespace-nowrap" onClick={handleBulkExport}>Export Invoices</Button>
            </div>
            <button onClick={() => setSelectedStudentIds([])} className="ml-2 p-2 rounded-full hover:bg-white/10 dark:hover:bg-black/10 flex-shrink-0" aria-label="Clear selected students">
                <Icon iconName="x-mark" className="w-5 h-5"/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={showBulkLogModal} onClose={() => setShowBulkLogModal(false)} title={`Bulk Log Lesson (${selectedStudentIds.length} Students)`}>
         <div className="space-y-4 p-2">
            <div>
               <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Date</label>
               <Input type="date" value={bulkLogData.date} onChange={e => setBulkLogData({...bulkLogData, date: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Duration (mins)</label>
                  <Input type="number" value={bulkLogData.duration} onChange={e => setBulkLogData({...bulkLogData, duration: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Fee ({settings.currencySymbol})</label>
                  <Input type="number" value={bulkLogData.fee} onChange={e => setBulkLogData({...bulkLogData, fee: Number(e.target.value)})} />
                </div>
            </div>
            <div>
               <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Notes</label>
               <Input value={bulkLogData.notes} onChange={e => setBulkLogData({...bulkLogData, notes: e.target.value})} placeholder="Optional notes for all" />
            </div>
            <Button className="w-full mt-4" variant="primary" onClick={submitBulkLog}>Log Lesson for All</Button>
         </div>
      </Modal>

      <CSVImportWizard isOpen={showImportWizard} onClose={() => setShowImportWizard(false)} />

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