import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { useNavigate } from 'react-router-dom';
import { QuickLogModal } from '../transactions/QuickLogModal';

export const FAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const navigate = useNavigate();

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleAddStudent = () => {
    setIsOpen(false);
    navigate('/students', { state: { openAddStudentModal: true } });
  };

  const handleLogLesson = () => {
    setIsOpen(false);
    setIsQuickLogOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="fab-menu"
              role="menu"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 220, damping: 29, mass: 1, restDelta: 0.001 }}
              className="flex flex-col gap-3 items-end"
            >
              <button
                onClick={handleLogLesson}
                role="menuitem"
                aria-label="Quick Log Lesson"
                title="Quick Log Lesson"
                className="flex items-center gap-3 bg-white dark:bg-primary-light text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-lg border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-primary transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary"
              >
                <span className="font-medium text-sm">Quick Log</span>
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Icon iconName="bolt" className="w-4 h-4 text-accent" />
                </div>
              </button>
              <button
                onClick={handleAddStudent}
                role="menuitem"
                aria-label="Add New Student"
                title="Add New Student"
                className="flex items-center gap-3 bg-white dark:bg-primary-light text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-lg border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-primary transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary"
              >
                <span className="font-medium text-sm">Add Student</span>
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Icon iconName="user-plus" className="w-4 h-4 text-blue-500" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-controls="fab-menu"
          aria-haspopup="menu"
          className="w-14 h-14 rounded-full bg-accent text-primary-dark shadow-xl shadow-accent/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary"
          aria-label={isOpen ? "Close quick actions" : "Quick actions"}
          title={isOpen ? "Close quick actions" : "Quick actions"}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 29, mass: 1, restDelta: 0.001 }}
          >
            <Icon iconName="plus" className="w-6 h-6" />
          </motion.div>
        </button>
      </div>

      <QuickLogModal isOpen={isQuickLogOpen} onClose={() => setIsQuickLogOpen(false)} />
    </>
  );
};
