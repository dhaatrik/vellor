import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { StudentsPage } from './StudentsPage';
import { useStore } from '../store';
import { Student } from '../types';

// Mock confetti to prevent errors in Node environment
vi.mock('canvas-confetti', () => {
   return { default: vi.fn() };
});

vi.mock('../components/students/StudentForm', () => ({
  StudentForm: () => <div data-testid="student-form">Student Form Mock</div>
}));

vi.mock('../components/transactions/TransactionForm', () => ({
  TransactionForm: () => <div data-testid="transaction-form">Transaction Form Mock</div>
}));

vi.mock('../components/students/StudentDetailView', () => ({
  StudentDetailView: () => <div data-testid="student-detail-view">Student Detail View Mock</div>
}));

const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    country: 'United States',
    parent: { name: 'Jane Parent', relationship: 'Mother' },
    contact: { email: 'john@example.com' },
    tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
    notes: '',
    searchName: 'john doe'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    country: 'Canada',
    parent: { name: 'John Parent', relationship: 'Father' },
    contact: { email: 'jane@example.com' },
    tuition: { subjects: ['English'], defaultRate: 40, rateType: 'hourly', typicalLessonDuration: 45 },
    notes: '',
    searchName: 'jane smith'
  }
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('StudentsPage', () => {
  beforeEach(() => {
    useStore.setState({
      students: [],
      transactions: [],
      activityLog: [],
      settings: { currencySymbol: '$', theme: 'system', language: 'en', notifications: true },
    });
  });

  it('renders "No Students Yet" when the student list is empty', () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText('No Students Yet')).toBeInTheDocument();
    expect(screen.getByText('Your roster is empty. Add your first student to start tracking lessons and payments.')).toBeInTheDocument();
  });

  it('renders a list of students when students are present', () => {
    useStore.setState({ students: mockStudents });
    renderWithRouter(<StudentsPage />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('No Students Yet')).not.toBeInTheDocument();
  });

  it('filters students based on search term', async () => {
    useStore.setState({ students: mockStudents });
    renderWithRouter(<StudentsPage />);

    const searchInput = screen.getByPlaceholderText('Search students...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    // Wait for the state update, but in React Testing Library, change events are synchronous for standard inputs
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Check if the parent Card is hidden or if it's completely unmounted.
    // Framer motion is used, so we need to mock it or wait for it.
    // Let's just use waitFor
    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).toBeNull();
    });

    // Test empty search results
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    await waitFor(() => {
      expect(screen.getByText('No students found matching "nonexistent".')).toBeInTheDocument();
    });
  });

  it('opens the Add Student modal when "Add Student" button is clicked', () => {
    renderWithRouter(<StudentsPage />);

    // There might be multiple "Add Student" buttons (header + empty state), we just need to click one
    const addButtons = screen.getAllByRole('button', { name: /Add.*Student/i });
    fireEvent.click(addButtons[0]);

    expect(screen.getByTestId('student-form')).toBeInTheDocument();
  });

  it('opens the Add Student modal when "Add First Student" button is clicked', () => {
    renderWithRouter(<StudentsPage />);

    const addButton = screen.getByRole('button', { name: /Add First Student/i });
    fireEvent.click(addButton);

    expect(screen.getByTestId('student-form')).toBeInTheDocument();
  });

  it('triggers delete confirmation modal when delete icon is clicked', () => {
    useStore.setState({ students: mockStudents });
    renderWithRouter(<StudentsPage />);

    const deleteButtons = screen.getAllByLabelText('Delete student');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Confirm Student Deletion')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
  });
});
