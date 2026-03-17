import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Student, AppSettings, PaymentStatus } from './types';

export const generateInvoicePDF = (
  transaction: Transaction,
  student: Student,
  settings: AppSettings
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.text('INVOICE', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Invoice ID: ${transaction.id.substring(0, 8).toUpperCase()}`, 14, 30);
  doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 14, 35);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40);

  // Tutor Details
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('From:', 14, 55);
  doc.setFontSize(10);
  doc.text(settings.userName || 'Tutor', 14, 62);
  if (settings.email) doc.text(settings.email, 14, 67);
  if (settings.phone?.number) doc.text(`${settings.phone.countryCode} ${settings.phone.number}`, 14, 72);

  // Student Details
  doc.setFontSize(12);
  doc.text('Bill To:', 120, 55);
  doc.setFontSize(10);
  doc.text(`${student.firstName} ${student.lastName}`, 120, 62);
  if (student.contact?.email) doc.text(student.contact.email, 120, 67);
  
  // Table
  autoTable(doc, {
    startY: 85,
    head: [['Description', 'Duration/Period', 'Fee', 'Amount']],
    body: [
      [
        'Tutoring Lesson / Package',
        `${transaction.lessonDuration} mins/units`,
        `${settings.currencySymbol}${transaction.lessonFee}`,
        `${settings.currencySymbol}${transaction.lessonFee}`
      ]
    ],
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] }, // Violet-500 from Tailwind theme
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Total Amount:`, 140, finalY);
  doc.text(`${settings.currencySymbol}${transaction.lessonFee}`, 180, finalY, { align: 'right' });
  
  doc.text(`Amount Paid:`, 140, finalY + 7);
  doc.text(`${settings.currencySymbol}${transaction.amountPaid}`, 180, finalY + 7, { align: 'right' });
  
  const balance = transaction.lessonFee - transaction.amountPaid;
  doc.setFontSize(11);
  doc.setTextColor(balance > 0 ? 220 : 0, balance > 0 ? 38 : 160, balance > 0 ? 38 : 0);
  doc.text(`Balance Due:`, 140, finalY + 16);
  doc.text(`${settings.currencySymbol}${Math.max(0, balance)}`, 180, finalY + 16, { align: 'right' });

  // Status Badge
  doc.setFontSize(14);
  const statusColor = transaction.status === PaymentStatus.Paid || transaction.status === PaymentStatus.Overpaid 
    ? [16, 185, 129] // success
    : (transaction.status === PaymentStatus.PartiallyPaid ? [245, 158, 11] : [244, 63, 94]); // warning : danger
  
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`STATUS: ${transaction.status.toUpperCase()}`, 14, finalY + 16);

  // Notes
  if (transaction.notes) {
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text('Notes:', 14, finalY + 30);
    const splitNotes = doc.splitTextToSize(transaction.notes, 180);
    doc.text(splitNotes, 14, finalY + 36);
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  doc.save(`Invoice_${student.firstName}_${transaction.date.split('T')[0]}.pdf`);
};
