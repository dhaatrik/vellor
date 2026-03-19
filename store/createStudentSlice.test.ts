import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create } from 'zustand';
import { createStudentSlice } from './createStudentSlice';
import { AppState } from './types';
import { POINTS_ALLOCATION } from '../constants';
import { StudentFormData } from '../types';

// Create a dummy store that only includes what we need to test the student slice
// We mock the other parts of AppState that the slice uses
const useTestStore = create<AppState>()((set, get, api) => ({
  ...createStudentSlice(set, get, api),

  // Mock implementations for the other slices' dependencies
  transactions: [],
  addPoints: vi.fn(),
  addToast: vi.fn(),
  logActivity: vi.fn(),
  checkAndAwardAchievements: vi.fn(),

  // Provide defaults for the rest to satisfy AppState type (optional but good for safety)
  gamification: { points: 0, level: 1, levelName: 'Novice', streak: 0, lastActiveDate: null },
  achievements: [],
  toasts: [],
  activityLog: [],
  settings: { theme: 'light' as any, currencySymbol: '$', userName: 'Teacher' },
  addTransaction: vi.fn() as any,
  updateTransaction: vi.fn() as any,
  deleteTransaction: vi.fn() as any,
  getTransactionsByStudent: vi.fn() as any,
  exportTransactionsCSV: vi.fn() as any,
  updateSettings: vi.fn() as any,
  toggleTheme: vi.fn() as any,
  deleteActivity: vi.fn() as any,
  clearActivityLog: vi.fn() as any,
  exportData: vi.fn() as any,
  importData: vi.fn() as any,
  resetData: vi.fn() as any,
  logout: vi.fn() as any,
}));

