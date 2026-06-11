import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Card, Icon } from '../components/ui';
import { formatCurrency, formatDate } from '../helpers';
import { TransactionStatusBadge } from '../components/transactions/TransactionStatusBadge';
import { jsonReviver } from '../src/crypto';
import { PaymentStatus } from '../types';
const portalDataSchema = z.object({
  tutorName: z.string(),
  currencySymbol: z.string(),
  student: z.object({
    firstName: z.string(),
    lastName: z.string(),
    subjects: z.array(z.string()),
  }),
  transactions: z.array(z.object({
    id: z.string(),
    date: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? val : val.toISOString()),
    lessonFee: z.number(),
    amountPaid: z.number(),
    status: z.nativeEnum(PaymentStatus),
    grade: z.string().optional(),
    progressRemark: z.string().optional(),
    attendance: z.string().optional(),
  }))
});

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

export const PortalPage: React.FC = () => {
  const location = useLocation();
  
  const parsedData = useMemo(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const dataParam = searchParams.get('data');
      if (!dataParam) return null;

      // 🛡️ SECURITY RATIONALE:
      // Vellor is a 100% offline Progressive Web App (PWA) with no backend or database.
      // The `data` parameter is passed entirely within the URL hash fragment (`#/portal?data=...`).
      // Hash fragments are processed locally by the browser and are never sent to any server.
      // Therefore, this data cannot be intercepted over the network, recorded in server logs,
      // or exposed to backend vulnerabilities. Using `btoa`/`atob` here provides a stateless,
      // offline-friendly mechanism for sharing snapshots without needing a centralized database.
      const decodedStr = decodeURIComponent(atob(dataParam));
      const parsedJson = JSON.parse(decodedStr, jsonReviver);
      return portalDataSchema.parse(parsedJson);
    } catch {
      return null;
    }
  }, [location.search]);

  if (!parsedData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 text-center p-4 font-sans transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="py-12 px-6 shadow-2xl border-rose-100 dark:border-rose-900/30">
            <Icon iconName="warning" className="w-16 h-16 text-danger mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Invalid Link</h2>
            <p className="text-gray-500 dark:text-gray-400">This portal link is invalid or corrupted. Please request a new link from your tutor.</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  const { tutorName, currencySymbol, student, transactions } = parsedData;

  const { totalOwed, totalLessons, presentCount } = useMemo(() => {
    let owed = 0;
    let present = 0;
    const total = transactions.length;

    for (let i = 0; i < total; i++) {
      const t = transactions[i];
      if (t.status === 'Due') {
        owed += (t.lessonFee || 0);
      } else if (t.status === 'Partially Paid') {
        owed += ((t.lessonFee || 0) - (t.amountPaid || 0));
      }
      
      if (t.attendance === 'Present') {
        present++;
      }
    }

    return { totalOwed: owed, totalLessons: total, presentCount: present };
  }, [transactions]);

  const attendanceRate = totalLessons > 0 ? Math.round((presentCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto space-y-8"
      >
        
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 shadow-xl mb-6 overflow-hidden border border-gray-100 dark:border-slate-800 transition-all hover:scale-105 duration-300">
             <img src="/logo.png" alt="Vellor" className="w-16 h-16 object-contain dark:bg-white/90 dark:rounded-2xl dark:p-2" />
           </div>
           <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
             {student?.firstName || 'Student'}'s Portal
           </h1>
           <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
             Managed by <span className="text-indigo-600 dark:text-indigo-400 font-bold">{tutorName || 'Your Tutor'}</span>
           </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <motion.div variants={itemVariants}>
             <Card className="bg-white dark:bg-slate-900 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-[2rem] p-6 h-full">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center">
                     <Icon iconName="book-open" className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Subjects</h3>
               </div>
               <div className="flex flex-wrap gap-2">
                  {Array.isArray(student?.subjects) && student.subjects.length > 0 ? student.subjects.map((sub: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm font-bold rounded-xl">{sub}</span>
                  )) : <span className="text-gray-400 dark:text-gray-600 text-sm italic">No subjects listed</span>}
               </div>
             </Card>
           </motion.div>

           <motion.div variants={itemVariants}>
             <Card className="bg-white dark:bg-slate-900 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-[2rem] p-6 h-full">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center">
                     <Icon iconName="banknotes" className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Balance</h3>
               </div>
               <p className={`text-4xl font-black font-mono tracking-tighter ${totalOwed > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {formatCurrency(totalOwed, currencySymbol)}
               </p>
               <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                 {totalOwed > 0 ? 'Outstanding amount' : 'Account fully paid'}
               </p>
             </Card>
           </motion.div>

           <motion.div variants={itemVariants}>
             <Card className="bg-white dark:bg-slate-900 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-[2rem] p-6 h-full">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
                     <Icon iconName="calendar" className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Total Lessons</h3>
               </div>
               <p className="text-4xl font-black font-mono tracking-tighter text-gray-900 dark:text-white">
                  {totalLessons}
               </p>
               <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                 Lessons logged to date
               </p>
             </Card>
           </motion.div>

           <motion.div variants={itemVariants}>
             <Card className="bg-white dark:bg-slate-900 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-[2rem] p-6 h-full">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center">
                     <Icon iconName="chart-bar" className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Attendance Rate</h3>
               </div>
               <p className={`text-4xl font-black font-mono tracking-tighter ${attendanceRate >= 90 ? 'text-emerald-500' : attendanceRate >= 75 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {attendanceRate}%
               </p>
               <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${attendanceRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${attendanceRate >= 90 ? 'bg-emerald-500' : attendanceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                 />
               </div>
             </Card>
           </motion.div>
        </div>

        {/* Transactions & Progress */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-slate-900 border-none shadow-xl rounded-[2.5rem] p-8 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16" />
             
             <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 relative">
               <Icon iconName="bolt" className="w-7 h-7 text-indigo-500" />
               Recent Activity
             </h3>
             
             {transactions.length > 0 ? (
               <div className="space-y-6 relative">
                  {transactions.slice(0, 10).map((t, idx) => (
                     <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (idx * 0.05) }}
                        className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                           <div>
                              <p className="text-lg font-black text-gray-900 dark:text-white">{formatDate(t.date)}</p>
                              <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 flex gap-4">
                                 <span className="flex items-center gap-1.5">
                                   <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                   Fee: {formatCurrency(t.lessonFee, currencySymbol)}
                                 </span>
                                 <span className="flex items-center gap-1.5">
                                   <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                   Paid: {formatCurrency(t.amountPaid, currencySymbol)}
                                 </span>
                              </div>
                           </div>
                           <div className="flex flex-wrap gap-2 self-start sm:self-center">
                              {t.attendance && (
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                  t.attendance === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                  t.attendance === 'Absent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                                  'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                }`}>
                                  {t.attendance}
                                </span>
                              )}
                              <TransactionStatusBadge status={t.status} />
                           </div>
                        </div>
                        {(t.grade || t.progressRemark) && (
                           <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                              <div className="flex flex-wrap items-center gap-3">
                                {t.grade && (
                                  <span className="px-3 py-1 bg-indigo-600 text-white font-black text-xs rounded-full shadow-lg shadow-indigo-500/30">
                                    Grade: {t.grade}
                                  </span>
                                )}
                                {t.progressRemark && (
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900/50 px-4 py-2 border border-gray-100 dark:border-slate-800 rounded-2xl flex-1">
                                    {t.progressRemark}
                                  </p>
                                )}
                              </div>
                           </div>
                        )}
                     </motion.div>
                  ))}
                  {transactions.length > 10 && (
                    <p className="text-center text-sm font-bold text-gray-400 dark:text-gray-500 pt-4 uppercase tracking-widest">
                      Showing latest 10 records
                    </p>
                  )}
               </div>
             ) : (
               <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                 <Icon iconName="archive-box" className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                 <p className="text-gray-500 dark:text-gray-400 font-bold">No activity recorded yet.</p>
               </div>
             )}
          </Card>
        </motion.div>
        
        {/* Footer */}
        <motion.div 
          variants={itemVariants}
          className="text-center pb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-gray-100 dark:border-slate-800 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            <img src="/logo.png" alt="Vellor" className="w-4 h-4 object-contain rounded opacity-50 dark:bg-white/90" />
            Powered by Vellor
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};
