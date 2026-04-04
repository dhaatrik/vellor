import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { StudentForm } from './StudentForm';
import { Student } from '../../types';
import { webcrypto } from 'node:crypto';

// Polyfill crypto if needed
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = webcrypto;
}

describe('StudentForm', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('mock-uuid-1234');
  });

  it('renders correctly for a new student', () => {
    render(<StudentForm onSave={mockOnSave} onClose={mockOnClose} />);
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Student/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    render(<StudentForm onSave={mockOnSave} onClose={mockOnClose} />);
    const submitButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with correct data when form is valid', async () => {
    const user = userEvent.setup();
    render(<StudentForm onSave={mockOnSave} onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');

    const submitButton = screen.getByRole('button', { name: /Add Student/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    const savedData = mockOnSave.mock.calls[0][0];
    expect(savedData.firstName).toBe('John');
    expect(savedData.lastName).toBe('Doe');
    expect(savedData.id).toBe('mock-uuid-1234');
    expect(savedData.country).toBe('United States'); // default value
    expect(savedData.tuition.defaultRate).toBe(50); // default value
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<StudentForm onSave={mockOnSave} onClose={mockOnClose} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('pre-fills data when editing an existing student', () => {
    const mockStudent: Student = {
      id: 'existing-id',
      createdAt: '2024-01-01T12:00:00.000Z',
      firstName: 'Jane',
      lastName: 'Smith',
      country: 'Canada',
      parent: { name: 'Mom', relationship: 'Mother' },
      contact: {
        studentPhone: { countryCode: '+1', number: '5551234' },
        parentPhone1: { countryCode: '+1', number: '' },
        parentPhone2: { countryCode: '+1', number: '' },
        email: 'jane@example.com'
      },
      tuition: {
        subjects: ['Math', 'Science'],
        defaultRate: 60,
        rateType: 'hourly',
        typicalLessonDuration: 45,
        preferredPaymentMethod: 'Online'
      },
      notes: 'Good student'
    };

    render(<StudentForm student={mockStudent} onSave={mockOnSave} onClose={mockOnClose} />);

    expect(screen.getByLabelText(/First Name/i)).toHaveValue('Jane');
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Smith');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('jane@example.com');
    // For subject, maybe use display value since it's a controlled input not tightly linked via 'for' to label text depending on how it's rendered
    expect(screen.getByDisplayValue('Math, Science')).toBeInTheDocument();
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });
});