describe('createStudentSlice', () => {
  beforeEach(() => {
    // Reset state before each test
    useTestStore.setState({ students: [], transactions: [] });
    vi.clearAllMocks();

    // Mock crypto.randomUUID to return unique values
    let uuidCounter = 0;
    vi.stubGlobal('crypto', {
      randomUUID: () => `test-uuid-${++uuidCounter}`
    });
  });

  const getBaseStudentData = (): StudentFormData => ({
    firstName: 'John',
    lastName: 'Doe',
    country: 'US',
    contact: {
      email: 'john@example.com',
      studentPhone: { countryCode: '+1', number: '1234567890' }
    },
    parent: {
      name: 'Jane Doe',
      relationship: 'Mother'
    },
    tuition: {
      subjects: ['Math', 'Science'],
      defaultRate: 50,
      rateType: 'hourly',
      typicalLessonDuration: 60
    },
    notes: 'Needs help with algebra'
  });

  describe('addStudent', () => {
    it('should add a new student with correct data', () => {
      const studentData = getBaseStudentData();

      const newStudent = useTestStore.getState().addStudent(studentData);

      expect(newStudent.id).toBe('test-uuid-1');
      expect(newStudent.firstName).toBe('John');
      expect(newStudent.lastName).toBe('Doe');
      expect(newStudent.createdAt).toBeDefined();

      const state = useTestStore.getState();
      expect(state.students).toHaveLength(1);
      expect(state.students[0]).toEqual(newStudent);

      // Verify integration calls
      expect(state.addPoints).toHaveBeenCalledWith(POINTS_ALLOCATION.ADD_STUDENT, expect.any(String));
      expect(state.addToast).toHaveBeenCalledWith(expect.stringContaining('added successfully'), 'success');
      expect(state.logActivity).toHaveBeenCalledWith(expect.stringContaining('Added student'), 'user');
      expect(state.checkAndAwardAchievements).toHaveBeenCalled();
    });

    it('should sanitize string inputs to remove HTML tags', () => {
      const studentData: StudentFormData = {
        ...getBaseStudentData(),
        firstName: 'John<script>alert("xss")</script>',
        lastName: '<b>Doe</b>',
        notes: '<p>Some notes</p>',
        parent: { name: '<i>Jane</i>', relationship: 'Mother' },
        tuition: { ...getBaseStudentData().tuition, subjects: ['Math<br/>', 'Science'] }
      };

      const newStudent = useTestStore.getState().addStudent(studentData);

      expect(newStudent.firstName).toBe('Johnalert("xss")');
      expect(newStudent.lastName).toBe('Doe');
      expect(newStudent.notes).toBe('Some notes');
      expect(newStudent.parent?.name).toBe('Jane');
      expect(newStudent.tuition.subjects[0]).toBe('Math');
    });

    it('should handle undefined strings during sanitization', () => {
      const studentData = getBaseStudentData();
      // Remove optional fields
      delete studentData.notes;
      delete studentData.country;

      const newStudent = useTestStore.getState().addStudent(studentData);

      expect(newStudent.notes).toBe('');
      expect(newStudent.country).toBe('');
    });
  });

  describe('updateStudent', () => {
    it('should update specific fields of a student', () => {
      const studentData = getBaseStudentData();
      const student = useTestStore.getState().addStudent(studentData);

      const updatedStudent = useTestStore.getState().updateStudent(student.id, {
        firstName: 'Johnny',
        notes: 'Updated notes'
      });

      expect(updatedStudent).toBeDefined();
      expect(updatedStudent?.firstName).toBe('Johnny');
      expect(updatedStudent?.notes).toBe('Updated notes');
      // Ensure other fields are unchanged
      expect(updatedStudent?.lastName).toBe('Doe');

      const state = useTestStore.getState();
      expect(state.students[0].firstName).toBe('Johnny');
      expect(state.addToast).toHaveBeenCalledWith(expect.stringContaining('updated'), 'success');
    });

    it('should partially update nested contact and parent fields', () => {
      const studentData = getBaseStudentData();
      const student = useTestStore.getState().addStudent(studentData);

      const updatedStudent = useTestStore.getState().updateStudent(student.id, {
        contact: {
          email: 'newemail@example.com'
          // Leave studentPhone unchanged to test partial update
        },
        parent: {
          relationship: 'Father',
          name: 'Jane Doe'
        }
      });

      expect(updatedStudent?.contact.email).toBe('newemail@example.com');
      // Original nested value should be preserved
      expect(updatedStudent?.contact.studentPhone?.number).toBe('1234567890');

      expect(updatedStudent?.parent?.relationship).toBe('Father');
      expect(updatedStudent?.parent?.name).toBe('Jane Doe'); // Unchanged
    });

    it('should sanitize strings during update', () => {
      const studentData = getBaseStudentData();
      const student = useTestStore.getState().addStudent(studentData);

      const updatedStudent = useTestStore.getState().updateStudent(student.id, {
        firstName: '<h1>Johnny</h1>'
      });

      expect(updatedStudent?.firstName).toBe('Johnny');
    });

    it('should return undefined when updating a non-existent student', () => {
      const updatedStudent = useTestStore.getState().updateStudent('invalid-id', {
        firstName: 'Ghost'
      });

      expect(updatedStudent).toBeUndefined();
    });
  });

  describe('deleteStudent', () => {
    it('should remove the student from the store', () => {
      const student = useTestStore.getState().addStudent(getBaseStudentData());

      expect(useTestStore.getState().students).toHaveLength(1);

      useTestStore.getState().deleteStudent(student.id);

      expect(useTestStore.getState().students).toHaveLength(0);
      expect(useTestStore.getState().addToast).toHaveBeenCalledWith(expect.stringContaining('deleted'), 'info');
    });

    it('should remove associated transactions when deleting a student', () => {
      const student = useTestStore.getState().addStudent(getBaseStudentData());

      // Inject dummy transactions into the test store
      useTestStore.setState({
        transactions: [
          { id: 't1', studentId: student.id } as any,
          { id: 't2', studentId: student.id } as any,
          { id: 't3', studentId: 'other-student-id' } as any
        ]
      });

      expect(useTestStore.getState().transactions).toHaveLength(3);

      useTestStore.getState().deleteStudent(student.id);

      const remainingTransactions = useTestStore.getState().transactions;
      expect(remainingTransactions).toHaveLength(1);
      expect(remainingTransactions[0].studentId).toBe('other-student-id');
    });
  });

  describe('getStudentById', () => {
    it('should return the correct student by ID', () => {
      useTestStore.getState().addStudent({ ...getBaseStudentData(), firstName: 'Alice' });
      const student2 = useTestStore.getState().addStudent({ ...getBaseStudentData(), firstName: 'Bob' });

      const foundStudent = useTestStore.getState().getStudentById(student2.id);

      expect(foundStudent).toBeDefined();
      expect(foundStudent?.firstName).toBe('Bob');
    });

    it('should return undefined if student is not found', () => {
      const foundStudent = useTestStore.getState().getStudentById('non-existent');
      expect(foundStudent).toBeUndefined();
    });
  });
});
