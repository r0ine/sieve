# largest_remainder
Difficulty: hard

Implement `solve(total: int, weights: list[int]) -> list[int]`.

Allocate the integer magnitude `abs(total)` across recipients with nonnegative integer weights. If the weight sum is positive, recipient `i` has ideal share `abs(total) * weights[i] / sum(weights)`. Give everyone the floor of that exact rational share, then distribute remaining units one at a time to the largest fractional remainders; ties go to the lower original index. A zero weight receives zero. If `total` is negative, negate every final share. If `total == 0`, return one zero per weight; this includes empty or all-zero weights. For a nonzero total, at least one weight is guaranteed positive. Return shares in input order. Use exact unbounded integer arithmetic.

## Examples

- `solve(7, [1, 1, 1]) == [3, 2, 2]`
- `solve(-7, [1, 1, 1]) == [-3, -2, -2]`
- `solve(5, [0, 2, 1]) == [0, 3, 2]`
