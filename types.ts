/**
 * @file types.ts
 * This file contains the core TypeScript types and interfaces used throughout the Vellor application.
 * It defines the shape of data for students, transactions, gamification, settings, and more.
 */

/**
 * Represents the available UI themes.
 * @enum {string}
 */
export enum Theme {
  /** The light theme. */
  Light = 'light',
  /** The dark theme. */
  Dark = 'dark',
}

/**
 * Defines the names of all available icons.
 */
export type IconName = 'user' | 'users' | 'user-plus' | 'currency-dollar' | 'calendar' | 'cog' | 'plus' | 'pencil' | 'trash' | 'moon' | 'sun' | 'x-mark' | 'academic-cap' | 'chart-bar' | 'document-text' | 'arrow-left' | 'arrow-right' | 'identification' | 'warning' | 'bars' | 'banknotes' | 'star' | 'bolt' | 'trophy' | 'sparkles' | 'search' | 'check-circle' | 'x-circle' | 'information-circle' | 'user-circle' | 'share' | 'envelope' | 'phone' | 'globe' | 'arrow-right-on-rectangle' | 'book-open' | 'credit-card' | 'clock' | 'lock-closed' | 'chevron-right' | 'chevron-down' | 'trending-up' | 'crown' | 'building' | 'gem' | 'rocket' | 'brush' | 'flame' | 'award' | 'target' | 'gift' | 'brain' | 'handshake' | 'ticket' | 'briefcase' | 'party-popper' | 'heart';


/**
 * Represents a phone number with a country code.
 * @interface
 */
export interface PhoneNumber {
  countryCode: string;
  number: string;
}

/**
 * Represents a parent or guardian of a student.
 * @interface
 */
export interface Parent {
  /** The full name of the parent or guardian. */
  name: string;
  /** The relationship to the student (e.g., "Mother", "Father", "Guardian"). */
  relationship: string;
}

/**
 * Represents the contact information for a student and their parents.
 * @interface
 */
export interface ContactInfo {
  /** The student's personal phone number. */
  studentPhone?: PhoneNumber;
  /** The primary parent's or guardian's phone number. */
  parentPhone1?: PhoneNumber;
  /** A secondary contact phone number. */
  parentPhone2?: PhoneNumber;
  /** The primary email address for communication. */
  email?: string;
}

/**
 * Represents the tuition and lesson details for a student.
 * @interface
 */
export interface TuitionDetails {
  /** An array of subjects the student is being taught. */
  subjects: string[];
  /** The default monetary rate for a lesson or period. */
  defaultRate: number;
  /** The basis for the default rate (e.g., per hour, per lesson). */
  rateType: 'hourly' | 'per_lesson' | 'monthly';
  /** The typical duration of a lesson in minutes, or the number of sessions for a monthly rate. */
  typicalLessonDuration: number;
  /** The student's or parent's preferred method of payment (e.g., "Cash", "Bank Transfer"). */
  preferredPaymentMethod?: string;
}

/**
 * Represents a student in the application.
 * This is a core data model.
 * @interface
 */
export interface Student {
  /** A unique identifier for the student (UUID). */
  id: string;
  /** The student's first name. */
  firstName: string;
  /** The student's last name. */
  lastName: string;
  /** Pre-computed lowercased full name for faster searching. */
  searchName?: string;
  /** The student's country. */
  country?: string;
  /** Information about the student's parent or guardian. */
  parent?: Parent;
  /** The student's contact information. */
  contact: ContactInfo;
  /** Details regarding the student's tuition arrangement. */
  tuition: TuitionDetails;
  /** Any additional notes or important information about the student. */
  notes?: string;
  /** The ISO date string representing when the student's profile was created. */
  createdAt: string;
}

/**
 * Represents the payment status of a transaction.
 * @enum {string}
 */
export enum PaymentStatus {
  /** The transaction has been fully paid. */
  Paid = 'Paid',
  /** A partial payment has been made, but a balance remains. */
  PartiallyPaid = 'Partially Paid',
  /** No payment has been made yet. */
  Due = 'Due',
  /** The amount paid exceeds the lesson fee. */
  Overpaid = 'Overpaid',
  /** The lesson is scheduled for the future. */
  Scheduled = 'Scheduled',
}

/**
 * Represents the attendance status of a student for a specific lesson.
 * @enum {string}
 */
export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
  Cancelled = 'Cancelled',
}

/**
 * Represents a single financial transaction, typically a lesson or a payment.
 * This is a core data model.
 * @interface
 */
