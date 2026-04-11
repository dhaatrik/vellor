import { StateCreator } from 'zustand';
import { AppState, DataManagementSlice } from './types';
import { Theme } from '../types';
import { DEFAULT_CURRENCY_SYMBOL, DEFAULT_USER_NAME, INITIAL_GAMIFICATION_STATS, ACHIEVEMENTS_DEFINITIONS } from '../constants';
import { backupSchema } from './validation';
import { jsonReviver } from '../src/crypto';

export const createDataManagementSlice: StateCreator<AppState, [], [], DataManagementSlice> = (set, get) => ({
  masterKey: null,
  setMasterKey: (key) => set({ masterKey: key }),

  exportData: async () => {
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

        const password = window.prompt("Enter a password to encrypt your backup (leave blank to export unencrypted):");
        if (password === null) return; // User cancelled

        let exportPayload: any = dataToExport;

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
        a.download = `vellor_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        localStorage.setItem('lastBackupDate', new Date().toISOString());
        
        get().addToast('Data exported successfully!', 'success');
    } catch (error) {
        get().addToast('Failed to export data.', 'error');
    }
  },

  importData: async (file: File) => {
    if (!file) { get().addToast('No file selected for import.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const result = event.target?.result;
            if (typeof result !== 'string') { throw new Error('File could not be read.'); }
            let rawData = JSON.parse(result, jsonReviver);

            if (rawData.__vellor_encrypted) {
                const password = window.prompt("This backup is encrypted. Please enter the password:");
                if (password === null) return; // User cancelled

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
            get().addToast(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
    };
    reader.onerror = () => { get().addToast('Error reading file.', 'error'); };
    reader.readAsText(file);
  },

  resetData: () => {
    set({
        students: [],
        transactions: [],
        gamification: INITIAL_GAMIFICATION_STATS,
        achievements: ACHIEVEMENTS_DEFINITIONS.map(a => ({...a, achieved: false })),
        settings: {
            theme: Theme.Dark, currencySymbol: DEFAULT_CURRENCY_SYMBOL, userName: DEFAULT_USER_NAME,
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
            userName: DEFAULT_USER_NAME,
            email: '',
        },
        masterKey: null
    }));
    get().addToast('Logged out successfully.', 'info');
  }
});
