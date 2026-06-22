import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Student } from '../../../types';
import { Button, Icon } from '../../ui';

interface StudentHeaderProps {
  student: Student;
  gradientClass: string;
  isPortalCopied: boolean;
  onEdit: (student: Student) => void;
  onLogPayment: (studentId: string) => void;
  handleSharePortal: () => void;
  itemVariants: Variants;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  student,
  gradientClass,
  isPortalCopied,
  onEdit,
  onLogPayment,
  handleSharePortal,
  itemVariants,
}) => {
  return (
    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-black/5 border border-white/20 dark:border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0 border-4 border-white dark:border-primary shadow-lg`}>
              <span className="text-3xl font-display font-bold text-white shadow-sm">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </span>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">{student.firstName} {student.lastName}</h2>
            {student.parent && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-primary text-sm text-gray-600 dark:text-gray-300">
                <Icon iconName="users" className="w-3.5 h-3.5" />
                {student.parent.name} <span className="opacity-60">({student.parent.relationship})</span>
              </div>
            )}
          </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full sm:w-auto">
        <Button onClick={handleSharePortal} leftIcon={isPortalCopied ? "check-circle" : "share"} variant="outline" className="w-full sm:w-auto rounded-full hidden sm:flex border-gray-200 dark:border-white/10 hover:border-accent hover:text-accent">
          {isPortalCopied ? "Copied!" : "Portal"}
        </Button>
        <Button onClick={() => onEdit(student)} leftIcon="pencil" variant="outline" className="w-full sm:w-auto rounded-full">Edit Profile</Button>
        <Button onClick={() => onLogPayment(student.id)} leftIcon="plus" variant="primary" className="w-full sm:w-auto rounded-full shadow-lg shadow-accent/20">Log Lesson</Button>
      </div>
    </motion.div>
  );
};
