import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionListItem } from '../TransactionListItem';
import { Transaction, PaymentStatus } from '../../../types';
import { setHoveredTransaction } from '../../../helpers/globalHover';
import '@testing-library/jest-dom';

vi.mock('../../../helpers/globalHover', () => ({
  setHoveredTransaction: vi.fn(),
}));

vi.mock('../../../helpers', () => ({
  formatCurrency: vi.fn((amount, symbol) => `${symbol}${amount}`),
  formatDate: vi.fn((date) => `Formatted: ${date}`),
}));

vi.mock('../TransactionStatusBadge', () => ({
  TransactionStatusBadge: ({ status }: { status: string }) => (
    <div data-testid="status-badge">{status}</div>
  ),
}));

describe('TransactionListItem', () => {
  const mockTransaction: Transaction = {
    id: 'tx-123',
    studentId: 'student-1',
    date: '2023-10-15',
    lessonDuration: 60,
    lessonFee: 100,
    amountPaid: 100,
    status: PaymentStatus.Paid,
    createdAt: "2023-10-15T12:00:00Z",
  };

  const defaultProps = {
    transaction: mockTransaction,
    studentName: 'John Doe',
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    currencySymbol: '$',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with basic info', () => {
    render(<TransactionListItem {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2023-10-15')).toBeInTheDocument();
    expect(screen.getAllByText('$100')[0]).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveTextContent(PaymentStatus.Paid);
  });

  it('renders conditionally provided payment method and notes', () => {
    const txWithExtras: Transaction = {
      ...mockTransaction,
      paymentMethod: 'Cash',
      notes: 'Test notes',
    };

    render(<TransactionListItem {...defaultProps} transaction={txWithExtras} />);

    expect(screen.getByText('Method')).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  it('does not render payment method or notes when not provided', () => {
    render(<TransactionListItem {...defaultProps} />);

    expect(screen.queryByText('Method')).not.toBeInTheDocument();
    expect(screen.queryByText('Test notes')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<TransactionListItem {...defaultProps} />);

    const editBtn = screen.getByRole('button', { name: /Edit transaction/i });
    fireEvent.click(editBtn);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTransaction);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<TransactionListItem {...defaultProps} />);

    const deleteBtn = screen.getByRole('button', { name: /Delete transaction/i });
    fireEvent.click(deleteBtn);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockTransaction);
  });

  it('calls onShareWhatsApp when share button is clicked', () => {
    const onShareWhatsApp = vi.fn();
    render(<TransactionListItem {...defaultProps} onShareWhatsApp={onShareWhatsApp} />);

    const shareBtn = screen.getByRole('button', { name: /Share via WhatsApp/i });
    fireEvent.click(shareBtn);
    expect(onShareWhatsApp).toHaveBeenCalledWith(mockTransaction);
  });

  it('does not render share button if onShareWhatsApp is not provided', () => {
    render(<TransactionListItem {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /Share via WhatsApp/i })).not.toBeInTheDocument();
  });

  it('calls setHoveredTransaction on mouse enter and leave', () => {
    const { container } = render(<TransactionListItem {...defaultProps} />);

    const card = container.firstChild as HTMLElement;

    fireEvent.mouseEnter(card);
    expect(setHoveredTransaction).toHaveBeenCalledWith('tx-123');

    fireEvent.mouseLeave(card);
    expect(setHoveredTransaction).toHaveBeenCalledWith(null);
  });
});
