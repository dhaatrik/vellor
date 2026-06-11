import { StateCreator } from 'zustand';
import { AppState, StudentSlice } from './types';
import { Student, StudentFormData } from '../types';
import { generateId } from '../helpers';
import { POINTS_ALLOCATION } from '../constants';
import { sanitizeString } from '../helpers';

export const createStudentSlice: StateCreator<AppState, [], [], StudentSlice> = (set, get) => ({
  students: [],

  addStudents: (studentsData) => {
    const newStudents: Student[] = [];
    const now = new Date().toISOString();

    // ⚡ Bolt Performance: Process bulk additions inside a single loop to avoid N+1 state updates
    for (let i = 0; i < studentsData.length; i++) {
        const studentData = studentsData[i];
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
        newStudents.push({
          ...sanitizedStudentData,
          searchName: `${sanitizedStudentData.firstName} ${sanitizedStudentData.lastName}`.toLowerCase(),
          id: crypto.randomUUID(),
          balance: 0,
          createdAt: now,
        });
    }

    set(state => ({ students: [...state.students, ...newStudents] }));

    if (newStudents.length > 0) {
        get().addPoints(POINTS_ALLOCATION.ADD_STUDENT * newStudents.length, `Added ${newStudents.length} new students`);
        get().addToast(`Successfully added ${newStudents.length} student${newStudents.length > 1 ? 's' : ''}.`, 'success');
        get().logActivity(`Added ${newStudents.length} student${newStudents.length > 1 ? 's' : ''}`, 'users');
        get().checkAndAwardAchievements();
    }

    return newStudents;
  },

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
      searchName: `${sanitizedStudentData.firstName} ${sanitizedStudentData.lastName}`.toLowerCase(),
      id: generateId(),
      balance: 0,
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
      // ⚡ Bolt Performance: Use a for loop and break early to avoid O(N) array iteration when updating a single item
      // Only copy the array if a match is actually found to save allocation overhead
      for (let i = 0, len = state.students.length; i < len; i++) {
        if (state.students[i].id === studentId) {
          const newStudents = [...state.students];
          const studentToUpdate = { ...newStudents[i] };

          if (studentData.firstName !== undefined) studentToUpdate.firstName = sanitizeString(studentData.firstName);
          if (studentData.lastName !== undefined) studentToUpdate.lastName = sanitizeString(studentData.lastName);
          if (studentData.firstName !== undefined || studentData.lastName !== undefined) {
             studentToUpdate.searchName = `${studentToUpdate.firstName} ${studentToUpdate.lastName}`.toLowerCase();
          }

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

          if (studentData.balance !== undefined) {
             studentToUpdate.balance = studentData.balance;
          }

          updatedStudent = studentToUpdate;
          newStudents[i] = updatedStudent;
          return { students: newStudents };
        }
      }
      return state;
    });

    if (updatedStudent) {
        get().addToast(`Student "${updatedStudent.firstName}" updated.`, 'success');
    }
    return updatedStudent;
  },

  deleteStudent: (studentId) => {
    const state = get();
    const studentToDelete = state.getStudentById(studentId);

    set(state => {
      // ⚡ Bolt Performance: Use native .filter() which is internally optimized in modern JS engines
      // and significantly more readable than manual slice+push loops for array removal
      const newStudents = state.students.filter(s => s.id !== studentId);
      const newTransactions = state.transactions.filter(t => t.studentId !== studentId);

      return {
        students: newStudents,
        transactions: newTransactions
      };
    });

    if (studentToDelete) {
        get().addToast(`Student "${studentToDelete.firstName}" and their transactions have been deleted.`, 'info');
    }
  },

  getStudentById: (() => {
    let cachedStudents: Student[] | null = null;
    const studentMap = new Map<string, Student>();
    return (studentId) => {
      const currentStudents = get().students;
      if (currentStudents !== cachedStudents) {
        cachedStudents = currentStudents;
        studentMap.clear();
        for (let i = 0, len = currentStudents.length; i < len; i++) {
          const s = currentStudents[i];
          studentMap.set(s.id, s);
        }
      }
      return studentMap.get(studentId);
    };
  })(),
});
