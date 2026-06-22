import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { TransactionsPage } from '../../pages/TransactionsPage';
import { MemoryRouter } from 'react-router-dom';
import * as storeMod from '../../store';
import { PaymentStatus } from '../../types';
import * as pdfMod from '../../pdf';

// Mock the virtualizer
vi.mock('@tanstack/react-virtual', () => ({
  useWindowVirtualizer: vi.fn().mockReturnValue({
    getTotalSize: () => 1000,
    getVirtualItems: () => [
      { index: 0, start: 0, measureElement: vi.fn() },
    ],
  }),
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock PDF and Helpers
vi.mock('../../pdf', () => ({
  generateBulkInvoicePDF: vi.fn().mockReturnValue(true),
}));
vi.mock('../../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../helpers')>();
  return {
    ...actual,
    generateWhatsAppLink: vi.fn(),
  };
});

const mockStudents = [
  { id: 'student1', firstName: 'John', lastName: 'Doe', contact: {} }
];

const mockTransactions = [
  {
    id: 'tx1',
    studentId: 'student1',
    date: '2023-10-01T10:00:00Z',
    status: PaymentStatus.Paid,
    lessonFee: 50,
    amountPaid: 50,
  }
];

const mockSettings = { currencySymbol: '$', userName: 'Test Tutor' };

describe('TransactionsPage', () => {
  let storeState: any;

  beforeEach(() => {
    vi.clearAllMocks();
    storeState = {
      transactions: mockTransactions,
      students: mockStudents,
      addTransaction: vi.fn(),
      updateTransaction: vi.fn(),
      deleteTransaction: vi.fn(),
      addToast: vi.fn(),
      settings: mockSettings,
    };
    vi.spyOn(storeMod, 'useStore').mockImplementation((selector: any) => selector(storeState));
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <TransactionsPage />
      </MemoryRouter>
    );
  };

  it('renders transactions successfully', () => {
    renderComponent();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('filters transactions correctly', () => {
    renderComponent();

    // Switch to 'Unpaid' filter
    fireEvent.click(screen.getByRole('button', { name: 'Unpaid' }));
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

    // Switch to 'Paid' filter
    fireEvent.click(screen.getByRole('button', { name: 'Paid' }));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });



  it('generates bulk invoice', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Monthly Statements' }));
    expect(pdfMod.generateBulkInvoicePDF).toHaveBeenCalledWith(mockStudents, mockTransactions, mockSettings);
  });

  it('shows no transactions state when list is empty', () => {
     storeState.transactions = [];
     renderComponent();
     expect(screen.getByText('No Transactions Yet')).toBeInTheDocument();
  });

  it('shows error toast when WhatsApp share fails', async () => {
    // We are testing the async error path with navigator.share throwing an error.
    // Ensure navigator exists.
    Object.defineProperty(global, 'navigator', {
      value: { share: vi.fn().mockRejectedValue(new Error('Share failed')) },
      writable: true,
      configurable: true
    });

    renderComponent();

    // Trigger share
    fireEvent.click(screen.getAllByRole('button', { name: 'Share via WhatsApp' })[0]);

    // Wait for the asynchronous logic to execute and catch block to trigger
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(storeState.addToast).toHaveBeenCalledWith('Failed to generate WhatsApp link.', 'error');
  });
});