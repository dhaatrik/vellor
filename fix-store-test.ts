import fs from 'fs';
const text = fs.readFileSync('store.test.ts', 'utf8');
const fixed = text.replace(/import \{ setGlobalMasterKey, globalMasterKey \} from '\.\/store';/g, '');
fs.writeFileSync('store.test.ts', fixed);
