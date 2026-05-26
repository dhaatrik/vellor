import { Student } from '../types';

export interface ImportMapping {
    firstName: string;
    lastName?: string;
    email?: string;
    studentPhone?: string;
    guardianName?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    notes?: string;
    defaultRate?: string;
    subjects?: string;
    paymentAmount?: string;
    paymentDate?: string;
    lessonDate?: string;
    lessonDuration?: string;
}

interface ImportedEntities {
    student: Partial<Student>;
    payment?: {
        amount: number;
        date: string;
    };
    lesson?: {
        date: string;
        duration: number;
    };
}

/**
 * Safely parses a CSV line, handling quoted values that contain commas.
 */
export const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(cur.trim().replace(/^"|"$/g, ''));
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur.trim().replace(/^"|"$/g, ''));
    return result;
};

/**
 * Parses a CSV string into an array of objects.
 */
export const parseCSV = (csv: string): Record<string, string>[] => {
    // ⚡ Bolt Performance: Replace .split().map().filter() with manual iteration using indexOf and slice
    // to eliminate intermediate array allocations and reduce garbage collection overhead on large CSVs.
    const lines: string[] = [];
    let start = 0;
    let end = csv.indexOf('\n');
    while (end !== -1) {
        const line = csv.slice(start, end).trim();
        if (line.length > 0) lines.push(line);
        start = end + 1;
        end = csv.indexOf('\n', start);
    }
    const lastLine = csv.slice(start).trim();
    if (lastLine.length > 0) lines.push(lastLine);

    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const data: Record<string, string>[] = [];

    for (let i = 1, len = lines.length; i < len; i++) {
        const row = parseCSVLine(lines[i]);
        const obj: Record<string, string> = {};
        for (let j = 0, hLen = headers.length; j < hLen; j++) {
            const h = headers[j];
            if (h) obj[h] = row[j] || '';
        }
        data.push(obj);
    }

    return data;
};

/**
 * Safely parses a numeric string, removing currency symbols and commas.
 */
const parseNumeric = (val: string): number => {
    if (!val) return 0;
    // Remove everything except numbers, dots, and minus signs
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Maps a single CSV row to student and related entities based on provided mapping.
 */
export const mapCSVRowToEntities = (row: Record<string, string>, mapping: ImportMapping): ImportedEntities => {
    const firstName = row[mapping.firstName] || '';
    const lastName = mapping.lastName ? row[mapping.lastName] || '' : '';
    
    const entities: ImportedEntities = {
        student: {
            firstName,
            lastName,
            contact: {
                email: mapping.email ? row[mapping.email] || '' : '',
                studentPhone: { 
                    countryCode: '+1', 
                    number: mapping.studentPhone ? row[mapping.studentPhone] || '' : '' 
                },
                guardianName: mapping.guardianName ? row[mapping.guardianName] || '' : '',
                guardianEmail: mapping.guardianEmail ? row[mapping.guardianEmail] || '' : '',
                parentPhone1: {
                    countryCode: '+1',
                    number: mapping.guardianPhone ? row[mapping.guardianPhone] || '' : ''
                }
            },
            tuition: {
                defaultRate: mapping.defaultRate ? parseNumeric(row[mapping.defaultRate]) : 0,
                rateType: 'hourly',
                typicalLessonDuration: 60,
                subjects: mapping.subjects && row[mapping.subjects] ? [row[mapping.subjects]] : []
            },
            notes: mapping.notes ? row[mapping.notes] || '' : ''
        }
    };

    if (mapping.paymentAmount && row[mapping.paymentAmount]) {
        const amount = parseNumeric(row[mapping.paymentAmount]);
        if (amount !== 0) {
            entities.payment = {
                amount,
                date: mapping.paymentDate ? row[mapping.paymentDate] || new Date().toISOString() : new Date().toISOString()
            };
        }
    }

    if (mapping.lessonDate && row[mapping.lessonDate]) {
        entities.lesson = {
            date: row[mapping.lessonDate],
            duration: mapping.lessonDuration ? parseInt(row[mapping.lessonDuration], 10) || 60 : 60
        };
    }

    return entities;
};

export interface ImportResult {
    successCount: number;
    errorCount: number;
    errors: { row: number; error: string }[];
    entities: ImportedEntities[];
}

/**
 * Processes multiple CSV rows into entities using a lenient strategy.
 */
export const bulkMapCSVRows = (rows: Record<string, string>[], mapping: ImportMapping): ImportResult => {
    const result: ImportResult = {
        successCount: 0,
        errorCount: 0,
        errors: [],
        entities: []
    };

    for (let index = 0, len = rows.length; index < len; index++) {
        const row = rows[index];
        try {
            if (!row[mapping.firstName]) {
                throw new Error('Missing first name');
            }
            const entities = mapCSVRowToEntities(row, mapping);
            result.entities.push(entities);
            result.successCount++;
        } catch (err) {
            result.errorCount++;
            result.errors.push({ 
                row: index + 2, // +1 for header, +1 for 1-based indexing
                error: err instanceof Error ? err.message : String(err) 
            });
        }
    }

    return result;
};
