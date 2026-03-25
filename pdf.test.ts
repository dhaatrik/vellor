import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateInvoicePDF, generateProgressReportPDF, generateBulkInvoicePDF } from './pdf';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentStatus, Student, Transaction, AppSettings } from './types';
import { DEFAULT_VELLOR_LOGO_BASE64 } from './src/defaultLogo';

vi.mock('jspdf', () => {
    const jsPDFMock = vi.fn(function() {
        return {
            addImage: vi.fn(),
            setFontSize: vi.fn(),
            setFont: vi.fn(),
            setTextColor: vi.fn(),
            text: vi.fn(),
            splitTextToSize: vi.fn().mockReturnValue(['notes1', 'notes2']),
            output: vi.fn().mockReturnValue(new Blob()),
            save: vi.fn(),
            addPage: vi.fn(),
            lastAutoTable: { finalY: 100 }
        };
    });
    return { default: jsPDFMock };
});

vi.mock('jspdf-autotable', () => {
    return { default: vi.fn() };
});

describe('PDF Generation', () => {
    const mockStudent: Student = {
        id: 'student-1',
        firstName: 'John',
        lastName: 'Doe',
        contact: { email: 'john@example.com' },
        tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
        createdAt: new Date().toISOString()
    };

    const mockTransaction: Transaction = {
        id: 'tx-1',
        studentId: 'student-1',
        date: new Date().toISOString(),
        lessonDuration: 60,
        lessonFee: 50,
        amountPaid: 50,
        status: PaymentStatus.Paid,
        createdAt: new Date().toISOString()
    };

    const mockSettings: AppSettings = {
        theme: 'light' as any,
        currencySymbol: '$',
        userName: 'Tutor Test',
        brandColor: '#123456'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateInvoicePDF', () => {
        it('should create and save a PDF with default template', () => {
            generateInvoicePDF(mockTransaction, mockStudent, mockSettings, false);
            expect(jsPDF).toHaveBeenCalled();
            expect(autoTable).toHaveBeenCalled();

            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.save).toHaveBeenCalled();
            expect(mockDoc.addImage).toHaveBeenCalledWith(DEFAULT_VELLOR_LOGO_BASE64, 'JPEG', 14, 10, 30, 30, undefined, 'FAST');
            expect(mockDoc.text).toHaveBeenCalledWith('INVOICE', 14, 45); // Due to logo presence
            expect(mockDoc.text).toHaveBeenCalledWith('From:', 14, 73); // Testing some positioning Y=45+8+5+15
        });

        it('should return blob when returnBlob is true', () => {
            const result = generateInvoicePDF(mockTransaction, mockStudent, mockSettings, true);
            expect(result).toBeInstanceOf(Blob);

            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.output).toHaveBeenCalledWith('blob');
            expect(mockDoc.save).not.toHaveBeenCalled();
        });

        it('should use custom logo when provided', () => {
            const settingsWithLogo = { ...mockSettings, invoiceLogoBase64: 'custom-logo' };
            generateInvoicePDF(mockTransaction, mockStudent, settingsWithLogo, false);

            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.addImage).toHaveBeenCalledWith('custom-logo', 'JPEG', 14, 10, 30, 30, undefined, 'FAST');
        });

        it('should apply minimal template correctly', () => {
            const minimalSettings: AppSettings = { ...mockSettings, invoiceTemplate: 'minimal' };
            generateInvoicePDF(mockTransaction, mockStudent, minimalSettings, false);

            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.setFontSize).toHaveBeenCalledWith(16);
        });

        it('should apply classic template correctly', () => {
            const classicSettings: AppSettings = { ...mockSettings, invoiceTemplate: 'classic' };
            generateInvoicePDF(mockTransaction, mockStudent, classicSettings, false);

            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.setFontSize).toHaveBeenCalledWith(22);
            expect(mockDoc.setFont).toHaveBeenCalledWith('times', 'bold');
        });

        it('should include transaction notes if present', () => {
            const txWithNotes = { ...mockTransaction, notes: 'Test notes for invoice' };
            generateInvoicePDF(txWithNotes, mockStudent, mockSettings, false);

            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.splitTextToSize).toHaveBeenCalledWith('Test notes for invoice', 180);
            expect(mockDoc.text).toHaveBeenCalledWith('Notes:', 14, 145); // 100 (finalY) + 15 + 30
        });

        it('should color the balance red when due, black when 0', () => {
            const unpaidTx = { ...mockTransaction, status: PaymentStatus.Due, amountPaid: 0, lessonFee: 50 };
            generateInvoicePDF(unpaidTx, mockStudent, mockSettings, false);

            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.setTextColor).toHaveBeenCalledWith(220, 38, 38); // Balance > 0

            vi.clearAllMocks();
            generateInvoicePDF(mockTransaction, mockStudent, mockSettings, false); // Balance 0
            const mockDoc2 = (jsPDF as any).mock.results[0].value;
            expect(mockDoc2.setTextColor).toHaveBeenCalledWith(0, 150, 0); // Balance == 0
        });

        it('should handle missing logo gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            // Override the global mock just for this test
            const originalJsPDF = (jsPDF as any).getMockImplementation();
            (jsPDF as any).mockImplementationOnce(function() {
                return {
                    addImage: vi.fn().mockImplementation(() => { throw new Error('Bad logo'); }),
                    setFontSize: vi.fn(),
                    setFont: vi.fn(),
                    setTextColor: vi.fn(),
                    text: vi.fn(),
                    splitTextToSize: vi.fn(),
                    output: vi.fn(),
                    save: vi.fn(),
                    lastAutoTable: { finalY: 100 }
                };
            });

            generateInvoicePDF(mockTransaction, mockStudent, mockSettings, false);
            expect(consoleSpy).toHaveBeenCalledWith("Logo injection failed", expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('generateProgressReportPDF', () => {
        it('should create and save a PDF with correct elements', () => {
            const txWithGrade = { ...mockTransaction, grade: 'A', progressRemark: 'Excellent' };
            generateProgressReportPDF(mockStudent, [txWithGrade], mockSettings, 'Great job');

            expect(jsPDF).toHaveBeenCalled();
            expect(autoTable).toHaveBeenCalled();

            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.text).toHaveBeenCalledWith('PROGRESS REPORT', 14, 45);
            expect(mockDoc.text).toHaveBeenCalledWith('Teacher Note:', 14, 88); // Adjusted to 88
            expect(mockDoc.save).toHaveBeenCalled();
        });

        it('should display no records message when no relevant transactions found', () => {
            generateProgressReportPDF(mockStudent, [mockTransaction], mockSettings, '');

            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.text).toHaveBeenCalledWith('No progress records found.', 14, 98); // Adjusted to 98
            expect(autoTable).not.toHaveBeenCalled();
        });
    });

    describe('generateBulkInvoicePDF', () => {
        it('should return false if no unpaid transactions exist', () => {
            const result = generateBulkInvoicePDF([mockStudent], [mockTransaction], mockSettings);
            expect(result).toBe(false);

            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.save).not.toHaveBeenCalled();
        });

        it('should generate a PDF with unpaid transactions for multiple students', () => {
            const unpaidTx1 = { ...mockTransaction, id: 'tx-2', status: PaymentStatus.Due, amountPaid: 0 };

            const student2: Student = { ...mockStudent, id: 'student-2' };
            const unpaidTx2 = { ...mockTransaction, id: 'tx-3', studentId: 'student-2', status: PaymentStatus.PartiallyPaid, amountPaid: 20 };

            const result = generateBulkInvoicePDF([mockStudent, student2], [unpaidTx1, unpaidTx2], mockSettings);

            expect(result).toBe(true);
            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.addPage).toHaveBeenCalledTimes(1); // One extra page for the second student
            expect(mockDoc.save).toHaveBeenCalled();
        });

        it('should group transactions for the same student', () => {
            const unpaidTx1 = { ...mockTransaction, id: 'tx-2', status: PaymentStatus.Due, amountPaid: 0 };
            const unpaidTx2 = { ...mockTransaction, id: 'tx-3', status: PaymentStatus.Due, amountPaid: 0 };

            const result = generateBulkInvoicePDF([mockStudent], [unpaidTx1, unpaidTx2], mockSettings);

            expect(result).toBe(true);
            const mockDoc = (jsPDF as any).mock.results[0].value;
            expect(mockDoc.addPage).not.toHaveBeenCalled(); // Same student, so no extra page
            expect(autoTable).toHaveBeenCalledTimes(1); // One table generated
        });
    });
});
