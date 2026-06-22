import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Student } from '../../../types';
import { Card, Icon } from '../../ui';
import { formatCurrency } from '../../../helpers';

interface TuitionDetailsCardProps {
  student: Student;
  currencySymbol: string;
  renderedSubjects: React.ReactNode;
  itemVariants: Variants;
}

export const TuitionDetailsCard: React.FC<TuitionDetailsCardProps> = ({ student, currencySymbol, renderedSubjects, itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full bg-gray-50 dark:bg-primary/50 border-gray-100 dark:border-white/5">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Icon iconName="academic-cap" className="w-4 h-4" />
          Tuition Details
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon iconName="book-open" className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Subjects</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {renderedSubjects}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon iconName="banknotes" className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Rate & Duration</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {formatCurrency(student.tuition.defaultRate, currencySymbol)} <span className="text-gray-500 font-normal">({student.tuition.rateType})</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {student.tuition.typicalLessonDuration} {student.tuition.rateType === 'hourly' ? 'mins' : 'sessions'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon iconName="credit-card" className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Preferred Payment</p>
              <p className="text-gray-900 dark:text-white font-medium">{student.tuition.preferredPaymentMethod || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
