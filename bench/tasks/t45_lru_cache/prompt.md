# lru cache

Difficulty: hard

Write `solve(capacity: int, operations: list[tuple]) -> list[int | None]`.

Simulate an LRU cache of integer keys and values. Operations are ('put', key, value) or ('get', key). Return results for gets only: value or None if missing. A successful get and every put of an existing key make that key most recent. A put over capacity evicts the least recent key. Capacity may be zero; operations are valid.

Examples:
- `solve(1, [('put', 1, 7), ('get', 1)]) == [7]`
- `solve(0, [('put', 1, 7), ('get', 1)]) == [None]`
