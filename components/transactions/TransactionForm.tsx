import React from 'react';
import { useStore } from '../../store';
import { Transaction, Student, PaymentStatus, AttendanceStatus } from '../../types';
import { Button, Input, Select, Textarea, Icon } from '../ui';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const transactionSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  date: z.string().min(1, 'Date is required'),
  lessonDuration: z.coerce.number().min(0, 'Duration cannot be negative'),
  lessonFee: z.coerce.number().min(0, 'Fee cannot be negative'),
  amountPaid: z.coerce.number().min(0, 'Paid amount cannot be negative'),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  grade: z.string().optional(),
  progressRemark: z.string().optional(),
  attendance: z.nativeEnum(AttendanceStatus).optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

/**
 * Props for the TransactionForm component.
 */
interface TransactionFormProps {
  /** Optional transaction data to pre-fill for editing. */
  transaction?: Transaction;
  /** List of all students to populate the student selection dropdown. */
  students: Student[];
  /** Optional default student ID to pre-select in the form. */
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
 */
export const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, students, defaultStudentId, onSave, onClose, currencySymbol }) => {
  const getStudentById = useStore(s => s.getStudentById);
  
  // Resolve default values
  let defaultFormValues: TransactionFormValues = {
      studentId: defaultStudentId || (students.length > 0 ? students[0].id : ''),
      date: new Date().toISOString().split('T')[0],
      lessonDuration: 60,
      lessonFee: 0,
      amountPaid: 0,
      paymentMethod: '',
      notes: '',
      grade: '',
      progressRemark: '',
      attendance: AttendanceStatus.Present,
  };

  if (transaction) {
      defaultFormValues = {
          studentId: transaction.studentId,
          date: transaction.date.split('T')[0],
          lessonDuration: transaction.lessonDuration,
          lessonFee: transaction.lessonFee,
          amountPaid: transaction.amountPaid,
          paymentMethod: transaction.paymentMethod || '',
          notes: transaction.notes || '',
          grade: transaction.grade || '',
          progressRemark: transaction.progressRemark || '',
          attendance: transaction.attendance || AttendanceStatus.Present,
      };
  } else if (defaultStudentId) {
      const student = getStudentById(defaultStudentId);
      if (student) {
          defaultFormValues.lessonDuration = student.tuition.typicalLessonDuration;
          if (student.tuition.rateType === 'per_lesson' || student.tuition.rateType === 'monthly') {
              defaultFormValues.lessonFee = student.tuition.defaultRate;
              if (student.tuition.rateType === 'monthly') defaultFormValues.lessonDuration = 1;
          } else {
              defaultFormValues.lessonFee = student.tuition.defaultRate * (defaultFormValues.lessonDuration / 60);
          }
          defaultFormValues.amountPaid = defaultFormValues.lessonFee;
      }
  } else if (!defaultStudentId && students.length > 0) {
      // Initialize with the first student if no default is provided
      const student = getStudentById(students[0].id);
      if (student) {
          defaultFormValues.lessonDuration = student.tuition.typicalLessonDuration;
          if (student.tuition.rateType === 'per_lesson' || student.tuition.rateType === 'monthly') {
              defaultFormValues.lessonFee = student.tuition.defaultRate;
              if (student.tuition.rateType === 'monthly') defaultFormValues.lessonDuration = 1;
          } else {
              defaultFormValues.lessonFee = student.tuition.defaultRate * (defaultFormValues.lessonDuration / 60);
          }
          defaultFormValues.amountPaid = defaultFormValues.lessonFee;
      }
  }

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: defaultFormValues
  });

  const currentStudentId = watch('studentId');
  const studentRateType = getStudentById(currentStudentId)?.tuition.rateType;

  // Manual onChange overrides for React Hook Form to keep dynamic fee/duration logic
  const { onChange: rStudentIdChange, ...restStudentId } = register('studentId');
  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      rStudentIdChange(e);
      const newStudentId = e.target.value;
      if (newStudentId && !transaction) { // Only do this automatically if we're not editing an existing transaction
          const student = getStudentById(newStudentId);
          if (student) {
              let duration = student.tuition.typicalLessonDuration;
              let fee = 0;
              if (student.tuition.rateType === 'hourly') {
                  fee = student.tuition.defaultRate * (duration / 60);
              } else if (student.tuition.rateType === 'per_lesson' || student.tuition.rateType === 'monthly') {
                  fee = student.tuition.defaultRate;
                  if (student.tuition.rateType === 'monthly') duration = 1;
              }
              setValue('lessonDuration', duration);
              setValue('lessonFee', fee);
              setValue('amountPaid', fee);
          }
      }
  };

  const { onChange: rDurationChange, ...restDuration } = register('lessonDuration');
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      rDurationChange(e);
      const duration = parseFloat(e.target.value) || 0;
      if (currentStudentId) {
          const student = getStudentById(currentStudentId);
          if (student) {
              if (student.tuition.rateType === 'hourly') {
                  setValue('lessonFee', student.tuition.defaultRate * (duration / 60));
              } else if (student.tuition.rateType === 'per_lesson' || student.tuition.rateType === 'monthly') {
                  setValue('lessonFee', student.tuition.defaultRate);
              }
          }
      }
  };

  const onSubmit = (data: TransactionFormValues) => {
    const transactionToSave: Transaction = {
      id: transaction?.id || crypto.randomUUID(),
      createdAt: transaction?.createdAt || new Date().toISOString(),
      ...data,
      status: PaymentStatus.Due, // This gets calculated accurately in store.ts upon adding/updating
    };
    onSave(transactionToSave);
  };

  const studentOptions = [
    { value: '', label: 'Select a student' },
    ...students.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="identification" className="w-4 h-4" />
            Lesson Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select 
              label="Student" 
              {...restStudentId} 
              onChange={handleStudentChange} 
              options={studentOptions} 
              error={errors.studentId?.message}
            />
            <Input 
              label="Date" 
              type="date" 
              {...register('date')} 
              error={errors.date?.message}
            />
            <Select 
               label="Attendance" 
               {...register('attendance')} 
               options={[
                  {label: 'Present', value: AttendanceStatus.Present},
                  {label: 'Absent', value: AttendanceStatus.Absent},
                  {label: 'Cancelled', value: AttendanceStatus.Cancelled},
               ]}
               error={errors.attendance?.message}
             />
          </div>
          <Input 
            label="Lesson Duration (minutes) / Reference" 
            type="number" 
            {...restDuration}
            onChange={handleDurationChange}
            min="0" 
            error={errors.lessonDuration?.message}
            helperText={studentRateType === 'monthly' ? 'e.g., 1 for 1 month' : 'e.g., 60 for 60 minutes'}
          />
        </div>

        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="banknotes" className="w-4 h-4" />
            Payment Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label={`Lesson Fee (${currencySymbol})`} 
              type="number" 
              {...register('lessonFee')} 
              min="0" 
              step="0.01" 
              error={errors.lessonFee?.message}
              disabled={studentRateType === 'monthly' || studentRateType === 'per_lesson'} 
            />
            <Input 
              label={`Amount Paid (${currencySymbol})`} 
              type="number" 
              {...register('amountPaid')} 
              min="0" 
              step="0.01" 
              error={errors.amountPaid?.message}
            />
          </div>
          <Input 
            label="Payment Method" 
            {...register('paymentMethod')} 
            error={errors.paymentMethod?.message}
            placeholder="e.g. Cash, Bank Transfer" 
          />
        </div>

        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="star" className="w-4 h-4" />
            Academic Progress
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Select 
               label="Grade / Rating" 
               {...register('grade')} 
               options={[
                  {label: '(No Grade)', value: ''},
                  {label: 'A / Excellent', value: 'A'},
                  {label: 'B / Good', value: 'B'},
                  {label: 'C / Average', value: 'C'},
                  {label: 'D / Below Average', value: 'D'},
                  {label: 'F / Needs Help', value: 'F'},
                  {label: 'Pass', value: 'Pass'},
                  {label: 'Fail', value: 'Fail'},
               ]}
               error={errors.grade?.message}
             />
             <Input 
               label="Progress Remark" 
               {...register('progressRemark')} 
               placeholder="e.g. Mastered fractions"
               error={errors.progressRemark?.message}
             />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="document-text" className="w-4 h-4" />
            Additional Notes
          </h4>
          <Textarea 
            label="Notes" 
            {...register('notes')} 
            error={errors.notes?.message}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/10">
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-full px-6">Cancel</Button>
        <Button type="submit" variant="primary" className="rounded-full px-8 shadow-lg shadow-accent/20">
          {transaction ? 'Save Changes' : 'Log Lesson'}
        </Button>
      </div>
    </form>
  );
};