export interface Transaction {
  /** A unique identifier for the transaction (UUID). */
  id: string;
  /** The ID of the student associated with this transaction. */
  studentId: string;
  /** The ISO date string for when the lesson or transaction occurred. */
  date: string;
  /** The duration of the lesson in minutes, or a reference number (e.g., "1" for 1 month). */
  lessonDuration: number;
  /** The total fee charged for this lesson or period. */
  lessonFee: number;
  /** The amount that has been paid for this transaction. */
  amountPaid: number;
  /** The method used for the payment (e.g., "Cash", "Card"). */
  paymentMethod?: string;
  /** The calculated payment status of the transaction. */
  status: PaymentStatus;
  /** The attendance status of the student for this lesson. */
  attendance?: AttendanceStatus;
  /** The grade or score assigned for this lesson (e.g., "A", "85%"). */
  grade?: string;
  /** A remark or note regarding the student's progress in this lesson. */
  progressRemark?: string;
  /** Any additional notes related to the transaction. */
  notes?: string;
  /** The ISO date string representing when the transaction was logged. */
  createdAt: string;
}

/**
 * Represents the user's gamification statistics.
 * @interface
 */
export interface GamificationStats {
  /** The total number of points accumulated by the user. */
  points: number;
  /** The user's current level, derived from their points. */
  level: number;
  /** The name of the user's current rank or level (e.g., "Novice Tutor"). */
  levelName: string;
  /** The user's current login streak in days. */
  streak: number;
  /** The ISO date string of the user's last activity. */
  lastActiveDate: string | null;
}

/**
 * Defines unique identifiers for all available achievements.
 * @enum {string}
 */
export enum AchievementId {
  // Financial Achievements
  /** Unlocked when the first payment is logged. */
  FirstPaymentLogged = 'FIRST_PAYMENT_LOGGED',
  /** Unlocked when total earnings reach 10 payments. */
  TenPaymentsLogged = 'TEN_PAYMENTS_LOGGED',
  /** Unlocked when total earnings reach 50 payments. */
  FiftyPaymentsLogged = 'FIFTY_PAYMENTS_LOGGED',
  /** Unlocked when total earnings reach $100 (or equivalent). */
  First100Earned = 'FIRST_100_EARNED',
  /** Unlocked when total earnings reach $1000 (or equivalent). */
  First1000Earned = 'FIRST_1000_EARNED',
  /** Unlocked when total earnings reach $5000 (or equivalent). */
  First5000Earned = 'FIRST_5000_EARNED',
  /** Unlocked when all outstanding debts are cleared. */
  DebtDemolisher = 'DEBT_DEMOLISHER',
  // Organizational Achievements
  /** Unlocked when the first student is added. */
  FirstStudentAdded = 'FIRST_STUDENT_ADDED',
  /** Unlocked when the user is managing at least 5 students. */
  StudentRosterStarter = 'STUDENT_ROSTER_STARTER',
  /** Unlocked when the user is managing at least 10 students. */
  TenStudentsEnrolled = 'TEN_STUDENTS_ENROLLED',
  /** Unlocked when the user is managing at least 25 students. */
  TwentyFiveStudentsEnrolled = 'TWENTY_FIVE_STUDENTS_ENROLLED',
  /** Unlocked when the user is managing at least 50 students. */
  FiftyStudentsEnrolled = 'FIFTY_STUDENTS_ENROLLED',
  // Engagement Achievements
  /** Unlocked when the user logs in for 7 consecutive days. */
  SevenDayStreak = 'SEVEN_DAY_STREAK',
  /** Unlocked when the user logs in for 30 consecutive days. */
  ThirtyDayStreak = 'THIRTY_DAY_STREAK',
  /** Unlocked when the user logs in for 100 consecutive days. */
  HundredDayStreak = 'HUNDRED_DAY_STREAK',
  /** Unlocked when the user completes their profile. */
  ProfileCompleted = 'PROFILE_COMPLETED',
  // New Achievements
  FirstGoalMet = 'FIRST_GOAL_MET',
  MarathonSession = 'MARATHON_SESSION',
  BonusEarned = 'BONUS_EARNED',
  BusyBee = 'BUSY_BEE',
  SubjectMaster = 'SUBJECT_MASTER',
  LoyalScholar = 'LOYAL_SCHOLAR',
  HighTicket = 'HIGH_TICKET',
  LevelFive = 'LEVEL_FIVE',
  CenturyClub = 'CENTURY_CLUB',
  RateDiversifier = 'RATE_DIVERSIFIER',
}

/**
 * Represents a single achievement in the gamification system.
 * @interface
 */
export interface Achievement {
  /** The unique identifier for the achievement. */
  id: AchievementId;
  /** The display name of the achievement. */
  name: string;
  /** A description of how the achievement is earned. */
  description: string;
  /** A flag indicating whether the user has earned this achievement. */
  achieved: boolean;
  /** The ISO date string of when the achievement was earned. */
  dateAchieved?: string;
  /** An emoji or icon name representing the achievement. */
  icon: string;
}

/**
 * Represents the application's configurable settings.
 * @interface
 */
