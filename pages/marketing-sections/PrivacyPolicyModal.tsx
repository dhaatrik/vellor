import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../../components/ui';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-primary rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col"
        >
          <div className="bg-gray-50 dark:bg-primary-light p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">The "Anti-Spying" Privacy Policy</h2>
            <button onClick={() => onClose()} className="p-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-full transition-colors self-start" aria-label="Close Privacy Policy" title="Close Privacy Policy">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="p-6 md:p-8 space-y-6 text-gray-600 dark:text-gray-300 text-base md:text-lg overflow-y-auto custom-scrollbar">
            <p>Most privacy policies are written by corporate lawyers to explain exactly how a company plans to legally harvest and sell your data.</p>
            <p>Ours is simple: <strong className="text-accent">We don't want your data, and we literally can't see it.</strong></p>

            <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">1. We Have No Servers</h3>
              <p>Vellor is an "offline-first" application. When you add a student, log a lesson, or track a payment, that information is saved locally inside your device's browser using industry-standard encryption. It is never transmitted to our servers, because we don't have any.</p>
            </div>

            <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">2. Zero Third-Party Tracking</h3>
              <p>We do not use tracking pixels, behavioral analytics, or ad-targeting scripts. We have no idea how many students you have, how much money you make, or how often you use the app. Your business metrics are none of our business.</p>
            </div>

            <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">3. Total Financial Privacy</h3>
              <p>Vellor helps you generate invoices and track your income, but it does not connect to your bank or process payments. Your financial records exist only on your screen.</p>
            </div>

            <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">4. Verifiably Transparent</h3>
              <p>Because Vellor is 100% open-source, our entire codebase is public. You (or any software engineer) can inspect the code at any time to verify that your data never leaves your device.</p>
            </div>

            <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
              <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-4">The Bottom Line:</h3>
              <p className="max-w-md mx-auto italic text-gray-600 dark:text-gray-400">What happens on your device, stays on your device. Run your tutoring business with total peace of mind.</p>
              <Button onClick={() => onClose()} className="mt-8 w-full md:w-auto px-10 py-4 text-lg rounded-full font-bold shadow-lg shadow-accent/20">Understood</Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};
