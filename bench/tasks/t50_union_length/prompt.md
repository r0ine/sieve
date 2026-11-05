# union length

Difficulty: hard

Write `solve(intervals: list[tuple[int, int]]) -> int`.

Return the number of integer unit positions covered by the union of half-open intervals [start,end). Every pair has start <= end. Touching intervals have no gap; zero-length intervals contribute nothing. Coordinates may be negative or arbitrarily large.

Examples:
- `solve([(0, 3), (2, 5)]) == 5`
- `solve([]) == 0`
