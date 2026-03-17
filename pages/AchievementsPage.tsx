import React, { useMemo } from 'react';
import { useStore } from '../store';
import { Card, Icon } from '../components/ui';
import { formatDate, formatCurrency } from '../helpers';
import { AchievementId, PaymentStatus } from '../types';
import { motion } from 'framer-motion';

/**
 * Displays the user's gamification progress, including their current rank, points,
 * and a list of all unlocked and pending achievements.
 */
export const AchievementsPage: React.FC = () => {
  const achievements = useStore(s => s.achievements);
  const gamification = useStore(s => s.gamification);
  const students = useStore(s => s.students);
  const transactions = useStore(s => s.transactions);
  const settings = useStore(s => s.settings);
  
  const achievedList = achievements
    .filter(a => a.achieved)
    .sort((a,b) => new Date(b.dateAchieved || 0).getTime() - new Date(a.dateAchieved || 0).getTime());
  const pendingList = achievements.filter(a => !a.achieved);

  console.log("AchievementsPage render:", { total: achievements.length, achieved: achievedList.length, pending: pendingList.length });

  const totalEarned = useMemo(() => transactions
      .filter(t => t.status === PaymentStatus.Paid || t.status === PaymentStatus.Overpaid || t.status === PaymentStatus.PartiallyPaid)
      .reduce((sum, t) => sum + (t.amountPaid || 0), 0), [transactions]);

  const getAchievementHint = (id: AchievementId): string => {
    switch (id) {
        case AchievementId.FirstStudentAdded:
            return "Go to the Students page and add your first student profile.";
        case AchievementId.FirstPaymentLogged:
            return "Log a lesson or payment from the Transactions page.";
        case AchievementId.StudentRosterStarter:
            return `You currently have ${students.length} student(s). You need 5 to unlock this!`;
        case AchievementId.First100Earned:
            return `You've earned ${formatCurrency(totalEarned, settings?.currencySymbol)} so far. Earn ${formatCurrency(100, settings?.currencySymbol)} total to unlock.`;
        case AchievementId.DebtDemolisher:
            return "Find any 'Due' or 'Partially Paid' transactions and log payments to clear the outstanding balance.";
        case AchievementId.SevenDayStreak:
            return `You are currently on a ${gamification.streak}-day streak. Keep logging in every day!`;
        default:
            return "Keep using the app to unlock this achievement!";
    }
  };

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
      className="space-y-8 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50">Achievements & Badges</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your progress and unlock rewards as you grow your tutoring business. (Total: {achievements.length})</p>
      </div>
      
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <div className="flex flex-col sm:flex-row justify-around items-center text-center gap-8 sm:gap-4">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                  <Icon iconName="star" className="w-8 h-8 text-accent" />
                </div>
                <p className="text-4xl font-display font-bold text-gray-900 dark:text-white">{gamification.points}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Total Points</p>
            </div>
            <div className="hidden sm:block w-px h-24 bg-gray-200 dark:bg-white/10"></div>
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center mb-3">
                  <Icon iconName="academic-cap" className="w-8 h-8 text-primary dark:text-white" />
                </div>
                <p className="text-2xl font-display font-bold text-primary dark:text-white">{gamification.levelName}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Level {gamification.level}</p>
            </div>
            <div className="hidden sm:block w-px h-24 bg-gray-200 dark:bg-white/10"></div>
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <Icon iconName="sparkles" className="w-8 h-8 text-success" />
                </div>
                <p className="text-4xl font-display font-bold text-success">{achievedList.length} <span className="text-2xl text-gray-400">/ {achievements.length}</span></p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Unlocked</p>
            </div>
        </div>
      </Card>

      {achievedList.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon iconName="check-circle" className="w-6 h-6 text-success" />
            Unlocked Achievements
          </h2>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {achievedList.map(ach => (
              <motion.div key={ach.id} variants={itemVariants} className="p-6 bg-white dark:bg-primary-light rounded-3xl shadow-sm border border-success/30 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-colors"></div>
                <div className="mb-4"><Icon iconName={ach.icon as any} className="w-12 h-12 text-accent drop-shadow-sm" aria-label={ach.name} /></div>
                <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-1">{ach.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{ach.description}</p>
                {ach.dateAchieved && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                    <Icon iconName="calendar" className="w-3.5 h-3.5" />
                    {formatDate(ach.dateAchieved)}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {pendingList.length > 0 && (
        <div className="space-y-4 mt-12">
          <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon iconName="lock-closed" className="w-6 h-6 text-gray-400" />
            Locked Achievements
          </h2>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {pendingList.map(ach => (
              <motion.div key={ach.id} variants={itemVariants} className="p-6 bg-gray-50 dark:bg-primary/50 rounded-3xl border border-gray-200 dark:border-white/5 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-primary-light flex items-center justify-center mb-4 grayscale">
                  <Icon iconName={ach.icon as any} className="w-8 h-8" aria-label={ach.name} />
                </div>
                <h3 className="text-lg font-display font-semibold text-gray-700 dark:text-gray-300 mb-1">{ach.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow mb-4">{ach.description}</p>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                      <Icon iconName="information-circle" className="w-4 h-4 text-accent flex-shrink-0" />
                      <span><span className="font-semibold text-gray-700 dark:text-gray-300">Hint:</span> {getAchievementHint(ach.id)}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
      {achievements.length === 0 && (
        <Card className="text-center py-12 rounded-3xl border-0 shadow-sm bg-white dark:bg-primary-light">
          <p className="text-gray-500 dark:text-gray-400">No achievements defined yet.</p>
        </Card>
      )}
    </motion.div>
  );
};