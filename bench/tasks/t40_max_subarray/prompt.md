# max subarray

Difficulty: medium

Write `solve(values: list[int]) -> tuple[int, int, int]`.

Return (maximum sum, start index, end index) for a nonempty contiguous subarray, with inclusive indexes. Among equal maximum sums, choose the smallest start index, then smallest end index. Empty input returns (0,-1,-1).

Examples:
- `solve([-2, 3, -1, 3]) == (5, 1, 3)`
- `solve([]) == (0, -1, -1)`
