import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useStore } from '../store';
import * as globalHover from '../helpers/globalHover';
import { PaymentStatus, Transaction } from '../types';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

// Mock dependencies
vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

// We must mock the properties directly on the module object
vi.mock('../helpers/globalHover', () => ({
  get currentHoveredTransactionId() { return null; },
  get currentHoveredStudentId() { return null; }
}));

describe('useKeyboardShortcuts', () => {
  let onOpenSearch: Mock;
  let onOpenQuickLog: Mock;
  let onOpenHelp: Mock;
  let mockUpdateTransaction: Mock;
  let mockAddToast: Mock;

  // Platform mocking
  let originalPlatform: string;

  beforeEach(() => {
    onOpenSearch = vi.fn();
    onOpenQuickLog = vi.fn();
    onOpenHelp = vi.fn();
    mockUpdateTransaction = vi.fn();
    mockAddToast = vi.fn();

    (useStore as unknown as Mock).mockReturnValue({
      transactions: [],
      updateTransaction: mockUpdateTransaction,
      addToast: mockAddToast,
    });

    originalPlatform = Object.getOwnPropertyDescriptor(navigator, 'platform')?.value;

    // Default to a non-Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      configurable: true
    });
    // Reset mocked getters manually if possible, or just re-stub
    vi.spyOn(globalHover, 'currentHoveredTransactionId', 'get').mockReturnValue(null);
    vi.spyOn(globalHover, 'currentHoveredStudentId', 'get').mockReturnValue(null);
  });

  const fireKeyDown = (key: string, options: Partial<KeyboardEvent> = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      ...options,
    });
    window.dispatchEvent(event);
  };

  it('triggers onOpenSearch with Ctrl+K on Windows/Linux', () => {
    renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

    fireKeyDown('k', { ctrlKey: true });
    expect(onOpenSearch).toHaveBeenCalledTimes(1);

    fireKeyDown('K', { ctrlKey: true }); // uppercase test
    expect(onOpenSearch).toHaveBeenCalledTimes(2);
  });

  it('triggers onOpenSearch with Cmd+K on Mac', () => {
    Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });
    renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

    fireKeyDown('k', { metaKey: true });
    expect(onOpenSearch).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpenQuickLog with Ctrl+L on Windows/Linux', () => {
    renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

    fireKeyDown('l', { ctrlKey: true });
    expect(onOpenQuickLog).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpenHelp with Ctrl+/ on Windows/Linux', () => {
    renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

    fireKeyDown('/', { ctrlKey: true });
    expect(onOpenHelp).toHaveBeenCalledTimes(1);
  });

  it('ignores shortcuts if typed inside an input field', () => {
    renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    });
    input.dispatchEvent(event);

    expect(onOpenSearch).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('ignores shortcuts if typed inside a textarea', () => {
    renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    const event = new KeyboardEvent('keydown', {
      key: 'l',
      ctrlKey: true,
      bubbles: true,
    });
    textarea.dispatchEvent(event);

    expect(onOpenQuickLog).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  describe('Shift+P logic', () => {
    it('marks hovered transaction as paid if hovered (Shift+P)', () => {
      const mockTx: Transaction = {
        id: 'tx-1',
        studentId: 'st-1',
        date: '2023-01-01',
        lessonDuration: 60,
        lessonFee: 100,
        amountPaid: 0,
        status: PaymentStatus.Due,
        createdAt: '2023-01-01T00:00:00Z',
      };

      (useStore as unknown as Mock).mockReturnValue({
        transactions: [mockTx],
        updateTransaction: mockUpdateTransaction,
        addToast: mockAddToast,
      });

      vi.spyOn(globalHover, 'currentHoveredTransactionId', 'get').mockReturnValue('tx-1');

      renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

      fireKeyDown('p', { shiftKey: true });

      expect(mockUpdateTransaction).toHaveBeenCalledWith('tx-1', {
        amountPaid: 100,
        status: PaymentStatus.Paid,
      });
      expect(mockAddToast).toHaveBeenCalledWith('Transaction marked as paid!', 'success');
    });

    it('does nothing if hovered transaction is already paid (Shift+P)', () => {
      const mockTx: Transaction = {
        id: 'tx-1',
        studentId: 'st-1',
        date: '2023-01-01',
        lessonDuration: 60,
        lessonFee: 100,
        amountPaid: 100,
        status: PaymentStatus.Paid,
        createdAt: '2023-01-01T00:00:00Z',
      };

      (useStore as unknown as Mock).mockReturnValue({
        transactions: [mockTx],
        updateTransaction: mockUpdateTransaction,
        addToast: mockAddToast,
      });

      vi.spyOn(globalHover, 'currentHoveredTransactionId', 'get').mockReturnValue('tx-1');

      renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

      fireKeyDown('p', { shiftKey: true });

      expect(mockUpdateTransaction).not.toHaveBeenCalled();
      expect(mockAddToast).not.toHaveBeenCalled();
    });

    it('marks all due transactions for hovered student as paid (Shift+P)', () => {
      const mockTx1: Transaction = {
        id: 'tx-1', studentId: 'st-1', date: '2023-01-01', lessonDuration: 60,
        lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, createdAt: '2023-01-01T00:00:00Z',
      };
      const mockTx2: Transaction = {
        id: 'tx-2', studentId: 'st-1', date: '2023-01-02', lessonDuration: 60,
        lessonFee: 50, amountPaid: 20, status: PaymentStatus.PartiallyPaid, createdAt: '2023-01-02T00:00:00Z',
      };
      const mockTx3: Transaction = {
        id: 'tx-3', studentId: 'st-2', date: '2023-01-03', lessonDuration: 60,
        lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, createdAt: '2023-01-03T00:00:00Z', // different student
      };

      (useStore as unknown as Mock).mockReturnValue({
        transactions: [mockTx1, mockTx2, mockTx3],
        updateTransaction: mockUpdateTransaction,
        addToast: mockAddToast,
      });

      vi.spyOn(globalHover, 'currentHoveredStudentId', 'get').mockReturnValue('st-1');

      renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

      fireKeyDown('p', { shiftKey: true });

      expect(mockUpdateTransaction).toHaveBeenCalledTimes(2);
      expect(mockUpdateTransaction).toHaveBeenCalledWith('tx-1', { amountPaid: 50, status: PaymentStatus.Paid });
      expect(mockUpdateTransaction).toHaveBeenCalledWith('tx-2', { amountPaid: 50, status: PaymentStatus.Paid });

      expect(mockAddToast).toHaveBeenCalledWith('Marked 2 lesson(s) as paid!', 'success');
    });

    it('shows info toast if hovered student has no due transactions (Shift+P)', () => {
      const mockTx: Transaction = {
        id: 'tx-1', studentId: 'st-1', date: '2023-01-01', lessonDuration: 60,
        lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, createdAt: '2023-01-01T00:00:00Z',
      };

      (useStore as unknown as Mock).mockReturnValue({
        transactions: [mockTx],
        updateTransaction: mockUpdateTransaction,
        addToast: mockAddToast,
      });

      vi.spyOn(globalHover, 'currentHoveredStudentId', 'get').mockReturnValue('st-1');

      renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

      fireKeyDown('p', { shiftKey: true });

      expect(mockUpdateTransaction).not.toHaveBeenCalled();
      expect(mockAddToast).toHaveBeenCalledWith('No due lessons found for this student.', 'info');
    });
  });

  it('cleans up event listener on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts(onOpenSearch, onOpenQuickLog, onOpenHelp));

    unmount();

    fireKeyDown('k', { ctrlKey: true });
    expect(onOpenSearch).not.toHaveBeenCalled();
  });
});
