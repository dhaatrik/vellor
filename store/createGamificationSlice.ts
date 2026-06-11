import { StateCreator } from 'zustand';
import { AppState, GamificationSlice } from './types';
import { TUTOR_RANK_LEVELS, INITIAL_GAMIFICATION_STATS, ACHIEVEMENTS_DEFINITIONS } from '../constants';
import { AchievementId, PaymentStatus, Transaction } from '../types';
import confetti from 'canvas-confetti';

const isTransactionOverdue = (t: Transaction, nowString: string, amountPaid: number): boolean => {
    const isDue = t.status === PaymentStatus.Due || (t.status === PaymentStatus.PartiallyPaid && amountPaid < (t.lessonFee || 0));
    if (!isDue) return false;

    // ⚡ Bolt Performance: Use direct string comparison for ISO 8601 dates to eliminate Date.parse()
    // overhead and intermediate object allocation during high-frequency loop checks.
    if (typeof t.date === 'string' && t.date < nowString) {
      return true;
    }

    return false;
};

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
      const yesterdayDate = new Date(now - 24 * 60 * 60 * 1000);
      const nowString = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`; // One day ago
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // ⚡ Bolt Performance: Pre-calculate current year/month strings for fast prefix matching
      const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      const dateCounts: Record<string, number> = {};
      const studentTxCounts: Record<string, number> = {};

      for (let i = 0; i < transactions.length; i++) {
          const t = transactions[i];
          const status = t.status;
          const amountPaid = t.amountPaid || 0;

          if (status === PaymentStatus.Paid || status === PaymentStatus.Overpaid || status === PaymentStatus.PartiallyPaid) {
              totalEarnedOverall += amountPaid;
              // ⚡ Bolt Performance: Use string prefix matching to avoid `new Date()` parsing inside the loop
              if (typeof t.date === 'string' && t.date.startsWith(currentMonthStr)) {
                  paidThisMonth += amountPaid;
              }
          }

          if (status === PaymentStatus.Paid) hasPaid = true;
          if (status === PaymentStatus.Overpaid) hasBonusEarned = true;

          if (!hasOverdue && isTransactionOverdue(t, nowString, amountPaid)) {
              hasOverdue = true;
          }

          if (!hasMarathonSession && (t.lessonDuration || 0) >= 180) hasMarathonSession = true;
          if (!hasHighTicket && amountPaid >= 150) hasHighTicket = true;

          if (!hasBusyBee) {
              // ⚡ Bolt Performance: Extract date prefix using substring rather than full parsing/splitting
              const dateStr = typeof t.date === 'string' ? t.date.substring(0, 10) : '';
              if (dateStr) {
                  const count = (dateCounts[dateStr] || 0) + 1;
                  dateCounts[dateStr] = count;
                  if (count >= 3) hasBusyBee = true;
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

          const type = s.tuition?.rateType;
          if (type === 'hourly') hasHourly = true;
          else if (type === 'per_lesson') hasPerLesson = true;
          else if (type === 'monthly') hasMonthly = true;

          // ⚡ Bolt Performance: Only parse subjects until we reach the threshold for the achievement
          if (s.tuition && Array.isArray(s.tuition.subjects) && uniqueSubjects.size < 3) {
              const subjects = s.tuition.subjects;
              for (let j = 0; j < subjects.length; j++) {
                  const sub = subjects[j];
                  if (typeof sub === 'string') {
                      uniqueSubjects.add(sub.toLowerCase().trim());
                  }
              }
          }

          // ⚡ Bolt Performance: Early break if all dependent achievements are already satisfied
          if (hasHourly && hasPerLesson && hasMonthly && uniqueSubjects.size >= 3) {
              break;
          }
      }

      const hasSubjectMaster = uniqueSubjects.size >= 3;
      const hasRateDiversifier = hasHourly && hasPerLesson && hasMonthly;

      // ⚡ Bolt Performance: Hoist new Date().toISOString() outside the loop
      // to avoid redundant memory allocations and ensure all achievements awarded in this batch share the exact same timestamp.
      const nowIso = new Date().toISOString();
      const updatedAchievements = new Array(state.achievements.length);

      for (let i = 0, len = state.achievements.length; i < len; i++) {
        const ach = state.achievements[i];
        if (ach.achieved) {
            updatedAchievements[i] = ach;
            continue;
        }

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
            updatedAchievements[i] = { ...ach, achieved: true, dateAchieved: nowIso };
        } else {
            updatedAchievements[i] = ach;
        }
      }
      
      if (changed) return { achievements: updatedAchievements };
      return {};
    });
  },
});
