const { performance } = require('perf_hooks');

function benchMap(studentTransactions) {
  const start = performance.now();
  const timeMap = new Map();
  for (let i = 0; i < studentTransactions.length; i++) {
    timeMap.set(studentTransactions[i], Date.parse(studentTransactions[i].date));
  }
  studentTransactions.sort((a,b) => timeMap.get(a) - timeMap.get(b));
  const end = performance.now();
  return end - start;
}

function benchStructWrap(studentTransactions) {
  const start = performance.now();
  const mapped = new Array(studentTransactions.length);
  for (let i = 0; i < studentTransactions.length; i++) {
    const t = studentTransactions[i];
    // Fast path for Date.parse via getTime() if available (due to jsonReviver)
    const time = typeof t.date === 'string' ? new Date(t.date).getTime() : t.date.getTime();
    mapped[i] = { t, time };
  }
  mapped.sort((a, b) => a.time - b.time);
  for (let i = 0; i < mapped.length; i++) {
    studentTransactions[i] = mapped[i].t;
  }
  const end = performance.now();
  return end - start;
}

// Original from pdf.ts lines 189-194 (this code actually IS already a Schwartzian transform!)
function benchOriginalProgressReport(transactions) {
  const start = performance.now();
  const reportTransactions = transactions
     .filter(t => t.studentId === 'student1' && (t.grade || t.progressRemark))
     .map(t => ({ t, time: Date.parse(t.date) }))
     .sort((a,b) => b.time - a.time)
     .map(obj => obj.t);
  const end = performance.now();
  return end - start;
}

function benchGetTimeProgressReport(transactions) {
  const start = performance.now();
  const reportTransactions = transactions
     .filter(t => t.studentId === 'student1' && (t.grade || t.progressRemark))
     .map(t => ({ t, time: typeof t.date === 'string' ? new Date(t.date).getTime() : t.date.getTime() }))
     .sort((a,b) => b.time - a.time)
     .map(obj => obj.t);
  const end = performance.now();
  return end - start;
}


// Generate test data
const transactionsDate = [];
const now = new Date();
for (let i = 0; i < 100000; i++) {
  const d = new Date(now.getTime() - i * 1000000);
  const obj = {
    studentId: 'student1',
    grade: 'A',
    progressRemark: 'Good',
    date: d,
  };
  transactionsDate.push(obj);
}

let t1 = 0;
let t2 = 0;
let t3 = 0;
let t4 = 0;

for (let i=0; i<50; i++) {
  t1 += benchMap([...transactionsDate]);
  t2 += benchStructWrap([...transactionsDate]);
  t3 += benchOriginalProgressReport(transactionsDate);
  t4 += benchGetTimeProgressReport(transactionsDate);
}

console.log("Original map: " + (t1/50).toFixed(2) + " ms");
console.log("Struct wrap: " + (t2/50).toFixed(2) + " ms");
console.log("Original ProgressReport (Date.parse): " + (t3/50).toFixed(2) + " ms");
console.log("Optimized ProgressReport (getTime): " + (t4/50).toFixed(2) + " ms");
