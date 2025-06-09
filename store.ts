
/**
 * @file store.ts
 * This file defines the central data store and context for the TutorFlow application.
 * It uses React Context API and a custom localStorage hook to manage and persist application state,
 * including students, transactions, gamification data, and settings.
 */

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { Student, Transaction, GamificationStats, Achievement, AppSettings, Theme, StudentFormData, TransactionFormData, PaymentStatus, AchievementId, DataContextType } from './types';
import { TUTOR_RANK_LEVELS, INITIAL_GAMIFICATION_STATS, ACHIEVEMENTS_DEFINITIONS, DEFAULT_CURRENCY_SYMBOL, DEFAULT_USER_NAME, POINTS_ALLOCATION } from './constants';

/**
 * Custom hook `useLocalStorage` to synchronize state with the browser's localStorage.
 * It attempts to retrieve the stored value on initialization and updates localStorage
 * whenever the state changes.
 * @template T The type of the value to be stored.
 * @param {string} key The localStorage key.
 * @param {T} initialValue The initial value if no value is found in localStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} A stateful value and a function to update it.
 */
const useLocalStorage = <T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  return [storedValue, setValue];
};

/**
 * React Context for providing application data and actions throughout the component tree.
 * @type {React.Context<DataContextType | undefined>}
 */
