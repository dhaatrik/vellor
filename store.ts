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

// Custom Storage Engine for Zustand Persist using localforage + encryption
const storageEngine = {
  getItem: async (name: string): Promise<string | null> => {
    const raw = await localforage.getItem<string>(name);
    if (!raw) return null;
    
    if (globalMasterKey) {
      try {
        const obj = await decryptObject(raw, globalMasterKey);
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
      const obj = JSON.parse(value);
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
  
  const totalUnpaid = useMemo(() => transactions.reduce((acc, t) => {
    if (t.status === PaymentStatus.Due) return acc + t.lessonFee;
    if (t.status === PaymentStatus.PartiallyPaid) return acc + (t.lessonFee - t.amountPaid);
    return acc;
  }, 0), [transactions]);

  const totalPaidThisMonth = useMemo(() => transactions.reduce((acc, t) => {
    const transactionDate = new Date(t.date);
    const today = new Date();
    if (
      transactionDate.getFullYear() === today.getFullYear() &&
      transactionDate.getMonth() === today.getMonth() &&
      (t.status === PaymentStatus.Paid || t.status === PaymentStatus.PartiallyPaid || t.status === PaymentStatus.Overpaid)
    ) {
      return acc + t.amountPaid;
    }
    return acc;
  }, 0), [transactions]);

  const activeStudentsCount = useMemo(() => students.length, [students]);

  const overduePayments = useMemo(() => transactions.filter(t => {
    const isOverdueStatus = t.status === PaymentStatus.Due || (t.status === PaymentStatus.PartiallyPaid && t.amountPaid < t.lessonFee);
    const today = new Date();
    today.setHours(0,0,0,0); 
    return isOverdueStatus && new Date(t.date) < today;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [transactions]);

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
