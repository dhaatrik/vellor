import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
// @ts-expect-error - CSS import does not have type declarations
import 'react-big-calendar/lib/css/react-big-calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
// @ts-expect-error
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
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

const DragAndDropCalendar = withDragAndDrop(Calendar);

export const CalendarPage: React.FC = () => {
  const transactions = useStore(s => s.transactions);
  const students = useStore(s => s.students);
  const settings = useStore(s => s.settings);
  const addTransaction = useStore(s => s.addTransaction);
  const updateTransaction = useStore(s => s.updateTransaction);
  const addToast = useStore(s => s.addToast);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);

  const studentMap = useMemo(() => {
    // Create a dict for O(1) student lookups
    const map: Record<string, typeof students[0]> = Object.create(null);
    for (let i = 0; i < students.length; i++) {
        map[students[i].id] = students[i];
    }
    return map;
  }, [students]);

  const events = useMemo(() => {
    return transactions.map(t => {
      const student = studentMap[t.studentId];
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
  }, [transactions, studentMap]);

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

  const handleEventDrop = ({ event, start, end }: any) => {
    const t = event.resource as Transaction;
    updateTransaction(t.id, {
      ...t,
      date: start.toISOString(),
      lessonDuration: Math.round((end.getTime() - start.getTime()) / 60000)
    });
    addToast('Lesson rescheduled successfully.', 'success');
  };

  const handleEventResize = ({ event, start, end }: any) => {
    const t = event.resource as Transaction;
    updateTransaction(t.id, {
      ...t,
      date: start.toISOString(),
      lessonDuration: Math.round((end.getTime() - start.getTime()) / 60000)
    });
    addToast('Lesson duration updated.', 'success');
  };

  const dragFromOutsideItem = () => {
    if (!draggedStudentId) return {};
    const student = studentMap[draggedStudentId];
    if (!student) return {};
    return { title: `${student.firstName} ${student.lastName}` };
  };

  const onDropFromOutside = ({ start, end }: any) => {
    if (!draggedStudentId) return;
    const student = studentMap[draggedStudentId];
    if (!student) return;
    
    addTransaction({
       studentId: student.id,
       date: start.toISOString(),
       amountPaid: 0,
       lessonFee: student.tuition?.defaultRate || 0,
       paymentMethod: 'Cash',
       status: PaymentStatus.Scheduled,
       lessonDuration: Math.round((end.getTime() - start.getTime()) / 60000) || student.tuition?.typicalLessonDuration || 60,
    });
    addToast(`Scheduled lesson for ${student.firstName}`, 'success');
    setDraggedStudentId(null);
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

      <div className="flex flex-col md:flex-row gap-6 h-[65vh]">
        {/* Draggable Students Sidebar */}
        <div className="w-full md:w-64 bg-white dark:bg-primary rounded-3xl p-4 border border-gray-100 dark:border-white/5 flex flex-col h-48 md:h-full flex-shrink-0 shadow-sm">
           <h3 className="font-display font-medium mb-3 dark:text-gray-50 flex items-center gap-2">
             <Icon iconName="users" className="w-5 h-5 text-accent" />
             Drag to Schedule
           </h3>
           <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {students.map(student => (
                 <div
                    key={student.id}
                    draggable
                    onDragStart={(e) => {
                       setDraggedStudentId(student.id);
                       // HTML5 API requires setting some data
                       e.dataTransfer.setData('text/plain', student.id);
                    }}
                    className="p-3 bg-gray-50 dark:bg-primary-light rounded-xl cursor-grab active:cursor-grabbing border border-gray-200 dark:border-white/10 hover:border-accent hover:shadow-sm transition-colors group"
                 >
                    <p className="font-semibold text-sm select-none dark:text-gray-200 group-hover:text-accent transition-colors">{student.firstName} {student.lastName}</p>
                 </div>
              ))}
              {students.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No students available.</p>}
           </div>
        </div>

        {/* Calendar View */}
        <div className="flex-1 bg-white dark:bg-primary rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6 overflow-hidden calendar-container relative z-10 w-full min-h-[500px]">
          <DragAndDropCalendar
            localizer={localizer}
            events={events}
            startAccessor={(event: any) => event.start}
            endAccessor={(event: any) => event.end}
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event: any) => setSelectedEvent(event)}
            views={['month', 'week', 'day']}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            resizable
            dragFromOutsideItem={dragFromOutsideItem}
            onDropFromOutside={onDropFromOutside}
          />
        </div>
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
