# merge closed intervals

Difficulty: hard

Write `solve(intervals: list[tuple[int, int]]) -> list[tuple[int, int]]`.

Each pair is a closed integer interval with start <= end. Merge intervals that overlap or contain consecutive integers (for example [1,2] and [3,4]). Return sorted disjoint closed intervals. Empty input returns [].

Examples:
- `solve([(1, 2), (3, 4)]) == [(1, 4)]`
- `solve([]) == []`
