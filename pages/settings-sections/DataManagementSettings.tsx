import React, { useState, useRef } from 'react';
import { Card, Button, Input, ConfirmationModal, Modal } from '../../components/ui';

interface DataManagementSettingsProps {
  exportTransactionsCSV: () => void;
  exportData: (password?: string) => Promise<void>;
  importData: (file: File, password?: string) => Promise<void>;
  resetData: () => void;
}

export const DataManagementSettings: React.FC<DataManagementSettingsProps> = ({
  exportTransactionsCSV,
  exportData,
  importData,
  resetData
}) => {
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPassword, setImportPassword] = useState('');
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <>
      <Card title="Data Management" titleIcon="document-text">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Export your data for backup, or import a previous backup. Resetting will permanently delete all data.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportTransactionsCSV} variant="outline" leftIcon="document-text" className="rounded-full border-accent text-accent hover:bg-accent/10">Export CSV (Taxes)</Button>
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
    </>
  );
};
