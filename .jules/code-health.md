## 2026-06-16 - 🧹 Refactored `updateTransaction` in `store/createTransactionSlice.ts`
**Learning:** Refactoring excessively long Zustand store functions by extracting inline side-effects (like gamification logic and balance updates) into top-level helpers improves maintainability.
**Action:** Extract specific responsibilities such as data sanitization and side-effect processing into pure-like or isolated functions. When triggering side effects based on Zustand state updates, perform them after the `set` block rather than embedding `setTimeout` hacks within the update logic itself.
