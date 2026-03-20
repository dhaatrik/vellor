## 2024-05-18 - Replacing array.filter().length with array.some()
**Learning:** Checking if an array contains no elements matching a condition by using `array.filter(condition).length === 0` forces a complete iteration over the entire array, which is inefficient.
**Action:** Replace this pattern with `!array.some(condition)`, which stops iterating (short-circuits) immediately upon finding the first match. Additionally, hoist calculations like `Date.now()` outside of loops and evaluate inexpensive boolean checks before executing expensive operations like date string parsing.
## 2024-03-20 - Optimize Date parsing in gamification slice
**Learning:** When attempting to optimize Date parsing across different timezones, converting Date objects to strings for naive matching against local methods (e.g. `new Date().getMonth()`) introduces major timezone regressions.
**Action:** Always maintain exact logical alignment with the original code (e.g., using `new Date()` for correct timezones) and focus optimizations on safe short-circuiting logic that evaluates boolean conditions (like `t.status`) before executing expensive object allocations.
## 2024-10-25 - Performance: Avoid Array `.filter().reduce()` chaining
**Learning:** Chaining `.filter(condition).reduce(action, init)` on large arrays (like transaction lists in `createGamificationSlice.ts`) creates an unnecessary intermediate array and requires two passes over the data.
**Action:** When filtering out elements purely to calculate an aggregate sum, combine the logic into a single `.reduce()` or `for` loop pass to eliminate intermediate allocations and cut execution time roughly in half.
