## 2026-06-01 - Test Error Boundary for CSV Parser
**Learning:** Adding robust testing for edge cases handling bad data types (e.g. `null` instances inside valid arrays) helps ensure array mapping loops (`bulkMapCSVRows`) with embedded try-catches truly intercept generic TypeErrors and preserve batch progression, which wasn't fully tested by throwing a simple `Error`.
**Action:** Next time when verifying catch blocks in loops, ensure we test unhandled system-level exceptions (e.g., TypeError via null dereferencing) and not just manual `throw new Error()` statements.
## 2026-06-11 - Missing Error Path Test in Index
**Learning:** Verified the requirement to isolate application startup scenarios like missing root element. Using `vitest`'s dynamic `import()` coupled with `document.body.innerHTML = ""` allows verifying module-level initialization logic that executes immediately on load without complex mocked bundler environments.
**Action:** When testing immediately executing module initialization (like app entrypoints), use DOM clearing and dynamic imports within isolated test blocks to assert startup behavior.
