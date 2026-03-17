

/**
 * @file constants.ts
 * This file contains constant values used throughout the Vellor application.
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
 * Array of countries with their corresponding phone country codes.
 */
export const COUNTRIES = [
    { name: 'Afghanistan', code: '+93' },
    { name: 'Albania', code: '+355' },
    { name: 'Algeria', code: '+213' },
    { name: 'Andorra', code: '+376' },
    { name: 'Angola', code: '+244' },
    { name: 'Antigua and Barbuda', code: '+1-268' },
    { name: 'Argentina', code: '+54' },
    { name: 'Armenia', code: '+374' },
    { name: 'Australia', code: '+61' },
    { name: 'Austria', code: '+43' },
    { name: 'Azerbaijan', code: '+994' },
    { name: 'Bahamas', code: '+1-242' },
    { name: 'Bahrain', code: '+973' },
    { name: 'Bangladesh', code: '+880' },
    { name: 'Barbados', code: '+1-246' },
    { name: 'Belarus', code: '+375' },
    { name: 'Belgium', code: '+32' },
    { name: 'Belize', code: '+501' },
    { name: 'Benin', code: '+229' },
    { name: 'Bhutan', code: '+975' },
    { name: 'Bolivia', code: '+591' },
    { name: 'Bosnia and Herzegovina', code: '+387' },
    { name: 'Botswana', code: '+267' },
    { name: 'Brazil', code: '+55' },
    { name: 'Brunei', code: '+673' },
    { name: 'Bulgaria', code: '+359' },
    { name: 'Burkina Faso', code: '+226' },
    { name: 'Burundi', code: '+257' },
    { name: 'Cabo Verde', code: '+238' },
    { name: 'Cambodia', code: '+855' },
    { name: 'Cameroon', code: '+237' },
    { name: 'Canada', code: '+1' },
    { name: 'Central African Republic', code: '+236' },
    { name: 'Chad', code: '+235' },
    { name: 'Chile', code: '+56' },
    { name: 'China', code: '+86' },
    { name: 'Colombia', code: '+57' },
    { name: 'Comoros', code: '+269' },
    { name: 'Congo, Democratic Republic of the', code: '+243' },
    { name: 'Congo, Republic of the', code: '+242' },
    { name: 'Costa Rica', code: '+506' },
    { name: 'Croatia', code: '+385' },
    { name: 'Cuba', code: '+53' },
    { name: 'Cyprus', code: '+357' },
    { name: 'Czech Republic', code: '+420' },
    { name: 'Denmark', code: '+45' },
    { name: 'Djibouti', code: '+253' },
    { name: 'Dominica', code: '+1-767' },
    { name: 'Dominican Republic', code: '+1-809' },
    { name: 'Ecuador', code: '+593' },
    { name: 'Egypt', code: '+20' },
    { name: 'El Salvador', code: '+503' },
    { name: 'Equatorial Guinea', code: '+240' },
    { name: 'Eritrea', code: '+291' },
    { name: 'Estonia', code: '+372' },
    { name: 'Eswatini', code: '+268' },
    { name: 'Ethiopia', code: '+251' },
    { name: 'Fiji', code: '+679' },
    { name: 'Finland', code: '+358' },
    { name: 'France', code: '+33' },
    { name: 'Gabon', code: '+241' },
    { name: 'Gambia', code: '+220' },
    { name: 'Georgia', code: '+995' },
    { name: 'Germany', code: '+49' },
    { name: 'Ghana', code: '+233' },
    { name: 'Greece', code: '+30' },
    { name: 'Grenada', code: '+1-473' },
    { name: 'Guatemala', code: '+502' },
    { name: 'Guinea', code: '+224' },
    { name: 'Guinea-Bissau', code: '+245' },
    { name: 'Guyana', code: '+592' },
    { name: 'Haiti', code: '+509' },
    { name: 'Honduras', code: '+504' },
    { name: 'Hungary', code: '+36' },
    { name: 'Iceland', code: '+354' },
    { name: 'India', code: '+91' },
    { name: 'Indonesia', code: '+62' },
    { name: 'Iran', code: '+98' },
    { name: 'Iraq', code: '+964' },
    { name: 'Ireland', code: '+353' },
    { name: 'Israel', code: '+972' },
    { name: 'Italy', code: '+39' },
    { name: 'Jamaica', code: '+1-876' },
    { name: 'Japan', code: '+81' },
    { name: 'Jordan', code: '+962' },
    { name: 'Kazakhstan', code: '+7' },
    { name: 'Kenya', code: '+254' },
    { name: 'Kiribati', code: '+686' },
    { name: 'Kuwait', code: '+965' },
    { name: 'Kyrgyzstan', code: '+996' },
    { name: 'Laos', code: '+856' },
    { name: 'Latvia', code: '+371' },
    { name: 'Lebanon', code: '+961' },
    { name: 'Lesotho', code: '+266' },
    { name: 'Liberia', code: '+231' },
    { name: 'Libya', code: '+218' },
    { name: 'Liechtenstein', code: '+423' },
    { name: 'Lithuania', code: '+370' },
    { name: 'Luxembourg', code: '+352' },
    { name: 'Madagascar', code: '+261' },
    { name: 'Malawi', code: '+265' },
    { name: 'Malaysia', code: '+60' },
    { name: 'Maldives', code: '+960' },
    { name: 'Mali', code: '+223' },
    { name: 'Malta', code: '+356' },
    { name: 'Marshall Islands', code: '+692' },
    { name: 'Mauritania', code: '+222' },
    { name: 'Mauritius', code: '+230' },
    { name: 'Mexico', code: '+52' },
    { name: 'Micronesia', code: '+691' },
    { name: 'Moldova', code: '+373' },
    { name: 'Monaco', code: '+377' },
    { name: 'Mongolia', code: '+976' },
    { name: 'Montenegro', code: '+382' },
    { name: 'Morocco', code: '+212' },
    { name: 'Mozambique', code: '+258' },
    { name: 'Myanmar', code: '+95' },
    { name: 'Namibia', code: '+264' },
    { name: 'Nauru', code: '+674' },
    { name: 'Nepal', code: '+977' },
    { name: 'Netherlands', code: '+31' },
    { name: 'New Zealand', code: '+64' },
    { name: 'Nicaragua', code: '+505' },
    { name: 'Niger', code: '+227' },
    { name: 'Nigeria', code: '+234' },
    { name: 'North Korea', code: '+850' },
    { name: 'North Macedonia', code: '+389' },
    { name: 'Norway', code: '+47' },
    { name: 'Oman', code: '+968' },
    { name: 'Pakistan', code: '+92' },
    { name: 'Palau', code: '+680' },
    { name: 'Palestine', code: '+970' },
    { name: 'Panama', code: '+507' },
    { name: 'Papua New Guinea', code: '+675' },
    { name: 'Paraguay', code: '+595' },
    { name: 'Peru', code: '+51' },
    { name: 'Philippines', code: '+63' },
    { name: 'Poland', code: '+48' },
    { name: 'Portugal', code: '+351' },
    { name: 'Qatar', code: '+974' },
    { name: 'Romania', code: '+40' },
    { name: 'Russia', code: '+7' },
    { name: 'Rwanda', code: '+250' },
    { name: 'Saint Kitts and Nevis', code: '+1-869' },
    { name: 'Saint Lucia', code: '+1-758' },
    { name: 'Saint Vincent and the Grenadines', code: '+1-784' },
    { name: 'Samoa', code: '+685' },
    { name: 'San Marino', code: '+378' },
    { name: 'Sao Tome and Principe', code: '+239' },
    { name: 'Saudi Arabia', code: '+966' },
    { name: 'Senegal', code: '+221' },
    { name: 'Serbia', code: '+381' },
    { name: 'Seychelles', code: '+248' },
    { name: 'Sierra Leone', code: '+232' },
    { name: 'Singapore', code: '+65' },
    { name: 'Slovakia', code: '+421' },
    { name: 'Slovenia', code: '+386' },
    { name: 'Solomon Islands', code: '+677' },
    { name: 'Somalia', code: '+252' },
    { name: 'South Africa', code: '+27' },
    { name: 'South Korea', code: '+82' },
    { name: 'South Sudan', code: '+211' },
    { name: 'Spain', code: '+34' },
    { name: 'Sri Lanka', code: '+94' },
    { name: 'Sudan', code: '+249' },
    { name: 'Suriname', code: '+597' },
    { name: 'Sweden', code: '+46' },
    { name: 'Switzerland', code: '+41' },
    { name: 'Syria', code: '+963' },
    { name: 'Taiwan', code: '+886' },
    { name: 'Tajikistan', code: '+992' },
    { name: 'Tanzania', code: '+255' },
    { name: 'Thailand', code: '+66' },
    { name: 'Timor-Leste', code: '+670' },
    { name: 'Togo', code: '+228' },
    { name: 'Tonga', code: '+676' },
    { name: 'Trinidad and Tobago', code: '+1-868' },
    { name: 'Tunisia', code: '+216' },
    { name: 'Turkey', code: '+90' },
    { name: 'Turkmenistan', code: '+993' },
    { name: 'Tuvalu', code: '+688' },
    { name: 'Uganda', code: '+256' },
    { name: 'Ukraine', code: '+380' },
    { name: 'United Arab Emirates', code: '+971' },
    { name: 'United Kingdom', code: '+44' },
    { name: 'United States', code: '+1' },
    { name: 'Uruguay', code: '+598' },
    { name: 'Uzbekistan', code: '+998' },
    { name: 'Vanuatu', code: '+678' },
    { name: 'Vatican City', code: '+379' },
    { name: 'Venezuela', code: '+58' },
    { name: 'Vietnam', code: '+84' },
    { name: 'Yemen', code: '+967' },
    { name: 'Zambia', code: '+260' },
    { name: 'Zimbabwe', code: '+263' }
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
  COMPLETE_PROFILE: 5,    // Points for completing the initial user profile setup.
  CLEAR_OVERDUE: 30,      // Points for clearing an overdue payment.
};

