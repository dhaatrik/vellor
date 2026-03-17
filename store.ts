
/**
 * @file store.ts
 * This file defines the central data store and context for the Vellor application.
 * It uses React Context API and a custom localStorage hook to manage and persist application state,
 * including students, transactions, gamification data, and settings.
 */

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Student, Transaction, GamificationStats, Achievement, AppSettings, Theme, StudentFormData, TransactionFormData, PaymentStatus, AchievementId, DataContextType, ToastMessage, Activity, IconName } from './types';
import { TUTOR_RANK_LEVELS, INITIAL_GAMIFICATION_STATS, ACHIEVEMENTS_DEFINITIONS, DEFAULT_CURRENCY_SYMBOL, DEFAULT_USER_NAME, POINTS_ALLOCATION } from './constants';

/**
 * Encrypts data by converting it to a JSON string and then encoding it in Base64.
 * This provides a simple way to obfuscate localStorage data.
 *
 * @param {*} data - The data to be encrypted (should be JSON-serializable).
 * @returns {string} The Base64 encoded string.
 */
const encryptData = (data: any): string => {
  try {
    const stringifiedData = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(stringifiedData))); // Handles UTF-8 characters before Base64 encoding
  } catch (error) {
    console.error("Error encrypting data:", error);
    return ""; // Return empty string or handle error as appropriate
  }
};

/**
 * Decrypts a Base64 encoded string back into its original data structure.
 * It includes a fallback to parse plaintext JSON for backward compatibility.
 *
 * @param {(string | null)} encryptedData - The Base64 string to decrypt.
 * @param {*} initialValue - The value to return if decryption fails.
 * @returns {*} The decrypted data or the initial value.
 */
const decryptData = (encryptedData: string | null, initialValue: any): any => {
  if (encryptedData === null) return initialValue;
  try {
    const decodedData = decodeURIComponent(escape(atob(encryptedData))); // Handles UTF-8 characters after Base64 decoding
    return JSON.parse(decodedData);
  } catch (error) {
    console.warn("Error decrypting data (might be unencrypted or corrupted):", error);
    // Attempt to parse as plaintext JSON (for migration)
    try {
      return JSON.parse(encryptedData);
    } catch (jsonError) {
      console.error("Error parsing data as plaintext JSON:", jsonError);
      return initialValue; // Fallback to initial value if all attempts fail
    }
  }
};

/**
 * A simple string sanitizer that removes HTML tags.
 * This is a basic security measure to prevent XSS attacks via input fields.
 *
 * @param {(string | undefined)} str - The string to sanitize.
 * @returns {string} The sanitized string with HTML tags removed.
 */
const sanitizeString = (str: string | undefined): string => {
  if (str === undefined) return '';
  return str.replace(/<[^>]*>/g, '');
};


/**
 * A custom React hook that synchronizes a state value with the browser's localStorage.
 * It retrieves the stored value on initialization (decrypting it) and persists
 * the new value to localStorage (encrypting it) whenever the state changes.
 *
 * @template T - The type of the value to be stored.
 * @param {string} key - The key under which the value is stored in localStorage.
 * @param {T} initialValue - The initial value to use if no value is found in localStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} A tuple containing the stateful value and a function to update it, similar to `useState`.
 */
