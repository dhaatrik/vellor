
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
  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Encrypt and save to local storage
      const encryptedValue = encryptData(valueToStore);
      window.localStorage.setItem(key, encryptedValue);
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
      // Placeholder for a toast notification for points gained
      // if (reason) console.log(`+${pointsToAdd} points: ${reason}`); // Removed console.log
      return { points: newPoints, level: newLevel, levelName: newLevelName };
    });
  }, [setGamification]); // `setGamification` is stable from `useLocalStorage`

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
   * Adds a new student to the application state after sanitizing input data.
   * Also awards points for the action.
   *
   * @param {StudentFormData} studentData - The data for the new student from the form.
   * @returns {Student} The newly created student object, including its generated ID and timestamp.
   */
  const addStudent = (studentData: StudentFormData): Student => {
    const sanitizedStudentData: StudentFormData = {
      ...studentData,
      firstName: sanitizeString(studentData.firstName),
      lastName: sanitizeString(studentData.lastName),
      parent: {
        ...studentData.parent,
        name: sanitizeString(studentData.parent?.name),
      },
      contact: {
        ...studentData.contact,
        email: sanitizeString(studentData.contact?.email),
        studentPhone: sanitizeString(studentData.contact?.studentPhone),
        parentPhone1: sanitizeString(studentData.contact?.parentPhone1),
        parentPhone2: sanitizeString(studentData.contact?.parentPhone2),
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
    return newStudent;
  };

  /**
   * Updates an existing student's details in the application state. It correctly merges nested objects
   * to prevent data loss during partial updates.
   *
   * @param {string} studentId - The ID of the student to update.
   * @param {Partial<StudentFormData>} studentData - An object containing the student fields to update.
   * @returns {Student | undefined} The updated student object, or undefined if the student was not found.
   */
  const updateStudent = (studentId: string, studentData: Partial<StudentFormData>): Student | undefined => {
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
            if (studentData.contact.studentPhone !== undefined) updatedContactData.studentPhone = sanitizeString(studentData.contact.studentPhone);
            if (studentData.contact.parentPhone1 !== undefined) updatedContactData.parentPhone1 = sanitizeString(studentData.contact.parentPhone1);
            if (studentData.contact.parentPhone2 !== undefined) updatedContactData.parentPhone2 = sanitizeString(studentData.contact.parentPhone2);
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
    return updatedStudent; // Return the updated student for potential immediate use
  };
  
  /**
   * Deletes a student and all of their associated transactions from the application state.
   *
   * @param {string} studentId - The ID of the student to delete.
   */
  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    // Also remove transactions associated with this student
    setTransactions(prev => prev.filter(t => t.studentId !== studentId));
  };

  /**
   * Retrieves a single student by their unique ID.
   *
   * @param {string} studentId - The ID of the student to find.
   * @returns {Student | undefined} The student object if found, otherwise undefined.
   */
  const getStudentById = (studentId: string): Student | undefined => {
    return students.find(s => s.id === studentId);
  };

  // --- Transaction Operations ---

  /**
   * Adds a new transaction, calculates its payment status, and awards points if applicable.
   *
   * @param {TransactionFormData} transactionData - The data for the new transaction from the form.
   * @returns {Transaction} The newly created transaction object.
   */
  const addTransaction = (transactionData: TransactionFormData): Transaction => {
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
   * Updates an existing transaction's details and re-calculates its payment status.
   *
   * @param {string} transactionId - The ID of the transaction to update.
   * @param {Partial<TransactionFormData>} transactionData - An object with the transaction fields to update.
   * @returns {Transaction | undefined} The updated transaction object, or undefined if not found.
   */
  const updateTransaction = (transactionId: string, transactionData: Partial<TransactionFormData>): Transaction | undefined => {
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
   * Deletes a transaction from the application state.
   *
   * @param {string} transactionId - The ID of the transaction to delete.
   */
  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  /**
   * Retrieves all transactions for a specific student, sorted by date with the newest first.
   *
   * @param {string} studentId - The ID of the student whose transactions are to be retrieved.
   * @returns {Transaction[]} An array of the student's transactions.
   */
  const getTransactionsByStudent = (studentId: string): Transaction[] => {
    return transactions.filter(t => t.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // --- Settings Operations ---

  /**
   * Updates one or more application settings.
   *
   * @param {Partial<AppSettings>} newSettings - An object containing the settings to update.
   */
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  /**
   * Toggles the application theme between 'light' and 'dark' modes.
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