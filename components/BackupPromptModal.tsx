import React, { useEffect, useState } from 'react';
import { Modal, Button, Icon } from './ui';
import { useStore } from '../store';

const BACKUP_INTERVAL_DAYS = 14;

export const BackupPromptModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const exportData = useStore(s => s.exportData);
  const addToast = useStore(s => s.addToast);

  useEffect(() => {
    const checkBackupStatus = () => {
      const lastBackupDateStr = localStorage.getItem('lastBackupDate');
      const now = new Date();

      if (!lastBackupDateStr) {
        const students = useStore.getState().students;
        if (students.length > 0) {
            setIsOpen(true);
        }
        return;
      }

      const lastBackupDate = new Date(lastBackupDateStr);
      const diffTime = Math.abs(now.getTime() - lastBackupDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= BACKUP_INTERVAL_DAYS) {
        setIsOpen(true);
      }
    };

    // Delay the check slightly to not interrupt the initial render
    const timer = setTimeout(checkBackupStatus, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleBackup = () => {
    exportData();
    localStorage.setItem('lastBackupDate', new Date().toISOString());
    setIsOpen(false);
  };

  const handleDismiss = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() - (BACKUP_INTERVAL_DAYS - 1));
    localStorage.setItem('lastBackupDate', tomorrow.toISOString());
    addToast('Backup postponed to tomorrow.', 'info');
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} title="Time for a Backup">
      <div className="space-y-4">
         <div className="flex items-center gap-4 text-warning bg-warning/10 p-4 rounded-xl">
             <Icon iconName="warning" className="w-8 h-8 flex-shrink-0" />
             <p className="text-sm font-medium">Vellor stores all data locally on your device for maximum privacy. This means if you clear your browser data or lose this device, your data is gone forever.</p>
         </div>
         <p className="text-gray-700 dark:text-gray-300">
             It has been over {BACKUP_INTERVAL_DAYS} days since your last backup (or you've never created one). We highly recommend exporting a backup file now and saving it securely.
         </p>
         <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
             <Button variant="ghost" onClick={handleDismiss} className="flex-1">Remind Me Later</Button>
             <Button variant="primary" onClick={handleBackup} className="flex-1 flex items-center justify-center gap-2">
                 <Icon iconName="arrow-right-on-rectangle" className="w-5 h-5 -rotate-90" />
                 Export Backup
             </Button>
         </div>
      </div>
    </Modal>
  );
};
