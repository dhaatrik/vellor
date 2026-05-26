## 2024-05-24 - Array.find to Dictionary Lookup O(1)
**Learning:** Replaced `Array.prototype.find()` over an array of objects with a cached Map-based dictionary lookup (`getTransactionById`), changing worst-case time complexity from O(N) to O(1).
**Action:** When repeatedly searching for items by ID within global state stores, prioritize adding and utilizing cached Map-based lookup methods on the store instead of inline `.find()` calls to avoid O(N) linear scans.

## 2024-05-24 - Array.find to Dictionary Lookup O(1)
**Learning:** Replaced `Array.prototype.find()` over an array of objects with a cached Map-based dictionary lookup (`getTransactionById`), changing worst-case time complexity from O(N) to O(1).
**Action:** When repeatedly searching for items by ID within global state stores, prioritize adding and utilizing cached Map-based lookup methods on the store instead of inline `.find()` calls to avoid O(N) linear scans.
