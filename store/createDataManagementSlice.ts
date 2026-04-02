import { StateCreator } from 'zustand';
import { AppState, DataManagementSlice } from './types';
import { Theme } from '../types';
import { DEFAULT_CURRENCY_SYMBOL, DEFAULT_USER_NAME, INITIAL_GAMIFICATION_STATS, ACHIEVEMENTS_DEFINITIONS } from '../constants';
import { backupSchema } from './validation';
import { jsonReviver } from '../src/crypto';

export const createDataManagementSlice: StateCreator<AppState, [], [], DataManagementSlice> = (set, get) => ({
  exportData: () => {
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
        const jsonString = JSON.stringify(dataToExport, null, 2);
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
        console.error("Failed to export data:", error);
        get().addToast('Failed to export data.', 'error');
    }
  },

  importData: async (file: File) => {
    if (!file) { get().addToast('No file selected for import.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const result = event.target?.result;
            if (typeof result !== 'string') { throw new Error('File could not be read.'); }
            const rawData = JSON.parse(result, jsonReviver);

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
        activityLog: []
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
        }
    }));
    get().addToast('Logged out successfully.', 'info');
  }
});
