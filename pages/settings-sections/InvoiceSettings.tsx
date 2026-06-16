import React from 'react';
import { Card, Icon, Select, Button } from '../../components/ui';
import { AppSettings } from '../../types';

interface InvoiceSettingsProps {
  formData: AppSettings;
  setFormData: React.Dispatch<React.SetStateAction<AppSettings>>;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const InvoiceSettings: React.FC<InvoiceSettingsProps> = ({ formData, setFormData, updateSettings }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
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

  const handleSaveInvoice = () => {
    updateSettings({ invoiceLogoBase64: formData.invoiceLogoBase64, invoiceTemplate: formData.invoiceTemplate });
  };

  return (
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
  );
};
