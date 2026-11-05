# grid neighbors

Difficulty: medium

Write `solve(grid: list[list[int]], row: int, col: int) -> list[int]`.

The grid may be ragged. Return existing orthogonal neighbors of (row, col) in this order: up, right, down, left. The queried position itself may be outside the grid; only neighbors within existing rows are returned. Negative indexes are outside, never Python wraparound.

Examples:
- `solve([[1, 2], [3]], 0, 0) == [2, 3]`
- `solve([], 0, 0) == []`
