# shortest hops

Difficulty: medium

Write `solve(graph: dict[int, list[int]], start: int, goal: int) -> int`.

Return the fewest directed edges from start to goal, or -1 if unreachable. Neighbor lists may contain duplicates; mentioned nodes need not be keys. start == goal returns 0 even if absent.

Examples:
- `solve({1: [2], 2: [3]}, 1, 3) == 2`
- `solve({}, 1, 2) == -1`
