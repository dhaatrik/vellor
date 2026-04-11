import { describe, it, expect, beforeEach } from 'vitest';
import {
  currentHoveredTransactionId,
  currentHoveredTransaction,
  currentHoveredStudentId,
  setHoveredTransaction,
  setHoveredStudent,
} from './globalHover';

describe('globalHover', () => {
  beforeEach(() => {
    // Reset global state before each test
    setHoveredTransaction(null);
    setHoveredStudent(null);
  });

  describe('setHoveredTransaction', () => {
    it('should set currentHoveredTransactionId and currentHoveredTransaction to the given id and transaction', () => {
      expect(currentHoveredTransactionId).toBeNull();
      expect(currentHoveredTransaction).toBeNull();
      const mockTx: any = { id: 'tx-123' };
      setHoveredTransaction('tx-123', mockTx);
      expect(currentHoveredTransactionId).toBe('tx-123');
      expect(currentHoveredTransaction).toBe(mockTx);
    });

    it('should set currentHoveredTransactionId and currentHoveredTransaction to null', () => {
      const mockTx: any = { id: 'tx-123' };
      setHoveredTransaction('tx-123', mockTx);
      expect(currentHoveredTransactionId).toBe('tx-123');
      expect(currentHoveredTransaction).toBe(mockTx);
      setHoveredTransaction(null, null);
      expect(currentHoveredTransactionId).toBeNull();
      expect(currentHoveredTransaction).toBeNull();
    });
  });

  describe('setHoveredStudent', () => {
    it('should set currentHoveredStudentId to the given id', () => {
      expect(currentHoveredStudentId).toBeNull();
      setHoveredStudent('student-456');
      expect(currentHoveredStudentId).toBe('student-456');
    });

    it('should set currentHoveredStudentId to null', () => {
      setHoveredStudent('student-456');
      expect(currentHoveredStudentId).toBe('student-456');
      setHoveredStudent(null);
      expect(currentHoveredStudentId).toBeNull();
    });
  });
});
