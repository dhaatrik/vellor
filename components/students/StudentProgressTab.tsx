import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '../../types';
import { Button, Card, Icon } from '../ui';
import { formatDate } from '../../helpers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface GradeChartDataPoint {
  date: string;
  val: number;
  grade?: string;
}

interface StudentProgressTabProps {
  gradeChartData: GradeChartDataPoint[];
  progressTransactions: Transaction[];
  setShowReportModal: (show: boolean) => void;
  formatGrade: (val: number) => string;
}

export const StudentProgressTab: React.FC<StudentProgressTabProps> = ({
  gradeChartData,
  progressTransactions,
  setShowReportModal,
  formatGrade,
}) => {

  const memoizedLogEntries = useMemo(() => {
    return progressTransactions.map((t) => {
      const timestamp = formatDate(t.date);
      const gradeStr = t.grade ? ` [GRADE: ${t.grade}]` : '';
      const remarkStr = t.progressRemark ? ` // ${t.progressRemark}` : '';
      // Direct string concatenation
      const logLine = `[${timestamp}] ENTRY${gradeStr}${remarkStr}`;

      return (
        <motion.div
          key={t.id + '-prog'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 29, mass: 1, restDelta: 0.001 }}
          className="py-1 transform-gpu will-change-[opacity,transform]"
        >
          {logLine}
        </motion.div>
      );
    });
  }, [progressTransactions]);

  return (
    <Card className="border-gray-100 dark:border-white/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Icon iconName="star" className="w-5 h-5 text-accent" />
          Progress & Remarks
        </h3>
        <Button
          size="sm"
          onClick={() => setShowReportModal(true)}
          variant="primary"
          className="rounded-full shadow-md shadow-accent/20 text-xs"
        >
          Export Report
        </Button>
      </div>

      {gradeChartData.length > 1 && (
        <div className="h-48 w-full mb-8 mt-2 pr-4 bg-gray-50/50 dark:bg-primary-light/10 p-4 rounded-3xl">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gradeChartData}>
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[1, 5]}
                tickFormatter={formatGrade}
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '1rem',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(_value: ValueType | undefined, _name: NameType | undefined, props: { payload?: { grade?: string } }) => [
                  props.payload?.grade || '',
                  'Grade',
                ]}
              />
              <Line
                type="monotone"
                dataKey="val"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: '#8b5cf6',
                  strokeWidth: 2,
                  stroke: '#fff',
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {progressTransactions.length > 0 ? (
        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar font-mono text-xs text-gray-800 dark:text-green-400 bg-transparent">
          {memoizedLogEntries}
        </div>
      ) : (
        <div className="h-[400px] flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-primary/30 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 border-telemetry">
          <div className="w-16 h-16 mx-auto bg-white dark:bg-primary-light rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Icon iconName="star" className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No progress records found.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Add a grade or remark when logging lessons.
          </p>
        </div>
      )}
    </Card>
  );
};
