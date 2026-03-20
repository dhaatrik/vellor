import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
// @ts-expect-error - CSS import does not have type declarations
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { Transaction, PaymentStatus } from '../types';
import { Modal, Icon } from '../components/ui';
import { formatCurrency } from '../helpers';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const CalendarPage: React.FC = () => {
  const transactions = useStore(s => s.transactions);
  const students = useStore(s => s.students);
  const settings = useStore(s => s.settings);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const events = useMemo(() => {
    // Create a map for O(1) student lookups, improving performance from O(N*M) to O(N+M)
    const studentMap = new Map(students.map(s => [s.id, s]));

    return transactions.map(t => {
      const student = studentMap.get(t.studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
      
      let startDateStr = t.date;
      if (!startDateStr.includes('T')) {
          startDateStr = `${startDateStr}T10:00:00`; // Fallback to 10 AM if only date is provided
      }
      
      const startDate = new Date(startDateStr);
      // Fallback duration to 60 if not specified
      const endDate = new Date(startDate.getTime() + (t.lessonDuration || 60) * 60000);

      return {
        id: t.id,
        title: studentName,
        start: startDate,
        end: endDate,
        resource: t,
      };
    });
  }, [transactions, students]);

  const eventStyleGetter = (event: any) => {
    const t = event.resource as Transaction;
    let backgroundColor = '#8b5cf6'; // accent

    if (t.status === PaymentStatus.Due) backgroundColor = '#f43f5e'; // danger
    if (t.status === PaymentStatus.PartiallyPaid) backgroundColor = '#f59e0b'; // warning
    if (t.status === PaymentStatus.Paid || t.status === PaymentStatus.Overpaid) backgroundColor = '#10b981'; // success

    const style = {
      backgroundColor,
      borderRadius: '8px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return { style };
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto h-[80vh] flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50">Calendar</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View your teaching schedule and lesson statuses.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-primary rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6 overflow-hidden calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event: any) => setSelectedEvent(event)}
          views={['month', 'week', 'day']}
        />
      </div>

      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Lesson Details">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                 <Icon iconName="user" className="w-5 h-5 text-accent" />
               </div>
               <div>
                  <p className="font-bold text-lg dark:text-white">{selectedEvent.title}</p>
                  <p className="text-sm text-gray-500">{selectedEvent.start.toLocaleString()}</p>
               </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-primary-light p-4 rounded-xl space-y-2">
               <div className="flex justify-between">
                 <span className="text-gray-500">Duration:</span>
                 <span className="font-medium dark:text-white">{selectedEvent.resource.lessonDuration} mins</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-500">Fee:</span>
                 <span className="font-medium dark:text-white">{formatCurrency(selectedEvent.resource.lessonFee, settings.currencySymbol)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-500">Status:</span>
                 <span className={`font-bold uppercase text-xs pt-1 ${
                    selectedEvent.resource.status === PaymentStatus.Due ? 'text-danger' :
                    selectedEvent.resource.status === PaymentStatus.PartiallyPaid ? 'text-warning' : 'text-success'
                 }`}>{selectedEvent.resource.status}</span>
               </div>
            </div>
          </div>
        )}
      </Modal>
      
      <style>{`
        .calendar-container .rbc-toolbar button {
          color: inherit;
        }
        .calendar-container .rbc-toolbar button.rbc-active {
          background-color: #8b5cf6;
          color: white;
          border-color: #8b5cf6;
        }
        .dark .calendar-container .rbc-toolbar button {
          color: #d1d5db;
          border-color: rgba(255,255,255,0.1);
        }
        .dark .calendar-container .rbc-header {
           border-bottom: 1px solid rgba(255,255,255,0.1);
           color: #9ca3af;
        }
        .dark .calendar-container .rbc-day-bg + .rbc-day-bg {
           border-left: 1px solid rgba(255,255,255,0.05);
        }
        .dark .calendar-container .rbc-month-row + .rbc-month-row {
           border-top: 1px solid rgba(255,255,255,0.05);
        }
        .dark .calendar-container .rbc-month-view {
           border: 1px solid rgba(255,255,255,0.05);
        }
        .dark .calendar-container .rbc-off-range-bg {
           background-color: rgba(0,0,0,0.2);
        }
        .dark .calendar-container .rbc-today {
           background-color: rgba(139, 92, 246, 0.1);
        }
        .dark .calendar-container .rbc-time-view {
           border: 1px solid rgba(255,255,255,0.05);
        }
        .dark .calendar-container .rbc-time-header-content {
           border-left: 1px solid rgba(255,255,255,0.05);
        }
        .dark .calendar-container .rbc-time-content {
           border-top: 1px solid rgba(255,255,255,0.05);
        }
        .dark .calendar-container .rbc-timeslot-group {
           border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .dark .calendar-container .rbc-day-slot .rbc-time-slot {
           border-top: 1px solid rgba(255,255,255,0.05);
        }
      `}</style>
    </motion.div>
  );
};
