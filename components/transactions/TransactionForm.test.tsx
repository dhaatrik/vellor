import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionForm } from './TransactionForm';
import { useStore } from '../../store';
import { AttendanceStatus } from '../../types';

// Mock useStore hook
vi.mock('../../store', () => ({
  useStore: vi.fn(),
}));

const mockStudents = [
  {
    id: 'student-1',
    firstName: 'John',
    lastName: 'Doe',
    contact: { email: '', phone: '' },
    createdAt: new Date().toISOString(),
    tuition: {
      rateType: 'hourly',
      defaultRate: 50,
      typicalLessonDuration: 60,
    },
  },
  {
    id: 'student-2',
    firstName: 'Jane',
    lastName: 'Smith',
    contact: { email: '', phone: '' },
    createdAt: new Date().toISOString(),
    tuition: {
      rateType: 'per_lesson',
      defaultRate: 75,
      typicalLessonDuration: 45,
    },
  },
] as any;

describe('TransactionForm', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation for useStore
    (useStore as any).mockImplementation((selector: any) => {
      const state = {
        getStudentById: (id: string) => mockStudents.find((s: any) => s.id === id),
      };
      return selector(state);
    });
  });

  it('renders correctly with default values', () => {
    render(
      <TransactionForm
        students={mockStudents}
        onSave={mockOnSave}
        onClose={mockOnClose}
        currencySymbol="$"
      />
    );

    // Initial first student should be selected
    expect(screen.getByLabelText('Student')).toHaveValue('student-1');
    expect(screen.getByLabelText('Lesson Duration (minutes) / Reference')).toHaveValue(60);
    expect(screen.getByLabelText('Lesson Fee ($)')).toHaveValue(50);
    expect(screen.getByLabelText('Amount Paid ($)')).toHaveValue(50);
  });

  it('updates fee correctly when duration changes for hourly rate', () => {
    render(
      <TransactionForm
        students={mockStudents}
        onSave={mockOnSave}
        onClose={mockOnClose}
        currencySymbol="$"
      />
    );

    const durationInput = screen.getByLabelText('Lesson Duration (minutes) / Reference');
    fireEvent.change(durationInput, { target: { value: '90' } });

    // Fee should be updated to 75 (50 * 90 / 60)
    expect(screen.getByLabelText('Lesson Fee ($)')).toHaveValue(75);
  });

  it('updates duration and fee correctly when student changes', () => {
    render(
      <TransactionForm
        students={mockStudents}
        onSave={mockOnSave}
        onClose={mockOnClose}
        currencySymbol="$"
      />
    );

    const studentSelect = screen.getByLabelText('Student');
    fireEvent.change(studentSelect, { target: { value: 'student-2' } });

    // Should update duration to 45 and fee to 75 based on student-2 config
    expect(screen.getByLabelText('Lesson Duration (minutes) / Reference')).toHaveValue(45);
    expect(screen.getByLabelText('Lesson Fee ($)')).toHaveValue(75);
    expect(screen.getByLabelText('Amount Paid ($)')).toHaveValue(75);
  });

  it('calls onSave with correct data when submitted', async () => {
    render(
      <TransactionForm
        students={mockStudents}
        onSave={mockOnSave}
        onClose={mockOnClose}
        currencySymbol="$"
      />
    );

    const paymentMethodInput = screen.getByLabelText('Payment Method');
    fireEvent.change(paymentMethodInput, { target: { value: 'Cash' } });

    const submitButton = screen.getByRole('button', { name: 'Log Lesson' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData).toMatchObject({
        studentId: 'student-1',
        lessonDuration: 60,
        lessonFee: 50,
        amountPaid: 50,
        paymentMethod: 'Cash',
        attendance: AttendanceStatus.Present,
      });
      // The id, createdAt and status are auto-generated/managed
      expect(savedData.id).toBeDefined();
      expect(savedData.createdAt).toBeDefined();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <TransactionForm
        students={mockStudents}
        onSave={mockOnSave}
        onClose={mockOnClose}
        currencySymbol="$"
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows validation error when required fields are missing', async () => {
    render(
      <TransactionForm
        students={mockStudents}
        onSave={mockOnSave}
        onClose={mockOnClose}
        currencySymbol="$"
      />
    );

    // clear the date which is required
    const dateInput = screen.getByLabelText('Date');
    fireEvent.change(dateInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: 'Log Lesson' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Date is required')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
