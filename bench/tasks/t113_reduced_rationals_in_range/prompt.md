# reduced rationals in range

Difficulty: hard

Write `solve(low_n: int, low_d: int, high_n: int, high_d: int, max_d: int) -> int`.

Count distinct rational numbers `p/q` in the half-open interval `[low_n/low_d, high_n/high_d)`, where `p` may be any integer, `1 <= q <= max_d`, and `gcd(abs(p), q) == 1`. Denominators `low_d` and `high_d` are positive; the lower bound is at most the upper bound. Equal numerical fractions count once through their reduced representation. The endpoints themselves may be unreduced. `max_d` may be zero, in which case return zero. Inputs have `max_d <= 30` and interval width at most 10. Compare fractions exactly, including negative values; never use floating point.

Examples:
- `solve(0, 1, 1, 1, 3) == 4`
- `solve(-1, 2, 1, 2, 2) == 2`
- `solve(1, 1, 1, 1, 10) == 0`
