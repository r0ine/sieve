# rectangle sum

Difficulty: medium

Write `solve(grid: list[list[int]], queries: list[tuple[int, int, int, int]]) -> list[int]`.

The grid is rectangular, possibly empty. Each query (r1,c1,r2,c2) gives inclusive zero-based corners, with 0 <= r1 <= r2 < row count and 0 <= c1 <= c2 < column count. No queries are supplied for an empty grid or zero columns. Return each rectangle sum in query order.

Examples:
- `solve([[1, 2], [3, 4]], [(0, 0, 1, 1)]) == [10]`
- `solve([], []) == []`
