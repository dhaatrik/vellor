import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AppSettings, PhoneNumber } from '../types';
import { Button, Input, Card, PhoneInput, Modal, Icon, Select } from '../components/ui';
import { formatPhoneNumber } from '../helpers';
import { CURRENCY_OPTIONS, COUNTRIES } from '../constants';
import { motion } from 'framer-motion';

/**
 * Displays and allows editing of the teacher's profile and application settings.
 * Also includes data management features.
 */
export const ProfilePage: React.FC = () => {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const addToast = useStore(s => s.addToast);
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isCardVisible, setIsCardVisible] = useState(false);

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

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryName = e.target.value;
    const selectedCountry = COUNTRIES.find(c => c.name === countryName);
    const newCountryCode = selectedCountry ? selectedCountry.code : '+1';
    setFormData(prev => ({
        ...prev,
        country: countryName,
        phone: { 
            countryCode: newCountryCode, 
            number: prev.phone?.number || ''
        },
    }));
  };

  const handlePhoneChange = (name: string, value: PhoneNumber) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateSettings(formData);
  };
  
  const handleShare = async () => {
    const shareText = `Tutor: ${settings.userName}\nEmail: ${settings.email || 'N/A'}\nPhone: ${formatPhoneNumber(settings.phone)}\nCountry: ${settings.country || 'N/A'}`.trim();

    if (navigator.share) {
        try {
            await navigator.share({ title: `${settings.userName}'s Contact`, text: shareText });
            addToast('Contact shared successfully!', 'success');
        } catch (error) {
            console.error('Error sharing:', error);
            addToast('Could not share contact.', 'error');
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareText);
            addToast('Contact details copied to clipboard!', 'info');
        } catch (err) {
            addToast('Could not copy details. Please copy manually.', 'error');
        }
    }
  };
  


  const countryOptions = COUNTRIES.map(c => ({ value: c.name, label: c.name }));

  return (
    <motion.div 
      className="space-y-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50">Profile & Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account details and application preferences.</p>
      </div>
      
      <Card title="Your Details" titleIcon="identification">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input label="Your Name (Tutor)" name="userName" value={formData.userName} onChange={handleChange} placeholder="e.g., Rahul Sharma" />
            <Input label="Email Address" name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="rahul@example.com" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select
              label="Country"
              name="country"
              value={formData.country || 'United States'}
              onChange={handleCountryChange}
              options={countryOptions}
            />
            <PhoneInput
              label="Phone Number"
              name="phone"
              value={formData.phone || { countryCode: '+1', number: '' }}
              onChange={handlePhoneChange}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select
              label="Currency"
              name="currencySymbol"
              value={formData.currencySymbol}
              onChange={handleChange}
              options={CURRENCY_OPTIONS.map(c => ({ value: c.symbol, label: `${c.name} (${c.symbol})` }))}
              placeholder="Select currency"
            />
            <Input
              label="Monthly Income Goal"
              name="monthlyGoal"
              type="number"
              value={formData.monthlyGoal || ''}
              onChange={handleChange}
              placeholder="e.g., 500"
            />
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-end items-center gap-3">
          <Button onClick={() => setIsCardVisible(true)} variant="outline" leftIcon="user-circle" className="w-full sm:w-auto rounded-full">
            View Visiting Card
          </Button>
          <Button onClick={handleSave} variant="primary" leftIcon="check-circle" className="w-full sm:w-auto rounded-full shadow-lg shadow-accent/20">
            Save Changes
          </Button>
        </div>
      </Card>

      
      {/* Visiting Card Modal */}
      <Modal isOpen={isCardVisible} onClose={() => setIsCardVisible(false)} title="Your Visiting Card">
          <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-primary-light dark:to-primary rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-accent/10 dark:bg-accent/5"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-white dark:bg-primary rounded-full flex items-center justify-center shadow-md mb-4 border-4 border-gray-50 dark:border-primary-light">
                <Icon iconName="user-circle" className="w-16 h-16 text-accent" />
              </div>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{settings.userName}</h2>
              <p className="text-accent font-medium tracking-wide uppercase text-sm mt-1 mb-6">Tutor / Educator</p>
              
              <div className="space-y-3 text-left bg-white/50 dark:bg-primary/50 backdrop-blur-sm p-6 rounded-2xl">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <Icon iconName="envelope" className="w-4 h-4 text-accent" />
                      </div>
                      <span className="truncate">{settings.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <Icon iconName="phone" className="w-4 h-4 text-accent" />
                      </div>
                      <span>{formatPhoneNumber(settings.phone)}</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <Icon iconName="globe" className="w-4 h-4 text-accent" />
                      </div>
                      <span>{settings.country || 'No country selected'}</span>
                  </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
              <Button onClick={handleShare} leftIcon="share" variant="primary" className="rounded-full shadow-lg shadow-accent/20">Share Card</Button>
          </div>
      </Modal>


    </motion.div>
  );
};