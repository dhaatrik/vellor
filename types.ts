/**
 * Enum representing the available themes for the application.
 */
export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

/**
 * Interface representing a parent or guardian of a student.
 */
export interface Parent {
  name: string; // Full name of the parent/guardian.
  relationship: string; // Relationship to the student (e.g., Mother, Father, Guardian).
}

/**
 * Interface for storing contact information related to a student.
 */
export interface ContactInfo {
  studentPhone?: string; // Student's phone number.
  parentPhone1?: string; // Primary parent's phone number.
  parentPhone2?: string; // Secondary parent's phone number (optional).
  email?: string; // Contact email address.
}

/**
 * Interface detailing the tuition specifics for a student.
 */
export interface TuitionDetails {
  subjects: string[]; // List of subjects the student is taking.
  defaultRate: number; // Default monetary rate for tuition.
  rateType: 'hourly' | 'per_lesson' | 'monthly'; // Type of rate (e.g., per hour, per lesson, per month).
  typicalLessonDuration: number; // Typical duration of a lesson in minutes, or number of sessions for monthly.
  preferredPaymentMethod?: string; // Student's/Parent's preferred method of payment.
}

/**
 * Interface representing a student.
 */
export interface Student {
  id: string; // Unique identifier for the student.
  firstName: string; // Student's first name.
  lastName: string; // Student's last name.
  parent?: Parent; // Parent or guardian information (optional).
  contact: ContactInfo; // Contact details for the student and/or parents.
  tuition: TuitionDetails; // Details about the student's tuition.
  notes?: string; // Any additional notes about the student (optional).
  createdAt: string; // ISO date string representing when the student was added.
}

/**
 * Enum representing the payment status of a transaction.
 */
export enum PaymentStatus {
  Paid = 'Paid', // Full payment has been made.
  PartiallyPaid = 'Partially Paid', // Partial payment has been made.
  Due = 'Due', // Payment is pending (or Unpaid).
  Overpaid = 'Overpaid', // More than the required amount has been paid.
}

/**
 * Interface representing a financial transaction.
 */
export interface Transaction {
  id: string; // Unique identifier for the transaction.
  studentId: string; // ID of the student associated with this transaction.
  date: string; // ISO date string when the lesson/transaction occurred.
  lessonDuration: number; // Duration of the lesson in minutes, or a reference number (e.g., "1" for 1 month).
  lessonFee: number; // The total fee for this lesson/period.
  amountPaid: number; // The amount actually paid for this transaction.
  paymentMethod?: string; // Method used for payment (e.g., Cash, Card).
  status: PaymentStatus; // Current payment status of the transaction.
  notes?: string; // Any additional notes about the transaction (optional).
  createdAt: string; // ISO date string representing when the transaction was logged.
}

/**
 * Interface for storing gamification statistics for the user.
 */
export interface GamificationStats {
  points: number; // Total points accumulated by the user.
  level: number; // Current level achieved by the user.
  levelName: string; // Name of the current level (e.g., "Novice Tutor").
}

/**
 * Enum for unique identifiers of achievements.
 */
export enum AchievementId {
  // Financial Achievements
  FirstPaymentLogged = 'FIRST_PAYMENT_LOGGED',
  First100Earned = 'FIRST_100_EARNED',
  DebtDemolisher = 'DEBT_DEMOLISHER',
  // Organizational Achievements
  FirstStudentAdded = 'FIRST_STUDENT_ADDED',
  StudentRosterStarter = 'STUDENT_ROSTER_STARTER', // e.g., for 5 students
  // Consistency Achievements (Example, might require more complex tracking)
  DailyTracker = 'DAILY_TRACKER', // e.g., Used app 7 days in a row
}

/**
 * Interface representing an achievement in the gamification system.
 */
export interface Achievement {
  id: AchievementId; // Unique identifier for the achievement.
  name: string; // Display name of the achievement.
  description: string; // Description of how to earn the achievement.
  achieved: boolean; // Whether the user has earned this achievement.
  dateAchieved?: string; // ISO date string when the achievement was earned (optional).
  icon: string; // Emoji or SVG icon name representing the achievement.
}

/**
 * Interface for application-wide settings.
 */
export interface AppSettings {
  theme: Theme; // Current theme (Light or Dark).
  currencySymbol: string; // Currency symbol to be used (e.g., $, €).
  userName: string; // Name of the tutor for personalization.
}

/**
 * Type definition for the data required to create a new student (omitting system-generated fields).
 */
export type StudentFormData = Omit<Student, 'id' | 'createdAt'>;

/**
 * Type definition for the data required to create a new transaction (omitting system-generated fields).
 */
export type TransactionFormData = Omit<Transaction, 'id' | 'status' | 'createdAt'>;

/**
 * Interface for the context type that provides data and actions throughout the application.
 */
export interface DataContextType {
  // Student data and operations
  students: Student[];
  addStudent: (studentData: StudentFormData) => Student;
  updateStudent: (studentId: string, studentData: Partial<StudentFormData>) => Student | undefined;
  deleteStudent: (studentId: string) => void;
  getStudentById: (studentId: string) => Student | undefined;

  // Transaction data and operations
  transactions: Transaction[];
  addTransaction: (transactionData: TransactionFormData) => Transaction;
  updateTransaction: (transactionId: string, transactionData: Partial<TransactionFormData>) => Transaction | undefined;
  deleteTransaction: (transactionId: string) => void;
  getTransactionsByStudent: (studentId: string) => Transaction[];
  
  // Gamification data and operations
  gamification: GamificationStats;
  achievements: Achievement[];
  addPoints: (points: number, reason?: string) => void; // Reason can be used for toast/log messages.
  checkAndAwardAchievements: () => void;

  // Application settings and operations
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleTheme: () => void;

  // Derived financial and operational statistics
  totalUnpaid: number; // Sum of all due and partially paid amounts.
  totalPaidThisMonth: number; // Sum of payments received in the current month.
  activeStudentsCount: number; // Count of active students.
  overduePayments: Transaction[]; // List of transactions that are overdue.
}
