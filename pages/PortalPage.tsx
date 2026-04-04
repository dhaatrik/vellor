import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Icon } from '../components/ui';
import { formatCurrency, formatDate } from '../helpers';
import { TransactionStatusBadge } from '../components/transactions/TransactionStatusBadge';
import { jsonReviver } from '../src/crypto';

export const PortalPage: React.FC = () => {
  const location = useLocation();
  
  const parsedData = useMemo(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const dataParam = searchParams.get('data');
      if (!dataParam) return null;
      const decodedStr = decodeURIComponent(atob(dataParam));
      return JSON.parse(decodedStr, jsonReviver);
    } catch (e) {
      console.error("Failed to parse portal data", e);
      return null;
    }
  }, [location.search]);

  if (!parsedData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-center p-4 font-sans">
        <Card className="max-w-md w-full py-12 px-6">
          <Icon iconName="warning" className="w-12 h-12 text-danger mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Invalid Link</h2>
          <p className="text-gray-500">This portal link is invalid or corrupted. Please request a new link from your tutor.</p>
        </Card>
      </div>
    );
  }

  const { tutorName, currencySymbol, student: rawStudent, transactions: rawTransactions } = parsedData;

  // Basic validation to prevent client-side DoS
  const student = typeof rawStudent === 'object' && rawStudent !== null ? rawStudent : {};
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];

  let totalOwed = 0;
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (t?.status === 'Due') {
      totalOwed += (t.lessonFee || 0);
    } else if (t?.status === 'Partially Paid') {
      totalOwed += ((t.lessonFee || 0) - (t.amountPaid || 0));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-4 overflow-hidden border border-gray-100">
             <img src="/logo.png" alt="Vellor" className="w-16 h-16 object-contain dark:bg-white/90 dark:rounded-2xl dark:p-2" />
           </div>
           <h1 className="text-3xl font-bold text-gray-900 mb-1">{student?.firstName || 'Student'} {student?.lastName || ''}'s Dashboard</h1>
           <p className="text-gray-500 font-medium">Prepared by {tutorName || 'Your Tutor'}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Card className="bg-white border-gray-100 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                   <Icon iconName="book-open" className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Subjects</h3>
             </div>
             <div className="flex flex-wrap gap-1.5 mt-2">
                {Array.isArray(student?.subjects) && student.subjects.length > 0 ? student.subjects.map((sub: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">{sub}</span>
                )) : <span className="text-gray-400 text-sm">Not specified</span>}
             </div>
           </Card>

           <Card className="bg-white border-gray-100 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                   <Icon iconName="banknotes" className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Outstanding Balance</h3>
             </div>
             <p className={`text-2xl font-bold font-mono ${totalOwed > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {formatCurrency(totalOwed, currencySymbol)}
             </p>
           </Card>
        </div>

        {/* Transactions & Progress */}
        <Card className="bg-white border-gray-100 shadow-sm mt-6">
           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
             <Icon iconName="calendar" className="w-5 h-5 text-gray-400" />
             Recent Activity
           </h3>
           
           {transactions.length > 0 ? (
             <div className="space-y-4">
                {transactions.slice(0, 10).map((t: any) => (
                   <div key={t.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <div>
                            <p className="font-semibold text-gray-900">{formatDate(t.date)}</p>
                            <div className="text-sm text-gray-500 mt-1 flex gap-3">
                               <span>Fee: {formatCurrency(t.lessonFee, currencySymbol)}</span>
                               <span>Paid: {formatCurrency(t.amountPaid, currencySymbol)}</span>
                            </div>
                         </div>
                         <div className="self-start sm:self-center">
                            <TransactionStatusBadge status={t.status} />
                         </div>
                      </div>
                      {(t.grade || t.progressRemark) && (
                         <div className="mt-3 pt-3 border-t border-gray-200">
                            {t.grade && <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-xs rounded mb-2 mr-2">Grade: {t.grade}</span>}
                            {t.progressRemark && <p className="text-sm text-gray-700 bg-white p-2 border border-gray-200 rounded-lg">{t.progressRemark}</p>}
                         </div>
                      )}
                   </div>
                ))}
                {transactions.length > 10 && (
                  <p className="text-center text-sm text-gray-500 pt-2">Showing 10 most recent records.</p>
                )}
             </div>
           ) : (
             <p className="text-gray-500 text-center py-8">No activity recorded yet.</p>
           )}
        </Card>
        
        <div className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-2">
             <img src="/logo.png" alt="Vellor" className="w-5 h-5 object-contain rounded dark:bg-white/90 dark:p-0.5" style={{ filter: 'grayscale(1) opacity(0.5)' }} />Powered by Vellor
           </div>
      </div>
    </div>
  );
};
