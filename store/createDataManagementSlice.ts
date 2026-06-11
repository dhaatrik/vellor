import { StateCreator } from 'zustand';
import { AppState, DataManagementSlice } from './types';
import { Theme } from '../types';
import { DEFAULT_CURRENCY_SYMBOL, INITIAL_GAMIFICATION_STATS, ACHIEVEMENTS_DEFINITIONS } from '../constants';
import { backupSchema } from './validation';
import { jsonReviver } from '../src/crypto';
import { getLocalYYYYMMDD } from '../helpers';
import localforage from 'localforage';

export const createDataManagementSlice: StateCreator<AppState, [], [], DataManagementSlice> = (set, get) => ({
  masterKey: null,
  setMasterKey: (key) => set({ masterKey: key }),

  exportData: async (password?: string | null) => {
    try {
        const state = get();
        const dataToExport = { 
            students: state.students, 
            transactions: state.transactions, 
            gamification: state.gamification, 
            achievements: state.achievements, 
            settings: state.settings, 
            activityLog: state.activityLog 
        };

        if (password === null) return; // User cancelled

        let exportPayload: unknown = dataToExport;

        if (password) {
            const { generateSalt, deriveKey, encryptObject } = await import('../src/crypto');
            const salt = generateSalt();
            const key = await deriveKey(password, salt);
            const encryptedData = await encryptObject(dataToExport, key);

            exportPayload = {
                __vellor_encrypted: true,
                salt: Array.from(salt),
                data: encryptedData
            };
        }

        const jsonString = JSON.stringify(exportPayload, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vellor_backup_${getLocalYYYYMMDD()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        await localforage.setItem('lastBackupDate', new Date().toISOString());
        
        get().addToast('Data exported successfully!', 'success');
    } catch (error) {
        get().addToast('Failed to export data.', 'error');
    }
  },

  importData: async (file: File, password?: string | null) => {
    if (!file) { get().addToast('No file selected for import.', 'error'); return; }

    // Check if the user cancelled an explicit password prompt loop
    if (password === null) return;

    try {
        const result = await file.text();
        let rawData = JSON.parse(result, jsonReviver);

        if (rawData.__vellor_encrypted) {
            if (password === undefined) {
                // Signal to the caller that a password is required
                throw new Error("PASSWORD_REQUIRED");
            }

            const { deriveKey, decryptObject } = await import('../src/crypto');
            const salt = new Uint8Array(rawData.salt);
            const key = await deriveKey(password, salt);
            let decrypted;
            try {
                decrypted = await decryptObject(rawData.data, key);
            } catch {
                throw new Error("Incorrect password or corrupted encrypted data.");
            }

            if (!decrypted) throw new Error("Decryption failed");
            rawData = decrypted;
        }

        const parsedData = backupSchema.parse(rawData);

        set({
            students: parsedData.students,
            transactions: parsedData.transactions,
            settings: parsedData.settings,
            ...(parsedData.gamification && { gamification: parsedData.gamification }),
            ...(parsedData.achievements && { achievements: parsedData.achievements }),
            ...(parsedData.activityLog && { activityLog: parsedData.activityLog })
        });
        get().addToast('Data imported successfully! The app will reload.', 'success');
        setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
        if (error instanceof Error && error.message === "PASSWORD_REQUIRED") {
            throw error; // Re-throw to be caught by UI
        }
        get().addToast(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  },

  resetData: () => {
    set({
        students: [],
        transactions: [],
        gamification: INITIAL_GAMIFICATION_STATS,
        achievements: ACHIEVEMENTS_DEFINITIONS.map(a => ({...a, achieved: false })),
        settings: {
            theme: Theme.Dark, currencySymbol: DEFAULT_CURRENCY_SYMBOL, userName: '',
            country: 'United States',
            phone: { countryCode: '+1', number: '' }, email: '',
            monthlyGoal: 500,
        },
        activityLog: [],
        masterKey: null
    });
    get().addToast('All application data has been reset.', 'info');
    setTimeout(() => window.location.reload(), 1500);
  },

  logout: () => {
    set(state => ({
        settings: {
            ...state.settings,
            userName: '',
            email: '',
        },
        masterKey: null
    }));
    get().addToast('Logged out successfully.', 'info');
  }
});
