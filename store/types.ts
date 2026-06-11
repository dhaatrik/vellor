import { Student, Transaction, GamificationStats, Achievement, AppSettings, ToastMessage, Activity, IconName, StudentFormData, TransactionFormData } from '../types';

export interface StudentSlice {
  students: Student[];
  addStudent: (studentData: StudentFormData) => Student;
  addStudents: (studentsData: StudentFormData[]) => Student[];
  bulkUpdateStudents: (updates: { id: string, data: Partial<StudentFormData> }[]) => void;
  updateStudent: (studentId: string, studentData: Partial<StudentFormData>) => Student | undefined;
  deleteStudent: (studentId: string) => void;
  getStudentById: (studentId: string) => Student | undefined;
}

export interface TransactionSlice {
  transactions: Transaction[];
  addTransaction: (transactionData: TransactionFormData) => Transaction;
  addTransactions: (transactionsData: TransactionFormData[]) => Transaction[];
  updateTransaction: (transactionId: string, transactionData: Partial<TransactionFormData>) => Transaction | undefined;
  deleteTransaction: (transactionId: string) => void;
  getTransactionById: (transactionId: string) => Transaction | undefined;
  getTransactionsByStudent: (studentId: string) => Transaction[];
  loadTransactions: () => Promise<void>;
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
  hoveredTransactionId: string | null;
  hoveredStudentId: string | null;
  activityLog: Activity[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  logActivity: (message: string, icon: IconName) => void;
  deleteActivity: (id: string) => void;
  clearActivityLog: () => void;
  setHoveredTransaction: (id: string | null) => void;
  setHoveredStudent: (id: string | null) => void;
}

export interface SettingsSlice {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

export interface DataManagementSlice {
  masterKey: CryptoKey | null;
  setMasterKey: (key: CryptoKey | null) => void;
  exportData: (password?: string | null) => Promise<void>;
  importData: (file: File, password?: string | null) => Promise<void>;
  resetData: () => void;
  logout: () => void;
}

export type AppState = StudentSlice & TransactionSlice & GamificationSlice & UISlice & SettingsSlice & DataManagementSlice;
