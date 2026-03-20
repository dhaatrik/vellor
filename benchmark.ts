import { performance } from 'perf_hooks';

// Simulate realistic data size (e.g., 5 years of lessons for 50 students)
const NUM_STUDENTS = 50;
const TRANSACTIONS_PER_STUDENT = 260; // 52 weeks * 5 years
const NUM_TRANSACTIONS = NUM_STUDENTS * TRANSACTIONS_PER_STUDENT;

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface Transaction {
  id: string;
  studentId: string;
  date: string;
  lessonDuration: number;
}

// Generate test data
const students: Student[] = Array.from({ length: NUM_STUDENTS }, (_, i) => ({
  id: `student-${i}`,
  firstName: `First${i}`,
  lastName: `Last${i}`
}));

const transactions: Transaction[] = [];
for (let i = 0; i < NUM_TRANSACTIONS; i++) {
  const studentId = `student-${Math.floor(Math.random() * NUM_STUDENTS)}`;
  transactions.push({
    id: `txn-${i}`,
    studentId,
    date: '2024-01-01T10:00:00',
    lessonDuration: 60
  });
}

function runO_NxM() {
  const start = performance.now();

  const events = transactions.map(t => {
    const student = students.find(s => s.id === t.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
    return { title: studentName };
  });

  const end = performance.now();
  return { time: end - start, eventCount: events.length };
}

function runO_N_Plus_M() {
  const start = performance.now();

  const studentMap = new Map<string, Student>();
  for (const s of students) {
    studentMap.set(s.id, s);
  }

  const events = transactions.map(t => {
    const student = studentMap.get(t.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
    return { title: studentName };
  });

  const end = performance.now();
  return { time: end - start, eventCount: events.length };
}

console.log(`Running benchmark with ${NUM_STUDENTS} students and ${NUM_TRANSACTIONS} transactions...`);

// Warmup
for (let i = 0; i < 5; i++) {
  runO_NxM();
  runO_N_Plus_M();
}

let timeONxM = 0;
let timeONPlusM = 0;
const iterations = 100;

for (let i = 0; i < iterations; i++) {
  timeONxM += runO_NxM().time;
  timeONPlusM += runO_N_Plus_M().time;
}

console.log(`\nResults over ${iterations} iterations:`);
console.log(`O(N*M) - Array.find() inside map: ${(timeONxM / iterations).toFixed(4)} ms avg per run`);
console.log(`O(N+M) - Pre-built Map inside map: ${(timeONPlusM / iterations).toFixed(4)} ms avg per run`);

const improvement = ((timeONxM - timeONPlusM) / timeONxM) * 100;
console.log(`\nImprovement: ${improvement.toFixed(2)}%`);
