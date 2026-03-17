import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Student, Transaction } from '../types';
import { Button, Input, Modal, Card, Icon, ConfirmationModal } from '../components/ui';
import { StudentDetailView } from '../components/students/StudentDetailView';
import { StudentForm } from '../components/students/StudentForm';
import { StudentListItem } from '../components/students/StudentListItem';
import { TransactionForm } from '../components/transactions/TransactionForm';
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
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(undefined);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [showTransactionFormForStudent, setShowTransactionFormForStudent] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<Student | null>(null);

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
  };

  const openTransactionFormForStudent = (studId: string) => {
    setShowTransactionFormForStudent(studId);
    if (selectedStudent) {
        setSelectedStudent(undefined);
        navigate('/students');
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  if (selectedStudent && !showStudentForm && !showTransactionFormForStudent) {
    return <StudentDetailView 
                student={selectedStudent} 
                onClose={handleCloseDetailView} 
                onEdit={handleEditStudent}
                onLogPayment={openTransactionFormForStudent}
                transactions={transactions}
                currencySymbol={settings.currencySymbol}
            />;
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
        <Button onClick={() => { setEditingStudent(undefined); setShowStudentForm(true); setSelectedStudent(undefined); if(studentId) navigate('/students'); }} leftIcon="plus" className="w-full sm:w-auto rounded-full shadow-lg shadow-accent/20">Add Student</Button>
      </div>

       <div className="relative max-w-md mb-8">
          <Input 
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 py-3 rounded-full bg-white dark:bg-primary-light border-gray-200 dark:border-white/10 focus:ring-accent"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon iconName="search" className="w-5 h-5 text-gray-400" />
          </div>
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
                  transactions={transactions}
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
    </motion.div>
  );
};