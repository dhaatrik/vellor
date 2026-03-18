## 2024-05-18 - Optimized O(N*M) lookup inside useMemo filter for Transactions
**Learning:** React component lists matching a relational structure (e.g., Transactions displaying Student names) often inadvertently introduce O(N*M) operations if `array.find()` or similar lookups are placed inside array `.filter()` or `.map()`.
**Action:** When filtering or mapping large arrays based on related items, create a `Map` structure upfront (O(N+M)) before processing the iterations to minimize lookup time. Also, pre-calculate expensive sorting keys (like `Date.parse`) with the Schwartzian Transform.