/**
 * Initial state for the user's gamification statistics.
 */
export const INITIAL_GAMIFICATION_STATS: GamificationStats = {
  points: 0,
  level: 1,
  levelName: TUTOR_RANK_LEVELS[0].name, // Starts at the first rank.
  streak: 0,
  lastActiveDate: null,
};

/**
 * Definitions for all available achievements in the application.
 * Each achievement has an ID, name, description, initial achieved state (false), and an icon.
 */
export const ACHIEVEMENTS_DEFINITIONS: Achievement[] = [
  { id: AchievementId.FirstStudentAdded, name: "First Student Enrolled", description: "You've added your first student!", achieved: false, icon: "academic-cap" },
  { id: AchievementId.StudentRosterStarter, name: "Student Roster Starter", description: "You're managing 5 students!", achieved: false, icon: "users" },
  { id: AchievementId.TenStudentsEnrolled, name: "Growing Roster", description: "You're managing 10 students!", achieved: false, icon: "trending-up" },
  { id: AchievementId.TwentyFiveStudentsEnrolled, name: "Popular Tutor", description: "You're managing 25 students!", achieved: false, icon: "star" },
  { id: AchievementId.FiftyStudentsEnrolled, name: "Tutor Tycoon", description: "You're managing 50 students!", achieved: false, icon: "crown" },
  { id: AchievementId.FirstPaymentLogged, name: "First Payment Logged", description: "Cha-ching! First payment recorded.", achieved: false, icon: "banknotes" },
  { id: AchievementId.TenPaymentsLogged, name: "Steady Income", description: "Logged 10 payments.", achieved: false, icon: "currency-dollar" },
  { id: AchievementId.FiftyPaymentsLogged, name: "Payment Pro", description: "Logged 50 payments.", achieved: false, icon: "building" },
  { id: AchievementId.First100Earned, name: "Income Stream Starter", description: "Earned your first 100 (or equivalent).", achieved: false, icon: "banknotes" },
  { id: AchievementId.First1000Earned, name: "Four Figures", description: "Earned your first 1,000 (or equivalent).", achieved: false, icon: "gem" },
  { id: AchievementId.First5000Earned, name: "High Earner", description: "Earned your first 5,000 (or equivalent).", achieved: false, icon: "rocket" },
  { id: AchievementId.DebtDemolisher, name: "Debt Demolisher", description: "Cleared all overdue payments!", achieved: false, icon: "check-circle" },
  { id: AchievementId.SevenDayStreak, name: "7-Day Streak", description: "Logged in for 7 consecutive days!", achieved: false, icon: "flame" },
  { id: AchievementId.ThirtyDayStreak, name: "30-Day Streak", description: "Logged in for 30 consecutive days!", achieved: false, icon: "calendar" },
  { id: AchievementId.HundredDayStreak, name: "100-Day Streak", description: "Logged in for 100 consecutive days!", achieved: false, icon: "award" },
  { id: AchievementId.ProfileCompleted, name: "All Set Up", description: "Completed your profile details.", achieved: false, icon: "check-circle" },
  { id: AchievementId.FirstGoalMet, name: "Goal Crusher", description: "Meet your monthly income goal for the first time.", achieved: false, icon: "target" },
  { id: AchievementId.MarathonSession, name: "Marathon Tutor", description: "Log a single session lasting 3 hours or more.", achieved: false, icon: "clock" },
  { id: AchievementId.BonusEarned, name: "Above and Beyond", description: "Receive an overpayment or tip from a student.", achieved: false, icon: "gift" },
  { id: AchievementId.BusyBee, name: "Busy Bee", description: "Log 3 or more lessons on the same day.", achieved: false, icon: "bolt" },
  { id: AchievementId.SubjectMaster, name: "Subject Master", description: "Teach at least 3 different subjects across your students.", achieved: false, icon: "brain" },
  { id: AchievementId.LoyalScholar, name: "Loyal Scholar", description: "Log 10 lessons for a single student.", achieved: false, icon: "handshake" },
  { id: AchievementId.HighTicket, name: "High Ticket", description: "Log a single payment of 150 or more.", achieved: false, icon: "ticket" },
  { id: AchievementId.LevelFive, name: "Rising Star", description: "Reach Level 5 as a tutor.", achieved: false, icon: "star" },
  { id: AchievementId.CenturyClub, name: "Century Club", description: "Log 100 total lessons.", achieved: false, icon: "trophy" },
  { id: AchievementId.RateDiversifier, name: "Diversified Portfolio", description: "Have students with hourly, per lesson, and monthly rates.", achieved: false, icon: "briefcase" },
];