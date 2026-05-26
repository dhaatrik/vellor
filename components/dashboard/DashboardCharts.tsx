import React, { useMemo } from 'react';
import { useStore } from '../../store';
import { Card, Icon } from '../ui';
import { formatCurrency } from '../../helpers';
import { motion, Variants } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { PaymentStatus } from '../../types';

interface DashboardChartsProps {
  itemVariants: Variants;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ itemVariants }) => {
  const settings = useStore(s => s.settings);
  const students = useStore(s => s.students);
  const transactions = useStore(s => s.transactions);

  const [activeChart, setActiveChart] = React.useState<'income' | 'students'>('income');

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();

    // ⚡ Bolt Performance: Pre-compute the fallback date outside the loop
    const fallbackDateStr = new Date().toISOString();

    // ⚡ Bolt Performance: Pre-calculate target months and related data
    const monthIncomes = new Float64Array(6);
    const targetMonths: { name: string, thresholdDateStr: string }[] = [];
    const monthLookup: Record<string, number> = Object.create(null);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

      // ⚡ Bolt Performance: Use ISO string for threshold to allow string comparison instead of parsing
      const thresholdDateStr = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString();
      const monthName = d.toLocaleString('default', { month: 'short' });

      monthLookup[monthKey] = 5 - i;
      targetMonths.push({ name: monthName, thresholdDateStr });
    }

    // ⚡ Bolt Performance: Single pass over transactions with O(1) month lookup
    for (let j = 0; j < transactions.length; j++) {
      const t = transactions[j];
      if (t.status === PaymentStatus.Paid || t.status === PaymentStatus.PartiallyPaid || t.status === PaymentStatus.Overpaid) {
        const monthKey = t.date.substring(0, 7);
        const index = monthLookup[monthKey];
        if (index !== undefined) {
          monthIncomes[index] += t.amountPaid;
        }
      }
    }

    // ⚡ Bolt Performance: Pre-extract student creation times as strings to avoid Date.parse overhead
    const studentTimes = new Array(students.length);
    for (let j = 0; j < students.length; j++) {
      const s = students[j];
      studentTimes[j] = s.createdAt || fallbackDateStr;
    }

    // ⚡ Bolt Performance: Single pass unrolled frequency map.
    // Unrolling the inner loop avoids repeated array access to `targetMonths` and `thresholdDateStr`,
    // and swapping the loops makes traversing the large `studentTimes` array extremely fast and cache-friendly.
    const monthStudentCounts = new Int32Array(6);
    const t0 = targetMonths[0].thresholdDateStr;
    const t1 = targetMonths[1].thresholdDateStr;
    const t2 = targetMonths[2].thresholdDateStr;
    const t3 = targetMonths[3].thresholdDateStr;
    const t4 = targetMonths[4].thresholdDateStr;
    const t5 = targetMonths[5].thresholdDateStr;

    for (let j = 0; j < studentTimes.length; j++) {
      const time = studentTimes[j];
      if (time <= t0) monthStudentCounts[0]++;
      if (time <= t1) monthStudentCounts[1]++;
      if (time <= t2) monthStudentCounts[2]++;
      if (time <= t3) monthStudentCounts[3]++;
      if (time <= t4) monthStudentCounts[4]++;
      if (time <= t5) monthStudentCounts[5]++;
    }

    for (let i = 0; i < 6; i++) {
      data.push({
        name: targetMonths[i].name,
        income: monthIncomes[i],
        students: monthStudentCounts[i]
      });
    }
    return data;
  }, [transactions, students]);

  return (
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <Card className="h-full rounded-3xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon iconName={activeChart === 'income' ? 'chart-bar' : 'users'} className={`w-5 h-5 ${activeChart === 'income' ? 'text-accent' : 'text-blue-500'}`} />
                {activeChart === 'income' ? 'Income Overview' : 'Student Growth'}
              </h3>
              <div className="flex bg-gray-100 dark:bg-primary rounded-full p-1" role="tablist" aria-label="Chart view options">
                <button
                  role="tab"
                  aria-selected={activeChart === 'income'}
                  aria-controls="dashboard-chart-panel"
                  aria-label="View Income Overview"
                  onClick={() => setActiveChart('income')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary ${activeChart === 'income' ? 'bg-white dark:bg-primary-light text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Income
                </button>
                <button
                  role="tab"
                  aria-selected={activeChart === 'students'}
                  aria-controls="dashboard-chart-panel"
                  aria-label="View Student Growth"
                  onClick={() => setActiveChart('students')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary ${activeChart === 'students' ? 'bg-white dark:bg-primary-light text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Students
                </button>
              </div>
            </div>
            <div id="dashboard-chart-panel" className="flex-1 min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-white/10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-gray-500 dark:text-gray-400" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-gray-500 dark:text-gray-400" tickFormatter={(value) => activeChart === 'income' ? `${settings.currencySymbol}${value}` : value} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: activeChart === 'income' ? '#8b5cf6' : '#3b82f6', fontWeight: 'bold' }}
                    formatter={(value: ValueType | undefined) => activeChart === 'income' ? [formatCurrency(Number(value), settings.currencySymbol), 'Income'] : [value, 'Students']}
                  />
                  <Area type="monotone" dataKey={activeChart} stroke={activeChart === 'income' ? '#8b5cf6' : '#3b82f6'} strokeWidth={3} fillOpacity={1} fill={`url(#color${activeChart === 'income' ? 'Income' : 'Students'})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
  );
};
