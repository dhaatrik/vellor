import { useEffect } from 'react';
import { useStore } from './store';
import { PaymentStatus } from './types';
import { jsonReviver } from './src/crypto';

export const useReminders = () => {
  const settings = useStore((s) => s.settings);
  const transactions = useStore((s) => s.transactions);
  const students = useStore((s) => s.students);

  useEffect(() => {
    if (!settings.enableReminders) return;

    // Request permission if not granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }

    const checkReminders = () => {
      if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Get already notified IDs from sessionStorage to prevent spam
      const notifiedStr = sessionStorage.getItem('notified_reminders') || '[]';
      const notified = new Set<string>(JSON.parse(notifiedStr, jsonReviver));

      let newNotified = false;

      transactions.forEach(t => {
        if (notified.has(t.id)) return;
        const student = students.find(s => s.id === t.studentId);
        if (!student) return;

        const tDate = new Date(t.date);

        // Lesson in 2 hours
        if (t.status === PaymentStatus.Scheduled && tDate > now && tDate <= twoHoursFromNow) {
          new Notification('Upcoming Lesson!', {
            body: `You have a lesson with ${student.firstName} ${student.lastName} in less than 2 hours.`,
            icon: '/pwa-192x192.svg'
          });
          notified.add(t.id);
          newNotified = true;
        }

        // Payment due tomorrow (For Overdue or Due lessons)
        if ((t.status === PaymentStatus.Due || t.status === PaymentStatus.PartiallyPaid) && tDate < tomorrow && tDate > now) {
           new Notification('Payment Reminder', {
            body: `Payment is due tomorrow for a lesson with ${student.firstName} ${student.lastName}.`,
            icon: '/pwa-192x192.svg'
          });
          notified.add(t.id);
          newNotified = true;
        }
      });

      if (newNotified) {
        sessionStorage.setItem('notified_reminders', JSON.stringify(Array.from(notified)));
      }
    };

    // Check immediately, then every 10 minutes
    checkReminders();
    const interval = setInterval(checkReminders, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.enableReminders, transactions, students]);
};