export interface AppSettings {
  /** The current UI theme ('light' or 'dark'). */
  theme: Theme;
  /** The currency symbol to be used for all financial values (e.g., "$", "€"). */
  currencySymbol: string;
  /** The name of the tutor, used for personalization. */
  userName: string;
  /** The tutor's country. */
  country?: string;
  /** The tutor's phone number. */
  phone?: PhoneNumber;
  /** The tutor's email address. */
  email?: string;
  /** The tutor's monthly income goal. */
  monthlyGoal?: number;
  /** Flag indicating if the user has completed the onboarding. */
  hasCompletedOnboarding?: boolean;
  /** Flag to enable browser notifications for reminders. */
  enableReminders?: boolean;
  /** Base64 encoded logo image for invoices. */
  invoiceLogoBase64?: string;
  /** Selected invoice template. */
  invoiceTemplate?: 'modern' | 'classic' | 'minimal';
  /** Flag to globally toggle gamification. */
  gamificationEnabled?: boolean;
  /** Array of custom titles for gamification ranks. */
  customRankTitles?: string[];
  customAchievement?: string;
  customAchievementEarned?: boolean;
  /** Custom primary brand color for the UI. */
  brandColor?: string;
  /** Custom logo for dynamic white-labeling. */
  brandLogoBase64?: string;
}

/**
 * Represents a single activity log entry for the dashboard feed.
 * @interface
 */
export interface Activity {
  id: string;
  message: string;
  icon: IconName;
  timestamp: string;
}

/**
 * Represents the data structure for the student creation/editing form.
 * It omits system-generated fields like `id` and `createdAt`.
 * @typedef {Omit<Student, 'id' | 'createdAt'>}
 */
export type StudentFormData = Omit<Student, 'id' | 'createdAt'>;

/**
 * Represents the data structure for the transaction creation/editing form.
 * It omits system-generated fields like `id`, `status`, and `createdAt`.
 * @typedef {Omit<Transaction, 'id' | 'status' | 'createdAt'>}
 */
export type TransactionFormData = Omit<Transaction, 'id' | 'status' | 'createdAt'> & { status?: PaymentStatus, attendance?: AttendanceStatus };

/**
 * Represents the structure of a toast notification message.
 * @interface
 */
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

/**
 * Defines the complete shape of the data and actions provided by the `DataContext`.
 * This interface is used by the `useData` hook to provide typed access to the context.
 * @interface
 */
export interface DataContextType {
  // --- State ---
  /** The array of all student objects. */
  students: Student[];
  /** The array of all transaction objects. */
  transactions: Transaction[];
  /** The current gamification statistics for the user. */
  gamification: GamificationStats;
  /** The array of all achievement objects, including their status. */
  achievements: Achievement[];
  /** The current application settings. */
  settings: AppSettings;
  /** The array of active toast notification messages. */
  toasts: ToastMessage[];
  /** The array of recent activities for the dashboard feed. */
  activityLog: Activity[];

  // --- Actions ---
  /** Adds a new student to the application. */
  addStudent: (studentData: StudentFormData) => Student;
  /** Updates an existing student's details. */
  updateStudent: (studentId: string, studentData: Partial<StudentFormData>) => Student | undefined;
  /** Deletes a student and their associated transactions. */
  deleteStudent: (studentId: string) => void;
  /** Retrieves a student by their ID. */
  getStudentById: (studentId: string) => Student | undefined;

  /** Adds a new transaction to the application. */
  addTransaction: (transactionData: TransactionFormData) => Transaction;
  /** Updates an existing transaction's details. */
  updateTransaction: (transactionId: string, transactionData: Partial<TransactionFormData>) => Transaction | undefined;
  /** Deletes a transaction. */
  deleteTransaction: (transactionId: string) => void;
  /** Retrieves all transactions for a specific student. */
  getTransactionsByStudent: (studentId: string) => Transaction[];
  
  /** Adds points to the user's gamification score. */
  addPoints: (points: number, reason?: string) => void;
  /** Checks and awards any achievements whose conditions have been met. */
  checkAndAwardAchievements: () => void;

  /** Updates one or more application settings. */
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  /** Toggles the application theme between light and dark mode. */
  toggleTheme: () => void;
  
  /** Displays a toast notification message. */
  addToast: (message: string, type?: ToastMessage['type']) => void;

  /** Logs a new activity to the feed. */
  logActivity: (message: string, icon: IconName) => void;
  /** Deletes an activity from the feed. */
  deleteActivity: (id: string) => void;
  /** Clears all activities from the feed. */
  clearActivityLog: () => void;
  /** Exports all user data to a JSON file. */
  exportData: () => void;
  /** Imports user data from a JSON file. */
  importData: (file: File) => Promise<void>;
  /** Resets all application data to its initial state. */
  resetData: () => void;
  /** Logs the user out by resetting their name and email. */
  logout: () => void;

  // --- Derived Statistics ---
  /** The total calculated unpaid amount across all students. */
  totalUnpaid: number;
  /** The total amount paid across all transactions in the current calendar month. */
  totalPaidThisMonth: number;
  /** The total number of active students. */
  activeStudentsCount: number;
  /** An array of all transactions that are currently overdue. */
  overduePayments: Transaction[];
}