const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * `DataProvider` component wraps its children with the `DataContext.Provider`,
 * making all application data and manipulation functions available to descendant components.
 * It manages state for students, transactions, gamification, and settings using `useLocalStorage`.
 * @param {{ children: ReactNode }} props Props containing the child components.
 */
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State management using the useLocalStorage hook for persistence.
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [gamification, setGamification] = useLocalStorage<GamificationStats>('gamification', INITIAL_GAMIFICATION_STATS);
  // Ensure achievements are initialized with 'achieved: false' by mapping over definitions.
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('achievements', ACHIEVEMENTS_DEFINITIONS.map(a => ({...a, achieved: false })));
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', {
    theme: Theme.Light, // Default theme
    currencySymbol: DEFAULT_CURRENCY_SYMBOL,
    userName: DEFAULT_USER_NAME,
  });

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
   * Adds points to the user's gamification stats and updates their level if necessary.
   * @param {number} pointsToAdd The number of points to add.
   * @param {string} [reason] Optional reason for gaining points, can be used for logging or notifications.
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
      // Placeholder for a toast notification for points gained
      // if (reason) console.log(`+${pointsToAdd} points: ${reason}`); // Removed console.log
      return { points: newPoints, level: newLevel, levelName: newLevelName };
    });
  }, [setGamification]); // `setGamification` is stable from `useLocalStorage`

  /**
   * Checks conditions for all defined achievements and awards them if met.
   * This function is typically called when related data (like students or transactions) changes.
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
                case AchievementId.FirstPaymentLogged:
                    if (transactions.length > 0) justAchieved = true;
                    break;
                case AchievementId.StudentRosterStarter:
                    if (students.length >= 5) justAchieved = true;
                    break;
                case AchievementId.First100Earned:
                    // Calculate total earnings from paid or partially paid transactions
                    const totalEarnedOverall = transactions
                        .filter(t => t.status === PaymentStatus.Paid || t.status === PaymentStatus.Overpaid || t.status === PaymentStatus.PartiallyPaid)
                        .reduce((sum, t) => sum + t.amountPaid, 0);
                    if (totalEarnedOverall >= 100) justAchieved = true;
                    break;
                case AchievementId.DebtDemolisher:
                     // Check for any currently overdue payments (simplified: due and older than 1 day)
                    const currentOverdue = transactions.filter(t => {
                        const isDue = t.status === PaymentStatus.Due || (t.status === PaymentStatus.PartiallyPaid && t.amountPaid < t.lessonFee);
                        return isDue && (new Date().getTime() - new Date(t.date).getTime()) > 24 * 60 * 60 * 1000;
                    });
                    // Award if no overdue payments AND there was at least one payment to begin with
                    if (currentOverdue.length === 0 && transactions.some(t => t.status === PaymentStatus.Paid)) justAchieved = true;
                    break;
            }

            if (justAchieved) {
                // console.log(`Achievement Unlocked: ${ach.name}!`); // Placeholder for toast/notification - Removed console.log
                changed = true;
                // Potentially add points for unlocking an achievement
                // addPoints(POINTS_ALLOCATION.UNLOCK_ACHIEVEMENT, `Unlocked: ${ach.name}`);
                return { ...ach, achieved: true, dateAchieved: new Date().toISOString() };
            }
            return ach; // Return unchanged achievement
        });
        // Only return new array if something actually changed
        return changed ? updatedAchievements : prevAchievements;
    });
  }, [students, transactions, setAchievements]); // Dependencies for re-evaluating achievements

  // Effect to check for achievements whenever students or transactions lists change.
  useEffect(() => {
    checkAndAwardAchievements();
  }, [students, transactions, checkAndAwardAchievements]);


  // --- Student Operations ---

  /**
   * Adds a new student to the list.
   * @param {StudentFormData} studentData Data for the new student.
   * @returns {Student} The newly created student object.
   */
  const addStudent = (studentData: StudentFormData): Student => {
    const newStudent: Student = {
      ...studentData,
      id: crypto.randomUUID(), // Generate a unique ID
      createdAt: new Date().toISOString(), // Timestamp creation
    };
    setStudents(prev => [...prev, newStudent]);
    addPoints(POINTS_ALLOCATION.ADD_STUDENT, `Added new student: ${newStudent.firstName}`);
    return newStudent;
  };

  /**
   * Updates an existing student's details.
   * @param {string} studentId ID of the student to update.
   * @param {Partial<StudentFormData>} studentData Partial data with fields to update.
   * @returns {Student | undefined} The updated student object, or undefined if not found.
   */
  const updateStudent = (studentId: string, studentData: Partial<StudentFormData>): Student | undefined => {
    let updatedStudent: Student | undefined;
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          updatedStudent = { ...s, ...studentData };
          return updatedStudent;
        }
        return s;
      })
    );
    return updatedStudent; // Return the updated student for potential immediate use
  };
  
  /**
   * Deletes a student and all their associated transactions.
   * @param {string} studentId ID of the student to delete.
   */
  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    // Also remove transactions associated with this student
    setTransactions(prev => prev.filter(t => t.studentId !== studentId));
  };

  /**
   * Retrieves a student by their ID.
   * @param {string} studentId ID of the student to find.
   * @returns {Student | undefined} The student object if found, otherwise undefined.
   */
  const getStudentById = (studentId: string): Student | undefined => {
    return students.find(s => s.id === studentId);
  };

  // --- Transaction Operations ---

  /**
   * Adds a new transaction to the list and calculates its initial payment status.
   * @param {TransactionFormData} transactionData Data for the new transaction.
   * @returns {Transaction} The newly created transaction object.
   */
  const addTransaction = (transactionData: TransactionFormData): Transaction => {
    let status: PaymentStatus;
    // Determine payment status based on amount paid vs lesson fee
    if (transactionData.amountPaid >= transactionData.lessonFee) {
      status = transactionData.amountPaid > transactionData.lessonFee ? PaymentStatus.Overpaid : PaymentStatus.Paid;
    } else if (transactionData.amountPaid > 0 && transactionData.amountPaid < transactionData.lessonFee) {
      status = PaymentStatus.PartiallyPaid;
    } else {
      status = PaymentStatus.Due;
    }

    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      status,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    // Award points if the payment was logged as fully or overpaid
    if (status === PaymentStatus.Paid || status === PaymentStatus.Overpaid) {
        addPoints(POINTS_ALLOCATION.LOG_PAYMENT_ON_TIME, `Logged payment for student ID ${newTransaction.studentId}`);
    }
    // Award points if an overdue payment was cleared (simplified: if payment made for a "Due" item)
    // This might need more complex logic if updating existing due items.
    // For now, assume new log of payment might clear previous "Due" impression.
    // A more robust way would be to check specific transaction being paid if it was previously due.
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
  };

  /**
   * Updates an existing transaction's details and re-evaluates its payment status if necessary.
   * @param {string} transactionId ID of the transaction to update.
   * @param {Partial<TransactionFormData>} transactionData Partial data with fields to update.
   * @returns {Transaction | undefined} The updated transaction object, or undefined if not found.
   */
  const updateTransaction = (transactionId: string, transactionData: Partial<TransactionFormData>): Transaction | undefined => {
     let updatedTransaction : Transaction | undefined;
     setTransactions(prev => prev.map(t => {
        if (t.id === transactionId) {
            const originalStatus = t.status;
            const potentiallyUpdated = { ...t, ...transactionData };
            let newStatus = t.status; // Keep original status unless payment amounts change

            // Re-evaluate status if amountPaid or lessonFee was part of the update
            if (transactionData.amountPaid !== undefined || transactionData.lessonFee !== undefined) {
                const fee = transactionData.lessonFee !== undefined ? transactionData.lessonFee : t.lessonFee;
                const paid = transactionData.amountPaid !== undefined ? transactionData.amountPaid : t.amountPaid;
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
                // Check if this specific payment clears an overdue item or part of it.
                // More complex logic might be needed if this action clears all of student's debt.
                 addPoints(POINTS_ALLOCATION.CLEAR_OVERDUE, `Cleared overdue status for transaction ${updatedTransaction.id}`);
            }

            return updatedTransaction;
        }
        return t;
     }));
     return updatedTransaction;
  };
  
  /**
   * Deletes a transaction from the list.
   * @param {string} transactionId ID of the transaction to delete.
   */
  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  /**
   * Retrieves all transactions for a specific student, sorted by date (newest first).
   * @param {string} studentId ID of the student.
   * @returns {Transaction[]} An array of the student's transactions.
   */
  const getTransactionsByStudent = (studentId: string): Transaction[] => {
    return transactions.filter(t => t.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // --- Settings Operations ---

  /**
   * Updates parts of the application settings.
   * @param {Partial<AppSettings>} newSettings An object containing the settings to update.
   */
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  /**
   * Toggles the application theme between Light and Dark.
   */
  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === Theme.Light ? Theme.Dark : Theme.Light,
    }));
  };

  // --- Derived Statistics (Calculated on-the-fly, could be memoized if performance issues arise) ---

  /**
   * Calculates the total unpaid amount across all transactions.
   * This includes due amounts and the remaining balance of partially paid transactions.
   */
  const totalUnpaid = transactions.reduce((acc, t) => {
    if (t.status === PaymentStatus.Due) return acc + t.lessonFee;
    if (t.status === PaymentStatus.PartiallyPaid) return acc + (t.lessonFee - t.amountPaid);
    return acc;
  }, 0);

  /**
   * Calculates the total amount paid in the current calendar month.
   */
  const totalPaidThisMonth = transactions.reduce((acc, t) => {
    const transactionDate = new Date(t.date);
    const today = new Date();
    // Check if the transaction is within the current month and year
    if (
      transactionDate.getFullYear() === today.getFullYear() &&
      transactionDate.getMonth() === today.getMonth() &&
      (t.status === PaymentStatus.Paid || t.status === PaymentStatus.PartiallyPaid || t.status === PaymentStatus.Overpaid)
    ) {
      return acc + t.amountPaid;
    }
    return acc;
  }, 0);

  /**
   * Counts the number of active students (currently, all students are considered active).
   */
  const activeStudentsCount = students.length;

  /**
   * Filters and sorts transactions that are overdue.
   * An overdue transaction is one that is 'Due' or 'PartiallyPaid' and its date is in the past.
   * Sorted by date, oldest first.
   */
  const overduePayments = transactions.filter(t => {
    const isOverdueStatus = t.status === PaymentStatus.Due || (t.status === PaymentStatus.PartiallyPaid && t.amountPaid < t.lessonFee);
    // Basic overdue check: status indicates money owed and transaction date is before today.
    // Consider a transaction overdue if its date is strictly before today's date (ignoring time).
    const today = new Date();
    today.setHours(0,0,0,0); // Set to start of today
    return isOverdueStatus && new Date(t.date) < today;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  // Consolidate all state and actions into the context value.
  const contextValue: DataContextType = {
    students, addStudent, updateStudent, deleteStudent, getStudentById,
    transactions, addTransaction, updateTransaction, deleteTransaction, getTransactionsByStudent,
    gamification, achievements, addPoints, checkAndAwardAchievements,
    settings, updateSettings, toggleTheme,
    totalUnpaid, totalPaidThisMonth, activeStudentsCount, overduePayments
  };

  // Provide the context value to children components.
  return React.createElement(DataContext.Provider, { value: contextValue }, children);
};

/**
 * Custom hook `useData` to easily access the `DataContextType` from any component
 * wrapped within `DataProvider`. Throws an error if used outside `DataProvider`.
 * @returns {DataContextType} The application data and action functions.
 */
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};