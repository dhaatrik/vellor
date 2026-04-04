import { z } from 'zod';
import { Theme, PaymentStatus, AchievementId, IconName } from '../types';

export const phoneNumberSchema = z.object({
  countryCode: z.string(),
  number: z.string(),
});

export const parentSchema = z.object({
  name: z.string(),
  relationship: z.string(),
});

export const contactInfoSchema = z.object({
  studentPhone: phoneNumberSchema.optional(),
  parentPhone1: phoneNumberSchema.optional(),
  parentPhone2: phoneNumberSchema.optional(),
  email: z.string().optional(),
});

export const tuitionDetailsSchema = z.object({
  subjects: z.array(z.string()),
  defaultRate: z.number(),
  rateType: z.enum(['hourly', 'per_lesson', 'monthly']),
  typicalLessonDuration: z.number(),
  preferredPaymentMethod: z.string().optional(),
});

export const studentSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  country: z.string().optional(),
  parent: parentSchema.optional(),
  contact: contactInfoSchema,
  tuition: tuitionDetailsSchema,
  notes: z.string().optional(),
  createdAt: z.string(),
});

export const transactionSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  date: z.string(),
  lessonDuration: z.number(),
  lessonFee: z.number(),
  amountPaid: z.number(),
  paymentMethod: z.string().optional(),
  status: z.nativeEnum(PaymentStatus),
  notes: z.string().optional(),
  createdAt: z.string(),
});

export const appSettingsSchema = z.object({
  theme: z.nativeEnum(Theme),
  currencySymbol: z.string(),
  userName: z.string(),
  country: z.string().optional(),
  phone: phoneNumberSchema.optional(),
  email: z.string().optional(),
  monthlyGoal: z.number().optional(),
});

export const gamificationStatsSchema = z.object({
  points: z.number(),
  level: z.number(),
  levelName: z.string(),
  streak: z.number(),
  lastActiveDate: z.string().nullable(),
});

export const achievementSchema = z.object({
  id: z.nativeEnum(AchievementId),
  name: z.string(),
  description: z.string(),
  achieved: z.boolean(),
  dateAchieved: z.string().optional(),
  icon: z.string(),
});

export const activitySchema = z.object({
  id: z.string(),
  message: z.string(),
  icon: z.custom<IconName>(),
  timestamp: z.string(),
});

export const backupSchema = z.object({
  students: z.array(studentSchema),
  transactions: z.array(transactionSchema),
  settings: appSettingsSchema,
  gamification: gamificationStatsSchema.optional(),
  achievements: z.array(achievementSchema).optional(),
  activityLog: z.array(activitySchema).optional(),
});
