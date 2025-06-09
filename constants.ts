
/**
 * @file constants.ts
 * This file contains constant values used throughout the TutorFlow application.
 * These include configuration for currency, gamification, default user settings, etc.
 */

import { Achievement, AchievementId, GamificationStats } from './types';

/**
 * Array of available currency options for the application settings.
 * Each option includes a symbol (e.g., "$") and its name (e.g., "USD").
 */
export const CURRENCY_OPTIONS = [
  { symbol: '$', name: 'USD' },
  { symbol: '€', name: 'EUR' },
  { symbol: '£', name: 'GBP' },
  { symbol: '¥', name: 'JPY' },
  { symbol: '₹', name: 'INR' },
];

/**
 * Default currency symbol used if no currency is set by the user.
 */
export const DEFAULT_CURRENCY_SYMBOL = '$';

/**
 * Default user name (tutor's name) used for personalization if not set.
 */
export const DEFAULT_USER_NAME = "Teacher";

/**
 * Defines the levels and names for tutor ranks based on accumulated points.
 * Used in the gamification system.
 */
export const TUTOR_RANK_LEVELS = [
  { points: 0, name: "Novice Tutor" },
  { points: 100, name: "Skilled Educator" },
  { points: 500, name: "Master Mentor" },
  { points: 1000, name: "Tuition Titan" },
  { points: 2000, name: "Academic Ace" },
  { points: 5000, name: "Scholarly Sensei" },
];

/**
 * Defines the number of points allocated for various actions within the application.
 * Used in the gamification system.
 */
export const POINTS_ALLOCATION = {
  ADD_STUDENT: 20,
  LOG_PAYMENT_ON_TIME: 10, // Points for logging a payment (simplified as "on time").
  COMPLETE_PROFILE: 5,    // Example: Points for completing a student's profile (if implemented).
  CLEAR_OVERDUE: 30,      // Points for clearing an overdue payment.
};

/**
 * Initial state for the user's gamification statistics.
 */
export const INITIAL_GAMIFICATION_STATS: GamificationStats = {
  points: 0,
  level: 1,
  levelName: TUTOR_RANK_LEVELS[0].name, // Starts at the first rank.
};

/**
 * Definitions for all available achievements in the application.
 * Each achievement has an ID, name, description, initial achieved state (false), and an icon.
 */
export const ACHIEVEMENTS_DEFINITIONS: Achievement[] = [
  { id: AchievementId.FirstStudentAdded, name: "First Student Enrolled", description: "You've added your first student!", achieved: false, icon: "🎓" },
  { id: AchievementId.FirstPaymentLogged, name: "First Payment Logged", description: "Cha-ching! First payment recorded.", achieved: false, icon: "💰" },
  { id: AchievementId.StudentRosterStarter, name: "Student Roster Starter", description: "You're managing 5 students!", achieved: false, icon: "👥" },
  { id: AchievementId.First100Earned, name: "Income Stream Starter", description: "Earned your first $100 (or equivalent).", achieved: false, icon: "💸" },
  { id: AchievementId.DebtDemolisher, name: "Debt Demolisher", description: "Cleared all overdue payments!", achieved: false, icon: "🧹" },
  // Example of a more complex achievement (currently commented out as it requires more logic)
  // { id: AchievementId.DailyTracker, name: "Daily Tracker", description: "Used app 7 days in a row.", achieved: false, icon: "📅" },
];