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
          <Card className="h-full border border-white/5 bg-black flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon iconName={activeChart === 'income' ? 'chart-bar' : 'users'} className={`w-5 h-5 ${activeChart === 'income' ? 'text-[#00ff66]' : 'text-white'}`} />
                {activeChart === 'income' ? 'Income Overview' : 'Student Growth'}
              </h3>
              <div className="flex bg-black border border-[#333333] rounded-sm p-[2px]" role="tablist" aria-label="Chart view options">
                <button
                  role="tab"
                  aria-selected={activeChart === 'income'}
                  aria-label="View Income Overview"
                  onClick={() => setActiveChart('income')}
                  className={`px-3 py-1 text-xs font-mono rounded-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00ff66] focus-visible:ring-offset-1 focus-visible:ring-offset-black ${activeChart === 'income' ? 'bg-[#222222] text-[#00ff66] border border-[#00ff66]/30 shadow-sm' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
                >
                  Income
                </button>
                <button
                  role="tab"
                  aria-selected={activeChart === 'students'}
                  aria-label="View Student Growth"
                  onClick={() => setActiveChart('students')}
                  className={`px-3 py-1 text-xs font-mono rounded-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-black ${activeChart === 'students' ? 'bg-[#222222] text-white border border-white/30 shadow-sm' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
                >
                  Students
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    stroke="#333333"
                    tick={{ fontSize: 12, fontFamily: 'monospace', fill: '#888888' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    stroke="#333333"
                    tick={{ fontSize: 12, fontFamily: 'monospace', fill: '#888888' }}
                    tickFormatter={(value) => activeChart === 'income' ? `${settings.currencySymbol}${value}` : value}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000', border: '1px solid #333333', borderRadius: '0', padding: '8px' }}
                    itemStyle={{ color: activeChart === 'income' ? '#00ff66' : '#ffffff', fontFamily: 'monospace', fontSize: '14px' }}
                    labelStyle={{ color: '#888888', fontFamily: 'monospace', fontSize: '12px', marginBottom: '4px' }}
                    formatter={(value: ValueType | undefined) => activeChart === 'income' ? [formatCurrency(Number(value), settings.currencySymbol), 'Income'] : [value, 'Students']}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeChart}
                    stroke={activeChart === 'income' ? '#00ff66' : '#ffffff'}
                    strokeWidth={1.5}
                    fillOpacity={0.1}
                    fill={activeChart === 'income' ? '#00ff66' : '#ffffff'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
  );
};
