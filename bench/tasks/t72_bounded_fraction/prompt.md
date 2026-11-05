# bounded_fraction
Difficulty: hard

Implement `solve(numerator: int, denominator: int, max_denominator: int) -> list[int]`.

`denominator` and `max_denominator` are positive; `max_denominator <= 1000`. Among all rational numbers `a/b` with integer `a` and `1 <= b <= max_denominator`, choose one minimizing the exact absolute distance to `numerator/denominator`. If several representations tie in distance, choose the one with the smallest denominator, then the smallest numerator. Return `[a, b]`. No floating point or rounding approximation is allowed. Numerators and denominators can be arbitrarily large, except for the stated bound on the output denominator.

## Examples

- `solve(1, 3, 2) == [1, 2]`
- `solve(1, 2, 1) == [0, 1]`
- `solve(-1, 2, 1) == [-1, 1]`
