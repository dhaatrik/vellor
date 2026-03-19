## 2024-05-18 - Replacing array.filter().length with array.some()
**Learning:** Checking if an array contains no elements matching a condition by using `array.filter(condition).length === 0` forces a complete iteration over the entire array, which is inefficient.
**Action:** Replace this pattern with `!array.some(condition)`, which stops iterating (short-circuits) immediately upon finding the first match. Additionally, hoist calculations like `Date.now()` outside of loops and evaluate inexpensive boolean checks before executing expensive operations like date string parsing.
