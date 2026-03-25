import React from 'react';
import { Student, PhoneNumber } from '../../types';
import { Button, Input, Select, Textarea, PhoneInput, Icon } from '../ui';
import { COUNTRIES } from '../../constants';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Zod schema for Student form validation.
 */
const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  country: z.string().optional(),
  parent: z.object({
    name: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),
  contact: z.object({
    studentPhone: z.object({ countryCode: z.string(), number: z.string() }).optional(),
    parentPhone1: z.object({ countryCode: z.string(), number: z.string() }).optional(),
    parentPhone2: z.object({ countryCode: z.string(), number: z.string() }).optional(),
    email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  }),
  tuition: z.object({
    subjects: z.array(z.string()),
    defaultRate: z.coerce.number().min(0, 'Rate cannot be negative'),
    rateType: z.enum(['hourly', 'per_lesson', 'monthly']),
    typicalLessonDuration: z.coerce.number().min(0, 'Duration cannot be negative'),
    preferredPaymentMethod: z.string().optional()
  }),
  notes: z.string().optional()
});

type StudentFormValues = z.infer<typeof studentSchema>;

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
 * A form for adding a new student or editing an existing one,
 * validated with react-hook-form and zod.
 */
export const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onClose }) => {
  const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: student ? {
      firstName: student.firstName,
      lastName: student.lastName,
      country: student.country || 'United States',
      parent: student.parent || { name: '', relationship: 'Parent' },
      contact: {
        email: student.contact.email || '',
        studentPhone: student.contact.studentPhone || { countryCode: '+1', number: '' },
        parentPhone1: student.contact.parentPhone1 || { countryCode: '+1', number: '' },
        parentPhone2: student.contact.parentPhone2 || { countryCode: '+1', number: '' },
      },
      tuition: student.tuition,
      notes: student.notes || '',
    } : {
      firstName: '', lastName: '',
      country: 'United States',
      parent: { name: '', relationship: 'Parent' },
      contact: { 
        studentPhone: { countryCode: '+1', number: '' },
        parentPhone1: { countryCode: '+1', number: '' },
        parentPhone2: { countryCode: '+1', number: '' },
        email: '' 
      },
      tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60, preferredPaymentMethod: '' },
      notes: '',
    }
  });

  const onSubmit = (data: StudentFormValues) => {
    // Merge generated fields (id, createdAt) with the validated form data.
    const studentToSave: Student = {
      id: student?.id || crypto.randomUUID(),
      createdAt: student?.createdAt || new Date().toISOString(),
      firstName: data.firstName,
      lastName: data.lastName,
      country: data.country,
      parent: data.parent?.name || data.parent?.relationship ? {
        name: data.parent.name || '',
        relationship: data.parent.relationship || 'Parent',
      } : undefined,
      contact: {
        studentPhone: data.contact.studentPhone,
        parentPhone1: data.contact.parentPhone1,
        parentPhone2: data.contact.parentPhone2,
        email: data.contact.email,
      },
      tuition: data.tuition,
      notes: data.notes,
    };
    onSave(studentToSave);
  };

  const [subjectsInput, setSubjectsInput] = React.useState((student?.tuition.subjects || []).join(', '));

  const countryOptions = COUNTRIES.map(c => ({ value: c.name, label: c.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="identification" className="w-4 h-4" />
            Basic Info
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              {...register('firstName')} 
              error={errors.firstName?.message} 
            />
            <Input 
              label="Last Name" 
              {...register('lastName')} 
              error={errors.lastName?.message} 
            />
          </div>
          <Select 
            label="Country" 
            {...register('country', {
              onChange: (e) => {
                const countryName = e.target.value;
                const selectedCountry = COUNTRIES.find(c => c.name === countryName);
                if (selectedCountry) {
                  const sPhone = getValues('contact.studentPhone');
                  setValue('contact.studentPhone', { ...sPhone, countryCode: selectedCountry.code, number: sPhone?.number || '' });
                  const pPhone1 = getValues('contact.parentPhone1');
                  setValue('contact.parentPhone1', { ...pPhone1, countryCode: selectedCountry.code, number: pPhone1?.number || '' });
                  const pPhone2 = getValues('contact.parentPhone2');
                  setValue('contact.parentPhone2', { ...pPhone2, countryCode: selectedCountry.code, number: pPhone2?.number || '' });
                }
              }
            })} 
            options={countryOptions} 
            error={errors.country?.message}
          />
        </div>

        {/* Parent Details */}
        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="users" className="w-4 h-4" />
            Parent/Guardian Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Parent Name" 
              {...register('parent.name')} 
              error={errors.parent?.name?.message} 
            />
            <Select 
              label="Relationship" 
              {...register('parent.relationship')} 
              options={[
                {value: 'Parent', label: 'Parent'},
                {value: 'Mother', label: 'Mother'}, 
                {value: 'Father', label: 'Father'}, 
                {value: 'Guardian', label: 'Guardian'}
              ]}
              error={errors.parent?.relationship?.message}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="phone" className="w-4 h-4" />
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="contact.studentPhone"
              control={control}
              render={({ field }) => (
                <PhoneInput 
                  label="Student Phone" 
                  name={field.name} 
                  value={field.value as PhoneNumber} 
                  onChange={(_, value) => field.onChange(value)} 
                />
              )}
            />
            <Controller
              name="contact.parentPhone1"
              control={control}
              render={({ field }) => (
                <PhoneInput 
                  label="Parent Phone 1" 
                  name={field.name} 
                  value={field.value as PhoneNumber} 
                  onChange={(_, value) => field.onChange(value)} 
                />
              )}
            />
            <Controller
              name="contact.parentPhone2"
              control={control}
              render={({ field }) => (
                <PhoneInput 
                  label="Parent Phone 2 (Optional)" 
                  name={field.name} 
                  value={field.value as PhoneNumber} 
                  onChange={(_, value) => field.onChange(value)} 
                />
              )}
            />
            <Input 
              label="Email" 
              type="email" 
              {...register('contact.email')} 
              error={errors.contact?.email?.message} 
              wrapperClassName="md:col-span-2" 
            />
          </div>
        </div>

        {/* Tuition Details */}
        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="academic-cap" className="w-4 h-4" />
            Tuition Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Subject(s)" 
              helperText="For more than one use comma" 
              value={subjectsInput}
              onChange={(e) => {
                setSubjectsInput(e.target.value);
                setValue('tuition.subjects', e.target.value.split(',').map(s => s.trim()).filter(Boolean), { shouldValidate: true });
              }}
            />
            <Input 
              label="Default Rate" 
              type="number" 
              {...register('tuition.defaultRate')} 
              error={errors.tuition?.defaultRate?.message}
              min="0" step="0.01" 
            />
            <Select 
              label="Rate Type" 
              {...register('tuition.rateType')} 
              error={errors.tuition?.rateType?.message}
              options={[
                {value: 'hourly', label: 'Hourly'}, 
                {value: 'per_lesson', label: 'Per Lesson'},
                {value: 'monthly', label: 'Monthly'}
              ]} 
            />
            <Input 
              label="Duration (mins)" 
              type="number" 
              {...register('tuition.typicalLessonDuration')} 
              error={errors.tuition?.typicalLessonDuration?.message}
              min="0" 
              helperText="Typical Lesson/Session Duration" 
            />
            <Select 
              label="Preferred Payment Method" 
              {...register('tuition.preferredPaymentMethod')} 
              error={errors.tuition?.preferredPaymentMethod?.message}
              options={[
                { value: '', label: 'Not Specified' },
                { value: 'Online', label: 'Online' },
                { value: 'Cash', label: 'Cash' },
              ]} 
            />
          </div>
        </div>
        
        {/* Additional Notes */}
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
          {student ? 'Save Changes' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
};