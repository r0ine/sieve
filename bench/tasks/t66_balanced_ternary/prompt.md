# balanced_ternary
Difficulty: hard

Implement `solve(value: int) -> str`.

Write an integer in balanced ternary. The digits `T`, `0`, and `1` represent -1, 0, and +1 respectively, with positional weights `..., 27, 9, 3, 1` from left to right. Every integer has exactly one such representation without leading zeroes. Return `"0"` for zero; all other outputs must begin with `T` or `1`. There is no separate minus sign. Integers may be arbitrarily large, positive or negative.

## Examples

- `solve(2) == "1T"`
- `solve(-2) == "T1"`
- `solve(0) == "0"`
