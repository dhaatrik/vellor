## 2024-05-10 - Test Error Boundary for CSV Parser
**Learning:** Adding robust testing for edge cases handling bad data types (e.g. `null` instances inside valid arrays) helps ensure array mapping loops (`bulkMapCSVRows`) with embedded try-catches truly intercept generic TypeErrors and preserve batch progression, which wasn't fully tested by throwing a simple `Error`.
**Action:** Next time when verifying catch blocks in loops, ensure we test unhandled system-level exceptions (e.g., TypeError via null dereferencing) and not just manual `throw new Error()` statements.
