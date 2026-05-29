import React, { useMemo } from 'react';
import { Student, Transaction, PaymentStatus } from '../../types';
import { Button, Card, Icon, Modal, Textarea } from '../ui';
import { formatCurrency, formatDate, formatPhoneNumber, generateWhatsAppLink, generatePortalLink } from '../../helpers';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { generateProgressReportPDF } from '../../pdf';
import { useStore } from '../../store';
import { StudentHistoryTab } from './StudentHistoryTab';
import { StudentProgressTab } from './StudentProgressTab';

/**
 * Props for the StudentDetailView component.
 */
interface StudentDetailViewProps {
  /** The student whose details are to be displayed. */
  student: Student;
  /** Callback to close the detail view. */
  onClose: () => void;
  /** Callback to initiate editing this student. */
  onEdit: (student:Student) => void;
  /** Callback to open the log payment form for this student. */
  onLogPayment: (studentId: string) => void;
  /** Array of all transactions, used to filter for this student. */
  transactions: Transaction[];
  /** Current currency symbol. */
  currencySymbol: string;
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
 * Displays a comprehensive, detailed view of a single student.
 * This view includes contact information, tuition details, notes, and a full
 * transaction history, along with actions to edit the profile or log a new payment.
 */
export const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student, onClose, onEdit, onLogPayment, transactions, currencySymbol }) => {
  const [isPortalCopied, setIsPortalCopied] = useState(false);

  // Filter and sort transactions for the current student
  // ⚡ Bolt Performance: Consolidate multiple passes (.filter, .reduce) over the transactions array
  // into a single O(N) loop to eliminate intermediate allocations and iteration overhead.
  const { studentTransactions, totalOwed, totalPaidForStudent } = useMemo(() => {
    const matchingTransactions: Transaction[] = [];
    let owed = 0;
    let paid = 0;

    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      if (t.studentId === student.id) {
        matchingTransactions.push(t);
        paid += (t.amountPaid || 0);

        if (t.status === PaymentStatus.Due) {
          owed += (t.lessonFee || 0);
        } else if (t.status === PaymentStatus.PartiallyPaid) {
          owed += ((t.lessonFee || 0) - (t.amountPaid || 0));
        }
      }
    }

    // ⚡ Bolt Performance: Use direct string comparison for ISO 8601 dates to eliminate map cache lookup and parsing overhead
    matchingTransactions.sort((a, b) => b.date < a.date ? -1 : (b.date > a.date ? 1 : 0)); // Newest first

    return {
      studentTransactions: matchingTransactions,
      totalOwed: owed,
      totalPaidForStudent: paid
    };
  }, [transactions, student.id]);

  const [activeTab, setActiveTab] = useState<'history' | 'progress'>('history');
  const [showReportModal, setShowReportModal] = useState(false);
  const [parentNote, setParentNote] = useState('');
  const settings = useStore(s => s.settings);

  const gradeToNumber = (grade: string) => {
     if (grade === 'A') return 5;
     if (grade === 'B') return 4;
     if (grade === 'C') return 3;
     if (grade === 'D') return 2;
     if (grade === 'F') return 1;
     return null;
  };

  const formatGrade = (val: number) => {
     if (val === 5) return 'A';
     if (val === 4) return 'B';
     if (val === 3) return 'C';
     if (val === 2) return 'D';
     if (val === 1) return 'F';
     return '';
  };

  const progressTransactions = useMemo(() => {
     // ⚡ Bolt Performance: Memoize the filtered array and use a for loop to avoid O(N) re-calculation and callback overhead during render
     const result = [];
     for (let i = 0, len = studentTransactions.length; i < len; i++) {
       const t = studentTransactions[i];
       if (t.grade || t.progressRemark) {
         result.push(t);
       }
     }
     return result;
  }, [studentTransactions]);

  const gradeChartData = useMemo(() => {
     const result = [];
     for (let i = progressTransactions.length - 1; i >= 0; i--) {
        const t = progressTransactions[i];
        if (t.grade === 'A' || t.grade === 'B' || t.grade === 'C' || t.grade === 'D' || t.grade === 'F') {
           const numValue = gradeToNumber(t.grade as string);
           if (numValue !== null) {
              result.push({
                 date: formatDate(t.date),
                 val: numValue,
                 grade: t.grade
              });
           }
        }
     }
     return result;
  }, [progressTransactions]);

  const handleExportReport = () => {
      generateProgressReportPDF(student, transactions, settings, parentNote);
      setShowReportModal(false);
      useStore.getState().addToast('Progress Report exported!', 'success');
  };

  const handleSharePortal = () => {
     const link = generatePortalLink(student, studentTransactions, settings);
     navigator.clipboard.writeText(link);
     useStore.getState().addToast('Portal link copied to clipboard!', 'success');
     setIsPortalCopied(true);
     setTimeout(() => setIsPortalCopied(false), 2000);
  };

  const gradientClass = useMemo(() => getGradient(student.firstName + student.lastName), [student.firstName, student.lastName]);

  const renderedSubjects = useMemo(() => {
    return student.tuition.subjects.length > 0 ? (
      student.tuition.subjects.map((subject, idx) => (
        <span key={idx} className="px-2 py-0.5 bg-white dark:bg-primary-light border border-gray-200 dark:border-white/10 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300">
          {subject}
        </span>
      ))
    ) : (
      <span className="text-gray-500 dark:text-gray-400">N/A</span>
    );
  }, [student.tuition.subjects]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Student Header: Avatar, Name, Action Buttons */}
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

      {/* Contact and Tuition Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
      
      {/* Notes Card (if notes exist) */}
      {student.notes && (
          <motion.div variants={itemVariants}>
            <Card className="bg-accent/5 border-accent/10">
              <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-2">
                <Icon iconName="document-text" className="w-4 h-4" />
                Notes
              </h3>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{student.notes}</p>
            </Card>
          </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 justify-center sm:justify-start">
         <Button variant={activeTab === 'history' ? 'primary' : 'outline'} onClick={() => setActiveTab('history')} className="rounded-full px-6 shadow-sm">Lesson History</Button>
         <Button variant={activeTab === 'progress' ? 'primary' : 'outline'} onClick={() => setActiveTab('progress')} className="rounded-full px-6 shadow-sm">Academic Progress</Button>
      </motion.div>

      <div className="content-visibility-auto contain-layout contain-paint min-h-[600px]">
      <div className={`contain-paint content-visibility-auto ${activeTab === 'history' ? 'block' : 'hidden'}`}>
        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", stiffness: 220, damping: 29, mass: 1, restDelta: 0.001 }}>
          <StudentHistoryTab
            studentTransactions={studentTransactions}
            totalOwed={totalOwed}
            totalPaidForStudent={totalPaidForStudent}
            currencySymbol={currencySymbol}
            studentId={student.id}
            onLogPayment={onLogPayment}
          />
        </motion.div>
      </div>
      <div className={`contain-paint content-visibility-auto ${activeTab === 'progress' ? 'block' : 'hidden'}`}>
        <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", stiffness: 220, damping: 29, mass: 1, restDelta: 0.001 }}>
          <StudentProgressTab
            gradeChartData={gradeChartData}
            progressTransactions={progressTransactions}
            setShowReportModal={setShowReportModal}
            formatGrade={formatGrade}
          />
        </motion.div>
      </div>
      </div>
      
      {/* Back Button */}
      <motion.div variants={itemVariants} className="flex justify-start pt-2">
          <Button onClick={onClose} variant="ghost" leftIcon="arrow-left" className="rounded-full hover:bg-gray-100 dark:hover:bg-primary-light">Back to Students</Button>
      </motion.div>

      {/* Progress Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Export Progress Report">
         <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Add a personal note to the parent/student to include in this progress report PDF.</p>
            <Textarea 
               label="Teacher Note (Optional)" 
               placeholder="Write an encouraging note or highlight general improvement..." 
               value={parentNote} 
               onChange={e => setParentNote(e.target.value)} 
               rows={4}
            />
            <Button onClick={handleExportReport} variant="primary" className="w-full mt-4 rounded-xl shadow-lg shadow-accent/20">Generate PDF</Button>
         </div>
      </Modal>
    </motion.div>
  );
};