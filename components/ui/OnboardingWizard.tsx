import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Icon } from '.';
import { useStore } from '../../store';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const updateSettings = useStore((s) => s.updateSettings);
  const settings = useStore((s) => s.settings);
  const [goal, setGoal] = useState(settings.monthlyGoal?.toString() || '500');

  if (!isOpen) return null;

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else handleComplete();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    const goalNum = parseFloat(goal);
    if (!isNaN(goalNum) && goalNum > 0) {
      updateSettings({ monthlyGoal: goalNum, hasCompletedOnboarding: true });
    } else {
      updateSettings({ hasCompletedOnboarding: true });
    }
    onClose();
  };

  const skipWizard = () => {
    updateSettings({ hasCompletedOnboarding: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-primary-dark w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100 dark:border-white/10 flex flex-col h-[600px] max-h-[90vh]">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-100 dark:bg-white/5 absolute top-0 left-0">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Skip Button */}
        <button
          onClick={skipWizard}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-full p-2"
          title="Skip Tutorial"
          aria-label="Skip tutorial"
        >
          <Icon iconName="x-mark" className="w-5 h-5" />
        </button>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden p-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="text-center w-full"
              >
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/20">
                  <img src="/logo.png" alt="Vellor" className="w-12 h-12 object-contain dark:bg-white/90 dark:rounded-xl dark:p-1" />
                </div>
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
                  Welcome to Vellor!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm mx-auto">
                  Your offline-first, professional companion for private tutoring. We’ve designed this to make managing your students effortless.
                </p>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl inline-block">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Icon iconName="users" className="w-4 h-4 text-blue-500" />
                    First step: Add your students and set their rates!
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-full flex flex-col h-full"
              >
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2 text-center">
                  Log Lessons in Seconds
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center text-sm">
                  Watch this quick 10-second demo to see how easy it is to log lessons and track payments.
                </p>
                <div className="flex-1 rounded-2xl overflow-hidden bg-black/10 border border-gray-200 dark:border-white/10 relative shadow-inner">
                  <video
                    src="/walkthrough.webm"
                    className="w-full h-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-full flex flex-col h-full items-center text-center justify-center"
              >
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
                  Level Up Your Tutoring
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm max-w-sm">
                  Earn points for every lesson logged, payment marked, and day you use the app!
                </p>
                <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-primary">
                  <img src="/dashboard.png" alt="Dashboard Gamification Preview" className="w-full h-auto" />
                </div>
                <div className="mt-6 flex gap-4">
                  <div className="bg-yellow-500/10 px-4 py-2 rounded-xl text-yellow-600 dark:text-yellow-400 font-bold text-sm flex items-center gap-2">
                    <Icon iconName="star" className="w-4 h-4" /> Earn Points
                  </div>
                  <div className="bg-orange-500/10 px-4 py-2 rounded-xl text-orange-600 dark:text-orange-400 font-bold text-sm flex items-center gap-2">
                    <Icon iconName="flame" className="w-4 h-4" /> Build Streaks
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="text-center w-full"
              >
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                  <Icon iconName="target" className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
                  Set Your Monthly Goal
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm mx-auto">
                  What is your target income for this month? A visual progress bar will help you track it on your dashboard!
                </p>
                
                <div className="max-w-xs mx-auto text-left">
                  <label htmlFor="monthly-target" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                    Monthly Target ({settings.currencySymbol})
                  </label>
                  <input
                    id="monthly-target"
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-primary/50 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-accent outline-none text-2xl font-bold text-center text-gray-900 dark:text-white transition-all shadow-inner"
                    placeholder="500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-primary-dark/50">
          <div className="text-sm text-gray-500 font-medium">Step {step} of 4</div>
          <div className="flex gap-3">
            {step > 1 && (
              <Button onClick={prevStep} variant="ghost" className="rounded-xl">
                Back
              </Button>
            )}
            <Button onClick={nextStep} variant="primary" className="rounded-xl px-8 shadow-lg shadow-accent/20" rightIcon={step === 4 ? "check-circle" : "arrow-right"}>
              {step === 4 ? 'Finish Setup' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
