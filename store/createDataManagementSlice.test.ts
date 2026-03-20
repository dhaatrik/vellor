import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { create } from 'zustand';
import { createDataManagementSlice } from './createDataManagementSlice';
import { AppState } from './types';

// Mock confetti to prevent errors in Node environment
vi.mock('canvas-confetti', () => {
    return { default: vi.fn() };
});

describe('createDataManagementSlice - importData', () => {
    let mockAddToast: ReturnType<typeof vi.fn>;
    let useTestStore: any;
    let mockFileReader: any;
    let originalLocationReload: any;

    beforeEach(() => {
        vi.useFakeTimers();
        mockAddToast = vi.fn();

        // Setup local store with mocked get and set
        useTestStore = create<AppState>()((set, get, api) => ({
            ...createDataManagementSlice(set, get, api),
            addToast: mockAddToast,
            // Provide minimal mocked dependencies for other state pieces if needed
            students: [],
            transactions: [],
            gamification: { points: 0, level: 1, levelName: 'Novice', streak: 0, lastActiveDate: null },
            achievements: [],
            settings: { theme: 'dark', currencySymbol: '$', userName: 'User', country: 'United States', phone: { countryCode: '+1', number: '' }, email: '', monthlyGoal: 500 },
            activityLog: []
        } as unknown as AppState));

        // Mock FileReader
        mockFileReader = {
            readAsText: vi.fn(),
            onload: null as any,
            onerror: null as any,
        };
        vi.stubGlobal('FileReader', class {
            readAsText = mockFileReader.readAsText;
            set onload(fn: any) { mockFileReader.onload = fn; }
            set onerror(fn: any) { mockFileReader.onerror = fn; }
            get onload() { return mockFileReader.onload; }
            get onerror() { return mockFileReader.onerror; }
        });

        // Mock window.location.reload
        originalLocationReload = window.location.reload;
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: vi.fn() }
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: originalLocationReload }
        });
    });

    it('should show error toast if no file is provided', async () => {
        const { importData } = useTestStore.getState();
        await importData(null as any);
        expect(mockAddToast).toHaveBeenCalledWith('No file selected for import.', 'error');
    });

    it('should handle FileReader error', async () => {
        const { importData } = useTestStore.getState();
        const file = new File([''], 'test.json', { type: 'application/json' });

        await importData(file);

        // Trigger onerror
        expect(mockFileReader.readAsText).toHaveBeenCalledWith(file);
        mockFileReader.onerror();

        expect(mockAddToast).toHaveBeenCalledWith('Error reading file.', 'error');
    });

    it('should handle invalid JSON structure', async () => {
        const { importData } = useTestStore.getState();
        const file = new File([''], 'test.json', { type: 'application/json' });

        await importData(file);

        // Trigger onload with invalid JSON
        mockFileReader.onload({ target: { result: 'invalid json' } });

        expect(mockAddToast).toHaveBeenCalledWith(expect.stringContaining('Import failed:'), 'error');
    });

    it('should handle valid JSON but missing required properties', async () => {
        const { importData } = useTestStore.getState();
        const file = new File([''], 'test.json', { type: 'application/json' });

        await importData(file);

        // Trigger onload with missing 'students' array
        mockFileReader.onload({ target: { result: JSON.stringify({ transactions: [], settings: {} }) } });

        expect(mockAddToast).toHaveBeenCalledWith('Import failed: Invalid data structure in JSON file.', 'error');
    });

    it('should handle successful import and set state', async () => {
        const { importData } = useTestStore.getState();
        const file = new File([''], 'test.json', { type: 'application/json' });

        const validData = {
            students: [{ id: '1', firstName: 'John' }],
            transactions: [{ id: 't1', amount: 50 }],
            settings: { theme: 'light' },
            gamification: { points: 100 },
            achievements: [{ id: 'a1' }],
            activityLog: [{ id: 'act1' }]
        };

        await importData(file);
        mockFileReader.onload({ target: { result: JSON.stringify(validData) } });

        expect(mockAddToast).toHaveBeenCalledWith('Data imported successfully! The app will reload.', 'success');

        // Verify state is updated
        const state = useTestStore.getState();
        expect(state.students).toEqual(validData.students);
        expect(state.transactions).toEqual(validData.transactions);
        expect(state.settings).toEqual(validData.settings);
        expect(state.gamification).toEqual(validData.gamification);
        expect(state.achievements).toEqual(validData.achievements);
        expect(state.activityLog).toEqual(validData.activityLog);

        // Verify reload timeout
        expect(window.location.reload).not.toHaveBeenCalled();
        vi.advanceTimersByTime(2000);
        expect(window.location.reload).toHaveBeenCalled();
    });

    it('should prevent prototype pollution', async () => {
        const { importData } = useTestStore.getState();
        const file = new File([''], 'test.json', { type: 'application/json' });

        const maliciousData = `{
            "students": [],
            "transactions": [],
            "settings": {},
            "__proto__": { "polluted": true },
            "constructor": { "polluted": true },
            "prototype": { "polluted": true }
        }`;

        await importData(file);
        mockFileReader.onload({ target: { result: maliciousData } });

        expect(mockAddToast).toHaveBeenCalledWith('Data imported successfully! The app will reload.', 'success');

        const state = useTestStore.getState();
        // Since the reviver strips these keys, they shouldn't exist in the parsed object or pollute the state
        expect((state as any).__proto__.polluted).toBeUndefined();
        expect((state as any).constructor.polluted).toBeUndefined();
        expect((state as any).prototype).toBeUndefined();
    });
});
