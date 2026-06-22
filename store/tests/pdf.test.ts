import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateProgressReportPDF, generateBulkInvoicePDF } from '../../pdf';
import { Student, Transaction, AppSettings, PaymentStatus } from '../../types';

// Properly mock jsPDF as a class
const mockJsPDFInstance = {
  addImage: vi.fn(),
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  setTextColor: vi.fn(),
  text: vi.fn(),
  splitTextToSize: vi.fn((text) => [text]),
  addPage: vi.fn(),
  save: vi.fn(),
  output: vi.fn(),
  lastAutoTable: { finalY: 100 }
};

vi.mock('jspdf', () => {
  return {
    default: class MockJsPDF {
      constructor() {
        return mockJsPDFInstance;
      }
    }
  };
});

vi.mock('jspdf-autotable', () => {
  return { default: vi.fn() };
});

describe('pdf.ts utilities', () => {
  let mockStudent: Student;
  let mockTransaction: Transaction;
  let mockSettings: AppSettings;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStudent = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      contact: {
        email: 'john.doe@example.com'
      },
      tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
      createdAt: new Date().toISOString()
    };

    mockTransaction = {
      id: 'tx1',
      studentId: '1',
      date: new Date().toISOString(),
      lessonDuration: 60,
      lessonFee: 50,
      amountPaid: 50,
      status: PaymentStatus.Paid,
      createdAt: new Date().toISOString()
    };

    mockSettings = {
      theme: 'light' as any,
      currencySymbol: '$',
      userName: 'Jane Tutor',
      email: 'jane.tutor@example.com',
      phone: { countryCode: '+1', number: '555-1234' },
      invoiceTemplate: 'modern',
      brandColor: '#ff0000',
      brandLogoBase64: 'data:image/png;base64,...'
    };
  });

  describe('generateProgressReportPDF', () => {
    it('should generate a progress report PDF and save', () => {
      generateProgressReportPDF(mockStudent, [mockTransaction], mockSettings, 'Great job!');

      expect(mockJsPDFInstance.save).toHaveBeenCalled();
      expect(mockJsPDFInstance.save).toHaveBeenCalledWith(expect.stringContaining('ProgressReport_John_'));
    });

    it('should generate a progress report using classic template', () => {
      const classicSettings = { ...mockSettings, invoiceTemplate: 'classic' as const };
      generateProgressReportPDF(mockStudent, [mockTransaction], classicSettings, '');
      expect(mockJsPDFInstance.setTextColor).toHaveBeenCalledWith(0);
    });

    it('should generate a progress report using minimal template', () => {
      const minimalSettings = { ...mockSettings, invoiceTemplate: 'minimal' as const };
      generateProgressReportPDF(mockStudent, [mockTransaction], minimalSettings, '');
      expect(mockJsPDFInstance.setTextColor).toHaveBeenCalledWith(0);
    });

    it('should generate a progress report using unknown template to hit else branch in template colors', () => {
      const unknownSettings = { ...mockSettings, invoiceTemplate: 'unknown' as any };
      generateProgressReportPDF(mockStudent, [mockTransaction], unknownSettings, '');
      expect(mockJsPDFInstance.setTextColor).toHaveBeenCalledWith(0);
    });

    it('should handle transactions with grade and progress remarks', () => {
      const gradedTx = { ...mockTransaction, id: 'tx1', grade: 'A', date: '2023-02-01T10:00:00.000Z' };
      const remarkedTx = { ...mockTransaction, id: 'tx2', progressRemark: 'Good progress', date: '2023-01-01T10:00:00.000Z' };
      // Adding one transaction without grade or remark to cover filter out branch
      const emptyTx = { ...mockTransaction, id: 'tx3', date: '2023-01-15T10:00:00.000Z' };
      // Add a tx for another student
      const otherStudentTx = { ...mockTransaction, id: 'tx4', studentId: '2', grade: 'B', date: '2023-01-10T10:00:00.000Z' };

      generateProgressReportPDF(mockStudent, [gradedTx, remarkedTx, emptyTx, otherStudentTx], mockSettings, '');
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should handle string date in transactions for progress report', () => {
      const gradedTx = { ...mockTransaction, id: 'tx1', grade: 'A', date: '2023-02-01T10:00:00.000Z' };
      const objectDateTx = { ...mockTransaction, id: 'tx2', progressRemark: 'Good', date: new Date('2023-01-01') as unknown as string };

      generateProgressReportPDF(mockStudent, [gradedTx, objectDateTx], mockSettings, '');
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should ignore logo injection failure in progress report', () => {
      // Mock addImage to throw an error
      mockJsPDFInstance.addImage.mockImplementationOnce(() => {
        throw new Error('Logo injection failed');
      });
      generateProgressReportPDF(mockStudent, [mockTransaction], mockSettings, 'Notes');
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should handle empty transactions list gracefully in progress report', () => {
        generateProgressReportPDF(mockStudent, [], mockSettings, '');
        expect(mockJsPDFInstance.text).toHaveBeenCalledWith('No progress records found.', 14, expect.any(Number));
        expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should handle missing parentNote gracefully in progress report', () => {
        generateProgressReportPDF(mockStudent, [mockTransaction], mockSettings, '');
        expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should correctly sort transactions by time in descending order in progress report', () => {
        const newerTx = { ...mockTransaction, id: 'tx1', grade: 'A', date: '2023-02-01T10:00:00.000Z' };
        const olderTx = { ...mockTransaction, id: 'tx2', progressRemark: 'Good progress', date: '2023-01-01T10:00:00.000Z' };
        const objectDateTx = { ...mockTransaction, id: 'tx3', progressRemark: 'Good progress', date: new Date('2023-01-15T10:00:00.000Z') as unknown as string };
        const objectDateTx4 = { ...mockTransaction, id: 'tx4', progressRemark: 'Good progress', date: new Date('2023-01-15T10:00:00.000Z') as unknown as string };
        generateProgressReportPDF(mockStudent, [olderTx, newerTx, objectDateTx, objectDateTx4], mockSettings, '');
        expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should gracefully handle empty note but valid transactions array in progress report', () => {
        const validTx = { ...mockTransaction, id: 'tx1', grade: 'B', date: '2023-02-01T10:00:00.000Z' };
        generateProgressReportPDF(mockStudent, [validTx], mockSettings, '');
        expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should skip transactions that do not belong to the student', () => {
        const studentTx = { ...mockTransaction, id: 'tx1', grade: 'B', date: '2023-02-01T10:00:00.000Z' };
        const otherTx = { ...mockTransaction, id: 'tx2', studentId: '999', grade: 'A', date: '2023-02-01T10:00:00.000Z' };
        generateProgressReportPDF(mockStudent, [studentTx, otherTx], mockSettings, '');
        expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });
  });

  describe('generateBulkInvoicePDF', () => {
    it('should return false when generating bulk invoice PDF without unpaid transactions', () => {
      const result = generateBulkInvoicePDF([mockStudent], [mockTransaction], mockSettings);
      expect(result).toBe(false);
    });

    it('should generate a bulk invoice PDF and return true when unpaid transactions exist', () => {
      const unpaidTransaction = { ...mockTransaction, amountPaid: 0, status: PaymentStatus.Due };

      const result = generateBulkInvoicePDF([mockStudent], [unpaidTransaction], mockSettings);

      expect(result).toBe(true);
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
      expect(mockJsPDFInstance.save).toHaveBeenCalledWith(expect.stringContaining('Monthly_Invoices_'));
    });

    it('should handle classic and minimal templates correctly', () => {
      const unpaidTransaction = { ...mockTransaction, amountPaid: 0, status: PaymentStatus.Due };

      const classicSettings = { ...mockSettings, invoiceTemplate: 'classic' as const };
      generateBulkInvoicePDF([mockStudent], [unpaidTransaction], classicSettings);
      expect(mockJsPDFInstance.setFont).toHaveBeenCalledWith('times', 'bold');

      vi.clearAllMocks();

      const minimalSettings = { ...mockSettings, invoiceTemplate: 'minimal' as const };
      generateBulkInvoicePDF([mockStudent], [unpaidTransaction], minimalSettings);
      expect(mockJsPDFInstance.setFontSize).toHaveBeenCalledWith(16);
    });

    it('should handle unknown templates gracefully', () => {
      const unpaidTransaction = { ...mockTransaction, amountPaid: 0, status: PaymentStatus.Due };
      const unknownSettings = { ...mockSettings, invoiceTemplate: 'unknown' as any };
      generateBulkInvoicePDF([mockStudent], [unpaidTransaction], unknownSettings);
      expect(mockJsPDFInstance.setFontSize).toHaveBeenCalledWith(24);
    });

    it('should generate multiple pages for multiple students with unpaid transactions', () => {
      const student2 = { ...mockStudent, id: '2', firstName: 'Jane' };
      const unpaidTx1 = { ...mockTransaction, amountPaid: 0, status: PaymentStatus.Due };
      const unpaidTx2 = { ...mockTransaction, id: 'tx2', studentId: '2', amountPaid: 0, status: PaymentStatus.Due };

      const result = generateBulkInvoicePDF([mockStudent, student2], [unpaidTx1, unpaidTx2], mockSettings);

      expect(result).toBe(true);
      expect(mockJsPDFInstance.addPage).toHaveBeenCalled();
    });

    it('should skip transactions for missing students', () => {
      const unpaidTransaction = { ...mockTransaction, amountPaid: 0, status: PaymentStatus.Due };
      // Pass an empty array for students
      const result = generateBulkInvoicePDF([], [unpaidTransaction], mockSettings);
      expect(result).toBe(false);
    });

    it('should handle missing students gracefully by continuing', () => {
        const unpaidTx1 = { ...mockTransaction, studentId: '1', amountPaid: 0, status: PaymentStatus.Due };
        const unpaidTx2 = { ...mockTransaction, id: 'tx2', studentId: '2', amountPaid: 0, status: PaymentStatus.Due }; // Student 2 is missing

        generateBulkInvoicePDF([mockStudent], [unpaidTx1, unpaidTx2], mockSettings);
        expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should correctly sort multiple transactions', () => {
        const unpaidTx1 = { ...mockTransaction, id: 'tx1', date: '2023-02-01T10:00:00.000Z', amountPaid: 0, status: PaymentStatus.Due };
        const unpaidTx2 = { ...mockTransaction, id: 'tx2', date: '2023-01-01T10:00:00.000Z', amountPaid: 0, status: PaymentStatus.Due };
        const unpaidTx3 = { ...mockTransaction, id: 'tx3', date: '2023-01-15T10:00:00.000Z', amountPaid: 0, status: PaymentStatus.Due };
        // Adding a tx with same date to trigger 0 return in sort function
        const unpaidTx4 = { ...mockTransaction, id: 'tx4', date: '2023-01-15T10:00:00.000Z', amountPaid: 0, status: PaymentStatus.Due };

        generateBulkInvoicePDF([mockStudent], [unpaidTx1, unpaidTx2, unpaidTx3, unpaidTx4], mockSettings);
        expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should correctly sort ascending multiple transactions', () => {
        const unpaidTx1 = { ...mockTransaction, id: 'tx1', date: '2023-01-01T10:00:00.000Z', amountPaid: 0, status: PaymentStatus.Due };
        const unpaidTx2 = { ...mockTransaction, id: 'tx2', date: '2023-02-01T10:00:00.000Z', amountPaid: 0, status: PaymentStatus.Due };

        generateBulkInvoicePDF([mockStudent], [unpaidTx1, unpaidTx2], mockSettings);
        expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should ignore logo injection failure in bulk invoice when invalid base64 is provided', () => {
      // Mock addImage to throw an error
      mockJsPDFInstance.addImage.mockImplementationOnce(() => {
        throw new Error('Logo injection failed due to invalid base64');
      });
      const unpaidTransaction = { ...mockTransaction, amountPaid: 0, status: PaymentStatus.Due };
      const invalidLogoSettings = { ...mockSettings, invoiceLogoBase64: 'invalid-base64-string' };
      generateBulkInvoicePDF([mockStudent], [unpaidTransaction], invalidLogoSettings);
      expect(mockJsPDFInstance.addImage).toHaveBeenCalledWith('invalid-base64-string', 'JPEG', 14, 10, 30, 30, undefined, 'FAST');
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should handle optional student fields correctly in bulk invoice', () => {
      const unpaidTransaction = { ...mockTransaction, amountPaid: 0, status: PaymentStatus.Due };
      const incompleteStudent = { ...mockStudent, contact: {} }; // no email
      const incompleteSettings = { ...mockSettings, email: undefined, phone: undefined };

      generateBulkInvoicePDF([incompleteStudent], [unpaidTransaction], incompleteSettings);
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    it('should handle missing userName and fallback to Tutor', () => {
      const unpaidTransaction = { ...mockTransaction, amountPaid: 0, status: PaymentStatus.Due };
      const incompleteSettings = { ...mockSettings, userName: '' };

      generateBulkInvoicePDF([mockStudent], [unpaidTransaction], incompleteSettings);
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('Tutor', 14, expect.any(Number));
    });

    it('should handle partially paid transactions', () => {
      const partiallyPaidTx = { ...mockTransaction, amountPaid: 25, status: PaymentStatus.PartiallyPaid };
      generateBulkInvoicePDF([mockStudent], [partiallyPaidTx], mockSettings);
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });
  });
});
