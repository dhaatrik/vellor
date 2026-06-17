import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { StudentListItem } from '../StudentListItem';
import { Student } from '../../../types';
import * as globalHover from '../../../helpers/globalHover';

// Mock the helpers
vi.mock('../../../helpers', () => ({
  formatCurrency: vi.fn((amount, symbol) => `${symbol}${amount.toFixed(2)}`),
}));

vi.mock('../../../helpers/globalHover', () => ({
  setHoveredStudent: vi.fn(),
}));

const mockStudent: Student = {
  id: 'student-123',
  firstName: 'Jane',
  lastName: 'Doe',
  createdAt: '2023-01-01',
  contact: {
    email: 'jane@example.com',
  },
  tuition: {
    subjects: ['Math'],
    defaultRate: 50,
    rateType: 'hourly',
    typicalLessonDuration: 60,
  },
};

describe('StudentListItem', () => {
  const mockOnSelect = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    student: mockStudent,
    onSelect: mockOnSelect,
    onDelete: mockOnDelete,
    currencySymbol: '$',
    outstandingBalance: 150.00,
  };

  it('renders student name, initials and email correctly', () => {
    render(<StudentListItem {...defaultProps} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders fallback when no email is provided', () => {
    const studentWithoutEmail = {
        ...mockStudent,
        contact: { ...mockStudent.contact, email: undefined }
    };
    render(<StudentListItem {...defaultProps} student={studentWithoutEmail} />);

    expect(screen.getByText('No email provided')).toBeInTheDocument();
  });

  it('displays outstanding balance formatted correctly', () => {
    render(<StudentListItem {...defaultProps} outstandingBalance={250.50} currencySymbol="€" />);

    expect(screen.getByText('Outstanding')).toBeInTheDocument();
    expect(screen.getByText('€250.50')).toBeInTheDocument();
  });

  it('triggers onSelect when the card is clicked', () => {
    render(<StudentListItem {...defaultProps} />);




    fireEvent.click(screen.getByText('Jane Doe'));

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockStudent);
  });

  it('triggers onDelete and prevents propagation when delete button is clicked', () => {
    render(<StudentListItem {...defaultProps} />);

    const deleteButton = screen.getByTitle('Delete student');

    const event = new MouseEvent('click', { bubbles: true });
    Object.assign(event, { stopPropagation: vi.fn() });

    fireEvent(deleteButton, event);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockStudent);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('renders toggle select button if onToggleSelect is passed and works correctly', () => {
    render(<StudentListItem {...defaultProps} onToggleSelect={mockOnToggleSelect} isSelected={false} />);

    const toggleButton = screen.getByTitle('Select Jane');
    expect(toggleButton).toBeInTheDocument();

    const event = new MouseEvent('click', { bubbles: true });
    Object.assign(event, { stopPropagation: vi.fn() });

    fireEvent(toggleButton, event);

    expect(mockOnToggleSelect).toHaveBeenCalledTimes(1);
    expect(mockOnToggleSelect).toHaveBeenCalledWith(mockStudent);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('triggers onSelect on Enter or Space keydown and prevents default', () => {
    render(<StudentListItem {...defaultProps} />);

    const card = screen.getByText('Jane Doe').closest('[role="button"]')!;

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    Object.assign(enterEvent, { preventDefault: vi.fn() });
    fireEvent(card, enterEvent);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockStudent);
    expect(enterEvent.preventDefault).toHaveBeenCalledTimes(1);

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    Object.assign(spaceEvent, { preventDefault: vi.fn() });
    fireEvent(card, spaceEvent);

    expect(mockOnSelect).toHaveBeenCalledTimes(2);
    expect(spaceEvent.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('triggers setHoveredStudent on mouse enter and leave', () => {
    render(<StudentListItem {...defaultProps} />);

    const card = screen.getByText('Jane Doe').closest('[role="button"]')!;

    fireEvent.mouseEnter(card);
    expect(globalHover.setHoveredStudent).toHaveBeenCalledWith('student-123');

    fireEvent.mouseLeave(card);
    expect(globalHover.setHoveredStudent).toHaveBeenCalledWith(null);
  });
});
