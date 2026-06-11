import { Student } from '../types';

export enum ConflictStrategy {
    Skip = 'skip',
    Overwrite = 'overwrite',
    Prompt = 'prompt'
}

export interface Conflict {
    imported: Partial<Student>;
    existing: Student;
}

/**
 * Identifies potential conflicts between an imported student and existing records.
 * Currently uses email matching as the primary conflict detection strategy.
 */
export const findConflicts = (imported: Partial<Student>, existingStudents: Student[]): Conflict[] => {
    const conflicts: Conflict[] = [];
    const importedEmail = imported.contact?.email?.toLowerCase().trim();

    if (!importedEmail) return [];

    existingStudents.forEach(existing => {
        const existingEmail = existing.contact?.email?.toLowerCase().trim();
        if (existingEmail && existingEmail === importedEmail) {
            conflicts.push({ imported, existing });
        }
    });

    return conflicts;
};

/**
 * Resolves a conflict based on the selected strategy.
 * Returns the resolved student object or null if the record should be skipped.
 */
export const resolveConflict = (
    imported: Partial<Student>,
    existing: Student,
    strategy: ConflictStrategy
): Student | null => {
    if (strategy === ConflictStrategy.Skip) {
        return null;
    }

    if (strategy === ConflictStrategy.Overwrite) {
        // Deep merge logic (simplified for our nested structure)
        return {
            ...existing,
            ...imported,
            contact: {
                ...existing.contact,
                ...(imported.contact || {}),
                studentPhone: {
                    countryCode: imported.contact?.studentPhone?.countryCode ?? existing.contact.studentPhone?.countryCode ?? '',
                    number: imported.contact?.studentPhone?.number ?? existing.contact.studentPhone?.number ?? ''
                },
                parentPhone1: {
                    countryCode: imported.contact?.parentPhone1?.countryCode ?? existing.contact.parentPhone1?.countryCode ?? '',
                    number: imported.contact?.parentPhone1?.number ?? existing.contact.parentPhone1?.number ?? ''
                }
            },
            tuition: {
                ...existing.tuition,
                ...(imported.tuition || {})
            }
        };
    }

    return existing; // Default fallback
};
