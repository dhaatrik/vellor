import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const SavingsCalculator: React.FC = () => {
  const [monthlyCost, setMonthlyCost] = useState(35);

  return (
    <section data-pomelli-section="savings-calculator" data-pomelli-value-prop="lifetime-free-savings" data-crawler-intent="conversion" className="py-24 px-4 bg-white dark:bg-primary-dark/50 relative z-20 border-t border-gray-100 dark:border-white/5">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white tracking-tighter">The Cost of the Status Quo</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-12 text-pretty">See how much you'd save by switching to Vellor from any paid tutoring software.</p>
        </motion.div>

        <div className="bg-gray-50 dark:bg-primary rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-inset ring-white/10">
          <div className="mb-8">
            <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 block">What you currently pay per month</label>
            <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-bold font-display text-accent mb-6">${monthlyCost}</motion.div>
            <div className="relative w-full group py-4">
              <input
                type="range"
                min="0"
                max="100"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary transition-all duration-150"
                aria-label="Current monthly software cost"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-2 font-medium">
              <span>$0</span>
              <span>$100/mo</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { label: "1-Year Savings", value: monthlyCost * 12 },
              { label: "3-Year Savings", value: monthlyCost * 36 },
              { label: "5-Year Savings", value: monthlyCost * 60 },
            ].map((item) => (
              <motion.div
                key={item.label}
                className="bg-white dark:bg-primary-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</div>
                <motion.div
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl md:text-4xl font-bold font-display text-accent"
                >
                  ${item.value.toLocaleString()}
                </motion.div>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-gray-500 dark:text-gray-400 text-sm">That's money back in your pocket. Vellor is <strong className="text-accent">free forever</strong>.</p>
        </div>
      </div>
    </section>
  );
};
