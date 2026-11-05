# merge records

Difficulty: medium

Write `solve(records: list[tuple[str, int]]) -> list[tuple[str, int]]`.

Combine amounts for identical case-sensitive keys. Return (key, total) pairs in order of each key's first appearance. Keep keys whose total is zero. Empty input returns [].

Examples:
- `solve([('a', 2), ('b', 1), ('a', -2)]) == [('a', 0), ('b', 1)]`
- `solve([]) == []`
