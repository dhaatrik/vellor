import React from 'react';
import { useStore, useData } from '../../store';
import { Card, Icon } from '../ui';
import { formatCurrency } from '../../helpers';
import { motion, Variants } from 'framer-motion';

interface DashboardGoalProps {
  itemVariants: Variants;
}

export const DashboardGoal: React.FC<DashboardGoalProps> = ({ itemVariants }) => {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const { totalPaidThisMonth } = useData.derived();

  const monthlyIncomeGoal = settings.monthlyGoal || 500;
  const moneyTreeProgress = Math.min(100, (totalPaidThisMonth / monthlyIncomeGoal) * 100);

  const [isEditingGoal, setIsEditingGoal] = React.useState(false);
  const [goalInput, setGoalInput] = React.useState(monthlyIncomeGoal.toString());

  const handleGoalSave = () => {
    updateSettings({ monthlyGoal: parseFloat(goalInput) || 500 });
    setIsEditingGoal(false);
  };

  return (
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-1 lg:col-span-1">
          <Card className="h-full border border-white/5 bg-black flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Icon iconName="banknotes" className="w-5 h-5 text-accent" />
                  Monthly Goal
                </h3>
              </div>
              <div className="mb-2 flex justify-between items-end">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPaidThisMonth, settings.currencySymbol)}</span>
                {isEditingGoal ? (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">/</span>
                        <label htmlFor="monthly-goal-input" className="sr-only">Monthly Goal</label>
                        <input
                            id="monthly-goal-input"
                            type="number"
                            aria-label="Monthly goal"
                            className="w-20 px-2 py-1 bg-white/50 dark:bg-primary-dark/50 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white outline-none"
                            value={goalInput}
                            onChange={e => setGoalInput(e.target.value)}
                            onBlur={handleGoalSave}
                            onKeyDown={e => e.key === 'Enter' && handleGoalSave()}
                            autoFocus
                        />
                    </div>
                ) : (
                    <span
                        className="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 rounded px-1"
                        onClick={() => setIsEditingGoal(true)}
                        title="Click to edit goal"
                        role="button"
                        tabIndex={0}
                        aria-label="Edit monthly goal"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsEditingGoal(true);
                            }
                        }}
                    >
                        / {formatCurrency(monthlyIncomeGoal, settings.currencySymbol)}
                        <Icon iconName="pencil" className="w-3 h-3 inline-block ml-1 opacity-50" />
                    </span>
                )}
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-primary/50 rounded-full overflow-hidden shadow-inner border border-gray-200 dark:border-white/5">
                <motion.div
                  className="h-full bg-accent relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${moneyTreeProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                </motion.div>
              </div>
              {moneyTreeProgress >= 100 && <p className="text-sm mt-3 text-accent font-medium animate-pulse flex items-center gap-2">Goal Achieved! <Icon iconName="party-popper" className="w-5 h-5" /></p>}
            </div>
          </Card>
        </motion.div>
  );
};