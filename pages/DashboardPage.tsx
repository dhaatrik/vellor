import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, useData } from '../store';
import { Button, Card, StatDisplayCard, Icon, ConfirmationModal } from '../components/ui';
import { formatCurrency, formatDate, formatRelativeTime } from '../helpers';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import localforage from 'localforage';
import { usePwaInstall } from '../usePwaInstall';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { DashboardGoal } from '../components/dashboard/DashboardGoal';

/**
 * The main dashboard page of the application.
 */
export const DashboardPage: React.FC = () => {
  const settings = useStore(s => s.settings);
  const gamification = useStore(s => s.gamification);
  const students = useStore(s => s.students);
  const activityLog = useStore(s => s.activityLog);
  const deleteActivity = useStore(s => s.deleteActivity);
  const clearActivityLog = useStore(s => s.clearActivityLog);
  const addToast = useStore(s => s.addToast);
  const getStudentById = useStore(s => s.getStudentById);
  const { totalUnpaid, totalPaidThisMonth, activeStudentsCount, overduePayments, predictedIncome } = useData.derived();

  const navigate = useNavigate();
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);
  const [confirmingDeleteActivityId, setConfirmingDeleteActivityId] = useState<string | null>(null);
  const { isInstallable, promptInstall } = usePwaInstall();
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    const fetchBackup = async () => {
      const backup = await localforage.getItem<string>('lastBackupDate');
      setLastBackup(backup);
      if (backup) {
      // ⚡ Bolt Performance: Use Date.parse() instead of new Date().getTime()
      const daysSinceBackup = (Date.now() - Date.parse(backup)) / (1000 * 3600 * 24);
      if (daysSinceBackup > 7) {
        // Use a timeout to ensure toasts render after initial mount
        setTimeout(() => addToast("It's been over a week since your last backup! Go to Settings to export your data.", "info"), 1000);
      }
      } else if (students.length > 0) {
        setTimeout(() => addToast("Remember to regularly export your data from Settings to keep it safe.", "info"), 1000);
      }
    };
    fetchBackup();
  }, []); // Run only once on mount

  const overdueStudentMap = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < overduePayments.length; i++) {
      const studentId = overduePayments[i].studentId;
      if (!map.has(studentId)) {
        map.set(studentId, getStudentById(studentId));
      }
    }
    return map;
  }, [overduePayments, students]);

  const activityParentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizerActivity = useVirtualizer({
    count: activityLog.length,
    getScrollElement: () => activityParentRef.current,
    estimateSize: () => 64, // Estimated height per row
    overscan: 5,
  });

  const overdueParentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizerOverdue = useVirtualizer({
    count: overduePayments.length,
    getScrollElement: () => overdueParentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
      className="space-y-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      {isInstallable && (
         <div className="bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20 rounded-3xl p-5 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white dark:bg-primary-light flex items-center justify-center text-accent shadow-sm">
                <Icon iconName="rocket" className="w-6 h-6" />
             </div>
             <div>
               <h4 className="font-bold text-gray-900 dark:text-white text-base">Get the Vellor App</h4>
               <p className="text-sm text-gray-500 dark:text-gray-400">Install Vellor on your device for a faster, full-screen native experience.</p>
             </div>
           </div>
           <Button onClick={promptInstall} size="sm" variant="primary" className="rounded-xl px-6 font-bold shadow-lg shadow-accent/20">Install</Button>
         </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-3">
            Welcome back, {settings.userName} <Icon iconName="sparkles" className="w-8 h-8 text-accent animate-pulse" />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your tutoring business today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/students', {state: { openAddStudentModal: true }})} leftIcon="plus" className="rounded-full">Add Student</Button>
          <Button variant="primary" onClick={() => navigate('/transactions', {state: { openAddTransactionModal: true }})} leftIcon="plus" className="rounded-full shadow-lg shadow-accent/20">Log Lesson</Button>
        </div>
      </div>
      {/* System Status Telemetry */}
      <motion.div variants={itemVariants} className="w-full mb-4">
        <div className="border border-white/5 bg-black p-4 flex flex-col md:flex-row gap-6 font-mono text-xs text-gray-500">
          <div className="flex gap-2 items-center">
            <span className="text-accent animate-pulse">●</span>
            <span>CORE_ENGINE: ZUSTAND_PERSIST_PERSISTENT</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-accent animate-pulse">●</span>
            <span>CRYPTO_VAULT: AES-GCM_LOCALFORAGE_LOCKED</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-accent animate-pulse">●</span>
            <span>BACKUP_ENTROPY: {
              (() => {
                if (!lastBackup) return 'UNKNOWN';
                const daysSinceBackup = (Date.now() - Date.parse(lastBackup)) / (1000 * 3600 * 24);
                return daysSinceBackup > 7 ? 'CRITICAL' : 'NOMINAL';
              })()
            }</span>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">

        
        {/* Stats Row */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
            <StatDisplayCard 
                title="Total Unpaid" 
                value={formatCurrency(totalUnpaid, settings.currencySymbol)} 
                iconName="banknotes" 
                iconColorClass={totalUnpaid > 0 ? "text-danger" : "text-success"}
                iconBgClass={totalUnpaid > 0 ? "bg-danger/10" : "bg-success/10"}
                onClick={() => navigate('/transactions', { state: { filter: 'unpaid' } })}
                className="border border-white/5 bg-black"
            />
            <StatDisplayCard 
                title="Paid This Month" 
                value={formatCurrency(totalPaidThisMonth, settings.currencySymbol)} 
                iconName="calendar" 
                iconColorClass="text-accent"
                iconBgClass="bg-accent/10"
                onClick={() => navigate('/transactions', { state: { filter: 'paid' } })}
                className="border border-white/5 bg-black cursor-pointer hover:border-accent/30 transition-colors"
            />
            <StatDisplayCard 
                title="Predicted Income" 
                value={formatCurrency(predictedIncome, settings.currencySymbol)} 
                iconName="trending-up" 
                iconColorClass="text-indigo-500"
                iconBgClass="bg-indigo-500/10"
                className="border border-white/5 bg-black"
            />
          </div>
        </motion.div>

        {/* Dynamic Chart */}
        <DashboardCharts itemVariants={itemVariants} />

        {/* Money Tree (Goal Progress) */}
        <DashboardGoal itemVariants={itemVariants} />

        {/* Active Students */}
        <motion.div
            variants={itemVariants}
            className="col-span-1 lg:col-span-1 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 rounded-3xl"
            onClick={() => navigate('/students')}
            role="button"
            tabIndex={0}
            aria-label="View Active Students"
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/students');
                }
            }}
        >
          <Card className="h-full min-h-[200px] border border-white/5 bg-black flex flex-col items-center justify-center text-center relative overflow-hidden hover:border-accent/30 transition-colors">
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 relative z-10">
              <Icon iconName="users" className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-1 relative z-10">{activeStudentsCount}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider relative z-10">Active Students</p>
          </Card>
        </motion.div>

        {/* Login Streak */}
        {settings.gamificationEnabled && (
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-1">
          <Card className="h-full min-h-[200px] border border-white/5 bg-black flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-500"></div>
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
              <Icon iconName="flame" className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-1 relative z-10">{gamification.streak}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider relative z-10">Day Streak</p>
          </Card>
        </motion.div>
        )}

        {/* Total Points */}
        {settings.gamificationEnabled && (
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-1">
          <Card className="h-full min-h-[200px] border border-white/5 bg-black flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors duration-500"></div>
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
              <Icon iconName="star" className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-1 relative z-10">{gamification.points}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider relative z-10">Total Points</p>
          </Card>
        </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-1 lg:col-span-2 row-span-2">
          <Card className="h-full min-h-[200px] border border-white/5 bg-black flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon iconName="bolt" className="w-5 h-5 text-yellow-500" />
                Recent Activity
              </h3>
              {activityLog.length > 0 && (
                <button 
                  onClick={() => setIsConfirmingClearAll(true)}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 rounded"
                  aria-label="Clear all activity history"
                  title="Clear all activity history"
                >
                  Clear All
                </button>
              )}
            </div>
            <div ref={activityParentRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {activityLog.length > 0 ? (
                  <div style={{ height: `${rowVirtualizerActivity.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                      {rowVirtualizerActivity.getVirtualItems().map((virtualRow) => {
                          const activity = activityLog[virtualRow.index];
                          return (
                          <div 
                            key={activity.id} 
                            data-index={virtualRow.index}
                            ref={rowVirtualizerActivity.measureElement}
                            className="absolute top-0 left-0 w-full pb-4"
                            style={{ transform: `translateY(${virtualRow.start}px)` }}
                          >
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(virtualRow.index * 0.05, 0.3) }}
                              className="flex items-start group font-mono text-xs"
                            >
                                <div className="flex-grow flex justify-between items-start border-b border-white/5 pb-2">
                                  <div className="flex gap-4">
                                    <span className="text-gray-500">[{formatRelativeTime(activity.timestamp)}]</span>
                                    <p className="text-gray-300">{activity.message}</p>
                                  </div>
                                  <button 
                                    onClick={() => setConfirmingDeleteActivityId(activity.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-accent transition-colors focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
                                    aria-label="Delete activity"
                                    title="Delete activity"
                                  >
                                    [DEL]
                                  </button>
                                </div>
                            </motion.li>
                          </div>
                          );
                      })}
                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-primary flex items-center justify-center mb-4">
                      <Icon iconName="clock" className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No recent activity</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add a student or log a lesson to get started!</p>
                  </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Overdue Payments */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2">
          <Card className={`h-full min-h-[200px] border bg-black flex flex-col ${overduePayments.length > 0 ? 'border-danger/30' : 'border-white/5'}`}>
            <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Icon iconName="warning" className={`w-5 h-5 ${overduePayments.length > 0 ? 'text-danger' : 'text-gray-400'}`} />
              Action Needed
            </h3>
            <div ref={overdueParentRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {overduePayments.length > 0 ? (
                <div style={{ height: `${rowVirtualizerOverdue.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                  {rowVirtualizerOverdue.getVirtualItems().map(virtualRow => {
                    const t = overduePayments[virtualRow.index];
                    const student = overdueStudentMap.get(t.studentId);
                    return (
                      <div 
                        key={t.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizerOverdue.measureElement}
                        className="absolute top-0 left-0 w-full pb-3"
                        style={{ transform: `translateY(${virtualRow.start}px)` }}
                      >
                        <li className="p-4 bg-danger/5 hover:bg-danger/10 transition-colors rounded-2xl cursor-pointer border border-danger/10 list-none block" onClick={() => navigate('/transactions', { state: { filter: 'unpaid' } })}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">{student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</span>
                            <span className="text-danger font-bold text-sm">{formatCurrency(t.lessonFee - t.amountPaid, settings.currencySymbol)}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                            <Icon iconName="calendar" className="w-3 h-3" />
                            {formatDate(t.date)}
                          </span>
                        </li>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-3xl bg-success/10 flex items-center justify-center mb-4">
                    <Icon iconName="check-circle" className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">All caught up!</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No overdue payments.</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

      </div>

      <ConfirmationModal
        isOpen={confirmingDeleteActivityId !== null}
        onClose={() => setConfirmingDeleteActivityId(null)}
        onConfirm={() => {
          if (confirmingDeleteActivityId) {
            deleteActivity(confirmingDeleteActivityId);
            setConfirmingDeleteActivityId(null);
          }
        }}
        title="Delete Activity"
        message="Are you sure you want to delete this activity? This action cannot be undone."
        confirmButtonText="Delete"
      />

      <ConfirmationModal
        isOpen={isConfirmingClearAll}
        onClose={() => setIsConfirmingClearAll(false)}
        onConfirm={() => {
          clearActivityLog();
          setIsConfirmingClearAll(false);
          addToast('Activity log cleared', 'success');
        }}
        title="Clear Activity Log"
        message={
          <>
            Are you sure you want to clear your entire recent activity history?
            <br /><br />
            <span className="text-danger">This action cannot be undone.</span>
          </>
        }
        confirmButtonText="Clear All"
      />
    </motion.div>
  );
};