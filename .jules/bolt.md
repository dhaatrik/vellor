## 2024-10-25 - Performance: Avoid Array `.filter().reduce()` chaining
**Learning:** Chaining `.filter(condition).reduce(action, init)` on large arrays (like transaction lists in `createGamificationSlice.ts`) creates an unnecessary intermediate array and requires two passes over the data.
**Action:** When filtering out elements purely to calculate an aggregate sum, combine the logic into a single `.reduce()` or `for` loop pass to eliminate intermediate allocations and cut execution time roughly in half.
