import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store';

vi.mock('canvas-confetti', () => {
  return { default: vi.fn() };
});

describe('Zustand Store - Student Slice - updateStudent', () => {
  beforeEach(() => {
    // Reset store to known state
    useStore.setState({
      students: [],
      transactions: [],
      activityLog: [],
      gamification: { points: 0, level: 1, levelName: 'Novice', streak: 0, lastActiveDate: null },
      toasts: [],
    });
  });

  it('updates basic flat fields correctly', () => {
    // Setup
    const student = useStore.getState().addStudent({
      firstName: 'John',
      lastName: 'Doe',
      country: 'United States',
      parent: { name: 'Jane Parent', relationship: 'Mother' },
      contact: { email: 'john@example.com' },
      tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
      notes: 'Initial notes'
    });

    // Action
    const updatedStudent = useStore.getState().updateStudent(student.id, {
      firstName: 'Johnny',
      lastName: 'Doer',
      country: 'Canada',
      notes: 'Updated notes'
    });

    // Assert
    expect(updatedStudent).toBeDefined();
    if (updatedStudent) {
        expect(updatedStudent.firstName).toBe('Johnny');
        expect(updatedStudent.lastName).toBe('Doer');
        expect(updatedStudent.country).toBe('Canada');
        expect(updatedStudent.notes).toBe('Updated notes');
    }

    const state = useStore.getState();
    expect(state.students[0].firstName).toBe('Johnny');
    expect(state.students[0].lastName).toBe('Doer');
});

  it('partially updates nested parent field', () => {
    const student = useStore.getState().addStudent({
      firstName: 'John',
      lastName: 'Doe',
      contact: { email: 'john@example.com' },
      tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
      parent: { name: 'Jane Parent', relationship: 'Mother' },
    });

    const updatedStudent = useStore.getState().updateStudent(student.id, {
      parent: { name: 'Jane Doe' } as any
    });

    expect(updatedStudent?.parent?.name).toBe('Jane Doe');
    expect(updatedStudent?.parent?.relationship).toBe('Mother'); // Keeps existing
  });

  it('partially updates nested contact field', () => {
    const student = useStore.getState().addStudent({
      firstName: 'John',
      lastName: 'Doe',
      contact: {
        email: 'john@example.com',
        studentPhone: { countryCode: '+1', number: '1234567890' },
        parentPhone1: { countryCode: '+1', number: '0987654321' }
      },
      tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
    });

    const updatedStudent = useStore.getState().updateStudent(student.id, {
      contact: {
         email: 'newemail@example.com',
         studentPhone: { countryCode: '+1', number: '1111111111' }
      }
    });

    expect(updatedStudent?.contact.email).toBe('newemail@example.com');
    expect(updatedStudent?.contact.studentPhone?.number).toBe('1111111111');
    expect(updatedStudent?.contact.parentPhone1?.number).toBe('0987654321'); // Keeps existing
  });

  it('partially updates nested tuition field', () => {
    const student = useStore.getState().addStudent({
      firstName: 'John',
      lastName: 'Doe',
      contact: { email: 'john@example.com' },
      tuition: { subjects: ['Math', 'Science'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
    });

    const updatedStudent = useStore.getState().updateStudent(student.id, {
      tuition: {
         subjects: ['Physics']
      } as any
    });

    expect(updatedStudent?.tuition.subjects).toEqual(['Physics']);
    expect(updatedStudent?.tuition.defaultRate).toBe(50); // Keeps existing
  });

  it('returns undefined and does not update state for non-existent student', () => {
    useStore.getState().addStudent({
        firstName: 'John',
        lastName: 'Doe',
        contact: { email: 'john@example.com' },
        tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
    });

    const originalState = useStore.getState().students;

    const updatedStudent = useStore.getState().updateStudent('non-existent-id', {
        firstName: 'New Name'
    });

    expect(updatedStudent).toBeUndefined();
    expect(useStore.getState().students).toEqual(originalState);
  });

  it('ignores undefined values in partial updates', () => {
    const student = useStore.getState().addStudent({
        firstName: 'John',
        lastName: 'Doe',
        contact: { email: 'john@example.com' },
        tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
        notes: 'Some notes'
    });

    const updatedStudent = useStore.getState().updateStudent(student.id, {
        firstName: undefined,
        notes: undefined,
    });

    expect(updatedStudent?.firstName).toBe('John'); // Unchanged
    expect(updatedStudent?.notes).toBe('Some notes'); // Unchanged
  });

  it('sanitizes strings during update', () => {
    const student = useStore.getState().addStudent({
        firstName: 'John',
        lastName: 'Doe',
        contact: { email: 'john@example.com' },
        tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
    });

    const updatedStudent = useStore.getState().updateStudent(student.id, {
        firstName: '<script>alert("XSS")</script>Johnny',
        lastName: '<b>Doe</b>',
        notes: '<p>Malicious notes</p>'
    });

    expect(updatedStudent?.firstName).toBe('Johnny');
    expect(updatedStudent?.lastName).toBe('Doe');
    expect(updatedStudent?.notes).toBe('Malicious notes');
  });

  it('adds a success toast on successful update', () => {
      const student = useStore.getState().addStudent({
          firstName: 'John',
          lastName: 'Doe',
          contact: { email: 'john@example.com' },
          tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
      });

      useStore.setState({ toasts: [] }); // Clear initial toasts

      useStore.getState().updateStudent(student.id, {
          firstName: 'Johnny'
      });

      const toasts = useStore.getState().toasts;
      expect(toasts.length).toBeGreaterThan(0);
      expect(toasts[toasts.length - 1].message).toContain('updated');
      expect(toasts[toasts.length - 1].type).toBe('success');
  });
});
