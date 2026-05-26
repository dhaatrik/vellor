import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { AppSettings } from '../types';
import { Button, Input, Card, Icon, Select, ConfirmationModal, Modal } from '../components/ui';
import { TUTOR_RANK_LEVELS } from '../constants';
import { motion } from 'framer-motion';

const CustomAchievementSettings: React.FC<{
  formData: AppSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<AppSettings>>;
}> = ({ formData, handleChange, setFormData }) => (
  <div className="mt-6">
    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Custom Personal Achievement</h4>
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <Input
          label="My Custom Achievement"
          name="customAchievement"
          placeholder="e.g. Save $5,000 for a new laptop"
          value={formData.customAchievement || ''}
          onChange={handleChange}
        />
      </div>
      <label className="flex items-center gap-2 mb-2 cursor-pointer">
        <input
          type="checkbox"
          name="customAchievementEarned"
          checked={formData.customAchievementEarned || false}
          onChange={(e) => setFormData(prev => ({...prev, customAchievementEarned: e.target.checked}))}
          className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent bg-transparent"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 border py-2 px-3 rounded-xl hover:bg-gray-50 dark:border-white/10 dark:hover:bg-primary-light transition-colors">
          Mark as Earned
        </span>
      </label>
    </div>
  </div>
);

export const SettingsPage: React.FC = () => {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const exportData = useStore(s => s.exportData);
  const importData = useStore(s => s.importData);
  const resetData = useStore(s => s.resetData);
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPassword, setImportPassword] = useState('');
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value 
    }));
  };

  const handleSaveBranding = () => {
    updateSettings({ brandColor: formData.brandColor, brandLogoBase64: formData.brandLogoBase64 });
  };

  const handleSaveInvoice = () => {
    updateSettings({ invoiceLogoBase64: formData.invoiceLogoBase64, invoiceTemplate: formData.invoiceTemplate });
  };

  const handleSaveGamification = () => {
    updateSettings({
      gamificationEnabled: formData.gamificationEnabled,
      customRankTitles: formData.customRankTitles,
      customAchievement: formData.customAchievement,
      customAchievementEarned: formData.customAchievementEarned
    });
  };

  const handleExport = async () => {
    await exportData(exportPassword || undefined);
    setIsExportModalOpen(false);
    setExportPassword('');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importData(file);
      } catch (error) {
        if (error instanceof Error && error.message === "PASSWORD_REQUIRED") {
            setPendingImportFile(file);
            setIsImportModalOpen(true);
        }
      }
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleEncryptedImport = async () => {
    if (pendingImportFile && importPassword) {
      await importData(pendingImportFile, importPassword);
      setIsImportModalOpen(false);
      setImportPassword('');
      setPendingImportFile(null);
    }
  };

  const handleConfirmReset = () => {
    resetData();
    setIsConfirmingReset(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, invoiceLogoBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleBrandLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, brandLogoBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBrandLogo = () => setFormData(prev => ({ ...prev, brandLogoBase64: undefined }));

  const handleRemoveLogo = () => setFormData(prev => ({ ...prev, invoiceLogoBase64: undefined }));

  return (
    <motion.div 
      className="space-y-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure application preferences, invoices, and data.</p>
      </div>

      <Card title="Custom Branding" titleIcon="brush">
        <div className="space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="brandColorInput" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Brand Accent Color</label>
                <div className="flex items-center gap-4">
                  <input 
                    id="brandColorInput"
                    type="color" 
                    name="brandColor"
                    value={formData.brandColor || '#8b5cf6'}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer overflow-hidden p-0 bg-transparent"
                  />
                  <div className="text-sm text-gray-500 font-mono">{formData.brandColor || '#8b5cf6'}</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Personalize the application's primary color.</p>
              </div>

              <div>
                 <span id="appLogoLabel" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">App Logo (Square)</span>
                 <div className="flex items-center gap-4">
                   {formData.brandLogoBase64 ? (
                     <div className="relative w-16 h-16 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white shadow-sm">
                       <img src={formData.brandLogoBase64} alt="App Logo" className="w-full h-full object-cover" />
                       <button onClick={handleRemoveBrandLogo} className="absolute top-0 right-0 bg-danger text-white rounded-bl-xl p-1 hover:bg-danger/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary" aria-label="Remove app logo" title="Remove app logo">
                         <Icon iconName="x-mark" className="w-3 h-3" />
                       </button>
                     </div>
                   ) : (
                     <label htmlFor="appLogoInput" className="cursor-pointer px-4 py-2 border border-dashed border-gray-300 dark:border-white/20 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                        Upload Logo
                        <input id="appLogoInput" type="file" accept="image/*" aria-labelledby="appLogoLabel" className="hidden" onChange={handleBrandLogoUpload} />
                     </label>
                   )}
                 </div>
                 <p className="text-xs text-gray-500 mt-2">Replaces the default graduation cap icon.</p>
              </div>
           </div>
           <div className="pt-4 flex justify-end">
              <Button onClick={handleSaveBranding} variant="primary" leftIcon="check-circle" className="rounded-full shadow-md shadow-accent/10">Save Branding</Button>
           </div>
        </div>
      </Card>

      <Card title="Invoice Settings" titleIcon="document-text">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
               <span id="invoiceLogoLabel" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Invoice Logo</span>
               <div className="flex items-center gap-4">
                 {formData.invoiceLogoBase64 ? (
                   <div className="relative w-16 h-16 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white">
                     <img src={formData.invoiceLogoBase64} alt="Invoice Logo" className="w-full h-full object-contain" />
                       <button onClick={handleRemoveLogo} className="absolute top-0 right-0 bg-danger text-white rounded-bl-xl p-1 hover:bg-danger/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary" aria-label="Remove invoice logo" title="Remove invoice logo">
                       <Icon iconName="x-mark" className="w-3 h-3" />
                     </button>
                   </div>
                 ) : (
                   <label htmlFor="invoiceLogoInput" className="cursor-pointer px-4 py-2 border border-dashed border-gray-300 dark:border-white/20 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                      Upload Logo
                      <input id="invoiceLogoInput" type="file" accept="image/*" aria-labelledby="invoiceLogoLabel" className="hidden" onChange={handleLogoUpload} />
                   </label>
                 )}
               </div>
            </div>
            <Select 
               label="Invoice Template"
               name="invoiceTemplate"
               value={formData.invoiceTemplate || 'modern'}
               onChange={handleChange}
               options={[
                  { label: 'Modern (Colorful + Clean)', value: 'modern' },
                  { label: 'Classic (Traditional)', value: 'classic' },
                  { label: 'Minimal (Ink Saver)', value: 'minimal' },
               ]}
            />
          </div>
          <div className="pt-4 flex justify-end">
             <Button onClick={handleSaveInvoice} variant="primary" leftIcon="check-circle" className="rounded-full shadow-md shadow-accent/10">Save Invoice Setup</Button>
          </div>
        </div>
      </Card>

      <Card title="Gamification Settings" titleIcon="star">
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div>
                 <h4 id="gamificationHeading" className="font-semibold text-gray-900 dark:text-white">Enable Gamification</h4>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Show points, streaks, and ranks on your dashboard.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" aria-labelledby="gamificationHeading" name="gamificationEnabled" checked={formData.gamificationEnabled ?? true} onChange={(e) => setFormData(prev => ({...prev, gamificationEnabled: e.target.checked}))} className="sr-only peer" />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
              </label>
           </div>
           
           {formData.gamificationEnabled !== false && (
             <>
               <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Custom Rank Titles</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Rename the default tutor ranks to whatever you like.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[0,1,2,3,4,5].map(idx => (
                        <Input 
                           key={idx} 
                           label={`Level ${idx+1} Title`} 
                           value={formData.customRankTitles?.[idx] || TUTOR_RANK_LEVELS[idx].name} 
                           onChange={(e) => {
                              const newArr = [...(formData.customRankTitles || TUTOR_RANK_LEVELS.map(r => r.name))];
                              newArr[idx] = e.target.value;
                              setFormData(prev => ({...prev, customRankTitles: newArr}));
                           }} 
                        />
                     ))}
                  </div>
               </div>
               <CustomAchievementSettings
                 formData={formData}
                 handleChange={handleChange}
                 setFormData={setFormData}
               />
             </>
           )}
           <div className="pt-4 flex justify-end">
               <Button onClick={handleSaveGamification} variant="primary" leftIcon="check-circle" className="rounded-full shadow-md shadow-accent/10">Save Gamification</Button>
           </div>
        </div>
      </Card>

      <Card title="Data Management" titleIcon="document-text">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Export your data for backup, or import a previous backup. Resetting will permanently delete all data.
        </p>
        <div className="flex flex-wrap gap-3">
            <Button onClick={useStore(s => s.exportTransactionsCSV)} variant="outline" leftIcon="document-text" className="rounded-full border-accent text-accent hover:bg-accent/10">Export CSV (Taxes)</Button>
            <Button onClick={() => setIsExportModalOpen(true)} variant="outline" leftIcon="share" className="rounded-full">Export Data</Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" leftIcon="arrow-right" className="rounded-full">Import Data</Button>
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportFile} className="hidden" aria-label="Import data file" />
            <Button onClick={() => setIsConfirmingReset(true)} variant="danger" leftIcon="warning" className="rounded-full ml-auto">Reset All Data</Button>
        </div>
      </Card>

      <ConfirmationModal
        isOpen={isConfirmingReset}
        onClose={() => setIsConfirmingReset(false)}
        onConfirm={handleConfirmReset}
        title="Confirm Data Reset"
        message={<span className="text-danger">Are you sure you want to reset all application data? This action is permanent and cannot be undone.</span>}
        confirmButtonText="Yes, Reset Everything"
      />

      <Modal isOpen={isExportModalOpen} onClose={() => { setIsExportModalOpen(false); setExportPassword(''); }} title="Export Data">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You can optionally encrypt your backup file with a password. If you forget this password, the backup cannot be recovered.
          </p>
          <Input
            label="Encryption Password (Optional)"
            type="password"
            value={exportPassword}
            onChange={e => setExportPassword(e.target.value)}
            placeholder="Enter password or leave blank"
            className="w-full"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => { setIsExportModalOpen(false); setExportPassword(''); }}>Cancel</Button>
            <Button onClick={handleExport} variant="primary">Export Backup</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); setImportPassword(''); setPendingImportFile(null); }} title="Encrypted Backup">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This backup file is encrypted. Please enter the password to decrypt and import it.
          </p>
          <Input
            label="Encryption Password"
            type="password"
            value={importPassword}
            onChange={e => setImportPassword(e.target.value)}
            placeholder="Enter backup password"
            className="w-full"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => { setIsImportModalOpen(false); setImportPassword(''); setPendingImportFile(null); }}>Cancel</Button>
            <Button onClick={handleEncryptedImport} variant="primary" disabled={!importPassword}>Import Backup</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};