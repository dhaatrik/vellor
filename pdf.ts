import jsPDF from 'jspdf';
import { DEFAULT_VELLOR_LOGO_BASE64 } from './src/defaultLogo';
import autoTable from 'jspdf-autotable';
import { Transaction, Student, AppSettings, PaymentStatus } from './types';

interface jsPDFWithPlugin extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

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
      // Ignore logo injection failure
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

  const reportTransactions = [];
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (t.studentId === student.id && (t.grade || t.progressRemark)) {
      reportTransactions.push(t);
    }
  }

  // ⚡ Bolt Performance: Use direct string comparison for ISO 8601 dates to eliminate Date.parse() overhead and intermediate mapping
  reportTransactions.sort((a, b) => b.date < a.date ? -1 : (b.date > a.date ? 1 : 0));

  if (reportTransactions.length > 0) {
      // ⚡ Bolt Performance: Replace Array.prototype.map() with a pre-allocated for loop
      // to eliminate intermediate array allocations and reduce garbage collection overhead on large reports.
      const bodyArgs = new Array(reportTransactions.length);
      for (let i = 0, len = reportTransactions.length; i < len; i++) {
        const t = reportTransactions[i];
        bodyArgs[i] = [
          new Date(t.date).toLocaleDateString(),
          t.grade || '-',
          t.progressRemark || '-'
        ];
      }

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Date', 'Grade', 'Remarks']],
        body: bodyArgs,
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

  // Group by student
  // ⚡ Bolt Performance: Consolidate unpaid filtering and grouping into a single pass to eliminate intermediate allocations
  const studentMap: Record<string, Transaction[]> = Object.create(null);
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (t.status === PaymentStatus.Due || t.status === PaymentStatus.PartiallyPaid) {
      if (!studentMap[t.studentId]) studentMap[t.studentId] = [];
      studentMap[t.studentId].push(t);
    }
  }

  const studentsById: Record<string, Student> = Object.create(null);
  for (let i = 0; i < students.length; i++) {
    studentsById[students[i].id] = students[i];
  }

  const studentIds = Object.keys(studentMap);
  for (let idx = 0; idx < studentIds.length; idx++) {
    const studentId = studentIds[idx];
    const studentTransactions = studentMap[studentId];
    const student = studentsById[studentId];
    if (!student) continue;
    
    // Sort transactions by date
    // ⚡ Bolt Performance: Avoid mapping and parsing overhead by using direct lexicographical string comparison
    studentTransactions.sort((a, b) => a.date < b.date ? -1 : (a.date > b.date ? 1 : 0));

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
        // Ignore logo injection failure
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
    // ⚡ Bolt Performance: Replace Array.prototype.map() with a pre-allocated for loop
    // to eliminate intermediate array allocations and reduce garbage collection overhead on large reports.
    const bodyArgs = new Array(studentTransactions.length);
    for (let i = 0, len = studentTransactions.length; i < len; i++) {
      const t = studentTransactions[i];
      const balance = t.lessonFee - t.amountPaid;
      totalDue += balance;
      bodyArgs[i] = [
        new Date(t.date).toLocaleDateString(),
        `${t.lessonDuration} mins`,
        `${settings.currencySymbol}${t.lessonFee}`,
        `${settings.currencySymbol}${t.amountPaid}`,
        `${settings.currencySymbol}${balance}`
      ];
    }

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Duration', 'Fee', 'Paid', 'Balance']],
      body: bodyArgs,
      theme: template === 'classic' ? 'grid' : (template === 'minimal' ? 'plain' : 'striped'),
      headStyles: template === 'modern' ? { fillColor: brandAccent } : (template === 'classic' ? { fillColor: [0, 0, 0] } : { fillColor: [200, 200, 200], textColor: 0 }),
    });

    const finalY = (doc as jsPDFWithPlugin).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    if (template === 'modern') doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`Total Balance Due:`, 140, finalY);
    doc.text(`${settings.currencySymbol}${totalDue.toFixed(2)}`, 180, finalY, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  }

  if (!hasContent) {
    return false;
  }

  doc.save(`Monthly_Invoices_${new Date().toISOString().split('T')[0]}.pdf`);
  return true;
};
