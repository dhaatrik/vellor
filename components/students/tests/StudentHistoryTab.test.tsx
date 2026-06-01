import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudentHistoryTab } from '../StudentHistoryTab';
import { PaymentStatus, Transaction } from '../../../types';

vi.mock('../../ui', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  Icon: () => <span data-testid="icon" />,
}));

vi.mock('../../transactions/TransactionStatusBadge', () => ({
  TransactionStatusBadge: ({ status }: any) => <span data-testid={`status-${status}`}>{status}</span>,
}));

vi.mock('../../../helpers', () => ({
  formatCurrency: (amount: number, symbol: string) => `${symbol}${amount.toFixed(2)}`,
  formatDate: (dateString: string) => `Formatted ${dateString}`,
}));

describe('StudentHistoryTab', () => {
  const mockOnLogPayment = vi.fn();
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      studentId: 'student-1',
      date: '2023-10-26T10:00:00.000Z',
      lessonDuration: 60,
      lessonFee: 50,
      amountPaid: 50,
      status: PaymentStatus.Paid,
      createdAt: '2023-10-26T10:00:00.000Z',
      notes: 'First lesson notes',
    },
    {
      id: 'tx-2',
      studentId: 'student-1',
      date: '2023-10-27T10:00:00.000Z',
      lessonDuration: 60,
      lessonFee: 50,
      amountPaid: 25,
      status: PaymentStatus.PartiallyPaid,
      createdAt: '2023-10-27T10:00:00.000Z',
    },
    {
      id: 'tx-3',
      studentId: 'student-1',
      date: '2023-10-28T10:00:00.000Z',
      lessonDuration: 60,
      lessonFee: 50,
      amountPaid: 0,
      status: PaymentStatus.Due,
      createdAt: '2023-10-28T10:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    studentTransactions: mockTransactions,
    totalOwed: 75,
    totalPaidForStudent: 75,
    currencySymbol: '$',
    studentId: 'student-1',
    onLogPayment: mockOnLogPayment,
  };

  it('renders student transactions correctly with default "All" filter', () => {
    render(<StudentHistoryTab {...defaultProps} />);

    expect(screen.getByText('Formatted 2023-10-26T10:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText('Formatted 2023-10-27T10:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText('Formatted 2023-10-28T10:00:00.000Z')).toBeInTheDocument();

    // Check note
    expect(screen.getByText('First lesson notes')).toBeInTheDocument();

    // Check financial totals
    expect(screen.getAllByText('$75.00').length).toBeGreaterThan(0);

    expect(screen.getByTestId('status-Paid')).toBeInTheDocument();
    expect(screen.getByTestId('status-Partially Paid')).toBeInTheDocument();
    expect(screen.getByTestId('status-Due')).toBeInTheDocument();
  });

  it('filters transactions when selecting "Paid"', () => {
    render(<StudentHistoryTab {...defaultProps} />);

    const select = screen.getByLabelText('Filter transactions');
    fireEvent.change(select, { target: { value: 'paid' } });

    expect(screen.getByText('Formatted 2023-10-26T10:00:00.000Z')).toBeInTheDocument(); // Paid
    expect(screen.queryByText('Formatted 2023-10-27T10:00:00.000Z')).not.toBeInTheDocument(); // Partially Paid
    expect(screen.queryByText('Formatted 2023-10-28T10:00:00.000Z')).not.toBeInTheDocument(); // Due
  });

  it('filters transactions when selecting "Due"', () => {
    render(<StudentHistoryTab {...defaultProps} />);

    const select = screen.getByLabelText('Filter transactions');
    fireEvent.change(select, { target: { value: 'due' } });

    expect(screen.queryByText('Formatted 2023-10-26T10:00:00.000Z')).not.toBeInTheDocument(); // Paid
    expect(screen.queryByText('Formatted 2023-10-27T10:00:00.000Z')).not.toBeInTheDocument(); // Partially Paid
    expect(screen.getByText('Formatted 2023-10-28T10:00:00.000Z')).toBeInTheDocument(); // Due
  });

  it('filters transactions when selecting "Partially Paid"', () => {
    render(<StudentHistoryTab {...defaultProps} />);

    const select = screen.getByLabelText('Filter transactions');
    fireEvent.change(select, { target: { value: 'partially-paid' } });

    expect(screen.queryByText('Formatted 2023-10-26T10:00:00.000Z')).not.toBeInTheDocument(); // Paid
    expect(screen.getByText('Formatted 2023-10-27T10:00:00.000Z')).toBeInTheDocument(); // Partially Paid
    expect(screen.queryByText('Formatted 2023-10-28T10:00:00.000Z')).not.toBeInTheDocument(); // Due
  });

  it('renders correct empty state when filter yields no results', () => {
    // Only pass Paid transactions
    render(<StudentHistoryTab {...defaultProps} studentTransactions={[mockTransactions[0]]} />);

    // Switch to "Due"
    const select = screen.getByLabelText('Filter transactions');
    fireEvent.change(select, { target: { value: 'due' } });

    expect(screen.getByText('No transactions found for this filter.')).toBeInTheDocument();
    // The "Log their first lesson" button shouldn't show if it's just a filter empty state
    expect(screen.queryByText('Log their first lesson')).not.toBeInTheDocument();
  });

  it('renders empty state when no transactions exist', () => {
    render(<StudentHistoryTab {...defaultProps} studentTransactions={[]} totalOwed={0} totalPaidForStudent={0} />);

    expect(screen.getByText('No transactions logged yet.')).toBeInTheDocument();
    const logPaymentBtn = screen.getByText('Log their first lesson');
    expect(logPaymentBtn).toBeInTheDocument();

    fireEvent.click(logPaymentBtn);
    expect(mockOnLogPayment).toHaveBeenCalledTimes(1);
    expect(mockOnLogPayment).toHaveBeenCalledWith('student-1');
  });
});
