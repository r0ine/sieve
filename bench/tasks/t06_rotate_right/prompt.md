# rotate right

Difficulty: easy

Write `solve(values: list[int], k: int) -> list[int]`.

Rotate the list right by k positions. Negative k rotates left. Reduce shifts modulo the list length. For an empty list, return an empty list for every k. Do not mutate the input.

Examples:
- `solve([1, 2, 3], 1) == [3, 1, 2]`
- `solve([1, 2, 3], -1) == [2, 3, 1]`
