import { StateCreator } from 'zustand';
import { AppState, GamificationSlice } from './types';
import { TUTOR_RANK_LEVELS, INITIAL_GAMIFICATION_STATS, ACHIEVEMENTS_DEFINITIONS } from '../constants';
import { AchievementId, PaymentStatus } from '../types';
import confetti from 'canvas-confetti';

export const createGamificationSlice: StateCreator<AppState, [], [], GamificationSlice> = (set, get) => ({
  gamification: INITIAL_GAMIFICATION_STATS,
  achievements: ACHIEVEMENTS_DEFINITIONS.map(a => ({...a, achieved: false })),

  addPoints: (pointsToAdd, reason) => {
    const state = get();
    const newPoints = state.gamification.points + pointsToAdd;
    let newLevel = state.gamification.level;
    let newLevelName = state.gamification.levelName;

    for (let i = TUTOR_RANK_LEVELS.length - 1; i >= 0; i--) {
      if (newPoints >= TUTOR_RANK_LEVELS[i].points) {
        newLevel = i + 1;
        const customTitles = get().settings?.customRankTitles;
        newLevelName = (customTitles && customTitles[i]) ? customTitles[i] : TUTOR_RANK_LEVELS[i].name;
        break;
      }
    }
    
    if (reason) {
      state.addToast(`+${pointsToAdd} points: ${reason}`, 'success');
    }

    set(s => ({
      gamification: {
        ...s.gamification,
        points: newPoints,
        level: newLevel,
        levelName: newLevelName
      }
    }));
  },

  checkAndAwardAchievements: () => {
    set(state => {
      let changed = false;
      const { students, transactions, gamification, settings } = state;
      
      // ⚡ Bolt Performance: Pre-calculate metrics outside the loop (O(N + M) instead of O(Achievements * (N + M)))
      let totalEarnedOverall = 0;
      let paidThisMonth = 0;
      let hasOverdue = false;
      let hasPaid = false;
      let hasMarathonSession = false;
      let hasBonusEarned = false;
      let hasHighTicket = false;
      let hasBusyBee = false;
      let hasLoyalScholar = false;

      const now = Date.now();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const dateCounts: Record<string, number> = {};
      const studentTxCounts: Record<string, number> = {};

      for (let i = 0; i < transactions.length; i++) {
          const t = transactions[i];
          const status = t.status;
          const amountPaid = t.amountPaid || 0;

          if (status === PaymentStatus.Paid || status === PaymentStatus.Overpaid || status === PaymentStatus.PartiallyPaid) {
              totalEarnedOverall += amountPaid;
              try {
                  const d = new Date(t.date);
                  if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                      paidThisMonth += amountPaid;
                  }
              } catch (e) {
                  console.error('Failed to parse transaction date for monthly stats:', e);
              }
          }

          if (status === PaymentStatus.Paid) hasPaid = true;
          if (status === PaymentStatus.Overpaid) hasBonusEarned = true;

          if (!hasOverdue) {
              const isDue = status === PaymentStatus.Due || (status === PaymentStatus.PartiallyPaid && amountPaid < (t.lessonFee || 0));
              if (isDue) {
                  try {
                      const txDateMs = typeof t.date === 'number' ? t.date : (typeof t.date === 'string' ? Date.parse(t.date) : new Date(t.date).getTime());
                      if (!isNaN(txDateMs) && (now - txDateMs) > 24 * 60 * 60 * 1000) {
                          hasOverdue = true;
                      }
                  } catch (e) {
                      console.error('Failed to parse transaction date for overdue check:', e);
                  }
              }
          }

          if (!hasMarathonSession && (t.lessonDuration || 0) >= 180) hasMarathonSession = true;
          if (!hasHighTicket && amountPaid >= 150) hasHighTicket = true;

          if (!hasBusyBee) {
              try {
                  const dateStr = typeof t.date === 'string' ? t.date.split('T')[0] : new Date(t.date).toISOString().split('T')[0];
                  const count = (dateCounts[dateStr] || 0) + 1;
                  dateCounts[dateStr] = count;
                  if (count >= 3) hasBusyBee = true;
              } catch (e) {
                  console.error('Failed to parse transaction date for BusyBee check:', e);
              }
          }

          if (!hasLoyalScholar) {
              const sid = t.studentId;
              if (sid) {
                  const count = (studentTxCounts[sid] || 0) + 1;
                  studentTxCounts[sid] = count;
                  if (count >= 10) hasLoyalScholar = true;
              }
          }
      }

      const uniqueSubjects = new Set<string>();
      let hasHourly = false, hasPerLesson = false, hasMonthly = false;

      for (let i = 0; i < students.length; i++) {
          const s = students[i];
          if (s.tuition && Array.isArray(s.tuition.subjects)) {
              s.tuition.subjects.forEach(sub => {
                  if (typeof sub === 'string') uniqueSubjects.add(sub.toLowerCase().trim());
              });
          }

          const type = s.tuition?.rateType;
          if (type === 'hourly') hasHourly = true;
          else if (type === 'per_lesson') hasPerLesson = true;
          else if (type === 'monthly') hasMonthly = true;
      }

      const hasSubjectMaster = uniqueSubjects.size >= 3;
      const hasRateDiversifier = hasHourly && hasPerLesson && hasMonthly;

      const updatedAchievements = state.achievements.map(ach => {
        if (ach.achieved) return ach;

        let justAchieved = false;
        switch (ach.id) {
            case AchievementId.FirstStudentAdded:
                if (students.length > 0) justAchieved = true;
                break;
            case AchievementId.StudentRosterStarter:
                if (students.length >= 5) justAchieved = true;
                break;
            case AchievementId.TenStudentsEnrolled:
                if (students.length >= 10) justAchieved = true;
                break;
            case AchievementId.TwentyFiveStudentsEnrolled:
                if (students.length >= 25) justAchieved = true;
                break;
            case AchievementId.FiftyStudentsEnrolled:
                if (students.length >= 50) justAchieved = true;
                break;
            case AchievementId.FirstPaymentLogged:
                if (transactions.length > 0) justAchieved = true;
                break;
            case AchievementId.TenPaymentsLogged:
                if (transactions.length >= 10) justAchieved = true;
                break;
            case AchievementId.FiftyPaymentsLogged:
                if (transactions.length >= 50) justAchieved = true;
                break;
            case AchievementId.First100Earned:
                if (totalEarnedOverall >= 100) justAchieved = true;
                break;
            case AchievementId.First1000Earned:
                if (totalEarnedOverall >= 1000) justAchieved = true;
                break;
            case AchievementId.First5000Earned:
                if (totalEarnedOverall >= 5000) justAchieved = true;
                break;
            case AchievementId.DebtDemolisher:
                if (!hasOverdue && hasPaid) justAchieved = true;
                break;
            case AchievementId.SevenDayStreak:
                if (gamification.streak >= 7) justAchieved = true;
                break;
            case AchievementId.ThirtyDayStreak:
                if (gamification.streak >= 30) justAchieved = true;
                break;
            case AchievementId.HundredDayStreak:
                if (gamification.streak >= 100) justAchieved = true;
                break;
            case AchievementId.ProfileCompleted:
                if (settings?.userName !== 'Tutor' && settings?.email && settings?.phone?.number) justAchieved = true;
                break;
            case AchievementId.FirstGoalMet:
                if (paidThisMonth >= (settings?.monthlyGoal || 500) && (settings?.monthlyGoal || 500) > 0) justAchieved = true;
                break;
            case AchievementId.MarathonSession:
                if (hasMarathonSession) justAchieved = true;
                break;
            case AchievementId.BonusEarned:
                if (hasBonusEarned) justAchieved = true;
                break;
            case AchievementId.BusyBee:
                if (hasBusyBee) justAchieved = true;
                break;
            case AchievementId.SubjectMaster:
                if (hasSubjectMaster) justAchieved = true;
                break;
            case AchievementId.LoyalScholar:
                if (hasLoyalScholar) justAchieved = true;
                break;
            case AchievementId.HighTicket:
                if (hasHighTicket) justAchieved = true;
                break;
            case AchievementId.LevelFive:
                if ((gamification?.level || 1) >= 5) justAchieved = true;
                break;
            case AchievementId.CenturyClub:
                if (transactions.length >= 100) justAchieved = true;
                break;
            case AchievementId.RateDiversifier:
                if (hasRateDiversifier) justAchieved = true;
                break;
        }

        if (justAchieved) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
            });
            setTimeout(() => {
              get().addToast(`Achievement Unlocked: ${ach.name}!`, 'success');
              get().logActivity(`Unlocked: ${ach.name}`, 'trophy');
            }, 0);
            changed = true;
            return { ...ach, achieved: true, dateAchieved: new Date().toISOString() };
        }
        return ach;
      });
      
      if (changed) return { achievements: updatedAchievements };
      return {};
    });
  },
});
