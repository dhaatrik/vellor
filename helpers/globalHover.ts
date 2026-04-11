import { Transaction } from '../types';

export let currentHoveredTransactionId: string | null = null;
export let currentHoveredTransaction: Transaction | null = null;
export let currentHoveredStudentId: string | null = null;

export const setHoveredTransaction = (id: string | null, transaction: Transaction | null = null) => {
  currentHoveredTransactionId = id;
  currentHoveredTransaction = transaction;
};

export const setHoveredStudent = (id: string | null) => {
  currentHoveredStudentId = id;
};
