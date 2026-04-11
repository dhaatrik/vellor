import { Student, Transaction, GamificationStats, Achievement, AppSettings, ToastMessage, Activity, IconName, StudentFormData, TransactionFormData } from '../types';

export interface StudentSlice {
  students: Student[];
  addStudent: (studentData: StudentFormData) => Student;
  updateStudent: (studentId: string, studentData: Partial<StudentFormData>) => Student | undefined;
  deleteStudent: (studentId: string) => void;
  getStudentById: (studentId: string) => Student | undefined;
}

export interface TransactionSlice {
  transactions: Transaction[];
  addTransaction: (transactionData: TransactionFormData) => Transaction;
  updateTransaction: (transactionId: string, transactionData: Partial<TransactionFormData>) => Transaction | undefined;
  deleteTransaction: (transactionId: string) => void;
  getTransactionsByStudent: (studentId: string) => Transaction[];
  exportTransactionsCSV: () => void;
}

export interface GamificationSlice {
  gamification: GamificationStats;
  achievements: Achievement[];
  addPoints: (pointsToAdd: number, reason?: string) => void;
  checkAndAwardAchievements: () => void;
}

export interface UISlice {
  toasts: ToastMessage[];
  activityLog: Activity[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  logActivity: (message: string, icon: IconName) => void;
  deleteActivity: (id: string) => void;
  clearActivityLog: () => void;
}

export interface SettingsSlice {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleTheme: () => void;
}

export interface DataManagementSlice {
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  resetData: () => void;
  logout: () => void;
}

export type AppState = StudentSlice & TransactionSlice & GamificationSlice & UISlice & SettingsSlice & DataManagementSlice;
