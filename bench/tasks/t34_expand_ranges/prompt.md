# expand ranges

Difficulty: medium

Write `solve(ranges: list[tuple[int, int]]) -> list[int]`.

Each (start, end) pair denotes all integers from start through end, inclusive, in ascending order. If start > end, the pair contributes nothing. Concatenate expansions in input order; do not deduplicate.

Examples:
- `solve([(1, 3), (3, 4)]) == [1, 2, 3, 3, 4]`
- `solve([(2, 1)]) == []`
