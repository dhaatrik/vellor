import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AppSettings } from '../types';
import { motion } from 'framer-motion';
import { InvoiceSettings } from './settings-sections/InvoiceSettings';
import { GamificationSettings } from './settings-sections/GamificationSettings';
import { DataManagementSettings } from './settings-sections/DataManagementSettings';

export const SettingsPage: React.FC = () => {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const exportData = useStore(s => s.exportData);
  const importData = useStore(s => s.importData);
  const resetData = useStore(s => s.resetData);
  const exportTransactionsCSV = useStore(s => s.exportTransactionsCSV);

  const [formData, setFormData] = useState<AppSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  return (
    <motion.div 
      className="space-y-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 29, mass: 1, restDelta: 0.001 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure application preferences, invoices, and data.</p>
      </div>

      <InvoiceSettings
        formData={formData}
        setFormData={setFormData}
        updateSettings={updateSettings}
      />

      <GamificationSettings
        formData={formData}
        setFormData={setFormData}
        updateSettings={updateSettings}
      />

      <DataManagementSettings
        exportTransactionsCSV={exportTransactionsCSV}
        exportData={exportData}
        importData={importData}
        resetData={resetData}
      />
    </motion.div>
  );
};
