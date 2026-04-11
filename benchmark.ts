import { PaymentStatus, Transaction } from './types';
import { performance } from 'perf_hooks';

const numTransactions = 100000;
const transactions: Transaction[] = [];

for (let i = 0; i < numTransactions; i++) {
  transactions.push({
    id: `tx-${i}`,
    studentId: `st-${i % 100}`,
    date: '2023-01-01',
    lessonDuration: 60,
    lessonFee: 100,
    amountPaid: 0,
    status: PaymentStatus.Due,
    createdAt: '2023-01-01T00:00:00Z',
  } as Transaction);
}

const targetId = `tx-${numTransactions - 1}`;
const targetTx = transactions[numTransactions - 1];

const startLinear = performance.now();
let count1 = 0;
for (let i = 0; i < 1000; i++) {
  const t = transactions.find(tx => tx.id === targetId);
  if (t) count1++;
}
const endLinear = performance.now();
console.log(`Linear scan find (1000 ops): ${endLinear - startLinear} ms (count: ${count1})`);

const startDirect = performance.now();
let count2 = 0;
for (let i = 0; i < 1000; i++) {
  const t = targetTx;
  if (t) count2++;
}
const endDirect = performance.now();
console.log(`Direct object access (1000 ops): ${endDirect - startDirect} ms (count: ${count2})`);
