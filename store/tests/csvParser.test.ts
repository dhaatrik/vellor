import { describe, it, expect } from 'vitest';
import { parseCSV, mapCSVRowToEntities, bulkMapCSVRows } from '../../helpers/csvParser';

describe('csvParser', () => {
    describe('parseCSV', () => {
        it('should parse a simple CSV string', () => {
            const csv = 'Name,Email\nJohn Doe,john@example.com\nJane Smith,jane@example.com';
            const result = parseCSV(csv);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ Name: 'John Doe', Email: 'john@example.com' });
            expect(result[1]).toEqual({ Name: 'Jane Smith', Email: 'jane@example.com' });
        });

        it('should handle quoted values with commas', () => {
            const csv = 'Name,Notes\n"Doe, John","Likes math, science"';
            const result = parseCSV(csv);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({ Name: 'Doe, John', Notes: 'Likes math, science' });
        });

        it('should handle empty values', () => {
            const csv = 'Name,Email,Phone\nJohn,,123456';
            const result = parseCSV(csv);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({ Name: 'John', Email: '', Phone: '123456' });
        });
    });

    describe('mapCSVRowToEntities', () => {
        const mapping = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            studentPhone: 'Phone',
            guardianName: 'Parent',
            notes: 'Bio',
            defaultRate: 'Rate',
            subjects: 'Subject',
            paymentAmount: 'Paid Amount',
            paymentDate: 'Paid Date',
            lessonDate: 'Lesson Date',
            lessonDuration: 'Duration'
        };

        it('should map a row to student details', () => {
            const row = {
                'First Name': 'John',
                'Last Name': 'Doe',
                'Email': 'john@example.com',
                'Phone': '1234567890',
                'Bio': 'Nice kid'
            };
            const entities = mapCSVRowToEntities(row, mapping);
            expect(entities.student).toMatchObject({
                firstName: 'John',
                lastName: 'Doe',
                contact: {
                    email: 'john@example.com',
                    studentPhone: { number: '1234567890' }
                },
                notes: 'Nice kid'
            });
        });

        it('should map student details including default rate with currency symbols', () => {
            const row = {
                'First Name': 'John',
                'Rate': '$50.00'
            };
            const entities = mapCSVRowToEntities(row, mapping);
            expect(entities.student.tuition?.defaultRate).toBe(50);
        });

        it('should map guardian details', () => {
            const row = {
                'First Name': 'John',
                'Parent': 'Jane Doe'
            };
            const entities = mapCSVRowToEntities(row, mapping);
            expect(entities.student.contact!.guardianName).toBe('Jane Doe');
        });

        it('should map payment details if present', () => {
            const row = {
                'First Name': 'John',
                'Paid Amount': '50',
                'Paid Date': '2023-01-01'
            };
            const entities = mapCSVRowToEntities(row, mapping);
            expect(entities.payment).toEqual({
                amount: 50,
                date: '2023-01-01'
            });
        });

        it('should map lesson history if present', () => {
            const row = {
                'First Name': 'John',
                'Lesson Date': '2023-01-01',
                'Duration': '60'
            };
            const entities = mapCSVRowToEntities(row, mapping);
            expect(entities.lesson).toEqual({
                date: '2023-01-01',
                duration: 60
            });
        });
    });

    describe('bulkMapCSVRows', () => {
        const mapping = {
            firstName: 'First Name',
            email: 'Email'
        };

        it('should process multiple rows and collect results', () => {
            const rows = [
                { 'First Name': 'John', 'Email': 'john@example.com' },
                { 'First Name': 'Jane', 'Email': 'jane@example.com' }
            ];
            const result = bulkMapCSVRows(rows, mapping);
            expect(result.successCount).toBe(2);
            expect(result.entities).toHaveLength(2);
            expect(result.errorCount).toBe(0);
        });

        it('should handle rows with errors leniently', () => {
            const rows: Record<string, string>[] = [
                { 'First Name': 'John', 'Email': 'john@example.com' },
                { 'Email': 'jane@example.com' }, // Missing first name
                { 'First Name': 'Bob', 'Email': 'bob@example.com' }
            ];
            const result = bulkMapCSVRows(rows, mapping);
            expect(result.successCount).toBe(2);
            expect(result.errorCount).toBe(1);
            expect(result.errors[0]).toEqual({ row: 3, error: 'Missing first name' });
            expect(result.entities).toHaveLength(2);
        });

        it('should catch unexpected errors without crashing', () => {
            const rows = [
                { 'First Name': 'John', 'Email': 'john@example.com' },
                null as unknown as Record<string, string>, // This will cause a TypeError
                { 'First Name': 'Bob', 'Email': 'bob@example.com' }
            ];
            const result = bulkMapCSVRows(rows, mapping);
            expect(result.successCount).toBe(2);
            expect(result.errorCount).toBe(1);
            expect(result.errors[0].row).toBe(3);
            expect(result.errors[0].error).toMatch(/Cannot read properties of null|null has no properties|Cannot read property/);
            expect(result.entities).toHaveLength(2);
        });
    });
});
