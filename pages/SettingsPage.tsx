import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { AppSettings } from '../types';
import { Button, Input, Card, Icon, Select, ConfirmationModal } from '../components/ui';
import { TUTOR_RANK_LEVELS } from '../constants';
import { motion } from 'framer-motion';

export const SettingsPage: React.FC = () => {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const exportData = useStore(s => s.exportData);
  const importData = useStore(s => s.importData);
  const resetData = useStore(s => s.resetData);
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
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

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Brand Accent Color</label>
                <div className="flex items-center gap-4">
                  <input 
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
                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">App Logo (Square)</label>
                 <div className="flex items-center gap-4">
                   {formData.brandLogoBase64 ? (
                     <div className="relative w-16 h-16 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white shadow-sm">
                       <img src={formData.brandLogoBase64} alt="App Logo" className="w-full h-full object-cover" />
                       <button onClick={() => setFormData(prev => ({ ...prev, brandLogoBase64: undefined }))} className="absolute top-0 right-0 bg-danger text-white rounded-bl-xl p-1 hover:bg-danger/80" aria-label="Remove app logo">
                         <Icon iconName="x-mark" className="w-3 h-3" />
                       </button>
                     </div>
                   ) : (
                     <label className="cursor-pointer px-4 py-2 border border-dashed border-gray-300 dark:border-white/20 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                        Upload Logo
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setFormData(prev => ({ ...prev, brandLogoBase64: reader.result as string }));
                            reader.readAsDataURL(file);
                          }
                        }} />
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
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Invoice Logo</label>
               <div className="flex items-center gap-4">
                 {formData.invoiceLogoBase64 ? (
                   <div className="relative w-16 h-16 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white">
                     <img src={formData.invoiceLogoBase64} alt="Invoice Logo" className="w-full h-full object-contain" />
                     <button onClick={handleRemoveLogo} className="absolute top-0 right-0 bg-danger text-white rounded-bl-xl p-1 hover:bg-danger/80" aria-label="Remove invoice logo">
                       <Icon iconName="x-mark" className="w-3 h-3" />
                     </button>
                   </div>
                 ) : (
                   <label className="cursor-pointer px-4 py-2 border border-dashed border-gray-300 dark:border-white/20 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                      Upload Logo
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
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
                 <h4 className="font-semibold text-gray-900 dark:text-white">Enable Gamification</h4>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Show points, streaks, and ranks on your dashboard.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" name="gamificationEnabled" checked={formData.gamificationEnabled ?? true} onChange={(e) => setFormData(prev => ({...prev, gamificationEnabled: e.target.checked}))} className="sr-only peer" />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
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
                        <input type="checkbox" name="customAchievementEarned" checked={formData.customAchievementEarned || false} onChange={(e) => setFormData(prev => ({...prev, customAchievementEarned: e.target.checked}))} className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent bg-transparent" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 border py-2 px-3 rounded-xl hover:bg-gray-50 dark:border-white/10 dark:hover:bg-primary-light transition-colors">Mark as Earned</span>
                     </label>
                  </div>
               </div>
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
            <Button onClick={exportData} variant="outline" leftIcon="share" className="rounded-full">Export Data</Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" leftIcon="arrow-right" className="rounded-full">Import Data</Button>
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportFile} className="hidden" />
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
    </motion.div>
  );
};