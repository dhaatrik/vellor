import jsPDF from 'jspdf';
import { DEFAULT_VELLOR_LOGO_BASE64 } from './src/defaultLogo';
import autoTable from 'jspdf-autotable';
import { Transaction, Student, AppSettings, PaymentStatus } from './types';

export const generateInvoicePDF = (
  transaction: Transaction,
  student: Student,
  settings: AppSettings,
  returnBlob: boolean = false
): Blob | undefined => {
  const doc = new jsPDF();
  const template = settings.invoiceTemplate || 'modern';
  
  let currentY = 20;
  const brandAccent = settings.brandColor || '#8b5cf6';
  const logoToUse = settings.invoiceLogoBase64 || settings.brandLogoBase64 || DEFAULT_VELLOR_LOGO_BASE64;
  
  if (logoToUse) {
    try {
      doc.addImage(logoToUse, 'JPEG', 14, 10, 30, 30, undefined, 'FAST');
      currentY = 45;
    } catch (e) {
      console.warn("Logo injection failed", e);
    }
  }

  if (template === 'minimal') {
      doc.setFontSize(16);
      doc.text('INVOICE', 14, currentY);
  } else if (template === 'classic') {
      doc.setFontSize(22);
      doc.setFont("times", "bold");
      doc.text('INVOICE', 14, currentY);
      doc.setFont("helvetica", "normal");
  } else {
      // modern
      doc.setFontSize(24);
      doc.setTextColor(brandAccent); // accent
      doc.text('INVOICE', 14, currentY);
  }
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  currentY += 8;
  doc.text(`Invoice ID: ${transaction.id.substring(0, 8).toUpperCase()}`, 14, currentY);
  currentY += 5;
  doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 14, currentY);
  
  currentY += 15;
  
  // Tutor Details
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('From:', 14, currentY);
  doc.setFontSize(10);
  doc.text(settings.userName || 'Tutor', 14, currentY + 7);
  if (settings.email) doc.text(settings.email, 14, currentY + 12);
  if (settings.phone?.number) doc.text(`${settings.phone.countryCode} ${settings.phone.number}`, 14, currentY + 17);

  // Student Details
  doc.setFontSize(12);
  doc.text('Bill To:', 120, currentY);
  doc.setFontSize(10);
  doc.text(`${student.firstName} ${student.lastName}`, 120, currentY + 7);
  if (student.contact?.email) doc.text(student.contact.email, 120, currentY + 12);
  
  currentY += 25;

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Duration', 'Fee']],
    body: [
      [
        'Tutoring Lesson / Package',
        `${transaction.lessonDuration} mins/units`,
        `${settings.currencySymbol}${transaction.lessonFee}`
      ]
    ],
    theme: template === 'classic' ? 'grid' : (template === 'minimal' ? 'plain' : 'striped'),
    headStyles: template === 'modern' ? { fillColor: brandAccent } : (template === 'classic' ? { fillColor: [0, 0, 0] } : { fillColor: [200, 200, 200], textColor: 0 }),
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  
  doc.text(`Total Amount:`, 140, finalY);
  doc.text(`${settings.currencySymbol}${transaction.lessonFee}`, 180, finalY, { align: 'right' });
  
  doc.text(`Amount Paid:`, 140, finalY + 7);
  doc.text(`${settings.currencySymbol}${transaction.amountPaid}`, 180, finalY + 7, { align: 'right' });
  
  const balance = transaction.lessonFee - transaction.amountPaid;
  doc.setFontSize(12);
  if (template === 'modern') doc.setFont('helvetica', 'bold');
  doc.setTextColor(balance > 0 ? 220 : 0, balance > 0 ? 38 : 150, balance > 0 ? 38 : 0);
  doc.text(`Balance Due:`, 140, finalY + 16);
  doc.text(`${settings.currencySymbol}${Math.max(0, balance)}`, 180, finalY + 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  doc.setFontSize(14);
  const statusColor = transaction.status === PaymentStatus.Paid || transaction.status === PaymentStatus.Overpaid 
    ? [16, 185, 129] : (transaction.status === PaymentStatus.PartiallyPaid ? [245, 158, 11] : [244, 63, 94]); 
  
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`STATUS: ${transaction.status.toUpperCase()}`, 14, finalY + 16);

  if (transaction.notes) {
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text('Notes:', 14, finalY + 30);
    const splitNotes = doc.splitTextToSize(transaction.notes, 180);
    doc.text(splitNotes, 14, finalY + 36);
  }

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  if (returnBlob) {
    return doc.output('blob');
  } else {
    doc.save(`Invoice_${student.firstName}_${transaction.date.split('T')[0]}.pdf`);
  }
};

