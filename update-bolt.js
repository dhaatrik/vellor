import fs from 'fs';

const file = '.jules/bolt.md';
let content = fs.readFileSync(file, 'utf8');

const updatedContent = content.replace(
  '## 2026-05-26 - Array.find to Dictionary Lookup O(1)',
  '## 2026-05-24 - Array.find to Dictionary Lookup O(1)'
);

fs.writeFileSync(file, updatedContent);
console.log('Updated date in .jules/bolt.md');
