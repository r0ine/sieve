# matrix diagonals

Difficulty: medium

Write `solve(matrix: list[list[int]]) -> tuple[int, int]`.

For a square matrix, return (main diagonal sum, anti-diagonal sum). The matrix may be empty, yielding (0, 0). The central element of an odd-sized matrix contributes once to each separate sum. Negative values are allowed.

Examples:
- `solve([[1, 2], [3, 4]]) == (5, 5)`
- `solve([]) == (0, 0)`
