/**
 * @file store.ts
 * Rewritten with Zustand, localForage, Web Crypto API, and Slice Pattern.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { useMemo } from 'react';
import { encryptObject, decryptObject } from './src/crypto';
import { PaymentStatus } from './types';
import { z } from 'zod';

// Slice Imports
import { AppState } from './store/types';
import { createStudentSlice } from './store/createStudentSlice';
import { createTransactionSlice } from './store/createTransactionSlice';
import { createGamificationSlice } from './store/createGamificationSlice';
import { createUISlice } from './store/createUISlice';
import { createSettingsSlice } from './store/createSettingsSlice';
import { createDataManagementSlice } from './store/createDataManagementSlice';

// Re-export AppState for potential type uses elsewhere
export type { AppState };

// --- Encryption & Initialization ---

export let globalMasterKey: CryptoKey | null = null;
export const setGlobalMasterKey = (key: CryptoKey | null) => {
  globalMasterKey = key;
};

// Zustand Persist State Schema for Vellor
// We validate the structure to ensure data integrity after decryption
const persistSchema = z.object({
  state: z.object({
    students: z.array(z.any()).optional(),
    transactions: z.array(z.any()).optional(),
    gamification: z.any().optional(),
    achievements: z.array(z.any()).optional(),
    settings: z.any().optional(),
    toasts: z.array(z.any()).optional(),
    activityLog: z.array(z.any()).optional(),
  }).catchall(z.any()),
  version: z.number().optional()
}).catchall(z.any());

// Custom Storage Engine for Zustand Persist using localforage + encryption
export const storageEngine = {
  getItem: async (name: string): Promise<string | null> => {
    const raw = await localforage.getItem<string>(name);
    if (!raw) return null;
    
    if (globalMasterKey) {
      try {
        const obj = await decryptObject(
          raw,
          globalMasterKey,
          persistSchema,
          async (data) => {
            // Re-encrypt insecure legacy data into ciphertext
            const encrypted = await encryptObject(data, globalMasterKey as CryptoKey);
            await localforage.setItem(name, encrypted);
          }
        );
        return JSON.stringify(obj);
      } catch (error) {
        console.error("Decryption failed", error);
        throw error;
      }
    }
    return null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (globalMasterKey) {
      const obj = JSON.parse(value, (k, v) => {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
          return undefined;
        }
        return v;
      });
      const encrypted = await encryptObject(obj, globalMasterKey);
      await localforage.setItem(name, encrypted);
    } else {
      await localforage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  }
};

// --- Combine Slices into One Store ---
export const useStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createStudentSlice(...a),
      ...createTransactionSlice(...a),
      ...createGamificationSlice(...a),
      ...createUISlice(...a),
      ...createSettingsSlice(...a),
      ...createDataManagementSlice(...a),
    }),
    {
      name: 'vellor-storage',
      storage: createJSONStorage(() => storageEngine),
      skipHydration: true, // We will manually hydrate when Master Password is provided
    }
  )
);

// --- Memoized Derived Statistics Hook ---
export const useDerivedData = () => {
  const transactions = useStore(state => state.transactions);
  const students = useStore(state => state.students);
  
  const activeStudentsCount = useMemo(() => students.length, [students]);

  const { totalUnpaid, totalPaidThisMonth, overduePayments } = useMemo(() => {
    // ⚡ Bolt Performance: Hoist loop-invariant Date and extraction
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    let unpaid = 0;
    let paidThisMonth = 0;
    const overdue = [];

    // ⚡ Bolt Performance: Single pass over transactions instead of two reduce + filter
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];

      if (t.status === PaymentStatus.Due) {
        unpaid += t.lessonFee;
        if (new Date(t.date).getTime() < todayTime) {
          overdue.push(t);
        }
      } else if (t.status === PaymentStatus.PartiallyPaid) {
        unpaid += (t.lessonFee - t.amountPaid);
        const transactionDate = new Date(t.date);
        const tTime = transactionDate.getTime();

        if (t.amountPaid < t.lessonFee && tTime < todayTime) {
          overdue.push(t);
        }

        if (transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === currentMonth) {
          paidThisMonth += t.amountPaid;
        }
      } else if (t.status === PaymentStatus.Paid || t.status === PaymentStatus.Overpaid) {
        const transactionDate = new Date(t.date);
        if (transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === currentMonth) {
          paidThisMonth += t.amountPaid;
        }
      }
    }

    overdue.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { totalUnpaid: unpaid, totalPaidThisMonth: paidThisMonth, overduePayments: overdue };
  }, [transactions]);

  return {
    totalUnpaid,
    totalPaidThisMonth,
    activeStudentsCount,
    overduePayments
  };
};

export const useData = Object.assign(useStore, {
  derived: useDerivedData
});
