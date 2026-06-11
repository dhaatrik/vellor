const fs = require('fs');
let code = fs.readFileSync('store/tests/helpers.test.ts', 'utf-8');
code = code.replace(/<<<<<<< HEAD\nimport \{ describe, it, expect \} from 'vitest';\nimport \{ sanitizeString, formatCurrency, formatDate, formatPhoneNumber, getPaymentStatusColor, formatRelativeTime, generatePortalLink, generateWhatsAppLink, getLocalYYYYMMDD \} from '\.\.\/\.\.\/helpers';\n=======\nimport \{ describe, it, expect, vi \} from 'vitest';\nimport \{ generateId, sanitizeString, formatCurrency, formatDate, formatPhoneNumber, getPaymentStatusColor, formatRelativeTime, generatePortalLink, generateWhatsAppLink \} from '\.\.\/\.\.\/helpers';\n>>>>>>> [^\n]+\n/,
"import { describe, it, expect, vi } from 'vitest';\nimport { generateId, sanitizeString, formatCurrency, formatDate, formatPhoneNumber, getPaymentStatusColor, formatRelativeTime, generatePortalLink, generateWhatsAppLink, getLocalYYYYMMDD } from '../../helpers';\n");
fs.writeFileSync('store/tests/helpers.test.ts', code);
