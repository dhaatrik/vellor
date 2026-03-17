import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button, Input, Select } from '../ui';
import { useStore } from '../../store';
import { TransactionFormData } from '../../types';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({ isOpen, onClose }) => {
  const students = useStore(s => s.students);
  const addTransaction = useStore(s => s.addTransaction);
  const [studentId, setStudentId] = useState('');
  const [duration, setDuration] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  const activeStudents = students;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !duration || !amountPaid) return;

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Calculate lesson fee based on duration and student's default rate
    let lessonFee = 0;
    if (student.tuition.rateType === 'hourly') {
      lessonFee = (Number(duration) / 60) * student.tuition.defaultRate;
    } else if (student.tuition.rateType === 'per_lesson') {
      lessonFee = student.tuition.defaultRate;
    } else {
      lessonFee = student.tuition.defaultRate; // Monthly is tricky here, default to rate
    }

    const paid = Number(amountPaid);

    const transactionData: TransactionFormData = {
      studentId,
      date: new Date().toISOString().split('T')[0],
      lessonDuration: Number(duration),
      lessonFee,
      amountPaid: paid,
      paymentMethod: '',
      notes: 'Quick logged lesson',
    };

    addTransaction(transactionData);
    
    // Reset and close
    setStudentId('');
    setDuration('');
    setAmountPaid('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-primary rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-accent">⚡</span> Quick Log
                </h2>
                <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Icon iconName="x-mark" className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Select
                  label="Student"
                  name="studentId"
                  value={studentId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setStudentId(e.target.value);
                    // Auto-fill duration if student has a typical duration
                    const student = students.find(s => s.id === e.target.value);
                    if (student && student.tuition.typicalLessonDuration) {
                      setDuration(student.tuition.typicalLessonDuration.toString());
                    }
                  }}
                  options={[
                    { value: '', label: 'Select a student...' },
                    ...activeStudents.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))
                  ]}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Duration (mins)"
                    name="duration"
                    type="number"
                    value={duration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
                    min="0"
                    required
                    placeholder="e.g. 60"
                  />
                  <Input
                    label="Amount Paid"
                    name="amountPaid"
                    type="number"
                    value={amountPaid}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmountPaid(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                    placeholder="e.g. 50"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full py-4 text-lg rounded-2xl shadow-lg shadow-accent/20 mt-4">
                  Log Lesson
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
