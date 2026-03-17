import React, { useMemo } from 'react';
import { Student, Transaction, PaymentStatus } from '../../types';
import { Button, Card, Icon } from '../ui';
import { formatCurrency } from '../../helpers';

/**
 * Props for the StudentListItem component.
 */
interface StudentListItemProps {
  /** The student data to display. */
  student: Student;
  /** Callback when the student item is selected (e.g., to view details). */
  onSelect: (student: Student) => void;
  /** Callback when the delete button for this student is clicked. */
  onDelete: (student: Student) => void;
  /** Current currency symbol for formatting. */
  currencySymbol: string;
  /** Array of all transactions to calculate outstanding balance. */
  transactions: Transaction[];
}

// Helper to generate a consistent gradient based on a string
const getGradient = (name: string) => {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-fuchsia-500 to-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Displays a summary of a single student in a list.
 */
export const StudentListItem: React.FC<StudentListItemProps> = React.memo(({ student, onSelect, onDelete, currencySymbol, transactions }) => {
  const outstandingBalance = useMemo(() => {
    return transactions
      .filter(t => t.studentId === student.id)
      .reduce((acc, t) => {
        if (t.status === PaymentStatus.Due) return acc + t.lessonFee;
        if (t.status === PaymentStatus.PartiallyPaid) return acc + (t.lessonFee - t.amountPaid);
        return acc;
      }, 0);
  }, [transactions, student.id]);

  const gradientClass = useMemo(() => getGradient(student.firstName + student.lastName), [student.firstName, student.lastName]);

  return (
    <Card className="h-full flex flex-col hover:border-accent/50 transition-colors duration-300 cursor-pointer group border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl" onClick={() => onSelect(student)}>
        <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <span className="text-xl font-display font-bold shadow-sm">{student.firstName.charAt(0)}{student.lastName.charAt(0)}</span>
            </div>
            <div className="flex-grow min-w-0 pt-1">
                <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white truncate">{student.firstName} {student.lastName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{student.contact.email || 'No email provided'}</p>
            </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Outstanding</p>
                <p className={`text-lg font-bold font-mono ${outstandingBalance > 0 ? 'text-danger' : 'text-gray-900 dark:text-white'}`}>
                    {formatCurrency(outstandingBalance, currencySymbol)}
                </p>
            </div>
            <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); onDelete(student); }} 
                  className="!p-2 rounded-full text-gray-400 hover:text-danger hover:bg-danger/10"
                  aria-label="Delete student"
                >
                  <Icon iconName="trash" className="w-5 h-5" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-primary flex items-center justify-center text-gray-400 group-hover:bg-accent group-hover:text-primary-dark transition-colors">
                  <Icon iconName="chevron-right" className="w-5 h-5" />
                </div>
            </div>
        </div>
    </Card>
  );
});