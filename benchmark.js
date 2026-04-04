import { performance } from 'perf_hooks';

const students = Array.from({ length: 10000 }).map((_, i) => ({
  id: String(i),
  firstName: `First${i}`,
  lastName: `Last${i}`
}));

const query = 'First9999';

// Baseline
const startBaseline = performance.now();
const lowerQueryBaseline = query.toLowerCase();
const filteredStudentsBaseline = students.filter(s =>
  (s.firstName + ' ' + s.lastName).toLowerCase().includes(lowerQueryBaseline)
).slice(0, 5);
const endBaseline = performance.now();
const baselineTime = endBaseline - startBaseline;

// Optimized
const startOptimizedPre = performance.now();
const studentsWithSearchableName = students.map(s => ({
  ...s,
  _searchableName: (s.firstName + ' ' + s.lastName).toLowerCase()
}));
const endOptimizedPre = performance.now();
const preTime = endOptimizedPre - startOptimizedPre;

const startOptimizedFilter = performance.now();
const lowerQueryOptimized = query.toLowerCase();
const filteredStudentsOptimized = studentsWithSearchableName.filter(s =>
  s._searchableName.includes(lowerQueryOptimized)
).slice(0, 5);
const endOptimizedFilter = performance.now();
const filterTime = endOptimizedFilter - startOptimizedFilter;

// console.log(`Baseline filter time: ${baselineTime} ms`);
// console.log(`Optimized pre-compute time: ${preTime} ms`);
// console.log(`Optimized filter time: ${filterTime} ms`);
// console.log(`Improvement in filter: ${baselineTime / filterTime}x`);
