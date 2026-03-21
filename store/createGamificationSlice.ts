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
            case AchievementId.First1000Earned:
            case AchievementId.First5000Earned:
                const totalEarnedOverall = transactions.reduce((sum, t) => {
                    if (t.status === PaymentStatus.Paid || t.status === PaymentStatus.Overpaid || t.status === PaymentStatus.PartiallyPaid) {
                        return sum + (t.amountPaid || 0);
                    }
                    return sum;
                }, 0);
                if (ach.id === AchievementId.First100Earned && totalEarnedOverall >= 100) justAchieved = true;
                if (ach.id === AchievementId.First1000Earned && totalEarnedOverall >= 1000) justAchieved = true;
                if (ach.id === AchievementId.First5000Earned && totalEarnedOverall >= 5000) justAchieved = true;
                break;
            case AchievementId.DebtDemolisher:
                const now = Date.now();
                const hasOverdue = transactions.some(t => {
                    const isDue = t.status === PaymentStatus.Due || (t.status === PaymentStatus.PartiallyPaid && (t.amountPaid || 0) < (t.lessonFee || 0));
                    if (!isDue) return false;
                    try {
                        const txDateMs = typeof t.date === 'number' ? t.date : (typeof t.date === 'string' ? Date.parse(t.date) : new Date(t.date).getTime());
                        if (isNaN(txDateMs)) return false;
                        return (now - txDateMs) > 24 * 60 * 60 * 1000;
                    } catch (e) { return false; }
                });

                if (!hasOverdue && transactions.some(t => t.status === PaymentStatus.Paid)) {
                    justAchieved = true;
                }
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
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const paidThisMonth = transactions
                    .filter(t => {
                        if (t.status !== PaymentStatus.Paid && t.status !== PaymentStatus.PartiallyPaid && t.status !== PaymentStatus.Overpaid) return false;
                        try {
                            const d = new Date(t.date);
                            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                        } catch (e) { return false; }
                    })
                    .reduce((sum, t) => sum + (t.amountPaid || 0), 0);
                if (paidThisMonth >= (settings?.monthlyGoal || 500) && (settings?.monthlyGoal || 500) > 0) justAchieved = true;
                break;
            case AchievementId.MarathonSession:
                if (transactions.some(t => (t.lessonDuration || 0) >= 180)) justAchieved = true;
                break;
            case AchievementId.BonusEarned:
                if (transactions.some(t => t.status === PaymentStatus.Overpaid)) justAchieved = true;
                break;
            case AchievementId.BusyBee:
                const dateCounts: Record<string, number> = {};
                for (let i = 0; i < transactions.length; i++) {
                    try {
                        const t = transactions[i];
                        const dateStr = new Date(t.date).toISOString().split('T')[0];
                        const count = (dateCounts[dateStr] || 0) + 1;
                        dateCounts[dateStr] = count;
                        if (count >= 3) {
                            justAchieved = true;
                            break;
                        }
                    } catch (e) { }
                }
                break;
            case AchievementId.SubjectMaster:
                const uniqueSubjects = new Set<string>();
                students.forEach(s => {
                    if (s.tuition && Array.isArray(s.tuition.subjects)) {
                        s.tuition.subjects.forEach(sub => {
                            if (typeof sub === 'string') uniqueSubjects.add(sub.toLowerCase().trim());
                        });
                    }
                });
                if (uniqueSubjects.size >= 3) justAchieved = true;
                break;
            case AchievementId.LoyalScholar:
                const studentTxCounts: Record<string, number> = {};
                for (let i = 0; i < transactions.length; i++) {
                    const sid = transactions[i].studentId;
                    if (sid) {
                        const count = (studentTxCounts[sid] || 0) + 1;
                        studentTxCounts[sid] = count;
                        if (count >= 10) {
                            justAchieved = true;
                            break;
                        }
                    }
                }
                break;
            case AchievementId.HighTicket:
                if (transactions.some(t => (t.amountPaid || 0) >= 150)) justAchieved = true;
                break;
            case AchievementId.LevelFive:
                if ((gamification?.level || 1) >= 5) justAchieved = true;
                break;
            case AchievementId.CenturyClub:
                if (transactions.length >= 100) justAchieved = true;
                break;
            case AchievementId.RateDiversifier:
                let hasHourly = false, hasPerLesson = false, hasMonthly = false;
                for (let i = 0; i < students.length; i++) {
                    const type = students[i].tuition?.rateType;
                    if (type === 'hourly') hasHourly = true;
                    else if (type === 'per_lesson') hasPerLesson = true;
                    else if (type === 'monthly') hasMonthly = true;

                    if (hasHourly && hasPerLesson && hasMonthly) {
                        justAchieved = true;
                        break;
                    }
                }
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
