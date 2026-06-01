import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuickLogModal } from '../QuickLogModal';
import { useStore } from '../../../store';
import { PaymentStatus, AttendanceStatus } from '../../../types';

// Mock the framer-motion components to render children directly without animations
vi.mock('framer-motion', () => {

  return {
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock Zustand store
vi.mock('../../../store', () => ({
  useStore: vi.fn(),
}));

describe('QuickLogModal', () => {
  const mockOnClose = vi.fn();
  const mockAddTransaction = vi.fn();

  const mockStudents = [
    {
      id: 'student-1',
      firstName: 'John',
      lastName: 'Doe',
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
      tuition: {
        rateType: 'per_lesson',
        defaultRate: 40,
        // no typicalLessonDuration
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useStore
    (useStore as any).mockImplementation((selector: any) => {
      const mockState = {
        students: mockStudents,
        addTransaction: mockAddTransaction,
        getStudentById: (id: string) => mockStudents.find(s => s.id === id),
      };
      return selector(mockState);
    });
  });

  it('renders modal when isOpen is true', () => {
    render(<QuickLogModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Quick Log')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<QuickLogModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Quick Log')).not.toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuickLogModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByLabelText('Close Quick Log');
    await user.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not submit if required fields are missing', async () => {
    render(<QuickLogModal isOpen={true} onClose={mockOnClose} />);

    // Bypass required attribute by calling onSubmit directly via fireEvent
    fireEvent.submit(screen.getByRole('button', { name: 'Log Lesson' }).closest('form')!);

    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it('submits successfully when fields are filled', async () => {
    const user = userEvent.setup();
    render(<QuickLogModal isOpen={true} onClose={mockOnClose} />);

    // Select student
    // The label component renders 'Student*' instead of 'Student', we can select by getByRole or test ID.
    // getByLabelText uses exact match by default unless we use a regex. Let's use a regex.
    const studentSelect = screen.getByLabelText(/Student/i);
    await user.selectOptions(studentSelect, 'student-1');

    // Duration should auto-fill to 60 because student-1 has typicalLessonDuration
    const durationInput = screen.getByLabelText(/Duration \(mins\)/i);
    expect(durationInput).toHaveValue(60);

    // Fill Amount Paid
    const amountInput = screen.getByLabelText(/Amount Paid/i);
    await user.clear(amountInput); // It's empty initially in quick log but good practice
    await user.type(amountInput, '50');

    // Submit
    fireEvent.submit(screen.getByRole('button', { name: 'Log Lesson' }).closest('form')!);

    expect(mockAddTransaction).toHaveBeenCalledTimes(1);
    expect(mockAddTransaction).toHaveBeenCalledWith(expect.objectContaining({
      studentId: 'student-1',
      lessonDuration: 60,
      lessonFee: 50, // (60/60) * 50 = 50
      amountPaid: 50,
      notes: 'Quick logged lesson',
      attendance: AttendanceStatus.Present,
    }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles per_lesson rate type correctly', async () => {
    const user = userEvent.setup();
    render(<QuickLogModal isOpen={true} onClose={mockOnClose} />);

    const studentSelect = screen.getByLabelText(/Student/i);
    await user.selectOptions(studentSelect, 'student-2');

    const durationInput = screen.getByLabelText(/Duration \(mins\)/i);
    await user.type(durationInput, '45');

    const amountInput = screen.getByLabelText(/Amount Paid/i);
    await user.type(amountInput, '40');

    fireEvent.submit(screen.getByRole('button', { name: 'Log Lesson' }).closest('form')!);

    expect(mockAddTransaction).toHaveBeenCalledWith(expect.objectContaining({
      studentId: 'student-2',
      lessonDuration: 45,
      lessonFee: 40, // per_lesson rate is 40
      amountPaid: 40,
    }));
  });

  describe('Make-up Flow', () => {
    it('renders with Make-up specific text', () => {
      render(<QuickLogModal isOpen={true} onClose={mockOnClose} isMakeup={true} />);
      expect(screen.getByText(/Schedule Make-up/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Schedule' })).toBeInTheDocument();
    });

    it('defaults amountPaid to 0 for Make-up', () => {
      render(<QuickLogModal isOpen={true} onClose={mockOnClose} isMakeup={true} />);
      const amountInput = screen.getByLabelText(/Amount Paid/i);
      expect(amountInput).toHaveValue(0);
    });

    it('hides attendance select for Make-up', () => {
      render(<QuickLogModal isOpen={true} onClose={mockOnClose} isMakeup={true} />);
      expect(screen.queryByLabelText(/Attendance/i)).not.toBeInTheDocument();
    });

    it('submits scheduled transaction with correct notes for Make-up', async () => {
      const user = userEvent.setup();
      render(<QuickLogModal isOpen={true} onClose={mockOnClose} isMakeup={true} />);

      const studentSelect = screen.getByLabelText(/Student/i);
      await user.selectOptions(studentSelect, 'student-1');

      // Submit form
      fireEvent.submit(screen.getByRole('button', { name: 'Schedule' }).closest('form')!);

      expect(mockAddTransaction).toHaveBeenCalledWith(expect.objectContaining({
        studentId: 'student-1',
        amountPaid: 0,
        notes: 'Scheduled Make-up Class',
        status: PaymentStatus.Scheduled,
      }));
    });
  });
});
