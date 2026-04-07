import React from 'react';
import { Transaction } from '../../types';
import { Button, Card, Icon } from '../ui';
import { formatCurrency, formatDate } from '../../helpers';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { setHoveredTransaction } from '../../helpers/globalHover';

/**
 * Props for the TransactionListItem component.
 */
interface TransactionListItemProps {
  /** The transaction data to display. */
  transaction: Transaction;
  /** Name of the student associated with the transaction. */
  studentName: string;
  /** Callback to initiate editing this transaction. */
  onEdit: (transaction: Transaction) => void;
  /** Callback when the delete button for this transaction is clicked. */
  onDelete: (transaction: Transaction) => void;
  /** Current currency symbol. */
  currencySymbol: string;
  /** Callback to generate an invoice. */
  onGenerateInvoice?: (transaction: Transaction) => void;
  /** Callback to share invoice via WhatsApp. */
  onShareWhatsApp?: (transaction: Transaction) => void;
}
/**
 * Displays a summary of a single transaction in a list.
 */
export const TransactionListItem: React.FC<TransactionListItemProps> = React.memo(({ transaction, studentName, onEdit, onDelete, onGenerateInvoice, onShareWhatsApp, currencySymbol }) => {
  return (
    <Card
      className="hover:border-accent/50 transition-colors duration-300 group border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl"
      onMouseEnter={() => setHoveredTransaction(transaction.id)}
      onMouseLeave={() => setHoveredTransaction(null)}
    >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-primary flex items-center justify-center flex-shrink-0">
                  <Icon iconName="banknotes" className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                    <p className="font-display font-semibold text-lg text-gray-900 dark:text-white">{studentName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Icon iconName="calendar" className="w-3.5 h-3.5" />
                      {formatDate(transaction.date)}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center justify-between w-full sm:w-auto gap-6 bg-gray-50 dark:bg-primary/50 p-3 rounded-2xl sm:bg-transparent sm:p-0 sm:rounded-none">
                {transaction.paymentMethod && (
                  <div className="text-left sm:text-right hidden md:block">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Method</p>
                      <p className="font-medium text-gray-900 dark:text-white">{transaction.paymentMethod}</p>
                  </div>
                )}
                <div className="text-left sm:text-right">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Fee</p>
                    <p className="font-mono font-semibold text-gray-900 dark:text-white">{formatCurrency(transaction.lessonFee, currencySymbol)}</p>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Paid</p>
                    <p className="font-mono font-semibold text-success">{formatCurrency(transaction.amountPaid, currencySymbol)}</p>
                </div>
                <div className="self-center">
                    <TransactionStatusBadge status={transaction.status} />
                </div>
            </div>
        </div>
        
        {transaction.notes && (
          <div className="mt-4 p-3 bg-accent/5 dark:bg-accent/5 rounded-xl border border-accent/10">
            <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <Icon iconName="information-circle" className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              {transaction.notes}
            </p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex gap-2 justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
            {onShareWhatsApp && (
              <Button variant="ghost" size="sm" onClick={() => onShareWhatsApp(transaction)} className="!p-2 rounded-full text-green-500 hover:text-green-600 hover:bg-green-500/10" aria-label="Share via WhatsApp" title="Share via WhatsApp">
                <Icon iconName="share" className="w-5 h-5" />
              </Button>
            )}
            {onGenerateInvoice && (
              <Button variant="ghost" size="sm" onClick={() => onGenerateInvoice(transaction)} className="!p-2 rounded-full text-gray-400 hover:text-accent hover:bg-accent/10" aria-label="Generate invoice" title="Generate invoice">
                <Icon iconName="document-text" className="w-5 h-5" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)} className="!p-2 rounded-full text-gray-400 hover:text-accent hover:bg-accent/10" aria-label="Edit transaction" title="Edit transaction">
              <Icon iconName="pencil" className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(transaction)} className="!p-2 rounded-full text-gray-400 hover:text-danger hover:bg-danger/10" aria-label="Delete transaction" title="Delete transaction">
              <Icon iconName="trash" className="w-5 h-5" />
            </Button>
        </div>
    </Card>
  );
});