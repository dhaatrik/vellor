import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudentDetailView } from '../StudentDetailView';
import { Student, Transaction } from '../../../types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>,
    button: ({ children, className, onClick }: any) => <button className={className} onClick={onClick}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock sub-components
vi.mock('../StudentHistoryTab', () => ({
  StudentHistoryTab: () => <div data-testid="student-history-tab">History Tab Content</div>,
}));

vi.mock('../StudentProgressTab', () => ({
  StudentProgressTab: () => <div data-testid="student-progress-tab">Progress Tab Content</div>,
}));

// Mock pdf generator
vi.mock('../../../pdf', () => ({
  generateProgressReportPDF: vi.fn(),
}));

const mockStudent: Student = {
  id: 'student-1',
  firstName: 'John',
  lastName: 'Doe',
  createdAt: '2023-01-01',
  contact: {
    email: 'john@example.com',
    studentPhone: { number: '1234567890', countryCode: '+1' },
    parentPhone1: { number: '0987654321', countryCode: '+1' },
  },
  tuition: {
    subjects: ['Math', 'Science'],
    defaultRate: 50,
    rateType: 'hourly',
    typicalLessonDuration: 60,
    preferredPaymentMethod: 'Cash',
  },
  notes: 'Some notes about John.',
};

const mockTransactions: Transaction[] = [];

describe('StudentDetailView', () => {
  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnLogPayment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    student: mockStudent,
    onClose: mockOnClose,
    onEdit: mockOnEdit,
    onLogPayment: mockOnLogPayment,
    transactions: mockTransactions,
    currencySymbol: '$',
  };

  it('renders student details correctly', () => {
    render(<StudentDetailView {...defaultProps} />);

    // Check name
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Check contact info
    expect(screen.getByText('john@example.com')).toBeInTheDocument();

    // Check tuition info
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument(); // Checks formatted currency

    // Check notes
    expect(screen.getByText('Some notes about John.')).toBeInTheDocument();
  });

  it('handles edit button click', () => {
    render(<StudentDetailView {...defaultProps} />);

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockStudent);
  });

  it('handles close button click', () => {
    render(<StudentDetailView {...defaultProps} />);

    const closeButton = screen.getByText('Back to Students');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches tabs correctly', () => {
    render(<StudentDetailView {...defaultProps} />);

    // Initially should be on 'history'
    const historyButton = screen.getByText('Lesson History');
    fireEvent.click(historyButton);

    const historyTabContainer = screen.getByTestId('student-history-tab').parentElement.parentElement;
    expect(historyTabContainer).toHaveClass('block');
    expect(historyTabContainer).not.toHaveClass('hidden');

    const progressButton = screen.getByText('Academic Progress');
    fireEvent.click(progressButton);

    // After clicking progress, history should be hidden and progress should be block
    expect(historyTabContainer).toHaveClass('hidden');

    const progressTabContainer = screen.getByTestId('student-progress-tab').parentElement.parentElement;
    expect(progressTabContainer).toHaveClass('block');
    expect(progressTabContainer).not.toHaveClass('hidden');
  });
});
