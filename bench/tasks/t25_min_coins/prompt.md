# min coins

Difficulty: medium

Write `solve(amount: int, coins: list[int]) -> int`.

Return the minimum number of coins whose positive denominations sum to amount, with unlimited reuse. Return -1 if impossible. amount is nonnegative; denominations are positive and may repeat. For amount zero, return 0 even if coins is empty.

Examples:
- `solve(6, [1, 3, 4]) == 2`
- `solve(3, [2]) == -1`
