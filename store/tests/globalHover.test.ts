import { describe, it, expect, beforeEach } from 'vitest';
import {
  currentHoveredTransactionId,
  currentHoveredStudentId,
  setHoveredTransaction,
  setHoveredStudent,
} from '../../helpers/globalHover';

describe('globalHover', () => {
  beforeEach(() => {
    // Reset global state before each test
    setHoveredTransaction(null);
    setHoveredStudent(null);
  });

  describe('setHoveredTransaction', () => {
    it('should set currentHoveredTransactionId to the given id', () => {
      expect(currentHoveredTransactionId).toBeNull();
      setHoveredTransaction('tx-123');
      expect(currentHoveredTransactionId).toBe('tx-123');
    });

    it('should set currentHoveredTransactionId to null', () => {
      setHoveredTransaction('tx-123');
      expect(currentHoveredTransactionId).toBe('tx-123');
      setHoveredTransaction(null);
      expect(currentHoveredTransactionId).toBeNull();
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
