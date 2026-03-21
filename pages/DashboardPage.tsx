import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, useData } from '../store';
import { Button, Card, StatDisplayCard, Icon, ConfirmationModal, OnboardingWizard } from '../components/ui';
import { formatCurrency, formatDate, formatRelativeTime } from '../helpers';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PaymentStatus } from '../types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { usePwaInstall } from '../usePwaInstall';

/**
 * The main dashboard page of the application.
 */
export const DashboardPage: React.FC = () => {
  const settings = useStore(s => s.settings);
  const gamification = useStore(s => s.gamification);
  const students = useStore(s => s.students);
  const activityLog = useStore(s => s.activityLog);
  const transactions = useStore(s => s.transactions);
  const deleteActivity = useStore(s => s.deleteActivity);
  const clearActivityLog = useStore(s => s.clearActivityLog);
  const addToast = useStore(s => s.addToast);
  const { totalUnpaid, totalPaidThisMonth, activeStudentsCount, overduePayments } = useData.derived();
  
  const predictedIncome = useMemo(() => {
    return students.reduce((sum, student) => {
      let monthlyMultiplier = 4;
      if (student.tuition.rateType === 'monthly') monthlyMultiplier = 1;
      return sum + (student.tuition.defaultRate * monthlyMultiplier);
    }, 0);
  }, [students]);

  const navigate = useNavigate();
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);
  const { isInstallable, promptInstall } = usePwaInstall();

  useEffect(() => {
    const lastBackup = localStorage.getItem('lastBackupDate');
    if (lastBackup) {
      const daysSinceBackup = (new Date().getTime() - new Date(lastBackup).getTime()) / (1000 * 3600 * 24);
      if (daysSinceBackup > 7) {
        // Use a timeout to ensure toasts render after initial mount
        setTimeout(() => addToast("It's been over a week since your last backup! Go to Settings to export your data.", "info"), 1000);
      }
    } else if (students.length > 0) {
      setTimeout(() => addToast("Remember to regularly export your data from Settings to keep it safe.", "info"), 1000);
    }
  }, []); // Run only once on mount

  const monthlyIncomeGoal = settings.monthlyGoal || 500; 
  const moneyTreeProgress = Math.min(100, (totalPaidThisMonth / monthlyIncomeGoal) * 100);

  const [isEditingGoal, setIsEditingGoal] = React.useState(false);
  const [goalInput, setGoalInput] = React.useState(monthlyIncomeGoal.toString());
  const updateSettings = useStore(s => s.updateSettings);

  const handleGoalSave = () => {
    updateSettings({ monthlyGoal: parseFloat(goalInput) || 500 });
    setIsEditingGoal(false);
  };

  const [activeChart, setActiveChart] = React.useState<'income' | 'students'>('income');

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();

    // ⚡ Bolt Performance: Pre-compute the fallback date outside the loop
    const fallbackDate = Date.now();

    // ⚡ Bolt Performance: Pre-calculate target months to avoid O(6*N) loop inside map
    const monthIncomes = new Array(6).fill(0);
    const targetMonths: {year: number, month: number}[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      targetMonths.push({ year: d.getFullYear(), month: d.getMonth() });
    }

    // ⚡ Bolt Performance: Single pass over transactions
    for (let j = 0; j < transactions.length; j++) {
      const t = transactions[j];
      // ⚡ Bolt Performance: Check status before creating expensive Date objects
      if (t.status === PaymentStatus.Paid || t.status === PaymentStatus.PartiallyPaid || t.status === PaymentStatus.Overpaid) {
        const tDate = new Date(t.date);
        const tYear = tDate.getFullYear();
        const tMonth = tDate.getMonth();
        for (let k = 0; k < 6; k++) {
          if (targetMonths[k].year === tYear && targetMonths[k].month === tMonth) {
            monthIncomes[k] += t.amountPaid;
            break;
          }
        }
      }
    }

    // ⚡ Bolt Performance: Pre-calculate student creation times
    const studentTimes = new Float64Array(students.length);
    for (let j = 0; j < students.length; j++) {
      const s = students[j];
      studentTimes[j] = s.createdAt ? new Date(s.createdAt).getTime() : fallbackDate;
    }

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });

      const income = monthIncomes[5 - i];

      // ⚡ Bolt Performance: Hoist loop-invariant threshold Date creation
      const thresholdDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0).getTime();

      let studentsCount = 0;
      for (let j = 0; j < studentTimes.length; j++) {
          if (studentTimes[j] <= thresholdDate) studentsCount++;
      }

      data.push({ name: monthName, income, students: studentsCount });
    }
    return data;
  }, [transactions, students]);

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

  // ⚡ Bolt Performance: Pre-calculate student lookup map to avoid O(N*M) lookups in virtualized lists
  const studentMap = useMemo(() => {
    const map = new Map();
    for (const student of students) {
      map.set(student.id, student);
    }
    return map;
  }, [students]);

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
      <OnboardingWizard 
        isOpen={!settings.hasCompletedOnboarding} 
        onClose={() => updateSettings({ hasCompletedOnboarding: true })} 
      />

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
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
        
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
                className="rounded-3xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl"
            />
            <StatDisplayCard 
                title="Paid This Month" 
                value={formatCurrency(totalPaidThisMonth, settings.currencySymbol)} 
                iconName="calendar" 
                iconColorClass="text-accent"
                iconBgClass="bg-accent/10"
                onClick={() => navigate('/transactions', { state: { filter: 'paid' } })}
                className="rounded-3xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl cursor-pointer hover:border-accent/30 transition-colors"
            />
            <StatDisplayCard 
                title="Predicted Income" 
                value={formatCurrency(predictedIncome, settings.currencySymbol)} 
                iconName="trending-up" 
                iconColorClass="text-indigo-500"
                iconBgClass="bg-indigo-500/10"
                className="rounded-3xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl"
            />
          </div>
        </motion.div>

        {/* Dynamic Chart */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <Card className="h-full rounded-3xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon iconName={activeChart === 'income' ? 'chart-bar' : 'users'} className={`w-5 h-5 ${activeChart === 'income' ? 'text-accent' : 'text-blue-500'}`} />
                {activeChart === 'income' ? 'Income Overview' : 'Student Growth'}
              </h3>
              <div className="flex bg-gray-100 dark:bg-primary rounded-full p-1" role="tablist" aria-label="Chart view options">
                <button 
                  role="tab"
                  aria-selected={activeChart === 'income'}
                  onClick={() => setActiveChart('income')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${activeChart === 'income' ? 'bg-white dark:bg-primary-light text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Income
                </button>
                <button 
                  role="tab"
                  aria-selected={activeChart === 'students'}
                  onClick={() => setActiveChart('students')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${activeChart === 'students' ? 'bg-white dark:bg-primary-light text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Students
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-white/10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-gray-500 dark:text-gray-400" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-gray-500 dark:text-gray-400" tickFormatter={(value) => activeChart === 'income' ? `${settings.currencySymbol}${value}` : value} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: activeChart === 'income' ? '#8b5cf6' : '#3b82f6', fontWeight: 'bold' }}
                    formatter={(value: any) => activeChart === 'income' ? [formatCurrency(Number(value), settings.currencySymbol), 'Income'] : [value, 'Students']}
                  />
                  <Area type="monotone" dataKey={activeChart} stroke={activeChart === 'income' ? '#8b5cf6' : '#3b82f6'} strokeWidth={3} fillOpacity={1} fill={`url(#color${activeChart === 'income' ? 'Income' : 'Students'})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Money Tree (Goal Progress) */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-1 lg:col-span-1">
          <Card className="h-full rounded-3xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Icon iconName="banknotes" className="w-5 h-5 text-accent" />
                  Monthly Goal
                </h3>
              </div>
              <div className="mb-2 flex justify-between items-end">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPaidThisMonth, settings.currencySymbol)}</span>
                {isEditingGoal ? (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">/</span>
                        <input 
                            type="number" 
                            className="w-20 px-2 py-1 bg-white/50 dark:bg-primary-dark/50 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white outline-none" 
                            value={goalInput} 
                            onChange={e => setGoalInput(e.target.value)} 
                            onBlur={handleGoalSave} 
                            onKeyDown={e => e.key === 'Enter' && handleGoalSave()} 
                            autoFocus 
                        />
                    </div>
                ) : (
                    <span 
                        className="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-accent transition-colors"
                        onClick={() => setIsEditingGoal(true)}
                        title="Click to edit goal"
                    >
                        / {formatCurrency(monthlyIncomeGoal, settings.currencySymbol)}
                        <Icon iconName="pencil" className="w-3 h-3 inline-block ml-1 opacity-50" />
                    </span>
                )}
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-primary/50 rounded-full overflow-hidden shadow-inner border border-gray-200 dark:border-white/5">
                <motion.div 
                  className="h-full bg-accent relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${moneyTreeProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                </motion.div>
              </div>
              {moneyTreeProgress >= 100 && <p className="text-sm mt-3 text-accent font-medium animate-pulse flex items-center gap-2">Goal Achieved! <Icon iconName="party-popper" className="w-5 h-5" /></p>}
            </div>
          </Card>
        </motion.div>

        {/* Active Students */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-1 cursor-pointer" onClick={() => navigate('/students')}>
          <Card className="h-full rounded-3xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden hover:border-accent/30 transition-colors">
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
          <Card className="h-full rounded-3xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
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
          <Card className="h-full rounded-3xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
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
          <Card className="h-full rounded-3xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon iconName="bolt" className="w-5 h-5 text-yellow-500" />
                Recent Activity
              </h3>
              {activityLog.length > 0 && (
                <button 
                  onClick={() => setIsConfirmingClearAll(true)}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors"
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
                              className="flex items-start group"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-primary flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                                  <Icon iconName={activity.icon} className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-accent transition-colors" />
                                </div>
                                <div className="flex-grow pt-1 flex justify-between items-start">
                                  <div>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{activity.message}</p>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(activity.timestamp)}</span>
                                  </div>
                                  <button 
                                    onClick={() => deleteActivity(activity.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-primary-light transition-opacity"
                                    aria-label="Delete activity"
                                  >
                                    <Icon iconName="x-mark" className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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
          <Card className={`h-full rounded-3xl border shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl flex flex-col ${overduePayments.length > 0 ? 'border-danger/30' : 'border-white/20 dark:border-white/5'}`}>
            <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Icon iconName="warning" className={`w-5 h-5 ${overduePayments.length > 0 ? 'text-danger' : 'text-gray-400'}`} />
              Action Needed
            </h3>
            <div ref={overdueParentRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {overduePayments.length > 0 ? (
                <div style={{ height: `${rowVirtualizerOverdue.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                  {rowVirtualizerOverdue.getVirtualItems().map(virtualRow => {
                    const t = overduePayments[virtualRow.index];
                    const student = studentMap.get(t.studentId);
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