import { performance } from 'perf_hooks';

// Simulate 50,000 students, half without a creation date
const MOCK_STUDENTS = Array.from({ length: 50000 }).map((_, i) => ({
  id: String(i),
  createdAt: i % 2 === 0 ? new Date('2023-01-01').toISOString() : undefined
}));

function benchmark(label: string, fn: () => void) {
  const start = performance.now();
  for (let i = 0; i < 50; i++) {
    fn();
  }
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
}

function original() {
  let total = 0;
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const thresholdDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0).getTime();

    total += MOCK_STUDENTS.filter(s => {
      const sTime = s.createdAt ? new Date(s.createdAt).getTime() : Date.now();
      return sTime <= thresholdDate;
    }).length;
  }
  return total;
}

function optimized() {
  let total = 0;
  const today = new Date();
  const now = Date.now();
  for (let i = 5; i >= 0; i--) {
    const thresholdDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0).getTime();

    // As per the prompt, just update to use now instead of Date.now() for the fallback
    total += MOCK_STUDENTS.filter(s => {
      const sTime = s.createdAt ? new Date(s.createdAt).getTime() : now;
      return sTime <= thresholdDate;
    }).length;
  }
  return total;
}

benchmark('Original', original);
benchmark('Optimized', optimized);
