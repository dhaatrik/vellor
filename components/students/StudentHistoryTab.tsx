import React, { useState, useMemo } from 'react';
import { Transaction, PaymentStatus } from '../../types';
import { Button, Card, Icon } from '../ui';
import { formatCurrency, formatDate } from '../../helpers';
import { TransactionStatusBadge } from '../transactions/TransactionStatusBadge';

interface StudentHistoryTabProps {
  studentTransactions: Transaction[];
  totalOwed: number;
  totalPaidForStudent: number;
  currencySymbol: string;
  studentId: string;
  onLogPayment: (studentId: string) => void;
}

export const StudentHistoryTab: React.FC<StudentHistoryTabProps> = ({
  studentTransactions,
  totalOwed,
  totalPaidForStudent,
  currencySymbol,
  studentId,
  onLogPayment,
}) => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'due' | 'partially-paid'>('all');

  const renderedTransactions = useMemo(() => {
    return studentTransactions.reduce<React.ReactNode[]>((acc, t) => {
      let keep = false;
      if (filter === 'all') keep = true;
      else if (filter === 'paid') keep = t.status === PaymentStatus.Paid;
      else if (filter === 'due') keep = t.status === PaymentStatus.Due;
      else if (filter === 'partially-paid') keep = t.status === PaymentStatus.PartiallyPaid;

      if (keep) {
        acc.push(
          <div
            key={t.id}
            className="p-4 bg-gray-50 dark:bg-primary/30 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  <Icon iconName="calendar" className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(t.date)}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Icon iconName="banknotes" className="w-3.5 h-3.5" /> Fee:{' '}
                      {formatCurrency(t.lessonFee, currencySymbol)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    <span>
                      Paid:{' '}
                      <span
                        className={
                          t.amountPaid > 0 ? 'text-success font-medium' : ''
                        }
                      >
                        {formatCurrency(t.amountPaid, currencySymbol)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-center">
                <TransactionStatusBadge status={t.status} />
              </div>
            </div>
            {t.notes && (
              <div className="mt-3 ml-13 p-2.5 bg-white dark:bg-primary-light rounded-xl text-sm text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Note:
                </span>{' '}
                {t.notes}
              </div>
            )}
          </div>
        );
      }
      return acc;
    }, []);
  }, [studentTransactions, filter, currencySymbol]);

  return (
    <Card className="border-gray-100 dark:border-white/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon iconName="clock" className="w-5 h-5 text-gray-400" />
            History
          </h3>

          {studentTransactions.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                aria-label="Filter transactions"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm bg-white dark:bg-primary-light border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="due">Due</option>
                <option value="partially-paid">Partially Paid</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 bg-gray-50 dark:bg-primary/50 p-3 rounded-2xl w-full sm:w-auto">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
              Total Paid
            </p>
            <p className="font-mono font-bold text-success">
              {formatCurrency(totalPaidForStudent, currencySymbol)}
            </p>
          </div>
          <div className="w-px bg-gray-200 dark:bg-white/10"></div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
              Outstanding
            </p>
            <p
              className={`font-mono font-bold ${
                totalOwed > 0 ? 'text-danger' : 'text-gray-900 dark:text-white'
              }`}
            >
              {formatCurrency(totalOwed, currencySymbol)}
            </p>
          </div>
        </div>
      </div>

      {renderedTransactions.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {renderedTransactions}
        </div>
      ) : (
        <div className="h-[400px] flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-primary/30 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 border-telemetry">
          <div className="w-16 h-16 mx-auto bg-white dark:bg-primary-light rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Icon iconName="document-text" className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {filter === 'all' ? 'No transactions logged yet.' : 'No transactions found for this filter.'}
          </p>
          {filter === 'all' && (
            <Button
              onClick={() => onLogPayment(studentId)}
              variant="ghost"
              size="sm"
              className="mt-4 text-accent"
            >
              Log their first lesson
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