export const generateProgressReportPDF = (
  student: Student,
  transactions: Transaction[],
  settings: AppSettings,
  parentNote: string
) => {
  const doc = new jsPDF();
  const template = settings.invoiceTemplate || 'modern';
  let currentY = 20;
  const brandAccent = settings.brandColor || '#8b5cf6';
  const logoToUse = settings.invoiceLogoBase64 || settings.brandLogoBase64 || DEFAULT_VELLOR_LOGO_BASE64;

  if (logoToUse) {
    try {
      doc.addImage(logoToUse, 'JPEG', 14, 10, 30, 30, undefined, 'FAST');
      currentY = 45;
    } catch (e) {
      console.warn("Logo injection failed", e);
    }
  }

  doc.setFontSize(22);
  if (template === 'modern') {
     doc.setTextColor(brandAccent);
  } else {
     doc.setTextColor(0);
  }
  doc.text('PROGRESS REPORT', 14, currentY);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  currentY += 8;
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, currentY);
  
  currentY += 15;
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('Student:', 14, currentY);
  doc.setFontSize(10);
  doc.text(`${student.firstName} ${student.lastName}`, 14, currentY + 7);
  
  if (parentNote) {
     currentY += 20;
     doc.setFontSize(12);
     doc.text('Teacher Note:', 14, currentY);
     doc.setFontSize(10);
     doc.setTextColor(80);
     const splitNotes = doc.splitTextToSize(parentNote, 180);
     doc.text(splitNotes, 14, currentY + 7);
     currentY += (splitNotes.length * 5) + 5;
  } else {
     currentY += 15;
  }

  const reportTransactions = transactions
     .filter(t => t.studentId === student.id && (t.grade || t.progressRemark))
     .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (reportTransactions.length > 0) {
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Date', 'Grade', 'Remarks']],
        body: reportTransactions.map(t => [
          new Date(t.date).toLocaleDateString(),
          t.grade || '-',
          t.progressRemark || '-'
        ]),
        theme: template === 'classic' ? 'grid' : (template === 'minimal' ? 'plain' : 'striped'),
        headStyles: template === 'modern' ? { fillColor: brandAccent } : (template === 'classic' ? { fillColor: [0, 0, 0] } : { fillColor: [200, 200, 200], textColor: 0 }),
      });
  } else {
      currentY += 15;
      doc.text("No progress records found.", 14, currentY);
  }

  doc.save(`ProgressReport_${student.firstName}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateBulkInvoicePDF = (
  students: Student[],
  transactions: Transaction[],
  settings: AppSettings
) => {
  const doc = new jsPDF();
  const template = settings.invoiceTemplate || 'modern';
  const brandAccent = settings.brandColor || '#8b5cf6';
  const logoToUse = settings.invoiceLogoBase64 || settings.brandLogoBase64 || DEFAULT_VELLOR_LOGO_BASE64;
  let hasContent = false;
  let isFirstPage = true;

  // Find all unpaid or partially paid transactions
  const unpaidTransactions = transactions.filter(
    t => t.status === PaymentStatus.Due || t.status === PaymentStatus.PartiallyPaid
  );

  // Group by student
  const studentMap = new Map<string, Transaction[]>();
  unpaidTransactions.forEach(t => {
    if (!studentMap.has(t.studentId)) studentMap.set(t.studentId, []);
    studentMap.get(t.studentId)!.push(t);
  });

  studentMap.forEach((studentTransactions, studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Sort transactions by date
    studentTransactions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;
    hasContent = true;

    let currentY = 20;

    if (logoToUse) {
      try {
        doc.addImage(logoToUse, 'JPEG', 14, 10, 30, 30, undefined, 'FAST');
        currentY = 45;
      } catch (e) {
        console.warn("Logo injection failed", e);
      }
    }

    if (template === 'minimal') {
        doc.setFontSize(16);
        doc.text('MONTHLY STATEMENT', 14, currentY);
    } else if (template === 'classic') {
        doc.setFontSize(22);
        doc.setFont("times", "bold");
        doc.text('MONTHLY STATEMENT', 14, currentY);
        doc.setFont("helvetica", "normal");
    } else {
        doc.setFontSize(24);
        doc.setTextColor(brandAccent);
        doc.text('MONTHLY STATEMENT', 14, currentY);
    }
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    currentY += 8;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, currentY);
    
    currentY += 15;
    
    // Tutor Details
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text('From:', 14, currentY);
    doc.setFontSize(10);
    doc.text(settings.userName || 'Tutor', 14, currentY + 7);
    if (settings.email) doc.text(settings.email, 14, currentY + 12);
    if (settings.phone?.number) doc.text(`${settings.phone.countryCode} ${settings.phone.number}`, 14, currentY + 17);

    // Student Details
    doc.setFontSize(12);
    doc.text('Bill To:', 120, currentY);
    doc.setFontSize(10);
    doc.text(`${student.firstName} ${student.lastName}`, 120, currentY + 7);
    if (student.contact?.email) doc.text(student.contact.email, 120, currentY + 12);
    
    currentY += 25;

    let totalDue = 0;
    const bodyArgs = studentTransactions.map(t => {
      const balance = t.lessonFee - t.amountPaid;
      totalDue += balance;
      return [
        new Date(t.date).toLocaleDateString(),
        `${t.lessonDuration} mins`,
        `${settings.currencySymbol}${t.lessonFee}`,
        `${settings.currencySymbol}${t.amountPaid}`,
        `${settings.currencySymbol}${balance}`
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Duration', 'Fee', 'Paid', 'Balance']],
      body: bodyArgs,
      theme: template === 'classic' ? 'grid' : (template === 'minimal' ? 'plain' : 'striped'),
      headStyles: template === 'modern' ? { fillColor: brandAccent } : (template === 'classic' ? { fillColor: [0, 0, 0] } : { fillColor: [200, 200, 200], textColor: 0 }),
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    if (template === 'modern') doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`Total Balance Due:`, 140, finalY);
    doc.text(`${settings.currencySymbol}${totalDue.toFixed(2)}`, 180, finalY, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  });

  if (!hasContent) {
    return false;
  }

  doc.save(`Monthly_Invoices_${new Date().toISOString().split('T')[0]}.pdf`);
  return true;
};