const useLocalStorage = <T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Decrypt data or return initialValue
      return decryptData(item, initialValue);
    } catch (error) {
      // If error also return initialValue
      // DecryptData already logs errors, so this might be redundant or for other errors.
      console.error(`Error initializing localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
    try {
      setStoredValue((prevValue) => {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        // Encrypt and save to local storage
        const encryptedValue = encryptData(valueToStore);
        window.localStorage.setItem(key, encryptedValue);
        return valueToStore;
      });
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};

/**
 * React Context for providing application data and actions throughout the component tree.
 * @type {React.Context<DataContextType | undefined>}
 */
const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Provides a central data store for the entire application using React Context.
 * It manages state for students, transactions, settings, and gamification,
 * and persists this data to localStorage.
 *
 * @param {{ children: ReactNode }} props - The props object, containing the child components to be wrapped.
 * @returns {React.ReactElement} The `DataContext.Provider` wrapping the application.
 */
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State management using the useLocalStorage hook for persistence.
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [gamification, setGamification] = useLocalStorage<GamificationStats>('gamification', INITIAL_GAMIFICATION_STATS);
  // Ensure achievements are initialized with 'achieved: false' by mapping over definitions.
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('achievements', ACHIEVEMENTS_DEFINITIONS.map(a => ({...a, achieved: false })));
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', {
    theme: Theme.Dark, // Default theme
    currencySymbol: DEFAULT_CURRENCY_SYMBOL,
    userName: DEFAULT_USER_NAME,
    country: 'United States',
    phone: { countryCode: '+1', number: '' },
    email: '',
    monthlyGoal: 500,
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activityLog, setActivityLog] = useLocalStorage<Activity[]>('activityLog', []);

  // Ensure any newly added achievements in the code are merged into the user's stored achievements
  useEffect(() => {
    setAchievements(prevAchievements => {
      const existingIds = new Set(prevAchievements.map(a => a.id));
      const newAchievements = ACHIEVEMENTS_DEFINITIONS
        .filter(a => !existingIds.has(a.id))
        .map(a => ({ ...a, achieved: false }));
      
      console.log("Merging achievements:", { prevCount: prevAchievements.length, newCount: newAchievements.length });
      
      if (newAchievements.length > 0) {
        return [...prevAchievements, ...newAchievements];
      }
      return prevAchievements;
    });
  }, [setAchievements]);

  // Effect to apply the current theme (light/dark) to the HTML root element.
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === Theme.Dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  /**
   * Displays a toast notification message to the user.
   * The toast automatically disappears after a few seconds.
   *
   * @param {string} message - The message to display in the toast.
   * @param {'success' | 'error' | 'info'} [type='info'] - The type of toast, which affects its color and icon.
   */
  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    // Set a timer to remove the toast
    setTimeout(() => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 4000); // 4 seconds duration
  }, []);

   /**
   * Logs a new activity to the activity feed.
   *
   * @param {string} message - The message describing the activity.
   * @param {IconName} icon - The name of the icon to associate with the activity.
   */
  const logActivity = useCallback((message: string, icon: IconName) => {
    const newActivity: Activity = {
        id: crypto.randomUUID(),
        message,
        icon,
        timestamp: new Date().toISOString(),
    };
    setActivityLog(prev => [newActivity, ...prev.slice(0, 19)]); // Keep latest 20 activities
  }, [setActivityLog]);

  const deleteActivity = useCallback((id: string) => {
    setActivityLog(prev => prev.filter(activity => activity.id !== id));
  }, [setActivityLog]);

  const clearActivityLog = useCallback(() => {
    setActivityLog([]);
  }, [setActivityLog]);

  /**
   * Adds a specified number of points to the user's gamification stats and updates
   * their level and rank name if a new threshold is met.
   *
   * @param {number} pointsToAdd - The number of points to add.
   * @param {string} [reason] - An optional description for why the points were awarded.
   */
  const addPoints = useCallback((pointsToAdd: number, reason?: string) => {
    setGamification(prevStats => {
      const newPoints = prevStats.points + pointsToAdd;
      let newLevel = prevStats.level;
      let newLevelName = prevStats.levelName;

      // Determine new level based on points
      for (let i = TUTOR_RANK_LEVELS.length - 1; i >= 0; i--) {
        if (newPoints >= TUTOR_RANK_LEVELS[i].points) {
          newLevel = i + 1;
          newLevelName = TUTOR_RANK_LEVELS[i].name;
          break;
        }
      }
      
      if (reason) {
        addToast(`+${pointsToAdd} points: ${reason}`, 'success');
      }

      return { points: newPoints, level: newLevel, levelName: newLevelName, streak: prevStats.streak, lastActiveDate: prevStats.lastActiveDate };
    });
  }, [setGamification, addToast]); 

  // Effect to check and update the login streak on mount
  useEffect(() => {
    setGamification(prev => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      if (!prev.lastActiveDate) {
        // First time logging in
        return { ...prev, streak: 1, lastActiveDate: todayStr };
      }

      const lastActive = new Date(prev.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already logged in today
        return prev;
      } else if (diffDays === 1) {
        // Logged in yesterday, increment streak
        const newStreak = prev.streak + 1;
        if (newStreak % 7 === 0) {
           // Bonus points for a 7-day streak
           setTimeout(() => addPoints(50, `7-Day Streak Bonus!`), 1000);
        }
        return { ...prev, streak: newStreak, lastActiveDate: todayStr };
      } else {
        // Missed a day, reset streak
        return { ...prev, streak: 1, lastActiveDate: todayStr };
      }
    });
  }, [setGamification, addPoints]);

  /**
   * Checks if any achievements' conditions have been met based on the current
   * application state (e.g., number of students, total earnings) and updates
   * their status to 'achieved' if so.
   */
  const checkAndAwardAchievements = useCallback(() => {
    setAchievements(prevAchievements => {
        let changed = false; // Flag to avoid unnecessary re-renders if no achievements changed
        const updatedAchievements = prevAchievements.map(ach => {
            if (ach.achieved) return ach; // Skip already achieved ones

            let justAchieved = false; // Flag if this specific achievement is newly achieved
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
                    // Calculate total earnings from paid or partially paid transactions
                    const totalEarnedOverall = transactions
                        .filter(t => t.status === PaymentStatus.Paid || t.status === PaymentStatus.Overpaid || t.status === PaymentStatus.PartiallyPaid)
                        .reduce((sum, t) => sum + (t.amountPaid || 0), 0);
                    if (ach.id === AchievementId.First100Earned && totalEarnedOverall >= 100) justAchieved = true;
                    if (ach.id === AchievementId.First1000Earned && totalEarnedOverall >= 1000) justAchieved = true;
                    if (ach.id === AchievementId.First5000Earned && totalEarnedOverall >= 5000) justAchieved = true;
                    break;
                case AchievementId.DebtDemolisher:
                     // Check for any currently overdue payments (simplified: due and older than 1 day)
                    const currentOverdue = transactions.filter(t => {
                        const isDue = t.status === PaymentStatus.Due || (t.status === PaymentStatus.PartiallyPaid && (t.amountPaid || 0) < (t.lessonFee || 0));
                        try {
                            return isDue && (new Date().getTime() - new Date(t.date).getTime()) > 24 * 60 * 60 * 1000;
                        } catch (e) { return false; }
                    });
                    // Award if no overdue payments AND there was at least one payment to begin with
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
                        } catch (e) { /* ignore invalid dates */ }
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
                        if (t.studentId) {
                            acc[t.studentId] = (acc[t.studentId] || 0) + 1;
                        }
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
                addToast(`Achievement Unlocked: ${ach.name}!`, 'success');
                logActivity(`Unlocked: ${ach.name}`, 'trophy');
                changed = true;
                return { ...ach, achieved: true, dateAchieved: new Date().toISOString() };
            }
            return ach; // Return unchanged achievement
        });
        // Only return new array if something actually changed
        return changed ? updatedAchievements : prevAchievements;
    });
  }, [students, transactions, gamification.streak, gamification.level, setAchievements, addToast, logActivity, settings]); 

  // Effect to check for achievements whenever students or transactions lists change.
  useEffect(() => {
    checkAndAwardAchievements();
  }, [students, transactions, gamification.streak, gamification.level, settings, checkAndAwardAchievements]);


  // --- Student Operations ---

  const getStudentById = useCallback((studentId: string): Student | undefined => {
    return students.find(s => s.id === studentId);
  }, [students]);

  /**
   * Adds a new student to the application state after sanitizing input data.
   * Also awards points for the action.
   *
   * @param {StudentFormData} studentData - The data for the new student from the form.
   * @returns {Student} The newly created student object, including its generated ID and timestamp.
   */
  const addStudent = useCallback((studentData: StudentFormData): Student => {
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
      id: crypto.randomUUID(), // Generate a unique ID
      createdAt: new Date().toISOString(), // Timestamp creation
    };
    setStudents(prev => [...prev, newStudent]);
    addPoints(POINTS_ALLOCATION.ADD_STUDENT, `Added new student: ${newStudent.firstName}`);
    addToast(`Student "${newStudent.firstName} ${newStudent.lastName}" added successfully.`, 'success');
    logActivity(`Added student: ${newStudent.firstName} ${newStudent.lastName}`, 'user');
    return newStudent;
  }, [setStudents, addPoints, addToast, logActivity]);

  /**
   * Updates an existing student's details in the application state. It correctly merges nested objects
   * to prevent data loss during partial updates.
   *
   * @param {string} studentId - The ID of the student to update.
   * @param {Partial<StudentFormData>} studentData - An object containing the student fields to update.
   * @returns {Student | undefined} The updated student object, or undefined if the student was not found.
   */
  const updateStudent = useCallback((studentId: string, studentData: Partial<StudentFormData>): Student | undefined => {
    let updatedStudent: Student | undefined;

    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          // Start with a copy of the existing student
          const studentToUpdate = { ...s };

          // --- Sanitize and Apply Updates ---

          // Direct properties
          if (studentData.firstName !== undefined) studentToUpdate.firstName = sanitizeString(studentData.firstName);
          if (studentData.lastName !== undefined) studentToUpdate.lastName = sanitizeString(studentData.lastName);
          if (studentData.notes !== undefined) studentToUpdate.notes = sanitizeString(studentData.notes);
          if (studentData.country !== undefined) studentToUpdate.country = sanitizeString(studentData.country);

          // Nested 'parent' object: merge and sanitize
          if (studentData.parent) {
            const existingParent = studentToUpdate.parent || { name: '', relationship: '' };
            const updatedParentData = { ...existingParent, ...studentData.parent };
            if (studentData.parent.name !== undefined) {
              updatedParentData.name = sanitizeString(studentData.parent.name);
            }
            // To stick to the original's behavior, we don't sanitize 'relationship'.
            studentToUpdate.parent = updatedParentData;
          }

          // Nested 'contact' object: merge and sanitize
          if (studentData.contact) {
            const updatedContactData = { ...studentToUpdate.contact, ...studentData.contact };
            if (studentData.contact.email !== undefined) updatedContactData.email = sanitizeString(studentData.contact.email);
            
            // Sanitize the number part of any phone objects that were updated
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

          // Nested 'tuition' object: merge and sanitize
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
      })
    );
    if (updatedStudent) {
        addToast(`Student "${updatedStudent.firstName}" updated.`, 'success');
    }
    return updatedStudent; // Return the updated student for potential immediate use
  }, [setStudents, addToast]);
  
  /**
   * Deletes a student and all of their associated transactions from the application state.
   *
   * @param {string} studentId - The ID of the student to delete.
   */
  const deleteStudent = useCallback((studentId: string) => {
    const studentToDelete = getStudentById(studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    // Also remove transactions associated with this student
    setTransactions(prev => prev.filter(t => t.studentId !== studentId));
    if (studentToDelete) {
        addToast(`Student "${studentToDelete.firstName}" and their transactions have been deleted.`, 'info');
    }
  }, [setStudents, setTransactions, getStudentById, addToast]);

  // --- Transaction Operations ---

  /**
   * Adds a new transaction, calculates its payment status, and awards points if applicable.
   *
   * @param {TransactionFormData} transactionData - The data for the new transaction from the form.
   * @returns {Transaction} The newly created transaction object.
   */
  const addTransaction = useCallback((transactionData: TransactionFormData): Transaction => {
    const sanitizedTransactionData: TransactionFormData = {
      ...transactionData,
      paymentMethod: sanitizeString(transactionData.paymentMethod),
      notes: sanitizeString(transactionData.notes),
    };

    let status: PaymentStatus;
    // Determine payment status based on amount paid vs lesson fee
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
    setTransactions(prev => [...prev, newTransaction]);
    addToast('Transaction logged successfully.', 'success');
    const studentName = getStudentById(newTransaction.studentId)?.firstName || 'a student';
    logActivity(`Logged transaction for ${studentName}`, 'banknotes');

    // Award points if the payment was logged as fully or overpaid
    if (status === PaymentStatus.Paid || status === PaymentStatus.Overpaid) {
        addPoints(POINTS_ALLOCATION.LOG_PAYMENT_ON_TIME, `Logged payment for ${studentName}`);
    }
    // Award points if an overdue payment was cleared (simplified: if payment made for a "Due" item)
    const student = getStudentById(newTransaction.studentId);
    if(student && (status === PaymentStatus.Paid || status === PaymentStatus.Overpaid)){
        const studentTransactions = transactions.filter(t => t.studentId === newTransaction.studentId && t.id !== newTransaction.id);
        const wasOverdue = studentTransactions.some(t => t.status === PaymentStatus.Due || t.status === PaymentStatus.PartiallyPaid);
        if(wasOverdue){
            const totalDueForStudent = studentTransactions.reduce((acc, t) => {
                 if (t.status === PaymentStatus.Due) return acc + t.lessonFee;
                 if (t.status === PaymentStatus.PartiallyPaid) return acc + (t.lessonFee - t.amountPaid);
                 return acc;
            }, 0);
            if (totalDueForStudent - newTransaction.amountPaid <=0) { // Check if this payment clears outstanding
                addPoints(POINTS_ALLOCATION.CLEAR_OVERDUE, `Cleared overdue payment for ${student.firstName}`);
            }
        }
    }
    return newTransaction;
  }, [setTransactions, addToast, addPoints, getStudentById, transactions, logActivity]);

  /**
   * Updates an existing transaction's details and re-calculates its payment status.
   *
   * @param {string} transactionId - The ID of the transaction to update.
   * @param {Partial<TransactionFormData>} transactionData - An object with the transaction fields to update.
   * @returns {Transaction | undefined} The updated transaction object, or undefined if not found.
   */
  const updateTransaction = useCallback((transactionId: string, transactionData: Partial<TransactionFormData>): Transaction | undefined => {
     let updatedTransaction : Transaction | undefined;

     const sanitizedTransactionData: Partial<TransactionFormData> = { ...transactionData };
     if (transactionData.paymentMethod !== undefined) {
        sanitizedTransactionData.paymentMethod = sanitizeString(transactionData.paymentMethod);
     }
     if (transactionData.notes !== undefined) {
        sanitizedTransactionData.notes = sanitizeString(transactionData.notes);
     }

     setTransactions(prev => prev.map(t => {
        if (t.id === transactionId) {
            const originalStatus = t.status;
            const potentiallyUpdated = { ...t, ...sanitizedTransactionData };
            let newStatus = t.status; // Keep original status unless payment amounts change

            // Re-evaluate status if amountPaid or lessonFee was part of the update
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
            
            // Award points if payment status changes positively
            if (originalStatus !== PaymentStatus.Paid && originalStatus !== PaymentStatus.Overpaid && (newStatus === PaymentStatus.Paid || newStatus === PaymentStatus.Overpaid)) {
                 addPoints(POINTS_ALLOCATION.LOG_PAYMENT_ON_TIME, `Updated transaction to Paid: ${updatedTransaction.id}`);
            }
            // If an existing "Due" or "Partially Paid" transaction is now "Paid" or "Overpaid"
            const student = getStudentById(updatedTransaction.studentId);
            if(student && (originalStatus === PaymentStatus.Due || originalStatus === PaymentStatus.PartiallyPaid) && (newStatus === PaymentStatus.Paid || newStatus === PaymentStatus.Overpaid)){
                 addPoints(POINTS_ALLOCATION.CLEAR_OVERDUE, `Cleared overdue status for transaction ${updatedTransaction.id}`);
            }

            return updatedTransaction;
        }
        return t;
     }));

     if (updatedTransaction) {
        addToast(`Transaction updated successfully.`, 'success');
     }
     return updatedTransaction;
  }, [setTransactions, addToast, addPoints, getStudentById]);
  
  /**
   * Deletes a transaction from the application state.
   *
   * @param {string} transactionId - The ID of the transaction to delete.
   */
  const deleteTransaction = useCallback((transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    addToast('Transaction deleted.', 'info');
  }, [setTransactions, addToast]);

  /**
   * Retrieves all transactions for a specific student, sorted by date with the newest first.
   *
   * @param {string} studentId - The ID of the student whose transactions are to be retrieved.
   * @returns {Transaction[]} An array of the student's transactions.
   */
  const getTransactionsByStudent = useCallback((studentId: string): Transaction[] => {
    return transactions.filter(t => t.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // --- Settings Operations ---

  /**
   * Updates one or more application settings.
   *
   * @param {Partial<AppSettings>} newSettings - An object containing the settings to update.
   */
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    // Check if the user is setting their name for the first time
    if (settings.userName === DEFAULT_USER_NAME && newSettings.userName && newSettings.userName !== DEFAULT_USER_NAME) {
        addPoints(POINTS_ALLOCATION.COMPLETE_PROFILE, "Completed profile setup!");
        logActivity('Completed profile setup', 'check-circle');
    }
    // Sanitize phone number if it exists in the update
    if (newSettings.phone) {
        newSettings.phone.number = sanitizeString(newSettings.phone.number);
    }
    if (newSettings.country) {
        newSettings.country = sanitizeString(newSettings.country);
    }
    setSettings(prev => ({ ...prev, ...newSettings }));
    addToast('Settings saved successfully.', 'success');
  }, [setSettings, settings.userName, addPoints, addToast, logActivity]);

  /**
   * Toggles the application theme between 'light' and 'dark' modes.
   */
  const toggleTheme = useCallback(() => {
    setSettings(prev => {
      const newTheme = prev.theme === Theme.Light ? Theme.Dark : Theme.Light;
      logActivity(`Switched to ${newTheme} mode`, newTheme === Theme.Dark ? 'moon' : 'sun');
      return { ...prev, theme: newTheme };
    });
  }, [setSettings, logActivity]);

  // --- Data Management ---

  const exportData = useCallback(() => {
    try {
        const dataToExport = { students, transactions, gamification, achievements, settings, activityLog };
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
        addToast('Data exported successfully!', 'success');
    } catch (error) {
        console.error("Failed to export data:", error);
        addToast('Failed to export data.', 'error');
    }
  }, [students, transactions, gamification, achievements, settings, activityLog, addToast]);

  const importData = useCallback(async (file: File) => {
    if (!file) { addToast('No file selected for import.', 'error'); return; }
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
                setStudents(data.students); setTransactions(data.transactions); setSettings(data.settings);
                if (data.gamification) setGamification(data.gamification);
                if (data.achievements) setAchievements(data.achievements);
                if (data.activityLog) setActivityLog(data.activityLog);
                addToast('Data imported successfully! The app will reload.', 'success');
                setTimeout(() => window.location.reload(), 2000);
            } else { throw new Error('Invalid data structure in JSON file.'); }
        } catch (error) {
            console.error("Failed to import data:", error);
            addToast(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
    };
    reader.onerror = () => { addToast('Error reading file.', 'error'); };
    reader.readAsText(file);
  }, [setStudents, setTransactions, setSettings, setGamification, setAchievements, setActivityLog, addToast]);

  const resetData = useCallback(() => {
    setStudents([]);
    setTransactions([]);
    setGamification(INITIAL_GAMIFICATION_STATS);
    setAchievements(ACHIEVEMENTS_DEFINITIONS.map(a => ({...a, achieved: false })));
    setSettings({
        theme: Theme.Dark, currencySymbol: DEFAULT_CURRENCY_SYMBOL, userName: DEFAULT_USER_NAME,
        country: 'United States',
        phone: { countryCode: '+1', number: '' }, email: '',
        monthlyGoal: 500,
    });
    setActivityLog([]);
    addToast('All application data has been reset.', 'info');
    setTimeout(() => window.location.reload(), 1500);
  }, [setStudents, setTransactions, setGamification, setAchievements, setSettings, setActivityLog, addToast]);

  const logout = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      userName: DEFAULT_USER_NAME,
      email: '',
    }));
    addToast('Logged out successfully.', 'info');
  }, [setSettings, addToast]);

  // --- Derived Statistics (Memoized for performance) ---

  const totalUnpaid = useMemo(() => transactions.reduce((acc, t) => {
    if (t.status === PaymentStatus.Due) return acc + t.lessonFee;
    if (t.status === PaymentStatus.PartiallyPaid) return acc + (t.lessonFee - t.amountPaid);
    return acc;
  }, 0), [transactions]);

  const totalPaidThisMonth = useMemo(() => transactions.reduce((acc, t) => {
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
  }, 0), [transactions]);

  const activeStudentsCount = useMemo(() => students.length, [students]);

  const overduePayments = useMemo(() => transactions.filter(t => {
    const isOverdueStatus = t.status === PaymentStatus.Due || (t.status === PaymentStatus.PartiallyPaid && t.amountPaid < t.lessonFee);
    const today = new Date();
    today.setHours(0,0,0,0); 
    return isOverdueStatus && new Date(t.date) < today;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [transactions]);


  // Consolidate all state and actions into the context value. Memoized to prevent unnecessary re-renders.
  const contextValue: DataContextType = useMemo(() => ({
    students, addStudent, updateStudent, deleteStudent, getStudentById,
    transactions, addTransaction, updateTransaction, deleteTransaction, getTransactionsByStudent,
    gamification, achievements, addPoints, checkAndAwardAchievements,
    settings, updateSettings, toggleTheme,
    toasts, addToast,
    activityLog, logActivity, deleteActivity, clearActivityLog, exportData, importData, resetData, logout,
    totalUnpaid, totalPaidThisMonth, activeStudentsCount, overduePayments
  }), [
      students, addStudent, updateStudent, deleteStudent, getStudentById,
      transactions, addTransaction, updateTransaction, deleteTransaction, getTransactionsByStudent,
      gamification, achievements, addPoints, checkAndAwardAchievements,
      settings, updateSettings, toggleTheme,
      toasts, addToast,
      activityLog, logActivity, deleteActivity, clearActivityLog, exportData, importData, resetData, logout,
      totalUnpaid, totalPaidThisMonth, activeStudentsCount, overduePayments
  ]);

  // Provide the context value to children components.
  return React.createElement(DataContext.Provider, { value: contextValue }, children);
};

/**
 * A custom hook for consuming the application's data context.
 * It provides an easy way to access all shared state and action functions.
 * This hook will throw an error if used outside of a `DataProvider`.
 *
 * @returns {DataContextType} The context value, containing all application data and actions.
 */
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
