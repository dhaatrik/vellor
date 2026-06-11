import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../../components/ui';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
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
            <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">The "No-Nonsense" Terms of Service</h2>
            <button onClick={() => onClose()} className="p-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-full transition-colors self-start" aria-label="Close Terms of Service" title="Close Terms of Service">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="p-6 md:p-8 space-y-6 text-gray-600 dark:text-gray-300 text-base md:text-lg overflow-y-auto custom-scrollbar">
            <p>Most software companies use this page to bury you in legal jargon, claim ownership of your data, or hide sneaky subscription clauses.</p>
            <p>Not us. Vellor operates on a strict <strong className="text-accent">"Zero Strings Attached"</strong> policy.</p>

            <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">1. Your Data is Yours.</h3>
              <p>Vellor is an offline-first application. Everything you type, track, and manage lives exclusively on your own device. We do not have cloud servers, we do not monitor your usage, and we couldn't sell your students' information to advertisers even if we tried.</p>
            </div>

            <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">2. Zero Hidden Fees.</h3>
              <p>There are no paywalls, no "premium" tiers, and absolutely no transaction cuts. You keep 100% of the money you earn from your hard work.</p>
            </div>

            <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">3. Zero Vendor Lock-in.</h3>
              <p>We believe you should stay because the software is great, not because you're trapped. You can export your entire database as a standard CSV file at any time, with one click.</p>
            </div>

            <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">4. Open Source Freedom.</h3>
              <p>Vellor is free and open-source software built for independent educators. You are free to use it, modify it, and customize it to fit your academy's exact needs.</p>
            </div>

            <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
              <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-4">Our Only "Condition":</h3>
              <p className="max-w-md mx-auto italic text-gray-600 dark:text-gray-400">Treat your students well, teach them something valuable, and use this tool to take back your time. That's it. Now get back to growing your business.</p>
              <Button onClick={() => onClose()} className="mt-8 w-full md:w-auto px-10 py-4 text-lg rounded-full font-bold shadow-lg shadow-accent/20">Got It</Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};
