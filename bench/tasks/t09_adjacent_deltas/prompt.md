# adjacent deltas

Difficulty: easy

Write `solve(values: list[int]) -> list[int]`.

Return consecutive differences: output[i] = values[i+1] - values[i]. Empty and one-element lists produce an empty list. Preserve duplicates and signs.

Examples:
- `solve([3, 7, 2]) == [4, -5]`
- `solve([-2, -2]) == [0]`
