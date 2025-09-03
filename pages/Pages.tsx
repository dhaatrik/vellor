
/**
 * @file Pages.tsx
 * This file contains all the page components for the TutorFlow application,
 * as well as various sub-components used within these pages (e.g., forms, list items).
 * Each page handles a specific section of the application like Dashboard, Students, Transactions, etc.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'; // Added useLocation
import { useData } from '../store'; // Context hook for accessing global state and actions
import { Student, Transaction, StudentFormData, TransactionFormData, PaymentStatus, AppSettings, AchievementId } from '../types'; // Type definitions
import { CURRENCY_OPTIONS, POINTS_ALLOCATION, TUTOR_RANK_LEVELS } from '../constants'; // Application constants
import { Button, Input, Select, Modal, Card, Icon, StatDisplayCard, Badge, Textarea, ProgressBar } from '../components/UI'; // Reusable UI components

// #region Helper Functions

/**
 * Formats a numeric amount into a currency string with a given symbol.
 *
 * @param {number} amount - The monetary value to be formatted.
 * @param {string} currencySymbol - The currency symbol to prepend to the amount (e.g., "$", "€").
 * @returns {string} The formatted currency string, with the amount fixed to two decimal places (e.g., "$50.00").
 */
const formatCurrency = (amount: number, currencySymbol: string): string => {
  return `${currencySymbol}${amount.toFixed(2)}`;
};

/**
 * Formats an ISO date string into a human-readable local date format (e.g., "Oct 27, 2023").
 *
 * @param {string} dateString - The ISO 8601 date string to format.
 * @returns {string} The formatted date string in a short, localized format.
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// #endregion Helper Functions

// #region Student Management Components

/**
 * Props for the StudentForm component.
 */
interface StudentFormProps {
  /** Optional student data to pre-fill the form for editing. */
  student?: Student;
  /** Callback function when the form is submitted with valid student data. */
  onSave: (studentData: Student) => void;
  /** Callback function to close the form/modal. */
  onClose: () => void;
}
/**
 * A form for adding a new student or editing an existing one.
 * It manages the state of the student's data and provides fields for all student properties.
 *
 * @param {StudentFormProps} props - The properties for the StudentForm component.
 * @returns {React.ReactElement} A JSX element representing the student form.
 */
const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onClose }) => {
  // Initial state for a new student form
  const initialFormState: StudentFormData = {
    firstName: '', lastName: '',
    parent: { name: '', relationship: 'Parent' },
    contact: { studentPhone: '', parentPhone1: '', parentPhone2: '', email: '' },
    tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60, preferredPaymentMethod: '' },
    notes: '',
  };
  const [formData, setFormData] = useState<StudentFormData>(initialFormState);

  // Effect to populate form if editing an existing student
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        parent: student.parent || { name: '', relationship: 'Parent' }, // Ensure parent object exists
        contact: student.contact,
        tuition: student.tuition,
        notes: student.notes || '',
      });
    } else {
      setFormData(initialFormState); // Reset to initial state for new student
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  // initialFormState is stable, student prop is the main dependency.
  }, [student]);

  /**
   * Handles changes in form input fields and updates the formData state.
   * Supports nested fields (e.g., 'parent.name') by splitting the input name.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - The change event from the input field.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [field, subField] = name.split('.'); // For handling nested state like contact.email

    if (subField) { // Handle nested objects like 'parent' or 'contact'
      setFormData(prev => ({
        ...prev,
        [field]: { ...(prev as any)[field], [subField]: value }
      }));
    } else { // Handle top-level fields
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  /**
   * Handles changes specifically for tuition detail fields, parsing numbers where appropriate.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The change event from the tuition input field.
   */
  const handleTuitionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name.replace('tuition.', ''); // Extract field name from 'tuition.defaultRate'
    setFormData(prev => ({
        ...prev,
        tuition: {
            ...prev.tuition,
            // Parse numeric values for rate and duration
            [fieldName]: fieldName === 'defaultRate' || fieldName === 'typicalLessonDuration' ? parseFloat(value) || 0 : value,
        }
    }));
  };

  /**
   * Handles changes to the subjects input, splitting comma-separated strings into an array of strings.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the subjects input field.
   */
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
        ...prev,
        tuition: {
            ...prev.tuition,
            subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s), // Split, trim, and filter empty strings
        }
    }));
  };

  /**
   * Handles form submission. It prevents the default form action, constructs the
   * student object, and calls the onSave callback with the new or updated student data.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct the student object to save, preserving ID and createdAt if editing
    const studentToSave: Student = {
      id: student?.id || crypto.randomUUID(), // Use existing ID or generate new
      createdAt: student?.createdAt || new Date().toISOString(), // Use existing timestamp or new
      ...formData,
    };
    onSave(studentToSave); // Pass data to parent component
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium mb-4">{student ? 'Edit Student' : 'Add New Student'}</h3>
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
        <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
      </div>
      
      {/* Parent/Guardian Details */}
      <h4 className="text-md font-medium mt-4 pt-2 border-t dark:border-slate-700">Parent/Guardian Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Parent Name" name="parent.name" value={formData.parent?.name || ''} onChange={handleChange} />
        <Select label="Relationship" name="parent.relationship" value={formData.parent?.relationship || 'Parent'} onChange={handleChange} options={[{value: 'Parent', label: 'Parent'},{value: 'Mother', label: 'Mother'}, {value: 'Father', label: 'Father'}, {value: 'Guardian', label: 'Guardian'}]} />
      </div>

      {/* Contact Information */}
      <h4 className="text-md font-medium mt-4 pt-2 border-t dark:border-slate-700">Contact Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Student Phone" name="contact.studentPhone" value={formData.contact.studentPhone} onChange={handleChange} />
        <Input label="Parent Phone 1" name="contact.parentPhone1" value={formData.contact.parentPhone1} onChange={handleChange} />
        <Input label="Parent Phone 2 (Optional)" name="contact.parentPhone2" value={formData.contact.parentPhone2} onChange={handleChange} />
        <Input label="Email" name="contact.email" type="email" value={formData.contact.email} onChange={handleChange} />
      </div>

      {/* Tuition Details */}
      <h4 className="text-md font-medium mt-4 pt-2 border-t dark:border-slate-700">Tuition Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Subject(s) (comma-separated)" name="tuition.subjects" value={formData.tuition.subjects.join(', ')} onChange={handleSubjectChange} />
        <Input label="Default Rate" name="tuition.defaultRate" type="number" value={formData.tuition.defaultRate} onChange={handleTuitionChange} min="0" step="0.01" />
        <Select 
          label="Rate Type" 
          name="tuition.rateType" 
          value={formData.tuition.rateType} 
          onChange={handleTuitionChange} 
          options={[
            {value: 'hourly', label: 'Hourly'}, 
            {value: 'per_lesson', label: 'Per Lesson'},
            {value: 'monthly', label: 'Monthly'}
          ]} 
        />
        <Input label="Typical Lesson Duration (mins) / Sessions" name="tuition.typicalLessonDuration" type="number" value={formData.tuition.typicalLessonDuration} onChange={handleTuitionChange} min="0" />
        <Input label="Preferred Payment Method" name="tuition.preferredPaymentMethod" value={formData.tuition.preferredPaymentMethod} onChange={handleTuitionChange} />
      </div>
      
      {/* Notes */}
      <Textarea label="Notes" name="notes" value={formData.notes || ''} onChange={handleChange} />

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">{student ? 'Save Changes' : 'Add Student'}</Button>
      </div>
    </form>
  );
};

