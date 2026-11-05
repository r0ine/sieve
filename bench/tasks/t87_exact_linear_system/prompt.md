# exact_linear_system
Difficulty: hard

Implement `solve(a: list[list[int]], b: list[int]) -> list[tuple[int, int]] | str`.

`a` is an `m x n` integer matrix (`m >= 1`, `n >= 1`, every row has length `n`) and `b` has length `m`. They describe the linear system `a · x = b` over the rational numbers. `m` may be smaller than, equal to or larger than `n`. Entries can be large integers.

- If the system has no solution, return the string `"none"`.
- If it has infinitely many solutions, return the string `"many"`.
- If it has exactly one solution, return it as a list of `n` tuples `(numerator, denominator)`, one per unknown in order, each a fully reduced fraction with `denominator > 0`. Zero is `(0, 1)`.

Use exact rational arithmetic; floating point will give wrong answers on some inputs.

## Examples

- `solve([[2, 1], [1, 3]], [3, 5]) == [(4, 5), (7, 5)]`
- `solve([[1, 1], [2, 2]], [1, 3]) == "none"`
- `solve([[1, 1], [2, 2]], [1, 2]) == "many"`
