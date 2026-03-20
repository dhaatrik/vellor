import { StateCreator } from 'zustand';
import DOMPurify from 'dompurify';
import { AppState, StudentSlice } from './types';
import { Student, StudentFormData } from '../types';
import { POINTS_ALLOCATION } from '../constants';

const sanitizeString = (str: string | undefined): string => {
  if (str === undefined) return '';
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] });
};

export const createStudentSlice: StateCreator<AppState, [], [], StudentSlice> = (set, get) => ({
  students: [],

  addStudent: (studentData) => {
    const sanitizedStudentData: StudentFormData = {
      ...studentData,
      firstName: sanitizeString(studentData.firstName),
      lastName: sanitizeString(studentData.lastName),
      country: sanitizeString(studentData.country),
      parent: {
        ...studentData.parent,
        name: sanitizeString(studentData.parent?.name),
        relationship: studentData.parent?.relationship ?? 'Parent',
      },
      contact: {
        ...studentData.contact,
        email: sanitizeString(studentData.contact?.email),
        studentPhone: studentData.contact?.studentPhone ? { ...studentData.contact.studentPhone, number: sanitizeString(studentData.contact.studentPhone.number) } : undefined,
        parentPhone1: studentData.contact?.parentPhone1 ? { ...studentData.contact.parentPhone1, number: sanitizeString(studentData.contact.parentPhone1.number) } : undefined,
        parentPhone2: studentData.contact?.parentPhone2 ? { ...studentData.contact.parentPhone2, number: sanitizeString(studentData.contact.parentPhone2.number) } : undefined,
      },
      notes: sanitizeString(studentData.notes),
      tuition: {
        ...studentData.tuition,
        subjects: studentData.tuition.subjects.map(subject => sanitizeString(subject)),
      }
    };
    const newStudent: Student = {
      ...sanitizedStudentData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    set(state => ({ students: [...state.students, newStudent] }));
    get().addPoints(POINTS_ALLOCATION.ADD_STUDENT, `Added new student: ${newStudent.firstName}`);
    get().addToast(`Student "${newStudent.firstName} ${newStudent.lastName}" added successfully.`, 'success');
    get().logActivity(`Added student: ${newStudent.firstName} ${newStudent.lastName}`, 'user');
    get().checkAndAwardAchievements();
    return newStudent;
  },

  updateStudent: (studentId, studentData) => {
    let updatedStudent: Student | undefined;

    set(state => {
      const newStudents = state.students.map(s => {
        if (s.id === studentId) {
          const studentToUpdate = { ...s };

          if (studentData.firstName !== undefined) studentToUpdate.firstName = sanitizeString(studentData.firstName);
          if (studentData.lastName !== undefined) studentToUpdate.lastName = sanitizeString(studentData.lastName);
          if (studentData.notes !== undefined) studentToUpdate.notes = sanitizeString(studentData.notes);
          if (studentData.country !== undefined) studentToUpdate.country = sanitizeString(studentData.country);

          if (studentData.parent) {
            const existingParent = studentToUpdate.parent || { name: '', relationship: '' };
            const updatedParentData = { ...existingParent, ...studentData.parent };
            if (studentData.parent.name !== undefined) {
              updatedParentData.name = sanitizeString(studentData.parent.name);
            }
            studentToUpdate.parent = updatedParentData;
          }

          if (studentData.contact) {
            const updatedContactData = { ...studentToUpdate.contact, ...studentData.contact };
            if (studentData.contact.email !== undefined) updatedContactData.email = sanitizeString(studentData.contact.email);
            
            if (studentData.contact.studentPhone && updatedContactData.studentPhone) {
                updatedContactData.studentPhone.number = sanitizeString(updatedContactData.studentPhone.number);
            }
            if (studentData.contact.parentPhone1 && updatedContactData.parentPhone1) {
                updatedContactData.parentPhone1.number = sanitizeString(updatedContactData.parentPhone1.number);
            }
            if (studentData.contact.parentPhone2 && updatedContactData.parentPhone2) {
                updatedContactData.parentPhone2.number = sanitizeString(updatedContactData.parentPhone2.number);
            }
            
            studentToUpdate.contact = updatedContactData;
          }

          if (studentData.tuition) {
             const updatedTuitionData = { ...studentToUpdate.tuition, ...studentData.tuition };
             if (studentData.tuition.subjects !== undefined) {
                updatedTuitionData.subjects = studentData.tuition.subjects.map(subject => sanitizeString(subject));
             }
             studentToUpdate.tuition = updatedTuitionData;
          }

          updatedStudent = studentToUpdate;
          return updatedStudent;
        }
        return s;
      });
      return { students: newStudents };
    });

    if (updatedStudent) {
        get().addToast(`Student "${updatedStudent.firstName}" updated.`, 'success');
    }
    return updatedStudent;
  },

  deleteStudent: (studentId) => {
    const state = get();
    const studentToDelete = state.students.find(s => s.id === studentId);
    set(state => ({
      students: state.students.filter(s => s.id !== studentId),
      transactions: state.transactions.filter(t => t.studentId !== studentId)
    }));
    if (studentToDelete) {
        get().addToast(`Student "${studentToDelete.firstName}" and their transactions have been deleted.`, 'info');
    }
  },

  getStudentById: (studentId) => {
    return get().students.find(s => s.id === studentId);
  },
});
