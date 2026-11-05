# overlap pairs

Difficulty: medium

Write `solve(intervals: list[tuple[int, int]]) -> int`.

Count unordered pairs of half-open intervals [start,end) with positive-length overlap. Every interval has start <= end; zero-length intervals overlap nothing. Duplicates count as separate intervals.

Examples:
- `solve([(0, 2), (1, 3), (2, 4)]) == 2`
- `solve([(0, 1), (1, 2)]) == 0`
