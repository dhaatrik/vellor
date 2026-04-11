const { performance } = require('perf_hooks');

// Mock data
const students = [];
for (let i = 0; i < 5000; i++) {
  students.push({
    id: `student_${i}`,
    firstName: `First_${i}`,
    lastName: `Last_${i}`,
    tuition: { defaultRate: 50, typicalLessonDuration: 60 }
  });
}

function benchArrayFind(draggedStudentId) {
  const start = performance.now();
  const student = students.find(s => s.id === draggedStudentId);
  const end = performance.now();
  return end - start;
}

function benchMapLookup(draggedStudentId, studentMap) {
  const start = performance.now();
  const student = studentMap[draggedStudentId];
  const end = performance.now();
  return end - start;
}

const studentMap = Object.create(null);
for (let i = 0; i < students.length; i++) {
  studentMap[students[i].id] = students[i];
}

let tFind = 0;
let tMap = 0;
const iterations = 1000;

for (let i = 0; i < iterations; i++) {
  const targetId = `student_${Math.floor(Math.random() * 5000)}`;
  tFind += benchArrayFind(targetId);
  tMap += benchMapLookup(targetId, studentMap);
}

console.log(`Array find: ${tFind.toFixed(4)} ms`);
console.log(`Map lookup: ${tMap.toFixed(4)} ms`);
