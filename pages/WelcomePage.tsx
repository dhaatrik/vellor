
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../store';
import { AppSettings, PhoneNumber } from '../types';
import { CURRENCY_OPTIONS, DEFAULT_USER_NAME, COUNTRIES } from '../constants';
import { Button, Input, Select, Card, Icon, PhoneInput } from '../components/ui';
import { motion } from 'framer-motion';

/**
 * A one-time welcome and setup page for new users.
 */
export const WelcomePage: React.FC = () => {
    const { settings, updateSettings } = useData();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Omit<AppSettings, 'theme'>>({
        userName: '',
        currencySymbol: settings.currencySymbol,
        country: 'United States',
        phone: { countryCode: '+1', number: '' },
        email: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryName = e.target.value;
        const selectedCountry = COUNTRIES.find(c => c.name === countryName);
        const newCountryCode = selectedCountry ? selectedCountry.code : '+1';

        setFormData(prev => ({
            ...prev,
            country: countryName,
            phone: { ...(prev.phone as PhoneNumber), countryCode: newCountryCode },
        }));
    };

    const handlePhoneChange = (name: string, value: PhoneNumber) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.userName.trim() === '' || formData.userName.trim() === DEFAULT_USER_NAME) {
            alert('Please enter a valid name.');
            return;
        }
        updateSettings(formData);
        navigate('/dashboard');
    };

    const countryOptions = COUNTRIES.map(c => ({ value: c.name, label: c.name }));

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-primary p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-light/30 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div 
                className="w-full max-w-xl mx-auto relative z-10"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
            >
                 <Card className="p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-accent/5 border border-white/20 dark:border-white/5 bg-white/80 dark:bg-primary-light/80 backdrop-blur-xl">
                    <div className="text-center mb-10">
                        <motion.div 
                            className="w-20 h-20 mx-auto bg-accent/10 rounded-3xl flex items-center justify-center mb-6 rotate-3 shadow-inner"
                            initial={{ rotate: -10, scale: 0.8 }}
                            animate={{ rotate: 3, scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                        >
                            <Icon iconName="academic-cap" className="w-10 h-10 text-accent" />
                        </motion.div>
                        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Welcome to Vellor</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Let's get your profile set up to personalize your experience.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                            <Input
                                label="Your Name"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                placeholder="e.g., Rahul Sharma"
                                required
                                autoFocus
                                className="text-lg"
                            />
                        </motion.div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                                 <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    placeholder="rahul@example.com"
                                />
                             </motion.div>
                             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                                <Select
                                    label="Country"
                                    name="country"
                                    value={formData.country || 'United States'}
                                    onChange={handleCountryChange}
                                    options={countryOptions}
                                />
                             </motion.div>
                        </div>

                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                            <PhoneInput
                                label="Phone Number"
                                name="phone"
                                value={formData.phone || { countryCode: '+1', number: ''}}
                                onChange={handlePhoneChange}
                            />
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                            <Select
                                label="Preferred Currency"
                                name="currencySymbol"
                                value={formData.currencySymbol}
                                onChange={handleChange}
                                options={CURRENCY_OPTIONS.map(c => ({ value: c.symbol, label: `${c.name} (${c.symbol})` }))}
                            />
                        </motion.div>
                        
                        <motion.div 
                            className="pt-4"
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.8 }}
                        >
                            <Button type="submit" variant="primary" size="lg" className="w-full rounded-full shadow-lg shadow-accent/20 text-lg py-4" rightIcon="arrow-right">
                                Get Started
                            </Button>
                        </motion.div>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};