/**
 * Props for the StudentListItem component.
 */
interface StudentListItemProps {
  /** The student data to display. */
  student: Student;
  /** Callback when the student item is selected (e.g., to view details). */
  onSelect: (student: Student) => void;
  /** Callback when the delete button for this student is clicked. */
  onDelete: (studentId: string) => void;
  /** Current currency symbol for formatting. */
  currencySymbol: string;
  /** Array of all transactions to calculate outstanding balance. */
  transactions: Transaction[];
}
/**
 * Displays a summary of a single student in a list.
 * This component shows the student's name, contact info, their outstanding balance,
 * and provides actions to view details or delete the student.
 *
 * @param {StudentListItemProps} props - The properties for the StudentListItem component.
 * @returns {React.ReactElement} A card element representing a student in a list.
 */
const StudentListItem: React.FC<StudentListItemProps> = ({ student, onSelect, onDelete, currencySymbol, transactions }) => {
  // Calculate the outstanding balance for this student
  const outstandingBalance = useMemo(() => {
    return transactions
      .filter(t => t.studentId === student.id) // Filter transactions for this student
      .reduce((acc, t) => {
        if (t.status === PaymentStatus.Due) return acc + t.lessonFee;
        if (t.status === PaymentStatus.PartiallyPaid) return acc + (t.lessonFee - t.amountPaid);
        return acc;
      }, 0);
  }, [transactions, student.id]);

  return (
    <Card className="mb-4 hover:shadow-xl transition-shadow duration-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Student Avatar/Icon */}
            <div className="flex-shrink-0 self-center sm:self-start">
              <Icon iconName="user" className="w-16 h-16 rounded-full text-slate-400 dark:text-slate-500 p-3 bg-slate-200 dark:bg-slate-700" />
            </div>
            {/* Student Name and Contact */}
            <div className="flex-grow w-full sm:w-auto">
                <h3 className="text-lg font-semibold text-primary dark:text-secondary">{student.firstName} {student.lastName}</h3> {/* dark:text-primary-light -> dark:text-secondary */}
                <p className="text-sm text-slate-500 dark:text-slate-400">{student.contact.email || 'No email'}</p>
                {student.parent?.name && <p className="text-sm text-slate-500 dark:text-slate-400">Parent: {student.parent.name} ({student.parent.relationship})</p>}
            </div>
            {/* Outstanding Balance */}
            <div className="text-left sm:text-right w-full sm:w-auto sm:ml-auto">
                <p className="text-sm text-slate-500 dark:text-slate-400">Outstanding</p>
                <p className={`text-lg font-semibold ${outstandingBalance > 0 ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(outstandingBalance, currencySymbol)}
                </p>
            </div>
        </div>
        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onSelect(student)} leftIcon="identification" className="w-full sm:w-auto">Details</Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(student.id)} leftIcon="trash" className="w-full sm:w-auto">Delete</Button>
        </div>
    </Card>
  );
};

/**
 * Props for the StudentDetailView component.
 */
interface StudentDetailViewProps {
  /** The student whose details are to be displayed. */
  student: Student;
  /** Callback to close the detail view. */
  onClose: () => void;
  /** Callback to initiate editing this student. */
  onEdit: (student:Student) => void;
  /** Callback to open the log payment form for this student. */
  onLogPayment: (studentId: string) => void;
  /** Array of all transactions, used to filter for this student. */
  transactions: Transaction[];
  /** Current currency symbol. */
  currencySymbol: string;
}
/**
 * Displays a comprehensive, detailed view of a single student.
 * This view includes contact information, tuition details, notes, and a full
 * transaction history, along with actions to edit the profile or log a new payment.
 *
 * @param {StudentDetailViewProps} props - The properties for the StudentDetailView component.
 * @returns {React.ReactElement} A JSX element representing the detailed student view.
 */
const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student, onClose, onEdit, onLogPayment, transactions, currencySymbol }) => {
  // Filter and sort transactions for the current student
  const studentTransactions = transactions
    .filter(t => t.studentId === student.id)
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
  
  // Calculate total owed and total paid for this student
  const totalOwed = studentTransactions.reduce((sum, t) => {
    if (t.status === PaymentStatus.Due) return sum + t.lessonFee;
    if (t.status === PaymentStatus.PartiallyPaid) return sum + (t.lessonFee - t.amountPaid);
    return sum;
  }, 0);
  const totalPaidForStudent = studentTransactions.reduce((sum, t) => sum + t.amountPaid, 0);

  return (
    <div>
      {/* Student Header: Avatar, Name, Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex-shrink-0 mr-0 sm:mr-6 self-center sm:self-auto">
            <Icon iconName="user" className="w-24 h-24 rounded-full text-slate-400 dark:text-slate-500 p-6 bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="text-center sm:text-left flex-grow">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{student.firstName} {student.lastName}</h2>
          {student.parent && <p className="text-slate-600 dark:text-slate-400">{student.parent.name} ({student.parent.relationship})</p>}
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:ml-auto mt-4 sm:mt-0">
          <Button onClick={() => onEdit(student)} leftIcon="pencil" variant="outline" className="w-full sm:w-auto">Edit Profile</Button>
          <Button onClick={() => onLogPayment(student.id)} leftIcon="plus" variant="primary" className="w-full sm:w-auto">Log Lesson/Payment</Button>
        </div>
      </div>

      {/* Contact and Tuition Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="Contact Info" titleIcon="identification">
          <p><strong>Student Phone:</strong> {student.contact.studentPhone || 'N/A'}</p>
          <p><strong>Parent Phone 1:</strong> {student.contact.parentPhone1 || 'N/A'}</p>
          <p><strong>Parent Phone 2:</strong> {student.contact.parentPhone2 || 'N/A'}</p>
          <p><strong>Email:</strong> {student.contact.email || 'N/A'}</p>
        </Card>
        <Card title="Tuition Details" titleIcon="academic-cap">
          <p><strong>Subjects:</strong> {student.tuition.subjects.join(', ') || 'N/A'}</p>
          <p><strong>Rate:</strong> {formatCurrency(student.tuition.defaultRate, currencySymbol)} ({student.tuition.rateType})</p>
          <p><strong>Duration/Sessions:</strong> {student.tuition.typicalLessonDuration} {student.tuition.rateType === 'hourly' ? 'mins' : ''}</p>
          <p><strong>Preferred Payment:</strong> {student.tuition.preferredPaymentMethod || 'N/A'}</p>
        </Card>
      </div>
      
      {/* Notes Card (if notes exist) */}
      {student.notes && (
          <Card title="Notes" titleIcon="document-text" className="mb-6">
            <p className="whitespace-pre-wrap">{student.notes}</p>
          </Card>
      )}

      {/* Lesson & Payment History Card */}
      <Card title="Lesson & Payment History" titleIcon="banknotes">
         <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <p><strong>Total Paid:</strong> <span className="text-success">{formatCurrency(totalPaidForStudent, currencySymbol)}</span></p>
            <p><strong>Total Outstanding:</strong> <span className={totalOwed > 0 ? 'text-danger' : 'text-success'}>{formatCurrency(totalOwed, currencySymbol)}</span></p>
         </div>
        {studentTransactions.length > 0 ? (
          <ul className="space-y-3 max-h-96 overflow-y-auto"> {/* Scrollable list for many transactions */}
            {studentTransactions.map(t => (
              <li key={t.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-md shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-1 sm:mb-0">
                    <p className="font-semibold">{formatDate(t.date)} - Fee: {formatCurrency(t.lessonFee, currencySymbol)}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Paid: {formatCurrency(t.amountPaid, currencySymbol)} (Duration/Ref: {t.lessonDuration})</p>
                  </div>
                  <TransactionStatusBadge status={t.status} />
                </div>
                {t.notes && <p className="text-xs italic mt-1 text-slate-500 dark:text-slate-400">Note: {t.notes}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">No transactions logged for this student yet.</p>
        )}
      </Card>
      {/* Back Button */}
      <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="ghost" leftIcon="arrow-left">Back to List</Button>
      </div>
    </div>
  );
};

// #endregion Student Management Components

// #region Transaction Management Components

/**
 * Maps a `PaymentStatus` enum value to a corresponding color name for the `Badge` component.
 * This utility function helps maintain a consistent color scheme for transaction statuses.
 *
 * @param {PaymentStatus} status - The payment status enum value.
 * @returns {'green' | 'yellow' | 'red' | 'amber' | 'gray'} The color name compatible with the `Badge` component.
 */
const getPaymentStatusColor = (status: PaymentStatus): 'green' | 'yellow' | 'red' | 'amber' | 'gray' => {
    switch (status) {
      case PaymentStatus.Paid: return 'green';
      case PaymentStatus.PartiallyPaid: return 'yellow';
      case PaymentStatus.Due: return 'red';
      case PaymentStatus.Overpaid: return 'amber'; // Using amber for overpaid as a distinct positive status
      default: return 'gray';
    }
};

/**
 * A component that displays a transaction's payment status using a colored `Badge`.
 * The color is determined by the `getPaymentStatusColor` function.
 *
 * @param {{status: PaymentStatus}} props - The properties for the TransactionStatusBadge component.
 * @returns {React.ReactElement} A `Badge` component styled according to the payment status.
 */
const TransactionStatusBadge: React.FC<{status: PaymentStatus}> = ({status}) => {
    return <Badge text={status} color={getPaymentStatusColor(status)} />;
};

/**
 * Props for the TransactionForm component.
 */
interface TransactionFormProps {
  /** Optional transaction data to pre-fill for editing. */
  transaction?: Transaction;
  /** List of all students to populate the student selection dropdown. */
  students: Student[];
  /** Optional default student ID to pre-select in the form (e.g., when logging payment from student detail). */
  defaultStudentId?: string;
  /** Callback when the form is submitted with valid transaction data. */
  onSave: (transactionData: Transaction) => void;
  /** Callback to close the form/modal. */
  onClose: () => void;
  /** Current currency symbol. */
  currencySymbol: string;
}
/**
 * A form for logging a new lesson/payment or editing an existing transaction.
 * It can be pre-filled with a student's default tuition details.
 *
 * @param {TransactionFormProps} props - The properties for the TransactionForm component.
 * @returns {React.ReactElement} A JSX element representing the transaction form.
 */
const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, students, defaultStudentId, onSave, onClose, currencySymbol }) => {
  const { getStudentById } = useData(); // Access student data for fee calculation
  
  // Initial state for a new transaction form
  const initialFormState: TransactionFormData = {
    studentId: defaultStudentId || (students.length > 0 ? students[0].id : ''), // Default to first student or passed ID
    date: new Date().toISOString().split('T')[0], // Default to today's date
    lessonDuration: 60, // Default duration (e.g., minutes for hourly, or 1 for monthly)
    lessonFee: 0,
    amountPaid: 0,
    paymentMethod: '',
    notes: '',
  };
  const [formData, setFormData] = useState<TransactionFormData>(initialFormState);

  // Effect to populate form if editing or if defaultStudentId is provided
  useEffect(() => {
    if (transaction) { // Editing existing transaction
      setFormData({
        studentId: transaction.studentId,
        date: transaction.date.split('T')[0], // Format for date input YYYY-MM-DD
        lessonDuration: transaction.lessonDuration,
        lessonFee: transaction.lessonFee,
        amountPaid: transaction.amountPaid,
        paymentMethod: transaction.paymentMethod || '',
        notes: transaction.notes || '',
      });
    } else { // New transaction, potentially with a default student
        let fee = 0;
        let duration = 60; // Default duration for hourly/per-lesson
        if(defaultStudentId) {
            const student = getStudentById(defaultStudentId);
            if(student) { // Auto-fill fee and duration based on student's tuition settings
                duration = student.tuition.typicalLessonDuration;
                if(student.tuition.rateType === 'per_lesson' || student.tuition.rateType === 'monthly'){
                    fee = student.tuition.defaultRate;
                    if(student.tuition.rateType === 'monthly') duration = 1; // For monthly, duration often means '1 month'
                } else { // 'hourly' rate type
                    fee = student.tuition.defaultRate * (duration / 60); // Calculate fee based on hourly rate and duration
                }
            }
        }
        // Set initial form data, pre-filling student, fee, duration, and amount paid (defaults to full fee)
      setFormData(prev => ({...prev, studentId: defaultStudentId || prev.studentId, lessonFee: fee, lessonDuration: duration, amountPaid: fee}));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // getStudentById is from context (stable), other deps are props.
  }, [transaction, defaultStudentId, students]); 

  /**
   * Handles changes in form input fields and updates the form's state.
   * It includes logic to automatically calculate the `lessonFee` for hourly-rated
   * students when the student or lesson duration changes.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - The change event from the input field.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Update form data, parsing numbers for relevant fields
    let newFormData = { ...formData, [name]: name === 'lessonDuration' || name === 'lessonFee' || name === 'amountPaid' ? parseFloat(value) || 0 : value };
    
    // Auto-calculate lesson fee if student or duration changes for hourly-rated students
    if ((name === 'studentId' || name === 'lessonDuration') && newFormData.studentId) {
        const student = getStudentById(newFormData.studentId);
        if (student) {
            if (student.tuition.rateType === 'hourly') {
                newFormData.lessonFee = student.tuition.defaultRate * (newFormData.lessonDuration / 60);
            } else if (student.tuition.rateType === 'per_lesson' || student.tuition.rateType === 'monthly') {
                // For per_lesson or monthly, fee is fixed from student profile, disable fee input
                newFormData.lessonFee = student.tuition.defaultRate;
            }
        }
    }
    setFormData(newFormData);
  };

  /**
   * Handles the submission of the transaction form.
   * It validates that a student is selected, constructs the transaction object,
   * and calls the `onSave` callback.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) { // Basic validation
      alert("Please select a student.");
      return;
    }
    const transactionToSave: Transaction = {
      id: transaction?.id || crypto.randomUUID(),
      createdAt: transaction?.createdAt || new Date().toISOString(),
      ...formData,
      // Status is set to 'Due' initially; actual status is calculated in store.ts addTransaction/updateTransaction
      status: PaymentStatus.Due, 
    };
    onSave(transactionToSave);
  };

  // Prepare options for student select dropdown
  const studentOptions = students.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium mb-4">{transaction ? 'Edit Transaction' : 'Log New Lesson/Payment'}</h3>
      <Select label="Student" name="studentId" value={formData.studentId} onChange={handleChange} options={studentOptions} required placeholder="Select a student" />
      <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
      <Input 
        label="Lesson Duration (minutes) / Reference" 
        name="lessonDuration" 
        type="number" 
        value={formData.lessonDuration} 
        onChange={handleChange} 
        required 
        min="0" 
        helperText={getStudentById(formData.studentId)?.tuition.rateType === 'monthly' ? 'e.g., 1 for 1 month' : 'e.g., 60 for 60 minutes'}
      />
      <Input 
        label={`Lesson Fee (${currencySymbol})`} 
        name="lessonFee" 
        type="number" 
        value={formData.lessonFee} 
        onChange={handleChange} 
        required 
        min="0" 
        step="0.01" 
        // Disable fee input if rate type is fixed (per_lesson or monthly)
        disabled={getStudentById(formData.studentId)?.tuition.rateType === 'monthly' || getStudentById(formData.studentId)?.tuition.rateType === 'per_lesson'} 
      />
      <Input label={`Amount Paid (${currencySymbol})`} name="amountPaid" type="number" value={formData.amountPaid} onChange={handleChange} required min="0" step="0.01" />
      <Input label="Payment Method" name="paymentMethod" value={formData.paymentMethod || ''} onChange={handleChange} placeholder="e.g. Cash, Bank Transfer" />
      <Textarea label="Notes" name="notes" value={formData.notes || ''} onChange={handleChange} />
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">{transaction ? 'Save Changes' : 'Log Transaction'}</Button>
      </div>
    </form>
  );
};

/**
 * Props for the TransactionListItem component.
 */
interface TransactionListItemProps {
  /** The transaction data to display. */
  transaction: Transaction;
  /** Name of the student associated with the transaction. */
  studentName: string;
  /** Callback to initiate editing this transaction. */
  onEdit: (transaction: Transaction) => void;
  /** Callback when the delete button for this transaction is clicked. */
  onDelete: (transactionId: string) => void;
  /** Current currency symbol. */
  currencySymbol: string;
}
/**
 * Displays a summary of a single transaction in a list.
 * This component shows the associated student's name, transaction date, financial details,
 * payment status, and provides actions to edit or delete the transaction.
 *
 * @param {TransactionListItemProps} props - The properties for the TransactionListItem component.
 * @returns {React.ReactElement} A card element representing a transaction in a list.
 */
const TransactionListItem: React.FC<TransactionListItemProps> = ({ transaction, studentName, onEdit, onDelete, currencySymbol }) => {
  return (
    <Card className="mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            {/* Student Name and Date */}
            <div className="w-full sm:w-auto">
                <p className="font-semibold text-lg text-primary dark:text-secondary">{studentName}</p> {/* dark:text-primary-light -> dark:text-secondary */}
                <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(transaction.date)}</p>
            </div>
            {/* Fee and Amount Paid */}
            <div className="mt-2 sm:mt-0 sm:text-right w-full sm:w-auto">
                <p>Fee: {formatCurrency(transaction.lessonFee, currencySymbol)}</p>
                <p>Paid: {formatCurrency(transaction.amountPaid, currencySymbol)}</p>
            </div>
            {/* Payment Status Badge */}
            <div className="mt-2 sm:mt-0 self-start sm:self-center">
                <TransactionStatusBadge status={transaction.status} />
            </div>
        </div>
        {/* Transaction Notes (if any) */}
        {transaction.notes && <p className="text-sm italic mt-2 text-slate-500 dark:text-slate-400">Notes: {transaction.notes}</p>}
        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(transaction)} leftIcon="pencil" className="w-full sm:w-auto">Edit</Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(transaction.id)} leftIcon="trash" className="w-full sm:w-auto">Delete</Button>
        </div>
    </Card>
  );
};

// #endregion Transaction Management Components


// #region Page Components (Dashboard, Students, Transactions, Settings, Achievements)

/**
 * The main dashboard page of the application.
 * It provides a high-level overview of key financial metrics, student counts,
 * gamification progress, and quick actions for common tasks.
 *
 * @returns {React.ReactElement} A JSX element representing the dashboard page.
 */
export const DashboardPage: React.FC = () => {
  // Access global data and settings from context
  const { settings, totalUnpaid, totalPaidThisMonth, activeStudentsCount, overduePayments, gamification, students, transactions } = useData();
  const navigate = useNavigate(); // For programmatic navigation

  // Example: Monthly income goal for the "Money Tree" visualization
  const monthlyIncomeGoal = 500; 
  const moneyTreeProgress = Math.min(100, (totalPaidThisMonth / monthlyIncomeGoal) * 100); // Progress capped at 100%

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
      
      {/* Statistic Display Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatDisplayCard 
            title="Total Unpaid" 
            value={formatCurrency(totalUnpaid, settings.currencySymbol)} 
            iconName="currency-dollar" 
            iconColorClass={totalUnpaid > 0 ? "text-danger" : "text-success"}
            iconBgClass={totalUnpaid > 0 ? "bg-danger bg-opacity-20" : "bg-success bg-opacity-20"}
        />
        <StatDisplayCard 
            title="Paid This Month" 
            value={formatCurrency(totalPaidThisMonth, settings.currencySymbol)} 
            iconName="calendar" 
            iconColorClass="text-success"
            iconBgClass="bg-success bg-opacity-20"
        />
        <StatDisplayCard 
            title="Active Students" 
            value={activeStudentsCount} 
            iconName="users" 
            iconColorClass="text-blue-500" // Using a distinct color for this stat
            iconBgClass="bg-blue-500 bg-opacity-20"
        />
      </div>

      {/* Quick Actions and Gamification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Quick Actions" titleIcon="bolt">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Navigate to Students page and trigger Add Student modal */}
            <Button variant="primary" onClick={() => navigate('/students', {state: { openAddStudentModal: true }})} leftIcon="plus">Add New Student</Button>
            {/* Navigate to Transactions page and trigger Add Transaction modal */}
            <Button variant="primary" onClick={() => navigate('/transactions', {state: { openAddTransactionModal: true }})} leftIcon="plus">Log Lesson/Payment</Button>
          </div>
        </Card>

        <Card title="Gamification" titleIcon="sparkles">
          <p className="mb-1"><strong>Level:</strong> {gamification.levelName} (Level {gamification.level})</p>
          <p className="mb-3"><strong>Points:</strong> {gamification.points}</p>
          {/* Progress bar for next level */}
          {TUTOR_RANK_LEVELS[gamification.level] && gamification.points < TUTOR_RANK_LEVELS[gamification.level].points ? (
            <ProgressBar 
                // Calculate progress percentage towards the next rank
                value={(gamification.points - (TUTOR_RANK_LEVELS[gamification.level-1]?.points || 0)) / (TUTOR_RANK_LEVELS[gamification.level].points - (TUTOR_RANK_LEVELS[gamification.level-1]?.points || 0)) * 100} 
                label={`Next Level: ${TUTOR_RANK_LEVELS[gamification.level].name}`}
                colorClass="bg-secondary" 
            />
          ) : gamification.level > 0 && TUTOR_RANK_LEVELS[gamification.level-1] ? (
             <p className="text-secondary">Max level reached or next level data unavailable!</p> // Or handle max level state
          ) : (
             <ProgressBar value={0} label="Get started to earn points!" colorClass="bg-secondary" />
          )}
        </Card>
      </div>
      
      {/* Money Tree Card (Visual representation of monthly income goal) */}
      <Card title="Money Tree" titleIcon="banknotes" className="md:col-span-2">
        <p className="text-center text-slate-600 dark:text-slate-400 mb-2">Your financial garden is growing! Current progress towards {formatCurrency(monthlyIncomeGoal, settings.currencySymbol)} goal.</p>
        <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden relative">
          <div 
            className="h-full bg-green-500 transition-all duration-500 ease-out flex items-center justify-center text-white font-bold"
            style={{ width: `${moneyTreeProgress}%` }}
            aria-valuenow={moneyTreeProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          >
            {moneyTreeProgress.toFixed(0)}%
          </div>
        </div>
        {moneyTreeProgress >= 100 && <p className="text-center mt-2 text-green-600 font-semibold animate-pulse">Goal Achieved! 🎉</p>}
      </Card>

      {/* Overdue Payments List (if any) */}
      {overduePayments.length > 0 && (
        <Card title="Overdue Payments" titleIcon="warning" className="border-l-4 border-danger">
          <ul className="space-y-2 max-h-60 overflow-y-auto"> {/* Scrollable list */}
            {overduePayments.map(t => {
              const student = students.find(s => s.id === t.studentId); // Find student associated with overdue payment
              return (
                <li key={t.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded">
                  <div>
                    <span className="font-semibold">{student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">({formatDate(t.date)})</span>
                  </div>
                  <span className="text-danger font-semibold">{formatCurrency(t.lessonFee - t.amountPaid, settings.currencySymbol)}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
};

/**
 * Manages the display and manipulation of student data.
 * This page allows users to view a list of students, see detailed views,
 * add, edit, and delete students. It uses the URL to manage the state of
 * which student is being viewed.
 *
 * @returns {React.ReactElement} A JSX element representing the students page.
 */
export const StudentsPage: React.FC = () => {
  // Access global student data and actions
  const { students, addStudent, updateStudent, deleteStudent, getStudentById, settings, transactions, addTransaction } = useData();
  // State for the currently selected student for detail view
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(undefined);
  // State to control visibility of the student add/edit form (modal)
  const [showStudentForm, setShowStudentForm] = useState(false);
  // State to hold student data when editing
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  // State to control visibility of the transaction form modal, storing student ID if triggered from here
  const [showTransactionFormForStudent, setShowTransactionFormForStudent] = useState<string | undefined>(undefined);

  const { studentId } = useParams<{studentId?: string}>(); // Get studentId from URL if present
  const navigate = useNavigate(); // For programmatic navigation
  const location = useLocation(); // To check for state passed via navigation (e.g., openAddStudentModal)

  // Effect to handle opening the add student modal if `openAddStudentModal: true` is passed in navigation state
  useEffect(() => {
    if (location.state?.openAddStudentModal) {
      setEditingStudent(undefined); // Ensure it's for adding, not editing
      setShowStudentForm(true);
      setSelectedStudent(undefined);
      if (studentId) navigate('/students', { replace: true, state: {} }); // Clear studentId from URL and reset state
    }
  }, [location.state, navigate, studentId]);
  
  // Effect to handle student selection based on URL parameter `studentId`
  useEffect(() => {
    if(studentId) { // If a studentId is in the URL
        const student = getStudentById(studentId);
        setSelectedStudent(student); // Attempt to select the student
        // If student not found, and not currently in a form modal, navigate back to the main student list
        if (!student && students.length > 0 && !showStudentForm && !showTransactionFormForStudent) {
            navigate('/students', { replace: true }); // Use replace to avoid polluting history
        } else if (!student && students.length === 0 && !showStudentForm && !showTransactionFormForStudent) {
            // If no students and studentId in URL is invalid, also go back to base students page
            navigate('/students', { replace: true });
        }
    } else { // No studentId in URL, so no student is selected for detail view
        setSelectedStudent(undefined); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Dependencies ensure this runs when studentId, student list, or modal states change.
  }, [studentId, getStudentById, navigate, students.length, showStudentForm, showTransactionFormForStudent]);


  /**
   * Handles saving student data from the form (for both creation and updates).
   * It calls the appropriate context function (`addStudent` or `updateStudent`)
   * and closes the form modal.
   * @param {Student} studentData - The student data to be saved.
   */
  const handleSaveStudent = (studentData: Student) => {
    if (editingStudent) { // If editing an existing student
      updateStudent(editingStudent.id, studentData);
    } else { // If adding a new student
      addStudent(studentData);
    }
    setShowStudentForm(false); // Close the form modal
    setEditingStudent(undefined); // Clear editing state
    // If the saved student was the one being viewed in detail, refresh its data
    if (selectedStudent?.id === studentData.id) setSelectedStudent(studentData); 
  };
  
  /**
   * Sets the selected student for the detail view by navigating to their specific URL.
   * @param {Student} student - The student to be selected.
   */
  const handleSelectStudent = (student: Student) => {
    navigate(`/students/${student.id}`); // Update URL to show this student's details
  };
  
  /**
   * Closes the student detail view by navigating back to the main students list URL.
   */
  const handleCloseDetailView = () => {
      navigate('/students'); // Clear studentId from URL
  };

  /**
   * Prepares the form for editing a student by setting the editing state
   * and opening the student form modal.
   * @param {Student} student - The student to be edited.
   */
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student); // Set student to be edited
    setShowStudentForm(true);   // Open the form modal
    setSelectedStudent(undefined); // Clear detailed view selection
    navigate('/students');      // Navigate to base student URL (form is modal)
  };

  /**
   * Handles the deletion of a student after receiving user confirmation.
   * It also removes all associated transactions.
   * @param {string} id - The ID of the student to be deleted.
   */
  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student and all their transactions? This action cannot be undone.')) {
      deleteStudent(id);
      if (selectedStudent?.id === id) { // If the deleted student was being viewed
        setSelectedStudent(undefined);  // Clear detailed view
        navigate('/students');          // Navigate back to list
      }
    }
  };
  
  /**
   * Handles saving a new transaction that was initiated from the student context.
   * It calls the `addTransaction` context function and closes the transaction form.
   * @param {Transaction} transactionData - The transaction data to be saved.
   */
  const handleSaveTransaction = (transactionData: Transaction) => {
    addTransaction(transactionData); 
    setShowTransactionFormForStudent(undefined); // Close transaction form modal
    if(selectedStudent) { // If a student was selected (though usually detail view is closed for this modal)
        const refreshedStudent = getStudentById(selectedStudent.id); // Get potentially updated student data
        setSelectedStudent(refreshedStudent); 
        navigate(`/students/${selectedStudent.id}`); // Ensure URL reflects current view
    }
  };

  /**
   * Opens the transaction form modal, pre-filled for a specific student.
   * This is typically triggered from the `StudentDetailView`.
   * @param {string} studId - The ID of the student for whom the transaction is being logged.
   */
  const openTransactionFormForStudent = (studId: string) => {
    setShowTransactionFormForStudent(studId); // Set student ID for the transaction form
    if (selectedStudent) { // If currently in a student's detail view
        setSelectedStudent(undefined); // Close detail view as modal will overlay
        navigate('/students');         // Navigate to base student URL (form is modal)
    }
  }

  // Conditional rendering: Show student detail view if a student is selected and no modals are active.
  if (selectedStudent && !showStudentForm && !showTransactionFormForStudent) {
    return <StudentDetailView 
                student={selectedStudent} 
                onClose={handleCloseDetailView} 
                onEdit={handleEditStudent}
                onLogPayment={openTransactionFormForStudent}
                transactions={transactions}
                currencySymbol={settings.currencySymbol}
            />;
  }

  // Default view: List of students, or empty state.
  return (
    <div className="space-y-6">
      {/* Page Header and Add Student Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Students</h1>
        <Button onClick={() => { setEditingStudent(undefined); setShowStudentForm(true); setSelectedStudent(undefined); if(studentId) navigate('/students'); }} leftIcon="plus" className="w-full sm:w-auto">Add Student</Button>
      </div>

      {/* Student List or Empty State Message */}
      {students.length === 0 && !showStudentForm ? ( // If no students and form isn't open
        <Card className="text-center">
          <Icon iconName="users" className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Students Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Add your first student to get started!</p>
          <Button onClick={() => { setEditingStudent(undefined); setShowStudentForm(true); setSelectedStudent(undefined); if(studentId) navigate('/students'); }} leftIcon="plus">Add First Student</Button>
        </Card>
      ) : ( // Display list of students
        students.map(s => (
          <StudentListItem 
            key={s.id} 
            student={s} 
            onSelect={handleSelectStudent} 
            onDelete={handleDeleteStudent} 
            currencySymbol={settings.currencySymbol}
            transactions={transactions} // Pass all transactions for balance calculation
          />
        ))
      )}

      {/* Modal for Adding/Editing Students */}
      <Modal isOpen={showStudentForm} onClose={() => { setShowStudentForm(false); setEditingStudent(undefined); }} title={editingStudent ? 'Edit Student' : 'Add New Student'}>
        <StudentForm student={editingStudent} onSave={handleSaveStudent} onClose={() => { setShowStudentForm(false); setEditingStudent(undefined); }} />
      </Modal>
      
      {/* Modal for Logging Transactions (can be triggered from student context) */}
      <Modal isOpen={!!showTransactionFormForStudent} onClose={() => setShowTransactionFormForStudent(undefined)} title="Log Lesson/Payment">
        {showTransactionFormForStudent && ( // Render form only if student ID is set for it
          <TransactionForm
            students={students} // Pass all students for selection
            defaultStudentId={showTransactionFormForStudent} // Pre-select student
            onSave={handleSaveTransaction}
            onClose={() => setShowTransactionFormForStudent(undefined)}
            currencySymbol={settings.currencySymbol}
          />
        )}
      </Modal>
    </div>
  );
};

/**
 * Manages the display and manipulation of financial transactions.
 * This page allows users to view a list of all transactions, log new ones,
 * edit existing ones, and delete them.
 *
 * @returns {React.ReactElement} A JSX element representing the transactions page.
 */
export const TransactionsPage: React.FC = () => {
  // Access global transaction data, student data (for names), and settings
  const { transactions, students, addTransaction, updateTransaction, deleteTransaction, settings, getStudentById } = useData();
  // State to control visibility of the transaction add/edit form (modal)
  const [showForm, setShowForm] = useState(false);
  // State to hold transaction data when editing
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const location = useLocation(); // To check for state passed via navigation

  // Effect to handle opening the add transaction modal if `openAddTransactionModal: true` is passed in navigation state
  useEffect(() => {
      if (location.state?.openAddTransactionModal) {
          setEditingTransaction(undefined); // Ensure it's for adding
          setShowForm(true);
          // Optionally, clear the state from location to prevent re-triggering if not desired
          // navigate(location.pathname, { replace: true, state: {} });
      }
  }, [location.state]);

  /**
   * Handles saving transaction data from the form (for both creation and updates).
   * It calls the appropriate context function (`addTransaction` or `updateTransaction`)
   * and closes the form modal.
   * @param {Transaction} transactionData - The transaction data to be saved.
   */
  const handleSaveTransaction = (transactionData: Transaction) => {
    if (editingTransaction) { // If editing existing transaction
      updateTransaction(editingTransaction.id, transactionData);
    } else { // If logging new transaction
      addTransaction(transactionData);
    }
    setShowForm(false); // Close the form modal
    setEditingTransaction(undefined); // Clear editing state
  };

  /**
   * Prepares the form for editing a transaction by setting the editing state
   * and opening the transaction form modal.
   * @param {Transaction} transaction - The transaction to be edited.
   */
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction); // Set transaction to be edited
    setShowForm(true); // Open the form modal
  };

  /**
   * Handles the deletion of a transaction after receiving user confirmation.
   * @param {string} id - The ID of the transaction to be deleted.
   */
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };
  
  // Memoized sorted list of transactions (newest first) to prevent re-sorting on every render
  const sortedTransactions = useMemo(() => 
    [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [transactions]);


  return (
    <div className="space-y-6">
      {/* Page Header and Log Transaction Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Transactions</h1>
        <Button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }} leftIcon="plus" className="w-full sm:w-auto">Log Transaction</Button>
      </div>

      {/* Transaction List or Empty State Message */}
      {sortedTransactions.length === 0 && !showForm ? ( // If no transactions and form isn't open
         <Card className="text-center">
          <Icon iconName="banknotes" className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Log your first lesson or payment.</p>
          <Button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }} leftIcon="plus">Log First Transaction</Button>
        </Card>
      ) : ( // Display list of transactions
        sortedTransactions.map(t => {
          const student = getStudentById(t.studentId); // Get student details for display name
          return (
            <TransactionListItem
              key={t.id}
              transaction={t}
              studentName={student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              currencySymbol={settings.currencySymbol}
            />
          );
        })
      )}

      {/* Modal for Logging/Editing Transactions */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} title={editingTransaction ? 'Edit Transaction' : 'Log New Transaction'}>
        <TransactionForm
          transaction={editingTransaction}
          students={students} // Pass all students for selection in form
          onSave={handleSaveTransaction}
          onClose={() => { setShowForm(false); setEditingTransaction(undefined); }}
          currencySymbol={settings.currencySymbol}
        />
      </Modal>
    </div>
  );
};

/**
 * Allows users to configure application-wide settings, such as their name and
 * preferred currency. It also provides information about data management.
 *
 * @returns {React.ReactElement} A JSX element representing the settings page.
 */
export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useData(); // Access global settings and update function
  // Local state for form changes, initialized with global settings
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const [showConfirmation, setShowConfirmation] = useState(false); // For save confirmation


  // Effect to update local form state if global settings change (e.g., by another component or tab)
  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  /**
   * Updates the local `currentSettings` state when a form field is changed.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The change event from the input or select field.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Saves the current local settings to the global application state via the `updateSettings` context function.
   * It also displays a temporary confirmation message.
   */
  const handleSave = () => {
    updateSettings(currentSettings);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000); // Hide confirmation after 3 seconds
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto"> {/* Centered layout for settings */}
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Settings</h1>
      
      {/* General Settings Card */}
      <Card title="General Settings" titleIcon="cog">
        <div className="space-y-4">
          <Input label="Your Name (Tutor)" name="userName" value={currentSettings.userName} onChange={handleChange} />
          <Select
            label="Currency"
            name="currencySymbol"
            value={currentSettings.currencySymbol}
            onChange={handleChange}
            options={CURRENCY_OPTIONS.map(c => ({ value: c.symbol, label: `${c.name} (${c.symbol})` }))} // Populate from constants
            placeholder="Select currency"
          />
        </div>
        {/* Save Button & Confirmation Message */}
        <div className="mt-6 flex justify-end items-center space-x-3">
          {showConfirmation && <p className="text-sm text-success animate-fade-in">Settings saved!</p>}
          <Button onClick={handleSave} variant="primary">Save Settings</Button>
        </div>
      </Card>

      {/* Data Management Card (Placeholder for future export/import functionality) */}
       <Card title="Data Management" titleIcon="document-text">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Your data (students, transactions, settings) is stored locally in your browser.
          Ensure you have backups if this data is critical.
        </p>
        {/* Placeholder for data export functionality */}
        <Button variant="outline" disabled>Export Data (CSV - Coming Soon)</Button>
      </Card>
    </div>
  );
};

/**
 * Displays the user's gamification progress, including their current rank, points,
 * and a list of all unlocked and pending achievements.
 *
 * @returns {React.ReactElement} A JSX element representing the achievements page.
 */
export const AchievementsPage: React.FC = () => {
  const { achievements, gamification } = useData(); // Access achievements and gamification data
  
  // Filter achievements into 'achieved' and 'pending' lists
  // Sort achieved achievements by date achieved (most recent first)
  const achievedList = achievements
    .filter(a => a.achieved)
    .sort((a,b) => new Date(b.dateAchieved || 0).getTime() - new Date(a.dateAchieved || 0).getTime());
  const pendingList = achievements.filter(a => !a.achieved);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Achievements & Badges</h1>
      
      {/* Gamification Progress Summary Card */}
      <Card title="Your Progress" titleIcon="star"> {/* Changed icon to star for consistency */}
        <div className="flex flex-col sm:flex-row justify-around items-center text-center space-y-6 sm:space-y-0 sm:space-x-4">
            <div>
                <p className="text-4xl font-bold text-secondary">{gamification.points}</p>
                <p className="text-slate-500 dark:text-slate-400">Total Points</p>
            </div>
            <div>
                <p className="text-2xl font-semibold text-primary dark:text-secondary">{gamification.levelName}</p> {/* dark:text-primary-light -> dark:text-secondary */}
                <p className="text-slate-500 dark:text-slate-400">Current Rank (Level {gamification.level})</p>
            </div>
            <div>
                <p className="text-4xl font-bold text-green-500">{achievedList.length} <span className="text-2xl">/ {achievements.length}</span></p>
                <p className="text-slate-500 dark:text-slate-400">Achievements Unlocked</p>
            </div>
        </div>
      </Card>

      {/* Unlocked Achievements List (if any) */}
      {achievedList.length > 0 && (
        <Card title="Unlocked Achievements" titleIcon="sparkles"> {/* Consistent icon */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievedList.map(ach => (
              <div key={ach.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg shadow text-center border border-green-500">
                <span className="text-4xl mb-2 block" role="img" aria-label={ach.name}>{ach.icon}</span>
                <h3 className="font-semibold text-green-600 dark:text-green-400">{ach.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{ach.description}</p>
                {ach.dateAchieved && <p className="text-xs mt-1 text-green-500">Achieved: {formatDate(ach.dateAchieved)}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pending Achievements List (if any) */}
      {pendingList.length > 0 && (
        <Card title="Pending Achievements" titleIcon="academic-cap"> {/* Icon suggesting learning/goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingList.map(ach => (
              <div key={ach.id} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg shadow text-center opacity-70">
                <span className="text-4xl mb-2 block" role="img" aria-label={ach.name}>{ach.icon}</span>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">{ach.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{ach.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* Message if no achievements are defined at all */}
      {achievements.length === 0 && <p>No achievements defined yet.</p>}
    </div>
  );
};

// #endregion Page Components