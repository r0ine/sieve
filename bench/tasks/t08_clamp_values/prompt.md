# clamp values

Difficulty: easy

Write `solve(values: list[int], low: int, high: int) -> list[int]`.

Clamp every value into the inclusive interval [low, high], preserving order and duplicates. low is always at most high. Return a new empty list for empty input.

Examples:
- `solve([-3, 2, 9], 0, 5) == [0, 2, 5]`
- `solve([4, 4], 4, 4) == [4, 4]`
