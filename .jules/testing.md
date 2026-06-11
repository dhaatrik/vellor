## 2026-06-01 - Test Error Boundary for CSV Parser
**Learning:** Adding robust testing for edge cases handling bad data types (e.g. `null` instances inside valid arrays) helps ensure array mapping loops (`bulkMapCSVRows`) with embedded try-catches truly intercept generic TypeErrors and preserve batch progression, which wasn't fully tested by throwing a simple `Error`.
**Action:** Next time when verifying catch blocks in loops, ensure we test unhandled system-level exceptions (e.g., TypeError via null dereferencing) and not just manual `throw new Error()` statements.
## 2025-06-11 - Mocking deep state in testing
**Learning:** When mocking a zustand `useStore` that contains deeply nested properties (like `const { stats, achievements } = gamification` where `gamification` is retrieved from `useStore()`), ensure the mock `defaultState` correctly mirrors the shape, rather than accidentally placing properties at the root level.
**Action:** Before mocking the store state, check the component to see exactly how state objects are extracted and nested, ensuring your mock object matches the exact hierarchy.
