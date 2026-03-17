/**
 * @file Toast.tsx
 * Defines the Toast and ToastContainer components for notifications.
 */

import React from 'react';
import { useStore } from '../../store';
import { ToastMessage } from '../../types';
import { Icon } from './Icon';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A single toast notification component with styling based on its type (success, error, info).
 * @param {{toast: ToastMessage}} props The toast message object.
 * @returns {React.ReactElement} A JSX element representing a single toast.
 */
const Toast: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const typeStyles = {
    success: { icon: 'check-circle', color: 'text-success', bg: 'bg-success/10 border-success/20' },
    error: { icon: 'x-circle', color: 'text-danger', bg: 'bg-danger/10 border-danger/20' },
    info: { icon: 'information-circle', color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
  } as const;

  const styles = typeStyles[toast.type];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`max-w-sm w-full bg-white dark:bg-primary/90 backdrop-blur-md shadow-xl rounded-2xl pointer-events-auto border ${styles.bg} overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-primary shadow-sm`}>
            <Icon iconName={styles.icon} className={`w-5 h-5 ${styles.color}`} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.message}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * A container for rendering toast notifications. It positions them in a fixed location on the screen.
 * It uses the global data context to get the list of active toasts.
 * @returns {React.ReactElement | null} The toast container element, or null if there are no toasts.
 */
export const ToastContainer: React.FC = () => {
    const toasts = useStore(s => s.toasts);

    return (
        <div aria-live="assertive" className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-end sm:justify-end z-[100]">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <Toast key={toast.id} toast={toast} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};