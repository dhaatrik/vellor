import React from 'react';
import { motion } from 'framer-motion';
import { Student } from '../../../types';
import { Card, Icon } from '../../ui';
import { formatPhoneNumber, generateWhatsAppLink } from '../../../helpers';

interface ContactInfoCardProps {
  student: Student;
  itemVariants: any;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ student, itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full bg-gray-50 dark:bg-primary/50 border-gray-100 dark:border-white/5">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Icon iconName="identification" className="w-4 h-4" />
          Contact Info
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon iconName="phone" className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Student Phone</p>
              <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                {formatPhoneNumber(student.contact.studentPhone)}
                {student.contact.studentPhone?.number && (
                  <a href={generateWhatsAppLink(student.contact.studentPhone)} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600 outline-none p-1 rounded hover:bg-green-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary" title="Message on WhatsApp" aria-label="Message on WhatsApp">
                    <Icon iconName="share" className="w-4 h-4" />
                  </a>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon iconName="users" className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Parent Phones</p>
              <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                {formatPhoneNumber(student.contact.parentPhone1)}
                {student.contact.parentPhone1?.number && (
                  <a href={generateWhatsAppLink(student.contact.parentPhone1)} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600 outline-none p-1 rounded hover:bg-green-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary" title="Message on WhatsApp" aria-label="Message on WhatsApp">
                    <Icon iconName="share" className="w-4 h-4" />
                  </a>
                )}
              </p>
              {student.contact.parentPhone2?.number && (
                <p className="text-gray-900 dark:text-white font-medium mt-1 flex items-center gap-2">
                  {formatPhoneNumber(student.contact.parentPhone2)}
                  <a href={generateWhatsAppLink(student.contact.parentPhone2)} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600 outline-none p-1 rounded hover:bg-green-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary" title="Message on WhatsApp" aria-label="Message on WhatsApp">
                    <Icon iconName="share" className="w-4 h-4" />
                  </a>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon iconName="envelope" className="w-4 h-4 text-gray-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Email</p>
              <p className="text-gray-900 dark:text-white font-medium truncate">{student.contact.email || 'N/A'}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
