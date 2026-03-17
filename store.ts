/**
 * @file store.ts
 * Rewritten with Zustand, localForage, and Web Crypto API.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import confetti from 'canvas-confetti';
import { Student, Transaction, GamificationStats, Achievement, AppSettings, Theme, StudentFormData, TransactionFormData, PaymentStatus, AchievementId, ToastMessage, Activity, IconName } from './types';
import { TUTOR_RANK_LEVELS, INITIAL_GAMIFICATION_STATS, ACHIEVEMENTS_DEFINITIONS, DEFAULT_CURRENCY_SYMBOL, DEFAULT_USER_NAME, POINTS_ALLOCATION } from './constants';
import { encryptObject, decryptObject } from './src/crypto';

// --- Encryption & Initialization ---

export let globalMasterKey: CryptoKey | null = null;
export const setGlobalMasterKey = (key: CryptoKey | null) => {
  globalMasterKey = key;
};

// Custom Storage Engine for Zustand Persist using localforage + encryption
const storageEngine = {
  getItem: async (name: string): Promise<string | null> => {
    const raw = await localforage.getItem<string>(name);
    if (!raw) return null;
    
    // If we have a master key unlocked, decrypt it. Otherwise, return null (skip hydration until unlocked).
    if (globalMasterKey) {
      try {
        const obj = await decryptObject(raw, globalMasterKey);
        return JSON.stringify(obj);
      } catch (error) {
        console.error("Decryption failed", error);
        throw error; // Let Zustand handle/fail
      }
    }
    // Return a dummy state so Zustand knows it has data but waits? 
    // Actually, if we skip hydration, we shouldn't trigger getItem until rehydrate is called.
    return null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (globalMasterKey) {
      const obj = JSON.parse(value);
      const encrypted = await encryptObject(obj, globalMasterKey);
      await localforage.setItem(name, encrypted);
    } else {
      // Fallback for unencrypted export? Or error?
      await localforage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  }
};

// --- Helpers ---

const sanitizeString = (str: string | undefined): string => {
  if (str === undefined) return '';
  return str.replace(/<[^>]*>/g, '');
};

// We don't need DataContextType strictly on the store because derived derived state is exported separately.
// But we can implement the core state & actions.
export interface AppState {
  students: Student[];
  transactions: Transaction[];
  gamification: GamificationStats;
  achievements: Achievement[];
  settings: AppSettings;
  toasts: ToastMessage[];
  activityLog: Activity[];

  // Actions
  addToast: (message: string, type?: ToastMessage['type']) => void;
  logActivity: (message: string, icon: IconName) => void;
  deleteActivity: (id: string) => void;
  clearActivityLog: () => void;
  
  addPoints: (pointsToAdd: number, reason?: string) => void;
  checkAndAwardAchievements: () => void;

  addStudent: (studentData: StudentFormData) => Student;
  updateStudent: (studentId: string, studentData: Partial<StudentFormData>) => Student | undefined;
  deleteStudent: (studentId: string) => void;
  getStudentById: (studentId: string) => Student | undefined;

  addTransaction: (transactionData: TransactionFormData) => Transaction;
  updateTransaction: (transactionId: string, transactionData: Partial<TransactionFormData>) => Transaction | undefined;
  deleteTransaction: (transactionId: string) => void;
  getTransactionsByStudent: (studentId: string) => Transaction[];

  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleTheme: () => void;

  exportData: () => void;
  importData: (file: File) => Promise<void>;
  resetData: () => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      students: [],
      transactions: [],
      gamification: INITIAL_GAMIFICATION_STATS,
      achievements: ACHIEVEMENTS_DEFINITIONS.map(a => ({...a, achieved: false })),
      settings: {
        theme: Theme.Dark,
        currencySymbol: DEFAULT_CURRENCY_SYMBOL,
        userName: DEFAULT_USER_NAME,
        country: 'United States',
        phone: { countryCode: '+1', number: '' },
        email: '',
        monthlyGoal: 500,
      },
      toasts: [],
      activityLog: [],

      addToast: (message, type = 'info') => {
        const id = crypto.randomUUID();
        set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
          set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
        }, 4000);
      },

      logActivity: (message, icon) => {
        const newActivity: Activity = {
          id: crypto.randomUUID(),
          message,
          icon,
          timestamp: new Date().toISOString(),
        };
        set(state => ({ activityLog: [newActivity, ...state.activityLog.slice(0, 19)] }));
      },

      deleteActivity: (id) => {
        set(state => ({ activityLog: state.activityLog.filter(a => a.id !== id) }));
      },

      clearActivityLog: () => set({ activityLog: [] }),

      addPoints: (pointsToAdd, reason) => {
        const state = get();
        const newPoints = state.gamification.points + pointsToAdd;
        let newLevel = state.gamification.level;
        let newLevelName = state.gamification.levelName;

        for (let i = TUTOR_RANK_LEVELS.length - 1; i >= 0; i--) {
          if (newPoints >= TUTOR_RANK_LEVELS[i].points) {
            newLevel = i + 1;
            newLevelName = TUTOR_RANK_LEVELS[i].name;
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
                    const totalEarnedOverall = transactions
                        .filter(t => t.status === PaymentStatus.Paid || t.status === PaymentStatus.Overpaid || t.status === PaymentStatus.PartiallyPaid)
                        .reduce((sum, t) => sum + (t.amountPaid || 0), 0);
                    if (ach.id === AchievementId.First100Earned && totalEarnedOverall >= 100) justAchieved = true;
                    if (ach.id === AchievementId.First1000Earned && totalEarnedOverall >= 1000) justAchieved = true;
                    if (ach.id === AchievementId.First5000Earned && totalEarnedOverall >= 5000) justAchieved = true;
                    break;
                case AchievementId.DebtDemolisher:
                    const currentOverdue = transactions.filter(t => {
                        const isDue = t.status === PaymentStatus.Due || (t.status === PaymentStatus.PartiallyPaid && (t.amountPaid || 0) < (t.lessonFee || 0));
                        try {
                            return isDue && (new Date().getTime() - new Date(t.date).getTime()) > 24 * 60 * 60 * 1000;
                        } catch (e) { return false; }
                    });
                    if (currentOverdue.length === 0 && transactions.some(t => t.status === PaymentStatus.Paid)) justAchieved = true;
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
                    if (settings?.userName !== DEFAULT_USER_NAME && settings?.email && settings?.phone?.number) justAchieved = true;
                    break;
                case AchievementId.FirstGoalMet:
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    const paidThisMonth = transactions
                        .filter(t => {
                            try {
                                const d = new Date(t.date);
                                return d.getMonth() === currentMonth && d.getFullYear() === currentYear && (t.status === PaymentStatus.Paid || t.status === PaymentStatus.PartiallyPaid || t.status === PaymentStatus.Overpaid);
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
                    const dateCounts = transactions.reduce((acc, t) => {
                        try {
                            const dateStr = new Date(t.date).toISOString().split('T')[0];
                            acc[dateStr] = (acc[dateStr] || 0) + 1;
                        } catch (e) { }
                        return acc;
                    }, {} as Record<string, number>);
                    if (Object.values(dateCounts).some(count => count >= 3)) justAchieved = true;
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
                    const studentTxCounts = transactions.reduce((acc, t) => {
                        if (t.studentId) acc[t.studentId] = (acc[t.studentId] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>);
                    if (Object.values(studentTxCounts).some(count => count >= 10)) justAchieved = true;
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
                    const rateTypes = new Set(students.map(s => s.tuition?.rateType).filter(Boolean));
                    if (rateTypes.has('hourly') && rateTypes.has('per_lesson') && rateTypes.has('monthly')) justAchieved = true;
                    break;
            }

            if (justAchieved) {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
                });
                // We call get() inside loops or avoid it, but here we can just do:
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

      addStudent: (studentData) => {
        const sanitizedStudentData: StudentFormData = {
          ...studentData,
          firstName: sanitizeString(studentData.firstName),
          lastName: sanitizeString(studentData.lastName),
          country: sanitizeString(studentData.country),
          parent: {
            ...studentData.parent,
            name: sanitizeString(studentData.parent?.name),
            relationship: studentData.parent?.relationship ?? 'Parent',
          },
          contact: {
            ...studentData.contact,
            email: sanitizeString(studentData.contact?.email),
            studentPhone: studentData.contact?.studentPhone ? { ...studentData.contact.studentPhone, number: sanitizeString(studentData.contact.studentPhone.number) } : undefined,
            parentPhone1: studentData.contact?.parentPhone1 ? { ...studentData.contact.parentPhone1, number: sanitizeString(studentData.contact.parentPhone1.number) } : undefined,
            parentPhone2: studentData.contact?.parentPhone2 ? { ...studentData.contact.parentPhone2, number: sanitizeString(studentData.contact.parentPhone2.number) } : undefined,
          },
          notes: sanitizeString(studentData.notes),
          tuition: {
            ...studentData.tuition,
            subjects: studentData.tuition.subjects.map(subject => sanitizeString(subject)),
          }
        };
        const newStudent: Student = {
          ...sanitizedStudentData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({ students: [...state.students, newStudent] }));
        get().addPoints(POINTS_ALLOCATION.ADD_STUDENT, `Added new student: ${newStudent.firstName}`);
        get().addToast(`Student "${newStudent.firstName} ${newStudent.lastName}" added successfully.`, 'success');
        get().logActivity(`Added student: ${newStudent.firstName} ${newStudent.lastName}`, 'user');
        get().checkAndAwardAchievements();
        return newStudent;
      },

      updateStudent: (studentId, studentData) => {
        let updatedStudent: Student | undefined;

        set(state => {
          const newStudents = state.students.map(s => {
            if (s.id === studentId) {
              const studentToUpdate = { ...s };

              if (studentData.firstName !== undefined) studentToUpdate.firstName = sanitizeString(studentData.firstName);
              if (studentData.lastName !== undefined) studentToUpdate.lastName = sanitizeString(studentData.lastName);
              if (studentData.notes !== undefined) studentToUpdate.notes = sanitizeString(studentData.notes);
              if (studentData.country !== undefined) studentToUpdate.country = sanitizeString(studentData.country);

              if (studentData.parent) {
                const existingParent = studentToUpdate.parent || { name: '', relationship: '' };
                const updatedParentData = { ...existingParent, ...studentData.parent };
                if (studentData.parent.name !== undefined) {
                  updatedParentData.name = sanitizeString(studentData.parent.name);
                }
                studentToUpdate.parent = updatedParentData;
              }

              if (studentData.contact) {
                const updatedContactData = { ...studentToUpdate.contact, ...studentData.contact };
                if (studentData.contact.email !== undefined) updatedContactData.email = sanitizeString(studentData.contact.email);
                
                if (studentData.contact.studentPhone && updatedContactData.studentPhone) {
                    updatedContactData.studentPhone.number = sanitizeString(updatedContactData.studentPhone.number);
                }
                if (studentData.contact.parentPhone1 && updatedContactData.parentPhone1) {
                    updatedContactData.parentPhone1.number = sanitizeString(updatedContactData.parentPhone1.number);
                }
                if (studentData.contact.parentPhone2 && updatedContactData.parentPhone2) {
                    updatedContactData.parentPhone2.number = sanitizeString(updatedContactData.parentPhone2.number);
                }
                
                studentToUpdate.contact = updatedContactData;
              }

              if (studentData.tuition) {
                 const updatedTuitionData = { ...studentToUpdate.tuition, ...studentData.tuition };
                 if (studentData.tuition.subjects !== undefined) {
                    updatedTuitionData.subjects = studentData.tuition.subjects.map(subject => sanitizeString(subject));
                 }
                 studentToUpdate.tuition = updatedTuitionData;
              }

              updatedStudent = studentToUpdate;
              return updatedStudent;
            }
            return s;
          });
          return { students: newStudents };
        });

        if (updatedStudent) {
            get().addToast(`Student "${updatedStudent.firstName}" updated.`, 'success');
        }
        return updatedStudent;
      },

      deleteStudent: (studentId) => {
        const state = get();
        const studentToDelete = state.students.find(s => s.id === studentId);
        set(state => ({
          students: state.students.filter(s => s.id !== studentId),
          transactions: state.transactions.filter(t => t.studentId !== studentId)
        }));
        if (studentToDelete) {
            get().addToast(`Student "${studentToDelete.firstName}" and their transactions have been deleted.`, 'info');
        }
      },

      getStudentById: (studentId) => {
        return get().students.find(s => s.id === studentId);
      },

      addTransaction: (transactionData) => {
        const sanitizedTransactionData: TransactionFormData = {
          ...transactionData,
          paymentMethod: sanitizeString(transactionData.paymentMethod),
          notes: sanitizeString(transactionData.notes),
        };

        let status: PaymentStatus;
        if (sanitizedTransactionData.amountPaid >= sanitizedTransactionData.lessonFee) {
          status = sanitizedTransactionData.amountPaid > sanitizedTransactionData.lessonFee ? PaymentStatus.Overpaid : PaymentStatus.Paid;
        } else if (sanitizedTransactionData.amountPaid > 0 && sanitizedTransactionData.amountPaid < sanitizedTransactionData.lessonFee) {
          status = PaymentStatus.PartiallyPaid;
        } else {
          status = PaymentStatus.Due;
        }

        const newTransaction: Transaction = {
          ...sanitizedTransactionData,
          id: crypto.randomUUID(),
          status,
          createdAt: new Date().toISOString(),
        };

        set(state => ({ transactions: [...state.transactions, newTransaction] }));
        
        get().addToast('Transaction logged successfully.', 'success');
        const studentName = get().getStudentById(newTransaction.studentId)?.firstName || 'a student';
        get().logActivity(`Logged transaction for ${studentName}`, 'banknotes');

        if (status === PaymentStatus.Paid || status === PaymentStatus.Overpaid) {
            get().addPoints(POINTS_ALLOCATION.LOG_PAYMENT_ON_TIME, `Logged payment for ${studentName}`);
        }

        const student = get().getStudentById(newTransaction.studentId);
        if(student && (status === PaymentStatus.Paid || status === PaymentStatus.Overpaid)){
            const studentTransactions = get().transactions.filter(t => t.studentId === newTransaction.studentId && t.id !== newTransaction.id);
            const wasOverdue = studentTransactions.some(t => t.status === PaymentStatus.Due || t.status === PaymentStatus.PartiallyPaid);
            if(wasOverdue){
                const totalDueForStudent = studentTransactions.reduce((acc, t) => {
                     if (t.status === PaymentStatus.Due) return acc + t.lessonFee;
                     if (t.status === PaymentStatus.PartiallyPaid) return acc + (t.lessonFee - t.amountPaid);
                     return acc;
                }, 0);
                if (totalDueForStudent - newTransaction.amountPaid <=0) {
                    get().addPoints(POINTS_ALLOCATION.CLEAR_OVERDUE, `Cleared overdue payment for ${student.firstName}`);
                }
            }
        }
        
        get().checkAndAwardAchievements();
        return newTransaction;
      },

      updateTransaction: (transactionId, transactionData) => {
         let updatedTransaction : Transaction | undefined;

         const sanitizedTransactionData: Partial<TransactionFormData> = { ...transactionData };
         if (transactionData.paymentMethod !== undefined) {
            sanitizedTransactionData.paymentMethod = sanitizeString(transactionData.paymentMethod);
         }
         if (transactionData.notes !== undefined) {
            sanitizedTransactionData.notes = sanitizeString(transactionData.notes);
         }

         set(state => {
           const newTransactions = state.transactions.map(t => {
            if (t.id === transactionId) {
                const originalStatus = t.status;
                const potentiallyUpdated = { ...t, ...sanitizedTransactionData };
                let newStatus = t.status;

                if (sanitizedTransactionData.amountPaid !== undefined || sanitizedTransactionData.lessonFee !== undefined) {
                    const fee = sanitizedTransactionData.lessonFee !== undefined ? sanitizedTransactionData.lessonFee : t.lessonFee;
                    const paid = sanitizedTransactionData.amountPaid !== undefined ? sanitizedTransactionData.amountPaid : t.amountPaid;
                    if (paid >= fee) {
                        newStatus = paid > fee ? PaymentStatus.Overpaid : PaymentStatus.Paid;
                    } else if (paid > 0 && paid < fee) {
                        newStatus = PaymentStatus.PartiallyPaid;
                    } else {
                        newStatus = PaymentStatus.Due;
                    }
                }
                updatedTransaction = { ...potentiallyUpdated, status: newStatus };
                
                if (originalStatus !== PaymentStatus.Paid && originalStatus !== PaymentStatus.Overpaid && (newStatus === PaymentStatus.Paid || newStatus === PaymentStatus.Overpaid)) {
                     setTimeout(() => get().addPoints(POINTS_ALLOCATION.LOG_PAYMENT_ON_TIME, `Updated transaction to Paid: ${updatedTransaction?.id}`), 0);
                }
                const student = get().getStudentById(updatedTransaction.studentId);
                if(student && (originalStatus === PaymentStatus.Due || originalStatus === PaymentStatus.PartiallyPaid) && (newStatus === PaymentStatus.Paid || newStatus === PaymentStatus.Overpaid)){
                     setTimeout(() => get().addPoints(POINTS_ALLOCATION.CLEAR_OVERDUE, `Cleared overdue status for transaction ${updatedTransaction?.id}`), 0);
                }

                return updatedTransaction;
            }
            return t;
           });
           return { transactions: newTransactions };
         });

         if (updatedTransaction) {
            get().addToast(`Transaction updated successfully.`, 'success');
            get().checkAndAwardAchievements();
         }
         return updatedTransaction;
      },

      deleteTransaction: (transactionId) => {
        set(state => ({ transactions: state.transactions.filter(t => t.id !== transactionId) }));
        get().addToast('Transaction deleted.', 'info');
      },

      getTransactionsByStudent: (studentId) => {
        return get().transactions.filter(t => t.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      updateSettings: (newSettings) => {
        const state = get();
        if (state.settings.userName === DEFAULT_USER_NAME && newSettings.userName && newSettings.userName !== DEFAULT_USER_NAME) {
            state.addPoints(POINTS_ALLOCATION.COMPLETE_PROFILE, "Completed profile setup!");
            state.logActivity('Completed profile setup', 'check-circle');
        }
        if (newSettings.phone) {
            newSettings.phone.number = sanitizeString(newSettings.phone.number);
        }
        if (newSettings.country) {
            newSettings.country = sanitizeString(newSettings.country);
        }
        set(s => ({ settings: { ...s.settings, ...newSettings } }));
        get().addToast('Settings saved successfully.', 'success');
        get().checkAndAwardAchievements();
        
        // Handle theme changing immediately
        if (newSettings.theme) {
            const root = window.document.documentElement;
            if (newSettings.theme === Theme.Dark) {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
        }
      },

      toggleTheme: () => {
        set(state => {
          const newTheme = state.settings.theme === Theme.Light ? Theme.Dark : Theme.Light;
          setTimeout(() => state.logActivity(`Switched to ${newTheme} mode`, newTheme === Theme.Dark ? 'moon' : 'sun'), 0);
          
          const root = window.document.documentElement;
          if (newTheme === Theme.Dark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }

          return { settings: { ...state.settings, theme: newTheme } };
        });
      },

      exportData: () => {
        try {
            const state = get();
            const dataToExport = { 
                students: state.students, 
                transactions: state.transactions, 
                gamification: state.gamification, 
                achievements: state.achievements, 
                settings: state.settings, 
                activityLog: state.activityLog 
            };
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vellor_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Mark last backup date in localStorage for the "Automated Backup Prompts" feature
            localStorage.setItem('lastBackupDate', new Date().toISOString());
            
            get().addToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error("Failed to export data:", error);
            get().addToast('Failed to export data.', 'error');
        }
      },

      importData: async (file: File) => {
        if (!file) { get().addToast('No file selected for import.', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result;
                if (typeof result !== 'string') { throw new Error('File could not be read.'); }
                const data = JSON.parse(result);
                if (
                    data &&
                    typeof data === 'object' &&
                    Array.isArray(data.students) &&
                    Array.isArray(data.transactions) &&
                    data.settings &&
                    typeof data.settings === 'object'
                ) {
                    set({
                        students: data.students,
                        transactions: data.transactions,
                        settings: data.settings,
                        ...(data.gamification && { gamification: data.gamification }),
                        ...(data.achievements && { achievements: data.achievements }),
                        ...(data.activityLog && { activityLog: data.activityLog })
                    });
                    get().addToast('Data imported successfully! The app will reload.', 'success');
                    setTimeout(() => window.location.reload(), 2000);
                } else { throw new Error('Invalid data structure in JSON file.'); }
            } catch (error) {
                console.error("Failed to import data:", error);
                get().addToast(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
            }
        };
        reader.onerror = () => { get().addToast('Error reading file.', 'error'); };
        reader.readAsText(file);
      },

      resetData: () => {
        set({
            students: [],
            transactions: [],
            gamification: INITIAL_GAMIFICATION_STATS,
            achievements: ACHIEVEMENTS_DEFINITIONS.map(a => ({...a, achieved: false })),
            settings: {
                theme: Theme.Dark, currencySymbol: DEFAULT_CURRENCY_SYMBOL, userName: DEFAULT_USER_NAME,
                country: 'United States',
                phone: { countryCode: '+1', number: '' }, email: '',
                monthlyGoal: 500,
            },
            activityLog: []
        });
        get().addToast('All application data has been reset.', 'info');
        setTimeout(() => window.location.reload(), 1500);
      },

      logout: () => {
        set(state => ({
            settings: {
                ...state.settings,
                userName: DEFAULT_USER_NAME,
                email: '',
            }
        }));
        get().addToast('Logged out successfully.', 'info');
      }

    }),
    {
      name: 'vellor-storage',
      storage: createJSONStorage(() => storageEngine),
      skipHydration: true, // We will manually hydrate when Master Password is provided
    }
  )
);

// We define a hook to retrieve derived stats seamlessly.
// We map state manually using selectors so we don't recalculate unless raw data changes.
// Or we can just compute it when accessed. Since this is an app improvement over context,
// we will expose a robust derived state hook:
export const useDerivedData = () => {
  const transactions = useStore(state => state.transactions);
  const students = useStore(state => state.students);
  
  const totalUnpaid = transactions.reduce((acc, t) => {
    if (t.status === PaymentStatus.Due) return acc + t.lessonFee;
    if (t.status === PaymentStatus.PartiallyPaid) return acc + (t.lessonFee - t.amountPaid);
    return acc;
  }, 0);

  const totalPaidThisMonth = transactions.reduce((acc, t) => {
    const transactionDate = new Date(t.date);
    const today = new Date();
    if (
      transactionDate.getFullYear() === today.getFullYear() &&
      transactionDate.getMonth() === today.getMonth() &&
      (t.status === PaymentStatus.Paid || t.status === PaymentStatus.PartiallyPaid || t.status === PaymentStatus.Overpaid)
    ) {
      return acc + t.amountPaid;
    }
    return acc;
  }, 0);

  const activeStudentsCount = students.length;

  const overduePayments = transactions.filter(t => {
    const isOverdueStatus = t.status === PaymentStatus.Due || (t.status === PaymentStatus.PartiallyPaid && t.amountPaid < t.lessonFee);
    const today = new Date();
    today.setHours(0,0,0,0); 
    return isOverdueStatus && new Date(t.date) < today;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    totalUnpaid,
    totalPaidThisMonth,
    activeStudentsCount,
    overduePayments
  };
};

export const useData = Object.assign(useStore, {
  derived: useDerivedData
});
